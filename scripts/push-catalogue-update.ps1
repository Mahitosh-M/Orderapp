param(
  [string]$Message = ""
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

$catalogueStatus = git status --short -- public/catalogue
if (-not $catalogueStatus) {
  Write-Host "No catalogue changes to push."
  exit 0
}

git add public/catalogue/catalogue.json public/catalogue/catalogue-version.json

if (-not $Message.Trim()) {
  $stamp = Get-Date -Format "yyyy-MM-dd HH:mm"
  $Message = "Update catalogue $stamp"
}

git commit -m $Message
git push origin main

Write-Host "Catalogue update pushed. GitHub Actions will deploy Firebase Hosting."
