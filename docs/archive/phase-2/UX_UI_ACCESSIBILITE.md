# Notes UX, UI et accessibilité

## UX

- Navigation latérale persistante sur desktop, avec section active en surbrillance.
- Navigation compacte en bas d'écran sur mobile pour rester accessible au pouce.
- Flèches haut/bas déclarées dans le HTML et limitées à un appel de `scrollIntoView()` vers la section adjacente.
- Molette, PageUp/PageDown, flèches clavier, barre d'espace et inertie restent gérées par le navigateur.
- CSS Scroll Snap utilise `proximity` uniquement sur les grands écrans et n'impose pas de verrouillage de section.
- Contact et CV regroupés dans une seule section afin d'éviter les appels à l'action dispersés.
- Page d'accueil organisée en sept repères : Accueil, Valeur, Projets, Compétences, Méthode, Parcours, Contact.
- Projets affichés comme études de cas avec résumé, signalétique, preuve, stack et lien détail.
- Sélection publique actuelle limitée à Streamfolio, Solvia et Aelia.

## UI

- Interface sobre, technique et moderne.
- Design responsive en grille.
- Rail de navigation latéral inspiré des interfaces produit et dashboards.
- Cartes projets structurées avec numéro, statut, mission, preuve et technologies.
- Cartes visuelles avec bordures fines, surfaces contrastées et illustrations SVG.
- Thème sombre par défaut compatible thème clair.
- Typographie système pour performance et absence de dépendance externe.

## Accessibilité

- Structure sémantique : `main`, `section`, `article`, `aside`, `nav`.
- Lien d'évitement vers le contenu principal.
- Focus visible renforcé.
- Rail de navigation avec `aria-current="location"` sur la section active.
- Boutons avec états ARIA quand nécessaire.
- Respect de `prefers-reduced-motion` et `prefers-color-scheme`.
- Contrastes élevés sur les fonds principaux.
- Navigation clavier native conservée ; aucun gestionnaire global ne bloque les touches de défilement.
- Images décoratives masquées avec `alt=""`, portrait décrit avec `alt` utile.
- Pas de carrousel automatique, pas de vidéo auto-lancée, pas d'animation essentielle.

## Performance

- Site statique sans framework.
- Contenu principal directement présent dans `index.html`.
- Aucun contrôleur JavaScript de molette ou d'animation de scrolling.
- JavaScript en modules, sans dépendance externe côté navigateur.
- Images optimisées en WebP avec fallback JPEG.
- SVG légers pour les illustrations.
- `loading="lazy"` sur les images non critiques.
