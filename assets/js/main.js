const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

function initNavigation() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-site-nav]");

  if (!toggle || !nav) return;

  toggle.hidden = false;

  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    const label = toggle.querySelector(".sr-only");
    if (label) label.textContent = open ? "Fermer le menu" : "Ouvrir le menu";
  };

  toggle.addEventListener("click", () => {
    setOpen(!nav.classList.contains("is-open"));
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      setOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
}

function initReveal() {
  const targets = [...document.querySelectorAll("[data-reveal]")];
  if (targets.length === 0) return;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    targets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );

  targets.forEach((target) => observer.observe(target));
}

function initSectionNavigation() {
  const sections = [...document.querySelectorAll("[data-section]")];
  if (sections.length === 0) return;

  const links = [...document.querySelectorAll("[data-section-link]")];
  const sectionIndexById = (id) =>
    sections.findIndex((section) => section.id === id);

  const setActive = (id) => {
    if (sectionIndexById(id) < 0) return;

    links.forEach((link) => {
      const active = link.dataset.sectionLink === id;
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
      link.classList.toggle("is-active", active);
    });
  };

  links.forEach((link) => {
    link.addEventListener("click", () => {
      const id = link.dataset.sectionLink;
      if (id) setActive(id);
    });
  });

  const hashId = location.hash.slice(1);
  setActive(sectionIndexById(hashId) >= 0 ? hashId : sections[0].id);

  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (visible.length === 0) return;

      visible.sort((a, b) => {
        const viewportReference = window.innerHeight * 0.4;
        return (
          Math.abs(a.boundingClientRect.top - viewportReference) -
          Math.abs(b.boundingClientRect.top - viewportReference)
        );
      });

      setActive(visible[0].target.id);
    },
    {
      threshold: 0,
      rootMargin: "-35% 0px -55% 0px",
    },
  );

  sections.forEach((section) => observer.observe(section));
}

function initHeroMotion() {
  const visual = document.querySelector("[data-hero-visual]");
  if (!visual || prefersReducedMotion) return;

  const finePointer = window.matchMedia("(pointer: fine)");
  if (!finePointer.matches) return;

  let framePending = false;
  let pointerX = 0;
  let pointerY = 0;

  const writeMotion = () => {
    const systemShiftX = pointerX * -4;
    const systemShiftY = pointerY * -3;
    const systemTiltX = pointerY * 0.7;
    const systemTiltY = pointerX * -0.9;
    const profileShiftX = pointerX * 5;
    const profileShiftY = pointerY * 4;
    const profileTiltX = pointerY * -0.7;
    const profileTiltY = pointerX * 0.9;

    visual.style.setProperty(
      "--hero-system-shift-x",
      `${systemShiftX.toFixed(2)}px`,
    );
    visual.style.setProperty(
      "--hero-system-shift-y",
      `${systemShiftY.toFixed(2)}px`,
    );
    visual.style.setProperty(
      "--hero-system-tilt-x",
      `${systemTiltX.toFixed(2)}deg`,
    );
    visual.style.setProperty(
      "--hero-system-tilt-y",
      `${systemTiltY.toFixed(2)}deg`,
    );
    visual.style.setProperty(
      "--hero-profile-shift-x",
      `${profileShiftX.toFixed(2)}px`,
    );
    visual.style.setProperty(
      "--hero-profile-shift-y",
      `${profileShiftY.toFixed(2)}px`,
    );
    visual.style.setProperty(
      "--hero-profile-tilt-x",
      `${profileTiltX.toFixed(2)}deg`,
    );
    visual.style.setProperty(
      "--hero-profile-tilt-y",
      `${profileTiltY.toFixed(2)}deg`,
    );
    framePending = false;
  };

  const queueMotion = () => {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(writeMotion);
  };

  const resetMotion = () => {
    pointerX = 0;
    pointerY = 0;
    queueMotion();
  };

  visual.addEventListener(
    "pointermove",
    (event) => {
      const rect = visual.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      pointerX = Math.max(
        -1,
        Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2),
      );
      pointerY = Math.max(
        -1,
        Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2),
      );
      queueMotion();
    },
    { passive: true },
  );

  visual.addEventListener("pointerleave", resetMotion);
  visual.addEventListener("pointercancel", resetMotion);
  window.addEventListener("blur", resetMotion);

  visual.dataset.heroMotion = "interactive";
  resetMotion();
}

function initProjectCatalogFilters() {
  document.querySelectorAll("[data-project-catalog]").forEach((catalog) => {
    const filters = catalog.querySelector("[data-project-filters]");
    const cards = [...catalog.querySelectorAll("[data-project-card]")];
    if (!filters || cards.length === 0) return;

    const selects = [...filters.querySelectorAll("[data-filter-group]")];
    const count = catalog.querySelector("[data-project-count]");
    const empty = catalog.querySelector("[data-project-empty]");
    const reset = catalog.querySelector("[data-filter-reset]");

    const update = () => {
      const state = Object.fromEntries(
        selects.map((select) => [select.dataset.filterGroup, select.value]),
      );

      let visibleCount = 0;
      cards.forEach((card) => {
        const visible = Object.entries(state).every(([group, value]) => {
          if (!group || value === "all") return true;
          const tokens = (card.dataset[group] || "")
            .split(/\s+/)
            .filter(Boolean);
          return tokens.includes(value);
        });

        card.hidden = !visible;
        if (visible) visibleCount += 1;
      });

      if (count)
        count.textContent = `${visibleCount} projet${visibleCount > 1 ? "s" : ""}`;
      if (empty) empty.hidden = visibleCount !== 0;
    };

    selects.forEach((select) => select.addEventListener("change", update));

    reset?.addEventListener("click", () => {
      selects.forEach((select) => {
        select.value = "all";
      });
      update();
      selects[0]?.focus();
    });

    update();
  });
}

initNavigation();
initReveal();
initSectionNavigation();
initHeroMotion();
initProjectCatalogFilters();
