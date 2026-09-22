# CI/CD GitHub Actions

## Objectif

Le dépôt contient un site statique sans étape de build applicatif. Le pipeline ajoute une couche qualité autour des fichiers HTML, CSS et JavaScript, puis automatise le déploiement VPS après validation de `main`.

Le dépôt versionne `package-lock.json`. Les workflows utilisent `npm ci` afin de reproduire exactement l'arbre de dépendances validé. L'audit npm couvre également les dépendances de développement, qui constituent ici l'essentiel de la toolchain.

## Workflows principaux

### `.github/workflows/develop-pr.yml`

Déclenchement : pull request vers `develop`.

Rôle :

- contrôler que la branche source respecte les préfixes autorisés, dont `ai/*` ;
- installer les dépendances avec `npm ci` ;
- lancer les checks de base ;
- lancer les checks IA supplémentaires pour les branches `ai/*`.

### `.github/workflows/testing-pr.yml`

Déclenchement : pull request vers `testing`.

Rôle :

- accepter uniquement les promotions depuis `develop` ou les synchronisations depuis `main` ;
- vérifier que `testing` contient bien `main` avant promotion depuis `develop` ;
- installer les dépendances avec `npm ci` ;
- lancer les contrôles stricts avant release candidate.

### `.github/workflows/main-pr.yml`

Déclenchement : pull request vers `main`.

Rôle :

- accepter uniquement les promotions depuis `testing` ;
- installer les dépendances avec `npm ci` ;
- lancer les contrôles stricts ;
- effectuer un smoke test local avant production.

### `.github/workflows/main-deploy.yml`

Déclenchement :

- push sur `main` ;
- lancement manuel via `workflow_dispatch`.

Le workflow synchronise les fichiers statiques utiles vers le VPS avec `rsync` :

- `index.html` ;
- `site.webmanifest` ;
- `CNAME` ;
- `robots.txt` ;
- `sitemap.xml` ;
- `assets/` ;
- `projets/`.

### `.github/workflows/develop-automerge.yml`

Déclenchement : pull request vers `develop`.

Le workflow active l'auto-merge natif de GitHub uniquement si :

- la PR cible `develop` ;
- la PR n'est pas en draft ;
- la branche source appartient au même dépôt ;
- la PR porte le label `auto-merge`.

Il ne checkout pas le code de la PR, afin d'éviter d'exécuter du code non fiable dans un contexte `pull_request_target`.

## Quality gates

`npm run check:strict` exécute :

- contrôle Prettier ;
- `npm audit --audit-level=high` sur l'ensemble des dépendances ;
- Secretlint ;
- ESLint ;
- Stylelint ;
- html-validate ;
- validation statique des références et métadonnées ;
- tests E2E Playwright.

## Secrets requis pour le déploiement VPS

| Secret            | Obligatoire | Description |
| ----------------- | ----------- | ----------- |
| `VPS_HOST`        | Oui         | Nom de domaine ou IP du VPS. |
| `VPS_USER`        | Oui         | Utilisateur SSH de déploiement. |
| `VPS_SSH_KEY`     | Oui         | Clé privée SSH dédiée au déploiement. |
| `VPS_DEPLOY_PATH` | Oui         | Dossier cible servi par Nginx, Apache ou Caddy. |
| `VPS_PORT`        | Non         | Port SSH, `22` par défaut. |

## Protection des branches

1. Rendre obligatoire le check `Basic checks` avant merge vers `develop`.
2. Rendre obligatoires les contrôles stricts avant merge vers `testing` et `main`.
3. Imposer pour `main` les merges via PR depuis `testing`.
4. Laisser le CD déployer automatiquement après le push validé sur `main`.
5. Réserver le label `auto-merge` aux PRs pouvant être fusionnées automatiquement après réussite des checks.
