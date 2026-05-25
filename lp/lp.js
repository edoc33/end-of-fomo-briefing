/* The End of FOMO · landing page motion
 * Phases 1 + 2: nav pin behavior, parallax clouds, stat count-ups.
 * Phases 3+ will mount GSAP ScrollTrigger on top of this baseline.
 */
(function () {
  'use strict';

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- 1. Sticky nav pin on scroll --------------------------
  const nav = document.querySelector('[data-nav]');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 24) nav.setAttribute('data-pinned', '');
      else nav.removeAttribute('data-pinned');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---------- 2. Parallax clouds ----------------------------------
  // Each [data-parallax="N"] translates Y by `scrollY * N`.
  const parallaxNodes = document.querySelectorAll('[data-parallax]');
  if (parallaxNodes.length && !prefersReducedMotion) {
    let ticking = false;
    const apply = () => {
      const y = window.scrollY;
      parallaxNodes.forEach((el) => {
        const rate = parseFloat(el.getAttribute('data-parallax')) || 0;
        el.style.transform = `translate3d(0, ${y * rate}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(apply);
          ticking = true;
        }
      },
      { passive: true }
    );
    apply();
  }

  // ---------- 3. Count-up stats -----------------------------------
  // [data-countup="N"] animates from 0 -> N. Optional [data-format="comma"].
  const countNodes = document.querySelectorAll('[data-countup]');
  const observer =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                runCountUp(entry.target);
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.4 }
        )
      : null;

  countNodes.forEach((el) => {
    el.textContent = '0';
    if (observer) observer.observe(el);
    else runCountUp(el);
  });

  function runCountUp(el) {
    if (prefersReducedMotion) {
      el.textContent = formatNumber(el);
      return;
    }
    const target = parseInt(el.getAttribute('data-countup'), 10);
    const format = el.getAttribute('data-format') || 'plain';
    const suffix = el.getAttribute('data-suffix') || '';

    // Adaptive duration · bigger targets get more frames so the
    // last few digits look intentional, not janky.
    const dur =
      target <= 100 ? 900 : target <= 10000 ? 1400 : target <= 200000 ? 1800 : 2200;

    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3); // cubic out

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / dur);
      const v = Math.round(target * ease(progress));
      el.textContent = (format === 'comma' ? v.toLocaleString('en-US') : String(v)) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = (format === 'comma' ? target.toLocaleString('en-US') : String(target)) + suffix;
    }
    requestAnimationFrame(tick);
  }

  function formatNumber(el) {
    const target = parseInt(el.getAttribute('data-countup'), 10);
    const format = el.getAttribute('data-format') || 'plain';
    const suffix = el.getAttribute('data-suffix') || '';
    return (format === 'comma' ? target.toLocaleString('en-US') : String(target)) + suffix;
  }
})();
