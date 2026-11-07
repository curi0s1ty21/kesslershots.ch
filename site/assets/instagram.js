// Smartphone mit dem Feed im Instagram-Look (index.html #instagram).
// Scrollt den Feed langsam nach unten und wieder zurück. Hält an, sobald jemand selbst scrollt
// oder mit der Maus im Handy ist, und läuft danach weiter.
(function () {
  const feed = document.getElementById('igf-scroll');
  if (!feed) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const SPEED = 22; // Pixel pro Sekunde
  const PAUSE = 2500; // Millisekunden oben und unten
  let position = 0;
  let direction = 1;
  let waitUntil = performance.now() + PAUSE;
  let pausedUntil = 0;
  let hover = false;
  let last = 0;
  let visible = false;

  // Nur laufen, wenn das Handy zu sehen ist: spart Akku.
  new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; }).observe(feed);

  function userScrolled() {
    position = feed.scrollTop;
    pausedUntil = performance.now() + 4000;
  }
  feed.addEventListener('wheel', userScrolled, { passive: true });
  feed.addEventListener('touchmove', userScrolled, { passive: true });
  feed.addEventListener('mouseenter', () => { hover = true; });
  feed.addEventListener('mouseleave', () => { hover = false; position = feed.scrollTop; });

  function tick(now) {
    const dt = last ? Math.min(100, now - last) : 0;
    last = now;
    if (visible && !hover && now >= pausedUntil && now >= waitUntil) {
      const max = feed.scrollHeight - feed.clientHeight;
      position += direction * SPEED * dt / 1000;
      if (position >= max) { position = max; direction = -1; waitUntil = now + PAUSE; }
      if (position <= 0) { position = 0; direction = 1; waitUntil = now + PAUSE; }
      feed.scrollTop = position;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
