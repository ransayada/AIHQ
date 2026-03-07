#!/usr/bin/env bash
# dev-elk.sh — Start the full AIHQ dev environment with ELK logging
# Opens separate terminal tabs/windows for: ELK stack, API server, Web server
#
# Requires: docker, pnpm, and one of: gnome-terminal, konsole, xterm, or macOS Terminal
#
# Usage: bash scripts/dev-elk.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ELK_FILE="$ROOT/docker-compose.elk.yml"

echo ""
echo "=== AIHQ Dev + ELK Stack ==="
echo "Root: $ROOT"
echo ""

# Detect terminal emulator
open_tab() {
  local title="$1"
  local cmd="$2"

  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS — open new Terminal window
    osascript -e "tell application \"Terminal\" to do script \"echo '=== $title ==='; $cmd\""
  elif command -v gnome-terminal &>/dev/null; then
    gnome-terminal --title="$title" -- bash -c "$cmd; exec bash"
  elif command -v konsole &>/dev/null; then
    konsole --new-tab -p tabtitle="$title" -e bash -c "$cmd; exec bash" &
  elif command -v xterm &>/dev/null; then
    xterm -title "$title" -e bash -c "$cmd; exec bash" &
  else
    echo "[WARN] No supported terminal emulator found. Running $title in background."
    bash -c "$cmd" &
  fi
}

# 1. ELK
echo "[1/4] Starting Elasticsearch + Kibana..."
open_tab "AIHQ — ELK Stack" "cd '$ROOT' && docker compose -f '$ELK_FILE' up"

sleep 3

# 2. API
echo "[2/4] Starting API server (port 3001)..."
open_tab "AIHQ — API" "cd '$ROOT' && ES_URL=http://localhost:9200 pnpm --filter @aihq/api dev"

# 3. Web
echo "[3/4] Starting Web server (port 3000)..."
open_tab "AIHQ — Web" "cd '$ROOT' && pnpm --filter @aihq/web dev"

# 4. Log tail
echo "[4/4] Opening log tail..."
open_tab "AIHQ — Log Stream" "
  echo 'Waiting for Elasticsearch...'
  until curl -sf http://localhost:9200/_cluster/health > /dev/null 2>&1; do sleep 2; done
  echo '=== AIHQ Log Stream (Elasticsearch) ==='
  echo 'Index: aihq-api-*  |  Kibana: http://localhost:5601'
  echo 'Press Ctrl+C to stop.'
  while true; do
    clear
    echo '=== AIHQ Logs (last 10) ==='
    curl -sf 'http://localhost:9200/aihq-api-*/_search' \
      -H 'Content-Type: application/json' \
      -d '{\"query\":{\"match_all\":{}},\"sort\":[{\"@timestamp\":{\"order\":\"desc\"}}],\"size\":10}' \
      2>/dev/null | python3 -c \"
import sys, json
data = json.load(sys.stdin)
hits = sorted(data.get('hits',{}).get('hits',[]), key=lambda x: x['_source'].get('@timestamp',''))
for h in hits:
    s = h['_source']
    ts  = s.get('@timestamp', s.get('timestamp',''))[:19]
    lvl = s.get('level','info').upper().ljust(5)
    msg = s.get('message', s.get('msg',''))
    print(f'{ts} [{lvl}] {msg}')
\" 2>/dev/null || echo '(no logs yet — waiting for data)'
    sleep 3
  done
"

echo ""
echo "All services launched in separate windows."
echo ""
echo "  Web app  : http://localhost:3000"
echo "  API      : http://localhost:3001"
echo "  Kibana   : http://localhost:5601"
echo "  ES       : http://localhost:9200"
echo ""
echo "Kibana setup: Go to http://localhost:5601 > Analytics > Discover"
echo "Create data view with index pattern: aihq-api-*"
echo ""
