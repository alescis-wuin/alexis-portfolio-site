import { expect, test } from "@playwright/test";

test("P2.3.4 active un parallaxe leger uniquement avec un pointeur fin", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Le parallaxe du Hero est reserve aux pointeurs fins.");

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const visual = page.locator("[data-hero-visual]");
  await expect(visual).toBeVisible();
  await expect(visual).toHaveAttribute("data-hero-motion", "interactive");

  const ambientMotion = await page.evaluate(() => {
    const link = globalThis.document.querySelector(
      ".hero-system-link-secondary",
    );
    const node = globalThis.document.querySelector(
      '[data-hero-system-node="interface"]',
    );
    if (!link || !node) throw new Error("Mouvement ambiant P2.3.4 absent.");

    return {
      linkAnimation: globalThis.getComputedStyle(link).animationName,
      nodeAnimation: globalThis.getComputedStyle(node, "::before")
        .animationName,
    };
  });

  expect(ambientMotion.linkAnimation).toBe("hero-system-flow");
  expect(ambientMotion.nodeAnimation).toBe("hero-system-signal");

  const box = await visual.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.move(box.x + box.width * 0.82, box.y + box.height * 0.22);

  await expect
    .poll(() =>
      visual.evaluate((element) =>
        element.style.getPropertyValue("--hero-profile-shift-x"),
      ),
    )
    .not.toBe("0.00px");

  const movedState = await visual.evaluate((element) => ({
    systemX: element.style.getPropertyValue("--hero-system-shift-x"),
    profileX: element.style.getPropertyValue("--hero-profile-shift-x"),
  }));

  expect(movedState.systemX).not.toBe("0.00px");
  expect(movedState.profileX).not.toBe("0.00px");

  await page.mouse.move(0, 0);

  await expect
    .poll(() =>
      visual.evaluate((element) =>
        element.style.getPropertyValue("--hero-profile-shift-x"),
      ),
    )
    .toBe("0.00px");
});

test("P2.3.4 ne declenche pas le parallaxe sur un pointeur tactile", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "Le contrat tactile est verifie sur le projet mobile.");

  await page.goto("/");

  const visual = page.locator("[data-hero-visual]");
  await expect(visual).toBeVisible();
  await expect(visual).not.toHaveAttribute("data-hero-motion", "interactive");
});

test("P2.3.4 reste integralement statique en prefers-reduced-motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/");

  const visual = page.locator("[data-hero-visual]");
  const system = page.locator("[data-hero-system]");
  const profile = page.locator("[data-hero-profile]");
  const secondaryLink = page.locator(".hero-system-link-secondary");
  const interfaceNode = page.locator('[data-hero-system-node="interface"]');

  await expect(visual).toBeVisible();
  await expect(visual).not.toHaveAttribute("data-hero-motion", "interactive");

  const reducedState = await page.evaluate(() => {
    const systemElement =
      globalThis.document.querySelector("[data-hero-system]");
    const profileElement = globalThis.document.querySelector(
      "[data-hero-profile]",
    );
    const linkElement = globalThis.document.querySelector(
      ".hero-system-link-secondary",
    );
    const nodeElement = globalThis.document.querySelector(
      '[data-hero-system-node="interface"]',
    );

    if (!systemElement || !profileElement || !linkElement || !nodeElement) {
      throw new Error("Structure Hero P2.3.4 incomplete.");
    }

    return {
      systemTransform: globalThis.getComputedStyle(systemElement).transform,
      profileTransform: globalThis.getComputedStyle(profileElement).transform,
      linkAnimation: globalThis.getComputedStyle(linkElement).animationName,
      nodeAnimation: globalThis.getComputedStyle(nodeElement, "::before")
        .animationName,
    };
  });

  await expect(system).toBeVisible();
  await expect(profile).toBeVisible();
  await expect(secondaryLink).toHaveCount(1);
  await expect(interfaceNode).toBeVisible();
  expect(reducedState.systemTransform).toBe("none");
  expect(reducedState.profileTransform).toBe("none");
  expect(reducedState.linkAnimation).toBe("none");
  expect(reducedState.nodeAnimation).toBe("none");
});
