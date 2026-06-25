import { expect, test } from "@playwright/test";

const projectPages = [
  { path: "/projets/streamfolio.html", title: /Streamfolio/i },
  { path: "/projets/solvia.html", title: /Solvia/i },
  { path: "/projets/aelia.html", title: /Aelia/i },
];

test.beforeEach(async ({ page }) => {
  const browserErrors = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  page.browserErrors = browserErrors;
});

test.afterEach(async ({ page }) => {
  expect(page.browserErrors).toEqual([]);
});

test("la page d’accueil charge les contenus principaux", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.ok()).toBe(true);
  await expect(page).toHaveTitle(/Alexis Guinot/i);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /Développeur backend/i,
  );
  await expect(page.getByRole("main")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Voir les projets/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Envoyer un e-mail/i }),
  ).toBeVisible();
});

test("la navigation mobile s’ouvre et se ferme", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Test réservé au rendu mobile.");

  await page.goto("/");
  const toggle = page.getByRole("button", { name: /ouvrir le menu/i });
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});

test("le changement de thème est persistant", async ({ page }) => {
  await page.goto("/");

  const toggle = page.getByRole("button", { name: /thème/i });
  const initialTheme = await page.locator("html").getAttribute("data-theme");

  await toggle.click();
  const changedTheme = await page.locator("html").getAttribute("data-theme");

  expect(changedTheme).toBeTruthy();
  expect(changedTheme).not.toBe(initialTheme);

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    changedTheme ?? "",
  );
});

for (const projectPage of projectPages) {
  test(`la page projet ${projectPage.path} charge correctement`, async ({
    page,
  }) => {
    const response = await page.goto(projectPage.path);

    expect(response?.ok()).toBe(true);
    await expect(page).toHaveTitle(projectPage.title);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Retour aux projets/i }),
    ).toBeVisible();
  });
}
