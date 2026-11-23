param(
  [string]$RawDir = (Join-Path (Split-Path -Parent $PSScriptRoot) 'assets/raw'),
  [string]$OutDir = (Join-Path (Split-Path -Parent $PSScriptRoot) 'assets/img')
)

$ErrorActionPreference = 'Stop'

$exe = $null
$magickCmd = Get-Command magick -ErrorAction SilentlyContinue
if ($magickCmd) {
  $exe = $magickCmd.Source
}

if (-not $exe) {
  $found = Get-ChildItem -Path @("$env:ProgramFiles\ImageMagick*", "$env:LOCALAPPDATA\Programs\ImageMagick*") -Filter magick.exe -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($found) { $exe = $found.FullName }
}

if (-not $exe) {
  # En Windows, C:\Windows\System32\convert.exe NO es ImageMagick: hay que evitar ese falso positivo.
  $convertCmd = Get-Command convert -ErrorAction SilentlyContinue
  if ($convertCmd -and $convertCmd.Source -notmatch 'System32\\convert\.exe$') {
    $exe = $convertCmd.Source
  }
}

if (-not $exe) {
  Write-Error 'ImageMagick no está instalado o no está en el PATH. Instálalo desde https://imagemagick.org/script/download.php'
  exit 1
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$extensions = @('.jpg', '.jpeg', '.png', '.webp')
$images = Get-ChildItem -Path $RawDir -File | Where-Object { $extensions -contains $_.Extension.ToLowerInvariant() }

if (-not $images) {
  Write-Host "No se encontraron imágenes en $RawDir"
  exit 0
}

foreach ($image in $images) {
  $name = $image.BaseName
  $mobile = Join-Path $OutDir "$name-mobile.jpg"
  $desktop = Join-Path $OutDir "$name-desktop.jpg"

  & $exe $image.FullName -auto-orient -resize '400x300^' -gravity center -extent 400x300 -strip -interlace Plane -quality 82 $mobile
  if ($LASTEXITCODE -ne 0) { throw "Error generando $mobile" }

  & $exe $image.FullName -auto-orient -resize '1000x750^' -gravity center -extent 1000x750 -strip -interlace Plane -quality 85 $desktop
  if ($LASTEXITCODE -ne 0) { throw "Error generando $desktop" }

  Write-Host "OK $name → $name-mobile.jpg (400x300) + $name-desktop.jpg (1000x750)"
}

Write-Host "Proceso completado: $($images.Count) imágenes optimizadas en $OutDir"
