from pathlib import Path
import re


def replace_regex(text, pattern, replacement, label, flags=re.S):
    updated, count = re.subn(pattern, replacement, text, count=1, flags=flags)
    if count != 1:
        raise SystemExit(f"{label}: expected one match, found {count}")
    return updated


def replace_exact(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected one match, found {count}")
    return text.replace(old, new)


index_path = Path("index.html")
index = index_path.read_text(encoding="utf-8")

navigation = '''<body class="has-section-rail">
  <a class="skip-link" href="#contenu">Aller au contenu principal</a>

  <header class="site-header home-header" data-site-header>
    <div class="content-shell header-inner">
      <a class="brand" href="#accueil" aria-label="Accueil du portfolio">
        <img src="./assets/img/logo.svg" width="40" height="40" alt="" aria-hidden="true">
        <span>AG</span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="navigation-principale" data-nav-toggle hidden>
        <span class="nav-toggle-bars" aria-hidden="true"></span>
        <span class="sr-only">Ouvrir le menu</span>
      </button>
      <nav class="site-nav" aria-label="Navigation principale" data-site-nav>
        <ul id="navigation-principale" class="nav-list">
          <li><a href="#accueil" data-section-link="accueil">Accueil</a></li>
          <li><a href="#projets" data-section-link="projets">Projets</a></li>
          <li><a href="#competences" data-section-link="competences">Compétences</a></li>
          <li><a href="#experience" data-section-link="experience">Expérience</a></li>
          <li><a href="#formation" data-section-link="formation">Formation</a></li>
          <li><a href="#apropos" data-section-link="apropos">À propos</a></li>
          <li><a href="#contact" data-section-link="contact">Contact</a></li>
        </ul>
      </nav>
      <div class="header-actions">
        <a class="button button-small button-ghost" href="https://github.com/alescis-wuin" rel="me noopener noreferrer">GitHub</a>
        <a class="button button-small button-ghost" href="https://www.linkedin.com/in/alexis-guinot/" rel="me noopener noreferrer">LinkedIn</a>
        <a class="button button-small button-ghost" href="./assets/cv/CV_Alexis-GUINOT.pdf" download>CV</a>
        <button class="theme-toggle" type="button" data-theme-toggle aria-label="Changer le thème" aria-pressed="false">
          <span aria-hidden="true">◐</span>
        </button>
      </div>
    </div>
  </header>

  <aside class="section-rail" aria-label="Navigation des sections" data-section-rail>
    <nav aria-label="Sections du portfolio">
      <ol>
        <li><a href="#accueil" data-section-link="accueil" aria-current="location"><span class="rail-index">01</span><span class="rail-label">Accueil</span></a></li>
        <li><a href="#projets" data-section-link="projets"><span class="rail-index">02</span><span class="rail-label">Projets</span></a></li>
        <li><a href="#competences" data-section-link="competences"><span class="rail-index">03</span><span class="rail-label">Compétences</span></a></li>
        <li><a href="#experience" data-section-link="experience"><span class="rail-index">04</span><span class="rail-label">Expérience</span></a></li>
        <li><a href="#formation" data-section-link="formation"><span class="rail-index">05</span><span class="rail-label">Formation</span></a></li>
        <li><a href="#apropos" data-section-link="apropos"><span class="rail-index">06</span><span class="rail-label">À propos</span></a></li>
        <li><a href="#contact" data-section-link="contact"><span class="rail-index">07</span><span class="rail-label">Contact</span></a></li>
      </ol>
    </nav>
  </aside>

  <main id="contenu">'''

index = replace_regex(
    index,
    r'<body class="has-section-rail">\n  <a class="skip-link" href="#contenu">Aller au contenu principal</a>.*?\n\n  <main id="contenu">',
    navigation,
    "homepage navigation",
)

index = replace_regex(
    index,
    r'\n    <section id="valeur".*?</section>\n',
    "\n",
    "remove standalone value section",
)

projects_match = re.search(
    r'    <!-- GENERATED:HOME-PROJECTS:START -->.*?    <!-- GENERATED:HOME-PROJECTS:END -->\n',
    index,
    flags=re.S,
)
if not projects_match:
    raise SystemExit("home projects block not found")
projects_block = projects_match.group(0)
index = index[: projects_match.start()] + index[projects_match.end() :]
hero_match = re.search(r'    <section id="accueil".*?</section>\n', index, flags=re.S)
if not hero_match:
    raise SystemExit("hero section not found")
insert_at = hero_match.end()
index = index[:insert_at] + "\n" + projects_block + index[insert_at:]

about = '''    <section id="apropos" class="section section-alt snap-section" aria-labelledby="about-title" data-section data-label="À propos">
      <div class="container">
        <div class="section-heading" data-reveal>
          <p class="eyebrow">À propos</p>
          <h2 id="about-title">Comprendre avant d’implémenter</h2>
          <p>Passionné par la conception logicielle, j’apprends depuis longtemps en autonomie en cherchant d’abord à comprendre les concepts qui structurent une application plutôt qu’à dépendre d’un framework particulier. J’aime imaginer une architecture, séparer clairement les responsabilités puis la voir évoluer jusqu’à une application utilisable. Java/Spring et C#/.NET constituent aujourd’hui mes deux principaux environnements de développement. Mes projets me permettent d’explorer de nouveaux domaines, de confronter mes choix à des problèmes concrets et d’approfondir une approche centrée sur la maintenabilité, la fiabilité et les tests.</p>
          <p class="muted-small">Principe de travail : comprendre avant d’implémenter, séparer clairement les responsabilités et rendre les changements vérifiables.</p>
        </div>
        <ol class="method-list" aria-label="Méthode de conception">
          <li data-reveal><span>01</span><div><h3>Clarifier le besoin</h3><p>Identifier les utilisateurs, les contraintes, les données manipulées et les critères de réussite.</p></div></li>
          <li data-reveal><span>02</span><div><h3>Structurer l’application</h3><p>Séparer interface, logique métier, accès aux données, services et intégrations externes.</p></div></li>
          <li data-reveal><span>03</span><div><h3>Prototyper l’interface</h3><p>Construire des écrans utilisables, lisibles, accessibles et adaptés aux usages réels.</p></div></li>
          <li data-reveal><span>04</span><div><h3>Tester et documenter</h3><p>Prévoir des tests, des scripts reproductibles, des README exploitables et des limites assumées.</p></div></li>
        </ol>
      </div>
    </section>'''

index = replace_regex(
    index,
    r'    <section id="methode".*?</section>',
    about,
    "replace method with about section",
)

experience_and_formation = '''    <section id="experience" class="section section-alt snap-section" aria-labelledby="experience-title" data-section data-label="Expérience">
      <div class="container">
        <div class="section-heading" data-reveal>
          <p class="eyebrow">Expérience</p>
          <h2 id="experience-title">Expériences professionnelles sélectionnées</h2>
        </div>
        <div class="timeline" aria-label="Expériences professionnelles">
          <article class="timeline-item" data-reveal><span>2023 - 2025</span><div><h3>Familink — développeur informatique et électronicien en alternance</h3><p>Développement et maintenance autour de cadres photo/vidéo connectés : backend Python/Django/ReportLab, application Android Java, outils Linux/Raspberry Pi et SAV. Participation à un boîtier TV connecté B2B, ajout de fonctionnalités et corrections, avec une autonomie croissante au fil de l’alternance.</p></div></article>
          <article class="timeline-item" data-reveal><span>2025</span><div><h3>Caisse d’Épargne Normandie — stage de découverte</h3><p>Immersion au siège social : gestion de projet, organisation, management et équipe.</p></div></article>
        </div>
      </div>
    </section>

    <section id="formation" class="section snap-section" aria-labelledby="education-title" data-section data-label="Formation">
      <div class="container">
        <div class="section-heading" data-reveal>
          <p class="eyebrow">Formation & trajectoire</p>
          <h2 id="education-title">Formation et poursuite d’études</h2>
        </div>
        <div class="two-columns">
          <div class="timeline" aria-label="Formation">
            <article class="timeline-item" data-reveal><span>2026 - 2027</span><div><h3>CESI — Bachelor Concepteur Développeur d’Applications</h3><p>Troisième année visée en alternance ; entreprise d’accueil recherchée pour octobre 2026.</p></div></article>
            <article class="timeline-item" data-reveal><span>2023 - 2025</span><div><h3>CESI — Bac +2 Développeur Informatique</h3><p>Formation en alternance.</p></div></article>
            <article class="timeline-item" data-reveal><span>2025</span><div><h3>CCI — certification entrepreneur</h3><p>Comptabilité, juridique, communication et marketing.</p></div></article>
            <article class="timeline-item" data-reveal><span>2021</span><div><h3>Bac scientifique</h3><p>Mathématiques, sciences de l’ingénieur, NSI, physique-chimie et mathématiques expertes.</p></div></article>
          </div>
          <aside class="content-aside" data-reveal aria-label="Trajectoire de formation">
            <p class="eyebrow">Trajectoire</p>
            <h3>Intelligence artificielle</h3>
            <p>À plus long terme, je souhaite poursuivre ma formation vers l’intelligence artificielle et approfondir ensuite l’ingénierie des systèmes d’IA, idéalement en alternance.</p>
            <p class="muted-small">Métropole de Rouen · présentiel ou hybride · télétravail possible</p>
          </aside>
        </div>
      </div>
    </section>'''

index = replace_regex(
    index,
    r'    <section id="parcours".*?</section>',
    experience_and_formation,
    "split experience and education",
)

index = replace_regex(
    index,
    r'\n  <nav class="section-arrow-controls".*?</nav>\n\n  <button class="theme-toggle theme-toggle-floating".*?</button>\n',
    "\n",
    "remove arrow controls and floating theme toggle",
)

index_path.write_text(index, encoding="utf-8")

main_path = Path("assets/js/main.js")
main_js = main_path.read_text(encoding="utf-8")
section_navigation = '''function initSectionNavigation() {
  const sections = [...document.querySelectorAll('[data-section]')];
  if (sections.length === 0) return;

  const links = [...document.querySelectorAll('[data-section-link]')];
  const sectionIndexById = (id) =>
    sections.findIndex((section) => section.id === id);

  const setActive = (id) => {
    const index = sectionIndexById(id);
    if (index < 0) return;

    links.forEach((link) => {
      const active = link.dataset.sectionLink === id;
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
      link.classList.toggle('is-active', active);
    });
  };

  links.forEach((link) => {
    link.addEventListener('click', () => {
      const id = link.dataset.sectionLink;
      if (id) setActive(id);
    });
  });

  const hashId = location.hash.slice(1);
  setActive(sectionIndexById(hashId) >= 0 ? hashId : sections[0].id);

  if (!('IntersectionObserver' in window)) return;

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
      rootMargin: '-35% 0px -55% 0px',
    },
  );

  sections.forEach((section) => observer.observe(section));
}
'''
main_js = replace_regex(
    main_js,
    r'function initSectionNavigation\(\) \{.*?\n\}\n\nfunction initProjectCatalogFilters',
    section_navigation + "\nfunction initProjectCatalogFilters",
    "simplify section navigation",
)
main_path.write_text(main_js, encoding="utf-8")

css_path = Path("assets/css/ai-redesign.css")
css = css_path.read_text(encoding="utf-8")
css = replace_exact(
    css,
    "  html {\n    scroll-padding-top: 0;\n  }\n\n  .snap-section:target {\n    scroll-margin-top: 0;\n  }",
    "  html {\n    scroll-padding-top: var(--header-height);\n  }\n\n  .snap-section:target {\n    scroll-margin-top: var(--header-height);\n  }",
    "header-aware anchor offsets",
)
css = replace_exact(
    css,
    "    min-height: 100svh;\n    display: flex;",
    "    min-height: calc(100svh - var(--header-height));\n    display: flex;",
    "section viewport height",
)
css = replace_exact(
    css,
    "  #accueil.snap-section {\n    min-height: 100svh;\n  }",
    "  #accueil.snap-section {\n    min-height: calc(100svh - var(--header-height));\n  }",
    "hero viewport height",
)
css = replace_exact(
    css,
    "  #projets.snap-section,\n  #parcours.snap-section {\n    align-items: flex-start;\n  }",
    "  #projets.snap-section,\n  #experience.snap-section,\n  #formation.snap-section {\n    align-items: flex-start;\n  }",
    "long section alignment",
)
css = replace_exact(
    css,
    "  @media (max-width: 680px) {\n    body.has-section-rail {\n      padding-bottom: 5.5rem;\n    }\n\n    .snap-section {",
    "  @media (max-width: 680px) {\n    .snap-section {",
    "remove mobile rail reservation",
)
css = replace_exact(
    css,
    "  .site-header {\n    position: relative;\n    top: auto;\n    z-index: 40;\n    background: color-mix(in srgb, var(--bg) 92%, transparent);\n  }",
    "  .site-header {\n    position: sticky;\n    top: 0;\n    z-index: 70;\n    background: color-mix(in srgb, var(--bg) 92%, transparent);\n  }",
    "sticky homepage header",
)
css = replace_regex(
    css,
    r'\n  \.theme-toggle-floating \{.*?\n  \}\n\n  \.section-arrow-controls \{.*?\n  \.section-arrow\[hidden\] \{\n    display: none;\n  \}\n',
    "\n",
    "remove floating theme and arrow styles",
)
css = replace_regex(
    css,
    r'  @media \(max-width: 1179px\) \{\n    \.section-rail \{.*?\n    \.rail-label \{\n      font-size: 0\.82rem;\n    \}\n  \}',
    "  @media (max-width: 1179px) {\n    .section-rail {\n      display: none;\n    }\n  }",
    "desktop-only section rail",
)
css = replace_regex(
    css,
    r'\n  @media \(max-width: 919px\), \(max-height: 619px\) \{.*?\n  \}\n',
    "\n",
    "remove obsolete arrow responsive rules",
)
css_path.write_text(css, encoding="utf-8")

nav_old_project = '''          <li><a href="../index.html#accueil">Accueil</a></li>
          <li><a href="./index.html">Projets</a></li>
          <li><a href="../index.html#competences">Compétences</a></li>
          <li><a href="../index.html#parcours">Parcours</a></li>
          <li><a href="../index.html#contact">Contact</a></li>'''
nav_new_project = '''          <li><a href="../index.html#accueil">Accueil</a></li>
          <li><a href="./index.html">Projets</a></li>
          <li><a href="../index.html#competences">Compétences</a></li>
          <li><a href="../index.html#experience">Expérience</a></li>
          <li><a href="../index.html#formation">Formation</a></li>
          <li><a href="../index.html#apropos">À propos</a></li>
          <li><a href="../index.html#contact">Contact</a></li>'''
project_template = Path("templates/project.html.tpl")
project_text = project_template.read_text(encoding="utf-8")
project_text = replace_exact(
    project_text,
    nav_old_project,
    nav_new_project,
    "project template navigation",
)
project_template.write_text(project_text, encoding="utf-8")

nav_old_catalog = '''          <li><a href="../index.html#accueil">Accueil</a></li>
          <li><a href="./index.html" aria-current="page">Projets</a></li>
          <li><a href="../index.html#competences">Compétences</a></li>
          <li><a href="../index.html#parcours">Parcours</a></li>
          <li><a href="../index.html#contact">Contact</a></li>'''
nav_new_catalog = '''          <li><a href="../index.html#accueil">Accueil</a></li>
          <li><a href="./index.html" aria-current="page">Projets</a></li>
          <li><a href="../index.html#competences">Compétences</a></li>
          <li><a href="../index.html#experience">Expérience</a></li>
          <li><a href="../index.html#formation">Formation</a></li>
          <li><a href="../index.html#apropos">À propos</a></li>
          <li><a href="../index.html#contact">Contact</a></li>'''
catalog_template = Path("templates/projects-index.html.tpl")
catalog_text = catalog_template.read_text(encoding="utf-8")
catalog_text = replace_exact(
    catalog_text,
    nav_old_catalog,
    nav_new_catalog,
    "catalog template navigation",
)
catalog_template.write_text(catalog_text, encoding="utf-8")

qa_path = Path("tests/qa/public-content.test.mjs")
qa = qa_path.read_text(encoding="utf-8")
qa = replace_exact(
    qa,
    '  const skills = extractSection(home, "competences", "methode");',
    '  const skills = extractSection(home, "competences", "experience");',
    "skills section boundary",
)
positioning_test_end = '''  assert.doesNotMatch(home, /Développeur et concepteur d'applications/iu);
});
'''
ia_test = '''  assert.doesNotMatch(home, /Développeur et concepteur d'applications/iu);
});

test("l’architecture de la page d’accueil suit la phase 2.1", () => {
  const sectionIds = [...home.matchAll(/<section id="([^"]+)"[^>]*\\bdata-section\\b/gu)].map(
    (match) => match[1],
  );

  assert.deepEqual(sectionIds, [
    "accueil",
    "projets",
    "competences",
    "experience",
    "formation",
    "apropos",
    "contact",
  ]);
  assert.match(home, /<header class="site-header home-header"[^>]*data-site-header/u);
  assert.match(home, /data-nav-toggle/u);
  assert.match(home, /data-site-nav/u);
  assert.doesNotMatch(home, /section-arrow-controls|data-section-arrow/u);
});
'''
qa = replace_exact(
    qa,
    positioning_test_end,
    ia_test,
    "insert information architecture QA test",
)
qa_path.write_text(qa, encoding="utf-8")

e2e_path = Path("tests/e2e/portfolio.spec.mjs")
e2e = e2e_path.read_text(encoding="utf-8")
new_navigation_test = '''test("la navigation 2.1 suit l’architecture de la page d’accueil", async ({ page }) => {
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

  await expect(page.locator(".section-arrow-controls")).toHaveCount(0);

  const header = page.locator("header[data-site-header]");
  await expect(header).toBeVisible();
  expect(
    await header.evaluate((node) => globalThis.getComputedStyle(node).position),
  ).toBe("sticky");

  const projects = page.locator(
    '.section-rail [data-section-link="projets"]',
  );
  await projects.click();
  await expect(page).toHaveURL(/#projets$/);
  await expect(projects).toHaveAttribute("aria-current", "location");
});'''
e2e = replace_regex(
    e2e,
    r'test\("les flèches utilisent le défilement natif".*?\n\}\);',
    new_navigation_test,
    "replace arrow navigation E2E test",
)
mobile_old = '''  await expect(
    page.getByRole("link", { name: /Voir les projets/i }),
  ).toBeVisible();
});'''
mobile_new = '''  await expect(
    page.getByRole("link", { name: /Voir les projets/i }),
  ).toBeVisible();

  await expect(page.locator(".section-rail")).toBeHidden();
  const menu = page.getByRole("button", { name: /Ouvrir le menu/i });
  await expect(menu).toBeVisible();
  await menu.click();
  await expect(
    page
      .getByRole("navigation", { name: "Navigation principale" })
      .getByRole("link", { name: "Expérience" }),
  ).toBeVisible();
});'''
e2e = replace_exact(
    e2e,
    mobile_old,
    mobile_new,
    "extend mobile navigation E2E test",
)
e2e_path.write_text(e2e, encoding="utf-8")
