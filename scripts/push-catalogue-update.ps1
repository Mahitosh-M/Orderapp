param(
  [string]$Message = "",
  [string]$SourceCataloguePath = "D:\CATALOGUEapp\Orderapp\public\catalogue"
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$repoRootPath = $repoRoot.Path
Set-Location $repoRootPath

if (-not (Test-Path -LiteralPath $SourceCataloguePath -PathType Container)) {
  throw "Catalogue source folder was not found: $SourceCataloguePath"
}

foreach ($file in @("catalogue.json", "catalogue-version.json")) {
  $sourceFile = Join-Path $SourceCataloguePath $file
  if (-not (Test-Path -LiteralPath $sourceFile -PathType Leaf)) {
    throw "Catalogue source file was not found: $sourceFile"
  }
  Copy-Item -LiteralPath $sourceFile -Destination (Join-Path $repoRootPath "public\catalogue\$file") -Force
}

$catalogueStatus = & git -c "safe.directory=$repoRootPath" status --short -- public/catalogue
if (-not $catalogueStatus) {
  Write-Host "No catalogue changes to push."
  exit 0
}

& git -c "safe.directory=$repoRootPath" add public/catalogue/catalogue.json public/catalogue/catalogue-version.json

if (-not $Message.Trim()) {
  $stamp = Get-Date -Format "yyyy-MM-dd HH:mm"
  $Message = "Update catalogue $stamp"
}

& git -c "safe.directory=$repoRootPath" commit -m $Message
& git -c "safe.directory=$repoRootPath" push origin main

Write-Host "Catalogue update pushed. GitHub Actions will deploy Firebase Hosting."
