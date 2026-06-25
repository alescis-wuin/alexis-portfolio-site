# Améliorations appliquées sur la branche ai

## Objectifs

- Corriger le décalage de navigation entre sections.
- Rendre la navigation plus lisible avec un rail latéral et un état actif.
- Réduire les appels à l'action redondants.
- Repositionner le profil comme développeur et concepteur d'applications, avec frontend, backend, desktop, données et IA locale.
- Donner plus de valeur au site avec des preuves concrètes, une méthode de travail et une lecture plus simple.

## Modifications réalisées

1. `assets/css/ai-redesign.css`
   - Ajout du scroll snapping sur desktop.
   - Ajout du rail latéral desktop et de la navigation compacte mobile.
   - Réduction de la taille des titres principaux.
   - Ajout de styles pour preuves projets, méthode et résumé professionnel.

2. `assets/js/main.js`
   - Chargement automatique de la couche CSS d'amélioration.
   - Suppression à l'affichage des boutons CV dispersés sur les pages projet.
   - Nettoyage des anciens éléments de navigation sur les pages projet.
   - Chargement du module de refonte de la page d'accueil.

3. `assets/js/ai-home.js`
   - Ajout dynamique du rail latéral.
   - Surbrillance automatique de la section visible via IntersectionObserver.
   - Refonte du hero.
   - Transformation de la section de positionnement en section Valeur ajoutée.
   - Ajout d'une section Méthode.
   - Refonte des filtres et preuves des projets.
   - Centralisation des contacts et du téléchargement du CV.

## Points à tester manuellement

- Défilement à la souris sur desktop.
- Clic sur chaque entrée du rail latéral.
- Surbrillance de section pendant le scroll.
- Navigation clavier : Tab, Enter, Escape.
- Mode clair/sombre.
- Filtres de projets.
- Responsive mobile.
- Téléchargement du CV depuis la section Contact.
