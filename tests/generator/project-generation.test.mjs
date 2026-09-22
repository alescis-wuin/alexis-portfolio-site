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

test("le résumé de la section projets suit le nombre de projets mis en avant", () => {
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
  writeFileSync(
    catalogPath,
    `${JSON.stringify(catalog, null, 2)}
`,
    "utf8",
  );

  assertGeneratorSuccess(runGenerator());

  const expectedCount = featured.length - 1;
  const expectedHeading =
    expectedCount === 1
      ? "1 étude de cas technique"
      : `${expectedCount} études de cas techniques`;
  const index = readFileSync(path.join(fixtureRoot, "index.html"), "utf8");

  assert.ok(
    index.includes(`<p>${expectedHeading} :`) ||
      index.includes(`<h2 id="projects-title">${expectedHeading}</h2>`),
    `titre projets inattendu: ${expectedHeading}`,
  );
  assert.ok(!index.includes("data-featured-project-count"));
  assertGeneratorSuccess(runGenerator("--check"));
});

test("les cartes respectent la hiérarchie de titres selon leur surface", () => {
  assertGeneratorSuccess(runGenerator());

  const catalogHtml = readFileSync(
    path.join(fixtureRoot, "projets", "index.html"),
    "utf8",
  );
  const homeHtml = readFileSync(path.join(fixtureRoot, "index.html"), "utf8");

  const catalogHeadings = [
    ...catalogHtml.matchAll(
      /<div class="project-heading">[\s\S]*?<(h[23])><a href=/gu,
    ),
  ].map((match) => match[1]);
  const homeHeadings = [
    ...homeHtml.matchAll(
      /<div class="project-heading">[\s\S]*?<(h[23])><a href=/gu,
    ),
  ].map((match) => match[1]);

  assert.ok(catalogHeadings.length > 0);
  assert.ok(homeHeadings.length > 0);
  assert.ok(catalogHeadings.every((heading) => heading === "h2"));
  assert.ok(homeHeadings.every((heading) => heading === "h3"));
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

  const labelAlternatives = [
    ["Mon rôle"],
    ["Les pièces du système", "Comment le système est structuré"],
    ["Décisions techniques"],
    ["Difficultés résolues"],
    ["Tests et garde-fous"],
    ["Livraison et CI/CD"],
    ["Résultats observables"],
    ["Compromis techniques"],
    ["Les limites actuelles", "Limites assumées"],
    ["Prochaines étapes"],
  ];
  for (const alternatives of labelAlternatives) {
    assert.ok(
      alternatives.some((label) => html.includes(label)),
      `section absente: ${alternatives.join(" / ")}`,
    );
  }
});

test("la politique de publication est obligatoire", () => {
  const catalogPath = path.join(fixtureRoot, "data", "projects.json");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  delete catalog.projects[0].published;
  writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

  const result = runGenerator();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /published doit être un booléen/);
});

test("un projet non publié reste hors de toutes les sorties publiques", () => {
  const catalog = JSON.parse(
    readFileSync(path.join(fixtureRoot, "data", "projects.json"), "utf8"),
  );
  const hidden = catalog.projects.find((project) => !project.published);
  assert.ok(hidden, "le fixture doit contenir un projet non publié");

  assertGeneratorSuccess(runGenerator());

  const hiddenPage = path.join(fixtureRoot, "projets", `${hidden.slug}.html`);
  assert.equal(existsSync(hiddenPage), false);

  const catalogHtml = readFileSync(
    path.join(fixtureRoot, "projets", "index.html"),
    "utf8",
  );
  const homeHtml = readFileSync(path.join(fixtureRoot, "index.html"), "utf8");
  const sitemap = readFileSync(path.join(fixtureRoot, "sitemap.xml"), "utf8");

  assert.ok(!catalogHtml.includes(`data-project-slug="${hidden.slug}"`));
  assert.ok(!homeHtml.includes(`data-project-slug="${hidden.slug}"`));
  assert.ok(!sitemap.includes(`/projets/${hidden.slug}.html`));
});

test("le schéma média v5 est obligatoire", () => {
  const catalogPath = path.join(fixtureRoot, "data", "projects.json");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  catalog.schemaVersion = 4;
  writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

  const result = runGenerator();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /schemaVersion doit valoir 5/);
});

test("le hero et l'architecture imposent leur type de média", () => {
  const catalogPath = path.join(fixtureRoot, "data", "projects.json");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  const published = catalog.projects.find((project) => project.published);
  assert.ok(published);

  published.visuals.hero.kind = "diagram";
  writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

  let result = runGenerator();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /visuals\.hero\.kind doit valoir screenshot/);

  published.visuals.hero.kind = "screenshot";
  published.visuals.architecture.kind = "screenshot";
  writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

  result = runGenerator();
  assert.notEqual(result.status, 0);
  assert.match(
    result.stderr,
    /visuals\.architecture\.kind doit valoir diagram/,
  );
});

test("le type de média détermine son extension", () => {
  const catalogPath = path.join(fixtureRoot, "data", "projects.json");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  const published = catalog.projects.find((project) => project.published);
  assert.ok(published);

  published.visuals.gallery[0].kind = "diagram";
  writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

  const result = runGenerator();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /doit utiliser \.svg pour kind=diagram/);
});

test("les visuels sont obligatoires pour les projets publiés", () => {
  const catalogPath = path.join(fixtureRoot, "data", "projects.json");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  const published = catalog.projects.find((project) => project.published);
  assert.ok(published);
  delete published.visuals;
  writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

  const result = runGenerator();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /visuals doit être un objet/);
});

