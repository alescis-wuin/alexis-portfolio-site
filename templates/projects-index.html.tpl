<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Catalogue des projets d’Alexis Guinot : études de cas, technologies, architectures, applications web et desktop.">
  <meta name="author" content="Alexis Guinot">
  <meta name="color-scheme" content="dark light">
  <meta property="og:title" content="Projets — Alexis Guinot">
  <meta property="og:description" content="Catalogue des projets d’Alexis Guinot, filtrable par langage, type, stack et statut.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{{CANONICAL_URL}}">
  <meta property="og:image" content="https://www.alexis-guinot.fr/assets/img/photo-profil-800.webp">
  <meta name="theme-color" content="#0B1020">
  <title>Projets — Alexis Guinot</title>
  <link rel="canonical" href="{{CANONICAL_URL}}">
  <link rel="icon" href="../assets/img/logo.svg" type="image/svg+xml">
  <link rel="manifest" href="../site.webmanifest">
  <link rel="stylesheet" href="../assets/css/styles.css">
  <link rel="stylesheet" href="../assets/css/project-cards.css">
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

<body>
  <a class="skip-link" href="#contenu">Aller au contenu principal</a>
  <header class="site-header" data-site-header>
    <div class="content-shell header-inner">
      <a class="brand" href="../index.html#accueil" aria-label="Retour à l’accueil">
        <img src="../assets/img/logo.svg" width="40" height="40" alt="" aria-hidden="true">
        <span>Alexis Guinot</span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="navigation-principale" data-nav-toggle hidden>
        <span class="nav-toggle-bars" aria-hidden="true"></span>
        <span class="sr-only">Ouvrir le menu</span>
      </button>
      <nav class="site-nav" aria-label="Navigation principale" data-site-nav>
        <ul id="navigation-principale" class="nav-list">
          <li><a href="../index.html#accueil">Accueil</a></li>
          <li><a href="./index.html" aria-current="page">Projets</a></li>
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

  <main id="contenu">
    <section class="section-lg">
      <div class="frame" data-project-catalog>
        <div class="section-heading reading">
          <p class="eyebrow">Catalogue</p>
          <h1>Projets et études de cas</h1>
          <p>Les filtres sont produits depuis la même source de données que les pages projet, le portfolio d’accueil, le sitemap et les tests.</p>
        </div>

        {{FILTERS}}

        <div class="project-catalog-status" aria-live="polite">
          <span data-project-count>{{PROJECT_COUNT}} projet(s)</span>
          <button class="button button-small button-ghost" type="button" data-filter-reset>Réinitialiser les filtres</button>
        </div>

        <div class="project-grid project-grid-catalog">
          {{PROJECT_CARDS}}
        </div>

        <p class="project-catalog-empty" data-project-empty hidden>Aucun projet ne correspond à ces filtres.</p>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="content-shell footer-grid">
      <div>
        <p class="footer-title">Alexis Guinot</p>
        <p>Développeur et concepteur d’applications.</p>
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
