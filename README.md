# Portfolio Alexis Guinot

Site web portfolio statique, sans dépendance de build.

## Contenu

- `index.html` : page d’accueil complète, structurée en sections statiques.
- `projets/*.html` : études de cas projet.
- `assets/css/styles.css` : design system, responsive, thèmes clair/sombre, accessibilité, rail de navigation et navigation section par section.
- `assets/js/main.js` : thème, navigation mobile, filtres de projets, révélations progressives, rail de section, flèches et navigation clavier.
- `assets/css/ai-redesign.css`, `assets/css/paged-scroll.css`, `assets/js/ai-home.js`, `assets/js/section-flow-fix.js` : anciens fichiers neutralisés et non chargés, conservés comme marqueurs historiques.
- `assets/img/` : logo, photo optimisée et illustrations SVG.
- `assets/cv/CV_Alexis-GUINOT.pdf` : CV fourni.
- `docs/` : notes d’analyse, accessibilité, validation, personnalisation et améliorations.

## Lancer localement

Option simple : ouvrir `index.html` dans un navigateur.

Option recommandée : servir le dossier avec un serveur local.

```bash
python -m http.server 8080
```

Puis ouvrir : `http://localhost:8080`.

## Contrôles disponibles

```bash
npm run check:basic
npm run check:ai
npm run check:strict
```

## Déploiement

Le site peut être publié tel quel sur GitHub Pages, Netlify, Vercel, Cloudflare Pages ou un hébergement statique classique.

Pour GitHub Pages avec le domaine actuel, le fichier `CNAME` contient :

```txt
www.alexis-guinot.fr
```

## Points à vérifier avant publication

- Vérifier que le CV PDF joint est bien la version publique souhaitée.
- Le téléphone et la RQTH ne sont pas affichés dans les pages HTML ; ils restent uniquement dans le PDF fourni.
- Adapter les liens si le domaine final change.
- Remplacer les illustrations SVG par des captures réelles des projets lorsque disponibles.
- Tester le rail latéral, la navigation mobile, les filtres, le thème clair/sombre, le clavier et les flèches de section.
