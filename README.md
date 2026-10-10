# drivengo-legal

Public legal + support pages for the Drive & Go app, Hungarian and English. Static HTML built from `src/**/*.md` with pandoc (`./build.sh`), served from `docs/` via GitHub Pages (base path `/drivengo-legal`).

Routes (mirroring `apps/mobile/lib/legal-urls.ts`): `/legal/terms`, `/legal/privacy`, `/legal/cookies`, `/legal/acknowledgements`, `/support` — Hungarian at the route, English at `<route>/en/`.

The legal texts are owned by Lex and copied byte-for-byte from the brain (`10-Company/legal-public/`); see the header of `build.sh` for the only build-time rewrites. The pages set no cookies and load nothing from a third party.

Language detection: a Hungarian page sends a browser whose language list has no "hu" to its `/en/` page, unless the visitor chose Hungarian by hand (`localStorage dg-lang=hu`) or asked for it explicitly with `?lang=hu` (what the app sends when its language is Hungarian). English pages never redirect. Test (no dependencies): `node --test test/lang-redirect.test.mjs` — it runs the inline script of every built page in a sandbox; `DOCS_DIR=<dir>` points it at another build.
