#!/usr/bin/env bash
cd "$(dirname "$0")"

PORT="${PORT:-3333}"
echo "Starting Walkaroo site locally on port $PORT..."
node server.js
