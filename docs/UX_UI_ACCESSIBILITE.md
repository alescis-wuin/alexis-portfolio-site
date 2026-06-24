# Notes UX, UI et accessibilité

## UX

- Navigation courte : Accueil, Projets, Compétences, Parcours, Contact.
- Lecture rapide du positionnement dès le hero.
- Projets affichés sous forme d'études de cas avec résumé, stack, lien détail et statut.
- Filtrage des projets par domaine pour faciliter l'exploration.
- Contact final clair avec e-mail, LinkedIn, GitHub et CV.

## UI

- Interface sobre, technique et moderne.
- Design responsive en grille.
- Cartes visuelles avec bordures fines, surfaces contrastées et illustrations SVG.
- Thème sombre par défaut compatible thème clair.
- Typographie système pour performance et absence de dépendance externe.

## Accessibilité

- Structure sémantique : `header`, `nav`, `main`, `section`, `article`, `footer`.
- Lien d'évitement vers le contenu principal.
- Focus visible renforcé.
- Boutons avec états ARIA quand nécessaire : menu mobile, thème, filtres.
- Respect de `prefers-reduced-motion`.
- Respect de `prefers-color-scheme`.
- Contrastes élevés sur les fonds principaux.
- Navigation utilisable au clavier.
- Images décoratives masquées avec `alt=""`, portrait décrit avec `alt` utile.
- Pas de carrousel automatique, pas de vidéo auto-lancée, pas d'animation essentielle.

## Performance

- Site statique sans framework.
- CSS unique, JavaScript minimal en module.
- Images optimisées en WebP avec fallback JPEG.
- SVG légers pour les illustrations.
- `loading="lazy"` sur les images non critiques.
