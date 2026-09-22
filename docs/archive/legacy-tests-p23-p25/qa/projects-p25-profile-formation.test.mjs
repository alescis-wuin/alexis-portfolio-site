import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const home = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const styles = readFileSync(
  new URL("../../assets/css/styles.css", import.meta.url),
  "utf8",
);
const profileDoc = readFileSync(
  new URL("../../docs/P2.5_PROFILE.md", import.meta.url),
  "utf8",
);

function extractFormation() {
  const start = home.indexOf('<section\n        id="formation"');
  const end = home.indexOf('<section\n        id="apropos"', start);
  assert.notEqual(start, -1, "section formation introuvable");
  assert.notEqual(end, -1, "borne suivante de la formation introuvable");
  return home.slice(start, end);
}

function extractMarkedBlock(source, marker) {
  const markerIndex = source.indexOf(marker);
  assert.notEqual(markerIndex, -1, `marqueur ${marker} introuvable`);

  const articleStart = source.lastIndexOf("<article", markerIndex);
  const sectionStart = source.lastIndexOf("<section", markerIndex);
  const start = Math.max(articleStart, sectionStart);
  assert.notEqual(start, -1, `debut de bloc ${marker} introuvable`);

  const tag = source.startsWith("<article", start) ? "article" : "section";
  const end = source.indexOf(`</${tag}>`, markerIndex);
  assert.notEqual(end, -1, `fin de bloc ${marker} introuvable`);
  return source.slice(start, end + tag.length + 3);
}

test("P2.5-C separe les quatre statuts de formation et trajectoire", () => {
  const formation = extractFormation();

  assert.match(formation, /data-profile-section="formation"/);
  assert.equal((formation.match(/data-education-acquired/g) ?? []).length, 1);
  assert.equal((formation.match(/data-education-target/g) ?? []).length, 1);
  assert.equal((formation.match(/data-education-search/g) ?? []).length, 1);
  assert.equal((formation.match(/data-education-ai/g) ?? []).length, 1);

  const acquired = formation.indexOf("data-education-acquired");
  const target = formation.indexOf("data-education-target");
  const search = formation.indexOf("data-education-search");
  const future = formation.indexOf("data-education-ai");
  assert.ok(acquired < target && target < search && search < future);
});

test("P2.5-C distingue acquis, vise et recherche d entreprise", () => {
  const formation = extractFormation();
  const acquired = extractMarkedBlock(formation, "data-education-acquired");
  const target = extractMarkedBlock(formation, "data-education-target");
  const search = extractMarkedBlock(formation, "data-education-search");

  assert.match(acquired, /Bac \+2 Développeur Informatique/u);
  assert.match(acquired, /Diplôme obtenu/u);
  assert.match(target, /Bachelor Concepteur Développeur d’Applications/u);
  assert.match(target, /Troisième année visée pour 2026 - 2027/u);
  assert.doesNotMatch(target, /obtenu|obtenue/iu);
  assert.match(search, /Alternance à partir d’octobre 2026/u);
  assert.match(search, /Métropole de\s+Rouen/u);
});

test("P2.5-C conserve les formations acquises secondaires", () => {
  const acquired = extractMarkedBlock(
    extractFormation(),
    "data-education-acquired",
  );

  assert.match(acquired, /CCI — certification entrepreneur/u);
  assert.match(acquired, /Bac scientifique/u);
  assert.match(acquired, /2023 - 2025/u);
  assert.match(acquired, /2025/u);
  assert.match(acquired, /2021/u);
});

test("P2.5-C garde la trajectoire IA explicitement future", () => {
  const future = extractMarkedBlock(extractFormation(), "data-education-ai");

  assert.match(future, /Trajectoire future/u);
  assert.match(future, /À plus long terme/u);
  assert.match(future, /intelligence artificielle/u);
  assert.match(future, /ingénierie\s+des systèmes d’IA/u);
});

test("P2.5-C ajoute une composition responsive et documentee", () => {
  assert.match(styles, /\.education-layout\s*\{[^}]*grid-template-columns:/su);
  assert.match(
    styles,
    /@media \(max-width: 780px\)[\s\S]*?\.education-layout,[\s\S]*?grid-template-columns: 1fr;/u,
  );
  assert.doesNotMatch(
    styles,
    /\.education-(?:acquired|step):hover[^}]*display:\s*none/iu,
  );

  assert.match(profileDoc, /## P2\.5-C — contrat formation & trajectoire/u);
  assert.match(profileDoc, /69 à 73 captures/u);
});
