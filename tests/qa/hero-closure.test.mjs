import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync(
  new URL("../../index.html", import.meta.url),
  "utf8",
);

const heroStart = html.search(/<section\b[^>]*\bid=["']accueil["'][^>]*>/iu);
assert.notEqual(heroStart, -1, "La section #accueil doit exister.");
const heroEnd = html.indexOf("</section>", heroStart);
assert.notEqual(heroEnd, -1, "La fin de la section #accueil doit exister.");
const hero = html.slice(heroStart, heroEnd + "</section>".length);
const heroText = hero
  .replace(/<[^>]+>/gu, " ")
  .replace(/\s+/gu, " ")
  .trim();

const visualStart = hero.search(/<div\b[^>]*\bdata-hero-visual\b[^>]*>/iu);
assert.notEqual(visualStart, -1, "Le panneau visuel du Hero doit exister.");
const visual = hero.slice(visualStart);

test("P2.3.6 verrouille le contrat editorial final du Hero", () => {
  for (const text of [
    "Alexis Guinot · Développement applicatif",
    "Concepteur-développeur full-stack",
    "Je conçois et développe des applications web et desktop en Java / Spring et C# / .NET, avec une attention particulière portée à l’architecture logicielle, aux données, aux tests et à la maintenabilité.",
    "Je recherche une entreprise d’accueil dans la Métropole de Rouen pour une alternance d’un an à partir d’octobre 2026.",
    "Voir les projets",
    "Découvrir mon profil",
    "Stacks principales Java / Spring · C# / .NET",
    "Approche Architecture logicielle, API, données et tests",
    "Formation Bac+2 obtenu · Bachelor CDA visé",
  ]) {
    assert.ok(heroText.includes(text), `Texte Hero manquant: ${text}`);
  }

  assert.doesNotMatch(heroText, /\barchitecte logiciel\b/iu);
  assert.doesNotMatch(hero, /data-featured-project-count/u);
});

test("P2.3.6 garde le panneau visuel hors de l'ordre clavier", () => {
  assert.doesNotMatch(visual, /<a\b[^>]*\bhref\s*=/iu);
  assert.doesNotMatch(visual, /<button\b/iu);
  assert.doesNotMatch(visual, /<(?:input|select|textarea)\b/iu);
  assert.doesNotMatch(
    visual,
    /\bcontenteditable\s*=\s*["']?(?:true|plaintext-only)/iu,
  );
  assert.doesNotMatch(visual, /\btabindex\s*=\s*["']?(?:0|[1-9]\d*)/iu);
});

test("P2.3.6 conserve un seul titre principal et les hooks Hero stables", () => {
  assert.equal((hero.match(/<h1\b/gu) ?? []).length, 1);

  for (const hook of [
    "data-hero",
    "data-hero-copy",
    "data-hero-kicker",
    "data-hero-title",
    "data-hero-summary",
    "data-hero-availability",
    "data-hero-actions",
    "data-hero-facts",
    "data-hero-visual",
    "data-hero-system",
    "data-hero-profile",
  ]) {
    assert.equal(
      (hero.match(new RegExp(`\\b${hook}(?:\\s|>|=)`, "gu")) ?? []).length,
      1,
      `${hook} doit rester unique dans le Hero.`,
    );
  }
});
