# Matrice de preuves des projets

Ce document complète `docs/SOURCE_DE_VERITE.md`. Il recense les projets candidats à la mise en avant et distingue ce qui est déjà vérifiable sur une branche publique de référence de ce qui doit encore être promu ou renommé avant publication dans le portfolio.

## Règle de publication

Une capacité technique ne doit être mise en avant dans le portfolio que si elle est vérifiable dans un dépôt, des tests, une CI, une capture ou une documentation publique cohérente avec l'état présenté.

## Sélection cible

| Projet | Rôle dans le portfolio | État de la preuve | Action avant mise en avant |
| --- | --- | --- | --- |
| Alycia | C#/.NET, architecture, IA locale, intégration système | Fonctionnalités vérifiables sur `feature/conversation-response`, mais `develop` reste ancien et le dépôt s'appelle encore `Alicia` | Promouvoir la branche fonctionnelle vers `develop`, puis traiter le renommage `Alicia` → `Alycia` séparément |
| Streamfolio | Java/Spring, backend, traitements média, données et infrastructure | Vérifiable sur le dépôt public de référence | Conserver des affirmations factuelles et lier les preuves GitHub utiles |
| Agenda | C#/.NET, Blazor, MAUI, architecture multi-hôte | Vérifiable sur le dépôt public de référence | Conserver des affirmations factuelles et lier les preuves GitHub utiles |
| Aelia | Java/JavaFX, APIs externes, résilience, cartographie et UI | Implémentation récente récupérée sur une branche de travail propre, mais pas encore intégrée à `develop` | Faire valider la PR de synchronisation vers `develop` avant d'utiliser ces capacités comme état public de référence |

## Alycia

### Capacités vérifiées sur la branche fonctionnelle

- application desktop C#/.NET avec Avalonia ;
- architecture séparant Domain, Application, Infrastructure, Presentation et Desktop ;
- cœur de conversations indépendant du fournisseur ;
- persistance locale JSON des conversations ;
- génération et streaming des réponses ;
- séparation du contenu visible et du reasoning pendant le streaming ;
- configuration fournisseur/modèle et paramètres de génération ;
- intégration locale réelle de llama.cpp ;
- prise en charge de modèles GGUF référencés via Hugging Face ;
- gestion explicite du cycle de vie du fournisseur local ;
- observabilité locale bornée ne journalisant pas le prompt ou la réponse ;
- tests répartis entre Domain, Application, Infrastructure, Presentation et Architecture.

### Capacités à ne pas présenter comme implémentées

- workflows métier ;
- automatisations ;
- tool calling ;
- RAG/retrieval ;
- pièces jointes ;
- multimodalité.

### Synchronisation

Une PR de promotion de `feature/conversation-response` vers `develop` a été ouverte. Le renommage du projet et du dépôt `Alicia` → `Alycia` reste volontairement séparé afin de ne pas mélanger une promotion fonctionnelle et un renommage massif.

## Streamfolio

### Capacités vérifiées

- Spring Boot et Java ;
- PostgreSQL/Flyway pour les données métier ;
- Redis pour les sessions runtime ;
- MinIO pour le stockage objet ;
- streaming MP4, HTTP Range, WebVTT et HLS ;
- administration média et upload ;
- pipeline média asynchrone avec jobs persistés ;
- reprise après redémarrage, retry et annulation FFmpeg ;
- tests Maven, sécurité, streaming/admin, smoke tests et E2E Playwright ;
- CI GitHub Actions et environnement Docker Compose.

### Angle éditorial retenu

Montrer l'intégration d'un site web avec un traitement média externe bas niveau : upload, état persistant, ordonnanceur, FFmpeg, stockage objet et restitution vidéo.

## Agenda

### Capacités vérifiées

- .NET 10 ;
- ASP.NET Core et Blazor Interactive Server ;
- .NET MAUI Blazor Hybrid ;
- composants Razor partagés entre les hôtes ;
- séparation Domain, Contracts, Application, Infrastructure, UI, Web, API et MAUI ;
- EF Core/SQLite ;
- API REST/OpenAPI ;
- tests par couches, formatage, audit NuGet et CI.

### Angle éditorial retenu

Montrer la conception d'une application multi-hôte partageant interface et logique applicative entre Web et mobile tout en conservant des responsabilités séparées.

## Aelia

### Capacités vérifiées dans l'implémentation récente

- Java 26, JavaFX et AtlantaFX ;
- modes `auto`, `api` et `simulated` ;
- Open-Meteo comme source distante principale ;
- fallbacks configurables vers WeatherAPI.com, Visual Crossing, OpenWeather, Weatherbit et Pirate Weather ;
- passage à la source suivante lorsqu'un provider distant échoue ;
- fallback vers la simulation en mode `auto` lorsque toutes les sources distantes échouent ;
- carte JavaFX native ;
- déplacement, zoom et sélection d'une position ;
- géocodage inverse Nominatim ;
- chargement prioritaire des tuiles visibles ;
- cache mémoire de session et cache disque ;
- temporisation des requêtes aux fournisseurs de tuiles.

### Formulation à éviter

Ne pas écrire que la carte « précharge des zones » ou conserve une copie hors ligne du monde. L'implémentation charge les tuiles nécessaires au viewport, conserve les tuiles valides en cache et réutilise les tuiles déjà disponibles.

### Synchronisation

Une PR dédiée a été ouverte vers `develop` à partir d'un commit propre basé sur l'arbre de la version locale auditée. L'historique sans rapport de type `wealth-tracker` présent sur une branche distante n'est pas inclus dans cette promotion.

## Projets de réserve

### Calcufolio

À conserver comme candidat secondaire pour .NET/Avalonia, logique d'expressions, tests et réflexion de lisibilité/accessibilité.

### Solvia

À conserver comme candidat secondaire pour Java/Spring, modélisation métier, PostgreSQL et application local-first.

### Kanban

Projet .NET techniquement vérifiable, mais moins différenciant vis-à-vis d'Agenda dans la sélection principale actuelle.

### Ludani

Projet techniquement intéressant comme expérimentation Java/LWJGL/OpenGL, mais non prioritaire pour une candidature full-stack Java/.NET tant que sa reconstruction n'est pas suffisamment stabilisée et présentable.

## Critère de fermeture de la sous-phase 1.2

La sous-phase peut être considérée comme terminée lorsque :

1. la version Aelia auditée est intégrée sur la branche GitHub de référence ;
2. la version fonctionnelle actuelle d'Alycia est intégrée sur la branche GitHub de référence ;
3. le renommage public `Alicia` → `Alycia` est planifié ou appliqué sans ambiguïté ;
4. les quatre projets retenus ont chacun une description strictement factuelle ;
5. `data/projects.json` et les pages générées sont ensuite alignés sur ces états vérifiables dans une étape dédiée.
