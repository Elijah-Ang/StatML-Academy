# Deep Learning renderer — checkpoint 3 cross-review

Date: 2026-08-29  
Mode: read-only source review; no browser retries in this pass.  
Scope: Chapters 9–12, final ownership/legacy retirement, and preservation of
Chapters 1–8. Geometry was evaluated at an approximately 651×418 desktop
visual canvas (the 1280×720 column) and approximately 349×472 / 364×491
compact canvases (375×844 / 390×844 page widths).

## Verdict

**FAIL.** The one-canvas/legacy retirement boundary is sound and Ch11 is
mostly correct, but Ch9, Ch10, and Ch12 retain deterministic layout/semantic
blockers at the required responsive sizes. Ch9’s Transformer also fails the
binding context-result relationship. Ch1–8 dispatch and authored state
contracts remain intact at source level. Browser pixels, console output, and
frame stability remain unverified because this review was explicitly source
only.

## Chapter matrix

| Chapter / branch | Result | Exact blocker or verified condition | Required revision |
|---|---|---|---|
| 9 — CNN | **FAIL — P1** | In every compact CNN composition, the bank→map arrow is only 5px long: it starts at `bankY + bankHeight + 6` and ends at `mapY − 7`, while the `one related feature map` label is drawn at `mapY − 10` (`modules/deep-learning-renderer.js:1281–1296`). At the 375/390 compact targets this puts the label directly over/adjacent to the tiny connector; at the 651×418 short desktop fallback the same 5px connector remains. The scan arrow is adequate, but the output relation reads as a crowded mark rather than a deliberate route. | Reserve a real output gutter (or move the map farther down) and place the label outside the connector’s text envelope. Keep the map visibly downstream of the bank at both compact sizes. |
| 9 — RNN | **FAIL — P1** | Compact score list is fixed at `scoreY=300`, height 126, and the prediction chip is fixed at `predictionY=scoreY+137=437` (`modules/deep-learning-renderer.js:1314–1343`). On the 375×844 canvas (~349×472), the chip occupies y≈437–461 while the footer baseline is y≈453.5, so the footer crosses the chip. On the 651×418 short desktop canvas it occupies y≈397–421, exceeding the canvas bottom and crossing the footer baseline y≈399. The 390×844 canvas (~364×491) clears this particular collision, but the compact formula is not safe across the required widths. | Derive the score/prediction/footer lanes from available height; never let the prediction chip touch the footer or exceed the canvas. Recheck the three hidden-state arrows and score panel after the vertical reflow. |
| 9 — Transformer | **FAIL — P1 semantic** | The selected `IT` query fans links to `ANIMAL`, `WAS`, and `TIRED` (`modules/deep-learning-renderer.js:1346–1382`), but the strongest link terminates at the `ANIMAL` token. The context result chip at y=337 is never connected to that result (`modules/deep-learning-renderer.js:1383–1386`). The binding brief requires the strongest relationship to terminate at the selected query’s context box; the current blank gap makes the final context claim implicit rather than diagrammed. Compact token/QKV rectangles themselves fit at 375/390. | Add one explicit, non-crossing connector from the strongest value/key relationship into the context box, or route the strongest lane directly to the box. Keep the five-token/QKV layout and ensure the connector remains inside the compact canvas. |
| 10 — Transfer learning | **FAIL — P1 at 651×418 fallback; tight at 375** | In compact mode the backbone note is placed at `backboneY + backboneH − 13`, after the two feature rows (`modules/deep-learning-renderer.js:1400–1416`). At 651×418, the backbone is y=48–174, feature row 2 is y=134–158, and `millions of earlier examples` has baseline y=161; its glyph envelope collides with the bottom feature chips. At the 375 compact canvas, row 2 ends around y=177.5 and the note baseline is around y=185, leaving essentially no breathing room. | Allocate a dedicated source-note lane below the feature chips (and size the backbone card from that lane), or reduce row spacing/feature height together. Verify the frozen note remains visibly associated with the backbone and does not cover a chip. |
| 11 — Honest judgement | **PASS with P2 compact spacing defect** | The deterministic `thresholdMatrix` recomputes predictions, counts, and recall/precision/accuracy from the threshold input (`modules/deep-learning-renderer.js:1454–1481`); the matrix, threshold knob, and metrics stay inside the calculated desktop and compact bounds (`modules/deep-learning-renderer.js:1513–1571`). On 375/390 compact, however, the `accuracy is not enough` chip ends at `noteY+26`, while the threshold label baseline is only `noteY+30`; the label’s glyph envelope can sit on the chip’s lower border, especially where the left-aligned text reaches the chip’s x-range. This is a spacing/polish issue rather than a truthfulness failure. | Add a measured vertical gap between the note chip and threshold label, then rerun compact matrix/rail bounds. Keep matrix orientation and threshold-dependent values unchanged. |
| 12 — Production release | **FAIL — P1** | On the 375×844 compact canvas (~349×472), the final DECODE node is centered at y≈412 with a 16px radius (bottom≈428), while the operations chip is y≈420.5–446.5 and is painted after the nodes (`modules/deep-learning-renderer.js:1610–1632`); it therefore covers the lower part of DECODE. At 390×844 (~364×491) the 11px gap clears this node collision, but the formula is not safe at the required 375 width. The operations chip and final `raw request → tested route → decoded answer` footer also have only about 1–2px of vertical clearance in compact and desktop compositions. In the noncompact desktop branch, the manifest arrow ends at `spineX−24` (`modules/deep-learning-renderer.js:1647–1658`), leaving a 24px gap before the pipeline spine with no connecting segment. | Reserve the operations/footer lane before placing the route, move the compact operations note below DECODE without covering its circle, and either end the manifest arrow on the spine or add a short explicit hand-off segment. Keep one vertical spine and a readable manifest. |

