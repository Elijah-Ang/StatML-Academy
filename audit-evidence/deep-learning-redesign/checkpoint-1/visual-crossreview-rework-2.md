# Deep Learning checkpoint 1 — rework 2 visual cross-review

**Review mode:** read-only; no application source files changed.  
**Scope:** re-review of Chapters 1–4 after checkpoint-1 rework 2.  
**Requested live sizes:** 1280×720 and 390×844.  
**Live-browser status:** unavailable. The previously used in-app browser timed out during tab acquisition, navigation, DOM evaluation, and screenshots. Per instruction, no further transport retries were made. This report therefore distinguishes source-level verification from the still-pending pixel/console gate.

## Verdict

**Source-level verdict: CONDITIONAL PASS.** Both previously blocking geometry changes are present and logically resolve the defects recorded in `visual-crossreview.md`. Chapter 1 and Chapter 3 renderer paths remain intact. The hero-cue specificity and cache-bust changes are present and correctly targeted.

**Final visual verdict: NOT YET CERTIFIED.** Live screenshots, interaction-state captures, console output, scroll-width checks, and delayed frame comparisons remain unverified. Do not treat the conditional source pass as visual acceptance.

## Previously blocking defects

| Prior blocker | Rework-2 verification | Evidence | Residual gate |
|---|---|---|---|
| Chapter 2 representative mobile explanation clipped below the canvas | **Resolved at source level.** The compact scene now uses a single measured caption baseline at `height - 24`; the multi-line `writeWrapped` explanation is desktop-only. The mobile canvas is reserved at `min-height: 456px` (and `clamp(456px,126vw,520px)`). | `modules/deep-learning-renderer.js:349–381`; `modules/deep-learning-renderer.css:48–66` | At 390×844, capture the representative state and confirm the caption’s actual loaded-font bounds do not touch the canvas edge or the variation labels. Toggle to biased and back; tile positions must remain identical. |
| Chapter 4 image desktop `colour channels` / `height × width × colour` annotation collision | **Resolved at source level.** `colour channels` remains beside the channel stack near its top; the shape label/value have a distinct measured lane below the stack (`shapeLaneY = gy + gridSize + 38`). At the expected desktop geometry, the baselines are separated by roughly 150px. | `modules/deep-learning-renderer.js:485–505, 507–533` | Capture the image tab at 1280×720 and verify font-rendered bounds, arrow label, output stack, and shape values remain separate. Repeat at 390×844. |

## Chapter matrix

| Chapter | Verdict | Findings and required visual check |
|---|---|---|
| 1 — Define the finish line | **PASS*** | The one input → one distribution composition is unchanged and remains source-contained: input tile, arrow, three probability rows, winner chip, and sum note. Compact selection is now height-aware (`width < 520px && height >= 456px`), preventing a short narrow desktop column from using a taller layout than its canvas. Live containment, font readability, and no-merge pixels are pending. |
| 2 — Collect reality, not shortcuts | **PASS*** | The 3×3 tile coordinates are shared across toggle states; seeded dog tilt, a single light cue, and the background/grass cue now make the advertised variation visible. The representative mobile caption is measured; the biased state uses one coral ring/leader aimed at the stable bottom-right grass cue and a bounded callout. Live default/biased screenshots and a toggle stability check are pending. |
| 3 — Split before you tune | **PASS* with P2 polish** | Source path and geometry remain intact: one dataset cloud, one split arrow, equal-height TRAIN/VALIDATE/TEST cards, sealed mark, and footer note. No rework-2 regression is visible in source. The arrow still visually terminates at the upper TRAIN card and equal-height cards rely on their percentage labels rather than proportional sizing; confirm this remains legible in live pixels. |
| 4 — Turn examples into tensors | **PASS*** | Image annotation lanes are separated; the image source has one highlighted pixel and each channel sheet marks the corresponding pixel. The text tab now reserves a 44px center gutter for the DOG lookup arrow, keeping it out of SLEEP/ING cards. Audio has sparse deterministic sample markers and a quieter 10×5 spectrogram. Image/text/audio live captures and tab ownership checks are pending. |

`PASS*` means no known source-level geometry blocker; it is not a final visual PASS without the requested browser evidence.

## Hero cue and cache verification

- **Hero cue specificity: PASS at source level.** The new selector at `modules/deep-learning-renderer.css:229–253` explicitly targets `html[data-deep-learning-renderer="v1"] body.hw-handwritten .scroll-cue.hw-marker-label` and also supplies the `html[data-deep-learning-renderer="v1"] .scroll-cue` fallback. Both set `position:absolute !important`, reset conflicting `top/left`, and place the cue in a bounded lower-right lane. The mobile override at `:295–302` preserves the same specificity pattern with `right:18px`, `bottom:26px`, and a bounded max width. This is designed to beat the shared `body.hw-handwritten .hw-marker-label { position: relative !important; }` rule in `modules/handwritten-theme.css:604–607`.
- **Hero legacy decoration suppression: PASS at source level.** Under the renderer flag, the legacy hero pseudo-elements are disabled (`deep-learning-renderer.css:90–98`) and the renderer supplies its own orbit/signal treatment.
- **Cache bust: PASS at source level.** `modules/deep-learning.html:25–26` loads both renderer assets with `?v=20260829-checkpoint-1-rework-2`; the renderer flag is set before those assets at line 19. This should prevent a stale CSS/JS pair from hiding rework 2. A live network/resource check is still pending.

## Ownership, mobile flow, and stability

- **Canvas ownership: PASS at source level.** `sync()` shows the replacement canvas only for active chapters 1–4 (`active <= 3`) and hides the legacy canvas for those chapters (`deep-learning-renderer.js:696–745`). The renderer canvas is local to `.canvas-wrap`; the legacy canvas is retained for later chapters.
- **Mobile normal flow: PASS at source level.** At `max-width:820px`, `.visual-stage` becomes `position:static`, `height:auto`, and `overflow:visible`, while `.canvas-wrap` receives a reserved 456px minimum (`deep-learning-renderer.css:48–70`). This addresses the previous article/heading occlusion mechanism.
- **Static renderer: PASS at source level, pixel gate pending.** The replacement renderer has no `requestAnimationFrame`; jitter is seeded and state redraws are keyed. The hidden legacy painter may still consume idle RAF/CPU, but it should not be visible while ownership is applied.

## Required acceptance evidence before closing checkpoint 1

1. At 1280×720 and 390×844, capture Chapters 1–4 with no clipping, overlap, seam, legacy mask, or unexpected empty/meaningless decoration.
2. In Chapter 2, capture representative → biased → representative. Confirm the 3×3 tile positions are unchanged, the one active lesson is visually obvious, the ring/leader terminates cleanly, and all text is contained.
3. In Chapter 4, capture image, text, and audio tabs at both sizes. Confirm only the active renderer composition is visible and every annotation has a distinct owner and readable lane.
4. Verify chapter navigation at mobile leaves the article heading below the fixed top bar and never lets the visual stage cover normal-flow content.
5. Record zero unexpected console errors, no horizontal overflow, and two captures per static state 500–1000ms apart with stable pixels.

