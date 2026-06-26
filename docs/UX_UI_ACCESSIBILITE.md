# Notes UX, UI et accessibilité

## UX

- Navigation latérale persistante sur desktop, avec section active en surbrillance.
- Navigation compacte en bas d'écran sur mobile pour rester accessible au pouce.
- Navigation section par section avec flèches haut/bas visibles et déclarées dans le HTML.
- Contact et CV regroupés dans une seule section afin d'éviter les appels à l'action dispersés.
- Page d'accueil organisée en sept repères : Accueil, Valeur, Projets, Compétences, Méthode, Parcours, Contact.
- Projets affichés comme études de cas avec résumé, signalétique, preuve, stack et lien détail.
- Sélection limitée à trois projets : Streamfolio, Solvia et Aelia.

## UI

- Interface sobre, technique et moderne.
- Design responsive en grille.
- Rail de navigation latéral inspiré des interfaces produit et dashboards.
- Cartes projets structurées avec numéro, statut, mission, preuve et technologies.
- Cartes visuelles avec bordures fines, surfaces contrastées et illustrations SVG.
- Thème sombre par défaut compatible thème clair.
- Typographie système pour performance et absence de dépendance externe.
- Titres du hero réduits pour améliorer la hiérarchie visuelle et éviter l'effet trop imposant.

## Accessibilité

- Structure sémantique : `main`, `section`, `article`, `aside`, `nav`.
- Lien d'évitement vers le contenu principal.
- Focus visible renforcé.
- Rail de navigation avec `aria-current` sur la section active.
- Boutons avec états ARIA quand nécessaire : thème et navigation section par section.
- Respect de `prefers-reduced-motion`.
- Respect de `prefers-color-scheme`.
- Contrastes élevés sur les fonds principaux.
- Navigation utilisable au clavier.
- Images décoratives masquées avec `alt=""`, portrait décrit avec `alt` utile.
- Pas de carrousel automatique, pas de vidéo auto-lancée, pas d'animation essentielle.

## Performance

- Site statique sans framework.
- Contenu principal directement présent dans `index.html`.
- CSS principal conservé, avec couche d'amélioration dédiée à la branche `ai`.
- JavaScript en modules, sans dépendance externe.
- Images optimisées en WebP avec fallback JPEG.
- SVG légers pour les illustrations.
- `loading="lazy"` sur les images non critiques.
