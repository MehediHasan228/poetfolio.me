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
  code-display:
    fontFamily: "Fira Code, monospace"
    fontSize: "2rem"
    fontWeight: 500
    lineHeight: 1.5
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
  portrait: "36px"
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

Every text pair above passes 4.5:1, on the page, on surface-2 and on the fill (God mode's ink-3 is 7.9:1 on its
cards; Light's accent text 5.3:1 even on its own blue tints). Muted text is the ink-3 token, never ink at a lower
opacity: opacity fell under 4.5:1 in Light and Mint.

God mode is listed in the theme menu only after the Konami code unlocks it (`mehedi_godmode` in storage).

**The One Accent Rule.** A screen uses its theme's accent for state and emphasis only: the current page, links, one
filled button per group, key figures. Project badges (green, purple, amber) are the only other hues.

**The Accent-as-Text Rule.** Text, icons and focus outlines in the accent use `--accent-ink` (nx `--link`), never
the raw brand: Mint's brand green is too light on white (2.5:1), so it reads in deep green there, and Light's in a
deeper blue. A filled control takes the fill gradient with `--accent-active-color` text: dark text on Dark, Red and
Mint fills, white on Light's.

## Typography

**Body / UI Font:** Poppins (400, 600, 700), self-hosted. **Code Font:** Fira Code, for figures, labels and badges.
No other webfonts.

### Hierarchy
- **Display** (700, 4rem desktop, clamp to ~2.2rem on phones): the hero name only.
- **Code display** (Fira Code, 2rem): "Hi, I'm" and the hero role line.
- **Title** (600, 17px): card and section headings (`1.5rem` for section titles).
- **Body** (400, 14px, line-height 1.6): card text, lists. Long text up to ~70 characters a line.
- **Label** (Fira Code 600, 12-12.5px, uppercase allowed): badges, meta counts, the footer's Terminal button.

**The 12px Floor Rule.** Nothing on a phone is smaller than 12px, the tab bar's labels included (12px Poppins 500).

## Layout

- Content width 1200px (dashboard), 1400px for the nx shell (main column plus the right rail). Desktop side padding
  `max(5%, 204px)` on the home hero and header.
- Grid: 12 columns, 16px gaps on the dashboard. Rhythm in 8px steps (6, 8, 16, 24, 48).
- Breakpoints: 768/769px (phone header and drawer below), 1024px (tab bar below; the round chat face above), 1200px,
  1280px (below it, windows without a tab bar keep side margins for the round buttons).
- Phones: the bottom tab bar (64px) is the footer; the top bar is 56px. The header is 77px at 769-860px and 99px
  from 861px; the home hero starts below it at every window size (115px top padding from 861px, 93px below).

**The Floating Controls Rule.** Two layouts, whose media queries are each other's exact complement:
- With a tab bar, `(max-width: 767px), (min-width: 768px) and (max-width: 1023px) and (min-height: 600px)`: the folded
  chat is the bar's last tab and WhatsApp does not float (it is in the drawer, on Contact and in the hero's "Book a
  Call"). The page ends above the bar.
- Without one, `(min-width: 1024px), (min-width: 768px) and (max-height: 599px)` (desktops, and short windows such as
  a phone held sideways): the round face bottom right, WhatsApp bottom left. Below 1280px the body keeps an 88px
  margin on each side so neither ever sits on content; the fixed header keeps the full width.
Nothing floating may cover text, a link or a button at any window size.

## Elevation & Depth

Flat by default; depth from plain dark shadows, never coloured light.

### Shadow Vocabulary
- **Lift** (`--pf-lift`, three stacked dark shadows): cards that float, menus, the portrait frame.
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
the portrait frame 36px (26px on phones). Buttons and header controls are full pills or circles. Borders are 1px.

## Components

### Header (top bar, every page)
- Fixed. Background: the page colour at 90% with an 18px blur (the tab bar 94%), a 1px hairline below: at 78% a
  bright cover or thumbnail passing behind pulled the links under 4.5:1. Desktop: logo left; Profile,
  Projects, People, Contact, Library pushed right; a divider; then the sound toggle and the theme button. The current
  page's link is in `--accent-ink` with a 2px solid underline.
- Phones (≤768px): logo and name, the Contact pill, the theme button, the menu button. Sound lives in the menu.
- **Header buttons:** 40px circles (44px tap area on phones), a faint ink tint and a 1px ring; on, open or hovered they
  take `--accent-ink`.
- **Theme menu:** a 180px card under its button (surface, line-strong border, 14px radius, lift). Rows of 40px: a
  swatch (the theme's accent on its page colour), the name (Dark, Red, Light, Mint; God mode once unlocked), a check
  on the current one. ARIA menu button: arrows, Home/End, first letter, Esc returns focus. Every change goes through
  `setTheme()` (transitions off for that frame).

### Buttons
- **Primary:** pill, the theme's fill gradient with a soft top gloss, dark or white text, 10px 20px, Poppins 700 14px.
  Hover lifts 2px with `--b3-drop-hover`; pressed sinks.
- **Secondary:** pill, the page colour inside a gradient hairline border, ink text; hover turns the text to the accent.
- **Round control:** 44px circle on surface with a line-strong ring, accent icon. The floating WhatsApp button
  (bottom left, only where there is no tab bar) and the menu's WhatsApp and sound buttons. WhatsApp's icon stays green.

### Cards / Containers
- Surface, 1px line border, 22px radius, 22px 24px padding, a faint lit top edge. The pointer may light the border
  (dashboard tiles); that light is the accent at low opacity on the border only.

### Chips and badges
- Chips: surface-2 with a 1px line ring, 999px or 6px radius, Ink 2 text. Project badges in the hero: Fira Code 12px,
  6px radius, their own green, purple or amber at 12-15% fill with a 30% border.

### List rows
- The hero highlights: a 16px-radius list on surface (84%), one row per item: badge, then the text in Ink 2 with the
  figure in Ink 600. Dashboard rows: surface-2, 10-12px radius, 40px+ tall.

### Footer
- One row under a hairline, max 1200px: the copyright (13px, Ink 3) left; the DMCA badge and the Terminal button
  (an outlined Fira Code chip that opens the CLI) right. Hidden on phones, where the tab bar is the footer.

### Chat
- Folded: the round AI face. Without a tab bar: a 56px face in the bottom-right corner, "Ask My AI" slides out beside
  it on hover or focus. With the tab bar: its last tab (face over "Ask My AI"), so it never covers the page. See the
  Floating Controls Rule.
- Open: a solid panel (`--chat-panel`), an opaque header above a message list that clips its own content; user
  bubbles in the fill gradient with a plain drop shadow.

## Do's and Don'ts

### Do:
- **Do** take every colour from the tokens above; add a theme by adding values, not rules.
- **Do** keep focus visible: a 2px `--accent-1` outline, 2-3px offset (inset on menu rows).
- **Do** keep touch targets at least 24px, and 44px for the phone's menu, theme and chat controls.
- **Do** respect reduced motion: no float, slide or breathing animation when it is set; the dot network stays still.

### Don't:
- **Don't** use neon glow: no coloured `box-shadow`, `drop-shadow` or `text-shadow`, in any theme.
- **Don't** use gradient text. The hero name is one solid colour.
- **Don't** use faux terminal chrome (window dots, `~/path` title bars, `$` prompts) outside the real CLI easter egg.
- **Don't** animate text: no decrypt, scramble or typing effects; headings are static.
- **Don't** make a theme change shapes, sizes, spacing or motion; themes differ only by colour tokens.
- **Don't** add webfonts or render-blocking requests (PageSpeed desktop must stay 100).
