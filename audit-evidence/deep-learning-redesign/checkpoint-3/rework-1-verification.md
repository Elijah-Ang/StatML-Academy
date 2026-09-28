# Deep Learning Checkpoint 3 — targeted geometry rework 1

Date: 2026-08-29  
Scope: review blockers from `visual-crossreview.md` and
`art-crossreview.md`; no later chapters or shared files changed.

## Corrections

- **Ch9 CNN compact:** the bank bottom, output gutter, map size, map top,
  map-label baseline, and footer are now derived together. The bank→map
  connector is at least 12px in the reviewed short-column case and 13–18px
  at the compact phone cases; the `one related feature map` label is below
  the map with a separate 16px lane.
- **Ch9 RNN compact:** `same update rule` now has a descriptor lane at y=64;
  score-card height, score top, prediction chip, and footer are height-derived.
  Short stages use the smaller score card and a shorter drop route while still
  showing exactly three hidden states.
- **Ch9 Transformer:** the Q/K/V row was moved into a reserved descriptor lane;
  the selected-query label sits above the token row, away from all attention
  drops. Three orthogonal attention links remain. The strongest ANIMAL link
  continues through a dedicated vertical hand-off into the explicit context
  result chip.
- **Ch10 compact:** the six feature chips are placed first, then a measured
  source-note lane (`18px` after the second row), and the frozen backbone card
  is sized around that lane. The note cannot sit on the feature row.
- **Ch11 compact:** the threshold rail/label now starts `52px` below the note
  lane, giving a measured `10px` gap below the note chip while retaining the
  truthful threshold-dependent matrix and metrics.
- **Ch12 compact:** operations and footer reserves are established before
  route placement. DECODE's subtitle clears the operations chip by at least
  9px in the reviewed short case and 10px at the phone cases; the operations
  chip clears the footer baseline by 18px. Short routes use a smaller node
  radius and measured inter-node arrows. The noncompact manifest hand-off now
  reaches the first pipeline node/spine edge via an explicit short segment.

## Source geometry checks

The formulas were evaluated against the reviewer canvases (approximately
349×472, 364×491, and 651×418):

```text
phone-375: CNN connector 13px, map-label gap 16px, RNN prediction y=419,
  Ch11 note→threshold gap 10px, Ch12 DECODE center=385, operations y=409
phone-390: CNN connector 18px, map-label gap 16px, RNN prediction y=438,
  Ch11 note→threshold gap 10px, Ch12 DECODE center=404, operations y=428
short-desktop: CNN connector 12px, map-label gap 16px, RNN prediction y=365,
  Ch11 note→threshold gap 10px, Ch12 DECODE center=332, operations y=355
```

These checks assert connector length, note/label clearance, prediction/footer
clearance, Transformer title/context bounds, Ch10 note/card containment, and
Ch12 DECODE/operations/footer disjointness. No generated image or new
decorative mark was added. The Checkpoint 3 surgical legacy `My` guard and
single-canvas ownership are unchanged.

## Validation

Passed after the rework:

```text
node --check modules/deep-learning-renderer.js
git diff --check -- modules/deep-learning.html modules/deep-learning-renderer.js modules/deep-learning-renderer.css audit-evidence/deep-learning-redesign/checkpoint-3
node scripts/build.mjs --validate-only
Validated 34 pages with statistical-content and local-link checks.
```

Renderer version/cache key: `checkpoint-3-rework-1`.

No browser automation was run in this fast re-review pass. Loaded-font pixels,
console output, and screenshot evidence remain for the next visual review.
