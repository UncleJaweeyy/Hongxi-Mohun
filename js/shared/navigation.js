const homeSections = new Set(['home', 'features', 'rank', 'classes', 'gallery', 'news', 'community']);
const pageRoutes = new Set([]);

export function initNavigation() {
  const header = document.querySelector('[data-header]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  const pages = document.querySelectorAll('[data-page]');
  const navLinks = document.querySelectorAll('.site-nav a');
  const staticActiveSection = document.body.dataset.currentSection || '';

  function closeNav() {
    document.body.classList.remove('nav-open');
    header?.classList.remove('nav-open');
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle?.setAttribute('aria-label', '打开导航');
  }

  function setActivePage(pageName) {
    pages.forEach((page) => page.classList.toggle('is-active', page.dataset.page === pageName));
  }

  function getNavTarget(link) {
    const href = link.getAttribute('href') || '';
    const hashIndex = href.indexOf('#');

    if (href.endsWith('news.html')) return 'news';
    if (href.endsWith('guides.html')) return 'guides';
    if (href.endsWith('download.html')) return 'download';
    if (hashIndex >= 0) return href.slice(hashIndex + 1);
    return href.replace(/\.html$/, '');
  }

  function setActiveNav(hash) {
    const activeHash = staticActiveSection || hash;
    navLinks.forEach((link) => {
      const target = getNavTarget(link);
      link.classList.toggle('is-active', target === activeHash);
    });
  }

  function navigate() {
    const hash = window.location.hash.replace('#', '') || 'home';
    const pageName = pageRoutes.has(hash) ? hash : 'home';

    if (staticActiveSection && !pages.length) {
      setActiveNav(staticActiveSection);
      closeNav();
      return;
    }

    setActivePage(pageName);
    setActiveNav(hash);
    closeNav();

    if (homeSections.has(hash)) {
      window.requestAnimationFrame(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } else {
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
  }

  navToggle?.addEventListener('click', () => {
    const isOpen = header?.classList.toggle('nav-open');
    document.body.classList.toggle('nav-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? '关闭导航' : '打开导航');
  });

  nav?.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeNav();
  });

  window.addEventListener('hashchange', navigate);
  navigate();
}
