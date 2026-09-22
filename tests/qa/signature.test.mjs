import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { test } from "node:test";
const root = new URL("../../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const data = JSON.parse(read("data/projects.json"));
test("les versions de travail restent signalées et hors sélection principale", () => {
  const unpublished = data.projects.filter((project) => !project.published);
  const catalogHtml = read("projets/index.html");
  for (const project of unpublished) {
    assert.equal(project.featured, false);
    assert.ok(project.publicationNote);
    assert.doesNotMatch(catalogHtml, new RegExp(project.slug, "u"));
  }
});
test("les budgets mesurent les ressources CSS réellement chargées", () => {
  const html = read("index.html");
  const budget = read("scripts/validate-project-performance.mjs");
  for (const match of html.matchAll(/href="\.\/(assets\/css\/[^\"]+)"/g))
    assert.ok(budget.includes(match[1]), match[1]);
  execFileSync(process.execPath, ["scripts/validate-project-performance.mjs"], {
    cwd: root,
  });
});
test("le HTML public ne publie ni téléphone ni affirmations de recrutement fictives", () => {
  const html = [
    read("index.html"),
    ...data.projects
      .filter((p) => p.published)
      .map((p) => read(`projets/${p.slug}.html`)),
  ].join("\n");
  assert.doesNotMatch(
    html,
    /tel:|07[ .]45[ .]26|expert certifié|100 % accessible|architecte logiciel/i,
  );
  assert.match(html, /Formation visée/);
  assert.match(html, /entreprise d’accueil/);
});
