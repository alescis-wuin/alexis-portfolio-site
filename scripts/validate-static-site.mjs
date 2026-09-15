import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const ignoredDirectories = new Set([
  ".git",
  ".github",
  "node_modules",
  "dist",
  "build",
  "coverage",
  "artifacts",
  "playwright-report",
  "test-results",
]);

const htmlFiles = walk(rootDir)
  .filter((filePath) => filePath.endsWith(".html"))
  .sort();

const errors = [];

if (htmlFiles.length === 0) {
  errors.push("Aucun fichier HTML trouvé.");
}

for (const filePath of htmlFiles) {
  const html = readFileSync(filePath, "utf8");
  validateHtmlDocument(filePath, html);
  validateReferences(filePath, html);
}

if (errors.length > 0) {
  console.error("Validation statique échouée :");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Validation statique OK (${htmlFiles.length} page(s) HTML).`);

function walk(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".") && ![".well-known"].includes(entry.name)) {
      if (ignoredDirectories.has(entry.name)) continue;
    }

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        files.push(...walk(fullPath));
      }
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function validateHtmlDocument(filePath, html) {
  const displayPath = toDisplayPath(filePath);
  const requiredPatterns = [
    ["doctype", /<!doctype html>/i],
    ['lang="fr"', /<html\s+[^>]*lang=["']fr["']/i],
    ["meta viewport", /<meta\s+[^>]*name=["']viewport["']/i],
    [
      "meta description",
      /<meta\s+[^>]*name=["']description["'][^>]*content=["'][^"']{40,}["']/i,
    ],
    ["title", /<title>[^<]{10,}<\/title>/i],
    ["main", /<main\b/i],
    ["h1", /<h1\b/i],
  ];

  for (const [label, pattern] of requiredPatterns) {
    if (!pattern.test(html)) {
      errors.push(
        `${displayPath} : balise ou métadonnée manquante (${label}).`,
      );
    }
  }
}

function validateReferences(filePath, html) {
  const displayPath = toDisplayPath(filePath);
  const currentDir = path.dirname(filePath);
  const currentIds = extractIds(html);
  const references = extractReferences(html);

  for (const reference of references) {
    if (shouldIgnoreReference(reference)) continue;

    const [withoutQuery] = reference.split("?");
    const [rawTargetPath, rawHash] = withoutQuery.split("#");
    const targetPath = decodeURIComponent(rawTargetPath || "");
    const hash = rawHash ? decodeURIComponent(rawHash) : "";

    if (!targetPath && hash) {
      if (!currentIds.has(hash)) {
        errors.push(`${displayPath} : ancre locale introuvable #${hash}.`);
      }
      continue;
    }

    const resolved = path.resolve(currentDir, targetPath);

    if (!resolved.startsWith(rootDir)) {
      errors.push(`${displayPath} : référence hors dépôt (${reference}).`);
      continue;
    }

    if (!existsSync(resolved)) {
      errors.push(
        `${displayPath} : fichier référencé introuvable (${reference}).`,
      );
      continue;
    }

    if (hash && resolved.endsWith(".html")) {
      const targetHtml = readFileSync(resolved, "utf8");
      const targetIds = extractIds(targetHtml);
      if (!targetIds.has(hash)) {
        errors.push(`${displayPath} : ancre introuvable ${reference}.`);
      }
    }

    if (existsSync(resolved) && statSync(resolved).isDirectory()) {
      errors.push(
        `${displayPath} : référence vers un dossier au lieu d'un fichier (${reference}).`,
      );
    }
  }
}

function extractReferences(html) {
  const references = new Set();
  const attributePattern = /\b(?:href|src|poster)\s*=\s*(["'])(.*?)\1/giu;
  const srcsetPattern = /\bsrcset\s*=\s*(["'])(.*?)\1/giu;

  for (const match of html.matchAll(attributePattern)) {
    references.add(match[2].trim());
  }

  for (const match of html.matchAll(srcsetPattern)) {
    for (const entry of match[2].split(",")) {
      const url = entry.trim().split(/\s+/)[0];
      if (url) references.add(url);
    }
  }

  return [...references];
}

function extractIds(html) {
  const ids = new Set();
  const idPattern = /\bid\s*=\s*(["'])(.*?)\1/giu;

  for (const match of html.matchAll(idPattern)) {
    ids.add(match[2]);
  }

  return ids;
}

function shouldIgnoreReference(reference) {
  return (
    reference.length === 0 ||
    reference.startsWith("http://") ||
    reference.startsWith("https://") ||
    reference.startsWith("mailto:") ||
    reference.startsWith("tel:") ||
    reference.startsWith("data:") ||
    reference.startsWith("javascript:")
  );
}

function toDisplayPath(filePath) {
  return path.relative(rootDir, filePath).replaceAll(path.sep, "/");
}
