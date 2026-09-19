import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const catalogHtml = readFileSync(
  path.join(repoRoot, "projets/index.html"),
  "utf8",
);
const homeHtml = readFileSync(path.join(repoRoot, "index.html"), "utf8");
const catalogTemplate = readFileSync(
  path.join(repoRoot, "templates/projects-index.html.tpl"),
  "utf8",
);
const cardCss = readFileSync(
  path.join(repoRoot, "assets/css/project-cards.css"),
  "utf8",
);
const mainJs = readFileSync(path.join(repoRoot, "assets/js/main.js"), "utf8");

const catalogCardCount = (
  catalogHtml.match(/data-project-surface="catalog"/gu) ?? []
).length;

test("P2.4.3 replie les filtres sur mobile sans les retirer du HTML", () => {
  assert.match(
    catalogTemplate,
    /<details class="project-filter-panel" data-filter-panel open>/u,
  );
  assert.match(catalogTemplate, /data-active-filter-count>0 actifs</u);
  assert.match(catalogTemplate, /data-filter-summary>Aucun filtre actif</u);
  assert.match(catalogTemplate, /data-filter-reset hidden/u);

  assert.match(
    cardCss,
    /@media \(max-width: 45rem\)[\s\S]*?\.project-filter-panel > summary \{[\s\S]*?display: flex;/u,
  );
  assert.match(mainJs, /window\.matchMedia\("\(max-width: 45rem\)"\)/u);
  assert.match(mainJs, /filterPanel\.open = !compactCatalog\.matches/u);
});

test("P2.4.3 expose un retour lisible sur les filtres actifs", () => {
  assert.match(mainJs, /activeSelections/u);
  assert.match(mainJs, /describeSelection/u);
  assert.match(mainJs, /Aucun filtre actif/u);
  assert.match(mainJs, /active\.map\(describeSelection\)\.join\(" · "\)/u);
  assert.match(mainJs, /reset\.hidden = activeCount === 0/u);
  assert.match(
    mainJs,
    /visibleCount === 1 \? "" : "s"/u,
    "le compteur doit aussi gérer correctement zéro projet",
  );
});

test("P2.4.3 allege uniquement les cartes catalogue sur mobile", () => {
  assert.ok(catalogCardCount > 0);
  assert.equal(
    (catalogHtml.match(/data-project-facts-disclosure/gu) ?? []).length,
    catalogCardCount,
  );
  assert.equal(
    (homeHtml.match(/data-project-facts-disclosure/gu) ?? []).length,
    0,
    "la homepage P2.4.2 ne doit pas gagner de disclosure catalogue",
  );
  assert.match(
    catalogHtml,
    /<summary>Mission et points clés <span class="project-disclosure-icon"/u,
  );
  assert.match(
    cardCss,
    /@media \(max-width: 45rem\)[\s\S]*?\.project-facts-disclosure > summary \{[\s\S]*?min-height: 2\.75rem;/u,
  );
  assert.match(
    mainJs,
    /cardDisclosures\.forEach\(\(details\) => \{[\s\S]*?details\.open = !compactCatalog\.matches;/u,
  );
});
