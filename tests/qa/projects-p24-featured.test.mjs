import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const catalog = JSON.parse(
  readFileSync(path.join(repoRoot, "data/projects.json"), "utf8"),
);
const homeHtml = readFileSync(path.join(repoRoot, "index.html"), "utf8");
const catalogHtml = readFileSync(
  path.join(repoRoot, "projets/index.html"),
  "utf8",
);

const expectedFeatured = ["alycia", "streamfolio", "agenda", "aelia"];
const expectedSecondary = ["kanban", "calcufolio"];

function cardMatches(html, surface) {
  const pattern = new RegExp(
    `<article class="project-card project-card-playful"[^>]*data-project-slug="([^"]+)"[^>]*data-project-surface="${surface}"[^>]*data-project-priority="([^"]+)"[^>]*>([\\s\\S]*?)<\\/article>`,
    "gu",
  );
  return [...html.matchAll(pattern)].map((match) => ({
    slug: match[1],
    priority: match[2],
    body: match[3],
  }));
}

test("P2.4.1 verrouille la selection featured canonique", () => {
  const featured = catalog.projects
    .filter((project) => project.published && project.featured)
    .sort((a, b) => a.featuredOrder - b.featuredOrder)
    .map((project) => project.slug);
  const secondary = catalog.projects
    .filter((project) => project.published && !project.featured)
    .map((project) => project.slug);

  assert.deepEqual(featured, expectedFeatured);
  assert.deepEqual(secondary, expectedSecondary);
  assert.equal(
    catalog.projects.find((project) => project.slug === "solvia")?.published,
    false,
  );
});

test("P2.4.1 expose une hierarchie explicite sur la homepage", () => {
  const cards = cardMatches(homeHtml, "home");

  assert.deepEqual(
    cards.map((card) => card.slug),
    expectedFeatured,
  );
  assert.equal(cards[0]?.priority, "lead");
  assert.deepEqual(
    cards.slice(1).map((card) => card.priority),
    ["featured", "featured", "featured"],
  );

  for (const card of cards) {
    const tagCount = (card.body.match(/class="tag"/gu) ?? []).length;
    assert.ok(
      tagCount > 0 && tagCount <= 4,
      `${card.slug}: la stack homepage doit rester limitee a 4 technologies`,
    );
  }
});

test("P2.4.1 place les featured avant les projets secondaires dans le catalogue", () => {
  const cards = cardMatches(catalogHtml, "catalog");

  assert.deepEqual(
    cards.map((card) => card.slug),
    [...expectedFeatured, ...expectedSecondary],
  );
  assert.deepEqual(
    cards.map((card) => card.priority),
    ["featured", "featured", "featured", "featured", "secondary", "secondary"],
  );
});
