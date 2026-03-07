/**
 * Real-time collaboration server using Yjs CRDT + WebSockets.
 *
 * Protocol (binary messages):
 *   [0x01, ...update] → Yjs state update broadcast
 *   [0x02]            → Request full sync (server responds with [0x01, ...fullUpdate])
 *   [0x03, ...json]   → Presence update (cursor, user info)
 */
import * as Y from "yjs";
import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage, Server } from "http";
import { log } from "../lib/logger";

interface ConnectedClient {
  ws:        WebSocket;
  projectId: string;
  userId:    string;
  userName:  string;
  color:     string;
}

const COLORS = ["#7c3aed", "#06b6d4", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

// One Y.Doc per project
const docs    = new Map<string, Y.Doc>();
// All connected clients
const clients = new Set<ConnectedClient>();

function getDoc(projectId: string): Y.Doc {
  if (!docs.has(projectId)) {
    docs.set(projectId, new Y.Doc());
  }
  return docs.get(projectId)!;
}

function getProjectClients(projectId: string): ConnectedClient[] {
  return Array.from(clients).filter((c) => c.projectId === projectId);
}

function broadcastUpdate(projectId: string, update: Uint8Array, exclude?: WebSocket) {
  const msg = Buffer.concat([Buffer.from([0x01]), Buffer.from(update)]);
  for (const client of getProjectClients(projectId)) {
    if (client.ws !== exclude && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(msg);
    }
  }
}

function broadcastPresence(projectId: string, exclude?: WebSocket) {
  const presence = getProjectClients(projectId).map((c) => ({
    userId:   c.userId,
    userName: c.userName,
    color:    c.color,
  }));
  const data = Buffer.concat([
    Buffer.from([0x03]),
    Buffer.from(JSON.stringify(presence)),
  ]);
  for (const client of getProjectClients(projectId)) {
    if (client.ws !== exclude && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(data);
    }
  }
}

function colorForUser(userId: string): string {
  const idx = userId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COLORS[idx % COLORS.length] ?? COLORS[0]!;
}

export function attachCollabServer(httpServer: Server): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer, path: "/collab" });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const url       = new URL(req.url ?? "/", "ws://localhost");
    const projectId = url.searchParams.get("projectId") ?? "unknown";
    const userId    = url.searchParams.get("userId")    ?? `anon-${Math.random().toString(36).slice(2, 7)}`;
    const userName  = decodeURIComponent(url.searchParams.get("userName") ?? "Anonymous");
    const color     = colorForUser(userId);

    const client: ConnectedClient = { ws, projectId, userId, userName, color };
    clients.add(client);

    log.info("collab: client connected", { projectId, userId, userName });

    // Send current doc state to new client
    const doc    = getDoc(projectId);
    const update = Y.encodeStateAsUpdate(doc);
    const syncMsg = Buffer.concat([Buffer.from([0x01]), Buffer.from(update)]);
    ws.send(syncMsg);

    // Broadcast new presence to others
    broadcastPresence(projectId, ws);

    ws.on("message", (rawData: Buffer) => {
      if (!Buffer.isBuffer(rawData) || rawData.length < 1) return;
      const type = rawData[0];

      if (type === 0x01) {
        // Yjs update — apply to doc, broadcast to others
        const update = rawData.slice(1);
        try {
          Y.applyUpdate(doc, update);
          broadcastUpdate(projectId, update, ws);
        } catch (err) {
          log.warn("collab: invalid update", { userId, projectId, error: String(err) });
        }
      } else if (type === 0x02) {
        // Full sync request
        const fullUpdate = Y.encodeStateAsUpdate(doc);
        const reply = Buffer.concat([Buffer.from([0x01]), Buffer.from(fullUpdate)]);
        ws.send(reply);
      } else if (type === 0x03) {
        // Presence update — just rebroadcast
        broadcastPresence(projectId, ws);
      }
    });

    ws.on("close", () => {
      clients.delete(client);
      log.info("collab: client disconnected", { projectId, userId });
      broadcastPresence(projectId);
    });

    ws.on("error", (err) => {
      log.warn("collab: ws error", { userId, error: err.message });
      clients.delete(client);
    });
  });

  log.info("CollabServer: WebSocket server attached at /collab");
  return wss;
}
