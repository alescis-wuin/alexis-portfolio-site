const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const byId = (id) => document.getElementById(id);

const candidateDocuments = [
  { id: 'cv', title: 'CV', href: './assets/cv/CV_Alexis-GUINOT.pdf', kind: 'Profil', mark: 'CV' },
  { id: 'programme', title: 'Programme CDA', href: './assets/documents/formation-cda-programme-detaille.pdf', kind: 'Formation', mark: 'P1' },
  { id: 'candidat', title: 'Fiche candidat', href: './assets/documents/formation-cda-fiche-metier-candidat.pdf', kind: 'Formation', mark: 'P2' },
  { id: 'aides', title: 'Aides alternance/RQTH', href: './assets/documents/aides-alternance-rqth-cap-emploi.pdf', kind: 'Employeur', mark: 'RH' },
  { id: 'annexe', title: 'Annexe RH', href: './assets/documents/annexe-rh-alternance-rqth.pdf', kind: 'RH', mark: '€' },
];

function documentCardTemplate(documentItem) {
  return `
    <a class="document-card document-card-${documentItem.id} is-visible" data-reveal href="${documentItem.href}" target="_blank" rel="noopener noreferrer" aria-label="Ouvrir ${documentItem.title} en PDF">
      <span class="document-glow" aria-hidden="true"></span>
      <span class="document-visual" aria-hidden="true"><span>${documentItem.mark}</span><small>PDF</small></span>
      <span class="document-content"><span class="document-label">${documentItem.kind}</span><strong>${documentItem.title}</strong></span>
      <span class="document-open" aria-hidden="true">Ouvrir</span>
    </a>`;
}

function setMeta() {
  document.title = 'Alexis Guinot — Développeur & concepteur d’applications';
  document.querySelector('meta[name="description"]')?.setAttribute('content', 'Portfolio d’Alexis Guinot, développeur et concepteur d’applications : interfaces web et desktop, API, données, automatisation, IA locale, projets applicatifs et documents de candidature.');
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', 'Alexis Guinot — Développeur & concepteur d’applications');
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', 'Interfaces web et desktop, API, données, automatisation, IA locale, projets applicatifs et documents de candidature.');
}

function simplifyHeader() {
  document.body.classList.add('has-section-rail');
  document.querySelector('[data-nav-toggle]')?.remove();
  document.querySelector('[data-site-nav]')?.remove();
  document.querySelectorAll('.header-actions a[href$="CV_Alexis-GUINOT.pdf"]').forEach((link) => link.remove());
}

function createRail() {
  if (document.querySelector('[data-section-rail]')) return;

  const rail = document.createElement('aside');
  rail.className = 'section-rail';
  rail.setAttribute('aria-label', 'Navigation des sections');
  rail.dataset.sectionRail = '';
  rail.innerHTML = `
    <nav>
      <ol>
        <li><a href="#accueil" data-section-link="accueil" aria-current="true"><span class="rail-index">01</span><span class="rail-label">Accueil</span></a></li>
        <li><a href="#valeur" data-section-link="valeur"><span class="rail-index">02</span><span class="rail-label">Valeur</span></a></li>
        <li><a href="#projets" data-section-link="projets"><span class="rail-index">03</span><span class="rail-label">Projets</span></a></li>
        <li><a href="#competences" data-section-link="competences"><span class="rail-index">04</span><span class="rail-label">Compétences</span></a></li>
        <li><a href="#methode" data-section-link="methode"><span class="rail-index">05</span><span class="rail-label">Méthode</span></a></li>
        <li><a href="#parcours" data-section-link="parcours"><span class="rail-index">06</span><span class="rail-label">Parcours</span></a></li>
        <li><a href="#documents" data-section-link="documents"><span class="rail-index">07</span><span class="rail-label">Documents</span></a></li>
        <li><a href="#contact" data-section-link="contact"><span class="rail-index">08</span><span class="rail-label">Contact</span></a></li>
      </ol>
    </nav>`;
  document.querySelector('.site-header')?.after(rail);
}

function prepareSections() {
  const sections = [...document.querySelectorAll('main > section')];
  const valueSection = sections.find((section) => section.querySelector('#positionnement-title'));
  const impactSection = sections.find((section) => section.querySelector('#impact-title'));

  const mapping = [
    [byId('accueil'), 'accueil'],
    [valueSection, 'valeur'],
    [byId('projets'), 'projets'],
    [byId('competences'), 'competences'],
    [impactSection, 'methode'],
    [byId('parcours'), 'parcours'],
    [byId('contact'), 'contact'],
  ];

  mapping.forEach(([section, id]) => {
    if (!section) return;
    section.id = id;
    section.dataset.section = id;
    section.classList.add('snap-section');
  });

  return { valueSection, impactSection };
}

