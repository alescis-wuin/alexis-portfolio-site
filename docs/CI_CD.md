# CI/CD GitHub Actions

## Objectif

Le dépôt contient un site statique sans étape de build applicatif. Le pipeline ajoute donc une couche qualité autour des fichiers HTML, CSS, JavaScript et automatise le déploiement VPS après validation de `main`.

## Workflows principaux

### `.github/workflows/develop-pr.yml`

Déclenchement : pull request vers `develop`.

Rôle :

- contrôler que la branche source respecte les préfixes autorisés, dont `ai/*` ;
- lancer les checks de base ;
- lancer les checks IA supplémentaires pour les branches `ai/*`.

### `.github/workflows/testing-pr.yml`

Déclenchement : pull request vers `testing`.

Rôle :

- accepter uniquement les promotions depuis `develop` ou les synchronisations depuis `main` ;
- vérifier que `testing` contient bien `main` avant promotion depuis `develop` ;
- lancer les contrôles stricts avant release candidate.

### `.github/workflows/main-pr.yml`

Déclenchement : pull request vers `main`.

Rôle :

- accepter uniquement les promotions depuis `testing` ;
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

Le workflow active l’auto-merge natif de GitHub uniquement si :

- la PR cible `develop` ;
- la PR n’est pas en draft ;
- la branche source appartient au même dépôt ;
- la PR porte le label `auto-merge`.

Il ne checkout pas le code de la PR, afin d’éviter d’exécuter du code non fiable dans un contexte `pull_request_target`.

## Secrets requis pour le déploiement VPS

À créer dans `Settings > Secrets and variables > Actions > Repository secrets` :

| Secret            | Obligatoire | Description                                                                               |
| ----------------- | ----------- | ----------------------------------------------------------------------------------------- |
| `VPS_HOST`        | Oui         | Nom de domaine ou IP du VPS.                                                              |
| `VPS_USER`        | Oui         | Utilisateur SSH de déploiement.                                                           |
| `VPS_SSH_KEY`     | Oui         | Clé privée SSH dédiée au déploiement.                                                     |
| `VPS_DEPLOY_PATH` | Oui         | Dossier cible servi par Nginx, Apache ou Caddy, par exemple `/var/www/alexis-portfolio-site`. |
| `VPS_PORT`        | Non         | Port SSH. `22` par défaut.                                                                |

## Préparation minimale du VPS

Créer un utilisateur de déploiement dédié ou peu privilégié, puis lui donner accès uniquement au dossier cible.

Exemple :

```bash
sudo mkdir -p /var/www/alexis-portfolio-site
sudo chown -R deploy:www-data /var/www/alexis-portfolio-site
sudo chmod -R 2755 /var/www/alexis-portfolio-site
```

La clé publique correspondant à `VPS_SSH_KEY` doit être ajoutée dans `~deploy/.ssh/authorized_keys`.

## Protection des branches et auto-merge

À configurer dans GitHub après merge des workflows :

1. Activer l’auto-merge du dépôt dans `Settings > General > Pull Requests > Allow auto-merge`.
2. Créer ou adapter des rulesets pour `develop`, `testing` et `main`.
3. Rendre obligatoire le check `Basic checks` avant merge vers `develop`.
4. Rendre obligatoire les contrôles stricts avant merge vers `testing` et `main`.
5. Pour `main`, imposer les merges via PR depuis `testing`, puis laisser le CD déployer automatiquement après le push sur `main`.
6. Ajouter le label `auto-merge` uniquement aux PRs qui peuvent être fusionnées automatiquement quand tous les checks passent.

## Analyse de dépendances GitHub avancée

Le dépôt étant privé, GitHub Dependency Review peut nécessiter GitHub Code Security ou GitHub Advanced Security selon le type de compte et d’organisation. Le pipeline actuel utilise donc `npm audit`, Dependabot et Secretlint sans supposer que cette option payante ou organisationnelle est active.

Si Dependency Review est disponible, ajouter ensuite `actions/dependency-review-action` comme check obligatoire sur les pull requests.
