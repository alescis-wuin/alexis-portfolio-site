# Portfolio Alexis Guinot

Site web portfolio statique, sans dépendance de build applicatif.

## Contenu

- `index.html` : page d'accueil complète, avec rail de navigation, sections et cartes projets en HTML statique.
- `projets/streamfolio.html`, `projets/solvia.html`, `projets/aelia.html` : études de cas actuellement mises en avant.
- `assets/css/styles.css` : design system, responsive, accessibilité, thèmes clair/sombre.
- `assets/css/ai-redesign.css` : rail de navigation, défilement natif entre sections, contrôles haut/bas et améliorations UI/UX.
- `assets/css/project-cards.css` : signalétique claire et cohérente des cartes projets.
- `assets/js/main.js` : thème, menu mobile, révélations progressives, état actif du rail et navigation par flèches via `scrollIntoView()`.
- `assets/img/` : logo, photo optimisée, illustrations SVG.
- `assets/cv/CV_Alexis-GUINOT.pdf` : CV fourni.
- `docs/` : notes d'analyse, accessibilité, validation, personnalisation et CI/CD.

Le navigateur conserve le contrôle de la molette, des touches de déplacement et du défilement. Sur grand écran, CSS Scroll Snap utilise le mode `proximity` ; il est désactivé pour les tailles plus petites et avec `prefers-reduced-motion`.

## Initialiser l'environnement de développement

Node.js 24 ou supérieur est requis.

```bash
npm ci
npm run hooks:install
npx playwright install chromium
```

## Valider le projet

```bash
npm run check:strict
```

La validation stricte couvre le formatage, l'audit npm incluant la toolchain de développement, le scan de secrets, les linters, la validation statique et les tests E2E Playwright.

## Lancer localement

```bash
npm run serve
```

Puis ouvrir `http://localhost:8080`.

## Déploiement

Le site peut être publié tel quel sur GitHub Pages, Netlify, Vercel, Cloudflare Pages ou un hébergement statique classique.

Pour GitHub Pages avec le domaine actuel, le fichier `CNAME` contient :

```txt
www.alexis-guinot.fr
```

La production actuelle est également déployée vers un VPS par GitHub Actions après promotion jusqu'à `main`.

## Points à vérifier avant publication

- Vérifier que le CV PDF joint est bien la version publique souhaitée.
- Le téléphone et la RQTH ne sont pas affichés dans les pages HTML ; ils restent uniquement dans le PDF fourni.
- Adapter les liens si le domaine final change.
- Remplacer les illustrations SVG par des captures réelles des projets lorsque disponibles.
- Tester le rail latéral, les flèches haut/bas, le défilement natif, le responsive et le thème clair/sombre.
