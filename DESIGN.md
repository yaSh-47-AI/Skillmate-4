---
name: SkillMate
description: Clean, minimal Dark Botanical Forest & Sage design system for student skill-matching, topic circles, and real-time collaboration.
colors:
  sage-leaf: "#C5D9A9"
  meadow-mint: "#8CC084"
  moss-emerald: "#84C99A"
  forest-obsidian: "#0B110E"
  deep-canopy: "#0B1410"
  matte-pine: "#121A16"
  elevated-fern: "#16201B"
  spotlight-moss: "#15221B"
  ivory-mist: "#F3F6F1"
  lichen-gray: "#A3B1A6"
  olive-ash: "rgba(163, 177, 166, 0.58)"
  border-hairline: "rgba(255, 255, 255, 0.08)"
  border-control: "rgba(255, 255, 255, 0.12)"
  sage-tint: "rgba(197, 217, 169, 0.16)"
  sage-border: "rgba(197, 217, 169, 0.24)"
  surface-ghost: "rgba(255, 255, 255, 0.04)"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.03rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  label:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.02em"
rounded:
  chip: "8px"
  control: "12px"
  tile: "14px"
  surface: "16px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.sage-leaf}"
    textColor: "{colors.forest-obsidian}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "{colors.meadow-mint}"
    textColor: "{colors.forest-obsidian}"
  button-secondary:
    backgroundColor: "{colors.surface-ghost}"
    textColor: "{colors.ivory-mist}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-secondary-hover:
    backgroundColor: "{colors.sage-tint}"
    textColor: "{colors.ivory-mist}"
  card-surface:
    backgroundColor: "{colors.matte-pine}"
    textColor: "{colors.ivory-mist}"
    rounded: "{rounded.surface}"
    padding: "16px"
  card-spotlight:
    backgroundColor: "{colors.spotlight-moss}"
    textColor: "{colors.ivory-mist}"
    rounded: "{rounded.surface}"
    padding: "16px"
  input-field:
    backgroundColor: "{colors.surface-ghost}"
    textColor: "{colors.ivory-mist}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
  chip-filter:
    backgroundColor: "{colors.surface-ghost}"
    textColor: "{colors.lichen-gray}"
    typography: "{typography.label}"
    rounded: "{rounded.chip}"
    padding: "6px 12px"
  chip-filter-active:
    backgroundColor: "{colors.sage-tint}"
    textColor: "{colors.sage-leaf}"
  nav-dock:
    backgroundColor: "{colors.deep-canopy}"
    textColor: "{colors.ivory-mist}"
    rounded: "{rounded.surface}"
    height: "64px"
    padding: "6px 8px"
---

# Design System: SkillMate

## Overview

**Creative North Star: "The Quiet Studio"**

SkillMate's interface is modeled after a focused, distraction-free study studio at night—deep matte forest surfaces, crisp 1px hairline boundaries, calm hierarchy, and zero neon glow. Editorial serif display titles lend human warmth to student profiles and greetings, while clean geometric sans-serif controls keep matchmaking, circle browsing, and live chat fast to scan.

This system locks in the **Botanical Forest & Sage** palette and studio-grade matte surface overrides already established in the codebase (`style.css` / `app.css` and `glass-chat-client.js`), replacing earlier purple/cyan gradients, animated ambient orbs, and gradient-clipped headings. Legacy slate/violet rules remaining in older sections and the Discover overhaul (`#0B0D12`, `#7C3AED`, `#06B6D4`) are deprecated drift and should be converged onto these canonical tokens whenever those views are touched.

**Key Characteristics:**
- Matte dark forest canvas (`#0B110E`) paired with stepped pine surfaces (`#121A16`, `#15221B`) instead of blurred neon glass.
- Restrained muted-sage accent (`#C5D9A9`) with dark forest ink (`#0B110E`) for crisp, high-contrast primary actions.
- Crisp `1px` structural hairline borders (`rgba(255, 255, 255, 0.08)`) defining cards, panels, and navigation containers.
- Architectural corner geometry (`12px` controls, `16px` cards, `8px` skill/filter chips) with zero decorative particles or pulsing glows.

