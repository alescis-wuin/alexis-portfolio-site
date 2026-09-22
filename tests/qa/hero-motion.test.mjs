import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

const cssPath = fileURLToPath(
  new URL("../../assets/css/ai-redesign.css", import.meta.url),
);
const jsPath = fileURLToPath(
  new URL("../../assets/js/main.js", import.meta.url),
);
const capturePath = fileURLToPath(
  new URL("../visual/capture.spec.mjs", import.meta.url),
);
const css = fs.readFileSync(cssPath, "utf8");
const js = fs.readFileSync(jsPath, "utf8");
const capture = fs.readFileSync(capturePath, "utf8");

test("P2.3.4 ajoute un mouvement de flux CSS sans nouvelle dependance", () => {
  assert.match(css, /@keyframes\s+hero-system-flow\b/u);
  assert.match(css, /@keyframes\s+hero-system-signal\b/u);
  assert.match(
    css,
    /\.hero-system-link-secondary[\s\S]*animation:\s*hero-system-flow/u,
  );
  assert.doesNotMatch(js, /import\s+.+\s+from\s+["'][^"']+["']/u);
});

test("P2.3.4 limite le parallaxe aux pointeurs fins", () => {
  assert.match(js, /function\s+initHeroMotion\s*\(/u);
  assert.match(js, /matchMedia\(["']\(pointer:\s*fine\)["']\)/u);
  assert.match(js, /visual\.dataset\.heroMotion\s*=\s*["']interactive["']/u);
  assert.match(js, /requestAnimationFrame\(writeMotion\)/u);
  assert.match(js, /pointerleave/u);
});

test("P2.3.4 conserve un etat statique complet en reduced motion", () => {
  assert.match(js, /if\s*\(!visual\s*\|\|\s*prefersReducedMotion\)\s*return;/u);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/u);
  assert.match(
    css,
    /\.hero-system-link-secondary,[\s\S]*\.hero-system-node::before\s*\{\s*animation:\s*none;/u,
  );
  assert.match(css, /\.hero-profile-card\s*\{\s*transform:\s*none;/u);
});

test("la QA visuelle fige P2.3.4 en reduced motion", () => {
  assert.match(
    capture,
    /page\.emulateMedia\(\{\s*colorScheme:\s*["']dark["'],\s*reducedMotion:\s*["']reduce["']\s*\}\)/u,
  );
});
