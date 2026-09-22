# Vérifications de la livraison

Exécutées le 21 septembre 2026 sur le code livré, en environnement Linux avec Node.js 24.19.0, Playwright 1.61.1, Chromium 153.0.8010.0 et axe-core 4.13.0.

## Résultats

| Contrôle | Résultat |
| --- | --- |
| `npm run generate:check` | 9 sorties générées synchronisées |
| Validation HTML et références internes | 8 pages valides |
| Validation des médias | Fichiers, types et dimensions vérifiés |
| Budgets de ressources | Respectés pour HTML, CSS, JavaScript et médias |
| Tests du générateur | 16 réussis |
| Tests de contenu et contrats conservés | 12 réussis |
| Prettier, ESLint, Stylelint, html-validate | Réussis |
| Audit npm | 0 vulnérabilité signalée lors de l’exécution |
| Secretlint | Réussi |
| Tests navigateur | 40 réussis, 4 exclusions conditionnelles prévues |
| axe-core | Aucune violation remontée sur les 8 pages, profils ordinateur et mobile |
| Captures scénarisées | 19 réussies ; vues ordinateur et mobile |
| CV public | 1 page, texte extractible, rendu visuel vérifié |

Les quatre exclusions évitent des répétitions : deux tests propres au mobile ne tournent pas dans le profil ordinateur, le test propre au catalogue desktop ne tourne pas sur mobile, et la matrice complète de largeurs CSS n’est exécutée qu’une fois.

`CONTROLES.log` contient la sortie de la suite stricte, débarrassée des requêtes HTTP répétitives du serveur de test.

## Périmètre des tests navigateur

- Accueil, catalogue et six études de cas : H1 unique, région principale et analyse axe avec les tags WCAG 2 A/AA, WCAG 2.1 AA, WCAG 2.2 AA et bonnes pratiques.
- Parcours accueil → projet → rubrique tests ; cohérence de la sélection issue des données.
- Téléchargement du CV avec réponse PDF effective.
- Menu mobile : clavier, Échap, retour du focus au bouton, focus sur la section visitée et passage au format ordinateur.
- Lien d’évitement et navigation sans JavaScript.
- Copie de l’adresse : succès et rejet simulé par le navigateur. Dans ce dernier cas, l’adresse reste sélectionnable et le lien e-mail fonctionne.
- Filtres combinés, état sans résultat, compteur et réinitialisation.
- Décodage des images de toutes les études de cas.
- Visionneuse : ouverture, fermeture, Échap, retour du focus et dimensions mobiles.
- Débordements horizontaux sur les huit pages aux largeurs 320, 360, 390, 768, 1024, 1280, 1440, 1920, 2560 et 3840 pixels CSS.
- Texte agrandi à 200 % dans une fenêtre de 640 pixels, réduction du mouvement, absence de scroll snap et absence de requête tierce pour l’accueil.

Le texte agrandi et le viewport à 320 pixels complètent le contrôle de reflow ; il ne s’agit pas d’un test manuel du zoom de chaque navigateur ni d’une validation avec un lecteur d’écran.

## Contrôle visuel

Les 19 captures scénarisées couvrent les sept sections de l’accueil et le catalogue à 390 × 844 et 1920 × 1080, ainsi que le début de Streamfolio sur mobile, son architecture et sa galerie sur grand écran. Les captures des pages complètes de l’accueil et du CV sont ajoutées au dossier `CAPTURES/`.

La revue a notamment conduit à corriger les portées de colonnes héritées des anciennes grilles, la disparition du nom dans l’en-tête mobile, la composition de la carte principale sur téléphone et les couleurs résiduelles dans les études de cas. Les tests ont révélé le saut de titre du catalogue et un débordement d’identifiant technique dans Aelia à 320 pixels ; ces défauts ont été corrigés, sans exclusion de règle axe.

Le téléchargement du navigateur normalement associé à Playwright a expiré dans cet environnement. Le contrôle a donc utilisé un binaire Chromium disponible séparément, indiqué par `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Ce binaire ne fait pas partie du site ni de ses dépendances de production. Les instructions normales d’installation Playwright restent dans le README.

## Comparaison des sources

Mesures non compressées, à partir de l’archive initiale et des fichiers livrés :

| Indicateur | Avant | Après |
| --- | ---: | ---: |
| HTML de l’accueil | 44 438 octets | 29 037 octets |
| JavaScript principal | 11 796 octets | 10 853 octets |
| CSS effectivement référencées par l’accueil | 94 079 octets | 93 389 octets |
| Mots dans le contenu HTML de `main` | 1 198 | 836 |

Le comptage de mots est une séparation des nœuds texte HTML par espaces ; il inclut le texte des formations repliées. L’accueil comporte environ 30 % de mots en moins selon cette méthode. Cette réduction ne mesure ni un temps de lecture utilisateur, ni une hausse d’efficacité du recrutement. Les octets ne sont pas des scores Lighthouse ni des mesures Web Vitals en production.

## Limites connues

- Aucune session avec des recruteurs, aucun lecteur d’écran réel, aucun test Firefox ou Safari n’a été exécuté.
- Le résultat axe n’est pas une attestation de conformité WCAG ou RGAA.
- Le CV PDF n’est pas balisé PDF/UA ; les informations essentielles existent en HTML.
- Les projets applicatifs cités n’ont pas été exécutés ni réaudités : l’intervention teste le portfolio et s’appuie sur leurs descriptions fournies.
- La mise en ligne, le domaine, les en-têtes serveur et les performances réseau réelles n’ont pas été modifiés ou mesurés.
- Les liens externes sont conservés depuis les sources ; leur disponibilité distante n’est pas garantie par les tests locaux.