## Colors

A quiet, high-contrast dark botanical palette where deep forest neutrals carry 90% of the screen and muted sage marks only primary actions and active states.

### Primary
- **Sage Leaf** (`sage-leaf`): Used for primary CTA buttons (`.primary`, `.nav-btn`, `.auth-submit`), active tab fills, the brand period accent (`SkillMate.`), active bottom-dock indicators, and match-progress fills, always paired with Forest Obsidian text.

### Secondary
- **Meadow Mint** (`meadow-mint`): Used for keyboard `:focus-visible` outlines, secondary active highlights, and gradient endpoints alongside Sage Leaf.

### Tertiary
- **Moss Emerald** (`moss-emerald`): Reserved for live availability indicators, accepted connection badges, and positive match/progress bars.

### Neutral
- **Forest Obsidian** (`forest-obsidian`): Primary page background (`--bg-base`) and inverse ink color on Sage Leaf buttons/badges.
- **Deep Canopy** (`deep-canopy`): Root ambient canvas (`#0B1410`) and mobile floating dock surface.
- **Matte Pine** (`matte-pine`): Default surface (`--panel`) for bento cards, community cards, channel cards, auth dialog, drawers, and mobile stat tiles.
- **Elevated Fern** (`elevated-fern`): Nested or hovered elevated container surface (`--panel2` / `--glass-elevated`).
- **Spotlight Moss** (`spotlight-moss`): Subtle green-tinted card fill reserved for the featured Match Pulse spotlight card.
- **Ivory Mist** (`ivory-mist`): Primary headings, body copy, and interactive labels.
- **Lichen Gray** (`lichen-gray`): Supporting descriptions, handles, timestamps, and inactive tab labels.
- **Olive Ash** (`olive-ash`): Muted helper hints, placeholders, and secondary metadata.
- **Border Hairline / Control** (`border-hairline`, `border-control`): Structural `1px` borders separating matte surfaces without drop shadows.

### Named Rules
**The One Accent Rule.** Sage Leaf is reserved strictly for primary calls to action, active navigation states, and key brand punctuation; never flood whole card backgrounds with solid sage.
**The No-Neon Rule.** Purple/magenta/cyan gradients (`#7C3AED`, `#06B6D4`, `#8658f3`), ambient floating orbs, and colored box-shadow halos are prohibited in new or refactored UI.

## Typography

**Display Font:** `Playfair Display` (with `Georgia, serif` fallback)
**Body Font:** `Plus Jakarta Sans` (with `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif` fallback)

**Character:** Editorial serif warmth at display scale balanced by crisp, readable geometric sans-serif for dense skill tags, search inputs, and chat streams. Note that Helmet CSP currently restricts `font-src` to `'self'`; always verify self-hosted or system fallback rendering so hierarchy holds even if external fonts are blocked.

### Hierarchy
- **Display** (`700`, `2.25rem` / mobile `clamp(26px, 7.5vw, 31px)`, `1.12` line-height): Hero titles, mobile home greeting (`Hello, Explorer`), and view headers.
- **Headline** (`700`, `1.75rem`, `1.15` line-height): Section titles (`.section-title`), spotlight card titles, and quick-sheet headings.
- **Title** (`700`, `1.03rem` / `16.5px`, `1.3` line-height): Card names, section sub-headings, and drawer headers.
- **Body** (`400`, `0.875rem` / `14px`, `1.6` line-height): Bio copy, community descriptions, and chat messages (keep prose under ~65ch on desktop).
- **Label** (`700`, `0.75rem` / `12px`, `1.2` line-height, `+0.02em` tracking): Buttons, skill pills, navigation tabs, and uppercase micro-eyebrows.

