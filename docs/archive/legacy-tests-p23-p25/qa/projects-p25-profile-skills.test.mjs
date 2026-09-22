import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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
const catalog = JSON.parse(
  readFileSync(new URL("../../data/projects.json", import.meta.url), "utf8"),
);

const skills = extractSection(home, "competences", "experience");
const publishedSlugs = new Set(
  catalog.projects
    .filter((project) => project.published)
    .map((project) => project.slug),
);

const expectedCapabilities = [
  "java",
  "dotnet",
  "web-data",
  "architecture-quality",
  "local-ai-media",
];

test("P2.5-A remplace la skill cloud par cinq capacites contextualisees", () => {
  assert.match(skills, /data-profile-section="skills"/u);
  assert.match(skills, /data-profile-capabilities/u);
  assert.equal((skills.match(/\bdata-capability="/gu) ?? []).length, 5);

  for (const capability of expectedCapabilities) {
    assert.match(
      skills,
      new RegExp(`data-capability="${capability}"`, "u"),
      `capacite manquante: ${capability}`,
    );
  }

  assert.equal(
    (skills.match(/capability-card-primary/gu) ?? []).length,
    2,
    "Java / Spring et C# / .NET doivent conserver la hierarchie principale",
  );
  assert.doesNotMatch(skills, /\bskills-grid\b/u);
  assert.doesNotMatch(skills, /\bskill-card\b/u);
});

test("P2.5-A conserve les poles techniques et ajoute leur contexte d usage", () => {
  assert.match(skills, /<h3>Java \/ Spring<\/h3>/u);
  assert.match(skills, /<h3>C# \/ \.NET<\/h3>/u);
  assert.match(skills, /Web, API & données/u);
  assert.match(skills, /Architecture & qualité/u);
  assert.match(skills, /IA locale & média/u);
  assert.ok((skills.match(/<dt>Contextes<\/dt>/gu) ?? []).length >= 5);
  assert.ok((skills.match(/capability-links/gu) ?? []).length >= 5);
});

test("P2.5-A relie les competences uniquement a des projets publics existants", () => {
  const hrefs = [...skills.matchAll(/href="projets\/([^"/]+)\.html"/gu)]
    .map((match) => match[1])
    .filter((slug) => slug !== "index");

  assert.ok(hrefs.length >= 10, "les preuves projet doivent rester explicites");

  for (const slug of hrefs) {
    assert.ok(publishedSlugs.has(slug), `projet non publie reference: ${slug}`);
    assert.equal(
      existsSync(new URL(`../../projets/${slug}.html`, import.meta.url)),
      true,
      `page projet manquante: ${slug}`,
    );
  }
});

test("P2.5-A ajoute une grille responsive sans contenu hover-only", () => {
  assert.match(styles, /\.capability-grid\s*\{/u);
  assert.match(styles, /grid-template-columns:\s*repeat\(6,/u);
  assert.match(
    styles,
    /@media \(max-width: 680px\)[\s\S]*?\.capability-grid,[\s\S]*?grid-template-columns:\s*1fr;/u,
  );
  assert.match(styles, /\.capability-links a\s*\{/u);
  assert.doesNotMatch(skills, /\bonmouseover\s*=/iu);
  assert.doesNotMatch(skills, /\bonmouseenter\s*=/iu);
});

test("P2.5-A documente le contrat et la suite de P2.5", () => {
  assert.match(profileDoc, /P2\.5-A — compétences contextualisées/u);
  assert.match(profileDoc, /P2\.5-B — expérience/u);
  assert.match(profileDoc, /P2\.5-C — formation & trajectoire/u);
  assert.match(profileDoc, /P2\.5-D — méthode & contact/u);
  assert.match(profileDoc, /P2\.5-E — clôture QA/u);
  assert.match(profileDoc, /SOURCE_DE_VERITE\.md/u);
});

function extractSection(html, id, nextId) {
  const startPattern = new RegExp(`<section[^>]*id="${id}"[^>]*>`, "u");
  const nextPattern = new RegExp(`<section[^>]*id="${nextId}"[^>]*>`, "u");

  const startMatch = startPattern.exec(html);
  assert.ok(startMatch, `section #${id} introuvable`);

  const tail = html.slice(startMatch.index + startMatch[0].length);
  const nextMatch = nextPattern.exec(tail);
  assert.ok(nextMatch, `borne suivante #${nextId} introuvable`);

  return html.slice(
    startMatch.index,
    startMatch.index + startMatch[0].length + nextMatch.index,
  );
}
