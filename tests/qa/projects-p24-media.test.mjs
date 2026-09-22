import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const catalog = JSON.parse(
  readFileSync(path.join(repoRoot, "data", "projects.json"), "utf8"),
);
const published = catalog.projects.filter((project) => project.published);

const extensionByKind = Object.freeze({
  screenshot: ".webp",
  diagram: ".svg",
});

test("P2.4-E verrouille le schéma média typé v5", () => {
  assert.equal(catalog.schemaVersion, 5);

  for (const project of published) {
    assert.equal(project.visuals.hero.kind, "screenshot", project.id);
    assert.equal(project.visuals.architecture.kind, "diagram", project.id);

    const media = [
      project.visuals.hero,
      project.visuals.architecture,
      ...project.visuals.gallery,
    ];

    for (const item of media) {
      assert.ok(Object.hasOwn(extensionByKind, item.kind), item.src);
      assert.equal(
        path.extname(item.src),
        extensionByKind[item.kind],
        item.src,
      );
      assert.ok(item.alt.trim().length > 0, item.src);
      assert.ok(item.caption.trim().length > 0, item.src);
      assert.ok(item.width > 0, item.src);
      assert.ok(item.height > 0, item.src);
    }
  }
});

test("P2.4-E remplace les illustrations Alycia par des captures produit réelles", () => {
  const alycia = published.find((project) => project.id === "alycia");
  assert.ok(alycia);

  assert.equal(alycia.visuals.hero.src, "assets/img/projects/alycia/hero.webp");
  assert.doesNotMatch(alycia.visuals.hero.alt, /illustration schématique/i);
  assert.doesNotMatch(alycia.visuals.hero.caption, /illustration schématique/i);
  assert.deepEqual(
    alycia.visuals.gallery.map((item) => item.src),
    [
      "assets/img/projects/alycia/configuration.webp",
      "assets/img/projects/alycia/provider.webp",
    ],
  );
  assert.ok(alycia.visuals.gallery.every((item) => item.kind === "screenshot"));
});

test("P2.4-E valide les octets et dimensions de toutes les preuves média", () => {
  const result = spawnSync(
    process.execPath,
    ["scripts/validate-project-media.mjs"],
    {
      cwd: repoRoot,
      encoding: "utf8",
    },
  );

  assert.equal(
    result.status,
    0,
    `validation média en échec\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
  assert.match(result.stdout, /Validation médias OK \(20 fichier\(s\)\)\./);
});