function updateHero() {
  const hero = byId('accueil');
  if (!hero) return;

  hero.querySelector('.eyebrow')?.classList.add('hero-kicker');
  const kicker = hero.querySelector('.hero-kicker, .eyebrow');
  if (kicker) kicker.textContent = 'Portfolio · Développement applicatif';

  const title = hero.querySelector('h1');
  if (title) title.textContent = 'Développeur et concepteur d’applications';

  const lead = hero.querySelector('.hero-lead');
  if (lead) lead.textContent = 'Interfaces web et desktop, API, bases de données, automatisations et outils applicatifs clairs, testables et maintenables.';

  hero.querySelectorAll('.hero-actions a').forEach((link, index) => {
    if (index === 0) {
      link.href = '#projets';
      link.textContent = 'Voir les projets';
      link.className = 'button button-primary';
    } else if (index === 1) {
      link.href = '#documents';
      link.textContent = 'Documents utiles';
      link.className = 'button button-secondary';
      link.removeAttribute('download');
    } else {
      link.remove();
    }
  });

  hero.querySelector('.hero-links')?.remove();

  if (!hero.querySelector('.hero-facts')) {
    const facts = document.createElement('dl');
    facts.className = 'hero-facts';
    facts.setAttribute('aria-label', 'Résumé professionnel');
    facts.innerHTML = `
      <div><dt>Orientation</dt><dd>Applications métier, outils internes, interfaces et données</dd></div>
      <div><dt>Formation</dt><dd>Bac+2 obtenu · Bachelor CDA visé</dd></div>
      <div><dt>Dossier</dt><dd>CV, formation et RH accessibles</dd></div>`;
    hero.querySelector('.hero-copy')?.append(facts);
  }

  const role = hero.querySelector('.profile-role');
  if (role) role.textContent = 'Profil applicatif polyvalent';

  const status = hero.querySelector('.status-line');
  if (status) status.innerHTML = '<span aria-hidden="true"></span>Disponible pour une alternance développement';
}

function updateValueSection(section) {
  if (!section) return;
  section.classList.remove('section-alt');
  const container = section.querySelector('.container');
  if (!container) return;
  container.innerHTML = `
    <div class="section-heading is-visible" data-reveal>
      <p class="eyebrow">Valeur ajoutée</p>
      <h2 id="value-title">Ce que je peux apporter à une équipe</h2>
      <p>Le portfolio met en avant des capacités concrètes : comprendre un besoin, concevoir l’interface, structurer les données, exposer des API, tester et documenter.</p>
    </div>
    <div class="value-grid value-grid-4">
      <article class="value-card is-visible" data-reveal><span class="card-number" aria-hidden="true">01</span><h3>Interfaces web & desktop</h3><p>Écrans lisibles, parcours simples, responsive design, accessibilité, JavaFX et interfaces web modernes.</p></article>
      <article class="value-card is-visible" data-reveal><span class="card-number" aria-hidden="true">02</span><h3>API & services</h3><p>REST, GraphQL, OpenAPI, validation métier, contrats applicatifs et intégration avec des clients front ou desktop.</p></article>
      <article class="value-card is-visible" data-reveal><span class="card-number" aria-hidden="true">03</span><h3>Données & fiabilité</h3><p>Modélisation SQL/NoSQL, migrations, historiques, snapshots, cache et cohérence des calculs.</p></article>
      <article class="value-card is-visible" data-reveal><span class="card-number" aria-hidden="true">04</span><h3>Qualité projet</h3><p>Tests, documentation, scripts, Docker, CI/CD, diagnostic et amélioration continue.</p></article>
    </div>`;
  section.setAttribute('aria-labelledby', 'value-title');
}

