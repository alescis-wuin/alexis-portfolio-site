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

  assert.deepEqual(visualProfiles, [
    { id: "mobile", width: 390, height: 844 },
    { id: "laptop-low", width: 1366, height: 768 },
    { id: "desktop-low", width: 1920, height: 800 },
    { id: "full-hd", width: 1920, height: 1080 },
    { id: "ultrawide", width: 2560, height: 1080 },
    { id: "ultrawide-large", width: 3440, height: 1440 },
  ]);

  const homeHeroScene = visualScenes.find((scene) => scene.id === "home-hero");
  assert.ok(homeHeroScene);
  assert.deepEqual(homeHeroScene.profiles, profileIds);

  assert.equal(visualCaptureCount(), 45);

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
