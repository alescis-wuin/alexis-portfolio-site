const root = document.documentElement;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pagedMedia = window.matchMedia('(min-width: 920px) and (min-height: 620px)');

const BLOCK_SCROLL_DELTA_THRESHOLD = 80;
const BLOCK_SCROLL_LOCK_MS = 420;
const BLOCK_SCROLL_RESET_MS = 180;

let blockScrollLocked = false;
let blockScrollAccumulator = 0;
let blockScrollDirection = 0;
let blockScrollResetTimer = 0;

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

  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });
}

function initTheme() {
  const button = document.querySelector('[data-theme-toggle]');
  if (!button) return;

  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const getTheme = () => {
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

  apply(getTheme(), false);
  button.addEventListener('click', () => apply(getTheme() === 'dark' ? 'light' : 'dark'));
}

function initProjectFilters() {
  const filters = document.querySelector('[data-project-filters]');
  const cards = [...document.querySelectorAll('[data-project-card]')];
  const status = document.querySelector('[data-filter-status]');
  if (!filters || cards.length === 0) return;

  const updateStatus = () => {
    if (!status) return;
    const count = cards.filter((card) => !card.hidden).length;
    status.textContent = `${count} projet${count > 1 ? 's' : ''} affiché${count > 1 ? 's' : ''}.`;
  };

  filters.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('[data-filter]') : null;
    if (!(target instanceof HTMLButtonElement)) return;

    const value = target.dataset.filter || 'all';
    filters.querySelectorAll('[data-filter]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button === target));
    });
    cards.forEach((card) => {
      const tags = (card.dataset.tags || '').split(/\s+/).filter(Boolean);
      card.hidden = !(value === 'all' || tags.includes(value));
    });
    updateStatus();
  });

  updateStatus();
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

function sections() {
  return [...document.querySelectorAll('[data-section]')];
}

function nearestSectionIndex(list = sections()) {
  return list.reduce((best, section, index) => {
    const distance = Math.abs(section.getBoundingClientRect().top);
    return distance < best.distance ? { index, distance } : best;
  }, { index: 0, distance: Number.POSITIVE_INFINITY }).index;
}

function setActiveSection(sectionId) {
  document.querySelectorAll('[data-section-link]').forEach((link) => {
    const active = link.dataset.sectionLink === sectionId;
    if (active) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });

  const list = sections();
  const index = list.findIndex((section) => section.id === sectionId);
  const previousButton = document.querySelector('[data-section-arrow="previous"]');
  const nextButton = document.querySelector('[data-section-arrow="next"]');
  if (!(previousButton instanceof HTMLButtonElement) || !(nextButton instanceof HTMLButtonElement)) return;

  previousButton.hidden = index <= 0;
  nextButton.hidden = index < 0 || index >= list.length - 1;
  previousButton.setAttribute('aria-label', list[index - 1] ? `Section précédente : ${list[index - 1].dataset.label || list[index - 1].id}` : 'Aucune section précédente');
  nextButton.setAttribute('aria-label', list[index + 1] ? `Section suivante : ${list[index + 1].dataset.label || list[index + 1].id}` : 'Aucune section suivante');
}

function sectionTop(section) {
  return Math.round(section.getBoundingClientRect().top + window.scrollY);
}

function scrollToSection(section) {
  if (!section) return;
  window.scrollTo(0, sectionTop(section));
  setActiveSection(section.id);
  if (location.hash !== `#${section.id}`) history.replaceState(null, '', `#${section.id}`);
}

function scrollToIndex(index) {
  const list = sections();
  if (list.length === 0) return;
  scrollToSection(list[Math.min(Math.max(index, 0), list.length - 1)]);
}

function normalizeWheelDelta(event) {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 16;
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * window.innerHeight;
  return event.deltaY;
}

function resetBlockScrollAccumulator() {
  blockScrollAccumulator = 0;
  blockScrollDirection = 0;
  window.clearTimeout(blockScrollResetTimer);
}

function scheduleBlockScrollReset() {
  window.clearTimeout(blockScrollResetTimer);
  blockScrollResetTimer = window.setTimeout(resetBlockScrollAccumulator, BLOCK_SCROLL_RESET_MS);
}

