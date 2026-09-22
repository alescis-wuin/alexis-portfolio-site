import { expect, test } from "@playwright/test";

const featuredSlugs = ["alycia", "streamfolio", "agenda", "aelia"];

async function expectNoHorizontalOverflow(page) {
  const geometry = await page.evaluate(() => ({
    clientWidth: globalThis.document.documentElement.clientWidth,
    scrollWidth: globalThis.document.documentElement.scrollWidth,
  }));
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
}

test("P2.4.1 hierarchise les quatre projets featured sur grand ecran", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "La geometrie large est validee sur Chromium desktop.");
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/");

  const cards = page.locator("#projets [data-project-card]");
  await expect(cards).toHaveCount(4);

  for (const [index, slug] of featuredSlugs.entries()) {
    await expect(cards.nth(index)).toHaveAttribute("data-project-slug", slug);
    expect(await cards.nth(index).locator(".tag").count()).toBeLessThanOrEqual(
      4,
    );
  }

  await expect(cards.first()).toHaveAttribute("data-project-priority", "lead");

  const boxes = await Promise.all(
    [0, 1, 2, 3].map((index) => cards.nth(index).boundingBox()),
  );
  boxes.forEach((box) => expect(box).not.toBeNull());

  const [lead, second, third, fourth] = boxes;
  if (lead && second && third && fourth) {
    expect(Math.abs(lead.y - second.y)).toBeLessThanOrEqual(2);
    expect(lead.width).toBeGreaterThan(second.width * 1.25);
    expect(third.y).toBeGreaterThan(lead.y + 20);
    expect(Math.abs(third.y - fourth.y)).toBeLessThanOrEqual(2);
    expect(Math.abs(third.width - fourth.width)).toBeLessThanOrEqual(2);
  }

  await expectNoHorizontalOverflow(page);
});

test("P2.4.1 conserve une lecture lineaire sur mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const cards = page.locator("#projets [data-project-card]");
  await expect(cards).toHaveCount(4);

  const boxes = await Promise.all(
    [0, 1, 2, 3].map((index) => cards.nth(index).boundingBox()),
  );
  boxes.forEach((box) => expect(box).not.toBeNull());

  for (let index = 1; index < boxes.length; index += 1) {
    const previous = boxes[index - 1];
    const current = boxes[index];
    if (previous && current) {
      expect(current.y).toBeGreaterThan(previous.y + previous.height - 2);
      expect(Math.abs(current.width - previous.width)).toBeLessThanOrEqual(2);
    }
  }

  await expectNoHorizontalOverflow(page);
});
