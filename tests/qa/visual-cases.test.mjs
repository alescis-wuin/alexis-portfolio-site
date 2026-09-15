import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  getVisualProfile,
  visualCaptureCount,
  visualProfiles,
  visualProjectSlugs,
  visualScenes,
} from "../visual/visual-cases.mjs";

const catalog = JSON.parse(
  readFileSync(new URL("../../data/projects.json", import.meta.url), "utf8"),
);
const publishedSlugs = catalog.projects
  .filter((project) => project.published)
  .map((project) => project.slug)
  .sort();

const captureHarnessSource = readFileSync(
  new URL("../visual/capture.spec.mjs", import.meta.url),
  "utf8",
);

test("la matrice de capture visuelle reste stable et sans doublons", () => {
  const profileIds = visualProfiles.map((profile) => profile.id);
  const sceneIds = visualScenes.map((scene) => scene.id);

  assert.equal(new Set(profileIds).size, profileIds.length);
  assert.equal(new Set(sceneIds).size, sceneIds.length);
  assert.equal(visualCaptureCount(), 34);

  for (const profile of visualProfiles) {
    assert.ok(profile.width >= 320);
    assert.ok(profile.height >= 700);
  }

  for (const scene of visualScenes) {
    assert.match(scene.path, /^\//);
    assert.ok(scene.focus.length > 0);
    assert.ok(scene.profiles.length > 0);
    for (const profileId of scene.profiles) {
      assert.ok(getVisualProfile(profileId), `profil inconnu: ${profileId}`);
    }
  }
});

test("chaque projet public possède une capture hero et architecture", () => {
  assert.deepEqual([...visualProjectSlugs].sort(), publishedSlugs);

  const sceneIds = new Set(visualScenes.map((scene) => scene.id));
  for (const slug of publishedSlugs) {
    assert.ok(sceneIds.has(`${slug}-hero`));
    assert.ok(sceneIds.has(`${slug}-architecture`));
  }
});

test("le harnais attend chargement, décodage et peinture des médias", () => {
  assert.match(captureHarnessSource, /scrollIntoViewIfNeeded\(\)/);
  assert.match(captureHarnessSource, /node\.decode\(\)/);
  assert.match(captureHarnessSource, /requestAnimationFrame/);
  assert.doesNotMatch(captureHarnessSource, /waitForTimeout\s*\(/);
});
