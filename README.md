# Portfolio Alexis Guinot

Site web portfolio statique, sans dépendance de build applicatif en production.

## Architecture

- `data/projects.json` : source de vérité unique du catalogue projets et de sa taxonomie.
- `templates/*.html.tpl` : gabarits statiques des pages projet et du catalogue.
- `scripts/generate-projects.mjs` : génère les pages projet, `/projets/index.html`, la section projets de l'accueil et `sitemap.xml`.
- `index.html` : page d'accueil statique ; sa section projets est générée et versionnée.
- `projets/*.html` : pages statiques générées et versionnées.
- `assets/css/styles.css` : design system, responsive, accessibilité, thèmes clair/sombre.
- `assets/css/ai-redesign.css` : rail de navigation, défilement natif entre sections et contrôles haut/bas.
- `assets/css/project-cards.css` : cartes, catalogue et filtres projets.
- `assets/js/main.js` : thème, menu mobile, révélations, navigation de sections et filtres du catalogue.
- `tests/e2e/portfolio.spec.mjs` : tests Playwright pilotés par `data/projects.json`.
- `docs/PROJECT_CATALOG.md` : documentation du modèle de données et procédure d'ajout d'un projet.

Le navigateur conserve le contrôle de la molette, des touches de déplacement et du défilement. Sur grand écran, CSS Scroll Snap utilise le mode `proximity` ; il est désactivé pour les tailles plus petites et avec `prefers-reduced-motion`.

## Initialiser l'environnement de développement

Node.js 24 ou supérieur est requis.

```bash
npm ci
npm run hooks:install
npx playwright install chromium
```

## Modifier ou ajouter un projet

Modifier uniquement `data/projects.json` et ajouter les ressources nécessaires, puis régénérer :

```bash
npm run generate
```

Les sorties générées doivent être commitées avec la source. La CI exécute `npm run generate:check` et échoue si elles sont désynchronisées.

## Valider le projet

```bash
npm run check:strict
```

La validation stricte couvre la synchronisation des artefacts générés, le formatage, l'audit npm incluant la toolchain de développement, le scan de secrets, les linters, la validation statique et les tests E2E Playwright.

## Lancer localement

```bash
npm run serve
```

Puis ouvrir `http://localhost:8080`.

Le catalogue complet est disponible sous `http://localhost:8080/projets/`.

## Déploiement

Le site reste entièrement statique : aucune génération n'est nécessaire sur le VPS. Les fichiers générés et validés sont versionnés dans Git puis déployés tels quels.

La production actuelle est déployée vers un VPS par GitHub Actions après promotion jusqu'à `main`.

## Points à vérifier avant publication

- Vérifier que le CV PDF joint est bien la version publique souhaitée.
- Le téléphone et la RQTH ne sont pas affichés dans les pages HTML ; ils restent uniquement dans le PDF fourni.
- Adapter les liens si le domaine final change.
- Remplacer les illustrations SVG par des captures réelles des projets lorsque disponibles.
- Tester le rail latéral, les flèches haut/bas, le défilement natif, le responsive, les filtres et le thème clair/sombre.
