import { expect, test } from "@playwright/test";

const responsiveProfiles = [
  { id: "reflow-320", width: 320, height: 720 },
  { id: "mobile", width: 390, height: 844 },
  { id: "tablet", width: 768, height: 1024 },
  { id: "tablet-landscape", width: 1024, height: 768 },
  { id: "laptop-low", width: 1366, height: 768 },
  { id: "desktop-low", width: 1920, height: 800 },
  { id: "full-hd", width: 1920, height: 1080 },
  { id: "ultrawide", width: 2560, height: 1080 },
  { id: "ultrawide-large", width: 3440, height: 1440 },
  { id: "zoom-200-simulated", width: 960, height: 540 },
];

const parseRgb = (value) => {
  const channels = value
    .match(/[\d.]+/gu)
    ?.slice(0, 3)
    .map(Number);
  if (!channels || channels.length !== 3) {
    throw new Error(`Couleur RGB inattendue: ${value}`);
  }
  return channels;
};

const luminance = ([red, green, blue]) => {
  const linear = [red, green, blue].map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
};

const contrastRatio = (first, second) => {
  const light = Math.max(luminance(first), luminance(second));
  const dark = Math.min(luminance(first), luminance(second));
  return (light + 0.05) / (dark + 0.05);
};

test("P2.3.5 garde le Hero lisible sur la matrice responsive finale", async ({
  page,
  isMobile,
}) => {
  test.skip(
    isMobile,
    "La matrice complete est executee une fois sur Chromium desktop.",
  );

  for (const profile of responsiveProfiles) {
    await page.setViewportSize({
      width: profile.width,
      height: profile.height,
    });
    await page.goto("/");

    const hero = page.locator("[data-hero]");
    const visual = page.locator("[data-hero-visual]");
    const system = page.locator("[data-hero-system]");
    const status = page.locator("[data-hero-profile] .status-line");
    const buttons = page.locator("[data-hero-actions] .button");

    await expect(hero).toBeVisible();
    await expect(visual).toBeVisible();
    await expect(page.locator("[data-hero-title]")).toBeVisible();

    const overflow = await page.evaluate(
      () =>
        globalThis.document.documentElement.scrollWidth -
        globalThis.document.documentElement.clientWidth,
    );
    expect(overflow, `${profile.id}: overflow horizontal`).toBeLessThanOrEqual(
      1,
    );

    const targetHeights = await buttons.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().height),
    );
    for (const height of targetHeights) {
      expect(height, `${profile.id}: cible CTA`).toBeGreaterThanOrEqual(44);
    }

    if (profile.width <= 680) {
      await expect(system).toBeHidden();
    } else {
      await expect(system).toBeVisible();
    }

    if (profile.width <= 1100) {
      await expect(status).toBeHidden();
    }

    if (profile.width > 980 && profile.width <= 1100) {
      await expect(page.locator(".hero-system-name").first()).toBeHidden();
    }
  }
});

test("P2.3.5 expose un focus clavier net sur les actions principales", async ({
  page,
  isMobile,
}) => {
  test.skip(
    isMobile,
    "Le focus est mesure une seule fois sur Chromium desktop.",
  );

  await page.setViewportSize({ width: 1920, height: 800 });
  await page.goto("/");

  const buttons = page.locator("[data-hero-actions] .button");
  await expect(buttons).toHaveCount(2);

  for (let index = 0; index < 2; index += 1) {
    const button = buttons.nth(index);
    await button.focus();
    const focus = await button.evaluate((element) => {
      const style = globalThis.getComputedStyle(element);
      return {
        visible: element.matches(":focus-visible"),
        width: Number.parseFloat(style.outlineWidth),
        offset: Number.parseFloat(style.outlineOffset),
      };
    });

    expect(focus.visible).toBe(true);
    expect(focus.width).toBeGreaterThanOrEqual(3);
    expect(focus.offset).toBeGreaterThanOrEqual(4);
  }
});

test("P2.3.5 maintient les contrastes essentiels au niveau AA", async ({
  page,
  isMobile,
}) => {
  test.skip(
    isMobile,
    "Le contrat de contraste est execute une fois sur Chromium desktop.",
  );

  await page.goto("/");

  const colors = await page.evaluate(() => {
    const probe = globalThis.document.createElement("span");
    globalThis.document.body.append(probe);

    const resolve = (name) => {
      probe.style.color = `var(${name})`;
      return globalThis.getComputedStyle(probe).color;
    };

    const result = {
      bg: resolve("--bg"),
      surface: resolve("--surface"),
      text: resolve("--text"),
      muted: resolve("--muted"),
      accent: resolve("--accent"),
      accent2: resolve("--accent-2"),
      accentContrast: resolve("--accent-contrast"),
    };

    probe.remove();
    return result;
  });

  const pairs = [
    ["text", "bg", 4.5],
    ["muted", "bg", 4.5],
    ["text", "surface", 4.5],
    ["accent", "bg", 3],
    ["accentContrast", "accent", 4.5],
    ["accentContrast", "accent2", 4.5],
  ];

  for (const [foreground, background, minimum] of pairs) {
    const ratio = contrastRatio(
      parseRgb(colors[foreground]),
      parseRgb(colors[background]),
    );
    expect(ratio, `${foreground}/${background}`).toBeGreaterThanOrEqual(
      minimum,
    );
  }
});

test("P2.3.5 retire les annonces redondantes du panneau visuel", async ({
  page,
}) => {
  await page.goto("/");

  const visual = page.locator("[data-hero-visual]");
  await expect(visual).toHaveJSProperty("tagName", "DIV");
  await expect(page.locator("[data-hero-system]")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
  await expect(
    page.locator("[data-hero-profile] .profile-panel"),
  ).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator("[data-hero-profile] img")).toHaveAttribute(
    "alt",
    "Portrait professionnel d’Alexis Guinot",
  );
});
