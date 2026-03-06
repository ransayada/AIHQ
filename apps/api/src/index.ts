// Sentry must be imported before everything else
import "./instrument";
// env validation must run before any service code
import "./env";

import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { attachCollabServer } from "./collab/CollabServer";
import { log } from "./lib/logger";
import { env } from "./env";

const app  = createApp();
const server = serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  log.info(`AIHQ API listening on http://localhost:${info.port}`);
  log.info(`Collab WebSocket on ws://localhost:${info.port}/collab`);
});

// Attach Yjs collaborative editing WebSocket server
attachCollabServer(server as Parameters<typeof attachCollabServer>[0]);
