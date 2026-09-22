import { expect, test } from "@playwright/test";

test("P2.5-A presente des competences contextualisees et navigables", async ({
  page,
}) => {
  const response = await page.goto("/#competences");
  expect(response?.ok()).toBe(true);

  const section = page.locator('[data-profile-section="skills"]');
  await expect(section).toBeVisible();
  await expect(section.locator("[data-capability]")).toHaveCount(5);
  await expect(section.locator(".capability-card-primary")).toHaveCount(2);

  await expect(section.locator('[data-capability="java"] h3')).toHaveText(
    "Java / Spring",
  );
  await expect(section.locator('[data-capability="dotnet"] h3')).toHaveText(
    "C# / .NET",
  );

  const projectLinks = section.locator('.capability-links a[href^="projets/"]');
  expect(await projectLinks.count()).toBeGreaterThanOrEqual(10);

  const firstProjectLink = projectLinks.first();
  await expect(firstProjectLink).toBeVisible();
  await firstProjectLink.focus();
  await expect(firstProjectLink).toBeFocused();
});

test("P2.5-A garde la section competences lisible a 320 px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#competences");

  const section = page.locator('[data-profile-section="skills"]');
  await section.scrollIntoViewIfNeeded();

  const geometry = await section.evaluate((node) => {
    const root = globalThis.document.documentElement;
    const cards = [...node.querySelectorAll("[data-capability]")].map(
      (card) => {
        const rect = card.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          width: rect.width,
        };
      },
    );

    return {
      clientWidth: root.clientWidth,
      scrollWidth: root.scrollWidth,
      cards,
    };
  });

  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
  expect(geometry.cards).toHaveLength(5);

  for (const card of geometry.cards) {
    expect(card.left).toBeGreaterThanOrEqual(0);
    expect(card.right).toBeLessThanOrEqual(geometry.clientWidth + 1);
    expect(card.width).toBeGreaterThan(0);
  }
});
