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

Le compteur d'études de cas affiché dans le hero est également calculé depuis les projets `featured`.

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

Le slug `index` est réservé au catalogue `projets/index.html` et ne peut pas être utilisé par un projet.

Tous les fichiers `projets/*.html` autres que `projets/index.html` sont des sorties gérées. Une page qui ne correspond plus à un slug du catalogue est signalée par `npm run generate:check` et supprimée par `npm run generate`.

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

- Ne pas conserver manuellement une page HTML orpheline dans `projets/`.
- Ne jamais utiliser `index` comme slug de projet.
- Ne pas modifier manuellement une page projet générée.
- Ne pas ajouter manuellement une URL projet dans `sitemap.xml`.
- Ne pas dupliquer la liste des projets dans les tests.
- Ne pas ajouter une technologie aux filtres seulement pour la rendre visible : elle apparaît lorsqu'un projet la référence.
- Conserver des identifiants de taxonomie stables ; modifier le libellé plutôt que l'identifiant quand seul l'affichage change.

## Contrôles étendus sur les PR vers develop

Les tests navigateur sont exécutés automatiquement lorsqu'une PR touche notamment :

- `data/`, `templates/` ou `projets/` ;
- `assets/css/` ou `assets/js/` ;
- le générateur, Playwright, l'accueil, le sitemap ou les dépendances npm.

Les branches `ai/*` et les lancements manuels exécutent toujours ces contrôles étendus.
