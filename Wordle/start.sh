#!/usr/bin/env bash

set -euo pipefail

project_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$project_dir"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Install Node.js 22 or newer, then run ./start.sh again."
  exit 1
fi

node_major="$(node -p 'process.versions.node.split(".")[0]')"
if [[ "$node_major" -lt 22 ]]; then
  echo "Node.js 22 or newer is required. Current major version: $node_major."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required. Install npm, then run ./start.sh again."
  exit 1
fi

if [[ ! -d node_modules ]]; then
  echo "Installing Cyber Wordle dependencies..."
  npm install
fi

listen_host="${HOST:-0.0.0.0}"
listen_port="${PORT:-4173}"
lan_ip="$(hostname -I 2>/dev/null | awk '{print $1}' || true)"

echo
echo "Cyber Wordle is starting."
echo "This machine: http://127.0.0.1:${listen_port}"
if [[ -n "$lan_ip" ]]; then
  echo "Other devices: http://${lan_ip}:${listen_port}"
fi
echo "Press Ctrl+C to stop the server."
echo

exec npm run dev -- --host "$listen_host" --port "$listen_port"
