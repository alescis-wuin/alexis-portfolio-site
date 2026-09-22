import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

const catalog = JSON.parse(
  readFileSync(new URL("../../data/projects.json", import.meta.url), "utf8"),
);
const published = catalog.projects.filter((project) => project.published);

test("P2.4-E décode les médias typés de chaque projet public", async ({
  page,
}) => {
  for (const project of published) {
    const response = await page.goto(`/projets/${project.slug}.html`, {
      waitUntil: "load",
    });
    expect(response?.ok()).toBe(true);

    await expectMedia(
      page.locator("[data-project-hero]"),
      project.visuals.hero,
    );
    await expectMedia(
      page.locator("[data-project-architecture]"),
      project.visuals.architecture,
    );

    const galleryItems = page.locator("[data-gallery-item]");
    await expect(galleryItems).toHaveCount(project.visuals.gallery.length);
    for (let index = 0; index < project.visuals.gallery.length; index += 1) {
      await expectMedia(
        galleryItems.nth(index),
        project.visuals.gallery[index],
      );
    }
  }
});

async function expectMedia(container, media) {
  await expect(container).toHaveAttribute("data-media-kind", media.kind);
  const image = container.locator("img");
  await image.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      image.evaluate((node) => node.complete && node.naturalWidth > 0),
    )
    .toBe(true);
  await image.evaluate(async (node) => {
    if (typeof node.decode === "function") await node.decode();
  });
  await expect(image).toHaveJSProperty("naturalWidth", media.width);
  await expect(image).toHaveJSProperty("naturalHeight", media.height);
}
