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
    /Développeur/i,
  );
  await expect(page.getByRole("main")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Voir les projets/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Envoyer un e-mail/i }),
  ).toBeVisible();
});

test("la sélection de projets publique reste cohérente", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("[data-project-card]")).toHaveCount(
    projectPages.length,
  );

  for (const projectPage of projectPages) {
    await expect(
      page
        .locator(`[data-project-card] a[href="${projectPage.path.slice(1)}"]`)
        .first(),
    ).toBeVisible();
  }
});

test("les flèches utilisent le défilement natif", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const next = page.getByRole("button", { name: /Section suivante/i });
  await expect(next).toBeVisible();
  await next.click();

  await expect(page).toHaveURL(/#valeur$/);
  await expect(page.locator('[data-section-link="valeur"]')).toHaveAttribute(
    "aria-current",
    "location",
  );
});

test("la page d’accueil reste exploitable en rendu mobile", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "Test réservé au rendu mobile.");

  const response = await page.goto("/");
  expect(response?.ok()).toBe(true);
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.locator("#accueil")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Voir les projets/i }),
  ).toBeVisible();
});

test("le changement de thème est persistant sur une page projet", async ({
  page,
}) => {
  await page.goto("/projets/streamfolio.html");

  const toggle = page.getByRole("button", { name: /thème/i });
  await expect(toggle).toBeVisible();

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
