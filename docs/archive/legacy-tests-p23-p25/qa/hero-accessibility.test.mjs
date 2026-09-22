import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync(
  new URL("../../index.html", import.meta.url),
  "utf8",
);
const css = fs.readFileSync(
  new URL("../../assets/css/ai-redesign.css", import.meta.url),
  "utf8",
);

test("P2.3.5 evite un landmark duplique dans le visuel du Hero", () => {
  assert.match(html, /<div class="hero-card" data-reveal data-hero-visual>/u);
  assert.doesNotMatch(
    html,
    /<aside[^>]*data-hero-visual/u,
    "Le panneau visuel ne doit pas creer un landmark complementaire redondant.",
  );
  assert.match(
    html,
    /<div class="hero-system" data-hero-system aria-hidden="true">/u,
  );
  assert.match(html, /<div class="profile-panel" aria-hidden="true">/u);
  assert.match(html, /alt="Portrait professionnel d’Alexis Guinot"/u);
});

test("P2.3.5 simplifie le module avant de compresser son contenu", () => {
  assert.match(css, /@media \(min-width: 981px\) and \(max-width: 1100px\)/u);
  assert.match(
    css,
    /\.hero-system-heading,[\s\S]*\.hero-system-name,[\s\S]*\.hero-profile-card \.status-line\s*\{\s*display:\s*none;/u,
  );
  assert.match(
    css,
    /@media \(max-width: 680px\)[\s\S]*#accueil \.hero-system\s*\{\s*display:\s*none;/u,
  );
});

test("P2.3.5 conserve des cibles Hero d'au moins 44px", () => {
  const matches = css.match(
    /#accueil \.hero-actions \.button\s*\{[\s\S]*?min-height:\s*2\.75rem;/gu,
  );
  assert.ok(matches);
  assert.equal(matches.length, 2);
});
