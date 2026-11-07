// Animations for every page: scroll reveals, image unveil, portfolio lightbox and a reading
// progress bar. Without JavaScript or with "reduce motion" the page simply shows everything.
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js-motion');

  // --- Reading progress bar ---------------------------------------------------
  const bar = document.createElement('div');
  bar.className = 'mx-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  function progress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
  }
  window.addEventListener('scroll', progress, { passive: true });
  window.addEventListener('resize', progress);
  progress();

  // --- Scroll reveal --------------------------------------------------------------
  // Elements get .mx-reveal (hidden) and .mx-in (shown) when they enter the screen.
  // Children of a group appear one after another.
  const single = [
    'main h1', 'section h2', 'section > div > p', '#about .about-blob-wrap', '#about blockquote',
    '#faq details', '#preise .segmented', '.card', 'form',
  ];
  const groups = [
    '#preise-hochzeit', '#preise-couple', '#portfolio .grid', '#about ul', '#testimonial-track',
    '#leistungen .grid.mt-12',
  ];
  const revealed = new Set();
  function mark(el, delay) {
    if (revealed.has(el) || el.closest('.mx-reveal')) return;
    revealed.add(el);
    el.classList.add('mx-reveal');
    if (delay) el.style.transitionDelay = `${delay}ms`;
  }
  for (const selector of single) document.querySelectorAll(selector).forEach((el) => mark(el, 0));
  for (const selector of groups) {
    document.querySelectorAll(selector).forEach((group) => {
      [...group.children].forEach((child, i) => mark(child, Math.min(i, 6) * 90));
    });
  }
  // Large photos: soft zoom-out and fade when they appear.
  document.querySelectorAll('section .overflow-hidden > picture img, #portfolio figure img').forEach((img) => {
    img.classList.add('mx-unveil');
  });
  // The older reveal-left/right classes on the start page use .visible.
  const legacy = document.querySelectorAll('.reveal-left, .reveal-right, .reveal');

  const show = (el) => {
    el.classList.add('mx-in', 'visible');
    // The stagger delay must not slow down later hover effects.
    if (el.style.transitionDelay) setTimeout(() => { el.style.transitionDelay = ''; }, 1500);
  };
  const targets = [...revealed, ...document.querySelectorAll('.mx-unveil'), ...legacy];
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(show);
  } else {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        show(entry.target);
        observer.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach((el) => observer.observe(el));
  }
  // Elements in a tab that opens later (e.g. couple prices) must not stay invisible.
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.seg-btn, a[href="#preise-couple"]')) return;
    setTimeout(() => document.querySelectorAll('#preise .mx-reveal').forEach(show), 50);
  });

  // --- Portfolio lightbox -----------------------------------------------------------
  const figures = [...document.querySelectorAll('#portfolio figure')];
  if (!figures.length) return;
  const box = document.createElement('div');
  box.className = 'mx-lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Bild in gross');
  box.hidden = true;
  box.innerHTML = `
    <button type="button" class="mx-lb-close" aria-label="Schliessen">×</button>
    <button type="button" class="mx-lb-prev" aria-label="Vorheriges Bild">‹</button>
    <div class="mx-lb-stage"></div>
    <button type="button" class="mx-lb-next" aria-label="Nächstes Bild">›</button>
    <p class="mx-lb-count" aria-live="polite"></p>`;
  document.body.appendChild(box);
  const stage = box.querySelector('.mx-lb-stage');
  let current = 0;
  let lastFocus = null;

  function open(index) {
    current = (index + figures.length) % figures.length;
    // Copy the responsive picture and let the browser pick the size for the full screen.
    const picture = figures[current].querySelector('picture').cloneNode(true);
    picture.querySelectorAll('source, img').forEach((el) => el.setAttribute('sizes', '100vw'));
    const img = picture.querySelector('img');
    img.className = 'mx-lb-img';
    img.removeAttribute('loading');
    stage.replaceChildren(picture);
    box.querySelector('.mx-lb-count').textContent = `${current + 1} / ${figures.length}`;
    if (box.hidden) {
      lastFocus = document.activeElement;
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => box.classList.add('is-open'));
      box.querySelector('.mx-lb-close').focus();
    }
  }
  function close() {
    box.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { box.hidden = true; stage.replaceChildren(); }, reduce ? 0 : 250);
    if (lastFocus) lastFocus.focus();
  }

  figures.forEach((figure, i) => {
    figure.classList.add('mx-zoomable');
    figure.tabIndex = 0;
    figure.setAttribute('role', 'button');
    figure.setAttribute('aria-label', `Bild ${i + 1} gross anzeigen`);
    figure.addEventListener('click', () => open(i));
    figure.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(i); }
    });
  });
  box.querySelector('.mx-lb-close').addEventListener('click', close);
  box.querySelector('.mx-lb-prev').addEventListener('click', () => open(current - 1));
  box.querySelector('.mx-lb-next').addEventListener('click', () => open(current + 1));
  box.addEventListener('click', (event) => { if (event.target === box || event.target === stage) close(); });
  document.addEventListener('keydown', (event) => {
    if (box.hidden) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') open(current - 1);
    if (event.key === 'ArrowRight') open(current + 1);
  });
  // Swipe on phones.
  let startX = null;
  box.addEventListener('touchstart', (event) => { startX = event.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', (event) => {
    if (startX === null) return;
    const dx = event.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) open(current + (dx < 0 ? 1 : -1));
    startX = null;
  });
})();
