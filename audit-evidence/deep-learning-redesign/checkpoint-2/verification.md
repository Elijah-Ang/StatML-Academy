# Deep Learning renderer checkpoint 2 — verification record

Date: 2026-08-29

Scope: Chapters 5–8 in the module-local renderer. Chapters 9–12 remain on the
bundled renderer and were not redesigned or re-authored in this checkpoint.

## Exact files in scope

- `modules/deep-learning-renderer.js` — added the deterministic Chapter 5–8
  scene branches, state reads, learning-step trace, and ownership expansion
  from Chapters 1–4 to Chapters 1–8.
- `modules/deep-learning.html` — bumped the module-local renderer asset query
  to `checkpoint-2` and updated the fallback comments to identify Chapters
  9–12. No authored chapter data, controls, values, captions, IDs, or ARIA
  structure was changed.
- `modules/deep-learning-renderer.css` — remains the existing scoped
  Checkpoint 1 boundary; no shared handwritten-theme file or other module was
  changed for this checkpoint.

No image assets were added. No global Canvas or RAF monkey patch was added.

## Implemented visual contract

### Chapter 5 — Inside one neuron

- Three named feature rows (`ear shape`, `fur texture`, `background`) now read
  left-to-right into a measured accumulation rail and `Σ` node.
- Each row exposes `x × w = product` in a dedicated label lane above its
  connector. Connector width is derived from `|w|`; negative and zero weights
  remain visible with coral/dashed or muted/dashed lines.
- The bias is attached to the sum node. The equation `z = Σ(wᵢxᵢ) + b`, the
  intermediate `z`, a distinct `ReLU(z)` gate, and an output bar/value are all
  rendered from the four authored sliders.
- The compact/tight layout stacks the activation path without shrinking the
  input labels below a usable size. A line-weight legend remains in the footer
  lane.

### Chapter 6 — Depth builds features

- The scene is a clean pixels → edges → textures → parts → `DOG · class`
  sequence. Cards are separated in a measured desktop row and a vertical
  compact/tight stack; every layer label remains visible above its card.
- Marks become more composed from left to right, and the final class is joined
  by an explicit arrow. There is no wash, looping animation, or redraw-time
  random state.

### Chapter 7 — How learning happens

- The four steps occupy reserved forward → loss → backprop → update quadrants;
  arrows run outside the node outlines and the center contains only current
  loss, batch, and rate information.
- The module-local click capture tracks the authored `Run one learning step`
  action. The marker and current loss advance only when the tracked step
  changes. Changing learning rate redraws the update vector/step-size cue but
  does not rewrite the current loss or marker until a step is run.
- The scene is static between state/size changes and has no idle RAF.

### Chapter 8 — Learn patterns, not the answer sheet

- A deterministic 24-epoch training curve descends while the validation curve
  turns upward after its best point (epoch 10 in this data series).
- The explicit training/validation legend, best-validation callout, current
  epoch tick, and single green checkpoint line/dot occupy separate lanes.
- `underfit`, `useful fit`, and `overfit` zones sit below the x-axis. The range
  input reveals data through the selected epoch; no continuation ghost lines
  or idle animation are drawn.

## State and ownership checks

- Existing Chapter 5 slider ranges/defaults are read from the authored DOM:
  weights `-2…2` (step `.1`), bias `-1…1` (step `.1`), defaults
  `1.2 / .6 / .2 / -.2`.
- The existing Chapter 7 learning-rate range/default is read from the authored
  DOM (`.1…1`, step `.1`, default `.5`); the existing button remains the only
  learning-step action.
- The existing Chapter 8 epoch range/default is read from the authored DOM
  (`1…24`, default `12`).
- `rendererCanvas.hidden` and `legacyCanvas.hidden` are mutually controlled
  for active chapters `0…7`; the bundled canvas remains the fallback for
  active chapters `8…11`.
- The public diagnostic hook reports `version: checkpoint-2` and includes the
  live Ch5/Ch7/Ch8 state values.
- The shell's twelve-chapter ARIA normalization and the exact authored
  chapter/narrative contract remain in place.

## Static verification

Run from the repository root:

- `node --check modules/deep-learning-renderer.js` — passed.
- `git diff --check -- modules/deep-learning.html modules/deep-learning-renderer.js modules/deep-learning-renderer.css` — passed.
- `node scripts/build.mjs --validate-only` — passed: 34 pages validated with
  statistical-content and local-link checks.
- Source invariant scan — passed: `sceneFive`, `sceneSix`, `sceneSeven`, and
  `sceneEight` exist; replacement ownership is `active <= 7`; renderer asset
  hooks are `checkpoint-2`; no `requestAnimationFrame` occurs in the
  module-local renderer.

## Browser evidence limitation

Per the checkpoint handoff instruction, no further browser automation was run
after the source pass. An earlier local smoke attempt reached the page and
reported the `checkpoint-2` hook with no console errors at initial load, but
the full chapter-driving pass hung in the bundled page before reliable Ch5–8
captures could be produced. The existing in-app browser transport also timed
out during Checkpoint 1. Therefore this record makes no visual screenshot
claim; desktop `1440×900`/`1280×720`, mobile `390×844`, Ch7 button/rate, and
Ch8 min/default/max states remain for the parent/reviewer browser pass.

## Known tradeoff for review

The replacement renderer itself is static and contains no idle RAF. The
legacy React Canvas remains mounted as a hidden fallback for Chapters 9–12,
so the bundled effect's historical animation loop is not removed in this
checkpoint. Removing that loop requires a separate, deliberate bundle/source
boundary decision and was intentionally excluded from the scoped Ch5–8
change.