test("les chemins visuels restent confinés au projet", () => {
  const catalogPath = path.join(fixtureRoot, "data", "projects.json");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  const published = catalog.projects.find((project) => project.published);
  assert.ok(published);
  published.visuals.hero.src = "assets/img/projects/autre/hero.webp";
  writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

  const result = runGenerator();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /doit rester sous assets\/img\/projects/);
});

test("les cartes projet utilisent le hero produit et des actions explicites", () => {
  assertGeneratorSuccess(runGenerator());

  const catalog = JSON.parse(
    readFileSync(path.join(fixtureRoot, "data", "projects.json"), "utf8"),
  );
  const published = catalog.projects.filter((project) => project.published);
  const catalogHtml = readFileSync(
    path.join(fixtureRoot, "projets", "index.html"),
    "utf8",
  );

  for (const project of published) {
    assert.ok(
      catalogHtml.includes(`../${project.visuals.hero.src}`),
      `hero absent de la carte ${project.slug}`,
    );
    assert.ok(
      catalogHtml.includes(
        `data-media-kind="${project.visuals.hero.kind}" aria-label="Lire l’étude de cas ${project.name}"`,
      ),
      `type média absent de la carte ${project.slug}`,
    );
    assert.ok(
      catalogHtml.includes(
        `aria-label="Voir le dépôt GitHub de ${project.name}"`,
      ),
      `CTA GitHub absent pour ${project.slug}`,
    );
  }

  assert.ok(catalogHtml.includes('class="project-kicker"'));
  assert.ok(catalogHtml.includes('class="project-stack"'));
  assert.ok(
    catalogHtml.includes('class="project-metadata-label">Technologies'),
  );
  assert.ok(catalogHtml.includes('class="project-repository-link"'));
});

test("le hero éditorial expose objectif et points clés", () => {
  assertGeneratorSuccess(runGenerator());

  const catalog = JSON.parse(
    readFileSync(path.join(fixtureRoot, "data", "projects.json"), "utf8"),
  );
  const published = catalog.projects.find((project) => project.published);
  assert.ok(published);

  const html = readFileSync(
    path.join(fixtureRoot, "projets", `${published.slug}.html`),
    "utf8",
  );

  assert.ok(html.includes("data-project-overview"));
  assert.ok(html.includes("<dt>Objectif</dt>"));
  assert.ok(html.includes("<dt>Points clés</dt>"));
  assert.ok(!html.includes("<dt>Démonstration</dt>"));
  assert.ok(html.includes(published.mission));
  assert.ok(html.includes(published.proof));
  assert.ok(html.includes(`<p class="hero-lead">${published.summary}</p>`));
  assert.ok(html.includes('class="project-back-link"'));
  assert.ok(html.includes("Retour aux autres projets"));
  assert.ok(!html.includes('class="breadcrumb"'));
  assert.ok(html.includes('class="project-metadata-label">Domaines'));
});

test("les pages projet génèrent hero, architecture et galerie depuis visuals", () => {
  assertGeneratorSuccess(runGenerator());

  const catalog = JSON.parse(
    readFileSync(path.join(fixtureRoot, "data", "projects.json"), "utf8"),
  );
  const published = catalog.projects.find((project) => project.published);
  assert.ok(published);

  const html = readFileSync(
    path.join(fixtureRoot, "projets", `${published.slug}.html`),
    "utf8",
  );

  assert.ok(html.includes(`<body data-project-slug="${published.slug}">`));
  assert.ok(html.includes("data-project-hero"));
  assert.ok(html.includes("data-project-architecture"));
  assert.ok(html.includes("data-project-gallery"));
  assert.ok(html.includes(`../${published.visuals.hero.src}`));
  assert.ok(
    html.includes(
      `data-project-hero data-media-kind="${published.visuals.hero.kind}"`,
    ),
  );
  assert.ok(html.includes(`../${published.visuals.architecture.src}`));
  assert.ok(
    html.includes(
      `data-project-architecture data-media-kind="${published.visuals.architecture.kind}"`,
    ),
  );
  for (const item of published.visuals.gallery) {
    assert.ok(html.includes(`../${item.src}`));
    assert.ok(html.includes(`data-media-kind="${item.kind}"`));
  }
});

test("P2.4-F rend chaque média comme lien de progressive enhancement", () => {
  assertGeneratorSuccess(runGenerator());

  const catalog = JSON.parse(
    readFileSync(path.join(fixtureRoot, "data", "projects.json"), "utf8"),
  );
  const published = catalog.projects.find((project) => project.published);
  assert.ok(published);

  const html = readFileSync(
    path.join(fixtureRoot, "projets", `${published.slug}.html`),
    "utf8",
  );
  const media = [
    published.visuals.hero,
    published.visuals.architecture,
    ...published.visuals.gallery,
  ];

  assert.equal(
    (html.match(/data-media-viewer-trigger/g) ?? []).length,
    media.length,
  );
  assert.equal(
    (html.match(/<dialog class="media-viewer" data-media-viewer/g) ?? [])
      .length,
    1,
  );
  assert.ok(html.includes("data-media-viewer-close"));
  assert.ok(html.includes("data-media-viewer-image"));

  for (const item of media) {
    assert.ok(
      html.includes(`href="../${item.src}" data-media-viewer-trigger`),
      `fallback direct absent: ${item.src}`,
    );
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
