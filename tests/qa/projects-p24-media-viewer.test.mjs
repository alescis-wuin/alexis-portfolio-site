import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const mainSource = readFileSync(
  new URL("../../assets/js/main.js", import.meta.url),
  "utf8",
);
const styleSource = readFileSync(
  new URL("../../assets/css/styles.css", import.meta.url),
  "utf8",
);
const templateSource = readFileSync(
  new URL("../../templates/project.html.tpl", import.meta.url),
  "utf8",
);
const generatorSource = readFileSync(
  new URL("../../scripts/generate-projects.mjs", import.meta.url),
  "utf8",
);

test("P2.4-F utilise un seul dialog natif et des liens média progressifs", () => {
  assert.equal((templateSource.match(/<dialog\b/g) ?? []).length, 1);
  assert.match(
    templateSource,
    /<dialog class="media-viewer" data-media-viewer/,
  );
  assert.match(templateSource, /data-media-viewer-title/);
  assert.match(templateSource, /data-media-viewer-image/);
  assert.match(templateSource, /data-media-viewer-caption/);
  assert.match(templateSource, /data-media-viewer-close/);
  assert.match(templateSource, /<div class="media-viewer-toolbar">/);
  assert.doesNotMatch(templateSource, /<header class="media-viewer-toolbar">/);

  assert.match(generatorSource, /function renderViewerTriggerOpen/);
  assert.match(generatorSource, /class="media-viewer-trigger"/);
  assert.match(generatorSource, /href=/);
  assert.match(generatorSource, /data-media-viewer-trigger/);
});

test("P2.4-F délègue la modalité au dialog natif et restitue le focus", () => {
  assert.match(mainSource, /HTMLDialogElement/);
  assert.match(mainSource, /showModal\(\)/);
  assert.match(mainSource, /dialog\.close\(\)/);
  assert.match(mainSource, /dialog\.addEventListener\("close"/);
  assert.match(mainSource, /lastTrigger\?\.focus/);
  assert.match(mainSource, /event\.target === dialog/);
  assert.match(mainSource, /media-viewer-open/);
  assert.match(mainSource, /event\.metaKey/);
  assert.match(mainSource, /event\.ctrlKey/);
});

test("P2.4-F garde le viewer borné, lisible et compatible reduced motion", () => {
  assert.match(styleSource, /\.media-viewer::backdrop/);
  assert.match(styleSource, /\.media-viewer-close[\s\S]*width:\s*2\.75rem/);
  assert.match(styleSource, /\.media-viewer-close[\s\S]*height:\s*2\.75rem/);
  assert.match(styleSource, /\.media-viewer-image[\s\S]*object-fit:\s*contain/);
  assert.match(styleSource, /html\.media-viewer-open[\s\S]*overflow:\s*hidden/);
  assert.match(
    styleSource,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.media-viewer-trigger::after[\s\S]*transition:\s*none/,
  );
});