### Named Rules
**The Serif-Display Rule.** `Playfair Display` is used only for brand wordmarks and section/greeting headings; never set dense UI controls, body paragraphs, or badges in serif.

## Layout

SkillMate renders from a single codebase across desktop web (`/`) and mobile WebView (`/app`):

- **Desktop (`> 768px`):** Centered floating top navigation (`min(92%, 1300px)`), main content sections constrained to `min(1220px, 89%)` (or `max-width: 1120px` in Discover), and responsive multi-column CSS grids (`repeat(auto-fill, minmax(290px, 1fr))` in Discover bento grid) with `12px`–`16px` gaps.
- **Mobile & `/app` (`<= 768px`):** Full-width (`100vw`, `overflow-x: clip`) single-column flow with `16px` horizontal padding, safe-area-aware top/bottom spacing (`env(safe-area-inset-top)` and `calc(96px + env(safe-area-inset-bottom))` clearance above the floating bottom dock), and 3-column compact bento stat row (`repeat(3, minmax(0, 1fr))`, `10px` gap) on the Mobile Home Dashboard.
- **Breakpoints:** `520px` (narrow phone modal/grid adjustments), `768px` (mobile shell & floating dock threshold), and `1050px` (tablet nav/grid adjustments).

## Elevation & Depth

Surfaces rely on **tonal layering plus crisp 1px hairlines**, not heavy blur or colored glow shadows. Resting cards sit flat on the `#0B110E` canvas in Matte Pine (`#121A16`) with a `1px solid rgba(255, 255, 255, 0.08)` border (`backdrop-filter: none` on overridden cards). Ambient dark shadows (`0 12px 32px rgba(0, 0, 0, 0.4)` and `0 12px 32px rgba(0, 0, 0, 0.55)`) appear only on elevated portals: auth modals, side drawers, bottom sheets, and the floating mobile dock.

### Named Rules
**The Flat-By-Default Rule.** Resting cards, stat tiles, and list rows carry no drop shadow (`box-shadow: none`); depth comes from surface step (`#0B110E` -> `#121A16` -> `#15221B`) and `1px` borders.

## Shapes

SkillMate uses **disciplined architectural radii** rather than bloated `999px` pill buttons:

- **Controls & Inputs (`12px`):** Primary/secondary buttons, tab buttons, text input wrappers, and spotlight CTA icons.
- **Compact Tiles (`14px`):** Mobile stat cards, activity list rows, category squircles (`52px x 52px`), and center quick-add button.
- **Cards, Containers & Dock (`16px`):** Peer cards, community/channel cards, panels, drawers, bottom sheets (`16px 16px 0 0`), and the floating mobile dock.
- **Tags & Filter Chips (`8px`):** Skill tags, filter pills, and community category chips.
- **Avatars (`50%`):** Circular user avatars (`42px`–`54px` mobile, `44px`–`68px` cards/headers).

### Named Rules
**The Architectural Radius Rule.** Use `12px` for interactive buttons/inputs and `16px` for cards/drawers; reserve `999px` strictly for progress tracks and compact inline status badges.

## Components

Every component pairs quiet matte framing with clear interactive contrast and `44px` minimum touch targets on mobile.

### Buttons
- **Shape:** Architectural rounded rectangle (`12px` radius), minimum `44px` height on mobile/touch views.
- **Primary:** Solid Sage Leaf (`#C5D9A9`) fill, Forest Obsidian (`#0B110E`) text, `1px` Sage Leaf border, `box-shadow: none`, `10px 18px` padding, `700` weight.
- **Hover / Focus:** Subtle `-1px` vertical lift or Meadow Mint fill shift; `2px solid #8CC084` focus-visible ring with `3px` offset.
- **Secondary / Ghost:** `rgba(255, 255, 255, 0.04)` fill, Ivory Mist (`#F3F6F1`) text, `1px solid rgba(255, 255, 255, 0.12)` border.

