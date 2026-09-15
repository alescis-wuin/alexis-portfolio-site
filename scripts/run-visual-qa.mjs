import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import {
  visualCaptureCount,
  visualProfiles,
  visualScenes,
} from "../tests/visual/visual-cases.mjs";

const root = path.resolve(
  process.env.VISUAL_ARTIFACT_ROOT ?? "artifacts/visual",
);
const captures = path.join(root, "captures");
const playwrightBin = path.resolve("node_modules/.bin/playwright");

rmSync(root, { recursive: true, force: true });
mkdirSync(captures, { recursive: true });

function gitValue(args) {
  try {
    return execFileSync("git", args, { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

writeFileSync(
  path.join(root, "capture-plan.json"),
  `${JSON.stringify(
    {
      schemaVersion: 1,
      expectedCaptureCount: visualCaptureCount(),
      profiles: visualProfiles,
      scenes: visualScenes,
    },
    null,
    2,
  )}\n`,
  "utf8",
);

const result = spawnSync(
  playwrightBin,
  ["test", "--config=playwright.visual.config.mjs"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      VISUAL_ARTIFACT_ROOT: root,
    },
  },
);

function listPngFiles(directory) {
  const files = [];
  if (!statSync(directory, { throwIfNoEntry: false })?.isDirectory()) {
    return files;
  }
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...listPngFiles(absolute));
    } else if (entry.isFile() && entry.name.endsWith(".png")) {
      files.push(absolute);
    }
  }
  return files.sort();
}

const pngFiles = listPngFiles(captures);
const sums = pngFiles.map((file) => {
  const digest = createHash("sha256").update(readFileSync(file)).digest("hex");
  return `${digest}  ${path.relative(root, file)}`;
});
writeFileSync(
  path.join(root, "SHA256SUMS.txt"),
  `${sums.join("\n")}${sums.length ? "\n" : ""}`,
  "utf8",
);

const metadata = {
  schemaVersion: 1,
  branch: gitValue(["branch", "--show-current"]),
  head: gitValue(["rev-parse", "HEAD"]),
  captureCount: pngFiles.length,
  expectedCaptureCount: visualCaptureCount(),
  node: process.version,
  playwright: JSON.parse(
    readFileSync(
      new URL("../node_modules/@playwright/test/package.json", import.meta.url),
      "utf8",
    ),
  ).version,
};
writeFileSync(
  path.join(root, "metadata.json"),
  `${JSON.stringify(metadata, null, 2)}\n`,
  "utf8",
);

const expectedCaptureCount = visualCaptureCount();
console.log(`Visual QA artifacts: ${root}`);
console.log(
  `Captured ${pngFiles.length}/${expectedCaptureCount} planned screenshots.`,
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
if ((result.status ?? 1) !== 0) {
  process.exit(result.status ?? 1);
}
if (pngFiles.length !== expectedCaptureCount) {
  console.error(
    `Visual QA incomplete: expected ${expectedCaptureCount} screenshots, got ${pngFiles.length}.`,
  );
  process.exit(1);
}
process.exit(0);
