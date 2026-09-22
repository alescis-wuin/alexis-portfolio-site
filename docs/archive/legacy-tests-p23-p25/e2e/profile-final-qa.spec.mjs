import { expect, test } from "@playwright/test";

const profileSections = Object.freeze([
  { id: "skills", anchor: "competences", heading: "skills-title" },
  { id: "experience", anchor: "experience", heading: "experience-title" },
  { id: "formation", anchor: "formation", heading: "formation-title" },
  { id: "method", anchor: "apropos", heading: "about-title" },
  { id: "contact", anchor: "contact", heading: "contact-title" },
]);

const finalProfiles = Object.freeze([
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
]);

const boundedProfileBlocks = [
  "[data-capability]",
  ".experience-card",
  "[data-education-acquired]",
  "[data-education-target]",
  "[data-education-search]",
  "[data-education-ai]",
  "[data-method-step]",
  ".contact-email-link",
  ".contact-resource-link",
].join(",");

for (const profile of finalProfiles) {
  test(`P2.5-E ${profile.id} garde tout le profil sans overflow`, async ({
    page,
    isMobile,
  }) => {
    test.skip(
      isMobile,
      "La matrice explicite P2.5-E est exécutée une seule fois sur Chromium desktop.",
    );

    await page.setViewportSize({
      width: profile.width,
      height: profile.height,
    });
    await page.emulateMedia({ reducedMotion: "reduce" });

    const response = await page.goto("/", { waitUntil: "load" });
    expect(response?.ok()).toBe(true);

    const geometry = await page.evaluate(
      ({ sectionIds, boundedSelector }) => {
        const root = globalThis.document.documentElement;
        const sections = sectionIds.map((id) => {
          const node = globalThis.document.querySelector(
            `[data-profile-section="${id}"]`,
          );
          if (!node) {
            return { id, missing: true };
          }

          const rect = node.getBoundingClientRect();
          return {
            id,
            missing: false,
            left: rect.left,
            right: rect.right,
            width: rect.width,
          };
        });

        const blocks = [
          ...globalThis.document.querySelectorAll(boundedSelector),
        ].map((node) => {
          const rect = node.getBoundingClientRect();
          return {
            label:
              node.getAttribute("data-capability") ||
              node.getAttribute("data-method-step") ||
              node.className ||
              node.tagName,
            left: rect.left,
            right: rect.right,
            width: rect.width,
          };
        });

        return {
          clientWidth: root.clientWidth,
          scrollWidth: root.scrollWidth,
          sections,
          blocks,
        };
      },
      {
        sectionIds: profileSections.map((section) => section.id),
        boundedSelector: boundedProfileBlocks,
      },
    );

    expect(
      geometry.scrollWidth,
      `${profile.id}: document horizontal overflow`,
    ).toBeLessThanOrEqual(geometry.clientWidth + 1);

    expect(geometry.sections).toHaveLength(profileSections.length);
    for (const section of geometry.sections) {
      expect(section.missing, `${profile.id}: missing ${section.id}`).toBe(
        false,
      );
      expect(
        section.left,
        `${profile.id}: ${section.id} left`,
      ).toBeGreaterThanOrEqual(-1);
      expect(
        section.right,
        `${profile.id}: ${section.id} right`,
      ).toBeLessThanOrEqual(geometry.clientWidth + 1);
      expect(
        section.width,
        `${profile.id}: ${section.id} width`,
      ).toBeGreaterThan(0);
    }

    expect(geometry.blocks.length).toBeGreaterThan(0);
    for (const block of geometry.blocks) {
      expect(
        block.left,
        `${profile.id}: ${block.label} left`,
      ).toBeGreaterThanOrEqual(-1);
      expect(
        block.right,
        `${profile.id}: ${block.label} right`,
      ).toBeLessThanOrEqual(geometry.clientWidth + 1);
      expect(
        block.width,
        `${profile.id}: ${block.label} width`,
      ).toBeGreaterThan(0);
    }
  });
}

