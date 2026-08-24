/* ==========================================================================
   Insta.mam — atmosphere layer
   Everything here is decoration. main.js owns the functional site; if this
   file fails to load, nothing breaks — you just get the flat palette.

   The idea: this venue lives twice in a day. Coffee at 9am, cocktails at 1am.
   So the page travels. It opens in espresso browns and cools to midnight blue
   by the time you reach the bar. The palette IS the product, not a decoration.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(pointer: fine)');
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* ------------------------------------------------------------------
     1. THE JOURNEY — warm morning → cold night
     Contrast was verified at every stop: body text never drops below
     16.7:1, muted never below 6.5:1. See MASTER.md §4.
     ------------------------------------------------------------------ */
  var STOPS = [
    { at: '#steki',   c: { bg:'#1A1410', deep:'#120E0B', sur:'#241C16', surHi:'#2E241C', line:'#2E2620', lineS:'#7A6E5E', muted:'#C4B5A4' } },
    { at: '#menu',    c: { bg:'#15151B', deep:'#0F0F14', sur:'#1E1E26', surHi:'#26262F', line:'#2A2A33', lineS:'#6E6E7C', muted:'#B9B7BE' } },
    { at: '#events',  c: { bg:'#0F1623', deep:'#0A0F19', sur:'#161E2E', surHi:'#1D273A', line:'#232E42', lineS:'#5A6B85', muted:'#AEB6C4' } },
    { at: '#reserve', c: { bg:'#0A0F19', deep:'#070A12', sur:'#121A28', surHi:'#1A2435', line:'#1E2838', lineS:'#55657E', muted:'#A8B0BE' } }
  ];

  function hex(h) {
    h = h.replace('#', '');
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
  }
  function mix(a, b, t) {
    var A = hex(a), B = hex(b);
    return 'rgb(' + Math.round(A[0]+(B[0]-A[0])*t) + ',' +
                    Math.round(A[1]+(B[1]-A[1])*t) + ',' +
                    Math.round(A[2]+(B[2]-A[2])*t) + ')';
  }

  function initJourney() {
    var stops = STOPS.filter(function (s) { return document.querySelector(s.at); });
    if (stops.length < 2) return;

    var anchors = [];
    function measure() {
      anchors = stops.map(function (s) {
        var el = document.querySelector(s.at);
        var r = el.getBoundingClientRect();
        return { y: r.top + window.scrollY, c: s.c };
      });
    }

    var root = document.documentElement;
    var ticking = false;

    function paint() {
      ticking = false;
      if (!anchors.length) return;
      var y = window.scrollY + window.innerHeight * 0.45;

      var a = anchors[0], b = anchors[0], t = 0;
      if (y <= anchors[0].y) { a = b = anchors[0]; t = 0; }
      else if (y >= anchors[anchors.length-1].y) { a = b = anchors[anchors.length-1]; t = 0; }
      else {
        for (var i = 0; i < anchors.length - 1; i++) {
          if (y >= anchors[i].y && y <= anchors[i+1].y) {
            a = anchors[i]; b = anchors[i+1];
            var span = (b.y - a.y) || 1;
            t = (y - a.y) / span;
            // ease so the shift never reads as a hard wipe between sections
            t = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;
            break;
          }
        }
      }
      root.style.setProperty('--bg',          mix(a.c.bg,    b.c.bg,    t));
      root.style.setProperty('--bg-deep',     mix(a.c.deep,  b.c.deep,  t));
      root.style.setProperty('--surface',     mix(a.c.sur,   b.c.sur,   t));
      root.style.setProperty('--surface-hi',  mix(a.c.surHi, b.c.surHi, t));
      root.style.setProperty('--line',        mix(a.c.line,  b.c.line,  t));
      root.style.setProperty('--line-strong', mix(a.c.lineS, b.c.lineS, t));
      root.style.setProperty('--muted',       mix(a.c.muted, b.c.muted, t));
    }

    measure(); paint();
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(paint); }
    }, { passive: true });
    window.addEventListener('resize', function () { measure(); paint(); }, { passive: true });
    // sections change height once the menu JSON lands
    window.setTimeout(function () { measure(); paint(); }, 1200);
    document.documentElement.classList.add('has-journey');
  }

  /* ------------------------------------------------------------------
     2. GRAIN — a single SVG turbulence tile over everything.
     Costs about 1KB and does more for perceived quality than any
     amount of gradient work. Kills the flat-digital look.
     ------------------------------------------------------------------ */
  function initGrain() {
    if (document.querySelector('.grain')) return;
    var d = document.createElement('div');
    d.className = 'grain';
    d.setAttribute('aria-hidden', 'true');
    document.body.appendChild(d);
  }

  /* ------------------------------------------------------------------
     3. CURSOR — a lagging ring that swells over interactive things.
     Desktop + fine pointer only. Never replaces the real cursor on
     text inputs, and never on touch.
     ------------------------------------------------------------------ */
  function initCursor() {
    if (!finePointer.matches || reduce.matches || window.innerWidth < 1024) return;

    var ring = document.createElement('div');
    ring.className = 'cursor';
    ring.setAttribute('aria-hidden', 'true');
    var dot = document.createElement('div');
    dot.className = 'cursor__dot';
    dot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring);
    document.body.appendChild(dot);

    var tx = window.innerWidth/2, ty = window.innerHeight/2;
    var rx = tx, ry = ty, raf = null;

    function loop() {
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      ring.style.transform = 'translate3d(' + (rx-20) + 'px,' + (ry-20) + 'px,0)';
      dot.style.transform  = 'translate3d(' + (tx-3)  + 'px,' + (ty-3)  + 'px,0)';
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!raf) { document.body.classList.add('cursor-on'); raf = requestAnimationFrame(loop); }
    }, { passive: true });

    document.addEventListener('mouseleave', function () { document.body.classList.remove('cursor-on'); });
    document.addEventListener('mouseenter', function () { document.body.classList.add('cursor-on'); });

    var hot = 'a, button, .shot, input, select, textarea, [role="tab"]';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(hot)) ring.classList.add('is-hot');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(hot)) ring.classList.remove('is-hot');
    });
  }

  /* ------------------------------------------------------------------
     4. MAGNETIC BUTTONS — the primary CTA leans toward the pointer.
     Small displacement only; the button never leaves its own hit area,
     so the thing you aimed at is still the thing you click.
     ------------------------------------------------------------------ */
  function initMagnetic() {
    if (!finePointer.matches || reduce.matches || window.innerWidth < 1024) return;
    $$('[data-magnetic], .btn--primary').forEach(function (el) {
      var raf = null, tx = 0, ty = 0, cx = 0, cy = 0;
      function loop() {
        cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
        el.style.transform = 'translate3d(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px,0)';
        if (Math.abs(tx-cx) > 0.1 || Math.abs(ty-cy) > 0.1) { raf = requestAnimationFrame(loop); }
        else { raf = null; el.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0)'; }
      }
      function kick() { if (!raf) raf = requestAnimationFrame(loop); }
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width  - 0.5) * 14;
        ty = ((e.clientY - r.top)  / r.height - 0.5) * 10;
        kick();
      });
      el.addEventListener('mouseleave', function () { tx = 0; ty = 0; kick(); });
    });
  }

  /* ------------------------------------------------------------------
     5. WORD REVEAL — headings rise word by word.
     Splits on spaces only (never characters), so screen readers still
     read whole words and Greek stays intact.
     ------------------------------------------------------------------ */
  function initWordReveal() {
    var heads = $$('[data-words]');
    if (!heads.length) return;

    if (reduce.matches || !('IntersectionObserver' in window)) return;

    heads.forEach(function (h) {
      var text = h.textContent.trim();
      var words = text.split(/\s+/);
      if (words.length > 24) return;                 // don't shred long copy
      h.setAttribute('aria-label', text);

      // Built with the DOM rather than an innerHTML string. A style="" written
      // through HTML parsing is blocked by `style-src 'self'`, so the stagger
      // would silently vanish under our CSP; assigning through CSSOM is not.
      // It also means the heading text is never re-parsed as markup.
      var frag = document.createDocumentFragment();
      words.forEach(function (w, i) {
        var outer = document.createElement('span');
        outer.className = 'w';
        var inner = document.createElement('i');
        inner.textContent = w;
        inner.style.transitionDelay = (i * 55) + 'ms';
        outer.appendChild(inner);
        frag.appendChild(outer);
        if (i < words.length - 1) frag.appendChild(document.createTextNode(' '));
      });
      h.textContent = '';
      h.appendChild(frag);
      h.classList.add('words-ready');
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('words-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -18% 0px', threshold: 0.01 });

    heads.forEach(function (h) { if (h.classList.contains('words-ready')) io.observe(h); });

    // safety net, same reasoning as the reveal watchdog in main.js
    window.setTimeout(function () {
      $$('.words-ready:not(.words-in)').forEach(function (h) { h.classList.add('words-in'); });
    }, 2600);
  }

  /* ------------------------------------------------------------------
     6. MARQUEE — one oversized typographic breath between sections.
     Duplicated content so the loop is seamless; paused for reduced motion.
     ------------------------------------------------------------------ */
  function initMarquee() {
    $$('.marquee__track').forEach(function (track) {
      if (track.dataset.cloned) return;
      track.dataset.cloned = '1';
      track.innerHTML = track.innerHTML + track.innerHTML;
    });
  }

  /* ------------------------------------------------------------------
     7. HERO DEPTH — the hero image drifts a little slower than the page.
     Decorative layer only, desktop only, capped so it can never desync.
     ------------------------------------------------------------------ */
  function initHeroDepth() {
    var img = $('.hero__media img');
    var hero = $('.hero');
    if (!img || !hero || reduce.matches || window.innerWidth < 768) return;
    var ticking = false;
    function upd() {
      ticking = false;
      var r = hero.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var p = Math.min(1, Math.max(0, -r.top / (r.height || 1)));
      img.style.transform = 'scale(1.06) translate3d(0,' + (p * 6).toFixed(2) + '%,0)';
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(upd); }
    }, { passive: true });
    upd();
  }

  /* ------------------------------------------------------------------
     8. SPOTLIGHT — feed pointer position to the event cards as CSS vars.
     Pure paint; no layout is read or written per frame.
     ------------------------------------------------------------------ */
  function initSpotlight() {
    if (!finePointer.matches || reduce.matches) return;
    $$('.event').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      }, { passive: true });
    });
  }

  function boot() {
    initSpotlight();
    initGrain();
    initJourney();
    initWordReveal();
    initMarquee();
    initCursor();
    initMagnetic();
    initHeroDepth();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
