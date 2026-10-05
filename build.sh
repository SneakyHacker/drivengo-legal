#!/usr/bin/env bash
# Builds docs/ from src/**/*.md with pandoc. Usage: ./build.sh [BASE_PATH]
# BASE_PATH defaults to /drivengo-legal (GitHub Pages project site). Use "" for an apex host.
#
# Layout: src/<route>.md = Hungarian page at /<route>/ ; src/<route>/en.md = English page at /<route>/en/.
# The legal texts (terms, privacy, cookies, support) are Lex's files copied byte-for-byte from the
# brain folder 10-Company/legal-public/ (terms-hu.md -> src/legal/terms.md, terms-en.md ->
# src/legal/terms/en.md, ...). Never edit them here; the two build-time rewrites below are the
# only transformations:
#   1. <title> is taken from the first "# " heading (the sources carry no YAML front matter).
#   2. Root-relative links (/legal/terms, /legal/privacy, /legal/cookies) are prefixed with
#      BASE_PATH and, on an English page, pointed at the English variant (/<route>/en/).
# pandoc runs with -f markdown-smart so quotes and dashes stay exactly as written.
set -euo pipefail
cd "$(dirname "$0")"
BASE="${1-/drivengo-legal}"
rm -rf docs && mkdir -p docs
while IFS= read -r -d '' f; do
  rel="${f#src/}"; rel="${rel%.md}"
  if [ "$rel" = "index" ]; then out="docs/index.html"; else out="docs/$rel/index.html"; fi
  mkdir -p "$(dirname "$out")"
  args=()
  if [ "$(basename "$rel")" = "en" ]; then
    lang=en; route="${rel%/en}"; linksuffix="/en/"
    args+=(-V en=1 -V alt_href="$BASE/$route/" -V alt_label="Magyar")
  else
    lang=hu; route="$rel"; linksuffix="/"
    if [ -f "src/$rel/en.md" ]; then args+=(-V alt_href="$BASE/$rel/en/" -V alt_label="English"); fi
  fi
  if ! head -1 "$f" | grep -q '^---$'; then
    title="$(grep -m1 '^# ' "$f" | sed -e 's/^# //' -e 's/^Drive & Go — //')"
    args+=(--metadata "title=$title")
  fi
  sed -E "s#\]\(/(legal/[a-z]+)\)#](${BASE}/\1${linksuffix})#g" "$f" \
    | pandoc -f markdown-smart -s --template _template.html -V base="$BASE" -V lang="$lang" ${args[@]+"${args[@]}"} -o "$out"
  echo "built $out ($lang)"
done < <(find src -name '*.md' -print0 | sort -z)
touch docs/.nojekyll
