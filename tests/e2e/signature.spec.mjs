import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { expect, test } from "@playwright/test";
const require = createRequire(import.meta.url);
const data = JSON.parse(
  readFileSync(new URL("../../data/projects.json", import.meta.url)),
);
const published = data.projects.filter((p) => p.published);
const pages = [
  "/",
  "/projets/",
  ...published.map((p) => `/projets/${p.slug}.html`),
];

test.beforeEach(async ({ page }) => {
  page.errors = [];
  page.on("pageerror", (error) => page.errors.push(error.message));
});
test.afterEach(async ({ page }) => expect(page.errors).toEqual([]));

for (const path of pages) {
  test(`accessibilité automatisée et structure : ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
    await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
    const result = await page.evaluate(async () =>
      globalThis.axe.run({
        runOnly: {
          type: "tag",
          values: [
            "wcag2a",
            "wcag2aa",
            "wcag21aa",
            "wcag22aa",
            "best-practice",
          ],
        },
      }),
    );
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  });
}

test("parcours principal, catalogue canonique et données éditoriales", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".hero-kicker")).toContainText(
    "Concepteur-développeur full-stack",
  );
  await expect(page.locator(".hero-search")).toContainText("octobre 2026");
  await expect(page.locator(".brand-name")).toBeVisible();
  const featured = published
    .filter((p) => p.featured)
    .sort((a, b) => a.featuredOrder - b.featuredOrder);
  expect(
    await page
      .locator("[data-project-card]")
      .evaluateAll((nodes) => nodes.map((n) => n.dataset.projectSlug)),
  ).toEqual(featured.map((p) => p.slug));
  await page.getByRole("link", { name: "Explorer mes projets" }).click();
  await expect(page).toHaveURL(/#projets$/);
  await page.locator("[data-project-card] .project-read-link").first().click();
  await expect(page.locator("h1")).toHaveText(featured[0].name);
  await expect(page.locator(".case-nav")).toBeVisible();
  await page
    .locator(".case-nav")
    .getByRole("link", { name: "Tests", exact: true })
    .click();
  await expect(page).toHaveURL(/#quality-title$/);
  const cv = await page.request.get("/assets/cv/CV_Alexis-GUINOT.pdf");
  expect(cv.ok()).toBe(true);
  expect((await cv.body()).subarray(0, 5).toString()).toBe("%PDF-");
});

test("menu compact : clavier, Échap, transfert du focus et redimensionnement", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.locator("[data-nav-toggle]");
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  await expect(page.locator("#home-navigation a").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await page
    .locator("#home-navigation")
    .getByRole("link", { name: "Contact", exact: true })
    .click();
  await expect(page.locator("#contact")).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(toggle).toBeHidden();
  await expect(page.locator("#home-navigation")).toBeVisible();
});

test("lien d’évitement et contenu sans JavaScript", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  await expect(page.locator("[data-site-nav]")).toBeVisible();
  await expect(page.locator("[data-nav-toggle]")).toBeHidden();
  await expect(page.locator("[data-project-card]")).toHaveCount(3);
  await page.goto("http://127.0.0.1:4173/projets/");
  await expect(page.locator("[data-project-card]:visible")).toHaveCount(
    published.length,
  );
  await context.close();
});

test("copie d’adresse : succès et refus du presse-papiers", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(globalThis.navigator, "clipboard", {
      value: {
        writeText: async (text) => {
          globalThis.copied = text;
        },
      },
    });
  });
  await page.goto("/");
  await page.locator("[data-copy-email]").click();
  await expect(page.locator("[data-copy-feedback]")).toHaveText(
    "Adresse e-mail copiée.",
  );
  expect(await page.evaluate(() => globalThis.copied)).toBe(
    "alexis.guinot@onsiea.com",
  );
  await page.evaluate(() => {
    globalThis.navigator.clipboard.writeText = async () => {
      throw new Error("Denied");
    };
  });
  await page.locator("[data-copy-email]").click();
  await expect(page.locator("[data-copy-feedback]")).toContainText(
    "sélectionner l’adresse",
  );
  await expect(page.locator("[data-contact-primary]")).toHaveAttribute(
    "href",
    "mailto:alexis.guinot@onsiea.com",
  );
});

test("filtres combinés, aucun résultat, puis réinitialisation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/projets/");
  await page.locator('[data-filter-group="language"]').selectOption("java");
  await page.locator('[data-filter-group="type"]').selectOption("mobile");
  await expect(page.locator("[data-project-empty]")).toBeVisible();
  await expect(page.locator("[data-project-card]:visible")).toHaveCount(0);
  await page.locator("[data-filter-reset]").click();
  await expect(page.locator("[data-project-card]:visible")).toHaveCount(
    published.length,
  );
});

test("reflow de toutes les pages de 320 px à 4K", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Matrice de tailles CSS exécutée une seule fois.");
  test.setTimeout(90000);
  for (const width of [
    320, 360, 390, 768, 1024, 1280, 1440, 1920, 2560, 3840,
  ]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of pages) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () =>
          globalThis.document.documentElement.scrollWidth -
          globalThis.innerWidth,
      );
      expect(overflow, `${path} à ${width}px`).toBeLessThanOrEqual(1);
      await expect(page.locator("h1")).toBeVisible();
    }
  }
});

test("préférences d’accessibilité, texte agrandi et absence de tiers", async ({
  page,
}) => {
  const external = [];
  page.on("request", (r) => {
    if (!r.url().startsWith("http://127.0.0.1:")) external.push(r.url());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(
    await page
      .locator("html")
      .evaluate((n) => globalThis.getComputedStyle(n).scrollSnapType),
  ).toBe("none");
  expect(
    await page
      .locator("html")
      .evaluate((n) => globalThis.getComputedStyle(n).scrollBehavior),
  ).toBe("auto");
  await page.setViewportSize({ width: 640, height: 900 });
  await page.addStyleTag({ content: "html {font-size:200% !important}" });
  expect(
    await page.evaluate(
      () =>
        globalThis.document.documentElement.scrollWidth - globalThis.innerWidth,
    ),
  ).toBeLessThanOrEqual(1);
  expect(external).toEqual([]);
});
