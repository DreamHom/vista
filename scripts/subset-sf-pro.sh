#!/usr/bin/env bash
#
# Subset SF Pro variable fonts down to web-friendly woff2 files.
#
# WHY: Apple's SF Pro variable TTFs are ~44 MB combined — they ship every
# writing system the macOS installer cares about. We don't need that on the
# web. This script trims them to the scripts our users actually read in
# (Latin, Cyrillic, Arabic, Devanagari) and the weight range we use (300-700).
#
# OUTPUT: app/fonts/sf-pro/{sf-pro,sf-pro-italic}.woff2 — ~1.5 MB combined.
#
# REQUIREMENTS: Python 3 with fontTools + brotli + zopfli.
#   python3 -m venv /tmp/vista-fontsubset
#   /tmp/vista-fontsubset/bin/pip install fonttools brotli zopfli
#
# USAGE: drop the source SF-Pro.ttf and SF-Pro-Italic.ttf into
#   app/fonts/sf-pro/, then run:
#     bash scripts/subset-sf-pro.sh
#
set -euo pipefail

PYBIN="${PYBIN:-/tmp/vista-fontsubset/bin}"
FONTS_DIR="$(cd "$(dirname "$0")/.." && pwd)/app/fonts/sf-pro"

# Top-10 world languages SF Pro can serve, plus standard symbols.
#   Latin (basic + ext A/B + additional + Vietnamese diacritics)
#     → English, Spanish, French, Portuguese, German, Italian, Polish,
#       Indonesian, Vietnamese, Turkish, Dutch, …
#   Cyrillic (basic + supplement)
#     → Russian, Ukrainian, Bulgarian, Serbian, Belarusian
#   Arabic (basic block — has contextual shaping built in)
#     → Arabic, Urdu, Persian
#   Devanagari + Devanagari Extended
#     → Hindi, Marathi, Sanskrit
#   Punctuation, currency, math, arrows, symbols
UNICODES='U+0020-007E,U+00A0-00FF,U+0100-024F,U+0250-02AF,U+0300-036F,U+0400-052F,U+0600-06FF,U+0900-097F,U+1E00-1EFF,U+2000-206F,U+2070-209F,U+20A0-20CF,U+2100-218F,U+2190-22FF,U+2300-23FF,U+2500-25FF,U+2600-26FF,U+A8E0-A8FF'

subset_one() {
  local INPUT="$1"
  local OUTPUT="$2"
  echo "→ Subsetting $(basename "$INPUT")"

  # 1. Trim the variable weight axis to 300..700.
  "$PYBIN/fonttools" varLib.instancer \
    "$INPUT" \
    wght=300:700 \
    --output="${OUTPUT%.woff2}.axis.ttf" >/dev/null

  # 2. Glyph subset and convert to woff2.
  "$PYBIN/pyftsubset" \
    "${OUTPUT%.woff2}.axis.ttf" \
    --output-file="$OUTPUT" \
    --flavor=woff2 \
    --layout-features='*' \
    --unicodes="$UNICODES" \
    --no-hinting \
    --desubroutinize \
    --no-glyph-names \
    --notdef-outline \
    --recommended-glyphs \
    --drop-tables+=DSIG \
    >/dev/null 2>&1 || true

  rm -f "${OUTPUT%.woff2}.axis.ttf"
  ls -lh "$OUTPUT" | awk '{printf "   %s\n", $5}'
}

subset_one "$FONTS_DIR/SF-Pro.ttf"        "$FONTS_DIR/sf-pro.woff2"
subset_one "$FONTS_DIR/SF-Pro-Italic.ttf" "$FONTS_DIR/sf-pro-italic.woff2"
