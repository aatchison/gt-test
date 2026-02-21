# My App

A full-stack Next.js 14 web application with authentication and SQLite.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · NextAuth.js v5 · Drizzle ORM · SQLite (better-sqlite3)

---

## Prerequisites

- [DevPod](https://devpod.sh/) + Docker (recommended)
- Or Node.js 22 LTS + npm

---

## Getting Started

### 1. Using DevPod (recommended)

```bash
# Add the Docker provider (first time only)
devpod-cli provider add docker

# Start the dev environment
devpod-cli up . --provider docker --ide none

# SSH into the container
ssh rig.devpod
```

Once inside the container, the `postCreateCommand` (`npm install`) runs automatically.

### 2. Without DevPod

```bash
npm install
```

---

## Environment Setup

```bash
cp .env.example .env
```

Edit `.env` and set `AUTH_SECRET` to a random secret:

```bash
openssl rand -base64 32
```

---

## Development

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

---

## Building

```bash
npm run build
npm run start
```

---

## Linting

```bash
npm run lint
```

---

## Database

Uses SQLite (`local.db`) via Drizzle ORM. The database file is created automatically on first run.

```bash
# Generate migration files from schema changes
npm run db:generate

# Apply migrations
npm run db:migrate

# Open Drizzle Studio (visual DB browser)
npm run db:studio
```

Schema is defined in `lib/db/schema.ts`.

---

## Testing

### API Integration Tests (Vitest)

Tests hit the Next.js route handlers directly against an isolated SQLite database (`test.db`). Tables are cleared between each test.

```bash
# Run once
npm test

# Watch mode
npm run test:watch
```

Tests live in `tests/api/`.

### End-to-End Tests (Playwright)

Spins up Next.js on port 3001 with a seeded test database (`e2e.db`) and drives a real Chromium browser.

```bash
# Run headless
npm run test:e2e

# Run with visible browser
npm run test:e2e:headed

# Open Playwright UI (interactive test runner)
npm run test:e2e:ui
```

Tests live in `tests/e2e/`. A pre-seeded user (`e2e@example.com` / `e2epassword1`) is available for login tests.

> **Note:** Playwright tests require Chromium. Install it once inside the devcontainer:
> ```bash
> npx playwright install chromium --with-deps
> ```

---

## Project Structure

```
app/
  (auth)/
    login/          # Login page
    register/       # Register page
  api/
    auth/[...nextauth]/  # NextAuth handler
    register/            # POST /api/register
  layout.tsx
  page.tsx          # Home (auth-aware)
  globals.css
lib/
  auth.ts           # NextAuth config (JWT + credentials)
  db/
    index.ts        # Drizzle + SQLite connection
    schema.ts       # users, sessions, accounts, verificationTokens
components/
  ui/               # Shared UI components
tests/
  api/              # Vitest API route tests
  e2e/              # Playwright browser tests
  helpers/          # Shared test utilities (schema, migrate)
  setup.ts          # Vitest global setup
drizzle/            # Generated migration files
```
