import { mkdirSync } from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { getVisualProfile, visualScenes } from "./visual-cases.mjs";

const artifactRoot = path.resolve(
  process.env.VISUAL_ARTIFACT_ROOT ?? "artifacts/visual",
);
const captureDir = path.join(artifactRoot, "captures");
mkdirSync(captureDir, { recursive: true });

async function stabilizePage(page, focusSelector) {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-delay: 0s !important;
        animation-duration: 0s !important;
        transition: none !important;
        caret-color: transparent !important;
      }
      html {
        scroll-behavior: auto !important;
        scrollbar-width: none !important;
      }
      body {
        scrollbar-width: none !important;
      }
      ::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
      }
    `,
  });

  await page.evaluate(async () => {
    if (globalThis.document.fonts?.ready) {
      await globalThis.document.fonts.ready;
    }
  });

  const focus = page.locator(focusSelector).first();
  await expect(focus).toBeVisible();

  const scrollFocusIntoPlace = () =>
    focus.evaluate((node) => {
      const header = globalThis.document.querySelector("[data-site-header]");
      const headerHeight = header?.getBoundingClientRect().height ?? 0;
      const top = node.getBoundingClientRect().top + globalThis.scrollY;
      globalThis.scrollTo(0, Math.max(0, top - headerHeight - 12));
    });

  await scrollFocusIntoPlace();

  const images = focus.locator("img");
  const imageCount = await images.count();

  for (let index = 0; index < imageCount; index += 1) {
    const image = images.nth(index);

    // Trigger native lazy-loading without relying on an arbitrary sleep.
    await image.scrollIntoViewIfNeeded();

    await expect
      .poll(
        () =>
          image.evaluate(
            (node) =>
              node.complete && node.naturalWidth > 0 && node.naturalHeight > 0,
          ),
        { timeout: 8_000 },
      )
      .toBe(true);

    await image.evaluate(async (node) => {
      if (typeof node.decode === "function") {
        await node.decode();
      }
    });
  }

  // Restore the same framing after loading below-the-fold media.
  await scrollFocusIntoPlace();

  // Give Chromium two paint opportunities after asynchronous image decoding.
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        globalThis.requestAnimationFrame(() => {
          globalThis.requestAnimationFrame(resolve);
        });
      }),
  );

  const geometry = await page.evaluate(() => ({
    clientWidth: globalThis.document.documentElement.clientWidth,
    scrollWidth: globalThis.document.documentElement.scrollWidth,
  }));
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
}

for (const scene of visualScenes) {
  for (const profileId of scene.profiles) {
    const profile = getVisualProfile(profileId);
    if (!profile) continue;

    test(`@capture ${profile.id} ${scene.id}`, async ({ page }, testInfo) => {
      await page.setViewportSize({
        width: profile.width,
        height: profile.height,
      });
      const response = await page.goto(scene.path, { waitUntil: "load" });
      expect(response?.ok()).toBe(true);
      await stabilizePage(page, scene.focus);

      const filename = `${profile.id}__${scene.id}.png`;
      const screenshotPath = path.join(captureDir, filename);
      await page.screenshot({
        path: screenshotPath,
        animations: "disabled",
        caret: "hide",
        fullPage: false,
        scale: "css",
      });

      await testInfo.attach(filename, {
        path: screenshotPath,
        contentType: "image/png",
      });
    });
  }
}
