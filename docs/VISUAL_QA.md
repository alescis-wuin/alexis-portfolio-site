# QA visuelle reproductible

La QA visuelle complète les tests générateur et les E2E fonctionnels. Elle ne remplace pas les assertions de comportement : elle fournit des captures déterministes et comparables d'un build à l'autre.

## Contrat de capture

Le plan canonique est défini dans `tests/visual/visual-cases.mjs`.

Profils fixes :

- `390x844` mobile ;
- `1366x768` laptop bas et viewport de référence de la phase 2.2 ;
- `1920x800` desktop large et bas ;
- `1920x1080` 16:9 ;
- `2560x1080` ultrawide proche de 21:9 ;
- `3440x1440` ultrawide large.

Les scènes couvrent :

- le hero et le shell initial de l'accueil ;
- la section Projets de l'accueil ;
- le catalogue ;
- le masthead des six projets publics ;
- le diagramme d'architecture des six projets publics ;
- la galerie des six projets publics en Full HD.

Le plan produit 51 captures aux noms stables sous `artifacts/visual/captures/`.

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
