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
      el.textContent = prefix + (format === 'comma' ? v.toLocaleString('en-US') : String(v)) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + (format === 'comma' ? target.toLocaleString('en-US') : String(target)) + suffix;
    }
    requestAnimationFrame(tick);
  }

  function formatNumber(el) {
    const target = parseInt(el.getAttribute('data-countup'), 10);
    const format = el.getAttribute('data-format') || 'plain';
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    return prefix + (format === 'comma' ? target.toLocaleString('en-US') : String(target)) + suffix;
  }
})();

/* ===================================================================
   Phase 3 · Lineage horizontal scroll
   Pins the lineage section and translates the track X based on scroll.
   Activates only when GSAP + ScrollTrigger are loaded, viewport is wide,
   and reduced motion is not requested.
   =================================================================== */
window.addEventListener('load', function () {
  const reduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = window.matchMedia('(max-width: 720px)').matches;
  if (reduced || narrow) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  const track = document.querySelector('[data-lineage-track]');
  const section = document.querySelector('.lineage');
  const dots = document.querySelectorAll('.lineage__progress li');
  if (!track || !section || !dots.length) return;

  // Total horizontal distance the track must travel.
  const totalScroll = function () {
    return Math.max(0, track.scrollWidth - window.innerWidth + 80);
  };

  gsap.to(track, {
    x: function () { return -totalScroll(); },
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: function () { return '+=' + totalScroll(); },
      scrub: 0.5,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: function (self) {
        const idx = Math.min(
          dots.length - 1,
          Math.floor(self.progress * dots.length)
        );
        dots.forEach(function (d, i) {
          if (i === idx) d.setAttribute('aria-current', 'true');
          else d.removeAttribute('aria-current');
        });
      }
    }
  });

  window.addEventListener('resize', function () { ScrollTrigger.refresh(); });
});

/* ===================================================================
   Phase 4 · Architecture sticky split-screen
   Pins the wrapper, advances beats 01..04 on both columns as scroll progresses.
   =================================================================== */
window.addEventListener('load', function () {
  const reduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = window.matchMedia('(max-width: 900px)').matches;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const wrap = document.querySelector('[data-arch-wrap]');
  const section = document.querySelector('.architecture');
  const beatLists = document.querySelectorAll('[data-beats]');
  if (!wrap || !section || !beatLists.length) return;

  if (reduced || narrow) {
    // Just reveal all beats immediately
    beatLists.forEach(function (list) {
      list.querySelectorAll('[data-beat]').forEach(function (li) {
        li.setAttribute('data-active', '');
      });
    });
    return;
  }

  const cols = document.querySelectorAll('.architecture__col');
  function setBeats(activeUpTo) {
    beatLists.forEach(function (list) {
      list.querySelectorAll('[data-beat]').forEach(function (li) {
        const bn = parseInt(li.getAttribute('data-beat'), 10);
        if (bn <= activeUpTo) li.setAttribute('data-active', '');
        else li.removeAttribute('data-active');
      });
    });
    // Preview state: setup for beats 1-2, alert for beats 3-4
    const state = activeUpTo >= 3 ? 'alert' : 'setup';
    cols.forEach(function (c) { c.setAttribute('data-arch-state', state); });
  }

  setBeats(1);
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: '+=240%',
    pin: wrap,
    scrub: 0.4,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: function (self) {
      const beats = Math.min(4, Math.max(1, Math.ceil(self.progress * 4)));
      setBeats(beats);
    }
  });
});

/* ===================================================================
   Phase 5 · Voices stagger reveal
   IntersectionObserver-driven · no GSAP needed for this one.
   =================================================================== */
(function () {
  const cards = document.querySelectorAll('.voices__card');
  if (!cards.length) return;

  if (!('IntersectionObserver' in window)) {
    cards.forEach(function (c) { c.setAttribute('data-active', ''); });
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const card = entry.target;
      const idx = parseInt(card.getAttribute('data-voice'), 10) || 1;
      setTimeout(function () {
        card.setAttribute('data-active', '');
      }, (idx - 1) * 180);
      observer.unobserve(card);
    });
  }, { threshold: 0.25 });

  cards.forEach(function (c) { observer.observe(c); });
})();

/* ===================================================================
   Phase 6 · CTA form · light client-side normalization before submit
   Form posts a GET to visualping.io/sign-up with utm_* + email + url.
   =================================================================== */
(function () {
  const form = document.querySelector('[data-cta-form]');
  if (!form) return;
  form.addEventListener('submit', function () {
    const urlInput = form.querySelector('input[name="url"]');
    if (urlInput && urlInput.value && !/^https?:\/\//i.test(urlInput.value)) {
      urlInput.value = 'https://' + urlInput.value;
    }
  });
})();
