---
name: Mehedi Hasan, portfolio
description: A dark, calm engineer's dashboard in one cyan accent; themes swap colours, never shapes.
colors:
  bg: "#0b1120"
  surface: "#101a2e"
  surface-2: "#17223a"
  surface-3: "#202d49"
  line: "#1d2a45"
  line-strong: "#2b3b5e"
  ink: "#f8fafc"
  ink-2: "#cbd5e1"
  ink-3: "#94a3b8"
  brand: "#00f2fe"
  brand-2: "#4facfe"
  on-brand: "#0b1120"
  whatsapp: "#22c55e"
typography:
  display:
    fontFamily: "Poppins, sans-serif"
    fontSize: "4rem"
    fontWeight: 700
    lineHeight: 1.2
  subtitle:
    fontFamily: "Poppins, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontFamily: "Poppins, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Poppins, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Fira Code, monospace"
    fontSize: "12.5px"
    fontWeight: 600
    letterSpacing: "0.04em"
rounded:
  chip: "6px"
  row: "10px"
  menu: "14px"
  list: "16px"
  tile: "22px"
  portrait: "26px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.on-brand}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
  button-secondary:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "10px 16px"
  header-button:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "40px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    padding: "22px 24px"
  chip:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.chip}"
    padding: "1px 8px"
  menu-row:
    textColor: "{colors.ink}"
    rounded: "{rounded.row}"
    height: "40px"
    padding: "0 10px"
---

# Design System: Mehedi Hasan, portfolio

## Overview

**Creative North Star: "The quiet control room"**

The site reads like the home page's "At a glance" dashboard and the Profile page: dark navy surfaces, one cyan accent,
hairline borders and plain shadows. It is a working portfolio, so structure beats spectacle: the signature motion is
the dot network behind the home hero, and the one character is the round AI face. Everything else is quiet, flat and
legible. The source of truth in code is the `--pf-*` tokens (and `--accent-ink`, `--accent-active-color`,
`--gradient-accent`, `--shade`) in `docs/style~1f83e8.css` and the nx tokens in `docs/nx/nx.css` (`--bg`, `--surface`,
`--ink`, `--brand`, `--link`, `--on-brand`, `--grad`...); they hold the same values. In `nx.css` a theme block is written
`:root[data-theme="x"]`: the build scopes that to `[data-theme="x"] .nx`, while a bare `[data-theme="x"] .y` would
become `.nx [data-theme="x"] .y` and match nothing.

**Key Characteristics:**
- Dark first (Dark is the default theme), cyan accent, Poppins for words and Fira Code for figures and labels.
- Cards and lists on `surface` with a 1px `line` border; depth from plain dark shadows only.
- Themes differ only by colour tokens: the same shapes, sizes and motion in every theme.

## Colors

One accent per theme, used for links, the current page, figures and the primary button; neutrals carry everything else.

### Primary
- **Electric Cyan** (brand): links, the current tab or nav item, the role line in the hero, filled buttons (as a
  cyan-to-blue fill with dark text).

### Neutral
- **Midnight Navy** (bg): the page. **Card Navy** (surface) and its steps (surface-2, surface-3): cards, menus, rows.
- **Hairline** (line, line-strong): borders and dividers. **Ink, Ink 2, Ink 3**: text, secondary text, captions.

### Themes (same roles, other values)

| Role | Dark | Red (`cyberpunk`) | Light | Mint | God mode |
|---|---|---|---|---|---|
| bg | #0b1120 | #09090b | #f8fafc | #f4faf7 | #000000 |
| surface | #101a2e | #130a10 | #ffffff | #ffffff | #060f08 |
| surface-2 | #17223a | #1e0f18 | #f1f5f9 | #eaf6f0 | #0b1a0f |
| surface-3 | #202d49 | #2b1521 | #e2e8f0 | #d8ece2 | #112516 |
| line | #1d2a45 | #3a1824 | #e2e8f0 | #d1fae5 | #163d20 |
| line-strong | #2b3b5e | #52202f | #cbd5e1 | #a7f3d0 | #1f5a2c |
| ink | #f8fafc | #fbbf24 (gold) | #0f172a | #0f172a | #00ff00 |
| ink-2 | #cbd5e1 | #dcbf86 | #334155 | #2d3748 | #4ade80 |
| ink-3 | #94a3b8 | #a1a1aa | #5e6e83 | #5e6e83 | #22c55e |
| brand | #00f2fe | #f43f5e (rose) | #2563eb | #10b981 | #00ff00 |
| accent as text (`--accent-ink`, nx `--link`) | #00f2fe | #fb7185 | #1d4ed8 | #047857 | #00ff00 |
| fill gradient | #00f2fe → #4facfe | #f43f5e → #eab308 | #1d4ed8 → #2563eb | #34d399 → #10b981 | #00ff00 → #00cc00 |
| text on a fill (`--accent-active-color`, nx `--on-brand`) | #0b1120 | #09090b | #ffffff | #022c22 | #000000 |
| shadow colour (`--shade`) | black 45% | black 50% | navy 16% | navy 16% | black 60% |
| success (`--pf-ok`, a dot, not text) | #4ade80 | #4ade80 | #16a34a | #16a34a | #4ade80 |

