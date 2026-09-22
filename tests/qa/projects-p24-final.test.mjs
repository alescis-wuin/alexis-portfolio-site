import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  visualCaptureCount,
  visualProfiles,
  visualScenes,
} from "../visual/visual-cases.mjs";

const packageJson = JSON.parse(
  readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
);
const performanceSource = readFileSync(
  new URL("../../scripts/validate-project-performance.mjs", import.meta.url),
  "utf8",
);
const finalDoc = readFileSync(
  new URL("../../docs/P2.4_FINAL_QA.md", import.meta.url),
  "utf8",
);
const finalE2e = readFileSync(
  new URL("../e2e/projects-final-qa.spec.mjs", import.meta.url),
  "utf8",
);

test("P2.4-G ajoute des budgets performance persistants aux checks", () => {
  assert.equal(
    packageJson.scripts["validate:performance"],
    "node scripts/validate-project-performance.mjs",
  );
  assert.match(packageJson.scripts["check:basic"], /validate:performance/);
  assert.match(packageJson.scripts["check:strict"], /validate:performance/);

  assert.match(performanceSource, /criticalCssTotal:\s*112 \* kib/);
  assert.match(performanceSource, /mainJs:\s*20 \* kib/);
  assert.match(performanceSource, /heroScreenshot:\s*128 \* kib/);
  assert.match(performanceSource, /galleryScreenshot:\s*160 \* kib/);
  assert.match(performanceSource, /external script detected/);
  assert.match(performanceSource, /external stylesheet or preload detected/);
});

test("P2.4-G valide les budgets sur le build courant", () => {
  const result = spawnSync(
    process.execPath,
    [
      fileURLToPath(
        new URL(
          "../../scripts/validate-project-performance.mjs",
          import.meta.url,
        ),
      ),
    ],
    { encoding: "utf8" },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(
    result.stdout,
    /Performance QA OK \(8 HTML, 20 project media\)\./,
  );
  assert.match(result.stdout, /critical CSS:/);
  assert.match(result.stdout, /largest hero:/);
});

test("P2.4-G ferme la matrice visuelle sur 320 px et 4K", () => {
  const profiles = new Map(
    visualProfiles.map((profile) => [profile.id, profile]),
  );
  assert.deepEqual(profiles.get("reflow-320"), {
    id: "reflow-320",
    width: 320,
    height: 720,
  });
  assert.deepEqual(profiles.get("4k"), {
    id: "4k",
    width: 3840,
    height: 2160,
  });
  assert.ok(visualCaptureCount() >= 61);

  const catalogScene = visualScenes.find(
    (scene) => scene.id === "project-catalog",
  );
  const viewerScene = visualScenes.find(
    (scene) => scene.id === "alycia-media-viewer",
  );
  assert.ok(catalogScene?.profiles.includes("reflow-320"));
  assert.ok(catalogScene?.profiles.includes("4k"));
  assert.ok(viewerScene?.profiles.includes("reflow-320"));
  assert.ok(viewerScene?.profiles.includes("4k"));
});

test("P2.4-G documente et automatise la cloture de P2.4", () => {
  assert.match(finalDoc, /320x720/);
  assert.match(finalDoc, /3840x2160/);
  assert.match(finalDoc, /61\/61 captures/);
  assert.match(finalDoc, /npm run check:strict/);
  assert.match(finalDoc, /git diff --check/);

  assert.match(finalE2e, /publicPaths/);
  assert.match(finalE2e, /imagesWithoutAlt/);
  assert.match(finalE2e, /buttonsWithoutName/);
  assert.match(finalE2e, /unexpectedOrigins/);
  assert.match(finalE2e, /reflow-320/);
  assert.match(finalE2e, /4k/);
});
