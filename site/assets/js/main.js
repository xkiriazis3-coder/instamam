/* ==========================================================================
   Insta.mam — Meze Bar
   Vanilla. No dependencies. ~7KB unminified.

   Everything here is progressive enhancement: the page is complete and
   readable with JS disabled. Nothing below is required to read the site.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     0. Strings, and the small jobs that used to be inline <script> blocks.

     These lived in the HTML until the CSP work. Every inline script or
     on* attribute forces `script-src 'unsafe-inline'`, which defeats most of
     the point of having a CSP at all — so they moved here and the policy is
     now plain `script-src 'self'`.
     ------------------------------------------------------------------------ */
  var LANG = document.documentElement.lang === 'en' ? 'en' : 'el';

  var STRINGS = {
    el: {
      required: 'Το πεδίο είναι υποχρεωτικό',
      invalid:  'Έλεγξε αυτό το πεδίο',
      sending:  'Αποστολή…',
      success:  'Το αίτημα στάλθηκε. Θα επικοινωνήσουμε μαζί σου για επιβεβαίωση.',
      failure:  'Δεν στάλθηκε. Πάρε μας τηλέφωνο στο 23930 23176.',
      noEndpoint: 'Η φόρμα δεν έχει συνδεθεί ακόμη. Πάρε μας στο 23930 23176.',
      menuFail: 'Ο κατάλογος δεν φόρτωσε. Πάρε μας στο 23930 23176.',
      menuCats: 'Κατηγορίες μενού',
      openNow: 'Ανοιχτά τώρα', closedNow: 'Κλειστά',
      until: 'μέχρι', opensAt: 'ανοίγουμε'
    },
    en: {
      required: 'This field is required',
      invalid:  'Please check this field',
      sending:  'Sending…',
      success:  'Request sent. We will contact you to confirm.',
      failure:  'Could not send. Please call us on +30 23930 23176.',
      noEndpoint: 'The form is not connected yet. Please call +30 23930 23176.',
      menuFail: 'The menu did not load. Please call +30 23930 23176.',
      menuCats: 'Menu categories',
      openNow: 'Open now', closedNow: 'Closed',
      until: 'until', opensAt: 'opens'
    }
  };
  window.INSTAMAM_I18N = STRINGS[LANG];

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* Copyright year — was an inline script. */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Logo fallback — was an inline onerror="" attribute. If the mark fails to
     load, hide it and reveal the typographic wordmark instead. `complete` with
     zero naturalWidth means it already failed before this script ran. */
  (function () {
    var mark = document.querySelector('.brand__mark');
    if (!mark) return;
    var fail = function () {
      mark.style.display = 'none';
      var alt = mark.nextElementSibling;
      if (alt) alt.hidden = false;
    };
    if (mark.complete && mark.naturalWidth === 0) fail();
    else mark.addEventListener('error', fail);
  })();

  /* ------------------------------------------------------------------------
     1. Sticky header
     ------------------------------------------------------------------------ */
  var header = $('.header');
  if (header) {
    var stuck = false;
    var onScrollHeader = function () {
      var should = window.scrollY > 80;
      if (should !== stuck) {
        stuck = should;
        header.classList.toggle('is-stuck', stuck);
      }
    };
    onScrollHeader();
    window.addEventListener('scroll', onScrollHeader, { passive: true });
  }

  /* ------------------------------------------------------------------------
     1b. Mobile action bar — rises once the hero's own CTAs scroll away, so
     it never duplicates buttons that are already on screen.
     ------------------------------------------------------------------------ */
  function initActionBar() {
    var bar = $('.actionbar');
    var heroCta = $('.hero__cta');
    if (!bar || !heroCta) return;
    if (!('IntersectionObserver' in window)) { bar.classList.add('is-up'); return; }
    new IntersectionObserver(function (entries) {
      bar.classList.toggle('is-up', !entries[0].isIntersecting);
    }, { threshold: 0 }).observe(heroCta);
  }
  initActionBar();

  /* ------------------------------------------------------------------------
     2. Mobile drawer
     ------------------------------------------------------------------------ */
  var burger = $('.burger');
  var drawer = $('.drawer');

  function closeDrawer() {
    if (!drawer || drawer.hasAttribute('hidden')) return;
    drawer.setAttribute('hidden', '');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  }
  function openDrawer() {
    if (!drawer) return;
    drawer.removeAttribute('hidden');
    burger.setAttribute('aria-expanded', 'true');
  }

  if (burger && drawer) {
    burger.addEventListener('click', function () {
      if (drawer.hasAttribute('hidden')) { openDrawer(); } else { closeDrawer(); }
    });
    // Any nav choice closes the drawer
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', closeDrawer); });
    // Escape is a guaranteed escape route
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024) closeDrawer();
    });
  }

  /* ------------------------------------------------------------------------
     3. Scroll reveal
     motion.csv#5 — 520ms, power2.out equivalent, 80ms stagger, cap 8.
     The element's final state is its CSS default; .reveal removes it and
     .is-in restores it. Failure mode is "already visible", never "invisible".
     ------------------------------------------------------------------------ */
  function initReveal() {
    var targets = $$('[data-reveal]');
    if (!targets.length) return;

    // Reduced motion, or no IO support → show everything immediately.
    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.remove('reveal'); });
      return;
    }

    targets.forEach(function (el) { el.classList.add('reveal'); });

    // Watchdog. Hiding content and waiting for an observer means a silent
    // failure mode: if IO never fires (odd embedding, background tab that
    // never composites, a browser quirk), the page would stay blank. After
    // 2.5s, anything still hidden is shown unconditionally.
    var watchdog = window.setTimeout(function () {
      $$('[data-reveal].reveal:not(.is-in)').forEach(function (el) {
        el.classList.add('is-in');
      });
    }, 2500);

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var group = el.parentElement;
        var delay = 0;

        if (group && group.hasAttribute('data-reveal-group')) {
          var sibs = $$('[data-reveal]', group);
          var idx = sibs.indexOf(el);
          // Cap the stagger at 8 — beyond that the tail feels laggy.
          delay = Math.min(idx, 7) * 80;
        }
        el.style.setProperty('--reveal-delay', delay + 'ms');
        el.classList.add('is-in');
        io.unobserve(el);
      });

      // Observer is alive and delivering — the watchdog is no longer needed.
      if (watchdog) { window.clearTimeout(watchdog); watchdog = null; }
    }, { rootMargin: '0px 0px -15% 0px', threshold: 0.01 }); // ≈ "top 85%"

    targets.forEach(function (el) { io.observe(el); });
  }
  initReveal();

  /* ------------------------------------------------------------------------
     4. Parallax — decorative layers only, rAF-throttled, ≤12% delta
     motion.csv#13. Never applied to text or interactive controls.
     ------------------------------------------------------------------------ */
  function initParallax() {
    var layers = $$('[data-parallax]');
    if (!layers.length || reduceMotion.matches) return;
    if (window.innerWidth < 768) return;   // skip on phones: cost > benefit

    var ticking = false;

    function update() {
      var vh = window.innerHeight;
      layers.forEach(function (layer) {
        var rect = layer.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        var amount = parseFloat(layer.getAttribute('data-parallax')) || 8;
        var progress = (rect.top + rect.height / 2 - vh / 2) / vh;   // -1 … 1
        var shift = -progress * amount;
        layer.style.transform = 'translate3d(0,' + shift.toFixed(2) + '%,0)';
      });
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }
  initParallax();

  /* ------------------------------------------------------------------------
     4b. Menu — rendered from assets/data/menu.json
     The owner edits that file through admin/menu-editor.html, so nobody has
     to open HTML to change a price. The same data also fills a schema.org
     Menu block, which is the machine-readable form search engines want.
     ------------------------------------------------------------------------ */
  function initMenu() {
    var mount = $('#menu-mount');
    if (!mount) return;
    var lang = document.documentElement.lang === 'en' ? 'en' : 'el';
    var t = window.INSTAMAM_I18N || {};

    // Database first, static file second.
    //
    // The JSON file is not dead weight — it is the safety net. A free-tier
    // Supabase project sleeps after about a week idle, and a sleeping
    // database must never blank the menu for a customer standing outside.
    // So: try Postgres, and on ANY failure (paused, offline, slow, error)
    // fall back to the file that ships with the site. The visitor sees a
    // menu either way; only staleness differs.
    var staticSrc = mount.getAttribute('data-src');

    function fromStatic(reason) {
      return fetch(staticSrc, { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (data) {
          data.source = 'static:' + reason;
          renderMenu(data, lang, mount, t);
        })
        .catch(function () {
          mount.innerHTML = '<p class="menu__fallback">' +
            (t.menuFail || 'Menu unavailable.') + '</p>';
        });
    }

    if (window.INSTAMAM_DATA) {
      window.INSTAMAM_DATA.loadMenu()
        .then(function (data) {
          if (!data.categories || !data.categories.length) throw new Error('empty');
          renderMenu(data, lang, mount, t);
        })
        .catch(function (e) { fromStatic(e && e.message === 'timeout' ? 'timeout' : 'db-unavailable'); });
    } else {
      fromStatic('no-client');
    }
  }

  function renderMenu(data, lang, mount, t) {
    var cats = (data.categories || []).filter(function (c) { return c.items && c.items.length; });
    if (!cats.length) return;

    var tablist = document.createElement('div');
    tablist.className = 'tabs';
    tablist.setAttribute('role', 'tablist');
    tablist.setAttribute('aria-label', t.menuCats || 'Menu categories');

    var panels = document.createElement('div');

    cats.forEach(function (cat, i) {
      var tab = document.createElement('button');
      tab.className = 'tab';
      tab.type = 'button';
      tab.setAttribute('role', 'tab');
      tab.id = 'tab-' + cat.id;
      tab.setAttribute('aria-controls', 'panel-' + cat.id);
      tab.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      tab.setAttribute('tabindex', i === 0 ? '0' : '-1');
      tab.textContent = cat[lang] || cat.el;
      tablist.appendChild(tab);

      var panel = document.createElement('div');
      panel.className = 'menu__panel';
      panel.setAttribute('role', 'tabpanel');
      panel.id = 'panel-' + cat.id;
      panel.setAttribute('aria-labelledby', 'tab-' + cat.id);
      panel.setAttribute('tabindex', '0');
      if (i !== 0) panel.setAttribute('hidden', '');

      var list = document.createElement('div');
      list.className = 'menu__list';
      list.setAttribute('data-reveal-group', '');

      cat.items.forEach(function (item) {
        var row = document.createElement('div');
        row.className = 'dish';
        row.setAttribute('data-reveal', '');

        var name = document.createElement('span');
        name.className = 'dish__name';
        name.textContent = item[lang] || item.el || '';

        var price = document.createElement('span');
        price.className = 'dish__price';
        price.textContent = (item.price || '').trim() ? formatPrice(item.price) : '—';

        row.appendChild(name);
        row.appendChild(price);

        var desc = lang === 'en' ? item.dEn : item.dEl;
        if (desc && desc.trim()) {
          var d = document.createElement('span');
          d.className = 'dish__desc';
          d.textContent = desc;
          row.appendChild(d);
        }
        list.appendChild(row);
      });

      panel.appendChild(list);
      panels.appendChild(panel);
    });

    mount.innerHTML = '';
    mount.appendChild(tablist);
    mount.appendChild(panels);

    injectMenuSchema(data, lang);
    initTabs();
    initReveal();          // the new rows need observing
  }

  function formatPrice(p) {
    p = String(p).trim();
    if (!p) return '—';
    return /[€$]/.test(p) ? p : p + ' €';
  }

  // schema.org Menu — how search engines read a restaurant menu properly
  function injectMenuSchema(data, lang) {
    try {
      var sections = (data.categories || []).filter(function (c) { return c.items && c.items.length; })
        .map(function (c) {
          return {
            '@type': 'MenuSection',
            'name': c[lang] || c.el,
            'hasMenuItem': c.items.map(function (it) {
              var m = { '@type': 'MenuItem', 'name': it[lang] || it.el };
              var d = lang === 'en' ? it.dEn : it.dEl;
              if (d) m.description = d;
              var pr = String(it.price || '').replace(',', '.').replace(/[^\d.]/g, '');
              if (pr) m.offers = { '@type': 'Offer', 'price': pr, 'priceCurrency': 'EUR' };
              return m;
            })
          };
        });
      if (!sections.length) return;
      var s = document.createElement('script');
      s.type = 'application/ld+json';
      s.textContent = JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Menu',
        'name': 'Insta.mam Meze Bar', 'hasMenuSection': sections
      });
      document.head.appendChild(s);
    } catch (e) { /* schema is a bonus, never break the page for it */ }
  }
  initMenu();

  /* ------------------------------------------------------------------------
     5. Menu tabs — full keyboard support per WAI-ARIA tabs pattern
     ------------------------------------------------------------------------ */
  function initTabs() {
    var tablist = $('[role="tablist"]');
    if (!tablist) return;
    var tabs = $$('[role="tab"]', tablist);

    function select(tab, focus) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute('aria-selected', selected ? 'true' : 'false');
        t.setAttribute('tabindex', selected ? '0' : '-1');
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) {
          if (selected) { panel.removeAttribute('hidden'); }
          else { panel.setAttribute('hidden', ''); }
        }
      });
      if (focus) tab.focus();
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var i = tabs.indexOf(tab);
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
  }
  initTabs();

  /* ------------------------------------------------------------------------
     6. Gallery lightbox
     ------------------------------------------------------------------------ */
  function initLightbox() {
    var box = $('.lightbox');
    if (!box || typeof box.showModal !== 'function') return;
    var boxImg = $('.lightbox__img', box);
    var closeBtn = $('.lightbox__close', box);
    var prevBtn = $('.lightbox__nav--prev', box);
    var nextBtn = $('.lightbox__nav--next', box);
    var counter = $('.lightbox__count', box);
    var caption = $('.lightbox__caption', box);
    var shots = $$('.shot');
    var lastFocus = null;
    var idx = 0;

    function show(i, dir) {
      idx = (i + shots.length) % shots.length;
      var img = $('img', shots[idx]);
      if (!img) return;

      if (!reduceMotion.matches && dir) {
        boxImg.style.animation = 'none';
        // reflow so the animation restarts on every step
        void boxImg.offsetWidth;
        boxImg.style.animation = 'lbIn' + (dir > 0 ? 'Next' : 'Prev') + ' 320ms var(--ease-out)';
      }
      boxImg.src = img.currentSrc || img.src;
      boxImg.alt = img.alt || '';
      if (caption) caption.textContent = img.alt || '';
      if (counter) counter.textContent = (idx + 1) + ' / ' + shots.length;

      var single = shots.length < 2;
      if (prevBtn) prevBtn.hidden = single;
      if (nextBtn) nextBtn.hidden = single;

      // keep the neighbour warm so stepping feels instant
      var nxt = $('img', shots[(idx + 1) % shots.length]);
      if (nxt) { var pre = new Image(); pre.src = nxt.currentSrc || nxt.src; }
    }

    // Shared-element morph: the thumbnail physically grows into the viewer
    // rather than one fading out while another fades in. Native View
    // Transitions where available; a plain open everywhere else.
    var canMorph = typeof document.startViewTransition === 'function' && !reduceMotion.matches;

    function openAt(i, shot) {
      lastFocus = shot;
      if (!canMorph) { show(i, 0); box.showModal(); return; }

      var thumb = $('img', shot);
      thumb.style.viewTransitionName = 'shot-morph';
      boxImg.style.viewTransitionName = 'shot-morph';

      var vt = document.startViewTransition(function () {
        show(i, 0);
        box.showModal();
      });
      vt.finished.finally(function () {
        thumb.style.viewTransitionName = '';
        boxImg.style.viewTransitionName = '';
      });
    }

    function closeMorph() {
      if (!canMorph) { box.close(); return; }
      var shot = shots[idx];
      var thumb = shot && $('img', shot);
      if (thumb) thumb.style.viewTransitionName = 'shot-morph';
      boxImg.style.viewTransitionName = 'shot-morph';
      var vt = document.startViewTransition(function () { box.close(); });
      vt.finished.finally(function () {
        if (thumb) thumb.style.viewTransitionName = '';
        boxImg.style.viewTransitionName = '';
      });
    }

    shots.forEach(function (shot, i) {
      shot.addEventListener('click', function () { openAt(i, shot); });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeMorph);
    if (prevBtn) prevBtn.addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1, -1); });
    if (nextBtn) nextBtn.addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1, 1); });

    box.addEventListener('click', function (e) { if (e.target === box) closeMorph(); });

    box.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(idx + 1, 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1, -1); }
      else if (e.key === 'Escape') {
        // Escape is handled explicitly rather than left to the dialog's native
        // close-watcher. Verified: opening via startViewTransition() stops the
        // watcher being registered — the keydown arrived with defaultPrevented
        // false, no `cancel` event fired, and the dialog stayed open. That
        // leaves a keyboard user with no way out of the viewer.
        e.preventDefault();
        closeMorph();
      }
    });

    // swipe, since this is mostly a phone experience
    var x0 = null, y0 = null;
    box.addEventListener('touchstart', function (e) {
      x0 = e.changedTouches[0].clientX; y0 = e.changedTouches[0].clientY;
    }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      var dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(idx + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) box.close();   // swipe down to dismiss
      x0 = y0 = null;
    }, { passive: true });

    box.addEventListener('close', function () {
      boxImg.removeAttribute('src');
      if (lastFocus) lastFocus.focus();
    });
  }
  initLightbox();

  /* ------------------------------------------------------------------------
     6b. Scroll progress — a hairline showing how far down the page you are
     ------------------------------------------------------------------------ */
  function initProgress() {
    var bar = $('.progress__bar');
    if (!bar) return;
    var ticking = false;
    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)).toFixed(4) + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }
  initProgress();

  /* ------------------------------------------------------------------------
     6c. Hero headline wipe — each line uncovers itself on load.
     Splits into lines only for the animation, then leaves the DOM alone.
     ------------------------------------------------------------------------ */
  function initHeroWipe() {
    var el = $('[data-wipe]');
    if (!el || reduceMotion.matches) return;
    var lines = el.innerHTML.split(/<br\s*\/?>/i)
      .map(function (l) { return l.replace(/<[^>]*>/g, '').trim(); })
      .filter(Boolean);
    if (!lines.length) return;

    // DOM-built, not an innerHTML string: an HTML-parsed style="" is blocked
    // by `style-src 'self'`, which would drop the per-line delay and make all
    // lines wipe at once. CSSOM assignment is exempt from that restriction.
    var frag = document.createDocumentFragment();
    lines.forEach(function (line, i) {
      var outer = document.createElement('span');
      outer.className = 'wipe__line';
      var inner = document.createElement('span');
      inner.className = 'wipe__inner';
      inner.textContent = line;
      inner.style.animationDelay = (140 + i * 90) + 'ms';
      outer.appendChild(inner);
      frag.appendChild(outer);
    });
    el.textContent = '';
    el.appendChild(frag);
  }
  initHeroWipe();

  /* ------------------------------------------------------------------------
     7. Reservation form
     Validation on blur (not keystroke). Errors inline AND in a focusable
     summary. Focus moves to the summary on multi-error submit.
     ------------------------------------------------------------------------ */
  function initForm() {
    var form = $('#reserve-form');
    if (!form) return;

    var summary = $('.form__summary', form);
    var summaryList = $('ul', summary);
    var status = $('.form__status', form);
    var submitBtn = $('button[type="submit"]', form);
    var endpoint = form.getAttribute('data-endpoint') || '';
    var t = window.INSTAMAM_I18N || {};

    function fieldOf(input) { return input.closest('.field'); }

    function messageFor(input) {
      if (input.validity.valueMissing) return input.getAttribute('data-msg-required') || t.required;
      if (input.validity.typeMismatch || input.validity.patternMismatch) {
        return input.getAttribute('data-msg-invalid') || t.invalid;
      }
      if (input.validity.rangeUnderflow || input.validity.rangeOverflow) {
        return input.getAttribute('data-msg-range') || t.invalid;
      }
      return input.validationMessage;
    }

    function validate(input) {
      var wrap = fieldOf(input);
      if (!wrap) return true;
      var errEl = $('.field__error', wrap);
      var ok = input.checkValidity();
      wrap.classList.toggle('is-invalid', !ok);
      input.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (errEl) errEl.textContent = ok ? '' : messageFor(input);
      return ok;
    }

    var inputs = $$('input, select, textarea', form).filter(function (i) { return i.type !== 'hidden'; });
    inputs.forEach(function (input) {
      // Validate on blur, never on keystroke.
      input.addEventListener('blur', function () { validate(input); });
      // Once a field is marked invalid, clear it as soon as it becomes valid.
      input.addEventListener('input', function () {
        var wrap = fieldOf(input);
        if (wrap && wrap.classList.contains('is-invalid') && input.checkValidity()) validate(input);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var invalid = inputs.filter(function (i) { return !validate(i); });

      if (invalid.length) {
        summaryList.innerHTML = '';
        invalid.forEach(function (input) {
          var label = $('label[for="' + input.id + '"]', form);
          var li = document.createElement('li');
          var a = document.createElement('a');
          a.href = '#' + input.id;
          a.textContent = (label ? label.textContent.replace('*', '').trim() : input.name) + ' — ' + messageFor(input);
          a.addEventListener('click', function (ev) { ev.preventDefault(); input.focus(); });
          li.appendChild(a);
          summaryList.appendChild(li);
        });
        summary.classList.add('is-visible');
        // Multi-error → focus the summary. Single → focus the field itself.
        if (invalid.length > 1) { summary.focus(); } else { invalid[0].focus(); }
        return;
      }

      summary.classList.remove('is-visible');

      if (!window.INSTAMAM_DATA) {
        status.setAttribute('data-state', 'err');
        status.textContent = t.noEndpoint || 'Booking is unavailable. Please call us.';
        return;
      }

      submitBtn.disabled = true;
      var original = submitBtn.textContent;
      submitBtn.textContent = t.sending || 'Sending…';
      status.removeAttribute('data-state');
      status.textContent = '';

      // Straight into Postgres in Frankfurt. This replaced FormSubmit, which
      // relayed every booking through a US server — the transfer named in
      // section 6 of the privacy policy. Booking data no longer leaves the EU.
      window.INSTAMAM_DATA.createReservation({
        name: $('#r-name', form).value.trim(),
        phone: $('#r-phone', form).value.trim(),
        date: $('#r-date', form).value,
        time: $('#r-time', form).value,
        people: $('#r-people', form).value,
        note: $('#r-note', form).value.trim()
      }).then(function () {
        form.reset();
        status.setAttribute('data-state', 'ok');
        status.textContent = t.success || 'Request sent.';
      }).catch(function (err) {
        status.setAttribute('data-state', 'err');
        // The flood brake is the one server error worth explaining; anything
        // else stays generic so database internals never reach a visitor.
        status.textContent = (err && err.tooMany)
          ? (t.tooMany || t.failure)
          : (t.failure || 'Could not send. Please call us.');
      }).finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = original;
      });
    });

    // Never allow a reservation in the past.
    var dateInput = $('#r-date', form);
    if (dateInput) {
      var today = new Date();
      var iso = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
        .toISOString().slice(0, 10);
      dateInput.min = iso;
    }
  }
  initForm();

  /* ------------------------------------------------------------------------
     8. Active section in nav
     ------------------------------------------------------------------------ */
  function initScrollSpy() {
    var links = $$('.nav a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;

    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var sec = document.getElementById(id);
      if (sec) map[id] = a;
    });

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var a = map[entry.target.id];
        if (!a) return;
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.removeAttribute('aria-current'); });
          a.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    Object.keys(map).forEach(function (id) { spy.observe(document.getElementById(id)); });
  }
  initScrollSpy();

  /* ------------------------------------------------------------------------
     8b. Live open/closed status
     The day→night concept made functional. Computed in the venue's own
     timezone, not the visitor's — someone checking from London must see
     whether the bar is open in Greece, not in London.

     Stays silent unless hours.json says active:true. Telling a customer
     "open now" when the place is shut is worse than saying nothing.
     ------------------------------------------------------------------------ */
  function initStatus() {
    var mounts = $$('[data-status-mount]');
    if (!mounts.length) return;
    var t = window.INSTAMAM_I18N || {};

    // Same database-first, static-fallback shape as the menu. An unknown
    // state renders nothing at all — silence is always safer here than a
    // wrong "open now".
    var staticSrc = mounts[0].getAttribute('data-src');

    function apply(cfg) {
      if (!cfg || !cfg.active || !cfg.days) return;      // not published yet
      var state = compute(cfg);
      if (!state) return;
      mounts.forEach(function (m) { paint(m, state, t); });
    }

    var load = window.INSTAMAM_DATA
      ? window.INSTAMAM_DATA.loadHours().catch(function () {
          return fetch(staticSrc, { cache: 'no-cache' }).then(function (r) {
            return r.ok ? r.json() : null;
          });
        })
      : fetch(staticSrc, { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; });

    load.then(apply).catch(function () { /* silent by design */ });

    // "now" in the venue's timezone, as minutes-since-midnight + weekday
    function venueNow(tz) {
      try {
        var f = new Intl.DateTimeFormat('en-GB', {
          timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
        });
        var parts = {};
        f.formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
        var map = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };
        var h = parseInt(parts.hour, 10) % 24;
        return { day: map[parts.weekday], mins: h * 60 + parseInt(parts.minute, 10) };
      } catch (e) {
        var d = new Date();
        return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
      }
    }

    function toMins(s) {
      var p = String(s).split(':');
      return parseInt(p[0], 10) * 60 + parseInt(p[1] || '0', 10);
    }

    function compute(cfg) {
      var now = venueNow(cfg.timezone || 'Europe/Athens');
      var today = cfg.days[String(now.day)];
      var yday = cfg.days[String((now.day + 6) % 7)];

      // Yesterday's session may still be running past midnight.
      if (yday && yday !== 'closed' && yday.length === 2) {
        var yo = toMins(yday[0]), yc = toMins(yday[1]);
        if (yc <= yo && now.mins < yc) {
          return { open: true, until: yday[1] };
        }
      }
      if (!today || today === 'closed' || today.length !== 2) {
        return { open: false, next: nextOpening(cfg, now) };
      }
      var o = toMins(today[0]), c = toMins(today[1]);
      var overnight = c <= o;
      var isOpen = overnight ? (now.mins >= o) : (now.mins >= o && now.mins < c);
      if (isOpen) return { open: true, until: today[1] };
      if (now.mins < o) return { open: false, next: today[0], soon: o - now.mins <= 60 };
      return { open: false, next: nextOpening(cfg, now) };
    }

    function nextOpening(cfg, now) {
      for (var i = 1; i <= 7; i++) {
        var d = cfg.days[String((now.day + i) % 7)];
        if (d && d !== 'closed' && d.length === 2) return d[0];
      }
      return null;
    }

    function paint(mount, s, t) {
      var el = document.createElement('span');
      el.className = 'status-pill ' + (s.open ? 'is-open' : 'is-shut');
      var dot = document.createElement('i');
      dot.setAttribute('aria-hidden', 'true');
      var txt = document.createElement('span');

      if (s.open) {
        txt.textContent = (t.openNow || 'Open now') +
          (s.until ? ' · ' + (t.until || 'until') + ' ' + s.until : '');
      } else if (s.next) {
        txt.textContent = (t.closedNow || 'Closed') + ' · ' +
          (t.opensAt || 'opens') + ' ' + s.next;
      } else {
        txt.textContent = t.closedNow || 'Closed';
      }
      el.appendChild(dot);
      el.appendChild(txt);
      // Announced politely; it is status, not an alert, and must not steal focus.
      el.setAttribute('role', 'status');
      mount.innerHTML = '';
      mount.appendChild(el);
      mount.removeAttribute('hidden');
    }
  }
  initStatus();

  /* ------------------------------------------------------------------------
     9. Highlight today in the hours table
     ------------------------------------------------------------------------ */
  function initToday() {
    var rows = $$('.hours tr[data-day]');
    if (!rows.length) return;
    var today = new Date().getDay();          // 0 = Sunday
    rows.forEach(function (row) {
      if (parseInt(row.getAttribute('data-day'), 10) === today) {
        row.setAttribute('data-today', '');
      }
    });
  }
  initToday();

})();
