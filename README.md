# drivengo-legal

Public legal + support pages for the Drive & Go app, Hungarian and English. Static HTML built from `src/**/*.md` with pandoc (`./build.sh`), served from `docs/` via GitHub Pages (base path `/drivengo-legal`).

Routes (mirroring `apps/mobile/lib/legal-urls.ts`): `/legal/terms`, `/legal/privacy`, `/legal/cookies`, `/legal/acknowledgements`, `/support` — Hungarian at the route, English at `<route>/en/`.

The legal texts are owned by Lex and copied byte-for-byte from the brain (`10-Company/legal-public/`); see the header of `build.sh` for the only build-time rewrites. The pages set no cookies and load nothing from a third party.
