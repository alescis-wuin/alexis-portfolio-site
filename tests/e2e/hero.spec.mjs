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

test("la composition P2.3.2 respecte la geometrie cible", async ({
  page,
  isMobile,
}) => {
  test.skip(
    isMobile,
    "La matrice geometrique est executee une seule fois sur Chromium desktop.",
  );

  for (const viewport of viewports) {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await page.goto("/");

    const hero = page.locator("#accueil");
    await expect(hero).toBeVisible();

    const metrics = await hero.evaluate((node) => {
      const rect = (element) => {
        const box = element.getBoundingClientRect();
        return {
          left: box.left,
          right: box.right,
          top: box.top,
          bottom: box.bottom,
          width: box.width,
          height: box.height,
        };
      };

      const grid = node.querySelector(".hero-grid");
      const copy = node.querySelector("[data-hero-copy]");
      const visual = node.querySelector("[data-hero-visual]");

      if (!grid || !copy || !visual) {
        throw new Error("Structure hero P2.3.2 incomplete.");
      }

      return {
        hero: rect(node),
        grid: rect(grid),
        copy: rect(copy),
        visual: rect(visual),
      };
    });

    if (viewport.width <= 980) {
      expect(
        metrics.copy.width / metrics.grid.width,
        `largeur copy insuffisante sur ${viewport.name}`,
      ).toBeGreaterThanOrEqual(0.94);
      expect(
        metrics.visual.width / metrics.grid.width,
        `largeur visual insuffisante sur ${viewport.name}`,
      ).toBeGreaterThanOrEqual(0.94);
      expect(
        metrics.visual.top,
        `visual non empile sous copy sur ${viewport.name}`,
      ).toBeGreaterThanOrEqual(metrics.copy.bottom + 15);
    } else {
      expect(
        metrics.visual.left,
        `copy et visual se chevauchent sur ${viewport.name}`,
      ).toBeGreaterThanOrEqual(metrics.copy.right + 20);
    }

    if (viewport.height < 900) {
      expect(
        metrics.hero.height,
        `hero trop haut sur ${viewport.name}`,
      ).toBeLessThanOrEqual(viewport.height * 1.35);
    }

    if (viewport.width >= 1180 && viewport.height >= 900) {
      expect(
        Math.abs(metrics.hero.bottom - viewport.height),
        `hero snap mal cale sur ${viewport.name}`,
      ).toBeLessThanOrEqual(2);
    }
  }
});

test("le module technique P2.3.3 reste contenu dans la zone visuelle", async ({
  page,
  isMobile,
}) => {
  test.skip(
    isMobile,
    "La matrice geometrique est executee une seule fois sur Chromium desktop.",
  );

  for (const viewport of viewports) {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await page.goto("/");

    const visual = page.locator("[data-hero-visual]");
    const system = page.locator("[data-hero-system]");
    const profile = page.locator("[data-hero-profile]");
    const nodes = page.locator("[data-hero-system-node]");

    await expect(visual).toBeVisible();
    await expect(system).toBeVisible();
    await expect(profile).toBeVisible();
    await expect(nodes).toHaveCount(4);

    const metrics = await visual.evaluate((node) => {
      const rect = (element) => {
        const box = element.getBoundingClientRect();
        return {
          left: box.left,
          right: box.right,
          top: box.top,
          bottom: box.bottom,
        };
      };

      const systemElement = node.querySelector("[data-hero-system]");
      const profileElement = node.querySelector("[data-hero-profile]");
      const systemNodes = [...node.querySelectorAll("[data-hero-system-node]")];

      if (!systemElement || !profileElement || systemNodes.length !== 4) {
        throw new Error("Structure du module technique P2.3.3 incomplete.");
      }

      return {
        visual: rect(node),
        system: rect(systemElement),
        profile: rect(profileElement),
        nodes: systemNodes.map(rect),
      };
    });

    for (const box of [metrics.system, metrics.profile]) {
      expect(
        box.left,
        `bloc du module hors visual sur ${viewport.name}`,
      ).toBeGreaterThanOrEqual(metrics.visual.left - 1);
      expect(
        box.right,
        `bloc du module hors visual sur ${viewport.name}`,
      ).toBeLessThanOrEqual(metrics.visual.right + 1);
      expect(
        box.top,
        `bloc du module hors visual sur ${viewport.name}`,
      ).toBeGreaterThanOrEqual(metrics.visual.top - 1);
      expect(
        box.bottom,
        `bloc du module hors visual sur ${viewport.name}`,
      ).toBeLessThanOrEqual(metrics.visual.bottom + 1);
    }

    for (const box of metrics.nodes) {
      expect(
        box.left,
        `noeud technique hors panneau sur ${viewport.name}`,
      ).toBeGreaterThanOrEqual(metrics.system.left - 1);
      expect(
        box.right,
        `noeud technique hors panneau sur ${viewport.name}`,
      ).toBeLessThanOrEqual(metrics.system.right + 1);
      expect(
        box.top,
        `noeud technique hors panneau sur ${viewport.name}`,
      ).toBeGreaterThanOrEqual(metrics.system.top - 1);
      expect(
        box.bottom,
        `noeud technique hors panneau sur ${viewport.name}`,
      ).toBeLessThanOrEqual(metrics.system.bottom + 1);
    }
  }
});