function updateProjects() {
  const section = byId('projets');
  if (!section) return;

  section.querySelector('#projects-title') && (section.querySelector('#projects-title').textContent = 'Études de cas orientées preuves');
  const headingText = section.querySelector('.section-heading p:last-child');
  if (headingText) headingText.textContent = 'Chaque projet montre un aspect différent : interface, API, persistance, architecture, rendu graphique, automatisation ou IA locale.';

  const filters = section.querySelector('[data-project-filters]');
  if (filters) {
    filters.innerHTML = `
      <button type="button" class="filter-button" data-filter="all" aria-pressed="true">Tous</button>
      <button type="button" class="filter-button" data-filter="fullstack" aria-pressed="false">Full-stack</button>
      <button type="button" class="filter-button" data-filter="frontend" aria-pressed="false">Frontend/UI</button>
      <button type="button" class="filter-button" data-filter="api" aria-pressed="false">API</button>
      <button type="button" class="filter-button" data-filter="desktop" aria-pressed="false">Desktop</button>
      <button type="button" class="filter-button" data-filter="donnees" aria-pressed="false">Données</button>
      <button type="button" class="filter-button" data-filter="ia" aria-pressed="false">IA</button>`;
  }

  const proofByProject = {
    streamfolio: ['Interface proche d’un produit média', 'Services, stockage, sessions et pipeline asynchrone', 'Tests, Docker et validation de fonctionnement'],
    solvia: ['Modélisation métier et logique de calcul', 'API REST, desktop JavaFX et PostgreSQL', 'Architecture multi-module documentée'],
    ludani: ['Rendu temps réel et outils graphiques', 'Architecture moteur / client / éditeur', 'Résolution de problèmes bas niveau'],
    alycia: ['Intégration d’outils IA locaux', 'Workflows, assistants et automatisation', 'Contraintes matérielles et confidentialité'],
    aelia: ['Interface desktop accessible au clavier', 'Contrats de fournisseur et données simulées', 'Tests, Maven et GitHub Actions'],
  };

  const tagsByProject = {
    streamfolio: 'fullstack frontend api donnees devops',
    solvia: 'fullstack frontend api desktop donnees architecture',
    ludani: 'frontend graphique architecture desktop',
    alycia: 'ia automatisation frontend api desktop',
    aelia: 'frontend desktop accessibilite architecture',
  };

  section.querySelectorAll('[data-project-card]').forEach((card) => {
    const key = card.querySelector('h3 a')?.textContent.trim().toLowerCase();
    if (!key) return;
    if (tagsByProject[key]) card.dataset.tags = tagsByProject[key];
    if (card.querySelector('.proof-list')) return;
    const paragraph = card.querySelector('.project-body > p');
    const items = proofByProject[key];
    if (!paragraph || !items) return;
    const list = document.createElement('ul');
    list.className = 'proof-list';
    list.setAttribute('aria-label', 'Points démontrés');
    list.innerHTML = items.map((item) => `<li>${item}</li>`).join('');
    paragraph.after(list);
  });
}

function updateSkills() {
  const section = byId('competences');
  if (!section) return;
  section.querySelector('#skills-title') && (section.querySelector('#skills-title').textContent = 'Un socle applicatif complet');
  const headingText = section.querySelector('.section-heading p:last-child');
  if (headingText) headingText.textContent = 'Les compétences sont regroupées par type de contribution pour faciliter la lecture : concevoir l’interface, développer les services, gérer les données et livrer proprement.';
  const cards = section.querySelector('.skills-grid');
  if (!cards) return;
  cards.innerHTML = `
    <article class="skill-card is-visible" data-reveal><h3>UI/UX & frontend</h3><p>HTML, CSS, JavaScript, TypeScript, React, Angular, Vue.js, Svelte, responsive design.</p></article>
    <article class="skill-card is-visible" data-reveal><h3>Applications desktop & mobile</h3><p>JavaFX, AtlantaFX, Swing, Android Java/Kotlin, Flutter, .NET MAUI.</p></article>
    <article class="skill-card is-visible" data-reveal><h3>API & services</h3><p>Spring Boot, FastAPI, Flask, REST, GraphQL, OpenAPI, validation métier.</p></article>
    <article class="skill-card is-visible" data-reveal><h3>Données</h3><p>PostgreSQL, MongoDB, SQL, Flyway, Redis, modélisation et historiques.</p></article>
    <article class="skill-card is-visible" data-reveal><h3>Langages</h3><p>Java, Python, C, C++, Rust, JavaScript, TypeScript, SQL, Bash, PowerShell.</p></article>
    <article class="skill-card is-visible" data-reveal><h3>IA locale</h3><p>Ollama, vLLM, Llama.cpp, LM Studio, Hugging Face, workflows et agents.</p></article>
    <article class="skill-card is-visible" data-reveal><h3>DevOps & système</h3><p>Git, CI/CD, Docker Compose, Kubernetes, Maven, Gradle, Linux, SSH/SFTP.</p></article>
    <article class="skill-card is-visible" data-reveal><h3>Qualité & projet</h3><p>Tests unitaires, tests E2E, analyse, Kanban, Jira, Trello, Notion, documentation.</p></article>`;
}

