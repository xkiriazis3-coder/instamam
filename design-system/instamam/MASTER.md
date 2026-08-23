# MASTER — Insta.mam Meze Bar, Λαγκαδίκια (Θεσσαλονίκη)

Global source of truth. Page files in `pages/` override this; anything not
overridden comes from here.

**Revision note.** An earlier draft of this document specified a warm
cream / olive / brass palette with EB Garamond, on the assumption of a rustic
village taverna. The logo and interior photograph showed something else
entirely — midnight navy, red accent, marble, wood slats, track lighting, a
full cocktail bar. That direction was discarded, not adapted. What follows is
built from the actual brand assets.

---

## 1. Product profile

| Field | Value |
|---|---|
| Name | Insta.mam — Meze Bar |
| Type | All-day café → evening meze bar & cocktail bar |
| Location | Λαγκαδίκια, Θεσσαλονίκη |
| Phone | 23930 23176 / +30 23930 23176 |
| Social | instagram.com/instamam_mezebar · facebook (profile 100087998074640) |
| Audience | Locals + Thessaloniki drive-outs; evening-weighted |
| Primary device | Mid-range Android on mobile data |
| Languages | Greek (default, `/`) + English (`/en/`) |
| Primary goal | Reservation |
| Secondary | Phone tap, menu read, directions, Instagram follow |

---

## 2. Two recorded deviations from the dataset

The `--design-system` CLI was run twice and neither result was usable as-is.
Both are recorded here rather than silently discarded.

**Run 1** — `"meze bar cocktail lounge modern dark elegant"` returned
*Minimalism & Swiss Style* with a trust-blue SaaS palette (`#2563EB`, background
`#F8FAFC`) and "Best for: enterprise apps, dashboards, documentation sites."
The adjectives pulled the match into the enterprise cluster. Rejected.

**Run 2** — `"restaurant bar nightlife reservation menu"` returned the
Restaurant/Food Service profile: *Vibrant & Block-based*, `#DC2626` on a pink
`#FEF2F2` background, pattern *Funnel (3-Step Conversion)*, heading font
**Playfair Display SC**. Three separate problems: the funnel pattern is a SaaS
conversion flow, not a venue page; the pink-and-red palette belongs to delivery
apps; and Playfair Display SC has **no Greek glyphs**. Rejected.

Per the skill's query contract, one retry was made and the result still did not
fit, so the visual direction is derived from the brand assets instead, and
labelled as such. What *was* taken from the dataset and applied directly:

- `styles.csv` → **Dark Mode (OLED)** (midnight blue `#0A0E27`) — corroborates
  the wordmark plate
- `styles.csv` → **Exaggerated Minimalism** (oversized type, single accent,
  extreme negative space) — matches the script wordmark and the room
- `landing.csv#1` → **Hero + Features + CTA** section order
- `motion.csv` rows 5 / 8 / 13 → reveal, stagger and parallax timings
- `ux-guidelines.csv` → accessibility and reduced-motion rules

---

## 3. Typography — Greek support is a hard constraint

The standard elegant-restaurant pairing cannot be used here. Verified against
`google-fonts.csv` subsets:

| Font | Greek |
|---|---|
| Playfair Display / Playfair Display SC | **NO** |
| Cormorant, Cormorant Garamond | **NO** |
| Marcellus, Lora, Montserrat, DM Sans, Newsreader, Spectral | **NO** |

A Greek headline set in a font without Greek glyphs falls back silently to a
system serif — different typeface, weight and metrics, on the default language,
above the fold.

### Locked pairing

| Role | Family | Weights | Greek |
|---|---|---|---|
| Display | **GFS Didot** | 400 | greek, greek-ext, latin |
| Body / UI | **Commissioner** | 200–800 variable | greek, latin, latin-ext |

**GFS Didot** is by the Greek Font Society and was drawn for Greek first. Its
high-contrast Didone structure matches the room — marble, sharp lighting,
cool surfaces — where a warm oldstyle face would have fought it. Single weight
is correct for Didone display: hairline contrast wants size, not bold.

