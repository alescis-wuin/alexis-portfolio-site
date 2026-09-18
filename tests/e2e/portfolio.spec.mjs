import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

const catalog = JSON.parse(
  readFileSync(new URL("../../data/projects.json", import.meta.url), "utf8"),
);
const publishedProjects = catalog.projects.filter(
  (project) => project.published,
);
const hiddenProjects = catalog.projects.filter((project) => !project.published);
const projectPages = publishedProjects.map((project) => ({
  ...project,
  path: `/projets/${project.slug}.html`,
  title: new RegExp(project.name, "i"),
}));
const featuredProjects = publishedProjects
  .filter((project) => project.featured)
  .sort((a, b) => a.featuredOrder - b.featuredOrder);

const responsiveProfiles = [
  { name: "mobile", width: 390, height: 844, featured: 1, catalog: 1 },
  { name: "tablet", width: 768, height: 1024, featured: 2, catalog: 2 },
  {
    name: "tablet-landscape",
    width: 1024,
    height: 768,
    featured: 2,
    catalog: 2,
  },
  { name: "laptop", width: 1280, height: 800, featured: 2, catalog: 3 },
  {
    name: "laptop-low",
    width: 1366,
    height: 768,
    featured: 2,
    catalog: 3,
  },
  { name: "desktop", width: 1440, height: 900, featured: 2, catalog: 3 },
  { name: "full-hd", width: 1920, height: 1080, featured: 2, catalog: 4 },
  { name: "ultrawide", width: 2560, height: 1080, featured: 2, catalog: 4 },
  {
    name: "ultrawide-large",
    width: 3440,
    height: 1440,
    featured: 2,
    catalog: 5,
  },
  { name: "4k", width: 3840, height: 2160, featured: 2, catalog: 5 },
];

async function expectNoHorizontalOverflow(page) {
  const geometry = await page.evaluate(() => ({
    clientWidth: globalThis.document.documentElement.clientWidth,
    scrollWidth: globalThis.document.documentElement.scrollWidth,
  }));
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
}

async function countGridColumns(locator) {
  return locator.evaluateAll((nodes) => {
    const visible = nodes.filter((node) => {
      const style = globalThis.getComputedStyle(node);
      return style.display !== "none" && style.visibility !== "hidden";
    });
    if (visible.length === 0) return 0;
    const firstTop = visible[0].getBoundingClientRect().top;
    return visible.filter(
      (node) => Math.abs(node.getBoundingClientRect().top - firstTop) <= 2,
    ).length;
  });
}

async function expectMinimumFontSize(page, selector, minimumPx) {
  const element = page.locator(selector).first();
  await expect(element).toBeVisible();

  const fontSize = await element.evaluate((node) =>
    Number.parseFloat(globalThis.getComputedStyle(node).fontSize),
  );

  expect(fontSize).toBeGreaterThanOrEqual(minimumPx);
}

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