### Chips
- **Style:** `8px` radius, `6px 12px` padding, `1px` hairline border, Lichen Gray text at rest.
- **State:** Active/selected chips switch to `rgba(197, 217, 169, 0.16)` background, Sage Leaf (`#C5D9A9`) text, and `rgba(197, 217, 169, 0.38)` border.

### Cards / Containers
- **Corner Style:** `16px` radius (`14px` for compact mobile list/stat tiles).
- **Background:** Matte Pine (`#121A16`); Spotlight Moss (`#15221B`) for featured progress card.
- **Shadow Strategy:** Flat at rest (`box-shadow: none` on mobile tiles; `0 12px 32px rgba(0, 0, 0, 0.4)` only on floating drawers/modals).
- **Border:** `1px solid rgba(255, 255, 255, 0.08)` (`rgba(197, 217, 169, 0.24)` on spotlight card).
- **Internal Padding:** `16px` standard (`12px`–`14px` compact mobile rows).

### Inputs / Fields
- **Style:** `rgba(255, 255, 255, 0.05)` fill, `1px solid rgba(203, 224, 190, 0.14)` border, `12px` radius, `16px` minimum font-size on mobile to prevent iOS/WebView zoom.
- **Focus:** Border shifts to `rgba(197, 217, 169, 0.5)` with `0 0 0 3px rgba(197, 217, 169, 0.14)` ring.

### Navigation
- **Desktop Top Nav:** Floating bar (`min(92%, 1300px)`), hamburger drawer trigger, `Playfair Display` `SkillMate.` wordmark, centered view links (`Network`, `Interests`, `Communities`, `Discover`), notification bell, messages trigger, and account avatar/menu.
- **Mobile Floating Dock (`<= 768px` & `/app`):** Fixed `64px` bar (`16px` radius, `rgba(15, 23, 19, 0.96)`, `1px` hairline border) with 4 tabs (`Home`, `Discover`, `Circles`, `Chats`) flanking an elevated `48px` Sage Leaf `+` quick-action button (`14px` radius).

### Signature Component: Match Pulse & Skill Swap Cards
- **Match Pulse Spotlight:** Displays profile/match readiness with a serif headline (`Keep Building!`), `8px` progress track (`rgba(255, 255, 255, 0.12)`), and `Moss Emerald` -> `Sage Leaf` linear fill (`#84C99A` to `#C5D9A9`), paired with a `40px` Sage Leaf action button (`12px` radius).

## Do's and Don'ts

### Do:
- **Do** use Matte Pine (`#121A16`) over Forest Obsidian (`#0B110E`) with `1px solid rgba(255, 255, 255, 0.08)` borders for all new cards and panels.
- **Do** preserve every existing DOM ID, `data-*` attribute, JS callback (`navigateTo`, `openModal`, `openChat`, `window.GlassChat`), and REST/Socket.IO hook when refactoring HTML/CSS.
- **Do** keep interactive button/input touch targets at least `44px` tall and form inputs at `16px` font-size on mobile (`<= 768px` and `/app`).
- **Do** migrate legacy `#0B0D12` / `#7C3AED` / `#06B6D4` rules in Discover or older sections to the canonical Botanical Forest & Sage tokens when editing those components.

### Don't:
- **Don't** reintroduce purple/cyan gradients, animated background orbs (`.orb`, `.auth-orb`), `#particles`, or glowing text/button shadows.
- **Don't** use gradient-clipped text (`background-clip: text`) on headings or wordmarks; keep text solid Ivory Mist (`#F3F6F1`) with Sage Leaf (`#C5D9A9`) strictly on accent spans.
- **Don't** apply `backdrop-filter` blur to dense scrollable card grids—reserve translucency for floating navigation docks and overlay sheets.
- **Don't** use `999px` pill borders on primary CTA buttons or large cards; stick to `12px` controls and `16px` containers.
