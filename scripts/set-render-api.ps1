param([Parameter(Mandatory=$true)][string]$RenderUrl)
$RenderUrl = $RenderUrl.Trim().TrimEnd('/')
if ($RenderUrl -notmatch '^https?://') { $RenderUrl = "https://$RenderUrl" }
$toml = Join-Path $PSScriptRoot "..\netlify.toml"
$c = Get-Content $toml -Raw
$block = @"

[[redirects]]
  from = "/api/*"
  to = "$RenderUrl/api/:splat"
  status = 200
  force = true
"@
if ($c -match '\[\[redirects\]\]\s+from = "/api/\*"') {
  $c = $c -replace '(?s)\[\[redirects\]\]\s+from = "/api/\*".*?force = true', $block.Trim()
} else {
  $c = $c -replace '# After deploying backend.*', $block
}
Set-Content $toml $c -NoNewline
$cfg = Join-Path $PSScriptRoot "..\site-config.js"
$sc = Get-Content $cfg -Raw
$sc = $sc -replace 'apiBaseUrl: ""', "apiBaseUrl: `"$RenderUrl/api/v1`","
Set-Content $cfg $sc -NoNewline
Write-Host "OK: API -> $RenderUrl"