**Commissioner** carries everything else. Variable, so one file spans 200–800.

Verified in-browser: both families load exactly two subsets, Greek
(`U+370–3FF`) and Latin. No Cyrillic or Vietnamese is fetched.

### Scale

Fluid `clamp()`. Display 2.75→6.5rem · h1 2→3.25rem · h2 1.5→2.125rem ·
body 1→1.0625rem (never below 16px on mobile) · eyebrow 0.75rem/0.18em tracking.
Line height 1.65 body, 1.15 display. Measure ≤68ch. Prices `tabular-nums`.

---

## 4. Colour — dark-committed, every pair verified

This is not a light theme with a dark option. The mark is a midnight plate and
the room is low-lit; a light mode would be a different brand. Single committed
palette, painted explicitly.

| Token | Hex | Ratio on `#0F1623` | Use |
|---|---|---|---|
| `--bg` | `#0F1623` | — | midnight navy, from the wordmark plate |
| `--bg-deep` | `#0A0F19` | — | alternating bands, footer |
| `--surface` | `#161E2E` | — | cards |
| `--surface-hi` | `#1D273A` | — | raised / hover |
| `--text` | `#F4F6FA` | **16.74:1** | body |
| `--muted` | `#AEB6C4` | **8.87:1** | secondary |
| `--muted-dim` | `#8E97A8` | **6.16:1** | captions |
| `--red` | `#D9243C` | 3.68:1 | **fills and rules only** |
| `--red-deep` | `#C0182E` | — | button hover |
| `--red-text` | `#F06A7E` | **6.10:1** | red *as text* |
| `--oak` | `#C79A6B` | **7.13:1** | eyebrows, icons, focus ring |
| `--oak-hi` | `#D9B48A` | **9.36:1** | prices, emphasis |
| `--line` | `#232E42` | 1.32:1 | decorative dividers only |
| `--line-strong` | `#5A6B85` | **3.34:1** | input borders, real boundaries |

Reverse: white on `--red` **4.92:1** · `--text` on `--red-deep` **5.69:1**.

**The red trap.** `--red` is the logo's accent and the obvious choice for
headings — but at 3.68:1 it fails AA for normal text. It is a fill and a rule.
Red that must *be* text uses `--red-text` (6.10:1). Red carries no meaning
alone anywhere on the site.

Red is used sparingly on purpose: the divider rule in the eyebrow, the primary
button, the active tab underline, the nav underline. Against this much navy a
little goes a long way — that restraint is what reads as expensive.

---

## 4b. The concept — a page that travels

The one true thing about this venue is that it lives twice in a day: coffee at
nine, cocktails at one. So the page moves through it. It opens in espresso
browns and cools to midnight blue by the time you reach the bar. The palette
is the product, not decoration on top of it.

Implemented in `atmosphere.js` — four stops anchored to real section offsets,
eased between, written to CSS custom properties on `:root` from one
rAF-throttled scroll handler.

| Stop | `--bg` | Reads as |
|---|---|---|
| `#steki` | `#1A1410` | espresso, morning |
| `#menu` | `#15151B` | neutral, afternoon |
| `#events` | `#0F1623` | navy, evening |
| `#reserve` | `#0A0F19` | midnight |

**Verified across the whole journey, not just at the stops:** sampled at 21
scroll positions, worst body-text contrast **16.73:1**, worst muted **8.78:1**.
The travelling palette never costs readability.

The hero scrim and the photograph's grade are tied to the same variables via
`color-mix()`, so the room itself warms at the top of the page. A fixed navy
scrim over an espresso-toned page reads as a bug rather than a decision.
Re-measured after the grade: nav **9.61:1**, logo area **16.54:1**, hero
tagline **5.02:1** — the tagline is the tightest point on the page and still
clears AA.

### Other atmosphere

- **Grain** — one SVG turbulence tile at 3.5% opacity. Does more for perceived
  quality than any gradient work. Animated on desktop only: a full-screen
  composite running forever is a battery tax on the phones that are most of
  this audience. `inset` kept at `-8%`; an earlier `-120%` made the layer ~3.4×
  the viewport per axis for no visible gain.
