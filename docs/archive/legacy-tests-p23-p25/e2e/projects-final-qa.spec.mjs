import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

const catalog = JSON.parse(
  readFileSync(new URL("../../data/projects.json", import.meta.url), "utf8"),
);

const projectPaths = catalog.projects
  .filter((project) => project.published)
  .map((project) => `/projets/${project.slug}.html`);

const publicPaths = ["/", "/projets/", ...projectPaths];

const finalProfiles = [
  { id: "reflow-320", width: 320, height: 720 },
  { id: "mobile", width: 390, height: 844 },
  { id: "tablet", width: 768, height: 1024 },
  { id: "tablet-landscape", width: 1024, height: 768 },
  { id: "laptop-low", width: 1366, height: 768 },
  { id: "desktop-low", width: 1920, height: 800 },
  { id: "full-hd", width: 1920, height: 1080 },
  { id: "ultrawide", width: 2560, height: 1080 },
  { id: "ultrawide-large", width: 3440, height: 1440 },
  { id: "4k", width: 3840, height: 2160 },
];

async function expectPublicSurfaceContract(page, path) {
  const response = await page.goto(path, { waitUntil: "load" });
  expect(response?.ok(), `${path}: HTTP response`).toBe(true);

  const contract = await page.evaluate(() => {
    const root = globalThis.document.documentElement;
    const buttonsWithoutName = [
      ...globalThis.document.querySelectorAll("button"),
    ]
      .filter((button) => {
        const text = button.textContent?.trim() ?? "";
        return !(
          button.getAttribute("aria-label") ||
          button.getAttribute("aria-labelledby") ||
          button.getAttribute("title") ||
          text
        );
      })
      .map((button) => button.outerHTML.slice(0, 160));

    return {
      clientWidth: root.clientWidth,
      scrollWidth: root.scrollWidth,
      mainCount: globalThis.document.querySelectorAll("main").length,
      h1Count: globalThis.document.querySelectorAll("h1").length,
      imagesWithoutAlt:
        globalThis.document.querySelectorAll("img:not([alt])").length,
      buttonsWithoutName,
    };
  });

  expect(
    contract.scrollWidth,
    `${path}: horizontal overflow`,
  ).toBeLessThanOrEqual(contract.clientWidth + 1);
  expect(contract.mainCount, `${path}: main landmark`).toBe(1);
  expect(contract.h1Count, `${path}: h1`).toBe(1);
  expect(contract.imagesWithoutAlt, `${path}: image alt contract`).toBe(0);
  expect(
    contract.buttonsWithoutName,
    `${path}: button accessible names`,
  ).toEqual([]);
}

for (const profile of finalProfiles) {
  test(`P2.4-G ${profile.id} garde toutes les surfaces publiques sans overflow`, async ({
    page,
    isMobile,
  }) => {
    test.skip(
      isMobile,
      "La matrice explicite est executee une seule fois sur Chromium desktop.",
    );

    await page.setViewportSize({
      width: profile.width,
      height: profile.height,
    });

    for (const path of publicPaths) {
      await expectPublicSurfaceContract(page, path);
    }
  });
}

test("P2.4-G garde les dependances runtime locales et le DOM borne", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Le contrat performance est execute une seule fois.");

  const requestedUrls = [];
  page.on("request", (request) => requestedUrls.push(request.url()));

  for (const path of ["/", "/projets/", "/projets/alycia.html"]) {
    await page.goto(path, { waitUntil: "load" });

    const metrics = await page.evaluate(() => ({
      nodes: globalThis.document.getElementsByTagName("*").length,
      stylesheets: globalThis.document.querySelectorAll(
        'link[rel="stylesheet"]',
      ).length,
      externalScripts:
        globalThis.document.querySelectorAll("script[src]").length,
    }));

    expect(metrics.nodes, `${path}: DOM nodes`).toBeLessThan(1000);
    expect(
      metrics.stylesheets,
      `${path}: stylesheet count`,
    ).toBeLessThanOrEqual(3);
    expect(
      metrics.externalScripts,
      `${path}: script count`,
    ).toBeLessThanOrEqual(1);
  }

  const unexpectedOrigins = requestedUrls
    .filter((url) => /^https?:/i.test(url))
    .map((url) => new URL(url).origin)
    .filter((origin) => origin !== "http://127.0.0.1:4173");

  expect([...new Set(unexpectedOrigins)]).toEqual([]);
});

test("P2.4-G borne le viewer aux deux extremes de la matrice", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Le viewer final est mesure une seule fois.");

  for (const profile of [
    { id: "reflow-320", width: 320, height: 720 },
    { id: "4k", width: 3840, height: 2160 },
  ]) {
    await page.setViewportSize({
      width: profile.width,
      height: profile.height,
    });
    await page.goto("/projets/alycia.html");

    const trigger = page
      .locator("[data-project-hero] [data-media-viewer-trigger]")
      .first();
    await trigger.focus();
    await trigger.click();

    const dialog = page.locator("[data-media-viewer]");
    await expect(dialog).toHaveJSProperty("open", true);
    await expect(page.locator("[data-media-viewer-close]")).toBeFocused();

    const geometry = await dialog.evaluate((node) => {
      const panel = node.querySelector(".media-viewer-panel");
      const image = node.querySelector("[data-media-viewer-image]");
      const panelRect = panel?.getBoundingClientRect();
      const imageRect = image?.getBoundingClientRect();
      return {
        viewportWidth: globalThis.innerWidth,
        viewportHeight: globalThis.innerHeight,
        scrollWidth: globalThis.document.documentElement.scrollWidth,
        panelLeft: panelRect?.left ?? -1,
        panelRight: panelRect?.right ?? Number.POSITIVE_INFINITY,
        panelTop: panelRect?.top ?? -1,
        panelBottom: panelRect?.bottom ?? Number.POSITIVE_INFINITY,
        imageWidth: imageRect?.width ?? 0,
        imageHeight: imageRect?.height ?? 0,
      };
    });

    expect(
      geometry.scrollWidth,
      `${profile.id}: document overflow`,
    ).toBeLessThanOrEqual(geometry.viewportWidth + 1);
    expect(
      geometry.panelLeft,
      `${profile.id}: panel left`,
    ).toBeGreaterThanOrEqual(0);
    expect(
      geometry.panelTop,
      `${profile.id}: panel top`,
    ).toBeGreaterThanOrEqual(0);
    expect(
      geometry.panelRight,
      `${profile.id}: panel right`,
    ).toBeLessThanOrEqual(geometry.viewportWidth + 1);
    expect(
      geometry.panelBottom,
      `${profile.id}: panel bottom`,
    ).toBeLessThanOrEqual(geometry.viewportHeight + 1);
    expect(geometry.imageWidth).toBeGreaterThan(0);
    expect(geometry.imageHeight).toBeGreaterThan(0);

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveJSProperty("open", false);
    await expect(trigger).toBeFocused();
  }
});
