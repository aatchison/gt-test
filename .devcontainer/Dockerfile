FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

# Install Playwright system dependencies
RUN npm install -g playwright && npx playwright install-deps

# Install kind
RUN KIND_VERSION=v0.27.0 && \
    curl -L "https://kind.sigs.k8s.io/dl/${KIND_VERSION}/kind-linux-amd64" -o /usr/local/bin/kind && \
    chmod +x /usr/local/bin/kind
