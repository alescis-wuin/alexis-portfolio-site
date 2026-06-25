# Améliorations appliquées sur la branche ai

## Objectifs

- Corriger le décalage de navigation entre sections.
- Rendre la navigation plus lisible avec un rail latéral et un état actif.
- Réduire les appels à l'action redondants.
- Repositionner le profil comme développeur et concepteur d'applications, sans le limiter au backend.
- Donner plus de valeur au site avec des preuves concrètes, une méthode de travail et une lecture plus simple.
- Supprimer les réécritures de contenu côté JavaScript quand le HTML suffit.

## Modifications réalisées

1. `index.html`
   - Intégration directe du contenu final auparavant injecté par `ai-home.js`.
   - Ajout statique du rail latéral, des sections et des flèches de navigation.
   - Mise en avant de Streamfolio, Solvia et Aelia uniquement.
   - Centralisation du contact et du CV.

2. `assets/js/main.js`
   - Suppression du chargement dynamique de `ai-home.js`.
   - Suppression des mutations de contenu et de la création dynamique de CSS.
   - Conservation des comportements progressifs : thème, menu mobile, révélations, état actif du rail.

3. `assets/js/section-flow-fix.js`
   - Suppression de la réorganisation de sections.
   - Suppression de la suppression runtime du header/footer.
   - Suppression de la création runtime des flèches.

4. `assets/css/paged-scroll.css`
   - Suppression du masquage CSS du header/footer.
   - Styles conservés pour les flèches statiques et le défilement section par section.

## Points à tester manuellement

- Défilement à la souris sur desktop.
- Clic sur chaque entrée du rail latéral.
- Surbrillance de section pendant le scroll.
- Navigation clavier : Tab, Enter, Escape, PageUp, PageDown.
- Mode clair/sombre.
- Responsive mobile.
- Téléchargement du CV depuis la section Contact.
