
(() => {
  const root = document.documentElement;
  const progress = document.querySelector('.reading-progress > span');
  const topButton = document.querySelector('.back-to-top');
  const themeButton = document.querySelector('[data-theme-toggle]');
  const toast = document.querySelector('.toast');
  const dialog = document.querySelector('.figure-dialog');
  const dialogImage = dialog?.querySelector('img');
  const dialogCaption = dialog?.querySelector('[data-dialog-caption]');
  const dialogDownload = dialog?.querySelector('[data-dialog-download]');

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  };

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    try { localStorage.setItem('ng-theme', theme); } catch (_) {}
    themeButton?.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  };
  let savedTheme = null;
  try { savedTheme = localStorage.getItem('ng-theme'); } catch (_) {}
  const preferredDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme || (preferredDark ? 'dark' : 'light'));
  themeButton?.addEventListener('click', () => applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  const updateScrollUI = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progress) progress.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    topButton?.classList.toggle('is-visible', window.scrollY > 900);
    const article = document.querySelector('.article-shell');
    if (article) {
      const headerHeight = parseFloat(getComputedStyle(root).getPropertyValue('--header-h')) || 72;
      document.body.classList.toggle('article-active', window.scrollY >= article.offsetTop - headerHeight - 180);
    }
  };
  updateScrollUI();
  window.addEventListener('scroll', updateScrollUI, { passive: true });
  window.addEventListener('resize', updateScrollUI, { passive: true });
  topButton?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const tocLinks = [...document.querySelectorAll('[data-toc-link]')];
  const headings = [...document.querySelectorAll('.chapter-title[id], .section-title[id]')];
  const setActive = (id) => {
    tocLinks.forEach((a) => {
      const active = a.getAttribute('href') === `#${id}`;
      a.classList.toggle('is-active', active);
      if (active) {
        const chapter = a.closest('.toc-chapter');
        document.querySelectorAll('.desktop-toc .toc-chapter').forEach((li) => li.classList.remove('is-open'));
        chapter?.classList.add('is-open');
      }
    });
  };
  if ('IntersectionObserver' in window) {
    const headingObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: '-18% 0px -70% 0px', threshold: [0, 1] });
    headings.forEach((h) => headingObserver.observe(h));

    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.04 });
    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  }

  document.querySelectorAll('[data-lightbox]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!dialog || !dialogImage) return;
      event.preventDefault();
      dialogImage.src = link.dataset.lightbox;
      dialogImage.alt = link.dataset.caption || 'Full-resolution research infographic';
      if (dialogCaption) dialogCaption.textContent = link.dataset.caption || '';
      if (dialogDownload) dialogDownload.href = link.dataset.lightbox;
      dialog.showModal();
    });
  });
  dialog?.querySelector('[data-dialog-close]')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  const sharePage = async () => {
    const data = { title: document.title, text: document.querySelector('meta[name="description"]')?.content || '', url: location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(location.href);
        showToast('Article link copied');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') showToast('Unable to share this page');
    }
  };
  document.querySelectorAll('[data-share]').forEach((button) => button.addEventListener('click', sharePage));
  document.querySelectorAll('[data-print]').forEach((button) => button.addEventListener('click', () => window.print()));
})();
