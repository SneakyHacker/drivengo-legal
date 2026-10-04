#!/usr/bin/env bash
# Builds site/ from src/*.md with pandoc. Usage: ./build.sh [BASE_PATH]
# BASE_PATH defaults to /drivengo-legal (GitHub Pages project site). Use "" for an apex host.
set -euo pipefail
cd "$(dirname "$0")"
BASE="${1-/drivengo-legal}"
rm -rf site && mkdir -p site
while IFS= read -r -d '' f; do
  rel="${f#src/}"; rel="${rel%.md}"
  if [ "$rel" = "index" ]; then out="site/index.html"; else out="site/$rel/index.html"; fi
  mkdir -p "$(dirname "$out")"
  pandoc "$f" -s --template _template.html -V base="$BASE" -V lang="${LANG_CODE:-hu}" -o "$out"
  echo "built $out"
done < <(find src -name '*.md' -print0 | sort -z)
touch site/.nojekyll
