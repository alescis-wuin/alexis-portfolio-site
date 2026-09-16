<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="{{META_DESCRIPTION}}">
  <meta name="author" content="Alexis Guinot">
  <meta name="color-scheme" content="dark light">
  <meta property="og:title" content="{{NAME}} — Étude de cas | Alexis Guinot">
  <meta property="og:description" content="{{META_DESCRIPTION}}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{{CANONICAL_URL}}">
  <meta property="og:image" content="https://www.alexis-guinot.fr/assets/img/photo-profil-800.webp">
  <meta name="theme-color" content="#0B1020">
  <title>{{NAME}} — Étude de cas | Alexis Guinot</title>
  <link rel="canonical" href="{{CANONICAL_URL}}">
  <link rel="icon" href="../assets/img/logo.svg" type="image/svg+xml">
  <link rel="manifest" href="../site.webmanifest">
  <link rel="stylesheet" href="../assets/css/styles.css">
  <script>
    (() => {
      document.documentElement.dataset.js = 'true';
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        document.documentElement.dataset.theme = savedTheme;
      }
    })();
  </script>
</head>

<body data-project-slug="{{PROJECT_SLUG}}">
  <a class="skip-link" href="#contenu">Aller au contenu principal</a>
  <header class="site-header" data-site-header>
    <div class="content-shell header-inner">
      <a class="project-back-link" href="./index.html" aria-label="Retour aux autres projets">
        <span aria-hidden="true">←</span>
        <span>Retour aux autres projets</span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="navigation-principale" data-nav-toggle hidden>
        <span class="nav-toggle-bars" aria-hidden="true"></span>
        <span class="sr-only">Ouvrir le menu</span>
      </button>
      <nav class="site-nav" aria-label="Navigation principale" data-site-nav>
        <ul id="navigation-principale" class="nav-list">
          <li><a href="../index.html#accueil">Accueil</a></li>
          <li><a href="./index.html">Projets</a></li>
          <li><a href="../index.html#competences">Compétences</a></li>
          <li><a href="../index.html#parcours">Parcours</a></li>
          <li><a href="../index.html#contact">Contact</a></li>
        </ul>
      </nav>
      <div class="header-actions">
        <button class="theme-toggle" type="button" data-theme-toggle aria-label="Changer le thème" aria-pressed="false">
          <span aria-hidden="true">◐</span>
        </button>
        <a class="button button-small button-ghost" href="../assets/cv/CV_Alexis-GUINOT.pdf" download>Télécharger le CV</a>
      </div>
    </div>
  </header>

  <main id="contenu" data-case-study>
    <article class="project-detail section-lg">
      <div class="frame project-detail-grid">
        <div class="project-detail-copy" data-reveal>
          <div class="project-detail-signal">
            <p class="eyebrow">{{SUBTITLE}}</p>
            <span class="project-detail-status">{{STATUS_LABEL}}</span>
          </div>
          <h1>{{NAME}}</h1>
          <p class="hero-lead">{{SUMMARY}}</p>
          <dl class="project-overview" data-project-overview aria-label="Résumé du projet">
            <div>
              <dt>Objectif</dt>
              <dd>{{MISSION}}</dd>
            </div>
            <div>
              <dt>Démonstration</dt>
              <dd>{{PROOF}}</dd>
            </div>
          </dl>
          <div class="project-taxonomy" aria-label="Domaines du projet">
            <span class="project-metadata-label">Domaines</span>
            <div class="tag-list">{{TYPE_TAGS}}</div>
          </div>
          <div class="hero-actions">
            {{REPOSITORY_ACTION}}
            <a class="button button-ghost" href="../assets/cv/CV_Alexis-GUINOT.pdf" download>Télécharger le CV</a>
          </div>
        </div>
        <figure class="project-figure case-study-media" data-project-hero data-reveal>
          <img src="{{HERO_IMAGE}}" width="{{HERO_WIDTH}}" height="{{HERO_HEIGHT}}" decoding="async" fetchpriority="high" alt="{{HERO_ALT}}">
          <figcaption>{{HERO_CAPTION}}</figcaption>
        </figure>
      </div>
    </article>

    <section class="section" aria-labelledby="problem-title">
      <div class="content-shell content-grid">
        <div class="content-block" data-reveal>
          <p class="eyebrow">Problème</p>
          <h2 id="problem-title">Ce que le projet cherche à résoudre</h2>
          <p>{{PROBLEM}}</p>
        </div>
        <aside class="content-aside" data-reveal aria-labelledby="role-title">
          <p class="eyebrow">Rôle</p>
          <h2 id="role-title">Mon rôle</h2>
          <p>{{ROLE}}</p>
          <h2>Stack</h2>
          <div class="tag-list">{{STACK_TAGS}}</div>
        </aside>
      </div>
    </section>

    <section class="section section-alt" aria-labelledby="architecture-title">
      <div class="content-shell two-columns">
        <div data-reveal>
          <p class="eyebrow">Architecture</p>
          <h2 id="architecture-title">Comment le système est structuré</h2>
          <ul class="check-list">{{ARCHITECTURE}}</ul>
        </div>
        <div data-reveal>
          <p class="eyebrow">Décisions</p>
          <h2>Décisions techniques</h2>
          <ul class="check-list">{{DECISIONS}}</ul>
        </div>
      </div>
    </section>

    <section class="section project-visual-section" aria-labelledby="architecture-visual-title">
      <div class="frame">
        <div class="section-heading reading" data-reveal>
          <p class="eyebrow">Schéma</p>
          <h2 id="architecture-visual-title">Vue d’ensemble de l’architecture</h2>
          <p>Le schéma complète l’étude de cas avec les composants et frontières réellement présents dans le projet.</p>
        </div>
        <figure class="case-study-media case-study-architecture" data-project-architecture data-reveal>
          <img src="{{ARCHITECTURE_IMAGE}}" width="{{ARCHITECTURE_WIDTH}}" height="{{ARCHITECTURE_HEIGHT}}" loading="lazy" decoding="async" alt="{{ARCHITECTURE_ALT}}">
          <figcaption>{{ARCHITECTURE_CAPTION}}</figcaption>
        </figure>
      </div>
    </section>

    <section class="section" aria-labelledby="features-title">
      <div class="content-shell two-columns">
        <div data-reveal>
          <p class="eyebrow">Implémentation</p>
          <h2 id="features-title">Points techniques principaux</h2>
          <ul class="check-list">{{FEATURES}}</ul>
        </div>
        <div data-reveal>
          <p class="eyebrow">Difficultés</p>
          <h2>Difficultés résolues</h2>
          <ul class="check-list">{{CHALLENGES}}</ul>
        </div>
      </div>
    </section>

    <section class="section section-alt" aria-labelledby="quality-title">
      <div class="content-shell two-columns">
        <div data-reveal>
          <p class="eyebrow">Qualité</p>
          <h2 id="quality-title">Tests et garde-fous</h2>
          <ul class="check-list">{{QUALITY}}</ul>
        </div>
        <div data-reveal>
          <p class="eyebrow">Livraison</p>
          <h2>Livraison et CI/CD</h2>
          <ul class="check-list">{{DELIVERY}}</ul>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="outcomes-title">
      <div class="content-shell two-columns">
        <div data-reveal>
          <p class="eyebrow">Résultats</p>
          <h2 id="outcomes-title">Résultats observables</h2>
          <ul class="check-list">{{OUTCOMES}}</ul>
        </div>
        <div data-reveal>
          <p class="eyebrow">Compromis</p>
          <h2>Compromis techniques</h2>
          <ul class="check-list">{{TRADEOFFS}}</ul>
        </div>
      </div>
    </section>

    <section class="section section-alt" aria-labelledby="limits-title">
      <div class="content-shell two-columns">
        <div data-reveal>
          <p class="eyebrow">Limites</p>
          <h2 id="limits-title">Limites assumées</h2>
          <ul class="check-list">{{LIMITATIONS}}</ul>
        </div>
        <div data-reveal>
          <p class="eyebrow">Suite</p>
          <h2>Prochaines étapes</h2>
          <ul class="check-list">{{NEXT_STEPS}}</ul>
        </div>
      </div>
    </section>

    <section class="section project-visual-section" aria-labelledby="gallery-title" data-project-gallery>
      <div class="frame">
        <div class="section-heading reading" data-reveal>
          <p class="eyebrow">Captures</p>
          <h2 id="gallery-title">Le produit en situation</h2>
          <p>Des états complémentaires sélectionnés pour montrer l’interface et les parcours réellement implémentés.</p>
        </div>
        <div class="case-study-gallery">
          {{GALLERY}}
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="proof-title">
      <div class="content-shell content-grid">
        <div class="content-block" data-reveal>
          <p class="eyebrow">Preuve de compétence</p>
          <h2 id="proof-title">Ce que ce projet démontre</h2>
          <ul class="check-list">{{PROOFS}}</ul>
        </div>
        <aside class="content-aside" data-reveal aria-labelledby="continue-title">
          <h2 id="continue-title">Continuer la visite</h2>
          <p>Comparer les autres études de cas et filtrer le catalogue par langage, type, stack ou statut.</p>
          <div class="contact-actions">
            <a class="button button-primary" href="./index.html">Tous les projets</a>
            <a class="button button-secondary" href="../index.html#contact">Contact</a>
          </div>
        </aside>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="content-shell footer-grid">
      <div>
        <p class="footer-title">Alexis Guinot</p>
        <p>Concepteur-développeur full-stack.</p>
      </div>
      <nav aria-label="Liens externes">
        <ul class="footer-links">
          <li><a href="mailto:alexis.guinot@onsiea.com">E-mail</a></li>
          <li><a href="https://www.linkedin.com/in/alexis-guinot/" rel="me noopener noreferrer">LinkedIn</a></li>
          <li><a href="https://github.com/alescis-wuin" rel="me noopener noreferrer">GitHub</a></li>
          <li><a href="../assets/cv/CV_Alexis-GUINOT.pdf" download>CV PDF</a></li>
        </ul>
      </nav>
    </div>
  </footer>
  <script type="module" src="../assets/js/main.js"></script>
</body>
</html>
