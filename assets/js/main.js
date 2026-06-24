const root = document.documentElement;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

initNavigation();
initTheme();
initProjectFilters();
initReveal();
