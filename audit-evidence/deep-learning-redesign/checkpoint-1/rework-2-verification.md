# Deep Learning checkpoint 1 — rework 2 verification

Date: 2026-08-29

## Scope

This pass addresses the two geometry blockers in `visual-crossreview.md` and
the additional Chapters 2/4 art-direction blockers in `art-crossreview.md`.
Chapters 5–12, shared handwritten-theme files, and other modules were not
touched.

## Changes reviewed

- `modules/deep-learning.html`
  - Bumped both module-local renderer URLs to
    `?v=20260829-checkpoint-1-rework-2` so the CSS, JS, and hero-cue fixes
    cannot be hidden by a stale browser cache.
- `modules/deep-learning-renderer.js`
  - Added a documented width-and-height compact-layout contract
    (`width < 520px && height >= 456px`) for Chapters 1–4. Narrow desktop
    columns therefore stay in the contained horizontal composition instead
    of selecting a taller mobile scene than their canvas can hold.
  - Kept Chapter 2’s 3×3 tile coordinates identical between toggle states;
    made angle (seeded dog tilt), light (single highlight), and background
    (context/grass cue) visible in the representative state; and anchored the
    shortcut callout with one coral ring/leader to the stable bottom-right
    grass cue.
  - Moved the representative mobile Chapter 2 explanation to the final
    measured baseline and shortened it to one contained sentence. The biased
    mobile callout now follows the contact sheet rather than being bottom-
    anchored to an arbitrary canvas coordinate.
  - Added a highlighted pixel in the image source and matching marks in all
    three channel sheets; moved the desktop shape annotation into a separate
    measured lane below the output stack; and labelled the bridge `same pixel`.
  - Added a 44px mobile text-token gutter for the DOG lookup arrow, four
    deterministic waveform sample dots/ticks, a quieter 10×5 spectrogram, and
    lower-opacity/less-dense notebook rules.
- `modules/deep-learning-renderer.css`
  - Raised the hero cue selector specificity to beat the shared
    `body.hw-handwritten .hw-marker-label { position:relative!important }`
    rule while preserving the bounded desktop/mobile lower-right placement.

## Mechanical checks

All passed on the working tree:

```text
git diff --check
node --check modules/deep-learning-renderer.js
node scripts/build.mjs --validate-only
Validated 34 pages with statistical-content and local-link checks.
```

## Browser gate

The connected in-app browser still times out during tab acquisition,
navigation, DOM evaluation, and screenshot capture. Consequently, the
1440×900, 1280×720, 390×844, and 375×844 visual matrix, interaction clicks,
scroll-width check, console check, and delayed pixel-stability captures remain
pending live-browser access. No browser result is claimed here.
