# dev-elk.ps1 — Start the full AIHQ dev environment with ELK logging
# Opens separate PowerShell windows for: ELK stack, API server, Web server, Log tail
#
# Usage: .\scripts\dev-elk.ps1

$root = Split-Path $PSScriptRoot -Parent
$elk  = "$root\docker-compose.elk.yml"

Write-Host ""
Write-Host "=== AIHQ Dev + ELK Stack ===" -ForegroundColor Cyan
Write-Host "Root: $root" -ForegroundColor Gray
Write-Host ""

# ── 1. Start ELK via Docker Compose ──────────────────────────────────────────
Write-Host "[1/4] Starting Elasticsearch + Kibana..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "& { Set-Location '$root'; Write-Host 'Starting ELK stack...' -ForegroundColor Cyan; docker compose -f docker-compose.elk.yml up; Read-Host 'Press Enter to close' }"
) -WindowStyle Normal

# Give ES a moment to start accepting connections
Start-Sleep 5

# ── 2. Start API server ───────────────────────────────────────────────────────
Write-Host "[2/4] Starting API server (port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "& { Set-Location '$root'; `$env:ES_URL='http://localhost:9200'; Write-Host 'Starting API...' -ForegroundColor Green; pnpm --filter @aihq/api dev; Read-Host 'Press Enter to close' }"
) -WindowStyle Normal

# ── 3. Start Web server ───────────────────────────────────────────────────────
Write-Host "[3/4] Starting Web server (port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "& { Set-Location '$root'; Write-Host 'Starting Web...' -ForegroundColor Magenta; pnpm --filter @aihq/web dev; Read-Host 'Press Enter to close' }"
) -WindowStyle Normal

# ── 4. Open log tail window ───────────────────────────────────────────────────
Write-Host "[4/4] Opening Elasticsearch log tail..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  @'
& {
  Write-Host "Waiting for Elasticsearch to be ready..." -ForegroundColor Gray
  $maxWait = 60
  $waited  = 0
  while ($waited -lt $maxWait) {
    try {
      $r = Invoke-WebRequest -Uri http://localhost:9200/_cluster/health -UseBasicParsing -ErrorAction Stop
      if ($r.StatusCode -eq 200) { break }
    } catch {}
    Start-Sleep 2
    $waited += 2
  }
  Write-Host ""
  Write-Host "=== AIHQ Log Stream (Elasticsearch) ===" -ForegroundColor Cyan
  Write-Host "Index: aihq-api-*   |   Kibana: http://localhost:5601" -ForegroundColor Gray
  Write-Host "Press Ctrl+C to stop." -ForegroundColor Gray
  Write-Host ""
  while ($true) {
    try {
      $body = '{"query":{"match_all":{}},"sort":[{"@timestamp":{"order":"desc"}}],"size":10}'
      $r = Invoke-RestMethod -Uri "http://localhost:9200/aihq-api-*/_search" -Method Post -ContentType "application/json" -Body $body -ErrorAction SilentlyContinue
      if ($r.hits.hits) {
        foreach ($hit in ($r.hits.hits | Sort-Object { $_._source.'@timestamp' })) {
          $src = $hit._source
          $ts  = $src.'@timestamp' ?? $src.timestamp ?? ""
          $lvl = ($src.level ?? "info").ToUpper().PadRight(5)
          $msg = $src.message ?? $src.msg ?? ""
          $color = switch ($src.level) {
            "error" { "Red" } "warn" { "Yellow" } "debug" { "Gray" } default { "Cyan" }
          }
          Write-Host "$ts [$lvl] $msg" -ForegroundColor $color
        }
      }
    } catch {}
    Start-Sleep 3
    Clear-Host
    Write-Host "=== AIHQ Log Stream ===" -ForegroundColor Cyan
    Write-Host "Kibana: http://localhost:5601  |  Refreshing every 3s" -ForegroundColor Gray
    Write-Host ""
  }
}
'@
) -WindowStyle Normal

Write-Host ""
Write-Host "All services launched in separate windows." -ForegroundColor Green
Write-Host ""
Write-Host "  Web app  : http://localhost:3000" -ForegroundColor White
Write-Host "  API      : http://localhost:3001" -ForegroundColor White
Write-Host "  Kibana   : http://localhost:5601" -ForegroundColor White
Write-Host "  ES       : http://localhost:9200" -ForegroundColor White
Write-Host ""
Write-Host "Kibana setup: Go to http://localhost:5601 > Analytics > Discover" -ForegroundColor Gray
Write-Host "Create data view with index pattern: aihq-api-*" -ForegroundColor Gray
Write-Host ""
