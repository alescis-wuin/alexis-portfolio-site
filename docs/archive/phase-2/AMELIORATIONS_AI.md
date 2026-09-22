# Améliorations appliquées à la refonte du portfolio

## Objectifs

- Conserver un HTML canonique et directement exploitable sans réécriture du contenu par JavaScript.
- Rendre la navigation lisible sans remplacer les comportements natifs du navigateur.
- Réduire les appels à l'action redondants.
- Repositionner le profil comme développeur et concepteur d'applications, sans le limiter au backend.
- Donner plus de valeur au site avec des preuves concrètes, une méthode de travail et une lecture simple.

## État consolidé P0

1. `index.html`
   - Contenu final, rail, sections, cartes et flèches déclarés statiquement.
   - Mise en avant de Streamfolio, Solvia et Aelia.
   - Chargement direct de `styles.css`, `ai-redesign.css` et `project-cards.css`.

2. `assets/js/main.js`
   - Aucun injecteur de contenu.
   - Aucun contrôleur global de molette ou de clavier.
   - Thème, menu mobile, révélations et suivi de section conservés.
   - Flèches de navigation implémentées avec `scrollIntoView()` et historique d'URL.

3. CSS
   - Suppression de l'ancienne couche `paged-scroll.css`.
   - Scroll Snap natif en mode `proximity` sur les grands écrans seulement.
   - Respect de `prefers-reduced-motion`.
   - Styles des contrôles de section regroupés dans `ai-redesign.css`.

4. Qualité
   - Réactivation du test de persistance du thème.
   - Tests du périmètre public des projets et de la navigation par flèches.
   - `package-lock.json` versionné et installations CI avec `npm ci`.
   - `npm audit` appliqué à l'ensemble de la toolchain, y compris les `devDependencies`.

## Points à tester manuellement

- Défilement libre à la souris et au pavé tactile sur desktop.
- PageUp/PageDown, flèches clavier, barre d'espace et Tab sans interception JavaScript.
- Clic sur chaque entrée du rail latéral.
- Flèches haut/bas et mise à jour de la section active.
- Mode clair/sombre et persistance après rechargement.
- Responsive mobile.
- Mode système « réduire les animations ».
- Téléchargement du CV depuis la section Contact.
