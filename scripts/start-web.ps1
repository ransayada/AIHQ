$Host.UI.RawUI.WindowTitle = "AIHQ - Web Frontend :3000"
Set-Location "C:\Users\RS\Desktop\ClaudeCode\aihq"
Write-Host "Starting AIHQ Web on http://localhost:3000 ..." -ForegroundColor Green
pnpm turbo dev --filter=@aihq/web
