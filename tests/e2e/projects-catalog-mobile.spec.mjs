import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const catalog = JSON.parse(
  readFileSync(new URL("../../data/projects.json", import.meta.url), "utf8"),
);
const publishedProjects = catalog.projects.filter(
  (project) => project.published,
);
const csharpProjects = publishedProjects.filter((project) =>
  project.languages.includes("csharp"),
);

async function expectNoHorizontalOverflow(page) {
  const geometry = await page.evaluate(() => ({
    clientWidth: globalThis.document.documentElement.clientWidth,
    scrollWidth: globalThis.document.documentElement.scrollWidth,
  }));
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
}

async function detailsOpen(locator) {
  return locator.evaluate((node) => node.open);
}

test("P2.4.3 conserve le catalogue complet deploye sur desktop", async ({
  page,
  isMobile,
}) => {
  test.skip(
    isMobile,
    "Le comportement desktop est valide sur Chromium desktop.",
  );
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/projets/");

  const filterPanel = page.locator("[data-filter-panel]");
  await expect(filterPanel).toBeVisible();
  expect(await detailsOpen(filterPanel)).toBe(true);
  await expect(filterPanel.locator("summary")).toBeHidden();
  await expect(page.locator("[data-filter-reset]")).toBeHidden();

  const disclosures = page.locator("[data-project-facts-disclosure]");
  await expect(disclosures).toHaveCount(publishedProjects.length);
  for (const disclosure of await disclosures.all()) {
    expect(await detailsOpen(disclosure)).toBe(true);
    await expect(disclosure.locator(".project-fact-mission")).toBeVisible();
    await expect(disclosure.locator(".project-fact-proof")).toBeVisible();
  }

  await expectNoHorizontalOverflow(page);
});

test("P2.4.3 compacte les filtres et expose leur etat sur mobile", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "Le flux compact est valide sur Chromium mobile.");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/projets/");

  const panel = page.locator("[data-filter-panel]");
  const toggle = panel.locator("summary");
  const reset = page.locator("[data-filter-reset]");

  expect(await detailsOpen(panel)).toBe(false);
  await expect(toggle).toBeVisible();
  await expect(page.locator('[data-filter-group="language"]')).toBeHidden();
  await expect(page.locator("[data-active-filter-count]")).toHaveText(
    "0 actifs",
  );
  await expect(page.locator("[data-filter-summary]")).toHaveText(
    "Aucun filtre actif",
  );
  await expect(reset).toBeHidden();

  await toggle.click();
  await page.locator('[data-filter-group="language"]').selectOption("csharp");

  await expect(page.locator("[data-project-card]:visible")).toHaveCount(
    csharpProjects.length,
  );
  await expect(page.locator("[data-project-count]")).toHaveText(
    `${csharpProjects.length} projets`,
  );
  await expect(page.locator("[data-active-filter-count]")).toHaveText(
    "1 actif",
  );
  await expect(page.locator("[data-filter-summary]")).toContainText(
    "Langage : C#",
  );
  await expect(reset).toBeVisible();

  await toggle.click();
  expect(await detailsOpen(panel)).toBe(false);
  await expect(page.locator("[data-filter-summary]")).toContainText(
    "Langage : C#",
  );

  await reset.click();
  await expect(page.locator("[data-project-card]:visible")).toHaveCount(
    publishedProjects.length,
  );
  await expect(page.locator("[data-filter-summary]")).toHaveText(
    "Aucun filtre actif",
  );
  await expect(reset).toBeHidden();
  await expect(toggle).toBeFocused();
  await expectNoHorizontalOverflow(page);
});

test("P2.4.3 garde les preuves techniques accessibles sans allonger la liste mobile", async ({
  page,
  isMobile,
}) => {
  test.skip(
    !isMobile,
    "La reduction de densite est specifique au catalogue mobile.",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/projets/");

  const card = page.locator("[data-project-card]").first();
  const disclosure = card.locator("[data-project-facts-disclosure]");
  const summary = disclosure.locator("summary");

  expect(await detailsOpen(disclosure)).toBe(false);
  await expect(card.locator(".project-summary")).toBeVisible();
  await expect(card.locator(".project-stack")).toBeVisible();
  await expect(card.locator(".project-actions")).toBeVisible();
  await expect(card.locator(".project-fact-mission")).toBeHidden();
  await expect(card.locator(".project-fact-proof")).toBeHidden();

  const box = await summary.boundingBox();
  expect(box).not.toBeNull();
  if (box) expect(box.height).toBeGreaterThanOrEqual(43.99);

  await summary.click();
  expect(await detailsOpen(disclosure)).toBe(true);
  await expect(card.locator(".project-fact-mission")).toBeVisible();
  await expect(card.locator(".project-fact-proof")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
