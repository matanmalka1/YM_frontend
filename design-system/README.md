# Design System Dashboard

Static, dependency-free showcase of the YM Tax CRM design language.
Hebrew-first, RTL, Heebo. Values mirror the **implemented code** —
`../src/index.css` (`@theme`) and `../src/components/ui` primitives — which is
the source of truth (see `../DESIGN.md`). If a value drifts, regenerate from the code.

Reflects the real app: blue `#007aff` primary, a **light top navbar** (not a dark
sidebar), `rounded-full` buttons, `rounded-3xl` cards, slate-tinted shadows,
and indigo as the `info` tone.

## Run

Open `index.html` in a browser, or serve the folder:

```bash
npx serve frontend/design-system
```

## File architecture

```
design-system/
├── index.html          # markup only — structure + content, no inline CSS rules
├── README.md           # this file
├── css/
│   ├── tokens.css      # :root design tokens (colors, radius, shadow, motion) — single source
│   ├── base.css        # reset, body, typography scale helpers (.t-*)
│   ├── layout.css      # app shell: sidebar, topbar, content, section scaffold
│   └── components.css   # reusable widgets, one block per primitive
└── js/
    └── nav.js          # scroll-spy: active sidebar item
```

Load order matters: `tokens → base → layout → components`.
Each component block in `components.css` maps to a primitive in
`src/components/ui/primitives` (Button, Badge, Card, ProgressBar, …).

## Sections

Base — colors · typography · shapes/radius.
Components — buttons · badges · inputs · stat cards · cards · tables · modal+drawer · feedback/states.

## Editing

- Change a value once in `tokens.css`; everything downstream updates.
- Add a component: new block in `components.css` + new `<section>` + nav link in `index.html`.
