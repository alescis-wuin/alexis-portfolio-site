import { cpSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
for (const entry of [
  "index.html",
  "projets",
  "assets",
  "site.webmanifest",
  "CNAME",
  "robots.txt",
  "sitemap.xml",
]) {
  cpSync(path.join(root, entry), path.join(output, entry), { recursive: true });
}
console.log(
  "Site statique prêt dans dist/ (sans documentation ni outils de développement).",
);
