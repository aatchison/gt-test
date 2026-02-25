.PHONY: help setup env install playwright-install \
        dev build start lint typecheck audit \
        test test-watch \
        test-e2e test-e2e-ui test-e2e-headed test-all \
        db-generate db-migrate db-studio \
        devpod-up devpod-ssh devpod-rebuild \
        kind-create kind-delete kind-status kind-reset \
        kind-build kind-load kind-apply kind-rollout kind-deploy \
        kind-seed kind-test kind-test-e2e kind-test-all \
        kind-logs kind-teardown \
        clean

# Default target
.DEFAULT_GOAL := help

KIND_APP_IMAGE := gttest-app:local
KIND_NS        := gttest

help: ## Show available targets
	@grep -E '^[a-zA-Z0-9_-]+:.*## ' $(MAKEFILE_LIST) \
		| sed 's/:.*## /\t/' \
		| awk -F'\t' '{printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}'

# ── Setup ─────────────────────────────────────────────────────────────────────

setup: env install playwright-install ## Full first-time setup (env + deps + browsers)

env: ## Copy .env.example → .env and generate AUTH_SECRET (skips if .env exists)
	@if [ -f .env ]; then \
		echo ".env already exists, skipping."; \
	else \
		cp .env.example .env; \
		SECRET=$$(openssl rand -base64 32); \
		sed -i "s|your-secret-here|$$SECRET|" .env; \
		echo "Created .env with a generated AUTH_SECRET."; \
	fi

playwright-install: ## Install Playwright browsers and system dependencies
	npx playwright install chromium --with-deps

# ── Dependencies ─────────────────────────────────────────────────────────────

install: ## Install npm dependencies
	npm install

# ── Development ──────────────────────────────────────────────────────────────

dev: ## Start the development server (http://localhost:3000)
	npm run dev

build: ## Build for production
	npm run build

start: ## Start the production server (requires build first)
	npm run start

lint: ## Run ESLint
	npm run lint

typecheck: ## Run TypeScript type-check (no emit)
	npx tsc --noEmit

audit: ## Run npm security audit on production deps (fails on critical)
	npm audit --audit-level=critical --omit=dev

# ── Testing ───────────────────────────────────────────────────────────────────

test: ## Run Vitest API integration tests
	npm test

test-watch: ## Run Vitest in watch mode
	npm run test:watch

test-e2e: ## Run Playwright E2E tests (headless)
	npm run test:e2e

test-e2e-ui: ## Open Playwright interactive UI
	npm run test:e2e:ui

test-e2e-headed: ## Run Playwright E2E tests with visible browser
	npm run test:e2e:headed

test-all: test test-e2e ## Run all tests (Vitest + Playwright)

# ── Database ──────────────────────────────────────────────────────────────────

db-generate: ## Generate Drizzle migration files from schema changes
	npm run db:generate

db-migrate: ## Apply pending Drizzle migrations
	npm run db:migrate

db-studio: ## Open Drizzle Studio (visual database browser)
	npm run db:studio

# ── DevPod ────────────────────────────────────────────────────────────────────

devpod-up: ## Start (or resume) the DevPod container
	devpod-cli up . --provider docker --ide none

devpod-rebuild: ## Rebuild the DevPod container from scratch
	devpod-cli up . --provider docker --ide none --recreate

devpod-ssh: ## SSH into the running DevPod container
	ssh rig.devpod

# ── Kubernetes (kind) — cluster lifecycle ─────────────────────────────────────

kind-create: ## Create local kind cluster
	kind create cluster --config kind-config.yaml

kind-delete: ## Delete local kind cluster
	kind delete cluster --name gttest

kind-status: ## Show cluster info
	kubectl cluster-info --context kind-gttest

kind-reset: kind-delete kind-create ## Delete and recreate cluster

# ── Kubernetes (kind) — app deployment ────────────────────────────────────────

kind-build: ## Build the app Docker image
	docker build -t $(KIND_APP_IMAGE) .

kind-load: ## Load the app image into the kind cluster
	kind load docker-image $(KIND_APP_IMAGE) --name gttest

kind-apply: ## Apply Kubernetes manifests (namespace + deployment + service)
	kubectl apply -f k8s/

kind-rollout: ## Wait for the app deployment to become ready
	kubectl rollout status deployment/gttest-app -n $(KIND_NS) --timeout=120s

kind-deploy: kind-build kind-load kind-apply kind-rollout ## Full deploy: build → load → apply → wait

kind-logs: ## Tail app logs from the running pod
	kubectl logs -n $(KIND_NS) deployment/gttest-app -f

kind-teardown: ## Remove all deployed Kubernetes resources
	kubectl delete -f k8s/ --ignore-not-found

# ── Kubernetes (kind) — testing ───────────────────────────────────────────────

kind-seed: ## Seed E2E test user into the running kind deployment
	kubectl exec -n $(KIND_NS) deployment/gttest-app -- node /app/scripts/kind-seed.mjs

kind-test: ## Run Vitest API integration tests (in-process, against local code)
	npm test

kind-test-e2e: kind-seed ## Run Playwright E2E tests against the kind deployment (localhost:30000)
	npx playwright test --config playwright.kind.config.ts

kind-test-all: kind-test kind-test-e2e ## Run full test suite against the kind deployment

# ── Housekeeping ──────────────────────────────────────────────────────────────

clean: ## Remove build artifacts and caches
	rm -rf .next out playwright-report test-results node_modules/.cache
