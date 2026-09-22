# Modifications et reprise

## Fichiers principaux

| Fichiers | Modification |
| --- | --- |
| `index.html` | Accueil réécrit, navigation compacte, portrait, compétences, parcours, formation, méthode, contact et pied de page |
| `assets/css/signature.css` | Nouvelle identité commune, responsive, clavier, réduction du mouvement, couleurs forcées et impression |
| `assets/js/main.js` | Suppression du parallaxe, correction du menu et du focus, copie de l’adresse avec retour d’état |
| `data/projects.json` | Résumés simplifiés, sélection de trois projets, note de version de travail pour Aelia/Alycia |
| `templates/*.html.tpl` | Style commun, sommaire des études, note éditoriale et niveaux de titres |
| `scripts/generate-projects.mjs` | Génération adaptée, titres H2 du catalogue, cartes d’accueil simplifiées |
| `projets/*.html`, `sitemap.xml` | Sorties synchronisées avec les données et les gabarits |
| `assets/cv/CV_Alexis-GUINOT.pdf` | Nouveau CV public d’une page |
| `scripts/generate-cv.py`, `requirements-cv.txt` | Source et dépendance facultative pour modifier le CV |
| `assets/img/logo.svg`, `site.webmanifest` | Couleurs harmonisées |
| `scripts/validate-project-performance.mjs` | Budget mesurant les CSS réellement chargées |
| `scripts/package-site.mjs` | Préparation d’un dossier public `dist/` par liste explicite |
| `package*.json` | Version 1.1.0, axe-core de test, commande de préparation |
| `playwright*.config.mjs` | Possibilité d’utiliser un Chromium déjà installé |
| `tests/e2e/signature.spec.mjs`, `tests/qa/signature.test.mjs` | Vérifications de la refonte et des garde-fous éditoriaux |
| `tests/generator/project-generation.test.mjs` | Assertions éditoriales mises à jour ; validation du générateur conservée |
| `.github/workflows/main-deploy.yml` | Suppression d’une ligne vide interrompant la commande `rsync` existante |
| `docs/archive/` | Ancien CSS de redesign et anciens contrats de test conservés pour l’historique |

`INVENTAIRE.json` fournit la comparaison de fichiers avec l’archive initiale. Les anciens rapports de tests temporaires ne sont pas repris dans le livrable.

## Utilisation du ZIP

1. Extraire l’archive dans un nouveau dossier.
2. Consulter `README.md` et lancer le serveur local indiqué.
3. Pour une intégration Git, comparer avec la branche courante avant de recopier les fichiers : le ZIP ne connaît pas les modifications réalisées après l’archive source.
4. Exécuter les vérifications si le contenu est adapté.
5. Déployer uniquement les fichiers publics de `dist/` avec le processus habituel.

L’archive ne contient pas `node_modules`, de navigateur téléchargé, de clé de déploiement ou d’environnement Python. `npm ci` reconstitue l’outillage à partir du lockfile. Aucun commit n’a été créé.

## Retour arrière

Cette livraison ne modifie pas le dépôt local d’origine ni le site en ligne. Conserver l’archive source fournie avant intégration. Dans un dépôt Git propre, effectuer l’intégration dans une branche dédiée permet de revenir à la branche précédente ; une fois les changements committés, un revert ciblé permet d’annuler la refonte sans supprimer l’historique.

Ne pas appliquer une restauration globale sur un arbre contenant d’autres travaux non sauvegardés. Aucun script de copie forcée ou de réinitialisation Git n’est inclus.

## Évolution des études de cas

Le champ facultatif `publicationNote` contient une phrase affichée dans le catalogue et au début de l’étude. Il est échappé par le générateur. Il est actuellement utilisé pour les deux versions de travail dont la synchronisation publique n’a pas pu être confirmée.

Une fois la branche publique validée, mettre à jour ou retirer la note ainsi que la limite correspondante dans `caseStudy.limitations`. Pour changer la sélection de l’accueil, modifier `featured` et les valeurs uniques de `featuredOrder`, puis exécuter `npm run generate`. La suite valide que les fichiers générés ne dérivent pas des données.
