# Ouvre le Dashboard Clerk pour activer le Cameroun (+237) dans la SMS allowlist.
# A faire manuellement : Settings → activer "Cameroon".

$appId = "app_3EdCISA6pWatOI514YUyYbnogLX"

Write-Host "Ouverture du Dashboard Clerk (SMS / telephone)..." -ForegroundColor Cyan
Write-Host "Activez Cameroon (+237) dans SMS allowlist > Settings." -ForegroundColor Yellow

if (Get-Command clerk -ErrorAction SilentlyContinue) {
  try {
    clerk open --app $appId 2>$null
  } catch {
    # fallback URL
  }
}

$urls = @(
  "https://dashboard.clerk.com/apps/$appId",
  "https://dashboard.clerk.com/last-active?path=sms"
)

foreach ($url in $urls) {
  Start-Process $url
  break
}

Write-Host "Voir aussi: Front-End/docs/clerk-activer-cameroun.md" -ForegroundColor Green