function updateMethodSection(section) {
  if (!section) return;
  section.classList.add('section-alt');
  const container = section.querySelector('.container');
  if (!container) return;
  container.className = 'container';
  container.innerHTML = `
    <div class="section-heading is-visible" data-reveal>
      <p class="eyebrow">Méthode</p>
      <h2 id="method-title">Une façon de travailler lisible</h2>
      <p>La valeur d’un portfolio ne vient pas seulement des technologies. Elle vient aussi de la capacité à expliquer un besoin, une architecture, des choix et des limites.</p>
    </div>
    <ol class="method-list" aria-label="Méthode de conception">
      <li class="is-visible" data-reveal><span>01</span><div><h3>Clarifier le besoin</h3><p>Identifier les utilisateurs, les contraintes, les données manipulées et les critères de réussite.</p></div></li>
      <li class="is-visible" data-reveal><span>02</span><div><h3>Structurer l’application</h3><p>Séparer interface, logique métier, accès aux données, services et intégrations externes.</p></div></li>
      <li class="is-visible" data-reveal><span>03</span><div><h3>Prototyper l’interface</h3><p>Construire des écrans utilisables, lisibles, accessibles et adaptés aux usages réels.</p></div></li>
      <li class="is-visible" data-reveal><span>04</span><div><h3>Tester et documenter</h3><p>Prévoir des tests, des scripts reproductibles, des README exploitables et des limites assumées.</p></div></li>
    </ol>`;
  section.setAttribute('aria-labelledby', 'method-title');
}

function updateParcours() {
  const section = byId('parcours');
  if (!section) return;
  section.classList.remove('section-alt');
  section.querySelector('#timeline-title') && (section.querySelector('#timeline-title').textContent = 'Formation, expériences et projets utiles');
}

function createDocumentsSection() {
  if (byId('documents')) return;

  const contact = byId('contact');
  if (!contact) return;

  const section = document.createElement('section');
  section.id = 'documents';
  section.className = 'section section-alt snap-section documents-section';
  section.dataset.section = 'documents';
  section.setAttribute('aria-labelledby', 'documents-title');
  section.innerHTML = `
    <div class="container documents-layout">
      <div class="section-heading documents-heading is-visible" data-reveal>
        <p class="eyebrow">Documents</p>
        <h2 id="documents-title">Documents utiles</h2>
        <p>CV, formation et RH en PDF.</p>
      </div>
      <div class="documents-panel is-visible" data-reveal>
        <div class="documents-grid">
          ${candidateDocuments.map(documentCardTemplate).join('')}
        </div>
      </div>
    </div>`;

  contact.before(section);
}

function updateContactAndFooter() {
  const contact = byId('contact');
  if (contact) {
    contact.querySelector('#contact-title') && (contact.querySelector('#contact-title').textContent = 'Contact et documents centralisés');
    const text = contact.querySelector('.contact-card p:not(.eyebrow)');
    if (text) text.textContent = 'Un seul point d’entrée pour échanger et accéder au dossier de candidature : e-mail, LinkedIn, GitHub, CV et documents RH.';
    const actions = contact.querySelector('.contact-actions');
    if (actions && !actions.querySelector('a[href="#documents"]')) {
      const documentsLink = document.createElement('a');
      documentsLink.className = 'button button-secondary';
      documentsLink.href = '#documents';
      documentsLink.textContent = 'Voir les documents';
      actions.append(documentsLink);
    }
  }
  const footerText = document.querySelector('.site-footer .footer-title + p');
  if (footerText) footerText.textContent = 'Développeur et concepteur d’applications.';
  const footerNav = document.querySelector('.site-footer nav');
  if (footerNav) {
    const contactLink = document.createElement('a');
    contactLink.className = 'text-link';
    contactLink.href = '#contact';
    contactLink.textContent = 'Contact et documents';
    footerNav.replaceWith(contactLink);
  }
}

