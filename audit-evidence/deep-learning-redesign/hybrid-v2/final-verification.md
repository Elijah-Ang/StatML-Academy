# Deep Learning hybrid-v2 — final verification

Date: 2026-08-30

## Outcome

The Deep Learning module now uses an image-generated paper illustration for every chapter, with a restrained module-local live SVG layer for truthful values, selections, paths, and interaction feedback. The legacy fixed-size canvas painter, animation loop, masking patches, and observer feedback loop are not active under the `v2` renderer gate.

The original desktop reading structure remains a narrative column beside one sticky visual stage. At widths of 820px or less, each chapter receives its own normal-flow visual immediately after that chapter's introduction; the shared sticky stage is removed from the phone layout.

## Active visual set

- 12 chapters are covered by 16 active generated plates.
- Chapter 4 has image, text, and audio plates.
- Chapter 9 has CNN, RNN, and Transformer plates.
- All active asset provenance and prompt files are recorded in `assets/deep-learning/hybrid-v2/manifest.json`.
- Generated plates provide paper, pencil, tape, torn-edge, crayon, and marker materiality; the SVG layer provides only changing values, selections, routes, thresholds, plots, and interaction feedback.
- Chapter 8 uses a targeted image-generation edit (`ch08-training-chart-material-v2.png`) that removes baked decorative swatches which competed with the live training curves.

## Narrative material treatment

`modules/deep-learning-materials.css` scopes the left column to ruled paper, taped notes, highlighter strokes, hand-ink borders, and handwritten type without changing the authored chapter content. Digital-looking panel chrome is suppressed or restyled within the Deep Learning module only.

## Final visual corrections

The independent cleanup reviews identified duplicate live geometry, excessive highlight slabs, aspect-ratio distortion, and several annotation collisions. The clean-6 renderer resolves them:

1. All plates and live SVGs share a `1000 × 666` viewBox with aspect-preserving composition; mobile no longer stretches or crops the artwork.
2. Tags, notes, and labels no longer receive automatic highlight rectangles. Plate-owned cards, grids, scraps, waveform marks, and map cells are not redrawn by the live layer.
3. Chapter 2 uses one bounded observation focus; Chapter 3 keeps train/validate/test details and the sealed-test cue inside safe paper insets.
4. Chapter 4 removes duplicate audio samples/window marks; Chapter 5 keeps input labels inset and uses only thin weighted wires, Σ, and ReLU output.
5. Chapter 7 retains one readable training loop and moves its marker only after an authored learning-step action.
6. Chapter 9 removes duplicate CNN frames, separates feature-map labeling, and keeps Transformer attention/context connectors clear of their labels and cards.
7. Chapter 11 moves its matrix heading away from tape and grid rules while keeping threshold metrics in their own lanes.

## Runtime verification

Automated coverage ran at 1440×900 and 390×844 across every chapter.

- 12/12 desktop chapter captures: no console warnings/errors, renderer diagnostics, collisions, or horizontal overflow.
- 12/12 mobile chapter captures: no console warnings/errors, renderer diagnostics, collisions, or horizontal overflow.
- 12 article-local mobile scene hosts were confirmed.
- Chapter 2 dataset toggle, Chapter 4 modality switch, Chapter 5 sliders, Chapter 7 learning step, Chapter 8 epoch state, Chapter 9 architecture switch, and Chapter 11 threshold control update the live layer.
- Motion is event-driven and finite. WAAPI animations settle to zero; no idle RAF or continuous animation loop exists. Chapter 7 physically travels between state coordinates and Chapter 8 draws only its changing curve.
- Reduced-motion verification at both viewports produces zero running or pending animations while preserving final state.
- The legacy canvas count is zero under the v2 gate.
- The MutationObserver watches only authored shell/control state and does not observe renderer-owned SVG replacements; the previous vibration loop is removed.

Machine-readable result: `final/runtime-report.json`.

Representative clean-6 captures are stored in `final/`, including the final Chapter 3 inset correction and desktop/mobile examples of the cleaned live layer.

## Static verification

- `node --check modules/deep-learning-hybrid-renderer.js` — pass
- `git diff --check` for all Deep Learning hybrid-v2 files — pass
- `node scripts/build.mjs --validate-only` — pass, 34 pages
- `npm test` — pass, including the logistic browser stage/final reveal test

## Scope

Only the Deep Learning module, its module-local renderer/material styles, generated scene assets, and Deep Learning audit evidence were changed for this pass. No shared handwriting theme or other module implementation was modified.
