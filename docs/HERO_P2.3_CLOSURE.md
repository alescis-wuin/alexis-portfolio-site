# Clôture P2.3 — Hero

## Statut

P2.3 est considéré comme fonctionnellement terminé après P2.3.6. Cette phase de clôture
n'ajoute ni contenu éditorial, ni effet visuel, ni dépendance frontend : elle consolide les
contrats de non-régression et documente l'état validé avant le passage à P2.4.

## Contrat final

Le Hero conserve :

- le positionnement « Concepteur-développeur full-stack » ;
- les axes Java / Spring et C# / .NET ;
- l'approche architecture logicielle, API, données et tests ;
- la recherche d'une alternance d'un an dans la Métropole de Rouen à partir d'octobre 2026 ;
- les CTA « Voir les projets » et « Découvrir mon profil » ;
- le portrait professionnel ;
- le module abstrait Interface → API/logique → Données → Tests/qualité.

Le Hero ne réintroduit pas l'intitulé « architecte logiciel » ni le compteur
`data-featured-project-count`.

## Décisions de composition

- `<= 980 px` : composition principale en une colonne ;
- `<= 680 px` : le graphe technique décoratif est retiré plutôt que compressé ;
- `<= 360 px` : les CTA passent sur une colonne ;
- `981–1100 px` : le graphe conserve ses codes mais masque les libellés secondaires ;
- faible hauteur : pas de scroll snap forcé et densité réduite ;
- grand écran : le reset `grid-column: auto` protège la grille Hero des anciennes règles
  historiques de `styles.css`.

## Accessibilité et mouvement

- le panneau technique est décoratif et `aria-hidden` ;
- le portrait conserve une alternative textuelle ;
- le panneau visuel ne crée pas de landmark complémentaire redondant ;
- aucune information nécessaire ne dépend du mouvement ;
- `prefers-reduced-motion: reduce` désactive animations, transitions de mouvement et
  parallaxe ;
- le parallaxe n'est activé que pour un pointeur fin ;
- les CTA ont une cible d'au moins 44 px et un focus visible ;
- P2.3.6 verrouille également l'ordre clavier naturel des deux CTA et l'absence de contrôle
  focalisable dans le panneau visuel.

## Matrice de validation

La validation responsive dédiée couvre au minimum :

- 320×720 ;
- 390×844 ;
- 768×1024 ;
- 1024×768 ;
- 1366×768 ;
- 1920×800 ;
- 1920×1080 ;
- 2560×1080 ;
- 3440×1440 ;
- 960×540 comme reflow équivalent à un affichage Full HD à 200 %.

La QA visuelle canonique conserve six profils et 45 captures déterministes. Le Hero est
capturé sur les six profils, avec `prefers-reduced-motion: reduce` dans le harnais visuel.

## Validation de clôture

Avant de committer P2.3.6 :

```bash
npm run check:strict
npm run capture:visual
git diff --check
git status --short
```

Le commit de clôture ne doit contenir que les tests et cette documentation, sauf anomalie
fonctionnelle découverte pendant la validation.

## Hors périmètre de P2.3

Les éléments suivants restent différés et ne bloquent pas la clôture du Hero :

- remplacement du CV public placeholder ;
- Lighthouse / PageSpeed global ;
- audit axe DevTools global ;
- QA finale de publication P2.7 ;
- refonte de la surface Projets P2.4.
