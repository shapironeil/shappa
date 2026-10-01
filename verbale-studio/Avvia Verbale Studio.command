#!/bin/bash
cd "$(dirname "$0")"
command -v node >/dev/null || { echo "Node.js non trovato. Installalo da https://nodejs.org"; read; exit 1; }
[ -d node_modules ] || npm install --omit=dev
node server.js --open
