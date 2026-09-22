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

function extractSection(id, nextId) {
  const start = home.indexOf(`<section\n        id="${id}"`);
  const end = nextId
    ? home.indexOf(`<section\n        id="${nextId}"`, start)
    : home.indexOf("    </main>", start);

  assert.notEqual(start, -1, `section ${id} introuvable`);
  assert.notEqual(end, -1, `borne suivante de ${id} introuvable`);
  return home.slice(start, end);
}

test("P2.5-D expose quatre etapes de methode dans l ordre", () => {
  const method = extractSection("apropos", "contact");

  assert.match(method, /data-profile-section="method"/u);
  assert.equal((method.match(/data-method-step=/g) ?? []).length, 4);

  const positions = [
    'data-method-step="clarify"',
    'data-method-step="structure"',
    'data-method-step="prototype"',
    'data-method-step="verify"',
  ].map((marker) => method.indexOf(marker));

  assert.ok(positions.every((position) => position >= 0));
  assert.ok(
    positions.every(
      (position, index) => index === 0 || positions[index - 1] < position,
    ),
  );
  assert.match(method, /Clarifier/u);
  assert.match(method, /Structurer/u);
  assert.match(method, /Prototyper/u);
  assert.match(method, /Tester et documenter/u);
});

test("P2.5-D decrit la methode sans auto evaluation", () => {
  const method = extractSection("apropos", "contact");

  assert.match(method, /problème à résoudre/u);
  assert.match(method, /Séparer les responsabilités/u);
  assert.match(method, /Rendre les choix concrets/u);
  assert.match(method, /Rendre le résultat vérifiable/u);
  assert.doesNotMatch(
    method,
    /\bexpert\b|\bexcellent\b|\brobuste\b|\bmaîtrise\b/iu,
  );
});

test("P2.5-D rend le mail principal et les ressources explicites", () => {
  const contact = extractSection("contact");

  assert.match(contact, /data-profile-section="contact"/u);
  assert.match(contact, /data-contact-primary/u);
  assert.match(
    contact,
    /aria-label="Envoyer un e-mail à alexis\.guinot@onsiea\.com"/u,
  );
  assert.match(contact, /href="mailto:alexis\.guinot@onsiea\.com"/u);
  assert.match(contact, /https:\/\/www\.linkedin\.com\/in\/alexis-guinot\//u);
  assert.match(contact, /https:\/\/github\.com\/alescis-wuin/u);
  assert.match(contact, /assets\/cv\/CV_Alexis-GUINOT\.pdf/u);
  assert.doesNotMatch(contact, /href="tel:/iu);
});

test("P2.5-D conserve des liens accessibles sans contenu hover only", () => {
  const method = extractSection("apropos", "contact");
  const contact = extractSection("contact");

  assert.match(
    styles,
    /\.profile-method \.method-layout\s*\{[^}]*grid-template-columns:/su,
  );
  assert.match(
    styles,
    /\.profile-method-grid\s*\{[^}]*grid-template-columns:/su,
  );
  assert.match(
    styles,
    /\.profile-contact-card\s*\{[^}]*grid-template-columns:/su,
  );
  assert.match(
    styles,
    /\.contact-email-link\s*\{[^}]*min-height:\s*2\.75rem/su,
  );
  assert.match(
    styles,
    /\.contact-resource-link\s*\{[^}]*min-height:\s*2\.75rem/su,
  );
  assert.doesNotMatch(method + contact, /(?:^|\s)hidden(?:\s|>|=)/iu);
});

test("P2.5-D documente le contrat et la matrice visuelle", () => {
  assert.match(profileDoc, /## P2\.5-D — contrat méthode & contact/u);
  assert.match(profileDoc, /73 à 81 captures/u);
});
