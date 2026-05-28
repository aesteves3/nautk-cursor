#!/usr/bin/env bash
# Render start script — installs production deps then starts the API + static site
set -euo pipefail
cd "$(dirname "$0")"
npm install --omit=dev
exec node server/index.js
