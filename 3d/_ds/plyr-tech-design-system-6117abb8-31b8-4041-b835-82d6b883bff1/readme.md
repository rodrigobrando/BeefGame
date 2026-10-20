# Plyr.tech Design System

Plyr.tech is a premium software house — a boutique tech studio building custom
products and services for clients. This design system encodes their visual
identity (editorial Inter typography, a signature cyan `#00C4DF`, dark
premium canvases, Apple-inspired restraint in motion) so any prototype, deck,
or production surface can be built "in brand" without re-deriving these
decisions each time.

**Sources provided:** one logo file (`uploads/plyrtech.png`) and a short brand
brief (vision / mission / values, company description). No codebase, no
Figma file, and no existing product screens were attached — so this is a
**from-scratch / brand-guidelines-only** build. Tokens, components, and the
marketing-site UI kit below are original designs authored to fit the brief,
not recreations of an existing product. If a codebase or Figma file exists,
attach it and this system should be reconciled against it as ground truth.

## Company

- **Name:** Plyr.tech ("plyr.tech")
- **What they do:** software house — technology products and services,
  positioned as innovators of the connection between businesses and their
  customers.
- **Visão (Vision):** Ser reconhecida como a empresa de tecnologia que inova
  a conexão entre empresas e clientes. ("To be recognized as the technology
  company that innovates the connection between businesses and customers.")
- **Missão (Mission):** Oferecer produtos e serviços inovadores através do
  uso da tecnologia. ("To offer innovative products and services through the
  use of technology.")
- **Valores (Values):** Energia positiva, respeito e comprometimento do
  trabalho em equipe com o foco no resultado sustentável e gerador de valor.
  ("Positive energy, respect, and commitment to teamwork focused on
  sustainable, value-generating outcomes.")

## Index

- `styles.css` — global stylesheet entry point (import this one file)
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `effects.css`
- `base.css` — minimal reset shared by everything
- `assets/logo/` — the plyr.tech wordmark (light + on-dark usage notes below)
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing, Brand)
- `components/core/` — Button, IconButton, Badge, Tag, Card, Input, Select,
  Checkbox, Radio, Switch, Tabs, Dialog, Toast, Tooltip
- `ui_kits/marketing-site/` — click-through recreation of a plyr.tech-style
  marketing site (home, services, about, contact)
- `SKILL.md` — portable skill definition for use in Claude Code

---

## Content fundamentals

Tone is drawn directly from the brand brief — confident, warm, outcome-
focused, written in Brazilian Portuguese for the company's own voice, with
English used for generic UI/product copy in this kit (both are valid; pick
per audience).

- **Voice:** direct and declarative, not hedgy. Short sentences that state
  what the company *is* and *does* — "Ser reconhecida como…", "Oferecer
  produtos e serviços inovadores…". Avoid corporate filler ("synergy",
  "leverage", "solutions-oriented") — say the plain thing.
- **Person:** speaks about itself in third-person/institutional voice in
  mission/vision statements ("a empresa que…"), but should speak to the
  reader in second person ("você", "your team") in product and marketing
  copy — warmer and more direct than institutional third-person throughout.
- **Casing:** sentence case for headlines and UI labels, not Title Case.
  The wordmark itself is fully lowercase (`plyr.tech`) — carry that lowercase,
  understated confidence into headline typography (large type does the
  shouting; the words stay calm).
- **Values made concrete in copy:** *energia positiva* → upbeat, never
  cynical; *respeito* → plain language, no jargon walls; *comprometimento
  em equipe* → "we" framing over individual-hero framing; *foco em resultado
  sustentável* → copy foregrounds outcomes and durability over hype ("built
  to last", "resultados", not "revolutionary", "game-changing").
- **Emoji:** not used. The brand mark's only decorative device is the single
  cyan dot in "plyr.**tech**" — that dot is the brand's one allowed
  "sparkle," so don't compete with it using emoji or extra ornamentation.
- **Example headline (pt-BR):** "Tecnologia que aproxima empresas e
  clientes." Example subhead (en, product context): "We build the software
  that connects your business to the people who use it."
- **Vibe:** premium, editorial, quietly technical — a studio that ships
  serious work without needing to shout about it.

## Visual foundations

- **Color:** one signature accent — brand cyan `#00C4DF` — used deliberately
  and sparingly (primary actions, links, focus rings, the logo's dot) against
  a dark, near-black charcoal canvas (`--surface-app`, `#0A0D10`) and a cool
  neutral/charcoal scale matched to the logo wordmark's grey (`--ink-500`,
  `#58595C`). This is a one-accent system, not a rainbow — resist adding
  secondary brand hues. Semantic status colors (success/warning/danger) exist
  for UI feedback only, never for branding.
- **Type:** Inter throughout — editorial in scale (display sizes run up to
  ~88px with tight `-0.03em` tracking, like a masthead) but a normal,
  comfortable body (16px/1.6, no tracking). One family, contrast comes from
  size/weight, not from mixing typefaces.
- **Backgrounds:** flat dark charcoal by default — no gradients, no
  patterns, no textures. The one exception is a very restrained radial glow
  of brand cyan at ~4–8% opacity behind hero sections, used to add depth
  without becoming a "gradient mesh" cliché. No hand-drawn illustration
  style has been established (none was provided) — imagery slots are photo
  placeholders (see Iconography/Imagery below), not illustration.
- **Animation:** subtle and physical, Apple-style — short durations
  (160–420ms), `cubic-bezier(0.25,1,0.5,1)`-style ease-out curves, no bounce/
  overshoot, no spin loaders. Elements fade + rise 8–12px on entrance; state
  changes cross-fade rather than jump cut. Nothing loops decoratively.
- **Hover states:** on dark surfaces, hover lightens (surface steps up one
  neutral stop, e.g. card → card-hover) rather than darkening. On the brand
  button, hover steps the fill to a lighter cyan (`--brand-400`) — never
  adds a drop shadow or scale-up.
- **Press states:** a slight scale-down (`transform: scale(0.97)`) plus a
  step to the darker `--brand-600` fill; feedback is instant (~100ms), no
  easing delay.
- **Borders:** hairline, low-contrast, translucent white-on-dark
  (`--border-subtle` at 8% white, `--border-default` at 14%) rather than a
  solid grey — borders should read as a seam in the dark surface, not a
  drawn line. Brand-colored borders (`--border-brand`) are reserved for
  focus/selected states only.
- **Shadows:** soft and diffused, dark and low-opacity (never a hard black
  drop shadow) — `--shadow-md`/`--shadow-lg` use large blur radii and
  negative spread so cards look like they're resting just above the canvas,
  not cut out of it. A `--shadow-glow-brand` variant exists for the single
  primary CTA per screen only.
- **Glass / blur:** used narrowly — sticky nav bars and modal scrims use
  `saturate(160%) blur(20px)` so content can be perceived moving underneath;
  cards and buttons are always solid, never glassy.
- **Imagery color vibe:** cool, high-contrast, slightly desaturated toward
  charcoal — should feel shot in cool studio light, never warm/golden-hour.
  No grain/film filter has been established.
- **Corner radii:** soft throughout, scaling with element size — 10px on
  small controls (inputs, tags), 14–20px on cards, up to 28px on large
  feature panels, full pill (999px) on badges/buttons where called for. Never
  fully square, never a tiny 2–4px "barely rounded" corner.
- **Cards:** solid `--surface-card` fill, hairline `--border-subtle` border,
  `--radius-lg` corners, `--shadow-md` at rest; hover swaps the fill to
  `--surface-card-hover` and shadow steps to `--shadow-lg` — no border-color
  change, no colored left-border accent (explicitly avoided).
- **Layout rules:** content is centered in a `1200px` max-width column with
  a fluid gutter (`clamp(20px, 5vw, 80px)`); nav is a fixed/sticky glass bar;
  hero sections are full-bleed dark, everything else sits inside the
  contained column.
- **Transparency:** reserved for translucency-as-depth (borders, scrims,
  glass nav) — never used to fade out primary content or type.

## Iconography

No icon font, sprite sheet, or icon set was supplied with the brand brief.
This system substitutes **Lucide** (MIT-licensed, thin 1.5–2px stroke,
rounded caps — a close cosmetic match to the brand's soft-radius, restrained
aesthetic) loaded from CDN (`unpkg.com/lucide-static` or the `lucide` CDN
script). This is a **flagged substitution** — if plyr.tech has an existing
icon set, swap it in and update this note.

- **Style:** outline-only, 1.5–2px stroke, no filled icons, no duotone.
- **Usage:** icons pair with UI labels (buttons, nav, form fields) at 18–20px;
  never used decoratively/oversized as illustration.
- **Emoji/unicode-as-icon:** not used anywhere in the brand voice (see
  Content fundamentals) — this extends to UI: no emoji or unicode glyphs
  standing in for icons.
- **Logo/marks:** only asset available is `assets/logo/plyrtech-logo.png`
  (charcoal wordmark + cyan dot, transparent background). No icon-only
  lockup, no alternate color lockups, and no illustration set were provided
  — do not invent one. Imagery placeholders in the UI kit use plain solid-
  color panels labeled "Photo placeholder", never generated/illustrated art.

## Fonts

Inter is the specified typeface and is loaded via Google Fonts
(`tokens/typography.css`) rather than self-hosted — no font binaries were
provided, and Inter is freely available at fonts.google.com so no visual
substitution was necessary. If plyr.tech has licensed a variable-font
package or a hinted local build, drop the `.woff2` files into
`assets/fonts/` and swap the `@font-face`/`@import` in `tokens/typography.css`
to point at them.

## Intentional additions

No component library or existing product was provided, so the full standard
component set was authored from scratch, sized to a typical marketing site +
product studio's needs: Button, IconButton, Badge, Tag, Card, Input, Select,
Checkbox, Radio, Switch, Tabs, Dialog, Toast, Tooltip.
