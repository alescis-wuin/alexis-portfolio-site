const root = document.documentElement;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initAiRedesignStyles() {
  const currentScript = document.currentScript;
  const hasStaticLink = document.querySelector('link[href$="/assets/css/ai-redesign.css"], link[href="./assets/css/ai-redesign.css"], link[href="../assets/css/ai-redesign.css"]');
  if (hasStaticLink) return;

  const scriptSrc = currentScript?.getAttribute('src') || '';
  const prefix = scriptSrc.startsWith('../') || location.pathname.includes('/projets/') ? '../' : './';
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `${prefix}assets/css/ai-redesign.css`;
  document.head.append(link);
}

function initNavigation() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-site-nav]');

  if (!toggle || !nav) return;

  toggle.hidden = false;

  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    const label = toggle.querySelector('.sr-only');
    if (label) label.textContent = open ? 'Fermer le menu' : 'Ouvrir le menu';
  };

  toggle.addEventListener('click', () => {
    setOpen(!nav.classList.contains('is-open'));
  });

  nav.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      setOpen(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });
}

function initTheme() {
  const button = document.querySelector('[data-theme-toggle]');
  if (!button) return;

  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  const getCurrentTheme = () => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return systemDark.matches ? 'dark' : 'light';
  };

  const apply = (theme, persist = true) => {
    root.dataset.theme = theme;
    button.setAttribute('aria-pressed', String(theme === 'dark'));
    button.setAttribute('aria-label', theme === 'dark' ? 'Activer le thème clair' : 'Activer le thème sombre');
    if (persist) localStorage.setItem('theme', theme);
  };

  apply(getCurrentTheme(), false);

  button.addEventListener('click', () => {
    apply(getCurrentTheme() === 'dark' ? 'light' : 'dark');
  });
}

function initProjectFilters() {
  const filters = document.querySelector('[data-project-filters]');
  const cards = [...document.querySelectorAll('[data-project-card]')];
  if (!filters || cards.length === 0) return;

  filters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (!(button instanceof HTMLButtonElement)) return;

    const value = button.dataset.filter;

    filters.querySelectorAll('[data-filter]').forEach((filterButton) => {
      filterButton.setAttribute('aria-pressed', String(filterButton === button));
    });

    cards.forEach((card) => {
      const tags = (card.dataset.tags || '').split(' ');
      const visible = value === 'all' || tags.includes(value);
      card.hidden = !visible;
    });
  });
}

function initReveal() {
  const targets = [...document.querySelectorAll('[data-reveal]')];
  if (targets.length === 0) return;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach((target) => target.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((target) => observer.observe(target));
}

function initSectionRail() {
  const sections = [...document.querySelectorAll('[data-section]')];
  const links = [...document.querySelectorAll('[data-section-link]')];
  if (sections.length === 0 || links.length === 0) return;

  const setActive = (id) => {
    links.forEach((link) => {
      const active = link.dataset.sectionLink === id;
      if (active) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
      link.classList.toggle('is-active', active);
    });
  };

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.getElementById(link.dataset.sectionLink || '');
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ block: 'start', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      setActive(target.id);
      history.replaceState(null, '', `#${target.id}`);
    });
  });

  if (!('IntersectionObserver' in window)) return;

  const visibilityById = new Map();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      visibilityById.set(entry.target.id, entry.intersectionRatio);
    });

    const best = sections
      .map((section) => ({ id: section.id, ratio: visibilityById.get(section.id) || 0 }))
      .sort((a, b) => b.ratio - a.ratio)[0];

    if (best && best.ratio > 0) setActive(best.id);
  }, {
    threshold: [0.12, 0.24, 0.36, 0.48, 0.6, 0.72],
    rootMargin: '-18% 0px -42% 0px',
  });

  sections.forEach((section) => observer.observe(section));
}

function initPortfolioCleanup() {
  const isProjectPage = location.pathname.includes('/projets/');
  if (!isProjectPage) return;

  document.querySelector('[data-nav-toggle]')?.remove();
  document.querySelector('[data-site-nav]')?.remove();

  document.querySelectorAll('a[href$="CV_Alexis-GUINOT.pdf"]').forEach((link) => {
    if (!link.closest('#contact')) link.remove();
  });

  const footerText = document.querySelector('.site-footer .footer-title + p');
  if (footerText) footerText.textContent = 'Développeur et concepteur d’applications.';

  const footerNav = document.querySelector('.site-footer nav');
  if (footerNav) {
    const contactLink = document.createElement('a');
    contactLink.className = 'text-link';
    contactLink.href = '../index.html#contact';
    contactLink.textContent = 'Contact et CV';
    footerNav.replaceWith(contactLink);
  }
}

initAiRedesignStyles();
initNavigation();
initTheme();
initProjectFilters();
initReveal();
initSectionRail();
initPortfolioCleanup();
