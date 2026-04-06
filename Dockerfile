# ── Stage 1: Builder ───────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS builder

# Native build deps for better-sqlite3 (only needed in the build stage)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
# Install all deps (devDeps needed for Next.js build + native module compilation)
RUN npm ci

COPY . .

# Build Next.js. Use :memory: so each parallel Next.js worker gets its own
# isolated in-memory SQLite instance — avoids SQLITE_BUSY contention between workers.
RUN DATABASE_URL=':memory:' AUTH_SECRET=build-placeholder npm run build

# Remove devDependencies — production node_modules only in the runtime stage
RUN npm prune --production

# ── Stage 2: Runner ─────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS runner

WORKDIR /app

# Pre-create the SQLite data directory so the app starts even without a volume mount
RUN mkdir -p /data

# Copy only runtime artifacts from the builder
COPY --from=builder /app/.next           ./.next
COPY --from=builder /app/node_modules    ./node_modules
COPY --from=builder /app/package*.json   ./
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/scripts         ./scripts
COPY --from=builder /app/docker-entrypoint.mjs ./

EXPOSE 3000
ENV NODE_ENV=production
ENV DATABASE_URL=/data/app.db

# Use the entrypoint script so Node (not sh) is PID 1 and handles signals correctly
CMD ["node", "docker-entrypoint.mjs"]
