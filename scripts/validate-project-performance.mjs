import { statSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const kib = 1024;

const budgets = Object.freeze({
  criticalCssTotal: 112 * kib,
  mainJs: 20 * kib,
  homeHtml: 48 * kib,
  catalogHtml: 40 * kib,
  detailHtml: 32 * kib,
  heroScreenshot: 128 * kib,
  galleryScreenshot: 160 * kib,
  diagram: 20 * kib,
});

const criticalCss = [
  "assets/css/styles.css",
  "assets/css/ai-redesign.css",
  "assets/css/project-cards.css",
];

function bytes(relativePath) {
  return statSync(path.join(root, relativePath)).size;
}

function assertBudget(label, actual, limit) {
  if (actual > limit) {
    throw new Error(`${label}: ${actual} bytes exceeds ${limit} bytes`);
  }
}

function formatKiB(value) {
  return `${(value / kib).toFixed(1)} KiB`;
}

const catalog = JSON.parse(
  readFileSync(path.join(root, "data/projects.json"), "utf8"),
);
const publishedProjects = catalog.projects.filter(
  (project) => project.published,
);

const criticalCssBytes = criticalCss.reduce(
  (total, relativePath) => total + bytes(relativePath),
  0,
);
assertBudget("critical CSS", criticalCssBytes, budgets.criticalCssTotal);

const mainJsBytes = bytes("assets/js/main.js");
assertBudget("main JS", mainJsBytes, budgets.mainJs);

const homeHtmlBytes = bytes("index.html");
assertBudget("home HTML", homeHtmlBytes, budgets.homeHtml);

const catalogHtmlBytes = bytes("projets/index.html");
assertBudget("catalog HTML", catalogHtmlBytes, budgets.catalogHtml);

let largestDetail = { path: "", size: 0 };
let largestHero = { path: "", size: 0 };
let largestGallery = { path: "", size: 0 };
let largestDiagram = { path: "", size: 0 };
let mediaCount = 0;

for (const project of publishedProjects) {
  const detailPath = `projets/${project.slug}.html`;
  const detailSize = bytes(detailPath);
  assertBudget(`${project.slug} detail HTML`, detailSize, budgets.detailHtml);
  if (detailSize > largestDetail.size) {
    largestDetail = { path: detailPath, size: detailSize };
  }

  const hero = project.visuals.hero;
  const heroSize = bytes(hero.src);
  assertBudget(`${project.slug} hero`, heroSize, budgets.heroScreenshot);
  mediaCount += 1;
  if (heroSize > largestHero.size) {
    largestHero = { path: hero.src, size: heroSize };
  }

  const architecture = project.visuals.architecture;
  const architectureSize = bytes(architecture.src);
  assertBudget(
    `${project.slug} architecture`,
    architectureSize,
    budgets.diagram,
  );
  mediaCount += 1;
  if (architectureSize > largestDiagram.size) {
    largestDiagram = { path: architecture.src, size: architectureSize };
  }

  for (const media of project.visuals.gallery) {
    const mediaSize = bytes(media.src);
    const budget =
      media.kind === "diagram" ? budgets.diagram : budgets.galleryScreenshot;
    assertBudget(`${project.slug} gallery ${media.src}`, mediaSize, budget);
    mediaCount += 1;
    if (media.kind === "diagram") {
      if (mediaSize > largestDiagram.size) {
        largestDiagram = { path: media.src, size: mediaSize };
      }
    } else if (mediaSize > largestGallery.size) {
      largestGallery = { path: media.src, size: mediaSize };
    }
  }
}

const publicHtmlPaths = [
  "index.html",
  "projets/index.html",
  ...publishedProjects.map((project) => `projets/${project.slug}.html`),
];

for (const relativePath of publicHtmlPaths) {
  const html = readFileSync(path.join(root, relativePath), "utf8");
  if (/<script\b[^>]*\bsrc=["']https?:\/\//i.test(html)) {
    throw new Error(`${relativePath}: external script detected`);
  }
  if (
    /<link\b(?=[^>]*\brel=["'](?:stylesheet|preload)["'])[^>]*\bhref=["']https?:\/\//i.test(
      html,
    )
  ) {
    throw new Error(`${relativePath}: external stylesheet or preload detected`);
  }
}

for (const relativePath of criticalCss) {
  const css = readFileSync(path.join(root, relativePath), "utf8");
  if (/@import\s+(?:url\()?\s*["']?https?:\/\//i.test(css)) {
    throw new Error(`${relativePath}: external CSS import detected`);
  }
}

console.log(
  `Performance QA OK (${publicHtmlPaths.length} HTML, ${mediaCount} project media).`,
);
console.log(
  `critical CSS: ${formatKiB(criticalCssBytes)} / ${formatKiB(budgets.criticalCssTotal)}`,
);
console.log(
  `main JS: ${formatKiB(mainJsBytes)} / ${formatKiB(budgets.mainJs)}`,
);
console.log(
  `home HTML: ${formatKiB(homeHtmlBytes)} / ${formatKiB(budgets.homeHtml)}`,
);
console.log(
  `catalog HTML: ${formatKiB(catalogHtmlBytes)} / ${formatKiB(budgets.catalogHtml)}`,
);
console.log(
  `largest detail: ${formatKiB(largestDetail.size)} (${largestDetail.path})`,
);
console.log(
  `largest hero: ${formatKiB(largestHero.size)} (${largestHero.path})`,
);
console.log(
  `largest gallery: ${formatKiB(largestGallery.size)} (${largestGallery.path})`,
);
console.log(
  `largest diagram: ${formatKiB(largestDiagram.size)} (${largestDiagram.path})`,
);
