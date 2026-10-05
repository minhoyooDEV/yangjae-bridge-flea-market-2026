#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ "$(uname -s)" != Darwin ]]; then
  echo 'Film rendering requires macOS (AppKit/CoreGraphics). Use the committed assets for web builds.' >&2
  exit 1
fi
for tool in swiftc python3 ffmpeg; do
  command -v "$tool" >/dev/null || { echo "Missing tool: $tool" >&2; exit 1; }
done
film_tmp=$(mktemp -d "${TMPDIR:-/tmp}/herb-film.XXXXXX")
trap 'rm -rf "$film_tmp"' EXIT
mkdir -p assets
swiftc -O -module-cache-path "$film_tmp/modules" scripts/render.swift -o "$film_tmp/render"
python3 scripts/audio.py "$film_tmp/audio.wav"
"$film_tmp/render" 27 "$film_tmp/poster.png"
# The raw stream is BGRA, 1280x720, 30fps. No external fonts/assets are downloaded.
"$film_tmp/render" | ffmpeg -hide_banner -loglevel warning -y \
  -f rawvideo -pixel_format bgra -video_size 1280x720 -framerate 30 -i pipe:0 \
  -i "$film_tmp/audio.wav" -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p \
  -c:a aac -b:a 128k -t 30 -movflags +faststart "$film_tmp/film.mp4"
cp "$film_tmp/film.mp4" assets/herb-keeper-single.mp4
cp "$film_tmp/poster.png" assets/herb-keeper-single-poster.png
