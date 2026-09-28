# Deep Learning renderer — checkpoint 2 cross-review

Date: 2026-08-29  
Mode: read-only source review; no browser retries in this pass.  
Scope: Chapters 5–8, renderer geometry/state/ownership/stability, against the
binding §§05–08 brief and `checkpoint-2/verification.md`.

## Verdict

**FAIL for checkpoint review.** Chapters 5–7 still contain deterministic
geometry blockers at the requested desktop/compact sizes. Chapter 8 passes the
source-level geometry and state review. The existing static verification record
does not exercise these coordinate relationships, and browser evidence remains
unverified per `verification.md`.

## Defect matrix

| Chapter | Result | Exact blocker / evidence | Required revision |
|---|---|---|---|
| 5 — Inside one neuron | **FAIL — P1** | The desktop composition uses fixed fractions for `railX`, `sumX`, `gateX`, and `outputX` (`modules/deep-learning-renderer.js:774–820`). At the actual 1280×720 visual column (approximately 651×418 CSS px), `railX ≈ 338.5`, `sumX ≈ 371.1`, so the rail-to-Σ arrow ends at `sumX−31 ≈ 340.1`—a roughly 1.6 px connector. The ReLU card ends at `gateX+98 ≈ 544.1`, while the output card begins at `outputX ≈ 537`; the cards overlap by about 7 px and the ReLU→output arrow reverses direction (`modules/deep-learning-renderer.js:824–827`). | Derive the desktop path from available width (or switch to the compact/stacked composition before the lane becomes undersized). Enforce positive connector gaps and non-overlapping card bounds for the full supported desktop column. Recheck negative, zero, and maximum slider values after geometry is corrected. |
| 6 — Depth builds features | **FAIL — P1** | The desktop final connector is structurally only `lastGap−16 = 18−16 = 2 px`, independent of canvas width (`modules/deep-learning-renderer.js:901–921`). The `parts` card therefore appears nearly touching/disconnected from the `DOG` class chip; it does not satisfy the brief’s explicit final-class connection requirement. In compact mode, `classY = min(height−60, 377)` (`modules/deep-learning-renderer.js:885–898`); if a narrow compact stage is shorter than the reserved stack (for example h≈330), the class chip is placed inside/against the fourth card and the final arrow reverses/vanishes. | Allocate a real final connector lane (not 2 px), and make compact height a measured layout: either reserve enough stage height or reduce card/step spacing and place the class chip after the fourth card with a positive gap. Assert card, arrow, label, and class-chip bounds. |
| 7 — How learning happens | **FAIL — P1** | The compact layout’s side rails are at `routeLeft = left+nodeWidth/2+8` and `routeRight = right−nodeWidth/2−8`, while the center card is fixed at 96 px wide (`modules/deep-learning-renderer.js:996–1026`). At a 390×844 viewport (renderer canvas approximately 364×491), the rails are x≈134 and x≈230 and the center card spans x≈134–230. Because the center panel is painted after the rails, it covers both vertical rail segments through its y-range; the four-step loop is visually broken. The marker label is also not contained: after two normal `Run one learning step` clicks at the default rate, the marker reaches the right rail and `step N` begins inside the lower-right BACKPROP node (label is always `marker[0]+10, marker[1]−9`; `modules/deep-learning-renderer.js:1031–1033`). | Reserve an actual interior lane around the center card (or route the loop outside it) with positive clearance at compact width. Clamp/choose marker-label placement from node and canvas bounds so every reachable step/rate state stays outside node cards and remains readable. Preserve arrows outside nodes. |
| 8 — Learn patterns, not the answer sheet | **PASS source-level** | Deterministic curves have the intended shape; validation’s best point is epoch 10, the single checkpoint line/dot is gated by the selected epoch, and the training/validation curves are sliced to the selected epoch (`modules/deep-learning-renderer.js:1037–1087`). At the calculated 1280×720 desktop column and 390×844 compact canvas, plot, zones, epoch label, legend, callout, and current tick remain within the canvas using the current formulas (`modules/deep-learning-renderer.js:1043–1108`). | Keep the live browser check for min/default/max epoch and mobile legibility as a release gate. No source blocker found in this pass. |

## Cross-cutting checks

- **State wiring: PASS.** Chapter 5 reads the authored slider values; Chapter 7
  reads the authored learning-rate range and increments only on the captured
  primary learning-step button; Chapter 8 reads the authored epoch range. The
  input/click listeners and state key are wired in
  `modules/deep-learning-renderer.js:1205–1258`.
- **Ownership: PASS.** `rendererCanvas` owns active chapters 1–8 and the legacy
  canvas is hidden for those states; fallback ownership begins at chapter 9
  (`modules/deep-learning-renderer.js:1205–1216`).
- **Visible-renderer stability: PASS source-level.** The module-local renderer
  contains no `requestAnimationFrame`; it redraws on state, resize, mutation,
  input, or font readiness. The historical hidden legacy fallback loop for
  chapters 9–12 is documented in `verification.md` and is not a visible
  Ch5–8 painter, but browser console/frame stability still needs live review.
- **Chapters 1–4 ownership/intactness: PASS source-level.** The same renderer
  owns active `0…7` and the checkpoint-2 changes do not move their dispatch
  boundary; this pass found no new Ch1–4 source blocker.

## Acceptance gate for the next revision

1. At the real visual-canvas dimensions produced by 1280×720 and 390×844,
   every connector must have a positive, intentional lane and every card/chip
   rectangle must be disjoint unless overlap is explicitly part of the visual
   language.
2. Ch5 must show a readable weighted-input → Σ → z → ReLU → output path at
   default, zero, negative, and maximum slider values.
3. Ch6 must show four fully labelled feature sheets and a visibly connected
   final `DOG` class in both row and compact-stack layouts.
4. Ch7 must retain a complete four-step loop with an unobstructed center lane;
   button clicks alone advance loss/marker, rate changes alter the update cue,
   and all marker labels remain inside the canvas and outside node cards.
5. Ch8 must retain one honest training/validation plot, one checkpoint marker,
   and legible regime labels at epoch 1, 12, and 24.
6. After these source fixes, perform the required live browser pass at
   1280×720 and 390×844, including Ch7 rate/button states and Ch8
   min/default/max slider states, then inspect console errors and repeated idle
   frames before marking the checkpoint pass.

