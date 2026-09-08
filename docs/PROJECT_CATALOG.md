# Catalogue projets — source de vérité

## Objectif

`data/projects.json` est la source canonique de tous les projets publics du portfolio.

Il pilote automatiquement :

- les cartes mises en avant sur `index.html` ;
- le catalogue complet `projets/index.html` ;
- les pages `projets/<slug>.html` ;
- les filtres du catalogue ;
- `sitemap.xml` ;
- les cas de test Playwright.

Les fichiers générés restent versionnés afin que la production demeure un hébergement statique sans build.

## Taxonomie

La clé `taxonomy` centralise quatre familles d'identifiants stables :

- `languages` : langages (`java`, `csharp`, `python`, etc.) ;
- `types` : nature de la contribution (`backend`, `desktop`, `fullstack`, etc.) ;
- `stack` : technologies et outils (`spring-boot`, `dotnet`, `aspnet-core`, etc.) ;
- `status` : état du projet (`finalized`, `in-progress`, `prototype`, etc.).

Les libellés affichés peuvent évoluer sans modifier les références utilisées dans les projets et les filtres.

Des entrées C#/.NET sont déjà prévues dans la taxonomie mais ne sont pas affichées tant qu'aucun projet public ne les référence.

## Structure minimale d'un projet

```json
{
  "id": "mon-projet",
  "slug": "mon-projet",
  "name": "Mon projet",
  "featured": false,
  "status": "in-progress",
  "subtitle": "Application métier",
  "summary": "Résumé court pour les cartes.",
  "metaDescription": "Description précise de la page projet.",
  "mission": "Objectif principal.",
  "proof": "Preuve synthétique mise en avant.",
  "problem": "Problème traité par le projet.",
  "repository": "https://github.com/...",
  "image": "assets/img/projects/mon-projet.svg",
  "imageAlt": "Illustration du projet Mon projet",
  "languages": ["csharp"],
  "types": ["backend"],
  "stack": ["dotnet", "aspnet-core"],
  "homeStack": ["dotnet", "aspnet-core"],
  "features": ["Fonctionnalité 1"],
  "proofs": ["Compétence démontrée"],
  "sitemapPriority": 0.8
}
```

`featuredOrder` est obligatoire uniquement lorsque `featured` vaut `true`.

## Ajouter un projet

1. Ajouter son image sous `assets/img/projects/`.
2. Ajouter l'entrée dans `data/projects.json`.
3. Ajouter les identifiants de taxonomie manquants si nécessaire.
4. Exécuter :

```bash
npm run format
npm run generate
npm run check:strict
```

5. Vérifier les changements générés avant commit :

```bash
git diff -- index.html projets sitemap.xml
```

## Vérification CI

`npm run generate:check` régénère les sorties attendues en mémoire et les compare aux fichiers versionnés.

Si une donnée change sans régénération, le contrôle échoue avec la liste des fichiers désynchronisés.

## Règles de conception

- Ne pas modifier manuellement une page projet générée.
- Ne pas ajouter manuellement une URL projet dans `sitemap.xml`.
- Ne pas dupliquer la liste des projets dans les tests.
- Ne pas ajouter une technologie aux filtres seulement pour la rendre visible : elle apparaît lorsqu'un projet la référence.
- Conserver des identifiants de taxonomie stables ; modifier le libellé plutôt que l'identifiant quand seul l'affichage change.