## Final renderer boundary

- **One-canvas invariant: PASS source-level.** The page sets the `v1` flag
  before loading the module renderer (`modules/deep-learning.html:19–26`). The
  bundled `My` component has one early `return null` guard before its hooks,
  Canvas JSX, resize listener, or RAF setup (the guarded seam is on
  `modules/deep-learning.html:2413`). The module renderer then creates or
  reuses exactly one `.deep-learning-renderer-canvas`
  (`modules/deep-learning-renderer.js:1729–1741`).
- **Legacy listener/RAF retirement: PASS under v1.** The old adapter is
  `type="text/plain"` inert reference text (`modules/deep-learning.html:1981–1985`),
  and the legacy React visual returns before `useRef`/`useEffect`; its old RAF
  and resize listener cannot mount under the active flag. The executable
  module renderer itself has no `requestAnimationFrame`; it redraws only on
  state/input/mutation/resize/font events (`modules/deep-learning-renderer.js:1789–1824`).
  Raw historical RAF strings remain in unreachable bundle/reference text, so
  a text grep alone must not be treated as a runtime failure.
- **Ownership/dispatch: PASS.** Active indices 0–11 dispatch to the local
  renderer (`modules/deep-learning-renderer.js:1666–1678`), and `ownsScene`
  remains `state.active <= 11` (`modules/deep-learning-renderer.js:1764–1777`).
  `getState` reads architecture tabs and threshold input in addition to the
  existing Ch1–8 controls (`modules/deep-learning-renderer.js:1705–1726`).
- **Ch1–8 preservation: PASS source-level.** The original scene branches remain
  in the dispatch table, the authored twelve-chapter shell/control contract is
  still present, and the renderer’s Ch5–8 state reads remain keyed into redraws.
  No new Ch1–8 source regression was found in this final-boundary review.

## Acceptance gate

1. Fix the Ch9 CNN connector/label lane, RNN compact vertical overflow, and
   Transformer-to-context relationship.
2. Give Ch10’s compact backbone note its own lane.
3. Add Ch11 compact note-to-threshold breathing room.
4. Reflow Ch12 so DECODE, operations, and the footer are disjoint at 375 and
   390 widths; close the desktop manifest-to-spine gap.
5. Then run the required live pass at 1280×720, 1440×900, and exactly
   390×844, exercising all CNN/RNN/Transformer tabs and the threshold slider,
   and confirm one visible canvas, no console errors, no horizontal overflow,
   and pixel-stable idle frames.

