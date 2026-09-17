import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const home = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const catalogPage = readFileSync(
  new URL("../../projets/index.html", import.meta.url),
  "utf8",
);
const catalog = JSON.parse(
  readFileSync(new URL("../../data/projects.json", import.meta.url), "utf8"),
);
const publishedProjects = catalog.projects.filter(
  (project) => project.published,
);
const projectPages = publishedProjects.map((project) =>
  readFileSync(
    new URL(`../../projets/${project.slug}.html`, import.meta.url),
    "utf8",
  ),
);
const globalStyles = readFileSync(
  new URL("../../assets/css/styles.css", import.meta.url),
  "utf8",
);
const aiRedesignStyles = readFileSync(
  new URL("../../assets/css/ai-redesign.css", import.meta.url),
  "utf8",
);
const mainScript = readFileSync(
  new URL("../../assets/js/main.js", import.meta.url),
  "utf8",
);
const runtimeSources = [globalStyles, aiRedesignStyles, mainScript].join("\n");

// The public CV PDF is intentionally excluded from this content contract while it
// remains a placeholder. This suite validates the site copy and project source data.
const publicHtml = [home, catalogPage, ...projectPages].join("\n");

const forbiddenPublicCopy = [
  ["ancienne cible B2D", /\bB2D\b/iu],
  ["ancienne rubrique Preuve", />\s*Preuves?\s*</iu],
  ["ancienne rubrique Démonstration", />\s*Démonstration\s*</iu],
  ["ancienne formulation auto-évaluative", /ce que ce projet démontre/iu],
  ["ancienne promesse orientée preuves", /orienté(?:e)?s?\s+preuves/iu],
];

const removedGenericSkills = [
  "TypeScript",
  "React",
  "Angular",
  "Vue.js",
  "Svelte",
  "Swing",
  "Kotlin",
  "Flutter",
  "FastAPI",
  "Flask",
  "GraphQL",
  "MongoDB",
  "Python",
  "C++",
  "Rust",
  "Bash",
  "PowerShell",
  "Ollama",
  "vLLM",
  "LM Studio",
  "Kubernetes",
  "Gradle",
  "Linux",
  "SSH",
  "SFTP",
  "Jira",
  "Trello",
  "Notion",
];

test("le positionnement public et la recherche d’alternance restent alignés", () => {
  assert.match(
    home,
    /<h1 id="hero-title">Concepteur-développeur full-stack<\/h1>/u,
  );
  assert.match(
    home,
    /Métropole de Rouen[^<]+alternance d’un an à partir d’octobre 2026\./u,
  );
  assert.doesNotMatch(home, /Développeur et concepteur d'applications/iu);
});

test("la copie publique ne réintroduit pas les formulations retirées", () => {
  for (const [label, pattern] of forbiddenPublicCopy) {
    assert.doesNotMatch(publicHtml, pattern, label);
  }
});

test("les projets publiés respectent le même contrat éditorial à la source", () => {
  for (const project of publishedProjects) {
    const sourceCopy = collectStrings(project).join("\n");
    for (const [label, pattern] of forbiddenPublicCopy) {
      assert.doesNotMatch(sourceCopy, pattern, `${project.slug}: ${label}`);
    }
  }
});

test("la page d’accueil suit l’architecture d’information P2.1", () => {
  const sectionIds = [
    ...home.matchAll(/<section id="([^"]+)"[^>]*data-section/gu),
  ].map((match) => match[1]);

  assert.deepEqual(sectionIds, [
    "accueil",
    "projets",
    "competences",
    "experience",
    "formation",
    "apropos",
    "contact",
  ]);
  assert.doesNotMatch(home, /id="(?:valeur|methode|parcours)"/u);
  assert.doesNotMatch(home, /data-section-arrows/u);
});

test("le site public utilise un thème sombre unique", () => {
  for (const html of [home, catalogPage, ...projectPages]) {
    assert.match(html, /<meta name="color-scheme" content="dark">/u);
    assert.doesNotMatch(html, /data-theme(?:=|-toggle)/u);
  }

  assert.match(globalStyles, /color-scheme:\s*dark;/u);
  assert.doesNotMatch(
    runtimeSources,
    /initTheme|data-theme-toggle|prefers-color-scheme:\s*light|:root\[data-theme=|localStorage\.(?:getItem|setItem)\(["']theme["']/u,
  );
});

test("le design system conserve un bloc racine canonique", () => {
  const rootBlocks = globalStyles.match(/(?:^|\n)\s*:root\s*\{/gu) ?? [];

  assert.equal(
    rootBlocks.length,
    1,
    "styles.css doit conserver un seul bloc :root global",
  );

  const requiredTokens = [
    "bg",
    "bg-elevated",
    "surface",
    "surface-2",
    "text",
    "muted",
    "border",
    "accent",
    "text-meta",
    "text-ui",
    "text-body",
    "space-1",
    "space-10",
    "radius-xs",
    "radius-sm",
    "radius-md",
    "radius-lg",
    "radius-xl",
    "shadow-sm",
    "shadow-md",
    "shadow-lg",
    "frame-max",
    "content-max",
    "reading-max",
    "wide-reading-max",
    "gutter",
    "section-space",
    "focus-outline-width",
    "focus-outline-offset",
    "project-accent",
    "project-pattern-image",
  ];

  for (const token of requiredTokens) {
    assert.match(
      globalStyles,
      new RegExp(`--${token}:`, "u"),
      `token global manquant : --${token}`,
    );
  }
});

test("la section compétences reste resserrée sur la sélection validée", () => {
  const skills = extractSection(home, "competences", "experience");

  assert.match(skills, /Compétences techniques principales/u);
  assert.match(skills, /Java \/ Spring/u);
  assert.match(skills, /C# \/ \.NET/u);
  assert.match(skills, /IA locale & média/u);

  for (const technology of removedGenericSkills) {
    assert.equal(
      skills.includes(technology),
      false,
      `${technology} ne doit pas redevenir une compétence générique sans réévaluation explicite`,
    );
  }
});

test("Familink reste décrit comme une expérience contextualisée", () => {
  const experience = extractFamilinkEntry(home);

  assert.match(experience, /Python\/Django\/ReportLab/u);
  assert.match(experience, /Android Java/u);
  assert.match(experience, /Linux\/Raspberry Pi/u);
  assert.match(experience, /\bB2B\b/u);
  assert.match(experience, /autonomie croissante/u);
  assert.doesNotMatch(experience, /\bB2D\b/u);
});

test("le numéro de téléphone ne réapparaît pas dans le site hors CV placeholder", () => {
  assert.doesNotMatch(publicHtml, /07[ .-]*45[ .-]*26[ .-]*81[ .-]*82/u);
});

function extractSection(html, id, nextId) {
  const start = html.indexOf(`<section id="${id}"`);
  const end = html.indexOf(`<section id="${nextId}"`, start + 1);

  assert.notEqual(start, -1, `section #${id} introuvable`);
  assert.notEqual(end, -1, `borne suivante #${nextId} introuvable`);

  return html.slice(start, end);
}

function extractFamilinkEntry(html) {
  const match = html.match(
    /<article class="timeline-item" data-reveal><span>2023 - 2025<\/span><div><h3>Familink[^<]*<\/h3><p>(.*?)<\/p><\/div><\/article>/u,
  );

  assert.ok(match, "entrée Familink introuvable dans le parcours");
  return match[1];
}

function collectStrings(value) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}
