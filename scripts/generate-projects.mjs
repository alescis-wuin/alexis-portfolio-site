import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const checkOnly = process.argv.includes("--check");

const catalogPath = path.join(rootDir, "data", "projects.json");
const projectTemplatePath = path.join(rootDir, "templates", "project.html.tpl");
const catalogTemplatePath = path.join(
  rootDir,
  "templates",
  "projects-index.html.tpl",
);

const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
validateCatalog(catalog);

const projectTemplate = readFileSync(projectTemplatePath, "utf8");
const catalogTemplate = readFileSync(catalogTemplatePath, "utf8");
const outputs = new Map();

for (const project of catalog.projects) {
  outputs.set(
    path.join(rootDir, "projets", `${project.slug}.html`),
    renderProjectPage(project),
  );
}

outputs.set(path.join(rootDir, "projets", "index.html"), renderCatalogPage());
outputs.set(path.join(rootDir, "sitemap.xml"), renderSitemap());

const indexPath = path.join(rootDir, "index.html");
const currentIndex = readFileSync(indexPath, "utf8");
outputs.set(indexPath, renderHomeIndex(currentIndex));

if (checkOnly) {
  const stale = [];
  for (const [filePath, expected] of outputs) {
    const actual = existsSync(filePath) ? readFileSync(filePath, "utf8") : null;
    if (actual !== expected) {
      stale.push(path.relative(rootDir, filePath).replaceAll(path.sep, "/"));
    }
  }

  if (stale.length > 0) {
    console.error("Fichiers générés désynchronisés :");
    for (const file of stale) console.error(`- ${file}`);
    console.error("Exécute : npm run generate");
    process.exit(1);
  }

  console.log(`Génération synchronisée (${outputs.size} fichier(s)).`);
  process.exit(0);
}

for (const [filePath, content] of outputs) {
  writeFileSync(filePath, content, "utf8");
  console.log(
    `generated ${path.relative(rootDir, filePath).replaceAll(path.sep, "/")}`,
  );
}

function validateCatalog(data) {
  if (data.schemaVersion !== 1) {
    throw new Error("data/projects.json : schemaVersion doit valoir 1.");
  }

  for (const key of ["baseUrl", "title", "description"]) {
    assertNonEmpty(data.site?.[key], `site.${key}`);
  }

  const taxonomyGroups = ["languages", "types", "stack", "status"];
  for (const group of taxonomyGroups) {
    const entries = data.taxonomy?.[group];
    if (!entries || typeof entries !== "object" || Array.isArray(entries)) {
      throw new Error(`taxonomy.${group} doit être un objet.`);
    }
  }

  if (!Array.isArray(data.projects) || data.projects.length === 0) {
    throw new Error("projects doit contenir au moins un projet.");
  }

  const ids = new Set();
  const slugs = new Set();
  const featuredOrders = new Set();

  for (const project of data.projects) {
    for (const field of [
      "id",
      "slug",
      "name",
      "status",
      "subtitle",
      "summary",
      "metaDescription",
      "mission",
      "proof",
      "problem",
      "image",
      "imageAlt",
    ]) {
      assertNonEmpty(project[field], `projects.${project.id || "?"}.${field}`);
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)) {
      throw new Error(`${project.id} : slug invalide (${project.slug}).`);
    }
    if (ids.has(project.id))
      throw new Error(`ID projet dupliqué : ${project.id}`);
    if (slugs.has(project.slug))
      throw new Error(`Slug projet dupliqué : ${project.slug}`);
    ids.add(project.id);
    slugs.add(project.slug);

    if (!Object.hasOwn(data.taxonomy.status, project.status)) {
      throw new Error(`${project.id} : statut inconnu (${project.status}).`);
    }

    validateReferences(project, "languages", data.taxonomy.languages);
    validateReferences(project, "types", data.taxonomy.types);
    validateReferences(project, "stack", data.taxonomy.stack);
    validateReferences(project, "homeStack", data.taxonomy.stack);

    if (!Array.isArray(project.features) || project.features.length === 0) {
      throw new Error(`${project.id} : features doit être non vide.`);
    }
    if (!Array.isArray(project.proofs) || project.proofs.length === 0) {
      throw new Error(`${project.id} : proofs doit être non vide.`);
    }

    if (project.featured) {
      if (
        !Number.isInteger(project.featuredOrder) ||
        project.featuredOrder < 1
      ) {
        throw new Error(`${project.id} : featuredOrder invalide.`);
      }
      if (featuredOrders.has(project.featuredOrder)) {
        throw new Error(`featuredOrder dupliqué : ${project.featuredOrder}`);
      }
      featuredOrders.add(project.featuredOrder);
    }

    if (
      typeof project.sitemapPriority !== "number" ||
      project.sitemapPriority < 0 ||
      project.sitemapPriority > 1
    ) {
      throw new Error(
        `${project.id} : sitemapPriority doit être compris entre 0 et 1.`,
      );
    }

    const imagePath = path.join(rootDir, project.image);
    if (!existsSync(imagePath)) {
      throw new Error(`${project.id} : image introuvable (${project.image}).`);
    }
  }

  if (![...data.projects].some((project) => project.featured)) {
    throw new Error("Au moins un projet doit être featured.");
  }
}

