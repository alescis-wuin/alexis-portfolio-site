const sectionOrder = ['accueil', 'valeur', 'projets', 'competences', 'methode', 'parcours', 'contact'];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pagedMedia = window.matchMedia('(min-width: 920px) and (min-height: 620px)');

const SECTION_CHANGE_DELTA_THRESHOLD = 240;
const SECTION_CHANGE_LOCK_MS = 720;
const SECTION_SCROLL_DURATION_MS = 520;
const WHEEL_ACCUMULATOR_RESET_MS = 280;

let wheelLocked = false;
let wheelAccumulator = 0;
let wheelDirection = 0;
let wheelResetTimer = 0;
let activeAnimationFrame = 0;

function orderedSections() {
  return sectionOrder.map((id) => document.getElementById(id)).filter(Boolean);
}

function fixSectionDomOrder() {
  const sections = orderedSections();
  const main = document.querySelector('main');
  if (!main || sections.length === 0) return;

  sections.forEach((section) => main.append(section));
}

function removeTopAndBottomChrome() {
  document.querySelector('.site-header')?.remove();
  document.querySelector('.site-footer')?.remove();
  document.documentElement.style.scrollBehavior = 'auto';
  document.body.style.overscrollBehaviorY = 'none';
}

function setActiveRail(sectionId) {
  document.querySelectorAll('[data-section-link]').forEach((link) => {
    const active = link.dataset.sectionLink === sectionId;
    if (active) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}

function nearestSectionIndex(sections = orderedSections()) {
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
}

function normalizeWheelDelta(event) {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 16;
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * window.innerHeight;
  return event.deltaY;
}

function resetWheelAccumulator() {
  wheelAccumulator = 0;
  wheelDirection = 0;
  window.clearTimeout(wheelResetTimer);
}

function scheduleAccumulatorReset() {
  window.clearTimeout(wheelResetTimer);
  wheelResetTimer = window.setTimeout(resetWheelAccumulator, WHEEL_ACCUMULATOR_RESET_MS);
}

function easeOutCubic(progress) {
  return 1 - Math.pow(1 - progress, 3);
}

function targetTopForSection(section) {
  return Math.round(section.getBoundingClientRect().top + window.scrollY);
}

function animateWindowScrollTo(targetTop, duration = SECTION_SCROLL_DURATION_MS) {
  window.cancelAnimationFrame(activeAnimationFrame);

  if (reduceMotion || duration <= 0) {
    window.scrollTo(0, targetTop);
    return;
  }

  const startTop = window.scrollY;
  const distance = targetTop - startTop;
  const startTime = performance.now();

  const step = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, Math.round(startTop + distance * easeOutCubic(progress)));

    if (progress < 1) {
      activeAnimationFrame = window.requestAnimationFrame(step);
    } else {
      window.scrollTo(0, targetTop);
    }
  };

  activeAnimationFrame = window.requestAnimationFrame(step);
}

function scrollToSection(section, { animated = true } = {}) {
  if (!section) return;
  animateWindowScrollToSection(section, animated);
  setActiveRail(section.id);
  history.replaceState(null, '', `#${section.id}`);
}

function animateWindowScrollToSection(section, animated) {
  animateWindowScrollTo(targetTopForSection(section), animated ? SECTION_SCROLL_DURATION_MS : 0);
}

function scrollToIndex(index, { animated = true } = {}) {
  const sections = orderedSections();
  if (sections.length === 0) return;

  const nextIndex = Math.min(Math.max(index, 0), sections.length - 1);
  const nextSection = sections[nextIndex];
  if (!nextSection) return;

  resetWheelAccumulator();
  wheelLocked = true;
  scrollToSection(nextSection, { animated });

  window.setTimeout(() => {
    wheelLocked = false;
  }, reduceMotion ? 90 : SECTION_CHANGE_LOCK_MS);
}

function getSectionScroller(section) {
  const container = section?.querySelector(':scope > .container');
  if (!container) return null;
  return container.scrollHeight > container.clientHeight + 4 ? container : null;
}

function canScroll(element, direction) {
  if (!element) return false;
  const maxScrollTop = element.scrollHeight - element.clientHeight;
  if (maxScrollTop <= 4) return false;
  if (direction > 0) return element.scrollTop < maxScrollTop - 2;
  return element.scrollTop > 2;
}

function handleInternalScroll(scroller, deltaY, direction) {
  if (!scroller || !canScroll(scroller, direction)) return false;
  scroller.scrollTop += deltaY;
  resetWheelAccumulator();
  return true;
}

function shouldChangeSection(deltaY) {
  const direction = deltaY > 0 ? 1 : -1;

  if (direction !== wheelDirection) {
    wheelAccumulator = 0;
    wheelDirection = direction;
  }

  wheelAccumulator += Math.abs(deltaY);
  scheduleAccumulatorReset();

  return wheelAccumulator >= SECTION_CHANGE_DELTA_THRESHOLD;
}

function onWheelCapture(event) {
  if (!pagedMedia.matches) return;

  const normalizedDeltaY = normalizeWheelDelta(event);
  if (Math.abs(normalizedDeltaY) < 6) return;

  const sections = orderedSections();
  if (sections.length === 0) return;

  event.preventDefault();
  event.stopImmediatePropagation();

  if (wheelLocked) return;

  const direction = normalizedDeltaY > 0 ? 1 : -1;
  const currentIndex = nearestSectionIndex(sections);
  const currentSection = sections[currentIndex];
  const scroller = getSectionScroller(currentSection);

  if (handleInternalScroll(scroller, normalizedDeltaY, direction)) return;
  if (!shouldChangeSection(normalizedDeltaY)) return;

  scrollToIndex(currentIndex + direction);
}

function onKeyCapture(event) {
  if (!pagedMedia.matches) return;

  const nextKeys = ['PageDown', 'ArrowDown', 'Space'];
  const previousKeys = ['PageUp', 'ArrowUp'];
  const direction = nextKeys.includes(event.code) ? 1 : previousKeys.includes(event.code) ? -1 : 0;
  if (!direction) return;

  const active = document.activeElement;
  if (active && ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName)) return;

  event.preventDefault();
  event.stopImmediatePropagation();

  if (wheelLocked) return;
  scrollToIndex(nearestSectionIndex() + direction);
}

function onClickCapture(event) {
  const link = event.target.closest?.('[data-section-link], a[href^="#"]');
  if (!(link instanceof HTMLAnchorElement)) return;

  const id = link.dataset.sectionLink || link.getAttribute('href')?.slice(1);
  const target = id ? document.getElementById(id) : null;
  if (!target?.matches('[data-section]')) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  scrollToSection(target, { animated: true });
}

function initSectionFlowFix() {
  fixSectionDomOrder();
  removeTopAndBottomChrome();

  window.addEventListener('wheel', onWheelCapture, { passive: false, capture: true });
  window.addEventListener('keydown', onKeyCapture, { capture: true });
  document.addEventListener('click', onClickCapture, { capture: true });

  const hashTarget = location.hash ? document.getElementById(location.hash.slice(1)) : null;
  if (hashTarget?.matches('[data-section]')) scrollToSection(hashTarget, { animated: false });
  else setActiveRail('accueil');
}

initSectionFlowFix();
