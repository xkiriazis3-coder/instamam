# Insta.mam — Meze Bar, Λαγκαδίκια

Bilingual one-page site. Static HTML, CSS and vanilla JavaScript — no build
step, no dependencies, no framework.

```
site/                  ← this is what you upload
  index.html           Greek  (/)
  en/index.html        English (/en/)
  assets/css/style.css design tokens + all styles
  assets/js/main.js    ~250 lines, zero dependencies
  assets/img/          placeholder art — replace with real photos
  content-guide.md     ← START HERE: what's missing and where it goes

design-system/instamam/
  MASTER.md            colour, type, motion and layout rules + reasoning
```

## Preview locally

```bash
python -m http.server 5180 --directory site
```

## Deploy

Drag the `site` folder onto [app.netlify.com/drop](https://app.netlify.com/drop),
or upload the *contents* of `site/` into `public_html/` on normal hosting.
Nothing runs server-side.

## Status

Built and verified: layout at 375 / 768 / 1440, all 45 tap targets ≥44px,
no horizontal overflow, Greek fonts loading their Greek subsets, menu tabs
keyboard-navigable, form validation with linked error summary.

Not yet real: address, opening hours, menu and prices, photography, logo file,
and the form has no delivery address. All are listed in
[`site/content-guide.md`](site/content-guide.md), and every placeholder in the
markup is wrapped in `⟨ ⟩` so a search for `⟨` finds them all.
