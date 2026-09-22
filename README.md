# Portfolio Alexis Guinot — refonte Signature 2026

Site statique complet, sombre et responsive. Version 1.1.0, réalisée à partir de `website(1).zip`.

## Voir le site

Depuis ce dossier :

```bash
python3 -m http.server 8080
```

Ouvrir **http://localhost:8080**. Node et npm ne sont pas nécessaires pour consulter le site. Le dossier `dist/` contient une copie des fichiers publics prête à héberger.

## Lire le dossier de livraison

- `docs/refonte-2026/AUDIT_ET_DECISIONS.md` : audit, recherche sourcée, objectifs de lecture, arbitrages et étapes réalisées.
- `docs/refonte-2026/VALIDATION.md` : résultats des vérifications et limites.
- `docs/refonte-2026/CAPTURES/` : aperçus ordinateur et mobile.
- `docs/refonte-2026/metrics.json` : comparaison quantitative des sources avant/après.
- `docs/refonte-2026/MODIFICATIONS.md` : fichiers modifiés, intégration et retour arrière.

La documentation de cette refonte décrit la présentation actuelle. Les contrats P2.3–P2.5 et leurs anciennes captures restent historiques. `docs/SOURCE_DE_VERITE.md` conserve les faits du profil ; la sélection actuelle tient compte de ses réserves de publication.

## Développer et vérifier

Node.js 24+, npm et Python 3 :

```bash
npm ci
npx playwright install chromium
npm run check:strict
```

La suite stricte vérifie les fichiers générés, les médias, les budgets, les tests de génération et de contenu, le formatage, l’audit des dépendances, les secrets, les linters et les parcours navigateur, dont axe-core.

Un Chromium déjà installé peut être indiqué avec `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Sinon Playwright utilise son navigateur téléchargé normalement. Cette variable n’est pas nécessaire à l’usage du site.

```bash
npm run capture:visual
```

Les captures sont produites dans `artifacts/visual/`. Le script d’origine propose une matrice plus large que les 19 captures réalisées pour la livraison ; voir le rapport de validation.

## Modifier le contenu

| Élément | Source |
| --- | --- |
| Accueil, profil, disponibilité, contact | `index.html`, hors marqueurs `GENERATED:HOME-PROJECTS` |
| Projets, sélection, versions de travail | `data/projects.json` |
| Pages projet et catalogue | `templates/` et `scripts/generate-projects.mjs` |
| Couche visuelle actuelle | `assets/css/signature.css` |
| Styles communs et composants projet | `assets/css/styles.css`, `assets/css/project-cards.css` |
| Navigation, copie e-mail, filtres, visionneuse | `assets/js/main.js` |
| CV public | `assets/cv/CV_Alexis-GUINOT.pdf` ; source dans `scripts/generate-cv.py` |

Après modification des projets ou gabarits :

```bash
npm run generate
npm run check:strict
npm run package:site
```

`package:site` reconstruit seulement le dossier local `dist/`, à partir d’une liste explicite de fichiers publics. La génération ne nécessite aucun serveur applicatif en production.

Pour modifier le CV, adapter son script puis, facultativement, installer les dépendances Python dans un environnement isolé :

```bash
python3 -m venv .venv-cv
.venv-cv/bin/pip install -r requirements-cv.txt
.venv-cv/bin/python scripts/generate-cv.py
```

Le script cherche les polices DejaVu dans les emplacements Linux courants. Utiliser `--font-dir /chemin/vers/les/polices` si nécessaire. Le PDF livré est déjà généré.

## Intégration dans un dépôt existant

Travailler dans une branche dédiée avec un arbre Git propre. Comparer l’archive avec le dépôt courant avant copie, en particulier si des travaux plus récents ont été effectués. Les fichiers déjà générés sont livrés. Aucun commit ni déploiement distant n’a été effectué.

Le workflow VPS existant reste présent. Une ligne vide qui interrompait la commande `rsync` a été corrigée. Ne pas déployer les dossiers de documentation, de tests, les outils npm ou les environnements Python : seuls les fichiers de `dist/` sont publics.
