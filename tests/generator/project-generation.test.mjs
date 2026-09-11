import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

let fixtureRoot;

beforeEach(() => {
  fixtureRoot = mkdtempSync(path.join(tmpdir(), "portfolio-generator-"));

  for (const relativePath of [
    "scripts/generate-projects.mjs",
    "data/projects.json",
    "templates",
    "index.html",
    "assets/img/projects",
  ]) {
    copyFixturePath(relativePath);
  }

  mkdirSync(path.join(fixtureRoot, "projets"), { recursive: true });
});

afterEach(() => {
  rmSync(fixtureRoot, { recursive: true, force: true });
});

test("les pages projet orphelines sont détectées puis supprimées", () => {
  assertGeneratorSuccess(runGenerator());

  const orphanPath = path.join(fixtureRoot, "projets", "ancien-projet.html");
  writeFileSync(orphanPath, "<!doctype html><title>orphelin</title>\n", "utf8");

  const check = runGenerator("--check");
  assert.notEqual(check.status, 0);
  assert.match(check.stderr, /ancien-projet\.html/);
  assert.match(check.stderr, /orpheline/);

  assertGeneratorSuccess(runGenerator());
  assert.equal(existsSync(orphanPath), false);
  assertGeneratorSuccess(runGenerator("--check"));
});

test("le slug index est réservé au catalogue", () => {
  const catalogPath = path.join(fixtureRoot, "data", "projects.json");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  catalog.projects[0].slug = "index";
  writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

  const result = runGenerator();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /slug index est réservé/);
});

test("le compteur du hero suit le nombre de projets mis en avant", () => {
  const catalogPath = path.join(fixtureRoot, "data", "projects.json");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  const featured = catalog.projects.filter((project) => project.featured);
  assert.ok(
    featured.length >= 2,
    "le fixture doit contenir au moins deux projets featured",
  );

  const project = featured.at(-1);
  project.featured = false;
  delete project.featuredOrder;
  writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

  assertGeneratorSuccess(runGenerator());

  const expectedCount = featured.length - 1;
  const expectedLabel = expectedCount === 1 ? "étude de cas" : "études de cas";
  const index = readFileSync(path.join(fixtureRoot, "index.html"), "utf8");
  assert.ok(
    index.includes(
      `<dd data-featured-project-count>${expectedCount} ${expectedLabel}, CV, GitHub et projets documentés</dd>`,
    ),
  );
  assertGeneratorSuccess(runGenerator("--check"));
});

test("une étude de cas professionnelle est obligatoire", () => {
  const catalogPath = path.join(fixtureRoot, "data", "projects.json");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  delete catalog.projects[0].caseStudy;
  writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

  const result = runGenerator();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /caseStudy/);
});

test("les sections professionnelles sont générées sur les pages projet", () => {
  assertGeneratorSuccess(runGenerator());

  const catalog = JSON.parse(
    readFileSync(path.join(fixtureRoot, "data", "projects.json"), "utf8"),
  );
  const html = readFileSync(
    path.join(fixtureRoot, "projets", `${catalog.projects[0].slug}.html`),
    "utf8",
  );

  for (const label of [
    "Mon rôle",
    "Comment le système est structuré",
    "Décisions techniques",
    "Difficultés résolues",
    "Tests et garde-fous",
    "Livraison et CI/CD",
    "Résultats observables",
    "Compromis techniques",
    "Limites assumées",
    "Prochaines étapes",
  ]) {
    assert.ok(html.includes(label), `section absente: ${label}`);
  }
});

function copyFixturePath(relativePath) {
  const source = path.join(repoRoot, relativePath);
  const destination = path.join(fixtureRoot, relativePath);
  mkdirSync(path.dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true });
}

function runGenerator(...args) {
  return spawnSync(
    process.execPath,
    ["scripts/generate-projects.mjs", ...args],
    {
      cwd: fixtureRoot,
      encoding: "utf8",
    },
  );
}

function assertGeneratorSuccess(result) {
  assert.equal(
    result.status,
    0,
    `generator failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
}
