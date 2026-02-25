FROM node:22-bookworm-slim

# Native build deps for better-sqlite3
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build Next.js (DATABASE_URL points at a throwaway file so better-sqlite3
# doesn't fail to open a path during static analysis)
RUN DATABASE_URL=/tmp/build.db AUTH_SECRET=build-placeholder npm run build

EXPOSE 3000
ENV NODE_ENV=production
ENV DATABASE_URL=/data/app.db

CMD ["sh", "-c", "node scripts/migrate.mjs && node_modules/.bin/next start"]
