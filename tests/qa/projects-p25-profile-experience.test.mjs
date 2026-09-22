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
const visualDoc = readFileSync(
  new URL("../../docs/VISUAL_QA.md", import.meta.url),
  "utf8",
);

const experience = extractSection(home, "experience", "formation");
const lead = extractArticle(experience, "data-experience-lead");
const secondary = extractArticle(experience, "data-experience-secondary");

test("P2.5-B donne a Familink une hierarchie d experience principale", () => {
  assert.match(experience, /data-profile-section="experience"/u);
  assert.equal((experience.match(/data-experience-lead/gu) ?? []).length, 1);
  assert.equal(
    (experience.match(/data-experience-secondary/gu) ?? []).length,
    1,
  );
  assert.match(lead, /<h3>Familink<\/h3>/u);
  assert.match(lead, /Expérience principale · alternance/u);
  assert.match(lead, /Développeur informatique et électronicien/u);
  assert.match(lead, /2023 - 2025/u);
});

test("P2.5-B conserve uniquement des faits Familink deja publies et verifiables", () => {
  assert.match(lead, /Android Java/u);
  assert.match(lead, /Python\/Django\/ReportLab/u);
  assert.match(lead, /Linux\/Raspberry Pi/u);
  assert.match(lead, /matériel et électronique/u);
  assert.match(lead, /cadres photo\/vidéo connectés/iu);
  assert.match(lead, /boîtier TV connecté/iu);
  assert.match(lead, /\bB2B\b/u);
  assert.match(lead, /Intégration des avatars/u);
  assert.match(lead, /améliorations et\s+corrections de l’application/u);
  assert.match(lead, /autonomie\s+croissante/u);
  assert.doesNotMatch(lead, /\b\d+(?:[.,]\d+)?\s*%/u);
  assert.doesNotMatch(
    lead,
    /\b(?:utilisateurs|clients|revenus|conversion)\b/iu,
  );
});

test("P2.5-B garde la Caisse d Epargne comme experience secondaire compacte", () => {
  assert.match(secondary, /Caisse d’Épargne Normandie/u);
  assert.match(secondary, /Stage de découverte/u);
  assert.match(secondary, /Immersion courte/u);
  assert.match(secondary, /gestion de projet/u);
  assert.match(secondary, /organisation/u);
  assert.match(secondary, /management/u);
  assert.match(secondary, /fonctionnement d’équipe/u);
  assert.doesNotMatch(secondary, /Android|Django|Raspberry|B2B/u);
});

test("P2.5-B impose une hierarchie visuelle responsive sans contenu interactif cache", () => {
  assert.match(styles, /\.experience-layout\s*\{/u);
  assert.match(styles, /\.experience-card-primary\s*\{[\s\S]*?border-color:/u);
  assert.match(styles, /\.experience-facts\s*>\s*div\s*\{/u);
  assert.match(
    styles,
    /@media \(max-width: 780px\)[\s\S]*?\.experience-layout\s*\{[\s\S]*?grid-template-columns:\s*1fr;/u,
  );
  assert.doesNotMatch(experience, /\bonmouseover\s*=/iu);
  assert.doesNotMatch(experience, /\bonmouseenter\s*=/iu);
});

test("P2.5-B documente le contrat editorial et la nouvelle matrice visuelle", () => {
  assert.match(profileDoc, /P2\.5-B — contrat de l’expérience/u);
  assert.match(profileDoc, /Familink — expérience principale/u);
  assert.match(profileDoc, /Caisse d’Épargne — expérience secondaire/u);
  assert.match(profileDoc, /65 à 69 captures/u);
  assert.match(visualDoc, /home-experience/u);
  assert.match(visualDoc, /69 captures/u);
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

function extractArticle(section, marker) {
  const markerIndex = section.indexOf(marker);
  assert.notEqual(markerIndex, -1, `${marker} introuvable`);

  const start = section.lastIndexOf("<article", markerIndex);
  const end = section.indexOf("</article>", markerIndex);
  assert.ok(start >= 0 && end > start, `article incomplet pour ${marker}`);

  return section.slice(start, end + "</article>".length);
}
