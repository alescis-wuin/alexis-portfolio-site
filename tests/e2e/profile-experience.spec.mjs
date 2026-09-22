import { expect, test } from "@playwright/test";

test("P2.5-B hierarchise Familink devant l experience secondaire", async ({
  page,
}) => {
  await page.goto("/#experience");

  const section = page.locator('[data-profile-section="experience"]');
  await expect(section).toBeVisible();

  const lead = section.locator("[data-experience-lead]");
  const secondary = section.locator("[data-experience-secondary]");

  await expect(lead).toHaveCount(1);
  await expect(secondary).toHaveCount(1);
  await expect(lead.getByRole("heading", { name: "Familink" })).toBeVisible();
  await expect(lead).toContainText("Expérience principale · alternance");
  await expect(lead).toContainText("Android Java");
  await expect(lead).toContainText("Python/Django/ReportLab");
  await expect(lead).toContainText("Linux/Raspberry Pi");
  await expect(secondary).toContainText("Caisse d’Épargne Normandie");
  await expect(secondary).toContainText("Stage de découverte");
});

test("P2.5-B reste lisible sans overflow a 320 px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/#experience");

  const section = page.locator('[data-profile-section="experience"]');
  await expect(section).toBeVisible();

  const geometry = await section.evaluate((node) => {
    const root = globalThis.document.documentElement;
    const cards = [...node.querySelectorAll(".experience-card")].map((card) => {
      const rect = card.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        width: rect.width,
      };
    });

    return {
      clientWidth: root.clientWidth,
      scrollWidth: root.scrollWidth,
      cards,
    };
  });

  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
  expect(geometry.cards).toHaveLength(2);

  for (const card of geometry.cards) {
    expect(card.left).toBeGreaterThanOrEqual(-1);
    expect(card.right).toBeLessThanOrEqual(geometry.clientWidth + 1);
    expect(card.width).toBeGreaterThan(0);
  }
});
