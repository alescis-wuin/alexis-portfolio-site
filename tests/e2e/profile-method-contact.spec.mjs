import { expect, test } from "@playwright/test";

test("P2.5-D expose une methode lisible et un contact direct", async ({
  page,
}) => {
  const response = await page.goto("/#apropos");
  expect(response?.ok()).toBe(true);

  const method = page.locator('[data-profile-section="method"]');
  await expect(method).toBeVisible();
  await expect(method.locator("[data-method-step]")).toHaveCount(4);

  for (const [selector, label] of [
    ['[data-method-step="clarify"]', "Clarifier"],
    ['[data-method-step="structure"]', "Structurer"],
    ['[data-method-step="prototype"]', "Prototyper"],
    ['[data-method-step="verify"]', "Tester et documenter"],
  ]) {
    await expect(method.locator(selector)).toContainText(label);
  }

  const contact = page.locator('[data-profile-section="contact"]');
  await contact.scrollIntoViewIfNeeded();
  await expect(contact).toBeVisible();

  const email = contact.getByRole("link", { name: /Envoyer un e-mail/i });
  await expect(email).toHaveAttribute("data-contact-primary", "");
  await expect(email).toHaveAttribute(
    "href",
    "mailto:alexis.guinot@onsiea.com",
  );
  await expect(email).toContainText("alexis.guinot@onsiea.com");
  await email.focus();
  await expect(email).toBeFocused();

  await expect(contact.getByRole("link", { name: /LinkedIn/ })).toBeVisible();
  await expect(contact.getByRole("link", { name: /GitHub/ })).toBeVisible();
  await expect(contact.getByRole("link", { name: /CV PDF/ })).toBeVisible();
});

test("P2.5-D garde methode et contact lisibles a 320 px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#apropos");

  for (const selector of [
    '[data-profile-section="method"]',
    '[data-profile-section="contact"]',
  ]) {
    const section = page.locator(selector);
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();

    const geometry = await section.evaluate((node) => {
      const doc = node.ownerDocument;
      const rect = node.getBoundingClientRect();

      return {
        left: rect.left,
        right: rect.right,
        width: rect.width,
        clientWidth: doc.documentElement.clientWidth,
        scrollWidth: doc.documentElement.scrollWidth,
      };
    });

    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
    expect(geometry.left).toBeGreaterThanOrEqual(-1);
    expect(geometry.right).toBeLessThanOrEqual(geometry.clientWidth + 1);
    expect(geometry.width).toBeGreaterThan(0);
  }

  await expect(page.locator('[data-method-step="verify"]')).toBeVisible();
  await expect(page.locator("[data-contact-primary]")).toBeVisible();
});
