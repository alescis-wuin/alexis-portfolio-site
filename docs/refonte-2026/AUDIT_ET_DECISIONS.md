# Refonte du portfolio d’Alexis Guinot

Version livrée : 1.1.0 — 21 septembre 2026. Point de départ : l’archive `website(1).zip` fournie pour cette demande.

## 1. Diagnostic

Le problème principal n’était pas un manque d’informations. L’accueil en présentait beaucoup, mais avec une importance visuelle assez uniforme : rôle, disponibilité, méthode, formations et technologies revenaient plusieurs fois. Des formulations telles que « Une sélection volontairement resserrée » ou « Un point d’entrée direct, des ressources en complément » décrivaient l’organisation du portfolio plutôt qu’Alexis.

Les atouts existaient déjà : expérience de deux années chez Familink, articulation logiciel/matériel, Java/Spring et C#/.NET, projets avec captures, architectures, décisions et limites. La refonte part de ces éléments. Elle n’ajoute ni client, ni témoignage, ni mesure de performance professionnelle, ni compétence auto-évaluée.

### Audit par dimension

| Observation dans les sources | Conséquence probable | Réponse réalisée |
| --- | --- | --- |
| Beaucoup de texte explicatif sur le site lui-même | Lecture plus longue avant de comprendre le candidat | Phrases à la première personne, plus courtes et concrètes |
| Navigation latérale, navigation mobile et liens rapides redondants | Multiplication des repères | Navigation supérieure : projets, parcours, à propos, contact, CV |
| Sections souvent dimensionnées à la hauteur de l’écran et scroll snap sur certains écrans | Rythme de lecture dicté par la mise en page | Hauteurs naturelles, aucun scroll snap |
| Schéma UI/API/DB/QA décoratif et animé près du portrait | Compétences générales mises au même niveau que le candidat | Portrait plus présent ; l’architecture est expliquée dans les projets |
| Cartes avec résumé, mission, points clés, technologies et actions | Répétitions et densité sur l’accueil | Résumé + technologies + deux liens ; détails conservés dans les études |
| Quatre projets principaux, dont deux avec synchronisation publique incertaine | Décalage possible entre promesse et code accessible | Trois projets principaux cohérents avec les preuves documentées |
| Familink raconté à la troisième personne | Distance avec le parcours et les contributions | Expérience racontée directement, avec trois contributions identifiables |
| Très longue trajectoire de formation, incluant le futur lointain | L’objectif immédiat perd en visibilité | Diplôme obtenu et formation visée côte à côte ; futur IA dans « À propos » |
| CSS accumulant plusieurs phases visuelles | Collisions aux points de rupture | Nouvelle feuille commune ; ancienne couche de redesign archivée |
| Données et gabarits générés déjà en place | Bonne base de maintenance | Architecture conservée, aucune migration de framework |
| CV public avec téléphone et éléments devenus discordants | Contact public et dossier candidat incohérents | Nouveau CV public factuel d’une page, sans téléphone |
| Saut de titre H1 → H3 dans le catalogue et nom technique trop long à 320 px | Navigation sémantique et lecture mobile dégradées | Titres H2 dans le catalogue et retour à la ligne des identifiants techniques |

Les « conséquences probables » ci-dessus sont des hypothèses ergonomiques, pas des résultats de tests utilisateurs. Aucun recruteur n’a été interrogé dans cette intervention.

## 2. Ce que les recherches changent concrètement

### Recrutement : une lecture rapide, puis une vérification