function getSectionScroller(section) {
  const container = section?.querySelector(':scope > .container');
  if (!container) return null;
  return container.scrollHeight > container.clientHeight + 4 ? container : null;
}

function canScrollElement(element, direction) {
  if (!element) return false;
  const maxScrollTop = element.scrollHeight - element.clientHeight;
  if (maxScrollTop <= 4) return false;
  if (direction > 0) return element.scrollTop < maxScrollTop - 2;
  return element.scrollTop > 2;
}

function shouldTriggerBlockScroll(deltaY) {
  const direction = deltaY > 0 ? 1 : -1;

  if (direction !== blockScrollDirection) {
    blockScrollAccumulator = 0;
    blockScrollDirection = direction;
  }

  blockScrollAccumulator += Math.abs(deltaY);
  scheduleBlockScrollReset();

  return blockScrollAccumulator >= BLOCK_SCROLL_DELTA_THRESHOLD;
}

function initBlockWheelScroll() {
  const list = sections();
  if (list.length === 0) return;

  window.addEventListener('wheel', (event) => {
    if (!pagedMedia.matches || prefersReducedMotion) return;
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

    const deltaY = normalizeWheelDelta(event);
    if (Math.abs(deltaY) < 2) return;

    const direction = deltaY > 0 ? 1 : -1;
    const currentIndex = nearestSectionIndex(list);
    const currentSection = list[currentIndex];
    const scroller = getSectionScroller(currentSection);

    if (scroller?.contains(event.target) && canScrollElement(scroller, direction)) return;

    event.preventDefault();

    if (blockScrollLocked) return;
    if (!shouldTriggerBlockScroll(deltaY)) return;

    resetBlockScrollAccumulator();
    blockScrollLocked = true;
    scrollToIndex(currentIndex + direction);

    window.setTimeout(() => {
      blockScrollLocked = false;
    }, BLOCK_SCROLL_LOCK_MS);
  }, { passive: false });
}

function initSectionNavigation() {
  const list = sections();
  if (list.length === 0) return;

  document.addEventListener('click', (event) => {
    const link = event.target instanceof Element ? event.target.closest('[data-section-link], a[href^="#"]') : null;
    if (!(link instanceof HTMLAnchorElement)) return;

    const id = link.dataset.sectionLink || link.getAttribute('href')?.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target?.matches('[data-section]')) return;

    event.preventDefault();
    scrollToSection(target);
  });

  const controls = document.querySelector('[data-section-arrows]');
  controls?.addEventListener('click', (event) => {
    const button = event.target instanceof Element ? event.target.closest('[data-section-arrow]') : null;
    if (!(button instanceof HTMLButtonElement)) return;

    const direction = button.dataset.sectionArrow === 'previous' ? -1 : 1;
    scrollToIndex(nearestSectionIndex() + direction);
  });

  window.addEventListener('keydown', (event) => {
    if (!pagedMedia.matches || prefersReducedMotion) return;
    const direction = ['PageDown', 'ArrowDown'].includes(event.code) ? 1 : ['PageUp', 'ArrowUp'].includes(event.code) ? -1 : 0;
    if (!direction || document.activeElement?.matches('a, button, input, textarea, select')) return;

    event.preventDefault();
    scrollToIndex(nearestSectionIndex() + direction);
  });

  if ('IntersectionObserver' in window) {
    const visibility = new Map();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => visibility.set(entry.target.id, entry.intersectionRatio));
      const best = list.map((section) => ({ id: section.id, ratio: visibility.get(section.id) || 0 })).sort((a, b) => b.ratio - a.ratio)[0];
      if (best?.ratio > 0) setActiveSection(best.id);
    }, { threshold: [0.12, 0.24, 0.36, 0.48, 0.6], rootMargin: '-18% 0px -42% 0px' });
    list.forEach((section) => observer.observe(section));
  }

  const hashTarget = location.hash ? document.getElementById(location.hash.slice(1)) : null;
  if (hashTarget?.matches('[data-section]')) scrollToSection(hashTarget);
  else setActiveSection(list[0].id);
}

initNavigation();
initTheme();
initProjectFilters();
initReveal();
initSectionNavigation();
initBlockWheelScroll();
