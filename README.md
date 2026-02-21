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

# Start the dev environment — installs deps and Playwright automatically
make devpod-up

# SSH into the container
make devpod-ssh
```

All subsequent commands are run **inside the container**.

### 2. Without DevPod

```bash
make install
```

### Environment setup

```bash
cp .env.example .env
```

Edit `.env` and set `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

---

## Makefile

Run `make` (no arguments) to list all available targets:

```
  install                Install npm dependencies
  dev                    Start the development server (http://localhost:3000)
  build                  Build for production
  start                  Start the production server (requires build first)
  lint                   Run ESLint
  test                   Run Vitest API integration tests
  test-watch             Run Vitest in watch mode
  test-e2e               Run Playwright E2E tests (headless)
  test-e2e-ui            Open Playwright interactive UI
  test-e2e-headed        Run Playwright E2E tests with visible browser
  test-all               Run all tests (Vitest + Playwright)
  db-generate            Generate Drizzle migration files from schema changes
  db-migrate             Apply pending Drizzle migrations
  db-studio              Open Drizzle Studio (visual database browser)
  devpod-up              Start (or resume) the DevPod container
  devpod-rebuild         Rebuild the DevPod container from scratch
  devpod-ssh             SSH into the running DevPod container
  clean                  Remove build artifacts and caches
```

### Common workflows

**Start developing:**
```bash
make devpod-up    # start container (host)
make devpod-ssh   # enter container (host)
make dev          # start dev server (inside container)
```

**Run tests:**
```bash
make test         # Vitest API tests
make test-e2e     # Playwright E2E tests
make test-all     # both
```

**After changing the DB schema:**
```bash
make db-generate  # generate migration
make db-migrate   # apply it
```

**Before shipping:**
```bash
make lint
make test-all
make build
```

**Rebuild the container** (e.g. after changing `devcontainer.json`):
```bash
make devpod-rebuild
```

---

## Database

SQLite (`local.db`) via Drizzle ORM. Created automatically on first run. Schema is in `lib/db/schema.ts`.

---

## Project Structure

```
app/
  (auth)/
    login/               # Login page
    register/            # Register page
  api/
    auth/[...nextauth]/  # NextAuth handler
    register/            # POST /api/register
  layout.tsx
  page.tsx               # Home (auth-aware)
  globals.css
lib/
  auth.ts                # NextAuth config (JWT + credentials)
  db/
    index.ts             # Drizzle + SQLite connection
    schema.ts            # users, sessions, accounts, verificationTokens
components/
  ui/                    # Shared UI components
tests/
  api/                   # Vitest API route tests
  e2e/                   # Playwright browser tests
  helpers/               # Shared test utilities
  setup.ts               # Vitest global setup
drizzle/                 # Generated migration files
```
