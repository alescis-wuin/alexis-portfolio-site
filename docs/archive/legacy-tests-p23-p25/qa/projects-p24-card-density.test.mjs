import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const homeHtml = readFileSync(path.join(repoRoot, "index.html"), "utf8");
const catalogHtml = readFileSync(
  path.join(repoRoot, "projets/index.html"),
  "utf8",
);
const cardCss = readFileSync(
  path.join(repoRoot, "assets/css/project-cards.css"),
  "utf8",
);

function cardMatches(html, surface) {
  const pattern = new RegExp(
    `<article class="project-card project-card-playful"[^>]*data-project-slug="([^"]+)"[^>]*data-project-surface="${surface}"[^>]*data-project-priority="([^"]+)"[^>]*data-project-density="([^"]+)"[^>]*>([\\s\\S]*?)<\\/article>`,
    "gu",
  );
  return [...html.matchAll(pattern)].map((match) => ({
    slug: match[1],
    priority: match[2],
    density: match[3],
    body: match[4],
  }));
}

function tagCount(card) {
  return (card.body.match(/class="tag"/gu) ?? []).length;
}

function assertEditorialContract(card) {
  assert.match(card.body, /class="project-summary"/u, `${card.slug}: résumé`);
  assert.match(
    card.body,
    /class="project-fact project-fact-mission"[\s\S]*?<dt>Mission<\/dt>/u,
    `${card.slug}: mission`,
  );
  assert.match(
    card.body,
    /class="project-fact project-fact-proof"[\s\S]*?<dt>Points clés<\/dt>/u,
    `${card.slug}: points clés`,
  );
  assert.match(
    card.body,
    /class="project-metadata-label">Technologies<\/span>/u,
    `${card.slug}: technologies`,
  );
  assert.match(card.body, /class="project-read-link"/u, `${card.slug}: étude`);
  assert.match(
    card.body,
    /class="project-repository-link"/u,
    `${card.slug}: dépôt GitHub`,
  );
}

test("P2.4.2 adapte la densite des cartes a leur role editorial", () => {
  const homeCards = cardMatches(homeHtml, "home");
  const catalogCards = cardMatches(catalogHtml, "catalog");

  assert.deepEqual(
    homeCards.map((card) => card.density),
    ["lead", "featured", "featured", "featured"],
  );
  assert.ok(catalogCards.length > 0);
  assert.ok(catalogCards.every((card) => card.density === "catalog"));

  assert.ok(tagCount(homeCards[0]) > 0 && tagCount(homeCards[0]) <= 4);
  for (const card of homeCards.slice(1)) {
    assert.ok(
      tagCount(card) > 0 && tagCount(card) <= 3,
      `${card.slug}: une carte featured doit rester à 3 technologies maximum`,
    );
  }
  for (const card of catalogCards) {
    assert.ok(
      tagCount(card) > 0 && tagCount(card) <= 3,
      `${card.slug}: une carte catalogue doit rester à 3 technologies maximum`,
    );
  }
});

test("P2.4.2 conserve le contrat editorial complet sans empiler des sous-cartes", () => {
  const cards = [
    ...cardMatches(homeHtml, "home"),
    ...cardMatches(catalogHtml, "catalog"),
  ];

  for (const card of cards) assertEditorialContract(card);

  assert.match(cardCss, /\.project-facts \{[\s\S]*?overflow: hidden;/u);
  assert.match(cardCss, /\.project-facts div \+[\s\S]*?border-top:/u);
  assert.doesNotMatch(
    cardCss,
    /\.project-facts div \{[\s\S]{0,220}?border-radius:/u,
  );
});

test("P2.4.2 garde une composition lisible sur large et mobile", () => {
  assert.match(
    cardCss,
    /@media \(min-width: 100rem\)[\s\S]*?data-project-density="lead"[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/u,
  );
  assert.match(
    cardCss,
    /@media \(max-width: 45rem\)[\s\S]*?\.project-facts div \{[\s\S]*?grid-template-columns: 1fr;/u,
  );
  assert.match(
    cardCss,
    /@media \(max-width: 45rem\)[\s\S]*?\.project-stack \{[\s\S]*?grid-template-columns: 1fr;/u,
  );
  assert.match(
    cardCss,
    /@media \(max-width: 45rem\)[\s\S]*?\.project-signal \{[\s\S]*?flex-direction: row;/u,
  );
});
