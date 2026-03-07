import { Hono } from "hono";
import { swaggerUI } from "@hono/swagger-ui";

export const docsRouter = new Hono();

// OpenAPI 3.0 spec for all AIHQ API endpoints
const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "AIHQ API",
    version: "1.0.0",
    description:
      "REST API for AIHQ – the AI-powered browser-based DAW. All protected routes require a Bearer token (in local dev a mock passthrough is used).",
    contact: { name: "AIHQ Support" },
  },
  servers: [{ url: "http://localhost:3001", description: "Local development" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code:    { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
      Project: {
        type: "object",
        properties: {
          id:          { type: "string" },
          name:        { type: "string" },
          bpm:         { type: "number" },
          key:         { type: "string" },
          scale:       { type: "string" },
          createdAt:   { type: "string", format: "date-time" },
          updatedAt:   { type: "string", format: "date-time" },
          lastOpenedAt:{ type: "string", format: "date-time" },
        },
      },
      Snapshot: {
        type: "object",
        properties: {
          id:        { type: "string" },
          name:      { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          stateJson: { type: "object" },
        },
      },
      Sample: {
        type: "object",
        properties: {
          id:       { type: "string" },
          name:     { type: "string" },
          fileSize: { type: "number" },
          mimeType: { type: "string" },
          duration: { type: "number", nullable: true },
        },
      },
      ChatMessage: {
        type: "object",
        required: ["role", "content"],
        properties: {
          role:    { type: "string", enum: ["user", "assistant"] },
          content: { type: "string", maxLength: 4000 },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        security: [],
        responses: {
          "200": {
            description: "API is running",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status:    { type: "string", example: "ok" },
                    timestamp: { type: "string", format: "date-time" },
                    version:   { type: "string", example: "1.0.0" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/projects": {
      get: {
        tags: ["Projects"],
        summary: "List all projects for the authenticated user",
        responses: {
          "200": {
            description: "List of projects",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        projects: { type: "array", items: { $ref: "#/components/schemas/Project" } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Projects"],
        summary: "Create a new project",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name:       { type: "string", maxLength: 100 },
                  templateId: { type: "string", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Project created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { type: "object", properties: { project: { $ref: "#/components/schemas/Project" } } } },
                },
              },
            },
          },
        },
      },
    },
    "/api/projects/{id}": {
      get: {
        tags: ["Projects"],
        summary: "Get a single project by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Project data" },
          "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      patch: {
        tags: ["Projects"],
        summary: "Rename a project",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", required: ["name"], properties: { name: { type: "string" } } },
            },
          },
        },
        responses: { "200": { description: "Updated" } },
      },
      delete: {
        tags: ["Projects"],
        summary: "Delete a project",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "204": { description: "Deleted" }, "404": { description: "Not found" } },
      },
    },
    "/api/projects/{id}/save": {
      put: {
        tags: ["Projects"],
        summary: "Save project state (tracks, BPM, etc.)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "object" },
                  name: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Saved" } },
      },
    },
    "/api/projects/{id}/snapshots": {
      get: {
        tags: ["Version History"],
        summary: "List all snapshots for a project",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "Snapshots",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { type: "object", properties: { snapshots: { type: "array", items: { $ref: "#/components/schemas/Snapshot" } } } } },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Version History"],
        summary: "Create a new snapshot",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "stateJson"],
                properties: {
                  name:      { type: "string" },
                  stateJson: { type: "object" },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Snapshot created" } },
      },
    },
    "/api/projects/{id}/snapshots/{snapshotId}": {
      get: {
        tags: ["Version History"],
        summary: "Restore a snapshot (get its state)",
        parameters: [
          { name: "id",         in: "path", required: true, schema: { type: "string" } },
          { name: "snapshotId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Snapshot state" } },
      },
      delete: {
        tags: ["Version History"],
        summary: "Delete a snapshot",
        parameters: [
          { name: "id",         in: "path", required: true, schema: { type: "string" } },
          { name: "snapshotId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { "204": { description: "Deleted" } },
      },
    },
    "/api/projects/{id}/share": {
      post: {
        tags: ["Sharing"],
        summary: "Create or refresh a public share link",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["stateJson"],
                properties: {
                  name:      { type: "string" },
                  stateJson: { type: "object" },
                  bpm:       { type: "number" },
                  key:       { type: "string" },
                  scale:     { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Share link created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        token: { type: "string" },
                        url:   { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      get: {
        tags: ["Sharing"],
        summary: "Get current share info for a project",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Share info or null" } },
      },
      delete: {
        tags: ["Sharing"],
        summary: "Revoke share link",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "204": { description: "Revoked" } },
      },
    },
    "/api/share/{token}": {
      get: {
        tags: ["Sharing"],
        summary: "Get public share data by token (no auth required)",
        security: [],
        parameters: [{ name: "token", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Share data" },
          "404": { description: "Token not found or expired" },
        },
      },
    },
    "/api/samples": {
      get: {
        tags: ["Samples"],
        summary: "List uploaded samples",
        responses: { "200": { description: "Sample list" } },
      },
    },
    "/api/samples/upload": {
      post: {
        tags: ["Samples"],
        summary: "Upload an audio sample (multipart/form-data)",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Sample uploaded", content: { "application/json": { schema: { type: "object" } } } },
        },
      },
    },
    "/api/samples/{id}/stream": {
      get: {
        tags: ["Samples"],
        summary: "Stream / download a sample file",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Audio file bytes", content: { "audio/*": { schema: { type: "string", format: "binary" } } } },
          "404": { description: "Not found" },
        },
      },
    },
    "/api/samples/{id}": {
      delete: {
        tags: ["Samples"],
        summary: "Delete a sample",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "204": { description: "Deleted" } },
      },
    },
    "/api/ai/chat": {
      post: {
        tags: ["AI"],
        summary: "Stream a Claude AI response (music production assistant)",
        description:
          "Returns a **streaming text** response (not JSON). Read with `response.body.getReader()`. Requires Pro or Studio plan.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["messages"],
                properties: {
                  messages: { type: "array", items: { $ref: "#/components/schemas/ChatMessage" }, minItems: 1, maxItems: 20 },
                  projectContext: {
                    type: "object",
                    properties: {
                      bpm:        { type: "number" },
                      key:        { type: "string" },
                      scale:      { type: "string" },
                      trackCount: { type: "number" },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Streamed text tokens" },
          "403": { description: "Plan required", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "429": { description: "AI generation limit reached" },
          "500": { description: "Missing API key or generation error" },
        },
      },
    },
    "/api/ai/log": {
      post: {
        tags: ["AI"],
        summary: "Log a Magenta.js client-side AI generation",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { type: { type: "string", enum: ["drum_pattern", "melody"] } },
              },
            },
          },
        },
        responses: { "200": { description: "Logged" }, "403": { description: "Plan required" } },
      },
    },
    "/api/ai/usage": {
      get: {
        tags: ["AI"],
        summary: "Get current AI generation usage stats",
        responses: {
          "200": {
            description: "Usage stats",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        used:    { type: "number" },
                        limit:   { type: "number", description: "-1 means unlimited" },
                        resetAt: { type: "string", format: "date-time", nullable: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/users/me": {
      get: {
        tags: ["Users"],
        summary: "Get the current user's profile",
        responses: { "200": { description: "User profile" } },
      },
    },
    "/api/billing/checkout": {
      post: {
        tags: ["Billing"],
        summary: "Create a Stripe Checkout session",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { priceId: { type: "string" } },
              },
            },
          },
        },
        responses: { "200": { description: "Checkout session URL" } },
      },
    },
    "/api/billing/portal": {
      post: {
        tags: ["Billing"],
        summary: "Create a Stripe billing portal session",
        responses: { "200": { description: "Portal URL" } },
      },
    },
    "/logs": {
      post: {
        tags: ["System"],
        summary: "Ingest frontend log entries (no auth required)",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  entries: {
                    type: "array",
                    maxItems: 100,
                    items: {
                      type: "object",
                      properties: {
                        level:   { type: "string", enum: ["debug", "info", "warn", "error"] },
                        message: { type: "string" },
                        ts:      { type: "number" },
                        ctx:     { type: "object" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Accepted" } },
      },
    },
  },
};

// Serve the spec as JSON
docsRouter.get("/openapi.json", (c) => c.json(openApiSpec));

// Serve Swagger UI
docsRouter.get(
  "/",
  swaggerUI({ url: "/docs/openapi.json" })
);