test("le titre de la section projets reflète les projets mis en avant", async ({
  page,
}) => {
  await page.goto("/");

  const expected =
    featuredProjects.length === 1
      ? "1 étude de cas technique"
      : `${featuredProjects.length} études de cas techniques`;

  await expect(page.locator("#projects-title")).toHaveText(expected);
  await expect(page.locator("[data-featured-project-count]")).toHaveCount(0);
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

test("les cartes P2.4-D privilégient le produit et des actions lisibles", async ({
  page,
}) => {
  await page.goto("/");

  for (const project of featuredProjects) {
    const card = page.locator(
      `#projets [data-project-card][data-project-slug="${project.slug}"]`,
    );
    const image = card.locator(".project-media img");
    const repository = card.locator(".project-repository-link");

    await expect(image).toHaveAttribute("src", project.visuals.hero.src);
    expect(
      await image.evaluate(
        (node) => globalThis.getComputedStyle(node).objectFit,
      ),
    ).toBe("contain");

    const decorations = await card.evaluate((node) => ({
      before: globalThis.getComputedStyle(node, "::before").content,
      after: globalThis.getComputedStyle(node, "::after").content,
    }));
    expect(decorations.before).toBe("none");
    expect(decorations.after).toBe("none");

    await expect(card.locator(".project-metadata-label")).toContainText(
      "Technologies",
    );

    if (project.repository) {
      await expect(repository).toBeVisible();
      await expect(repository).toHaveAttribute(
        "aria-label",
        `Voir le dépôt GitHub de ${project.name}`,
      );
      const box = await repository.boundingBox();
      expect(box).not.toBeNull();
      if (box) expect(box.height).toBeGreaterThanOrEqual(43);

      const roles = await card.evaluate((node) => {
        const tag = node.querySelector(".tag");
        const button = node.querySelector(".project-repository-link");
        if (!tag || !button) return null;
        return {
          tagRadius: Number.parseFloat(
            globalThis.getComputedStyle(tag).borderTopLeftRadius,
          ),
          buttonRadius: Number.parseFloat(
            globalThis.getComputedStyle(button).borderTopLeftRadius,
          ),
        };
      });
      expect(roles).not.toBeNull();
      if (roles) {
        expect(roles.tagRadius).toBeLessThan(12);
        expect(roles.buttonRadius).toBeGreaterThan(20);
      }
    }
  }
});

test("les textes fonctionnels restent lisibles sur les viewports contraints", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  for (const selector of [
    ".hero-kicker",
    ".hero-facts dt",
    ".project-kicker",
    ".project-facts dt",
    ".project-metadata-label",
    ".tag",
  ]) {
    await expectMinimumFontSize(page, selector, 15);
  }

  for (const selector of [
    ".hero-facts dd",
    ".project-summary",
    ".project-facts dd",
    ".project-read-link",
    ".project-repository-link",
  ]) {
    await expectMinimumFontSize(page, selector, 16);
  }

  await expectNoHorizontalOverflow(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(projectPages[0].path);

  for (const selector of [
    ".project-detail-status",
    ".project-overview dt",
    ".case-study-media figcaption",
  ]) {
    await expectMinimumFontSize(page, selector, 15);
  }

  for (const selector of [".project-back-link", ".project-overview dd"]) {
    await expectMinimumFontSize(page, selector, 16);
  }

  await expectNoHorizontalOverflow(page);
});

test("le snap vertical reste réservé aux viewports suffisamment hauts", async ({
  page,
  isMobile,
}) => {
  test.skip(
    isMobile,
    "Le contrat responsive explicite est exécuté une seule fois sur Chromium desktop.",
  );

  for (const viewport of [
    { width: 1366, height: 768 },
    { width: 1920, height: 800 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");

    const geometry = await page.evaluate(() => ({
      snap: globalThis.getComputedStyle(globalThis.document.documentElement)
        .scrollSnapType,
      heroDisplay: globalThis.getComputedStyle(
        globalThis.document.querySelector("#accueil"),
      ).display,
      projectsDisplay: globalThis.getComputedStyle(
        globalThis.document.querySelector("#projets"),
      ).display,
    }));

    expect(geometry.snap).toBe("none");
    expect(geometry.heroDisplay).toBe("block");
    expect(geometry.projectsDisplay).toBe("block");

    await expectNoHorizontalOverflow(page);
  }

  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/");

  const comfortableGeometry = await page.evaluate(() => ({
    snap: globalThis.getComputedStyle(globalThis.document.documentElement)
      .scrollSnapType,
    heroDisplay: globalThis.getComputedStyle(
      globalThis.document.querySelector("#accueil"),
    ).display,
    projectsDisplay: globalThis.getComputedStyle(
      globalThis.document.querySelector("#projets"),
    ).display,
  }));

  expect(comfortableGeometry.snap).toMatch(/^y(?:\\s|$)/u);
  expect(comfortableGeometry.heroDisplay).toBe("flex");
  expect(comfortableGeometry.projectsDisplay).toBe("flex");

  await expectNoHorizontalOverflow(page);
});

test("les états interactifs restent explicites et respectent reduced motion", async ({
  page,
  isMobile,
}) => {
  test.skip(
    isMobile,
    "Le contrat interactif explicite est exécuté une seule fois sur Chromium desktop.",
  );

  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");

  await page.keyboard.press("Tab");

  const focusState = await page.evaluate(() => {
    const element = globalThis.document.activeElement;
    const style = globalThis.getComputedStyle(element);

    return {
      focusVisible: element.matches(":focus-visible"),
      outlineWidth: Number.parseFloat(style.outlineWidth),
      outlineOffset: Number.parseFloat(style.outlineOffset),
    };
  });

  expect(focusState.focusVisible).toBe(true);
  expect(focusState.outlineWidth).toBeGreaterThanOrEqual(3);
  expect(focusState.outlineOffset).toBeGreaterThanOrEqual(4);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const navToggle = page.locator(".nav-toggle").first();
  await expect(navToggle).toBeVisible();

  const closedState = await navToggle.evaluate((node) => {
    const style = globalThis.getComputedStyle(node);

    return {
      background: style.backgroundColor,
      border: style.borderTopColor,
    };
  });

  await navToggle.click();
  await expect(navToggle).toHaveAttribute("aria-expanded", "true");

  await expect
    .poll(async () =>
      navToggle.evaluate(
        (node) => globalThis.getComputedStyle(node).backgroundColor,
      ),
    )
    .not.toBe(closedState.background);

  await expect
    .poll(async () =>
      navToggle.evaluate(
        (node) => globalThis.getComputedStyle(node).borderTopColor,
      ),
    )
    .not.toBe(closedState.border);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/");

  const action = page.locator(".button").first();
  await expect(action).toBeVisible();
  await action.hover();

  expect(
    await action.evaluate(
      (node) => globalThis.getComputedStyle(node).transform,
    ),
  ).toBe("none");

  const projectCard = page.locator("#projets [data-project-card]").first();
  const projectImage = projectCard.locator(".project-media img");

  await projectCard.hover();

  expect(
    await projectCard.evaluate(
      (node) => globalThis.getComputedStyle(node).transform,
    ),
  ).toBe("none");

  expect(
    await projectImage.evaluate(
      (node) => globalThis.getComputedStyle(node).transform,
    ),
  ).toBe("none");
});

test("le catalogue complet expose tous les projets", async ({ page }) => {
  const response = await page.goto("/projets/");

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /Projets/i,
  );
  await expect(page.locator("[data-project-card]")).toHaveCount(
    publishedProjects.length,
  );
});

test("les filtres du catalogue combinent les facettes", async ({ page }) => {
  await page.goto("/projets/");

  const statusCounts = new Map();
  for (const project of publishedProjects) {
    statusCounts.set(
      project.status,
      (statusCounts.get(project.status) || 0) + 1,
    );
  }

  const target = [...statusCounts].find(
    ([, count]) => count > 0 && count < publishedProjects.length,
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
    publishedProjects.length,
  );
});

test("le filtre C# expose uniquement les projets C#", async ({ page }) => {
  await page.goto("/projets/");

  const csharpProjects = publishedProjects.filter((project) =>
    project.languages.includes("csharp"),
  );

  expect(csharpProjects.length).toBeGreaterThan(0);
  await page.locator('[data-filter-group="language"]').selectOption("csharp");
  await expect(page.locator("[data-project-card]:visible")).toHaveCount(
    csharpProjects.length,
  );

  for (const project of csharpProjects) {
    await expect(
      page.locator(
        `[data-project-card][data-project-slug="${project.slug}"]:visible`,
      ),
    ).toBeVisible();
  }
});

test("les projets non publiés restent hors de la surface publique", async ({
  page,
  request,
}) => {
  const response = await page.goto("/projets/");
  expect(response?.ok()).toBe(true);

  const sitemapResponse = await request.get("/sitemap.xml");
  expect(sitemapResponse.ok()).toBe(true);
  const sitemap = await sitemapResponse.text();

  for (const project of hiddenProjects) {
    await expect(
      page.locator(`[data-project-card][data-project-slug="${project.slug}"]`),
    ).toHaveCount(0);
    expect(sitemap).not.toContain(`/projets/${project.slug}.html`);

    const detailResponse = await request.get(`/projets/${project.slug}.html`);
    expect(detailResponse.status()).toBe(404);
  }
});

test("la navigation de section suit l’architecture P2.1", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const sectionIds = await page
    .locator("[data-section]")
    .evaluateAll((nodes) => nodes.map((node) => node.id));
  expect(sectionIds).toEqual([
    "accueil",
    "projets",
    "competences",
    "experience",
    "formation",
    "apropos",
    "contact",
  ]);
  await expect(page.locator("[data-section-arrows]")).toHaveCount(0);

  const projectsLink = page.locator(
    '[data-section-rail] [data-section-link="projets"]',
  );
  await expect(projectsLink).toBeVisible();
  await projectsLink.click();
  await expect(page).toHaveURL(/#projets$/);
  await expect(projectsLink).toHaveAttribute("aria-current", "location");
});

test("le menu mobile remplace le rail de sections", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(page.locator("[data-section-rail]")).toBeHidden();
  const toggle = page.locator("[data-nav-toggle]");
  await expect(toggle).toBeVisible();
  await toggle.click();

  const navigation = page.locator("[data-site-nav]");
  await expect(navigation).toBeVisible();
  await navigation
    .getByRole("link", { name: "Expérience", exact: true })
    .click();
  await expect(page).toHaveURL(/#experience$/);
  await expect(navigation).toBeHidden();
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

test("le site reste sur un thème sombre unique", async ({ page }) => {
  await page.goto(projectPages[0].path);

  await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute(
    "content",
    "dark",
  );
  await expect(page.locator("[data-theme-toggle]")).toHaveCount(0);
  expect(await page.locator("html").getAttribute("data-theme")).toBeNull();

  const initialColorScheme = await page.evaluate(
    () =>
      globalThis.getComputedStyle(globalThis.document.documentElement)
        .colorScheme,
  );
  expect(initialColorScheme).toBe("dark");

  await page.evaluate(() => {
    globalThis.localStorage.setItem("theme", "light");
  });
  await page.reload();

  expect(await page.locator("html").getAttribute("data-theme")).toBeNull();

  const reloadedColorScheme = await page.evaluate(
    () =>
      globalThis.getComputedStyle(globalThis.document.documentElement)
        .colorScheme,
  );
  expect(reloadedColorScheme).toBe("dark");
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
    await expect(page.locator("body")).toHaveAttribute(
      "data-project-slug",
      projectPage.slug,
    );
    const backLink = page
      .locator("header")
      .getByRole("link", { name: /Retour aux autres projets/i });
    await expect(backLink).toBeVisible();
    expect(
      await backLink.evaluate(
        (node) => globalThis.getComputedStyle(node).backgroundColor,
      ),
    ).toBe("rgba(0, 0, 0, 0)");
    await expect(page.locator(".project-detail .breadcrumb")).toHaveCount(0);
    await expect(page.locator("[data-case-study]")).toBeVisible();
    const overview = page.locator("[data-project-overview]");
    await expect(overview).toBeVisible();
    await expect(overview).toContainText(projectPage.mission);
    await expect(overview).toContainText(projectPage.proof);

    if (projectPage.repository) {
      const repository = page.locator(".project-repository-button");
      await expect(repository).toBeVisible();
      const box = await repository.boundingBox();
      expect(box).not.toBeNull();
      if (box) expect(box.height).toBeGreaterThanOrEqual(43);
    }

    const hero = page.locator("[data-project-hero] img");
    const architecture = page.locator("[data-project-architecture] img");
    const gallery = page.locator("[data-project-gallery] [data-gallery-item]");

    await expect(hero).toHaveAttribute(
      "src",
      `../${projectPage.visuals.hero.src}`,
    );
    await expect(hero).toHaveAttribute("fetchpriority", "high");
    await expect(architecture).toHaveAttribute(
      "src",
      `../${projectPage.visuals.architecture.src}`,
    );
    await expect(architecture).toHaveAttribute("loading", "lazy");
    await expect(gallery).toHaveCount(projectPage.visuals.gallery.length);

    expect(
      await hero.evaluate(
        (node) =>
          node.complete && node.naturalWidth > 0 && node.naturalHeight > 0,
      ),
    ).toBe(true);

    await architecture.scrollIntoViewIfNeeded();
    await expect(backLink).toBeVisible();
    await expect
      .poll(() =>
        architecture.evaluate(
          (node) =>
            node.complete && node.naturalWidth > 0 && node.naturalHeight > 0,
        ),
      )
      .toBe(true);

    for (
      let index = 0;
      index < projectPage.visuals.gallery.length;
      index += 1
    ) {
      const image = gallery.nth(index).locator("img");
      await expect(image).toHaveAttribute("loading", "lazy");
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          image.evaluate(
            (node) =>
              node.complete && node.naturalWidth > 0 && node.naturalHeight > 0,
          ),
        )
        .toBe(true);
    }

    for (const heading of [
      /Comment le système est structuré/i,
      /Décisions techniques/i,
      /Difficultés résolues/i,
      /Tests et garde-fous/i,
      /Livraison et CI\/CD/i,
      /Résultats observables/i,
      /Compromis techniques/i,
      /Limites assumées/i,
      /Prochaines étapes/i,
    ]) {
      await expect(
        page.getByRole("heading", { level: 2, name: heading }),
      ).toBeVisible();
    }
  });
}

test("P2.4-D garde le masthead et le schéma lisibles dans un viewport large et bas", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Test de densité réservé au projet desktop.");
  await page.setViewportSize({ width: 1920, height: 800 });
  await page.goto("/projets/calcufolio.html");
  await expectNoHorizontalOverflow(page);

  const detail = page.locator(".project-detail");
  const detailBox = await detail.boundingBox();
  expect(detailBox).not.toBeNull();
  if (detailBox) {
    expect(detailBox.y + detailBox.height).toBeLessThanOrEqual(802);
  }

  const architecture = page.locator("[data-project-architecture] img");
  await architecture.scrollIntoViewIfNeeded();
  const architectureBox = await architecture.boundingBox();
  expect(architectureBox).not.toBeNull();
  if (architectureBox) {
    expect(architectureBox.height).toBeLessThanOrEqual(546);
  }
});

test.describe("P2.4-C responsive large et ultrawide", () => {
  for (const profile of responsiveProfiles) {
    test(`${profile.name} ${profile.width}x${profile.height}`, async ({
      page,
      isMobile,
    }) => {
      test.skip(
        isMobile,
        "La matrice explicite est exécutée une seule fois sur Chromium desktop.",
      );
      await page.setViewportSize({
        width: profile.width,
        height: profile.height,
      });

      await page.goto("/");
      await expectNoHorizontalOverflow(page);

      const featuredCards = page.locator("#projets [data-project-card]");
      await expect(featuredCards).toHaveCount(featuredProjects.length);
      expect(await countGridColumns(featuredCards)).toBe(profile.featured);

      const heroLeadWidth = await page
        .locator("#accueil .hero-lead")
        .evaluate((node) => node.getBoundingClientRect().width);
      expect(heroLeadWidth).toBeLessThanOrEqual(760);

      const homeFrame = page.locator("#projets .frame");
      if (profile.width >= 1440) {
        expect(
          await homeFrame.evaluate(
            (node) => node.getBoundingClientRect().width,
          ),
        ).toBeGreaterThan(1152);
      }

      if (profile.width >= 1180) {
        const rail = page.locator(".section-rail");
        const featured = page.locator("#projets .project-grid-focus");
        const [railBox, featuredBox] = await Promise.all([
          rail.boundingBox(),
          featured.boundingBox(),
        ]);
        expect(railBox).not.toBeNull();
        expect(featuredBox).not.toBeNull();
        if (railBox && featuredBox) {
          expect(railBox.x + railBox.width).toBeLessThanOrEqual(
            featuredBox.x + 2,
          );
        }
      }

      await page.goto("/projets/");
      await expectNoHorizontalOverflow(page);
      const catalogCards = page.locator(
        "[data-project-catalog] [data-project-card]",
      );
      await expect(catalogCards).toHaveCount(publishedProjects.length);
      expect(await countGridColumns(catalogCards)).toBe(profile.catalog);

      const catalogFrameWidth = await page
        .locator("[data-project-catalog]")
        .evaluate((node) => node.getBoundingClientRect().width);
      if (profile.width >= 1440) {
        expect(catalogFrameWidth).toBeGreaterThan(1152);
      }
      if (profile.width >= 3440) {
        expect(catalogFrameWidth).toBeLessThanOrEqual(2800 + 1);
      }

      await page.goto(projectPages[0].path);
      await expectNoHorizontalOverflow(page);
      const architecture = page.locator("[data-project-architecture] img");
      await architecture.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          architecture.evaluate(
            (node) =>
              node.complete && node.naturalWidth > 0 && node.naturalHeight > 0,
          ),
        )
        .toBe(true);

      const architectureWidth = await architecture.evaluate(
        (node) => node.getBoundingClientRect().width,
      );
      if (profile.width >= 1920) {
        expect(architectureWidth).toBeGreaterThan(1152);
      }

      const projectLeadWidth = await page
        .locator(".project-detail-copy .hero-lead")
        .evaluate((node) => node.getBoundingClientRect().width);
      expect(projectLeadWidth).toBeLessThanOrEqual(760);
    });
  }
});
