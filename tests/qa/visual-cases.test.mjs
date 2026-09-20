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
    { id: "reflow-320", width: 320, height: 720 },
    { id: "mobile", width: 390, height: 844 },
    { id: "laptop-low", width: 1366, height: 768 },
    { id: "desktop-low", width: 1920, height: 800 },
    { id: "full-hd", width: 1920, height: 1080 },
    { id: "ultrawide", width: 2560, height: 1080 },
    { id: "ultrawide-large", width: 3440, height: 1440 },
    { id: "4k", width: 3840, height: 2160 },
  ]);

  const homeHeroScene = visualScenes.find((scene) => scene.id === "home-hero");
  assert.ok(homeHeroScene);
  assert.deepEqual(homeHeroScene.profiles, profileIds);

  assert.equal(visualCaptureCount(), 81);

  for (const profile of visualProfiles) {
    assert.ok(profile.width >= 320);
    assert.ok(profile.height >= 700);
  }

  for (const scene of visualScenes) {
    assert.match(scene.path, /^\//);
    assert.ok(scene.focus.length > 0);
    assert.ok(scene.profiles.length > 0);
    if (scene.activate !== undefined) {
      assert.ok(scene.activate.length > 0);
    }
    for (const profileId of scene.profiles) {
      assert.ok(getVisualProfile(profileId), `profil inconnu: ${profileId}`);
    }
  }
});

test("P2.5-A capture les competences aux extremes et profils cibles", () => {
  const skillsScene = visualScenes.find((scene) => scene.id === "home-skills");
  assert.ok(skillsScene);
  assert.equal(skillsScene.path, "/");
  assert.equal(skillsScene.focus, '[data-profile-section="skills"]');
  assert.deepEqual(skillsScene.profiles, [
    "reflow-320",
    "mobile",
    "full-hd",
    "4k",
  ]);
});

test("P2.5-B capture l experience principale aux extremes et profils cibles", () => {
  const experienceScene = visualScenes.find(
    (scene) => scene.id === "home-experience",
  );
  assert.ok(experienceScene);
  assert.equal(experienceScene.path, "/");
  assert.equal(experienceScene.focus, '[data-profile-section="experience"]');
  assert.deepEqual(experienceScene.profiles, [
    "reflow-320",
    "mobile",
    "full-hd",
    "4k",
  ]);
});

test("P2.5-C capture la formation et la trajectoire aux profils cibles", () => {
  const formationScene = visualScenes.find(
    (scene) => scene.id === "home-formation",
  );
  assert.ok(formationScene);
  assert.equal(formationScene.path, "/");
  assert.equal(formationScene.focus, '[data-profile-section="formation"]');
  assert.deepEqual(formationScene.profiles, [
    "reflow-320",
    "mobile",
    "full-hd",
    "4k",
  ]);
});

test("P2.5-D capture la methode et le contact aux profils cibles", () => {
  for (const [id, focus] of [
    ["home-method", '[data-profile-section="method"]'],
    ["home-contact", '[data-profile-section="contact"]'],
  ]) {
    const scene = visualScenes.find((candidate) => candidate.id === id);
    assert.ok(scene);
    assert.equal(scene.path, "/");
    assert.equal(scene.focus, focus);
    assert.deepEqual(scene.profiles, ["reflow-320", "mobile", "full-hd", "4k"]);
  }
});

test("P2.4-F capture le viewer ouvert sur mobile et Full HD", () => {
  const viewerScene = visualScenes.find(
    (scene) => scene.id === "alycia-media-viewer",
  );
  assert.ok(viewerScene);
  assert.equal(viewerScene.path, "/projets/alycia.html");
  assert.equal(viewerScene.focus, "[data-media-viewer]");
  assert.equal(
    viewerScene.activate,
    "[data-project-hero] [data-media-viewer-trigger]",
  );
  assert.ok(viewerScene.profiles.includes("mobile"));
  assert.ok(viewerScene.profiles.includes("full-hd"));
});

test("chaque projet public possède une capture hero, architecture et galerie", () => {
  assert.deepEqual([...visualProjectSlugs].sort(), publishedSlugs);

  const sceneIds = new Set(visualScenes.map((scene) => scene.id));
  for (const slug of publishedSlugs) {
    assert.ok(sceneIds.has(`${slug}-hero`));
    assert.ok(sceneIds.has(`${slug}-architecture`));
    assert.ok(sceneIds.has(`${slug}-gallery`));
  }
});

test("le harnais attend chargement, décodage et peinture des médias", () => {
  assert.match(captureHarnessSource, /scrollIntoViewIfNeeded\(\)/);
  assert.match(captureHarnessSource, /node\.decode\(\)/);
  assert.match(captureHarnessSource, /requestAnimationFrame/);
  assert.doesNotMatch(captureHarnessSource, /waitForTimeout\s*\(/);
});
