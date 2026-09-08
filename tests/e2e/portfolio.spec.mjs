import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

const catalog = JSON.parse(
  readFileSync(new URL("../../data/projects.json", import.meta.url), "utf8"),
);
const projectPages = catalog.projects.map((project) => ({
  ...project,
  path: `/projets/${project.slug}.html`,
  title: new RegExp(project.name, "i"),
}));
const featuredProjects = catalog.projects
  .filter((project) => project.featured)
  .sort((a, b) => a.featuredOrder - b.featuredOrder);

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

test("les projets mis en avant viennent du catalogue canonique", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.locator("#projets [data-project-card]")).toHaveCount(
    featuredProjects.length,
  );

  for (const project of featuredProjects) {
    await expect(
      page
        .locator(
          `#projets [data-project-card][data-project-slug="${project.slug}"]`,
        )
        .first(),
    ).toBeVisible();
  }
});

test("le catalogue complet expose tous les projets", async ({ page }) => {
  const response = await page.goto("/projets/");

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /Projets/i,
  );
  await expect(page.locator("[data-project-card]")).toHaveCount(
    catalog.projects.length,
  );
});

test("les filtres du catalogue combinent les facettes", async ({ page }) => {
  await page.goto("/projets/");

  const statusCounts = new Map();
  for (const project of catalog.projects) {
    statusCounts.set(
      project.status,
      (statusCounts.get(project.status) || 0) + 1,
    );
  }

  const target = [...statusCounts].find(
    ([, count]) => count > 0 && count < catalog.projects.length,
  );
  test.skip(!target, "Aucun statut discriminant dans le catalogue.");

  const [status, expectedCount] = target;
  await page.locator('[data-filter-group="status"]').selectOption(status);
  await expect(page.locator("[data-project-card]:visible")).toHaveCount(
    expectedCount,
  );
  await expect(page.locator("[data-project-count]")).toContainText(
    String(expectedCount),
  );

  await page.getByRole("button", { name: /Réinitialiser/i }).click();
  await expect(page.locator("[data-project-card]:visible")).toHaveCount(
    catalog.projects.length,
  );
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
  await page.goto(projectPages[0].path);

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
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      projectPage.name,
    );
    await expect(
      page.getByRole("link", { name: /Retour aux projets/i }),
    ).toBeVisible();
  });
}
