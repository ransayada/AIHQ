# ── Stage 1: Prune the monorepo to only what @aihq/api needs ─────────────────
FROM node:22-alpine AS pruner
RUN corepack enable pnpm
WORKDIR /app
COPY . .
RUN pnpm dlx turbo prune @aihq/api --docker

# ── Stage 2: Install dependencies with the pruned lockfile ────────────────────
FROM node:22-alpine AS installer
RUN corepack enable pnpm
WORKDIR /app

# Copy pruned package manifests (no source) and install deps
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# ── Stage 3: Build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
RUN corepack enable pnpm
WORKDIR /app

COPY --from=installer /app/node_modules ./node_modules
COPY --from=pruner /app/out/full/ .
# Re-install so workspace symlinks resolve correctly after full-copy
RUN pnpm install --frozen-lockfile

RUN pnpm turbo build --filter=@aihq/api

# ── Stage 4: Lean production image ───────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Only copy the compiled output + production node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/apps/api/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "dist/index.js"]
