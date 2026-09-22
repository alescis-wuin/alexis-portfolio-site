import { spawnSync } from "node:child_process";

const patterns = [
  "package.json",
  "*.html",
  "projets/**/*.html",
  "assets/**/*.js",
  "assets/**/*.css",
  "data/**/*.json",
  "templates/**/*",
  "scripts/**/*.mjs",
  "tests/**/*.mjs",
  ".github/**/*.yml",
  "docs/**/*.md",
];

const result = spawnSync(
  "npx",
  [
    "secretlint",
    ...patterns,
    "--secretlintrc",
    ".secretlintrc.json",
    "--maskSecrets",
  ],
  {
    stdio: "inherit",
    shell: process.platform === "win32",
  },
);

process.exit(result.status ?? 1);
