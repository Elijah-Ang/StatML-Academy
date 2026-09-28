# Deep Learning checkpoint 1 — rework 3 verification

Date: 2026-08-29

## Scope

This pass addresses the bounded blockers in
`art-crossreview-rework-2.md`. Chapters 5–12, shared handwritten-theme files,
and other modules remain untouched.

## Changes

- `modules/deep-learning.html`
  - Bumped both module-local renderer URLs to
    `?v=20260829-checkpoint-1-rework-3`.
- `modules/deep-learning-renderer.js`
  - Chapter 2 now places `same class` in the contact-sheet header and starts
    the compact variation legend in an explicit lane below the frame. The
    legend's final row remains separated from the height-based footer at the
    intended 375/390px phone layouts.
  - Chapter 3 now uses one quiet blue/opacity dot treatment and routes the
    dataset arrow into a single shared split fork with short entry ticks to
    the three role cards.
  - Chapter 4 narrow desktop audio now derives the waveform width, output
    spectrogram width, and connector endpoints from the actual output bounds;
    the arrow remains forward and ends in the output gutter at roughly
    450–500px canvas widths. The selected sample inside the amber window is
    redrawn after the translucent window fill.
- `modules/deep-learning-renderer.css`
  - The hero now has one dominant blue outer directional loop with one larger
    clockwise arrowhead and cardinal labels aligned to that loop. The inner
    coral ring is faint and non-directional; the former signal ellipse/crossing
    connector is removed, leaving only a small central hub accent.

## Mechanical checks

Passed:

```text
git diff --check
node --check modules/deep-learning-renderer.js
node scripts/build.mjs --validate-only
Validated 34 pages with statistical-content and local-link checks.
```

## Browser gate

The connected in-app browser continued to time out during acquisition,
navigation, DOM evaluation, and screenshot capture. The requested live
1440×900, 1280×720, 390×844, 375×844, narrow-column, interaction, console,
and pixel-stability evidence therefore remains pending; this record makes no
visual claim beyond source-level bounds.
