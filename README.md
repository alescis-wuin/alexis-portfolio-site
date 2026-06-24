# Portfolio Alexis Guinot

Site web portfolio statique, sans dépendance de build.

## Contenu

- `index.html` : page d'accueil complète.
- `projets/*.html` : études de cas projet.
- `assets/css/styles.css` : design system, responsive, accessibilité, thèmes clair/sombre.
- `assets/js/main.js` : menu mobile, thème, filtres de projets, révélations progressives.
- `assets/img/` : logo, photo optimisée, illustrations SVG.
- `assets/cv/CV_Alexis-GUINOT.pdf` : CV fourni.
- `docs/` : notes d'analyse, accessibilité, validation et personnalisation.

## Lancer localement

Option simple : ouvrir `index.html` dans un navigateur.

Option recommandée : servir le dossier avec un serveur local.

```bash
python -m http.server 8080
```

Puis ouvrir : `http://localhost:8080`.

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
