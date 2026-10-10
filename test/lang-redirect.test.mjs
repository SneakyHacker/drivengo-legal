// Language-detection script on the built pages (docs/), run in a sandbox with a stubbed
// navigator / localStorage / location. Run: node --test test/lang-redirect.test.mjs
// DOCS_DIR=<dir> points the suite at another build (e.g. an older one, as a control).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const DOCS = process.env.DOCS_DIR || join(dirname(fileURLToPath(import.meta.url)), "..", "docs");

// Hungarian route -> its English page. Every route the app links to.
const ROUTES = {
  "legal/terms": "/legal/terms/en/",
  "legal/privacy": "/legal/privacy/en/",
  "legal/cookies": "/legal/cookies/en/",
  "legal/acknowledgements": "/legal/acknowledgements/en/",
  support: "/support/en/",
};

function inlineScripts(html) {
  return [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
}

/** Runs the page's inline scripts; returns where the page sent the visitor (null = stayed) and the stored choice. */
function visit(page, { languages, search = "", stored = null }) {
  const html = readFileSync(join(DOCS, page, "index.html"), "utf8");
  const store = new Map(stored ? [["dg-lang", stored]] : []);
  let redirectedTo = null;
  const sandbox = {
    navigator: { languages, language: languages[0] ?? "" },
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
    },
    location: {
      search,
      replace: (url) => {
        redirectedTo = url;
      },
    },
  };
  for (const src of inlineScripts(html)) vm.runInNewContext(src, sandbox);
  return { redirectedTo, stored: store.get("dg-lang") ?? null };
}

const EN_ONLY = ["en-US", "en"];

for (const [route, english] of Object.entries(ROUTES)) {
  test(`${route}: ?lang=hu keeps the Hungarian page on an English-only browser and remembers it (ZbmY7yLe)`, () => {
    assert.deepEqual(visit(route, { languages: EN_ONLY, search: "?lang=hu" }), { redirectedTo: null, stored: "hu" });
  });

  test(`${route}: ?lang=hu wins over a stored English choice`, () => {
    assert.equal(visit(route, { languages: EN_ONLY, search: "?lang=hu", stored: "en" }).redirectedTo, null);
  });

  test(`${route}: lang=hu among other query parameters still counts`, () => {
    assert.equal(visit(route, { languages: EN_ONLY, search: "?utm_source=app&lang=hu" }).redirectedTo, null);
  });

  test(`${route}: without an explicit request an English-only browser still goes to ${english} (WlsRSTRF unchanged)`, () => {
    assert.equal(visit(route, { languages: EN_ONLY }).redirectedTo, english);
    assert.equal(visit(route, { languages: ["de-DE"] }).redirectedTo, english);
    assert.equal(visit(route, { languages: EN_ONLY, search: "?lang=hungarian" }).redirectedTo, english);
    assert.equal(visit(route, { languages: ["hu-HU", "hu"], stored: "en" }).redirectedTo, english);
  });

  test(`${route}: a Hungarian browser or a stored Hungarian choice stays`, () => {
    assert.equal(visit(route, { languages: ["hu-HU", "hu"] }).redirectedTo, null);
    assert.equal(visit(route, { languages: ["en-US", "hu"] }).redirectedTo, null);
    assert.equal(visit(route, { languages: EN_ONLY, stored: "hu" }).redirectedTo, null);
  });

  test(`${route}/en: the English page never redirects`, () => {
    for (const search of ["", "?lang=hu"]) {
      for (const languages of [EN_ONLY, ["hu-HU"]]) {
        assert.equal(visit(`${route}/en`, { languages, search }).redirectedTo, null);
      }
    }
  });
}

test("root page carries no language redirect", () => {
  assert.equal(visit(".", { languages: EN_ONLY }).redirectedTo, null);
});
