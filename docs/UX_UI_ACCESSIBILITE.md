# Notes UX, UI et accessibilité

## Analyse du site

- La page d’accueil est structurée directement dans le HTML, sans réécriture complète côté JavaScript.
- Le message principal est élargi : conception et développement d’applications, interfaces, API, données, qualité et alternance Bac+3.
- Les appels à l’action sont regroupés autour des usages principaux : consulter les projets, lire les compétences, contacter et télécharger le CV.
- Les sections suivent un ordre de lecture stable : Accueil, Valeur, Projets, Compétences, Méthode, Parcours, Contact.
- Les projets sont présentés comme des études de cas avec contexte, preuves, technologies et liens d’action.

## UX

- Navigation latérale persistante sur desktop, transformée en barre basse compacte sur écrans plus étroits.
- En desktop, chaque section de la page d’accueil occupe strictement toute la hauteur du viewport (`100dvh`), quelle que soit la résolution verticale.
- La molette est capturée en amont sur desktop pour passer d’un bloc à l’autre sans scroll progressif visible.
- Les liens d’ancre, le rail, les flèches et le clavier utilisent un positionnement instantané.
- Le scroll interne des sections longues reste possible tant que la section peut encore défiler verticalement.
- En dessous de 920 px de largeur, le site revient à un scroll web classique afin de préserver l’usage mobile.
- La feuille `section-snap.css` conserve le layout plein écran et sert de fallback natif si JavaScript n’est pas disponible.
- Filtres de projets avec `aria-pressed` et statut de résultat en zone live discrète.
- Contact et CV centralisés dans une section unique pour réduire les doublons et clarifier la conversion.

## UI

- Palette plus lisible, surfaces contrastées, bordures fines et hiérarchie typographique plus stable.
- Cartes uniformisées avec contraste, espacement et points de preuve lisibles.
- Hero moins massif : titre plus précis, texte plus court, informations clés en trois faits.
- États de survol et de focus harmonisés sur liens, boutons, filtres, rail et flèches.
- Thème sombre et thème clair conservés sans dépendance externe.

## Accessibilité

- Structure sémantique : `main`, `section`, `article`, `aside`, `nav` et libellés explicites.
- Lien d’évitement vers le contenu principal.
- Focus visible renforcé et non masqué volontairement.
- Cibles interactives dimensionnées autour d’au moins 44 px dans les principaux contrôles.
- Contrastes renforcés entre textes, surfaces, liens et boutons.
- Navigation utilisable au clavier : liens de section, boutons, filtres, flèches et changement de thème.
- Les sections longues conservent un scroll interne sur desktop pour éviter le piégeage de contenu.
- Images décoratives avec `alt=""`, portrait décrit, liens externes annoncés via `aria-label` lorsque nécessaire.

## Performance et maintenabilité

- Neutralisation des anciennes surcouches `ai-home.js`, `section-flow-fix.js`, `ai-redesign.css` et `paged-scroll.css`.
- Les améliorations UI/UX actives sont intégrées dans `index.html`, `styles.css`, `section-snap.css` et `main.js`.
- Site statique sans framework, sans police distante, sans dépendance runtime.
- Les interactions restent progressives : sans JavaScript, le contenu principal reste lisible et accessible.
