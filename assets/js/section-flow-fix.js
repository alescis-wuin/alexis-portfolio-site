const sectionOrder = ['accueil', 'valeur', 'projets', 'competences', 'methode', 'parcours', 'contact'];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pagedMedia = window.matchMedia('(min-width: 920px) and (min-height: 620px)');

let wheelLocked = false;

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

function instantScrollToSection(section) {
  if (!section) return;
  const top = Math.round(section.getBoundingClientRect().top + window.scrollY);
  window.scrollTo(0, top);
  setActiveRail(section.id);
  history.replaceState(null, '', `#${section.id}`);
}

function scrollToIndex(index) {
  const sections = orderedSections();
  if (sections.length === 0) return;

  const nextIndex = Math.min(Math.max(index, 0), sections.length - 1);
  const nextSection = sections[nextIndex];
  if (!nextSection) return;

  wheelLocked = true;
  instantScrollToSection(nextSection);

  window.setTimeout(() => {
    wheelLocked = false;
  }, reduceMotion ? 60 : 180);
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
  return true;
}

function onWheelCapture(event) {
  if (!pagedMedia.matches || Math.abs(event.deltaY) < 10) return;

  const sections = orderedSections();
  if (sections.length === 0) return;

  event.preventDefault();
  event.stopImmediatePropagation();

  if (wheelLocked) return;

  const direction = event.deltaY > 0 ? 1 : -1;
  const currentIndex = nearestSectionIndex(sections);
  const currentSection = sections[currentIndex];
  const scroller = getSectionScroller(currentSection);

  if (handleInternalScroll(scroller, event.deltaY, direction)) return;

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
  instantScrollToSection(target);
}

function initSectionFlowFix() {
  fixSectionDomOrder();
  removeTopAndBottomChrome();

  window.addEventListener('wheel', onWheelCapture, { passive: false, capture: true });
  window.addEventListener('keydown', onKeyCapture, { capture: true });
  document.addEventListener('click', onClickCapture, { capture: true });

  const hashTarget = location.hash ? document.getElementById(location.hash.slice(1)) : null;
  if (hashTarget?.matches('[data-section]')) instantScrollToSection(hashTarget);
  else setActiveRail('accueil');
}

initSectionFlowFix();
