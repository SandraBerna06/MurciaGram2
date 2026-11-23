#!/usr/bin/env bash
# Convierte assets/raw/* en variantes móvil (400x300) y escritorio (1000x750).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RAW_DIR="$ROOT/assets/raw"
OUT_DIR="$ROOT/assets/img"

if command -v magick >/dev/null 2>&1; then
  MAGICK="magick"
elif command -v convert >/dev/null 2>&1; then
  MAGICK="convert"
else
  echo "ImageMagick no está instalado o no está en el PATH." >&2
  exit 1
fi

mkdir -p "$OUT_DIR"
shopt -s nullglob nocaseglob
images=("$RAW_DIR"/*.{jpg,jpeg,png,webp})

if [ ${#images[@]} -eq 0 ]; then
  echo "No se encontraron imágenes en $RAW_DIR"
  exit 0
fi

for image in "${images[@]}"; do
  name="$(basename "${image%.*}")"
  "$MAGICK" "$image" -auto-orient -resize '400x300^' -gravity center -extent 400x300 -strip -interlace Plane -quality 82 "$OUT_DIR/$name-mobile.jpg"
  "$MAGICK" "$image" -auto-orient -resize '1000x750^' -gravity center -extent 1000x750 -strip -interlace Plane -quality 85 "$OUT_DIR/$name-desktop.jpg"
  echo "OK $name → $name-mobile.jpg + $name-desktop.jpg"
done

echo "Proceso completado: ${#images[@]} imágenes optimizadas en $OUT_DIR"
