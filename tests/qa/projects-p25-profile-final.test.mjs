import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  visualCaptureCount,
  visualProfiles,
  visualScenes,
} from "../visual/visual-cases.mjs";

const home = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const styles = readFileSync(
  new URL("../../assets/css/styles.css", import.meta.url),
  "utf8",
);
const profileDoc = readFileSync(
  new URL("../../docs/P2.5_PROFILE.md", import.meta.url),
  "utf8",
);
const finalDoc = readFileSync(
  new URL("../../docs/P2.5_FINAL_QA.md", import.meta.url),
  "utf8",
);
const finalE2e = readFileSync(
  new URL("../e2e/profile-final-qa.spec.mjs", import.meta.url),
  "utf8",
);

const sectionOrder = ["skills", "experience", "formation", "method", "contact"];

function cssHexVariable(name) {
  const match = styles.match(
    new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`),
  );
  assert.ok(match, `variable CSS hex introuvable: --${name}`);
  return match[1];
}

function relativeLuminance(hex) {
  const channels = [1, 3, 5].map(
    (offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255,
  );
  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(first, second) {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

test("P2.5-E verrouille l ordre des cinq sections profil", () => {
  const offsets = sectionOrder.map((id) => {
    const marker = `data-profile-section="${id}"`;
    const offset = home.indexOf(marker);
    assert.notEqual(offset, -1, `section manquante: ${id}`);
    return offset;
  });

  assert.deepEqual(
    [...offsets].sort((a, b) => a - b),
    offsets,
  );

  for (const [id, heading] of [
    ["skills", "skills-title"],
    ["experience", "experience-title"],
    ["formation", "formation-title"],
    ["method", "about-title"],
    ["contact", "contact-title"],
  ]) {
    assert.match(
      home,
      new RegExp(
        `aria-labelledby="${heading}"[\\s\\S]{0,300}data-profile-section="${id}"`,
      ),
    );
    assert.match(home, new RegExp(`<h2 id="${heading}">`));
  }
});

test("P2.5-E conserve les garde-fous focus, cible et reduced motion", () => {
  assert.match(styles, /--focus-outline-width:\s*3px/);
  assert.match(styles, /a:focus-visible,/);
  assert.match(
    styles,
    /outline:\s*var\(--focus-outline-width\) solid var\(--accent\)/,
  );
  assert.match(
    styles,
    /\.contact-email-link\s*\{[\s\S]*?min-height:\s*2\.75rem/,
  );
  assert.match(
    styles,
    /\.contact-resource-link\s*\{[\s\S]*?min-height:\s*2\.75rem/,
  );
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /animation-duration:\s*0\.01ms !important/);
  assert.match(styles, /transition-duration:\s*0\.01ms !important/);
});

test("P2.5-E maintient le contraste AA des tokens structurants", () => {
  const backgroundTokens = ["bg", "surface"];
  const foregroundTokens = [
    "text",
    "muted",
    "muted-2",
    "accent",
    "accent-2",
    "accent-3",
  ];

  for (const backgroundToken of backgroundTokens) {
    const background = cssHexVariable(backgroundToken);
    for (const foregroundToken of foregroundTokens) {
      const foreground = cssHexVariable(foregroundToken);
      assert.ok(
        contrastRatio(foreground, background) >= 4.5,
        `${foregroundToken}/${backgroundToken} sous 4.5:1`,
      );
    }
  }

  assert.ok(
    contrastRatio(
      cssHexVariable("accent-contrast"),
      cssHexVariable("accent"),
    ) >= 4.5,
    "accent-contrast/accent sous 4.5:1",
  );
});

test("P2.5-E etend chaque scene profil a toute la matrice visuelle", () => {
  const profileIds = visualProfiles.map((profile) => profile.id);

  for (const [id, focus] of [
    ["home-skills", '[data-profile-section="skills"]'],
    ["home-experience", '[data-profile-section="experience"]'],
    ["home-formation", '[data-profile-section="formation"]'],
    ["home-method", '[data-profile-section="method"]'],
    ["home-contact", '[data-profile-section="contact"]'],
  ]) {
    const scene = visualScenes.find((candidate) => candidate.id === id);
    assert.ok(scene, `scene manquante: ${id}`);
    assert.equal(scene.path, "/");
    assert.equal(scene.focus, focus);
    assert.deepEqual(scene.profiles, profileIds);
  }

  assert.equal(visualCaptureCount(), 101);
});

test("P2.5-E documente et automatise la cloture de P2.5", () => {
  assert.match(profileDoc, /P2\.5-E — clôture QA/);
  assert.match(profileDoc, /\*\*Statut de phase : clôturée\*\*/);
  assert.match(finalDoc, /320x720/);
  assert.match(finalDoc, /3840x2160/);
  assert.match(finalDoc, /101\/101/);
  assert.match(finalDoc, /npm run check:strict/);
  assert.match(finalDoc, /git diff --check/);

  assert.match(finalE2e, /finalProfiles/);
  assert.match(finalE2e, /boundedProfileBlocks/);
  assert.match(finalE2e, /toBeGreaterThanOrEqual\(44\)/);
  assert.match(finalE2e, /reducedMotion:\s*"reduce"/);
});
