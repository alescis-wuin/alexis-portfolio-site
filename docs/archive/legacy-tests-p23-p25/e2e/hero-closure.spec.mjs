import { expect, test } from "@playwright/test";

test("P2.3.6 conserve l'ordre clavier des CTA du Hero", async ({
  page,
  isMobile,
}) => {
  test.skip(
    isMobile,
    "L'ordre clavier est verifie une seule fois sur Chromium desktop.",
  );

  await page.setViewportSize({ width: 1920, height: 800 });
  await page.goto("/");

  const actions = page.locator("[data-hero-actions] .button");
  const firstAction = actions.nth(0);
  const secondAction = actions.nth(1);
  const visual = page.locator("[data-hero-visual]");

  await expect(actions).toHaveCount(2);
  await expect(
    visual.locator(
      'a[href], button, input, select, textarea, [contenteditable="true"], [tabindex="0"]',
    ),
  ).toHaveCount(0);

  await firstAction.focus();
  await expect(firstAction).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(secondAction).toBeFocused();

  await page.keyboard.press("Tab");
  const focusState = await page.evaluate(() => ({
    insideVisual: Boolean(
      globalThis.document.activeElement?.closest("[data-hero-visual]"),
    ),
    insideActions: Boolean(
      globalThis.document.activeElement?.closest("[data-hero-actions]"),
    ),
  }));

  expect(focusState.insideVisual).toBe(false);
  expect(focusState.insideActions).toBe(false);
});

test("P2.3.6 charge le portrait prioritaire avec son alternative textuelle", async ({
  page,
}) => {
  await page.goto("/");

  const portrait = page.locator("[data-hero-profile] img");
  await expect(portrait).toBeVisible();
  await expect(portrait).toHaveAttribute(
    "alt",
    "Portrait professionnel d’Alexis Guinot",
  );
  await expect(portrait).toHaveAttribute("fetchpriority", "high");

  const media = await portrait.evaluate((image) => ({
    complete: image.complete,
    naturalWidth: image.naturalWidth,
    naturalHeight: image.naturalHeight,
  }));

  expect(media.complete).toBe(true);
  expect(media.naturalWidth).toBeGreaterThan(0);
  expect(media.naturalHeight).toBeGreaterThan(0);
});