L’Apec recommande un intitulé de métier identifiable, des compétences explicites et une disponibilité tenue à jour. J’en retiens l’affichage immédiat du métier, des deux écosystèmes et de la recherche d’alternance. Les statistiques promotionnelles relatives à la CVthèque Apec ne sont pas transposées à ce portfolio : elles ne permettraient pas de prévoir son taux de recrutement. [Apec, profil candidat](https://www.apec.fr/candidat/optimiser-votre-candidature/profil-apec/fiches-conseils/un-profil-apec-performant-pour-etre-repere-par-les-recruteurs.html).

L’Apec invite également les jeunes diplômés à faire ressortir les acquis de leurs expériences, y compris personnelles. Cela justifie d’expliquer ce qu’un projet permet d’examiner et ce qu’Alexis y a fait, sans déguiser un projet personnel en expérience client. [Apec, valoriser son parcours](https://www.apec.fr/candidat/etre-accompagne-dans-votre-recherche-demploi/1er-emploi/fiches-services/jeunes-diplomes-gagnez-en-confiance%2C-m-me-sans-experience.html).

France Travail distingue parcours, compétences, réalisations et métiers recherchés dans le profil candidat. Cette séparation inspire ici des accès clairs à l’expérience, aux projets et à la recherche actuelle. Elle n’impose pas de créer trois sites selon le métier du lecteur. [France Travail, profil de compétences](https://www.francetravail.fr/region/provence-alpes-cote-d-azur/candidat-1/services-et-conseils/mon-profil-de-competences-un-ato.html).

| Lecteur | Question prioritaire | Réponse disponible |
| --- | --- | --- |
| RH / recrutement | Quel métier, quelle formation, quand, où, comment contacter ? | Premier écran, bandeau de disponibilité, formation, CV public et contact |
| Manager | A-t-il déjà travaillé en entreprise ? Sur quoi ? Comment aborde-t-il les problèmes ? | Familink, contributions concrètes, méthode et limites des projets |
| Développeur | Qu’a-t-il construit ? Quels compromis ? Puis-je vérifier ? | Études détaillées, architectures, tests documentés, captures et dépôts |

La recherche NN/g sur les portfolios de designers insiste sur le rôle du candidat, le problème, les contraintes, les décisions et le processus. C’est une source sur le recrutement UX, **pas une étude spécifique aux développeurs Java/.NET**. La transposition retenue est une hypothèse de conception : les mêmes rubriques aident à discuter de projets logiciels, mais ne prouvent pas à elles seules une meilleure conversion. [NN/g, construire un portfolio](https://www.nngroup.com/articles/ux-design-portfolios/).

### Lisibilité et ergonomie : donner des points d’entrée

Les travaux NN/g sur la lecture montrent l’importance du balayage visuel et de titres porteurs d’information. L’accueil présente donc une hiérarchie nette, des paragraphes courts et des liens explicites. Les détails restent disponibles dans les études de cas, avec un sommaire interne. [NN/g, lecture sur le Web](https://www.nngroup.com/articles/how-users-read-on-the-web/), [NN/g, balayage par les titres](https://www.nngroup.com/articles/layer-cake-pattern-scanning/).

Conséquences : pas de carrousel, pas de texte essentiel au survol, pas de navigation imposée par la molette, pas de filtre sur les seuls trois projets de l’accueil. Le catalogue conserve ses filtres utiles lorsque l’on explore l’ensemble des six projets. Les formations secondaires sont dans un élément natif `details`, utilisable au clavier et sans JavaScript.

### Accessibilité : des critères vérifiables

- Contraste : viser au moins 4,5:1 pour le texte courant et 3:1 pour le grand texte, selon les définitions WCAG. La palette associe texte clair et fond sombre ; les états interactifs restent lisibles. [W3C, contraste minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
- Reflow : vérifier la lecture sans défilement horizontal à 320 pixels CSS, en particulier pour les mots techniques et les liens. [W3C, reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).
- Interaction : les nouveaux contrôles principaux visent 44 pixels de hauteur. Le minimum WCAG 2.2 AA est 24 × 24 pixels ou une exception admissible ; 44 pixels est ici un choix de confort, pas une reformulation du minimum normatif. [W3C, taille des cibles](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum).
- Focus : indicateur visible, menu fermé avec Échap, focus rendu au bouton, transfert vers la section après activation d’un lien mobile et restitution du focus après fermeture de la visionneuse. [W3C, nouveautés WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/).
- Structure : un H1 par page, niveaux de titres cohérents, régions nommées et lien d’évitement. [W3C, structure de page](https://www.w3.org/WAI/tutorials/page-structure/).
- Mouvement : suppression du parallaxe et des animations permanentes ; respect de `prefers-reduced-motion`. [web.dev, réduction du mouvement](https://web.dev/articles/prefers-reduced-motion).

Le RGAA apporte une méthode de contrôle plus large que les seuls tests automatiques. La version indiquée par le site officiel au moment de la recherche est 4.1.2. Cette livraison ne constitue pas un audit RGAA complet ni une certification. [Référentiel officiel](https://accessibilite.numerique.gouv.fr/).

### Performance, sobriété et pérennité

Le site reste statique. Les ressources sont locales, sans nouvelle police distante, bibliothèque d’animation, mesure d’audience ou requête tierce nécessaire à l’affichage. `axe-core` est une dépendance de **test**, jamais chargée par le site public. Les médias existants restent en WebP, avec dimensions et chargement différé hors premier écran.

Les objectifs Web Vitals pertinents sont LCP ≤ 2,5 s, INP ≤ 200 ms et CLS ≤ 0,1 au 75e percentile des visites. Un test local et un budget d’octets ne permettent pas d’affirmer qu’ils sont atteints en production. Ces mesures seront à contrôler après publication, avec les conditions réelles du serveur et du réseau. [Google, Web Vitals](https://web.dev/articles/vitals).

## 3. Direction personnelle retenue

**Fil conducteur : comprendre ce qui relie les éléments d’une application.** Il est étayé par le pipeline vidéo de Streamfolio, les interfaces partagées d’Agenda, le moteur d’expressions de Calcufolio et le travail logiciel/matériel chez Familink.

La palette charbon / ivoire / vert doux rend le site moins interchangeable avec les portfolios bleu-violet habituels. Le vert est un choix esthétique compatible avec l’intérêt déclaré pour la botanique ; ce n’est pas une compétence professionnelle suggérée par une couleur. Le portrait existant est conservé, sans retouche générative. Sa mise en page rappelle une photo posée dans un carnet, avec une légère inclinaison fixe. Les repères numérotés et la typographie monospace restent discrets.

Les titres donnent le rythme ; le métier demeure affiché explicitement. Les compétences ne reçoivent ni pourcentage ni niveau auto-attribué. L’expression personnelle est contenue dans des formulations et des intérêts étayés par le contexte fourni, sans récit biographique inventé.

### Arbitrages

| Choix | Gain recherché | Compromis |
| --- | --- | --- |
| Trois projets principaux | Moins de répétitions, sélection facile à comprendre | Aelia et Alycia moins visibles tant que leur état public est ambigu |
| Colonne de lecture limitée à 1160 px | Textes et captures lisibles sur grands écrans | Plus d’espace libre sur écran ultralarge |
| Navigation supérieure compacte | Repère familier et accès direct au contact | Compétences et formation accessibles dans le parcours plutôt que six liens de menu |
| Portrait réel | Identification et présence personnelle | La qualité de la photo source limite le rendu ; une nouvelle prise peut être envisagée plus tard |
| Thème sombre unique | Cohérence avec la demande | Aucun sélecteur de thème clair ; impression traitée séparément |
| E-mail + copie | Contact simple et fiable sur un site statique | Pas de formulaire intégré ; le lien e-mail dépend du logiciel du visiteur |
| Architecture existante conservée | Livraison directe et maintenance prévisible | Une partie des styles historiques reste nécessaire aux études de cas |

## 4. Politique de preuve et intégrité éditoriale

`data/projects.json`, les captures et les documents fournis sont les sources du contenu technique. Les dépôts distants ne sont pas inclus dans l’archive. Les tentatives de lecture publique de GitHub pour Aelia/Alycia n’ont pas abouti dans l’environnement utilisé : aucune nouvelle vérification de leur code distant n’est revendiquée.

Les documents fournis demandent de ne pas mettre ces deux projets en avant avant synchronisation. Ils restent disponibles dans le catalogue avec un avertissement de version de travail, également présent dans leurs études. Streamfolio, Agenda et Calcufolio forment la sélection principale. Les données de Kanban sont conservées. Le projet Solvia reste non publié conformément au catalogue initial.

Les capacités, résultats et tests mentionnés dans les études sont ceux décrits par les sources fournies ; ils n’ont pas été exécutés dans les dépôts des applications. Les tests exécutés pendant cette intervention portent sur **le portfolio lui-même**.

Le CV a été reconstruit à partir des faits du portfolio. Il évite les formulations obsolètes de l’ancien CV sur les projets, ne contient pas de téléphone ni d’adresse physique et distingue diplôme obtenu, formation visée et entreprise recherchée. Le PDF est textuel mais n’est pas balisé PDF/UA ; le parcours reste accessible en HTML sur le site.

## 5. Étapes réalisées

1. Inventaire des fichiers, des sources éditoriales, de la génération et des contrôles existants.
2. Recherche ciblée auprès de l’Apec, de France Travail, de NN/g, du W3C, de la DINUM et de web.dev.
3. Définition des trois parcours de lecture et du fil conducteur personnel.
4. Réécriture de l’accueil, nouvelle composition responsive, navigation et contact.
5. Ajustement du générateur, sélection principale, signalement des versions de travail, sommaires des études.
6. Reconstruction et vérification visuelle du CV public.
7. Mise à jour des tests : conservation du générateur, des médias, de la visionneuse et des filtres ; remplacement des anciens contrats visuels devenus incompatibles avec la refonte.
8. Contrôles statiques, navigateur, accessibilité automatisée et captures ; correction des défauts observés.
9. Documentation, dossier prêt à héberger et archive complète des sources.

Les tests historiques de contenu exact, parallaxe, rail latéral, quatre projets obligatoires et grille ultralarge sont conservés dans `docs/archive/legacy-tests-p23-p25/`. Ils ne sont plus des exigences actives. Leur remplacement vérifie le comportement utilisateur, la structure réelle et les contenus de preuve. Aucun échec d’accessibilité n’a été neutralisé pour rendre les tests verts.

## 6. Ce qui reste à valider dans le monde réel

Le livrable est utilisable localement. Il n’a pas été publié sur le VPS et aucune configuration distante n’a été modifiée.

- Confirmer que la recherche d’alternance d’octobre 2026 est toujours d’actualité avant publication. Le rythme école/entreprise n’était pas fourni : il n’est pas inventé.
- Confirmer les branches et commits publics de référence d’Aelia et d’Alycia, puis retirer l’avertissement uniquement quand il devient inexact. Le retour dans la sélection se fait via `featured` et `featuredOrder`.
- Faire lire le premier écran à une personne RH, une personne qui manage des développeurs et un développeur. Demander ce qu’ils comprennent du rôle, de la recherche et des projets, sans leur expliquer le site à l’avance.
- Compléter la vérification sur Firefox, Safari et avec un lecteur d’écran réel. Les tests exécutés ici utilisent Chromium ; ils ne garantissent pas l’ensemble des combinaisons navigateur/aide technique.
- Vérifier le domaine, HTTPS, la mise en cache, la compression et les liens externes après mise en ligne. Aucune disponibilité distante de ces liens n’est garantie par une validation locale.
- Enrichir ultérieurement une étude avec une difficulté précise et un exemple de code commenté si les sources correspondantes sont fournies. N’ajouter un résultat chiffré que s’il est traçable.

Le succès recherché est une candidature mieux comprise et plus facilement vérifiable. Aucune hausse de contacts ou d’embauches n’est mesurée ni promise.