Every text pair above passes 4.5:1, on the page, on surface-2 and on the fill (God mode's ink-3 is 7.9:1 on its
cards; Light's accent text 5.3:1 even on its own blue tints). The success dot is a graphic: 3.1:1 or more on every page
colour. Muted text is the ink-3 token, never ink at a lower
opacity: opacity fell under 4.5:1 in Light and Mint.

God mode is listed in the theme menu only after the Konami code unlocks it (`mehedi_godmode` in storage).

**The One Accent Rule.** A screen uses its theme's accent for state and emphasis only: the current page, links, one
filled button per group, key figures. Status colours (the success green of "Available for work" and "Live"; amber,
pink on Profile's work rows) are the only other hues.

**The Accent-as-Text Rule.** Text, icons and focus outlines in the accent use `--accent-ink` (nx `--link`), never
the raw brand: Mint's brand green is too light on white (2.5:1), so it reads in deep green there, and Light's in a
deeper blue. A filled control takes the fill gradient with `--accent-active-color` text: dark text on Dark, Red and
Mint fills, white on Light's.

## Typography

**Body / UI Font:** Poppins (400, 600, 700), self-hosted. **Code Font:** Fira Code, for figures, labels and badges.
No other webfonts, with one exception: a page that shows Bangla text (today only /karbar/) may load Hind Siliguri
(400, 600, self-hosted) for Bengali glyphs only, its `@font-face` limited by `unicode-range` to the Bengali block
(U+0964-0965, U+0980-09FE, U+200C-200D, U+25CC). Poppins comes first in the stack, so Latin never reaches it.
Every Poppins stack names `'Poppins Fallback'` second: local Arial (or Liberation Sans, its metric twin) with
`size-adjust` and ascent/descent/line-gap overrides per weight (400, 600, 700, measured on the site's own text), so
text keeps its size and place when Poppins arrives instead of jumping (mobile CLS 0.028 → 0.001).

### Hierarchy
- **Display** (700, 4rem desktop, clamp to ~2.2rem on phones): the hero name only, alone in the h1.
- **Subtitle** (Poppins 600, 28px on desktop, down to ~20px beside the photo, 18px on phones; line-height 1.3, in
  `--accent-ink`): the hero's role line, the h2 under the name. One line at every width from 360px.
- **Figures** (Fira Code 600, 26px): the dashboard's key numbers.
- **Title** (600, 17px): card and section headings (`1.5rem` for section titles).
- **Body** (400, 14px, line-height 1.6): card text, lists. Long text up to ~70 characters a line.
- **Label** (Fira Code 600, 12-12.5px, uppercase allowed): badges, meta counts.

**The 12px Floor Rule.** Nothing on a phone is smaller than 12px, the tab bar's labels included (12px Poppins 500).

## Layout

- Content width 1200px (dashboard), 1400px for the nx shell (main column plus the right rail). Desktop side padding
  `max(5%, 204px)` on the home hero and header.
- Grid: 12 columns, 16px gaps on the dashboard. Rhythm in 8px steps (6, 8, 16, 24, 48).
- Breakpoints: 768/769px (phone header and drawer below), 1024px (tab bar below; the round chat face above), 1200px,
  1280px (below it, windows without a tab bar keep side margins for the round chat face).
- Phones: the bottom tab bar (64px) is the footer; the top bar is 56px. The header is 77px at 769-860px and 99px
  from 861px; the home hero starts below it at every window size (115px top padding from 861px, 93px below).

**The Floating Controls Rule.** The folded chat is the only floating control: WhatsApp never floats (it is in the phone
menu, on Contact and in the hero's "Book a Call"), and theme and sound live in the header. Two layouts, whose media
queries are each other's exact complement:
- With a tab bar, `(max-width: 767.98px), (min-width: 768px) and (max-width: 1023.98px) and (min-height: 600px)`: the
  folded chat is the bar's last tab. The page ends above the bar.
- Without one, `(min-width: 1024px), (min-width: 768px) and (max-height: 599.98px)` (desktops, and short windows such
  as a phone held sideways): the round face bottom right. Below 1280px (`max-width: 1279.98px`) the body keeps an 88px
  margin on each side (both sides, so the content stays centred) so the face never sits on content; the fixed header
  keeps the full width.
Every query that picks between the two layouts ends its `max-` side at `.98px`: with browser zoom a window can be
767.5px wide, where `max-width: 767px` and `min-width: 768px` both miss. Nothing floating may cover text, a link or a
button at any window size.

## Elevation & Depth

Flat by default; depth from plain dark shadows, never coloured light.

### Shadow Vocabulary
- **Lift** (`--pf-lift`, three stacked dark shadows): cards that float, menus, the hero portrait.
- **Drop** (`--b3-drop`, `0 6px 16px -8px rgba(0,0,0,.55)`; lighter in Light and Mint): filled buttons, round
  controls. `--b3-drop-hover` under the pointer, `--b3-drop-press` when pressed.
- **Shade** (`--shade`): the one shadow colour for anything else (black, navy-grey in Light and Mint). Mint's lift is
  navy-grey too, not green.

**The No-Glow Rule.** No shadow, filter or text-shadow takes the accent colour. A shadow is black (or navy-grey in
Light and Mint). This holds in every theme, Red included. A ring without blur (`0 0 0 1px`, the avatar's 2px ring
behind a surface gap, the selected orbit logo) is a border, not a glow; a soft accent halo (`0 0 0 3px` at low
opacity) is a glow.

## Shapes

Rounded, never sharp, never pill-shaped containers: chips 6px, menu rows 10px, menus 14px, lists 16px, tiles 22px,
the hero portrait 26px. Buttons and header controls are full pills or circles. Borders are 1px.

## Touch

**The Hover-Is-For-A-Mouse Rule.** Every `:hover` style sits inside `@media (hover: hover) and (pointer: fine)`. On a
touch screen a tap sets `:hover` and it stays until the next tap, so a hover lift or colour would stick to the tapped
control (and on iOS a hover that shows something costs a second tap). `npm run check` fails on a `:hover` outside that
condition. Hover-only scripts (the pointer-following card lights, the hover sound, the portrait's mouse parallax, the AI
face's eyes and hover reaction) check the same media query, and so does a script that asks whether the pointer is still
over something (`el.matches(':hover')`) before closing it; touch handlers stay.
- **Touch is the opposite condition,** `(hover: none), (pointer: coarse)`, never `(hover: none)` alone: some phones
  report a hovering pointer, and with that alone they would get neither the hover styles nor the touch ones.
- **Press feedback,** under that touch condition only (nothing changes with a mouse): a control dims to
  0.72 the moment it is pressed and comes back on release, over 150ms unless it has a transition of its own; a box-like
  one (button, chip, pill, tab, card, row) also shrinks to 0.97 with the `scale` property, never `transform`, and not
  under reduced motion. A control that already presses in with its own transform (the button system, the player
  controls) keeps only that, and a tab-bar item never shrinks: its icon squeezes to 0.88 instead, like a native tab bar.
  Inline links in running text only dim; a native select presses with the label around it.
- Whatever only a hover shows needs a touch path: a tap state (`.is-active`), `:focus-within`, or shown by default under
  the touch condition. The project cards' buttons open on a tap; the floating player's bars always show on touch.
- No grey tap flash and no double-tap-zoom wait: every control has `-webkit-tap-highlight-color: transparent` and
  `touch-action: manipulation`; an explicit `touch-action` (a slider's `pan-y`, a drag handle's `none`) wins. iOS shows
  `:active` only when the page has a `touchstart` listener: the shared head adds an empty passive one.

## Components

### Header (top bar, every page)
- Fixed. Background: the page colour at 90% with an 18px blur (the tab bar 94%), a 1px hairline below: at 78% a
  bright cover or thumbnail passing behind pulled the links under 4.5:1. Desktop: logo left; Profile,
  Projects, People, Contact, Library pushed right; a divider; then the one round button, "Theme and sound" (a
  palette). The current page's link is in `--accent-ink` with a 2px solid underline.
- Phones (≤768px): logo and name, the Contact pill, the same "Theme and sound" button, the menu button. Sound has one
  home on every size: the last row of that button's menu (the phone drawer has no sound button).
- **Header buttons:** 40px circles (44px tap area on phones), a faint ink tint and a 1px ring; on, open or hovered they
  take `--accent-ink`.
- **Theme and sound menu:** a 180px card under its button (surface, line-strong border, 14px radius, lift). Rows of
  40px: a swatch (the theme's accent on its page colour), the name (Dark, Red, Light, Mint; God mode once unlocked), a
  check on the current one. After a 1px line-strong separator, the last row is **Sound**, a `menuitemcheckbox`: a speaker
  where the swatch goes (crossed out while off, in the accent while on) and a small switch where the check goes (off:
  surface-2 track in a line-strong ring, Ink 3 knob; on: the fill gradient with an `--accent-active-color` knob).
  Toggling Sound keeps the menu open with focus on the row; picking a theme closes it. Sound is off until the visitor
  turns it on (`mehedi_muted` in storage). On phones and touch screens the rows are 44px. ARIA menu button: arrows,
  Home/End and first letter move over every row, Sound included; Esc returns focus; Tab or a click outside closes it.
  Every theme change goes through `setTheme()` (transitions off for that frame).

### Buttons
- **Primary:** pill, the theme's fill gradient with a soft top gloss, dark or white text, 10px 20px, Poppins 700 14px.
  Hover lifts 2px with `--b3-drop-hover`; pressed sinks.
- **Secondary:** pill, the page colour inside a gradient hairline border, ink text; hover turns the text to the accent.
- **Quiet:** no fill and no ring, Ink 2 text with its icon, Poppins 600 14px, 10px 16px, 44px tall, pill-shaped only
  under the pointer (a 7% ink tint, accent text). Used beside a primary and a secondary, as the third and least
  important action (the hero's Download CV).
- **Round control:** 44px circle on surface with a line-strong ring, accent icon: the phone menu's WhatsApp button.
  WhatsApp's icon stays green.

### Cards / Containers
- Surface, 1px line border, 22px radius, 22px 24px padding, a faint lit top edge. The pointer may light the border
  (dashboard tiles); that light is the accent at low opacity on the border only.

### Home hero
- One order at every size, top to bottom: the status line, the name, the role, the specialities, the actions, the proof
  card. Left beside the photo (desktop, from 861px), or under the photo and centred (860px and below; the proof card's
  rows stay left-aligned).
- **Status line:** "Available for work · Dhaka (GMT+6)", plain text, not a button or a chip: Poppins 400, 14px (13px on
  phones), Ink 3, after an 8px still dot in the success green (`--pf-ok`), with no pulse and no glow. 14px above the name
  (6px on phones).
- The name as the h1 (Display, Ink), the role as its subtitle (Subtitle, accent text) 10px under it (4px on phones), and
  right under the role one quiet line of specialities, "LLM integration · Autonomous agents · Full-stack architecture"
  (Poppins 400, 15px, 13px on phones, Ink 2), 6px under it (4px on phones). No height is reserved for any of them, so
  nothing leaves an empty band. The specialities break only between phrases: where the text column is under 470px (a
  container query) the last phrase takes its own line without its dot.
- **Actions,** 24px under the specialities (16px on phones), one row of three: See my work (primary), Book a Call
  (secondary, WhatsApp), Download CV (quiet, with its icon). Phones: the two filled buttons share the first line and
  Download CV takes the whole second line, its label centred. Beside the photo in a column under 480px (1024px, a short
  900px window): the two filled ones, then Download CV on the next line with its icon on the column's edge. Stacked and
  centred (769-860px): the row is centred too.
- **Proof card,** 32px under the actions (24px in a narrow column, 20px on phones): a list labelled "Results from my
  work", on surface at 84% with a 1px `line` border and a 16px radius, its three rows split by `line` hairlines. Each
  row is one link, so the row is the target, figure first: the figure (Fira Code 600, 15px, 14px on phones,
  `--accent-ink`), what it means (Poppins 400, 14px, 13px on phones, Ink 2), and the source at the row's end (Poppins
  13px, 12.5px on phones, Ink 3, a small arrow after it). No chips, no other colours. The figures share one column
  (subgrid), so the texts line up; where the text column is under 540px (a container query: phones, beside the photo at
  1024px) the figure and the source share the first line and the text takes the second. Rows are 48px tall (64px on
  phones). Hover: a 5% ink tint, the source and arrow in the accent, the arrow 2px on (no motion under reduced motion).
  Focus: the 2px accent ring inset by 2px, along the card's corners. Each row leads to where its result comes from:
  Jibika's job on the profile (the dashboard's "300+ companies" tile goes there too), the projects (SAWAB's ERP is the
  first card), Karbar's page. The details the rows leave out live there: Frappe and Next.js on Projects and Profile,
  Mushak 6.3, 6.5, 6.6, 9.1 and TDS on Projects and /karbar/.
- First screen: on phones the whole row of actions sits above the tab bar (at 360x640 and 375x667 the photo is 148px
  wide instead of 176px, by a height media query: the same shape and image files, no shift); the proof card may start
  below the fold. On desktops everything from the status line to the first proof row is in the first screen at 1280x800
  and 1440x900. Every line in the hero takes its line height from the stylesheet, so nothing moves when the fonts arrive.
- The dot network fades out behind the text column in an oval; beside the photo the oval reaches further up and left,
  so the status line in the column's top-left corner is as clear of the lines as the name.
- The portrait: the photo itself wears the frame, one 1px hairline in the theme's `line` colour, 26px radius, the lift
  shadow. No outer ring or card around it; the box that floats it is transparent.

### Chips and badges
- Chips: surface-2 with a 1px line ring, 999px or 6px radius, Ink 2 text.

### List rows
- The hero's proof card: a 16px-radius list on surface (84%), hairlines between rows, each row one link, figure first
  (see Home hero). Dashboard rows: surface-2, 10-12px radius, 40px+ tall.

### Footer
- One centred row under a hairline, max 1200px: the copyright (13px, Ink 3) and the DMCA badge. Hidden on phones,
  where the tab bar is the footer. The CLI has no button: it is an easter egg, opened with the ` / ~ key.

### Chat
- Folded: the round AI face. Without a tab bar: a 56px face in the bottom-right corner, "Ask My AI" slides out beside
  it on hover or focus. With the tab bar: its last tab (face over "Ask My AI"), so it never covers the page. See the
  Floating Controls Rule.
- Open: a solid panel (`--chat-panel`), an opaque header above a message list that clips its own content; user
  bubbles in the fill gradient with a plain drop shadow. On phones and touch screens the header (it folds the chat) and
  the send button are 44px.
- Greeting: the bubble that comes after a while on the page sits above the folded chat (beside the face on a short
  window) and never reaches the header or the tab bar; when it is taller than the room, it scrolls inside.

### 404 page
- The site's card on the page colour, in the saved theme: a Fira Code label and figure ("404" in the accent text),
  the title, one line of explanation, the address that was asked for, the primary "Back to home" and a list of the main
  pages as 44px rows. No terminal prompt.

## Do's and Don'ts

### Do:
- **Do** take every colour from the tokens above; add a theme by adding values, not rules.
- **Do** keep focus visible: a 2px `--accent-1` outline, 2-3px offset (inset on menu rows).
- **Do** keep every target at least 24px, and 44px tall for the phone's primary controls: tab bar, header buttons,
  drawer links and close, theme rows, chat send and fold, main calls to action (`min-height: 44px` on the button
  system). Grow the target, never shrink a neighbour: a round 40px button takes a `::before` 3px past its 1px border;
  a text link takes `padding-block` with an equal negative `margin-block`, so its line doesn't move. Inline links in
  running text are exempt (WCAG 2.5.8).
- **Do** respect reduced motion: no float, slide or breathing animation when it is set; the dot network stays still.
- **Do** write every hover style inside `@media (hover: hover) and (pointer: fine)`, and give touch its own press
  feedback (see Touch).

### Don't:
- **Don't** use neon glow: no coloured `box-shadow`, `drop-shadow` or `text-shadow`, in any theme.
- **Don't** use gradient text. The hero name is one solid colour.
- **Don't** use faux terminal chrome (window dots, `~/path` title bars, `$` prompts) outside the real CLI easter egg.
- **Don't** animate text: no decrypt, scramble or typing effects; headings are static.
- **Don't** make a theme change shapes, sizes, spacing or motion; themes differ only by colour tokens.
- **Don't** add webfonts or render-blocking requests (PageSpeed desktop must stay 100).
