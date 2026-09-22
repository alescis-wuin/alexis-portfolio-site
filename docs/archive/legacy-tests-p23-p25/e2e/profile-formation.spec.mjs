import { expect, test } from "@playwright/test";

test("P2.5-C distingue formation acquise et prochaines etapes", async ({
  page,
}) => {
  await page.goto("/");

  const section = page.locator('[data-profile-section="formation"]');
  await expect(section).toBeVisible();
  await expect(section.locator("h2")).toContainText("parcours acquis");

  const acquired = section.locator("[data-education-acquired]");
  const target = section.locator("[data-education-target]");
  const search = section.locator("[data-education-search]");
  const future = section.locator("[data-education-ai]");

  await expect(acquired).toHaveCount(1);
  await expect(target).toHaveCount(1);
  await expect(search).toHaveCount(1);
  await expect(future).toHaveCount(1);

  await expect(acquired).toContainText("Diplôme obtenu");
  await expect(target).toContainText("Troisième année visée");
  await expect(search).toContainText("octobre 2026");
  await expect(search).toContainText("Métropole de Rouen");
  await expect(future).toContainText("À plus long terme");
});

test("P2.5-C reste lisible sans overflow a 320 px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");

  const section = page.locator('[data-profile-section="formation"]');
  await section.scrollIntoViewIfNeeded();

  const metrics = await section.evaluate((node) => {
    const doc = node.ownerDocument;

    return {
      sectionWidth: node.getBoundingClientRect().width,
      viewportWidth: doc.documentElement.clientWidth,
      documentScrollWidth: doc.documentElement.scrollWidth,
    };
  });

  expect(metrics.sectionWidth).toBeLessThanOrEqual(metrics.viewportWidth + 1);
  expect(metrics.documentScrollWidth).toBeLessThanOrEqual(
    metrics.viewportWidth + 1,
  );

  for (const selector of [
    "[data-education-acquired]",
    "[data-education-target]",
    "[data-education-search]",
    "[data-education-ai]",
  ]) {
    await expect(section.locator(selector)).toBeVisible();
  }
});
