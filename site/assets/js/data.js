/* ==========================================================================
   Insta.mam — data layer

   Talks to Supabase over plain REST. No SDK: the official client is ~40KB
   and everything needed here is four fetch calls, so pulling a library would
   cost more than it saves and would have to be self-hosted anyway to keep
   the zero-third-party-script posture.

   THE PUBLISHABLE KEY BELOW IS NOT A SECRET. It identifies the project and
   nothing more. Every protection lives in Row Level Security on the server:
   the public role may read the menu and insert a booking, and may not read
   bookings back. Verified by direct API test — an anonymous SELECT on
   reservations returns 401. Do not add privileges to this key to "make
   something work"; fix the policy instead.
   ========================================================================== */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://hoylfyfyishcfjteozcj.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_d47cYwqW9Hp3nzMdFcE-2w_CqFVYwuX';

  var REST = SUPABASE_URL + '/rest/v1/';

  function headers(extra) {
    var h = {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY
    };
    for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) h[k] = extra[k];
    return h;
  }

  // A paused free-tier project, a flat connection or a slow edge must never
  // leave the page hanging. Everything below is time-boxed, and every caller
  // has a static fallback.
  function withTimeout(promise, ms) {
    return new Promise(function (resolve, reject) {
      var t = setTimeout(function () { reject(new Error('timeout')); }, ms);
      promise.then(function (v) { clearTimeout(t); resolve(v); },
                   function (e) { clearTimeout(t); reject(e); });
    });
  }

  function get(path, ms) {
    return withTimeout(
      fetch(REST + path, { headers: headers(), cache: 'no-store' })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        }),
      ms || 6000
    );
  }

  /* ----------------------------------------------------------------------
     MENU
     Returns the same shape the site already renders, so the view layer did
     not have to change: { categories: [ { id, el, en, items: [...] } ] }
     ---------------------------------------------------------------------- */
  function loadMenu() {
    var cats = get('menu_categories?select=id,slug,name_el,name_en&visible=eq.true&order=position');
    var items = get('menu_items?select=category_id,name_el,name_en,desc_el,desc_en,price,position&visible=eq.true&order=position');

    return Promise.all([cats, items]).then(function (res) {
      var categories = res[0], rows = res[1];
      var byCat = {};
      rows.forEach(function (r) { (byCat[r.category_id] = byCat[r.category_id] || []).push(r); });

      return {
        source: 'supabase',
        categories: categories.map(function (c) {
          return {
            id: c.slug,
            el: c.name_el,
            en: c.name_en,
            items: (byCat[c.id] || []).map(function (r) {
              return {
                el: r.name_el, en: r.name_en,
                dEl: r.desc_el || '', dEn: r.desc_en || '',
                // numeric in the database, comma-decimal for Greek display
                price: r.price === null ? '' : String(r.price).replace('.', ',')
              };
            })
          };
        })
      };
    });
  }

  /* ----------------------------------------------------------------------
     HOURS
     hours_published gates the availability badge. While it is false the
     site shows nothing rather than risk announcing "open" while shut.
     ---------------------------------------------------------------------- */
  function loadHours() {
    return Promise.all([
      get('opening_hours?select=day_of_week,opens_at,closes_at,is_closed&order=day_of_week'),
      get('site_settings?select=hours_published&limit=1')
    ]).then(function (res) {
      var rows = res[0], settings = res[1];
      var days = {};
      rows.forEach(function (r) {
        days[String(r.day_of_week)] = r.is_closed
          ? 'closed'
          : [String(r.opens_at).slice(0, 5), String(r.closes_at).slice(0, 5)];
      });
      return {
        source: 'supabase',
        active: !!(settings[0] && settings[0].hours_published),
        timezone: 'Europe/Athens',
        days: days
      };
    });
  }

  /* ----------------------------------------------------------------------
     RESERVATION
     `return=minimal` is required, not stylistic: anon holds INSERT but
     deliberately NOT SELECT, so asking for the row back makes PostgREST
     attempt INSERT ... RETURNING and the whole request fails with 401.
     Verified — with representation it 401s, with minimal it returns 201.
     ---------------------------------------------------------------------- */
  function createReservation(data) {
    return withTimeout(
      fetch(REST + 'reservations', {
        method: 'POST',
        headers: headers({
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        }),
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          booking_date: data.date,
          booking_time: data.time,
          people: parseInt(data.people, 10) || null,
          note: data.note || null
        })
      }).then(function (r) {
        if (r.status === 201) return { ok: true };
        return r.text().then(function (t) {
          var msg = '';
          try { msg = (JSON.parse(t).message || ''); } catch (e) { msg = ''; }
          // Surface the flood brake distinctly; everything else is generic,
          // so database internals are never shown to a visitor.
          var e = new Error(msg);
          e.status = r.status;
          e.tooMany = /Too many pending/i.test(msg);
          throw e;
        });
      }),
      12000
    );
  }

  window.INSTAMAM_DATA = {
    loadMenu: loadMenu,
    loadHours: loadHours,
    createReservation: createReservation,
    url: SUPABASE_URL
  };
})();