function initRailState() {
  const sections = [...document.querySelectorAll('[data-section]')];
  const links = [...document.querySelectorAll('[data-section-link]')];
  if (sections.length === 0 || links.length === 0) return;

  const setActive = (id) => {
    links.forEach((link) => {
      const active = link.dataset.sectionLink === id;
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = byId(link.dataset.sectionLink || '');
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ block: 'start', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      setActive(target.id);
      history.replaceState(null, '', `#${target.id}`);
    });
  });

  if (!('IntersectionObserver' in window)) return;
  const visibility = new Map();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => visibility.set(entry.target.id, entry.intersectionRatio));
    const best = sections.map((section) => ({ id: section.id, ratio: visibility.get(section.id) || 0 })).sort((a, b) => b.ratio - a.ratio)[0];
    if (best?.ratio > 0) setActive(best.id);
  }, { threshold: [0.12, 0.24, 0.36, 0.48, 0.6, 0.72], rootMargin: '-18% 0px -42% 0px' });
  sections.forEach((section) => observer.observe(section));
}

function initPagedWheelScroll() {
  const sections = [...document.querySelectorAll('[data-section]')];
  if (sections.length === 0) return;

  const media = window.matchMedia('(min-width: 920px) and (min-height: 620px)');
  let locked = false;
  let lastDirection = 0;

  const sectionIndexFromViewport = () => {
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    sections.forEach((section, index) => {
      const distance = Math.abs(section.getBoundingClientRect().top);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    return bestIndex;
  };

  const getSectionScroller = (section) => {
    const container = section?.querySelector(':scope > .container');
    if (!container) return null;
    return container.scrollHeight > container.clientHeight + 4 ? container : null;
  };

  const canScroll = (element, direction) => {
    if (!element) return false;
    const maxScrollTop = element.scrollHeight - element.clientHeight;
    if (maxScrollTop <= 4) return false;
    if (direction > 0) return element.scrollTop < maxScrollTop - 2;
    return element.scrollTop > 2;
  };

  const canScrollableAncestorMove = (target, section, direction) => {
    let current = target instanceof Element ? target : target?.parentElement;
    while (current && current !== document.body && current !== section) {
      const style = getComputedStyle(current);
      const canOverflow = /(auto|scroll|overlay)/.test(style.overflowY);
      if (canOverflow && canScroll(current, direction)) return true;
      current = current.parentElement;
    }
    return false;
  };

  const setActiveRail = (sectionId) => {
    document.querySelectorAll('[data-section-link]').forEach((link) => {
      const active = link.dataset.sectionLink === sectionId;
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

  const goToIndex = (index, behavior = 'smooth') => {
    const nextIndex = Math.min(Math.max(index, 0), sections.length - 1);
    const nextSection = sections[nextIndex];
    if (!nextSection) return;

    locked = true;
    nextSection.scrollIntoView({ block: 'start', behavior: prefersReducedMotion ? 'auto' : behavior });
    setActiveRail(nextSection.id);
    history.replaceState(null, '', `#${nextSection.id}`);

    window.setTimeout(() => {
      locked = false;
      lastDirection = 0;
    }, prefersReducedMotion ? 120 : 720);
  };

  const onWheel = (event) => {
    if (!media.matches || Math.abs(event.deltaY) < 18) return;

    const direction = event.deltaY > 0 ? 1 : -1;
    const currentIndex = sectionIndexFromViewport();
    const currentSection = sections[currentIndex];
    const scroller = getSectionScroller(currentSection);

    if (scroller && scroller.contains(event.target) && canScroll(scroller, direction)) return;
    if (canScrollableAncestorMove(event.target, currentSection, direction)) return;

    event.preventDefault();
    if (locked && lastDirection === direction) return;

    lastDirection = direction;
    goToIndex(currentIndex + direction);
  };

  const onKeyDown = (event) => {
    if (!media.matches) return;
    const nextKeys = ['PageDown', 'ArrowDown', 'Space'];
    const previousKeys = ['PageUp', 'ArrowUp'];
    const direction = nextKeys.includes(event.code) ? 1 : previousKeys.includes(event.code) ? -1 : 0;
    if (!direction) return;

    const active = document.activeElement;
    if (active && ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName)) return;

    event.preventDefault();
    if (locked && lastDirection === direction) return;
    lastDirection = direction;
    goToIndex(sectionIndexFromViewport() + direction);
  };

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('keydown', onKeyDown);
}

function initHomeRedesign() {
  if (!byId('accueil') || location.pathname.includes('/projets/')) return;
  setMeta();
  simplifyHeader();
  createRail();
  const { valueSection, impactSection } = prepareSections();
  updateHero();
  updateValueSection(valueSection);
  updateProjects();
  updateSkills();
  updateMethodSection(impactSection);
  updateParcours();
  createDocumentsSection();
  updateContactAndFooter();
  initRailState();
  initPagedWheelScroll();
}

initHomeRedesign();