- **Cursor** — lagging ring plus dot, swells over interactive targets.
  `pointer: fine` and ≥1024px only. It is an addition to the native cursor,
  never a replacement, so nothing is lost if it fails.
- **Magnetic CTAs** — ≤14px displacement, so the button never leaves its own
  hit area and the thing you aimed at stays the thing you click.
- **Word reveal** — section headings rise word by word. Split on spaces only,
  never characters, so screen readers still read words and Greek stays intact;
  `aria-label` preserves the original string. Same watchdog pattern as the
  scroll reveal.
- **Marquee** — one oversized typographic breath between gallery and events,
  outlined GFS Didot with every third word filled. `aria-hidden`, since it
  repeats content stated elsewhere.

### Advanced layer

- **View Transitions** — `@view-transition { navigation: auto }` gives Greek ↔
  English a cross-fade instead of a white blink, natively and off the main
  thread. The gallery thumbnail also gets a real shared-element morph into the
  viewer via `view-transition-name`, rather than one image fading out while
  another fades in. Entirely absent in browsers without support: nothing to
  polyfill, nothing to break.
- **Scroll-driven CSS** — under `@supports (animation-timeline: view())` the
  eyebrow slide and the story-image drift run on the compositor instead of
  through IntersectionObserver. The JS path remains the fallback, so this is
  purely additive and cannot desync from scroll position.
- **Live open/closed status** — the day→night concept made functional.
  Computed in **the venue's** timezone via `Intl.DateTimeFormat`, not the
  visitor's, so someone checking from London sees whether the bar is open in
  Greece. Handles sessions running past midnight by checking yesterday's
  window first. Announced with `role="status"`, never stealing focus.

  **Gated behind `active: false` in `hours.json` until the times are real.**
  Telling a customer "open now" when the place is shut is worse than showing
  nothing. Verified end-to-end against the live clock at Athens Mon 00:47:
  Sunday's 09:00–02:00 session correctly reported *"Ανοιχτά τώρα · μέχρι
  02:00"*, and with Sunday set to closed it correctly fell through to
  *"Κλειστά · ανοίγουμε 08:00"*.

**Deliberately not built: momentum smooth-scroll.** It is most of what makes
an award-site *feel* different, and it is also the most common way those sites
feel broken — it fights trackpads, hurts on phones, and breaks find-in-page.
Scroll-jacking is already in the rejected list below; adding a softer version
of it would be inconsistent. The premium feel here comes from scroll-driven
choreography instead, which costs the user nothing.

## 5. Layout

4px base: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`.
Gutter 20 / 32 / 48. Container 1180px. Radius 3px controls, 5px cards.

Breakpoints **375 · 640 · 768 · 1024 · 1440**, mobile-first, `min-width` only.

Tight radii are deliberate — 16px rounding reads as a SaaS product. Sharp
corners plus large negative space is the "Exaggerated Minimalism" lever.

Hero uses `min-height: 100dvh`, never `100vh`.
All `section[id]` carry `scroll-margin-top` so the sticky header never covers a
focused or anchored target (WCAG 2.2 *focus-not-obscured*).

---

## 6. Motion

`motion.csv` rows 5 / 8 / 13, implemented in **CSS + IntersectionObserver**.
Same timings and easings as the GSAP presets, zero third-party JS.

| Token | Value |
|---|---|
| `--dur-fast` | 180ms (hover, press) |
| `--dur-base` | 320ms (state change) |
| `--dur-reveal` | 520ms (`motion.csv#5`: 400–600ms) |
| `--dur-exit` | 220ms (~65% of enter) |
| `--ease-out` | `cubic-bezier(0.215, 0.61, 0.355, 1)` ≈ `power2.out` |
| `--stagger` | 80ms per child, **capped at 8** |

Choreography: hero image settles 1.06→1.0 over 1400ms once · sections rise 24px
over 520ms at 85% viewport · menu rows stagger 80ms, first 8 only · parallax
≤12% on decorative layers, desktop only, rAF-throttled · tab underline wipes ·
header fades to blurred navy past 80px.

