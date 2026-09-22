# QA visuelle reproductible

La QA visuelle complète les tests générateur et les E2E fonctionnels. Elle ne remplace pas les assertions de comportement : elle fournit des captures déterministes et comparables d'un build à l'autre.

## Contrat de capture

Le plan canonique est défini dans `tests/visual/visual-cases.mjs`.

Profils fixes :

- `320x720` reflow final P2.4-G ;
- `390x844` mobile ;
- `1366x768` laptop bas et viewport de référence de la phase 2.2 ;
- `1920x800` desktop large et bas ;
- `1920x1080` 16:9 ;
- `2560x1080` ultrawide proche de 21:9 ;
- `3440x1440` ultrawide large ;
- `3840x2160` 4K de clôture P2.4-G.

Les scènes couvrent :

- le hero et le shell initial de l'accueil ;
- la section Projets de l'accueil ;
- les cinq sections profil Compétences, Expérience, Formation & trajectoire, Méthode et Contact de l'accueil ;
- le catalogue ;
- le masthead des six projets publics ;
- le diagramme d'architecture des six projets publics ;
- la galerie des six projets publics en Full HD ;
- le viewer média Alycia ouvert en reflow 320 px, mobile, Full HD et 4K.

Le plan produit 101 captures aux noms stables sous `artifacts/visual/captures/`.

## Déterminisme

Le runner visuel impose Chromium, un seul worker, `deviceScaleFactor: 1`, le thème sombre, `fr-FR`, `Europe/Paris` et `prefers-reduced-motion: reduce`. Les transitions, animations, carets et scrollbars sont neutralisés avant la capture. Les polices et images du bloc ciblé sont attendues sans temporisation arbitraire. Pour les médias, le harnais déclenche explicitement le lazy-loading, vérifie les dimensions naturelles, attend `HTMLImageElement.decode()` puis laisse deux cycles `requestAnimationFrame` à Chromium avant la capture. Cette synchronisation évite qu'une image chargée mais pas encore peinte produise ponctuellement un cadre vide.

## Commandes

```bash
npm run test:qa
npm run capture:visual
npm run test:visual
```

`capture:visual` nettoie puis reconstruit `artifacts/visual/`. Il produit :

- `capture-plan.json` : plan exact utilisé ;
- `captures/*.png` : captures nommées par profil et scène ;
- `SHA256SUMS.txt` : empreinte de chaque capture ;
- `metadata.json` : branche, HEAD, versions Node/Playwright et compteur ;
- `report/` et `test-results/` : rapport Playwright et traces en cas d'échec.

Le dossier `artifacts/` est volontairement ignoré par Git.

## CI

Les PR vers `develop`, `testing` et `main` exécutent la capture après leurs contrôles navigateur et publient `artifacts/visual/` comme artifact GitHub Actions. Les artifacts permettent de comparer exactement les mêmes scènes entre deux builds sans versionner des dizaines de PNG dans le dépôt.

Une future étape peut ajouter des snapshots bloquants pixel-à-pixel sur un sous-ensemble réduit de scènes une fois les références graphiques définitivement approuvées.


## P2.5-A — compétences

La phase P2.5-A ajoute la scène `home-skills` pour verrouiller la nouvelle hiérarchie des compétences contextualisées. Elle est capturée en `reflow-320`, `mobile`, `full-hd` et `4k`. La matrice planifiée passe de 61 à 65 captures.

## P2.5-B — expérience

La phase P2.5-B ajoute la scène `home-experience` pour verrouiller la hiérarchie entre Familink, expérience principale, et l’immersion Caisse d’Épargne. Elle est capturée en `reflow-320`, `mobile`, `full-hd` et `4k`. La matrice planifiée passe de 65 à 69 captures.

## P2.5-C — formation & trajectoire

La phase P2.5-C ajoute la scène `home-formation` pour verrouiller la séparation entre formation acquise, Bachelor visé, recherche d’entreprise et trajectoire IA. Elle est capturée en `reflow-320`, `mobile`, `full-hd` et `4k`. La matrice planifiée passe de 69 à 73 captures.

## P2.5-D — méthode & contact

La phase P2.5-D ajoute les scènes `home-method` et `home-contact`. Chacune est capturée en `reflow-320`, `mobile`, `full-hd` et `4k` afin de verrouiller la lecture des quatre étapes de méthode et la hiérarchie entre e-mail principal et ressources complémentaires. La matrice planifiée passe de 73 à 81 captures.

## P2.5-E — clôture du profil

P2.5-E étend `home-skills`, `home-experience`, `home-formation`, `home-method` et `home-contact` aux huit profils visuels canoniques. Les quatre profils déjà couverts restent inchangés et les profils `laptop-low`, `desktop-low`, `ultrawide` et `ultrawide-large` sont ajoutés à chacune des cinq scènes.

La matrice globale passe de 81 à 101 captures. Cette extension ferme la couverture visuelle de P2.5 sans modifier les scènes projet ni le viewer média.
