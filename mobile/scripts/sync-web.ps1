# Copies static site from repo root into mobile/www for Capacitor bundling.
$ErrorActionPreference = "Stop"
$mobileRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$repoRoot = Resolve-Path (Join-Path $mobileRoot "..")
$wwwRoot = Join-Path $mobileRoot "www"

Write-Host "Repo:  $repoRoot"
Write-Host "Dest:  $wwwRoot"

if (Test-Path $wwwRoot) {
  Remove-Item $wwwRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $wwwRoot | Out-Null

function Copy-Globs($patterns) {
  foreach ($pat in $patterns) {
    Get-ChildItem -Path $repoRoot -Filter $pat -File -ErrorAction SilentlyContinue |
      ForEach-Object { Copy-Item $_.FullName -Destination $wwwRoot -Force }
  }
}

Copy-Globs @(
  "*.html", "*.css", "*.js", "*.svg", "*.xml", "*.txt", "*.csv"
)

foreach ($dir in @("assets", "rider", "legal", "admin", "customer")) {
  $src = Join-Path $repoRoot $dir
  if (Test-Path $src) {
    Copy-Item $src (Join-Path $wwwRoot $dir) -Recurse -Force
  }
}

# Capacitor entry — app shell home (not waitlist redirect)
$indexHtml = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=app.html">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>EatHalal</title>
  <script>location.replace('app.html');</script>
</head>
<body></body>
</html>
"@
Set-Content -Path (Join-Path $wwwRoot "index.html") -Value $indexHtml -Encoding UTF8

# Inject native bootstrap + mobile styles into key pages
$injectHead = @(
  '<link rel="stylesheet" href="mobile-app.css">',
  '<script src="mobile-native.js" defer></script>'
)
$keyPages = @("app.html", "waitlist.html", "waitlist-success.html", "index.html", "certification.html", "track-order.html", "signin.html", "signup.html", "partners.html")

foreach ($page in $keyPages) {
  $path = Join-Path $wwwRoot $page
  if (-not (Test-Path $path)) { continue }
  $html = Get-Content $path -Raw -Encoding UTF8
  if ($html -notmatch "mobile-native\.js") {
    $replacement = ($injectHead -join "`n") + "`n</head>"
    $html = $html.Replace("</head>", $replacement)
    Set-Content -Path $path -Value $html -Encoding UTF8 -NoNewline
  }
}

# Tab bar on launch / waitlist pages inside native app
$tabBar = @'

  <nav class="go-mobile-tabbar go-mobile-tabbar--injected" aria-label="App navigation">
    <a href="app.html"><span aria-hidden="true">🏠</span> Home</a>
    <a href="waitlist.html"><span aria-hidden="true">✨</span> Waitlist</a>
    <a href="index.html?home=1#menu"><span aria-hidden="true">🍽</span> Menu</a>
    <a href="signin.html"><span aria-hidden="true">👤</span> Account</a>
  </nav>
'@

foreach ($page in @("waitlist.html", "waitlist-success.html", "certification.html")) {
  $path = Join-Path $wwwRoot $page
  if (-not (Test-Path $path)) { continue }
  $html = Get-Content $path -Raw -Encoding UTF8
  if ($html -notmatch "go-mobile-tabbar--injected") {
    $html = $html.Replace("</body>", ($tabBar + "`n</body>"))
    Set-Content -Path $path -Value $html -Encoding UTF8 -NoNewline
  }
}

$fileCount = (Get-ChildItem $wwwRoot -Recurse -File).Count
Write-Host "Done. Files in www/: $fileCount"