### Rules

- `transform` and `opacity` only. Never width/height/top/left.
- Final state is the CSS **default**; the `.reveal` class removes it. JS
  disabled → page fully readable.
- **Watchdog**: if JS runs but the observer never delivers, everything hidden is
  force-shown after 2.5s. Hiding content behind an observer without this is a
  silent blank-page failure mode.
- Parallax never on text or controls.
- 1–2 animated ideas per viewport.

### Reduced motion

All entrance, parallax and hero motion off; final state immediate. Colour
feedback on hover, press and focus is **retained** — reduced motion means no
vestibular motion, not a dead interface.

---

## 7. Sections

| # | id | Greek | English |
|---|---|---|---|
| 0 | — | Sticky header + scroll progress | Sticky header |
| 1 | — | Hero `100dvh`, headline wipe | Hero |
| 2 | `steki` | Το στέκι | The place |
| 3 | `menu` | Μενού (6 tabs, from JSON) | Menu |
| 4 | `choros` | Ο χώρος (lightbox) | The room |
| 5 | `events` | Εκδηλώσεις | Events |
| 6 | `visit` | Πού θα μας βρεις | Find us |
| 7 | `reserve` | Κράτηση | Booking |
| 8 | — | Footer | Footer |

Plus `404.html` and `admin/menu-editor.html` (noindex, unlinked).

### Menu as data

The menu renders from `assets/data/menu.json`, edited through
`admin/menu-editor.html` — a self-contained editor that reads the JSON, offers
a two-language row per dish, and exports a replacement file. It exists because
the biggest structural failure mode for a restaurant site is a menu the owner
cannot change: prices drift, the site goes stale, and nobody edits HTML to fix
it.

Tradeoff accepted knowingly: the menu is client-rendered, so it is not in the
initial HTML. Mitigated by a `<noscript>` block carrying the phone number, and
by emitting a schema.org `Menu` with `MenuSection`/`MenuItem`/`Offer` built
from the same data — which is the form search engines actually want, rather
than scraped prose. `#menu-mount` reserves `min-height` so the section does not
collapse and snap open on load.

One primary CTA per viewport. Reserve is the only `--red` fill; everything else
is ghost or text. Phone sits at equal weight beside it — for a venue outside the
city, tap-to-call is a first-class action, not a fallback.

---

## 8. Stack

Hand-authored static HTML + CSS + vanilla JS. No build, no dependencies.
Two real routes (`/`, `/en/`) rather than a JS toggle, so both languages get
`hreflang` pairing, independent indexing and shareable links.

Node 24 and Python 3.14 are both present on the build machine, so a bundler was
available and deliberately not used: for a one-page site the entire behaviour
set is ~250 lines of vanilla JS, and a no-build deliverable drops onto any host
including basic cPanel, with nothing to rot in eighteen months.

`Restaurant` JSON-LD on both routes with phone, geo, socials and
`acceptsReservations`. For a venue outside the city this block does more
commercial work than any section on the page — it is what populates the Google
side panel.

Budget: LCP < 2.0s on 4G · CLS < 0.1 · JS < 15KB · hero < 180KB.

---

## 9. Accessibility floor

- Contrast per §4; functional pairs ≥4.5:1, boundaries ≥3:1
- Focus ring 2px `--oak` + 3px offset, never removed
- Touch targets ≥44px (inputs 50px, buttons 48px), ≥8px apart
- Menu tabs implement the full WAI-ARIA pattern: roving tabindex,
  ←/→/Home/End, `aria-selected`, panels toggled by `hidden`
- Form: visible labels, blur-not-keystroke validation, inline errors wired via
  `aria-describedby`, focusable `role="alert"` summary, focus to summary on
  multi-error submit and to the field on single-error
- `role="status" aria-live="polite"` for submit feedback; never steals focus
- Skip link, sequential headings, one h1 per route
- `lang` correct per route; switcher labelled in both languages
- Lightbox uses native `<dialog>`: Escape closes, focus returns to trigger

---

