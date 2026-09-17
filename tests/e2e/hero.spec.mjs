import { test, expect } from "@playwright/test";

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "laptop-low", width: 1366, height: 768 },
  { name: "desktop-low", width: 1920, height: 800 },
  { name: "full-hd", width: 1920, height: 1080 },
  { name: "ultrawide", width: 2560, height: 1080 },
  { name: "ultrawide-large", width: 3440, height: 1440 },
];

test("le hero expose le positionnement editorial P2.3", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/");
  const hero = page.locator("#accueil");
  await expect(hero).toBeVisible();
  await expect(
    hero.getByRole("heading", {
      level: 1,
      name: "Concepteur-d\u00e9veloppeur full-stack",
    }),
  ).toHaveCount(1);
  await expect(hero).toContainText("Alexis Guinot");
  await expect(hero).toContainText("Java / Spring");
  await expect(hero).toContainText("C# / .NET");
  await expect(hero).toContainText(/architecture logicielle/i);
  await expect(hero).toContainText("M\u00e9tropole de Rouen");
  await expect(hero).toContainText("octobre 2026");
  await expect(
    hero.getByRole("link", { name: "Voir les projets" }),
  ).toHaveAttribute("href", "#projets");
  await expect(
    hero.getByRole("link", { name: "D\u00e9couvrir mon profil" }),
  ).toHaveAttribute("href", "#apropos");
  await expect(hero).not.toContainText(/architecte logiciel/i);
});

test("le hero reste exploitable sur les viewports cibles", async ({
  page,
  isMobile,
}) => {
  test.skip(
    isMobile,
    "La matrice est executee une seule fois sur Chromium desktop.",
  );
  for (const viewport of viewports) {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await page.goto("/");
    const hero = page.locator("#accueil");
    const title = hero.locator("[data-hero-title]");
    const summary = hero.locator("[data-hero-summary]");
    const availability = hero.locator("[data-hero-availability]");
    await expect(hero).toBeVisible();
    await expect(title).toBeVisible();
    await expect(summary).toBeVisible();
    await expect(availability).toBeVisible();
    const overflow = await page.evaluate(
      () =>
        globalThis.document.documentElement.scrollWidth -
        globalThis.document.documentElement.clientWidth,
    );
    expect(
      overflow,
      `overflow horizontal sur ${viewport.name}`,
    ).toBeLessThanOrEqual(1);
    const geometry = await hero.evaluate((node) => {
      const viewportWidth = globalThis.innerWidth;
      return [
        ...node.querySelectorAll(
          "[data-hero-title], [data-hero-summary], [data-hero-availability], [data-hero-actions], [data-hero-facts]",
        ),
      ].map((element) => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, right: rect.right, viewportWidth };
      });
    });
    for (const box of geometry) {
      expect(box.left).toBeGreaterThanOrEqual(-1);
      expect(box.right).toBeLessThanOrEqual(box.viewportWidth + 1);
    }
  }
});
