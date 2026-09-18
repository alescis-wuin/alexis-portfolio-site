import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page) {
  const geometry = await page.evaluate(() => ({
    clientWidth: globalThis.document.documentElement.clientWidth,
    scrollWidth: globalThis.document.documentElement.scrollWidth,
  }));
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
}

async function columnCount(locator) {
  return locator.evaluate((node) => {
    const columns = globalThis.getComputedStyle(node).gridTemplateColumns;
    return columns.split(" ").filter(Boolean).length;
  });
}

test("P2.4.2 donne au lead une densite distincte sans appauvrir les autres cartes", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "La composition large est validee sur Chromium desktop.");
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/");

  const cards = page.locator("#projets [data-project-card]");
  await expect(cards).toHaveCount(4);
  await expect(cards.first()).toHaveAttribute("data-project-density", "lead");

  for (let index = 1; index < 4; index += 1) {
    await expect(cards.nth(index)).toHaveAttribute(
      "data-project-density",
      "featured",
    );
  }

  expect(await cards.first().locator(".tag").count()).toBeLessThanOrEqual(4);
  for (let index = 1; index < 4; index += 1) {
    expect(await cards.nth(index).locator(".tag").count()).toBeLessThanOrEqual(
      3,
    );
  }

  expect(await columnCount(cards.first().locator(".project-facts"))).toBe(2);

  for (const card of await cards.all()) {
    await expect(card.locator(".project-summary")).toBeVisible();
    await expect(card.locator(".project-fact-mission")).toBeVisible();
    await expect(card.locator(".project-fact-proof")).toBeVisible();
    await expect(card.locator(".project-stack")).toBeVisible();

    for (const action of await card.locator(".project-actions a").all()) {
      const box = await action.boundingBox();
      expect(box).not.toBeNull();
      if (box) expect(box.height).toBeGreaterThanOrEqual(43.99);
    }
  }

  await expectNoHorizontalOverflow(page);
});

test("P2.4.2 empile faits et technologies proprement sur mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const cards = page.locator("#projets [data-project-card]");
  await expect(cards).toHaveCount(4);

  for (const card of await cards.all()) {
    for (const fact of await card.locator(".project-fact").all()) {
      expect(await columnCount(fact)).toBe(1);
    }
    expect(await columnCount(card.locator(".project-stack"))).toBe(1);
  }

  await expectNoHorizontalOverflow(page);
});

test("P2.4.2 maintient une densite catalogue limitee", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/projets/");

  const cards = page.locator("[data-project-card]");
  await expect(cards).toHaveCount(6);

  for (const card of await cards.all()) {
    await expect(card).toHaveAttribute("data-project-density", "catalog");
    expect(await card.locator(".tag").count()).toBeLessThanOrEqual(3);
    await expect(card.locator(".project-summary")).toBeVisible();
    await expect(card.locator(".project-fact-mission")).toBeVisible();
    await expect(card.locator(".project-fact-proof")).toBeVisible();
  }

  await expectNoHorizontalOverflow(page);
});