## 10. Anti-patterns — explicitly rejected

| Rejected | Why |
|---|---|
| Playfair Display / Cormorant | No Greek glyphs — silent fallback on the default language |
| Trust-blue SaaS palette (CLI run 1) | Enterprise dashboard cluster; wrong product |
| Pink/red delivery palette (CLI run 2) | Ordering-app urgency; wrong for a sit-down bar |
| Funnel 3-step pattern (CLI run 2) | SaaS conversion flow, not a venue page |
| Light mode | The mark is a midnight plate; a light theme is a different brand |
| Red as body text | 3.68:1 — fails AA. Fills and rules only |
| PDF menu | Unreadable on mobile, invisible to search. The worst pattern in restaurant web |
| Autoplaying video with sound | Bandwidth, autoplay policies, hostile on mobile data |
| Carousel hero | Nobody sees slide 2 |
| Scroll-jacking | Nausea, breaks find-in-page and keyboard scroll |
| Parallax on text | `motion.csv#13` |
| Emoji as icons | Font-dependent, unstyleable |
| Placeholder-only labels | Label vanishes on input |
| Hover-only reveals | No hover on touch |
| `100vh` hero | Mobile browser chrome clips it |
| >8 staggered children | Tail feels laggy (`motion.csv#5`) |
| Reveal with no watchdog | Silent blank page if the observer never fires |
| Transparent header over a photo with no scrim | Measured 2.5:1 on nav text — the room's ceiling is near-white. Fixed with a dedicated 168px header gradient that fades out once the header gains its own background; re-measured at 7.71:1 |
| `<picture>` wrapper without `width/height: 100%` | `<picture>` defaults to `height: auto`, so an `<img>` with `height: 100%` inside one resolves against the **wrapper**, not the sized ancestor. The box then matches the photo's own aspect ratio and `object-fit: cover` silently never engages — at 1885×910 the image rendered 1885×**2356** and only the top slice (all ceiling) was visible. Introduced by the WebP change and missed because verification checked *which file was served*, not the rendered geometry. `.hero__media picture { display:block; width:100%; height:100% }` is load-bearing. **Assert `imgBox ≈ container`, not just `currentSrc`.** |
| Purely vertical hero scrim | The gradient was heaviest at the bottom — exactly where the headline sits — which buried the half of the photograph worth showing. On desktop the scrim is now weighted **horizontally**: heavy behind the copy on the left, near-transparent over the bar on the right. Re-measured on real glyph boxes (`Range.getBoundingClientRect`, not block boxes): wordmark 5.49:1, tagline 9.99:1, eyebrow 5.91:1 |
| Measuring text contrast against an element's **block** box | A full-width `<h1>` reports its worst pixel from empty space metres from any glyph — the wordmark read 1.51:1 when the truth was 3.89:1. Always measure the text range |
| Unversioned CSS/JS on static hosting | Ship a fix, returning visitors keep the old file for as long as their cache holds. All `<link>`/`<script>` URLs carry `?v=YYYYMMDDNN`; **bump it whenever css or js changes** |
| Default-cached `fetch` for owner-editable data | `menu.json` and `hours.json` are edited to change prices and opening times. A cached copy means customers see last month's menu. Both fetches use `cache: 'no-cache'` — revalidates every load, cheap 304 when unchanged, never stale |
| `display` on a `<dialog>` without a `:not([open])` guard | Author rules beat the UA's `dialog:not([open]){display:none}`, so `.lightbox{display:grid}` left the **closed** dialog laid out: full-viewport, `z-index:300`, `pointer-events:auto` — an invisible sheet swallowing every click on the page. Invisible to DOM assertions because programmatic `.click()` skips hit-testing; only `elementFromPoint` and a screenshot exposed it. `.lightbox:not([open]){display:none}` is load-bearing |

---

## 11. Outstanding

Blocking a real launch: **street address + postcode**, **opening hours**,
**the real menu with prices**, **real photography**, **the logo file**, and an
**email address** (the reservation form currently has nowhere to deliver).

See `site/content-guide.md` for exactly which lines to edit.
