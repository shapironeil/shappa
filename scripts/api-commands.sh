#!/usr/bin/env bash
# Script di test rapido per Shappa (Unix-like)
# Per Windows PowerShell, vedi i comandi commentati sotto.

# Health check
curl -v http://localhost:3000/health

# Get eBay auth URL (returns JSON with authUrl)
curl -v http://localhost:3000/api/ebay/auth-url

# Test Amazon search (demo)
curl -v "http://localhost:3000/api/amazon/search?q=echo"

# Get product details (demo)
curl -v http://localhost:3000/api/amazon/product/B001

# Test eBay user-info (mock - requires access_token)
# curl -v -X POST http://localhost:3000/api/ebay/user-info -H 'Content-Type: application/json' -d '{"access_token":"<TOKEN>"}'

# Windows PowerShell equivalents (run in PowerShell):
# Invoke-WebRequest -Uri http://localhost:3000/health | Select-Object -ExpandProperty Content
# (Invoke-WebRequest -Uri http://localhost:3000/api/ebay/auth-url).Content | ConvertFrom-Json
# Invoke-WebRequest -Uri "http://localhost:3000/api/amazon/search?q=echo" | Select-Object -ExpandProperty Content