function validateReferences(project, field, taxonomy) {
  const values = project[field];
  if (!Array.isArray(values)) {
    throw new Error(`${project.id} : ${field} doit être un tableau.`);
  }
  for (const value of values) {
    if (!Object.hasOwn(taxonomy, value)) {
      throw new Error(
        `${project.id} : référence ${field} inconnue (${value}).`,
      );
    }
  }
}

function assertNonEmpty(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${field} doit être une chaîne non vide.`);
  }
}

function renderProjectPage(project) {
  const values = {
    META_DESCRIPTION: escapeAttr(project.metaDescription),
    NAME: escapeHtml(project.name),
    CANONICAL_URL: escapeAttr(
      `${catalog.site.baseUrl}/projets/${project.slug}.html`,
    ),
    SUBTITLE: escapeHtml(project.subtitle),
    STATUS_LABEL: escapeHtml(label("status", project.status)),
    TYPE_TAGS: renderTags(project.types.map((id) => label("types", id))),
    REPOSITORY_ACTION: project.repository
      ? `<a class="button button-secondary" href="${escapeAttr(project.repository)}" rel="noopener noreferrer">Voir le dépôt GitHub</a>`
      : "",
    IMAGE: escapeAttr(`../${project.image}`),
    IMAGE_ALT: escapeAttr(project.imageAlt),
    STACK_TAGS: renderTags([
      ...project.languages.map((id) => label("languages", id)),
      ...project.stack.map((id) => label("stack", id)),
    ]),
    PROBLEM: escapeHtml(project.problem),
    FEATURES: renderListItems(project.features),
    PROOFS: renderListItems(project.proofs),
  };

  return renderTemplate(projectTemplate, values);
}

function renderCatalogPage() {
  return renderTemplate(catalogTemplate, {
    CANONICAL_URL: escapeAttr(`${catalog.site.baseUrl}/projets/`),
    FILTERS: renderFilters(),
    PROJECT_COUNT: String(catalog.projects.length),
    PROJECT_CARDS: catalog.projects
      .map((project, index) =>
        renderProjectCard(project, index + 1, "../", "./"),
      )
      .join("\n          "),
  });
}

function renderHomeIndex(currentHtml) {
  const startMarker = "<!-- GENERATED:HOME-PROJECTS:START -->";
  const endMarker = "<!-- GENERATED:HOME-PROJECTS:END -->";
  const featured = catalog.projects
    .filter((project) => project.featured)
    .sort((a, b) => a.featuredOrder - b.featuredOrder);

  const section = `    ${startMarker}
    <section id="projets" class="section section-alt snap-section" aria-labelledby="projects-title" data-section data-label="Projets">
      <div class="container">
        <div class="section-heading" data-reveal>
          <p class="eyebrow">Projets</p>
          <h2 id="projects-title">${featured.length} études de cas orientées preuves</h2>
          <p>Une sélection courte issue du catalogue complet pour montrer des compétences complémentaires. Les pages, métadonnées, filtres, sitemap et tests utilisent la même source de données.</p>
        </div>
        <div class="project-grid project-grid-focus">
          ${featured
            .map((project, index) =>
              renderProjectCard(project, index + 1, "", "projets/"),
            )
            .join("\n          ")}
        </div>
        <div class="project-section-actions">
          <a class="button button-secondary" href="projets/index.html">Voir le catalogue complet</a>
        </div>
      </div>
    </section>
    ${endMarker}`;

  if (currentHtml.includes(startMarker) && currentHtml.includes(endMarker)) {
    const start = currentHtml.indexOf(startMarker);
    const end = currentHtml.indexOf(endMarker, start) + endMarker.length;
    return `${currentHtml.slice(0, start)}${section.trimStart()}${currentHtml.slice(end)}`;
  }

  const projectStart = currentHtml.indexOf('    <section id="projets"');
  const nextSection = currentHtml.indexOf(
    '    <section id="competences"',
    projectStart,
  );
  if (projectStart < 0 || nextSection < 0) {
    throw new Error("index.html : impossible de localiser la section projets.");
  }

  return `${currentHtml.slice(0, projectStart)}${section}\n\n${currentHtml.slice(nextSection)}`;
}

function renderProjectCard(project, index, assetPrefix, hrefPrefix) {
  const languageTokens = project.languages.join(" ");
  const typeTokens = project.types.join(" ");
  const stackTokens = project.stack.join(" ");
  const homeStack = project.homeStack.map((id) => label("stack", id));
  const href = `${hrefPrefix}${project.slug}.html`;

  return `<article class="project-card project-card-playful" data-project-card data-project-slug="${escapeAttr(project.slug)}" data-language="${escapeAttr(languageTokens)}" data-type="${escapeAttr(typeTokens)}" data-stack="${escapeAttr(stackTokens)}" data-status="${escapeAttr(project.status)}" data-reveal>
            <a class="project-media" href="${escapeAttr(href)}" aria-label="Lire l’étude de cas ${escapeAttr(project.name)}">
              <img src="${escapeAttr(`${assetPrefix}${project.image}`)}" width="960" height="540" loading="lazy" alt="">
            </a>
            <div class="project-body">
              <div class="project-signal">
                <span class="project-index" aria-hidden="true">${String(index).padStart(2, "0")}</span>
                <span class="project-status">${escapeHtml(label("status", project.status))}</span>
              </div>
              <h3><a href="${escapeAttr(href)}">${escapeHtml(project.name)}</a></h3>
              <p class="project-summary">${escapeHtml(project.summary)}</p>
              <dl class="project-facts">
                <div>
                  <dt>Mission</dt>
                  <dd>${escapeHtml(project.mission)}</dd>
                </div>
                <div>
                  <dt>Preuve</dt>
                  <dd>${escapeHtml(project.proof)}</dd>
                </div>
              </dl>
              <div class="tag-list" aria-label="Technologies principales">
                ${renderTags(homeStack)}
              </div>
              <div class="card-actions project-actions">
                <a class="text-link" href="${escapeAttr(href)}">Lire l’étude de cas</a>
                ${
                  project.repository
                    ? `<a href="${escapeAttr(project.repository)}" rel="noopener noreferrer">GitHub</a>`
                    : ""
                }
              </div>
            </div>
          </article>`;
}

function renderFilters() {
  const groups = [
    ["language", "languages", "Langage"],
    ["type", "types", "Type"],
    ["stack", "stack", "Stack"],
    ["status", "status", "Statut"],
  ];

  const controls = groups.map(([dataset, taxonomyGroup, title]) => {
    const used = usedTaxonomyValues(taxonomyGroup);
    const options = used
      .map(
        (id) =>
          `<option value="${escapeAttr(id)}">${escapeHtml(label(taxonomyGroup, id))}</option>`,
      )
      .join("");

    return `<label class="project-filter-control">
              <span>${escapeHtml(title)}</span>
              <select data-filter-group="${dataset}">
                <option value="all">Tous</option>
                ${options}
              </select>
            </label>`;
  });

  return `<div class="project-filters" data-project-filters aria-label="Filtres des projets">
          ${controls.join("\n          ")}
        </div>`;
}

function usedTaxonomyValues(group) {
  const used = new Set();
  for (const project of catalog.projects) {
    if (group === "status") {
      used.add(project.status);
    } else {
      for (const value of project[group]) used.add(value);
    }
  }
  return Object.keys(catalog.taxonomy[group]).filter((id) => used.has(id));
}

function renderSitemap() {
  const urls = [
    [`${catalog.site.baseUrl}/`, "1.0"],
    [`${catalog.site.baseUrl}/projets/`, "0.9"],
    ...catalog.projects.map((project) => [
      `${catalog.site.baseUrl}/projets/${project.slug}.html`,
      project.sitemapPriority.toFixed(1),
    ]),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([url, priority]) => `  <url><loc>${escapeXml(url)}</loc><priority>${priority}</priority></url>`).join("\n")}
</urlset>
`;
}

function label(group, id) {
  const value = catalog.taxonomy[group]?.[id];
  if (!value) throw new Error(`Taxonomie inconnue : ${group}.${id}`);
  return value;
}

function renderTags(values) {
  return values
    .map((value) => `<span class="tag">${escapeHtml(value)}</span>`)
    .join("\n                ");
}

function renderListItems(values) {
  return values.map((value) => `<li>${escapeHtml(value)}</li>`).join("");
}

function renderTemplate(template, values) {
  const rendered = template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, key) => {
    if (!Object.hasOwn(values, key)) {
      throw new Error(`Placeholder sans valeur : ${key}`);
    }
    return values[key];
  });

  const leftover = rendered.match(/\{\{[A-Z0-9_]+\}\}/);
  if (leftover) throw new Error(`Placeholder non remplacé : ${leftover[0]}`);
  return rendered.endsWith("\n") ? rendered : `${rendered}\n`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function escapeXml(value) {
  return escapeHtml(value);
}