test("P2.5-E verrouille l ordre semantique et les ancres du profil", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Le contrat sémantique est exécuté une seule fois.");

  await page.goto("/");

  const contract = await page.evaluate((sections) => {
    const nodes = [
      ...globalThis.document.querySelectorAll("[data-profile-section]"),
    ];

    return {
      order: nodes.map((node) => node.getAttribute("data-profile-section")),
      sections: nodes.map((node) => {
        const labelledBy = node.getAttribute("aria-labelledby");
        const heading = labelledBy
          ? globalThis.document.getElementById(labelledBy)
          : null;
        return {
          id: node.getAttribute("data-profile-section"),
          labelledBy,
          headingTag: heading?.tagName ?? null,
          headingText: heading?.textContent?.trim() ?? "",
        };
      }),
      anchors: sections.map(({ anchor }) => ({
        anchor,
        hrefs: [
          ...globalThis.document.querySelectorAll(
            `[data-section-link="${anchor}"]`,
          ),
        ].map((link) => link.getAttribute("href")),
      })),
    };
  }, profileSections);

  expect(contract.order).toEqual(profileSections.map((section) => section.id));

  for (const expected of profileSections) {
    const actual = contract.sections.find(
      (section) => section.id === expected.id,
    );
    expect(actual?.labelledBy).toBe(expected.heading);
    expect(actual?.headingTag).toBe("H2");
    expect(actual?.headingText.length ?? 0).toBeGreaterThan(0);

    const anchor = contract.anchors.find(
      (item) => item.anchor === expected.anchor,
    );
    expect(anchor?.hrefs.length ?? 0).toBeGreaterThan(0);
    expect(anchor?.hrefs.every((href) => href === `#${expected.anchor}`)).toBe(
      true,
    );
  }
});

test("P2.5-E conserve un parcours clavier direct dans le contact", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Le parcours clavier est exécuté une seule fois.");

  await page.goto("/#contact");

  const contact = page.locator('[data-profile-section="contact"]');
  await contact.scrollIntoViewIfNeeded();

  const targets = [
    contact.getByRole("link", { name: /Envoyer un e-mail/i }),
    contact.getByRole("link", { name: /LinkedIn/ }),
    contact.getByRole("link", { name: /GitHub/ }),
    contact.getByRole("link", { name: /CV PDF/ }),
  ];

  await targets[0].focus();
  await expect(targets[0]).toBeFocused();

  for (let index = 0; index < targets.length; index += 1) {
    const target = targets[index];
    const box = await target.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);

    if (index + 1 < targets.length) {
      await page.keyboard.press("Tab");
      await expect(targets[index + 1]).toBeFocused();
    }
  }
});

test("P2.5-E rend le profil immediatement lisible en reduced motion", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Le contrat reduced motion est exécuté une seule fois.");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const state = await page.evaluate(() => {
    const profileRoot = globalThis.document.querySelectorAll(
      "[data-profile-section]",
    );
    const reveals = [...profileRoot].flatMap((section) => [
      ...section.querySelectorAll("[data-reveal]"),
    ]);

    return {
      mediaMatches: globalThis.matchMedia("(prefers-reduced-motion: reduce)")
        .matches,
      scrollBehavior: globalThis.getComputedStyle(
        globalThis.document.documentElement,
      ).scrollBehavior,
      reveals: reveals.map((node) => {
        const style = globalThis.getComputedStyle(node);
        return {
          opacity: style.opacity,
          transform: style.transform,
        };
      }),
    };
  });

  expect(state.mediaMatches).toBe(true);
  expect(state.scrollBehavior).toBe("auto");
  expect(state.reveals.length).toBeGreaterThan(0);

  for (const reveal of state.reveals) {
    expect(reveal.opacity).toBe("1");
    expect(reveal.transform).toBe("none");
  }
});
