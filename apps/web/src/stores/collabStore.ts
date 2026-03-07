"use client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import * as Y from "yjs";

export interface CollabUser {
  userId:   string;
  userName: string;
  color:    string;
}

type ConnStatus = "disconnected" | "connecting" | "connected" | "error";

interface CollabState {
  status:    ConnStatus;
  users:     CollabUser[];
  doc:       Y.Doc | null;
  projectId: string | null;

  connect:    (projectId: string, userId: string, userName: string) => void;
  disconnect: () => void;
}

let ws: WebSocket | null = null;

export const useCollabStore = create<CollabState>()(
  devtools(
    (set, get) => ({
      status:    "disconnected",
      users:     [],
      doc:       null,
      projectId: null,

      connect(projectId, userId, userName) {
        if (get().status === "connected" && get().projectId === projectId) return;
        get().disconnect();

        const doc = new Y.Doc();
        set({ doc, projectId, status: "connecting", users: [] });

        const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001"}/collab`
          + `?projectId=${encodeURIComponent(projectId)}`
          + `&userId=${encodeURIComponent(userId)}`
          + `&userName=${encodeURIComponent(userName)}`;

        const socket = new WebSocket(wsUrl);
        ws = socket;

        socket.binaryType = "arraybuffer";

        socket.onopen = () => {
          set({ status: "connected" });
          // Request full sync
          socket.send(new Uint8Array([0x02]));
        };

        socket.onmessage = (evt) => {
          const data = new Uint8Array(evt.data as ArrayBuffer);
          if (data.length < 1) return;
          const type = data[0];

          if (type === 0x01) {
            // Yjs update
            const update = data.slice(1);
            try { Y.applyUpdate(doc, update); } catch { /* ignore bad updates */ }
          } else if (type === 0x03) {
            // Presence
            try {
              const json = new TextDecoder().decode(data.slice(1));
              set({ users: JSON.parse(json) as CollabUser[] });
            } catch { /* ignore */ }
          }
        };

        socket.onclose  = () => { ws = null; set({ status: "disconnected", users: [] }); };
        socket.onerror  = () => { set({ status: "error" }); };

        // Observe local doc changes and send to server
        doc.on("update", (update: Uint8Array) => {
          if (socket.readyState === WebSocket.OPEN) {
            const msg = new Uint8Array(update.length + 1);
            msg[0] = 0x01;
            msg.set(update, 1);
            socket.send(msg);
          }
        });
      },

      disconnect() {
        if (ws) { ws.close(); ws = null; }
        const { doc } = get();
        if (doc) doc.destroy();
        set({ status: "disconnected", users: [], doc: null, projectId: null });
      },
    }),
    { name: "CollabStore" }
  )
);
