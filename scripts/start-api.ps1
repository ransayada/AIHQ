$Host.UI.RawUI.WindowTitle = "AIHQ - API Backend :3001"
Set-Location "C:\Users\RS\Desktop\ClaudeCode\aihq"
Write-Host "Starting AIHQ API on http://localhost:3001 ..." -ForegroundColor Cyan
pnpm turbo dev --filter=@aihq/api
