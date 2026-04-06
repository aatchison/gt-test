#!/bin/bash
# Wait for the Docker daemon to be available
set -e

echo "Waiting for Docker daemon to be ready..."
until docker info >/dev/null 2>&1; do
  echo "Docker daemon is not ready yet... sleeping 2s"
  sleep 2
done
echo "Docker daemon is ready!"
