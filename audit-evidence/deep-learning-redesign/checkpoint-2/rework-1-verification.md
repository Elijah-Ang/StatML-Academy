# Deep Learning checkpoint 2 — targeted geometry rework 1

Date: 2026-08-29  
Scope: Chapters 5–8 only; source/static verification after the two checkpoint-2 cross-reviews.  
Browser automation: intentionally not run, per the checkpoint instruction.

## Implemented blockers

### Chapter 5 — Inside one neuron

- Replaced the fixed-fraction activation positions with a measured lane. The
  `z`, `ReLU(z)`, and `output` widths are explicit for compact and desktop
  layouts, the minimum gap is enforced, and the lane is centered only after
  checking the available width.
- Both activation arrows now start/end from the measured card bounds. The
  input-rail arrow also ends from the measured Σ radius rather than a fixed
  `31px` inset.
- An extremely narrow fallback stacks the activation cards vertically with
  forward-only arrows instead of allowing a squeezed or reversed horizontal
  path. Slider-derived products, `z`, ReLU, output, line weight, and negative/
  zero styling remain unchanged and live.

### Chapter 6 — Depth builds features

- Compact stack height is now measured from the actual canvas height. Card
  height, card start, inter-card arrow gap, class gap, and footer reserve are
  calculated together; the class chip is placed after `parts` with a positive
  connector lane and no upward `min()` clamp.
- Compact inter-sheet arrows use a 16px lane, and the final class arrow uses
  the same measured rhythm.
- Desktop reserves a 32px/40px final class gutter (depending on width), so the
  rendered connector is materially wider than the previous 2px remainder.
- Edge marks were bounded to the actual compact card height so the short-stack
  fallback does not draw feature strokes outside their sheet.

### Chapter 7 — How learning happens

- Compact side nodes are reduced to 88px so the loop rails have a real
  interior lane. The center loss card width is derived from the rail gap with
  explicit clearance, rather than being fixed at the exact rail-to-rail span.
- The marker remains code-driven and advances only through the existing
  learning-step state. Its `step N` label is now a measured badge selected from
  candidate gutters after rectangle intersection checks against all four loop
  nodes and the center card; it is no longer painted beside the moving dot.
- Learning-rate-dependent update-vector rendering and the existing loss/step
  state contract are preserved.

### Chapter 8 — Learn patterns, not the answer sheet

- Compact layouts use separate training and validation legend rows on the
  left, while the best-validation chip remains in its dedicated right lane.
- The compact chart's `loss` title is rotated in a dedicated y-axis gutter,
  leaving tick labels right-aligned at their original tick lane.
- Curves, epoch slicing, best-validation marker, regime zones, and authored
  slider behavior are unchanged.

## Cache and ownership

- Bumped the module-local asset query strings in
  `modules/deep-learning.html` to `20260829-checkpoint-2-rework-1`.
- Updated the renderer canvas dataset/version to `checkpoint-2-rework-1`.
- No shared handwritten-theme file, other module, or Chapter 9–12 renderer
  branch was changed. No image-generation asset was added.

## Static checks

All requested checks passed:

```text
node --check modules/deep-learning-renderer.js
git diff --check
node scripts/build.mjs --validate-only
Validated 34 pages with statistical-content and local-link checks.
```

## Known limitations / review handoff

- No browser capture, screenshot, interaction test, console check, or idle-frame
  measurement was attempted in this rework, as explicitly requested. The
  651px desktop and 375/390 compact geometry is therefore source-derived and
  still needs live visual review by the parent/reviewers.
- Chapters 1–4 remain under the approved module-local renderer boundary; this
  pass applied no new Ch1–4 visual changes. Chapters 9–12 remain on their
  existing fallback painter and were not inspected or modified here.

## Final art-review follow-up

The remaining desktop Chapter 8 gutter blocker from
`art-crossreview-rework-1.md` is now repaired. The `loss` title uses the same
rotated, dedicated y-axis gutter at every width; y-axis ticks remain in their
right-aligned `plotLeft - 9` lane. The compact legend rows, chart geometry,
controls, and Chapters 5–7 changes are otherwise unchanged.

The module-local cache query and renderer identity are now
`20260829-checkpoint-2-rework-2` / `checkpoint-2-rework-2` respectively.
Static validation was rerun after this follow-up:

```text
node --check modules/deep-learning-renderer.js
git diff --check
node scripts/build.mjs --validate-only
Validated 34 pages with statistical-content and local-link checks.
```
