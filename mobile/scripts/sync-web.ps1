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

Copy-Globs @("*.html", "*.css", "*.js", "*.svg", "*.xml", "*.txt", "*.csv", "api-client.js", "site-config.js")

$siteConfig = Join-Path $repoRoot "site-config.js"
$responsive = Join-Path $repoRoot "eathalal-responsive.css"
if (Test-Path $siteConfig) { Copy-Item $siteConfig $wwwRoot -Force }
if (Test-Path $responsive) { Copy-Item $responsive $wwwRoot -Force }

foreach ($dir in @("assets", "rider", "legal", "admin", "customer")) {
  $src = Join-Path $repoRoot $dir
  if (Test-Path $src) {
    Copy-Item $src (Join-Path $wwwRoot $dir) -Recurse -Force
  }
}

Write-Host "Done. Files in www/: $((Get-ChildItem $wwwRoot -Recurse -File).Count) (approx)"
