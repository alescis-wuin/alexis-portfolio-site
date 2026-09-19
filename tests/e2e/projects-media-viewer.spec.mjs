import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

const catalog = JSON.parse(
  readFileSync(new URL("../../data/projects.json", import.meta.url), "utf8"),
);
const published = catalog.projects.filter((project) => project.published);
const alycia = published.find((project) => project.id === "alycia");

test("P2.4-F expose un lien direct et un trigger pour chaque preuve média", async ({
  page,
}) => {
  for (const project of published) {
    const response = await page.goto(`/projets/${project.slug}.html`, {
      waitUntil: "load",
    });
    expect(response?.ok()).toBe(true);

    const media = [
      project.visuals.hero,
      project.visuals.architecture,
      ...project.visuals.gallery,
    ];
    const triggers = page.locator("[data-media-viewer-trigger]");
    await expect(triggers).toHaveCount(media.length);
    await expect(page.locator("[data-media-viewer]")).toHaveCount(1);

    for (let index = 0; index < media.length; index += 1) {
      await expect(triggers.nth(index)).toHaveAttribute(
        "href",
        `../${media[index].src}`,
      );
    }
  }
});

test("P2.4-F ouvre, ferme et restitue le focus avec le type de média", async ({
  page,
}) => {
  expect(alycia).toBeTruthy();
  await page.goto(`/projets/${alycia.slug}.html`, { waitUntil: "load" });

  const dialog = page.locator("[data-media-viewer]");
  const title = dialog.locator("[data-media-viewer-title]");
  const viewerImage = dialog.locator("[data-media-viewer-image]");
  const caption = dialog.locator("[data-media-viewer-caption]");
  const closeButton = dialog.locator("[data-media-viewer-close]");
  const heroTrigger = page.locator(
    "[data-project-hero] [data-media-viewer-trigger]",
  );

  await heroTrigger.focus();
  await heroTrigger.press("Enter");
  await expect(dialog).toHaveAttribute("open", "");
  await expect(title).toHaveText("Capture produit agrandie");
  await expect(viewerImage).toHaveAttribute("alt", alycia.visuals.hero.alt);
  await expect(caption).toHaveText(alycia.visuals.hero.caption);
  await expect(closeButton).toBeFocused();
  await expect(page.locator("html")).toHaveClass(/media-viewer-open/);

  const target = await closeButton.boundingBox();
  expect(target?.width ?? 0).toBeGreaterThanOrEqual(44);
  expect(target?.height ?? 0).toBeGreaterThanOrEqual(44);

  await closeButton.click();
  await expect(dialog).not.toHaveAttribute("open", "");
  await expect(heroTrigger).toBeFocused();
  await expect(page.locator("html")).not.toHaveClass(/media-viewer-open/);

  const architectureTrigger = page.locator(
    "[data-project-architecture] [data-media-viewer-trigger]",
  );
  await architectureTrigger.focus();
  await architectureTrigger.press("Enter");
  await expect(title).toHaveText("Schéma technique agrandi");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toHaveAttribute("open", "");
  await expect(architectureTrigger).toBeFocused();

  await heroTrigger.click();
  await expect(dialog).toHaveAttribute("open", "");
  await dialog.click({ position: { x: 2, y: 2 } });
  await expect(dialog).not.toHaveAttribute("open", "");
  await expect(heroTrigger).toBeFocused();
});

test("P2.4-F reste contenu dans le viewport mobile", async ({ page }) => {
  expect(alycia).toBeTruthy();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/projets/${alycia.slug}.html`, { waitUntil: "load" });
  await page.locator("[data-project-hero] [data-media-viewer-trigger]").click();

  const geometry = await page
    .locator("[data-media-viewer]")
    .evaluate((node) => {
      const panel = node.querySelector(".media-viewer-panel");
      const image = node.querySelector("[data-media-viewer-image]");
      const panelRect = panel?.getBoundingClientRect();
      const imageRect = image?.getBoundingClientRect();
      return {
        viewportWidth: globalThis.innerWidth,
        viewportHeight: globalThis.innerHeight,
        documentScrollWidth: globalThis.document.documentElement.scrollWidth,
        panelLeft: panelRect?.left ?? -1,
        panelRight: panelRect?.right ?? Number.POSITIVE_INFINITY,
        panelTop: panelRect?.top ?? -1,
        panelBottom: panelRect?.bottom ?? Number.POSITIVE_INFINITY,
        imageWidth: imageRect?.width ?? 0,
        imageHeight: imageRect?.height ?? 0,
      };
    });

  expect(geometry.documentScrollWidth).toBeLessThanOrEqual(
    geometry.viewportWidth + 1,
  );
  expect(geometry.panelLeft).toBeGreaterThanOrEqual(0);
  expect(geometry.panelRight).toBeLessThanOrEqual(geometry.viewportWidth);
  expect(geometry.panelTop).toBeGreaterThanOrEqual(0);
  expect(geometry.panelBottom).toBeLessThanOrEqual(geometry.viewportHeight);
  expect(geometry.imageWidth).toBeGreaterThan(0);
  expect(geometry.imageHeight).toBeGreaterThan(0);
});
