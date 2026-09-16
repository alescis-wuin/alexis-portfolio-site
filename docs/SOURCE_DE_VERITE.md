# Source de vérité éditoriale

Ce document fixe les faits à utiliser pour le portfolio pendant la phase 1. Il prime sur les anciennes notes d'analyse et de design archivées sous `docs/archive/phase-2/`.

## Positionnement professionnel

- Nom public : **Alexis Guinot**.
- Positionnement : **concepteur-développeur full-stack**.
- Pôles techniques principaux : **Java / Spring** et **C# / .NET**.
- L'architecture logicielle est un domaine d'intérêt et de compétence à mettre en avant, sans utiliser « architecte logiciel » comme intitulé de poste.
- Objectif immédiat : décrocher une alternance d'un an dans la Métropole de Rouen pour réaliser la troisième année du Bachelor Concepteur Développeur d'Applications au CESI à partir d'octobre 2026.
- Modalités possibles : présentiel, hybride et télétravail selon l'entreprise.

## Formation

- **2023-2025 — CESI — Bac+2 Développeur Informatique**, réalisé en alternance et obtenu.
- **2026-2027 — CESI — Bachelor Concepteur Développeur d'Applications**, troisième année visée en alternance.
- Tant qu'aucun contrat n'est signé, ne pas écrire que cette troisième année est déjà « en alternance ». Employer une formulation indiquant qu'une entreprise d'accueil est recherchée.
- Le cursus prépare au titre de niveau 6 « Concepteur développeur d'applications » et couvre notamment conception, architecture logicielle, développement, tests, sécurité, données et DevOps.

## Expérience Familink

- Période : **2023-2025**.
- Fonction : développeur informatique et électronicien en alternance.
- Domaines réellement pratiqués : Android/Java, Python, Django, ReportLab, Linux, Raspberry Pi et matériel/électronique.
- Produits : cadres photo/vidéo connectés et projet de boîtier TV connecté orienté **B2B**.
- Exemples utilisables : intégration des avatars dans les cadres, améliorations/corrections de l'application et travail sur le boîtier TV.
- Ne pas publier de métrique ou d'impact chiffré qui n'est pas vérifiable.

## État des projets à la date de l'audit

### Streamfolio

- Dépôt public de référence : `alescis-wuin/streamfolio`.
- État suffisamment vérifiable pour être utilisé comme preuve Java/Spring/backend.
- Les affirmations publiques doivent rester cohérentes avec le dépôt de référence.

### Agenda

- Dépôt public de référence : `alescis-wuin/agenda`.
- État suffisamment vérifiable pour être utilisé comme preuve C#/.NET, Blazor, MAUI et architecture multi-hôte.

### Calcufolio

- Dépôt public de référence : `alescis-wuin/calcufolio`.
- Projet pertinent pour la logique d'expressions, l'interface Avalonia et l'accessibilité.

### Aelia

- La version locale et la branche `ai` sont plus récentes que la branche de référence actuellement présentée par le portfolio.
- La version récente utilise Java 26, JavaFX et AtlantaFX.
- Elle possède un provider distant avec Open-Meteo en priorité et des fallbacks configurables vers WeatherAPI.com, Visual Crossing, OpenWeather, Weatherbit et Pirate Weather.
- Elle possède une carte JavaFX native avec déplacement, zoom, sélection de localisation, géocodage inverse et caches mémoire/disque pour les tuiles.
- Ne pas publier ces capacités comme état de référence du projet tant que la version correspondante n'a pas été synchronisée sur la branche GitHub retenue pour les recruteurs.

### Alycia

- Nom définitif : **Alycia**. « Alicia » est une faute de frappe historique à corriger progressivement dans le dépôt et les namespaces.
- La version locale est plus avancée que le dépôt GitHub actuellement visible.
- Capacités présentes dans la version locale : application desktop C#/.NET/Avalonia, conversations persistantes, streaming de réponses, séparation contenu/reasoning, configuration de génération, gestion d'un runtime llama.cpp local et modèles GGUF/Hugging Face.
- Ne pas présenter comme déjà implémentés les workflows, automatisations, tool calling, RAG/retrieval, pièces jointes ou fonctionnalités multimodales tant qu'elles ne sont pas présentes et vérifiées.
- Ne pas mettre Alycia en avant publiquement avant synchronisation de la version locale et correction du nom du dépôt/projet.

### Ludani

- Le projet a été recommencé de zéro ; l'ancienne description du CV (« moteur et éditeur 2D/3D », « finalisé », Vulkan) est obsolète.
- La nouvelle version est un moteur 3D expérimental Java/LWJGL/OpenGL autour du rendu temps réel, du terrain et de systèmes de gameplay/construction.
- Ne pas le classer comme projet finalisé.
- Il n'est pas prioritaire pour la sélection principale actuelle du portfolio.

## Sélection cible pour la phase suivante

Sous réserve de synchroniser les dépôts Aelia et Alycia avec les versions décrites ci-dessus, la sélection cible est :

1. Alycia ;
2. Streamfolio ;
3. Agenda ;
4. Aelia.

Cette sélection sera appliquée dans la sous-phase 1.2, pas dans la présente étape documentaire.

## Confidentialité et contacts publics

- Le site public peut afficher : nom, e-mail, LinkedIn, GitHub, site web, zone géographique et modalités de travail.
- Ne pas publier le numéro de téléphone ni l'adresse physique sur le site.
- Le CV public téléchargeable depuis le portfolio doit être remplacé par une version sans numéro de téléphone avant publication de la refonte.

## Règles éditoriales

- Toute affirmation technique importante doit être vérifiable dans le code, les tests, la CI, une capture ou une documentation du projet.
- Une fonctionnalité prévue ou en cours ne doit jamais être formulée comme déjà disponible.
- Éviter les auto-évaluations telles que « complet », « robuste », « professionnel », « abouti » ou « industrialisé » lorsqu'elles ne sont pas remplacées par un fait précis.
- Préférer les faits : architecture, comportement, tests, workflow CI, limites et état réel.
- Une technologie ne doit apparaître sur une carte projet que si elle est réellement utilisée par ce projet.
- Les anciennes notes archivées sont historiques et ne doivent plus servir de base éditoriale courante.
- `data/projects.json` reste la source structurée des projets ; ce document fixe les faits de profil et les garde-fous éditoriaux jusqu'à la migration Astro prévue plus tard.
