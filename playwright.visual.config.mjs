import path from "node:path";

import { defineConfig } from "@playwright/test";

const artifactRoot = path.resolve(
  process.env.VISUAL_ARTIFACT_ROOT ?? "artifacts/visual",
);

export default defineConfig({
  testDir: "./tests/visual",
  testMatch: "capture.spec.mjs",
  timeout: 45_000,
  expect: {
    timeout: 8_000,
  },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [
    ["list"],
    [
      "html",
      { outputFolder: path.join(artifactRoot, "report"), open: "never" },
    ],
  ],
  outputDir: path.join(artifactRoot, "test-results"),
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    colorScheme: "dark",
    locale: "fr-FR",
    reducedMotion: "reduce",
    timezoneId: "Europe/Paris",
    deviceScaleFactor: 1,
    trace: "retain-on-failure",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
          args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
        }
      : {},
  },
  webServer: {
    command: "python3 -m http.server 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },
  projects: [
    {
      name: "chromium-visual",
      use: {
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
});
