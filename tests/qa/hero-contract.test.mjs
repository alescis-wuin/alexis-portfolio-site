import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

const indexPath = fileURLToPath(new URL("../../index.html", import.meta.url));
const html = fs.readFileSync(indexPath, "utf8");
const heroStart = html.search(/<section\b[^>]*\bid=["']accueil["'][^>]*>/iu);
assert.notEqual(heroStart, -1, "La section #accueil doit exister.");
const heroEnd = html.indexOf("</section>", heroStart);
assert.notEqual(heroEnd, -1, "La fin de la section #accueil doit exister.");
const hero = html.slice(heroStart, heroEnd + "</section>".length);

test("le hero expose le positionnement professionnel valide", () => {
  assert.match(
    hero,
    /<h1[^>]*data-hero-title[^>]*>\s*Concepteur-d\u00e9veloppeur full-stack\s*<\/h1>/u,
  );
  assert.match(hero, /Alexis Guinot/u);
  assert.match(hero, /Java\s*\/\s*Spring/u);
  assert.match(hero, /C#\s*\/\s*\.NET/u);
  assert.match(hero, /architecture logicielle/iu);
  assert.match(hero, /M\u00e9tropole de Rouen/u);
  assert.match(hero, /octobre 2026/u);
  assert.doesNotMatch(hero, /\barchitecte logiciel\b/iu);
  assert.doesNotMatch(
    hero,
    /data-featured-project-count/u,
    "Le compteur de projets n'est plus duplique dans le hero P2.3.",
  );
});

test("le hero possede des points d'ancrage stables pour le redesign", () => {
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
  ]) {
    assert.match(
      hero,
      new RegExp(`\\b${hook}(?:\\s|>|=)`, "u"),
      `${hook} doit etre present dans le hero.`,
    );
  }
});

test("le hero expose le module technique statique P2.3.3", () => {
  for (const hook of ["data-hero-system", "data-hero-profile"]) {
    assert.match(
      hero,
      new RegExp(`\\b${hook}(?:\\s|>|=)`, "u"),
      `${hook} doit etre present dans le hero.`,
    );
  }

  const systemNodes = [
    ...hero.matchAll(/\bdata-hero-system-node=["']([^"']+)["']/gu),
  ]
    .map((match) => match[1])
    .sort();

  assert.deepEqual(systemNodes, ["api", "data", "interface", "quality"]);
  assert.match(
    hero,
    /<div[^>]*class=["'][^"']*hero-system[^"']*["'][^>]*aria-hidden=["']true["'][^>]*>/u,
    "Le schema applicatif doit rester decoratif pour les technologies d'assistance.",
  );
});

test("les actions du hero restent explicites", () => {
  assert.ok(
    hero.includes('href="#projets"'),
    "Le hero doit contenir un lien vers #projets.",
  );
  assert.match(
    hero,
    /Voir les projets/u,
    "Le hero doit exposer le libellé Voir les projets.",
  );

  assert.ok(
    hero.includes('href="#apropos"'),
    "Le hero doit contenir un lien vers #apropos.",
  );
  assert.match(
    hero,
    /Découvrir mon profil/u,
    "Le hero doit exposer le libellé Découvrir mon profil.",
  );
});
