# Deep Learning checkpoint 1 — visual cross-review

**Review mode:** read-only; no application source files changed.  
**Scope:** Chapters 1–4 only, current checkpoint-1 renderer/CSS.  
**Requested viewports:** 1280×720 and 390×844.  
**Reviewed files:** `modules/deep-learning.html`, `modules/deep-learning-renderer.js`, `modules/deep-learning-renderer.css`, and the existing checkpoint verification record.  
**Live-browser status:** FAIL/PENDING. The connected Chrome extension could list the existing local tabs, but tab acquisition, fresh-tab creation, page DOM control, screenshots, and page evaluation timed out repeatedly. Therefore console state, pixel screenshots, click-state screenshots, and delayed pixel comparisons could not be independently certified in this cross-review. The findings below separate source-level PASS/FAIL from the unverified live visual gate.

## Checkpoint verdict

**Overall: FAIL for visual acceptance; implementation is not ready for checkpoint approval.**

The ownership boundary and mobile normal-flow rule are directionally correct, and the new renderer is deterministic/code-first. However, source-level geometry exposes a definite mobile Chapter 2 clipping defect and a definite desktop Chapter 4 image-state label collision. The live visual/console/stability gate also remains unverified because the browser connection is unavailable.

## Per-chapter PASS/FAIL matrix

| Chapter | Source-level verdict | Exact finding | Evidence / impact | Required revision |
|---|---|---|---|---|
| 01 — Define the finish line | **PASS*** | Desktop and mobile formulae keep the input tile, arrow, three probability rows, winner chip, and sum note inside the intended canvas at the reviewed sizes. The composition has one clear input → output path and no known coordinate collision. | `deep-learning-renderer.js:268–308`; at 390px-class canvas (`~366px` wide, 456px high), the winner chip ends at ~349px and the sum note baseline is 433px. Live pixels and font-rendered containment remain unverified. | Capture live desktop/mobile frames. Confirm the 89/8/3 labels remain readable and that the cat silhouette, arrow, bars, and chip do not visually merge at actual rendered font metrics. |
| 02 — Collect reality, not shortcuts | **FAIL** | Representative (non-biased) mobile scene places the explanatory paragraph below the canvas: `y = gridY + tile*3 + 58` gives ~368px; `writeWrapped` begins at `y + 116` (~484px) while the mobile canvas is only 456–491px high. The final one or two lines are clipped. | `deep-learning-renderer.js:333–364`; at 366px canvas width, tile clamps to 82px and the non-biased paragraph begins at ~484px. This is a deterministic canvas-bound failure, not a visual taste issue. The biased callout does not share this exact overflow but needs live toggle review. | Move the explanatory paragraph into a reserved lower lane, reduce preceding spacing, or increase the scene’s mobile canvas height with a documented bound. Verify both toggle states retain identical tile positions and no clipped text. |
| 03 — Split before you tune | **PASS*** | Source-level desktop/mobile positions are contained: source card, arrow, three split cards, sealed mark, and “keep the exam sealed” note fit within the current scene heights. Percentage and role labels are inside each card. | `deep-learning-renderer.js:368–418`; at 366×456, cards end at ~318px and the seal note baseline is ~356px. Live visual and state-independence checks remain unverified. | Capture the live scene. Verify the 70/15/15 labels do not collide with card edges, and confirm Chapter 2’s bias toggle does not alter Chapter 3 (the renderer itself does not read `biased` for Chapter 3). |
| 04 — Turn examples into tensors | **FAIL** | Image desktop layout places `colour channels` and the centered `height × width × colour` label in the same horizontal/baseline lane. At the 1280 layout’s likely ~653px canvas, the first begins around x=426 and the second spans approximately x=327–467 at y≈242–244, creating overlap. The same collision persists or grows at the ~719px 1440 layout. | `deep-learning-renderer.js:433–467`; `channelStack()` writes its label at `x + card + 30`, while `sceneImageTensor()` writes the shape note centered at `width*.61` on nearly the same baseline. Text widths depend on the loaded font, so this must be visually confirmed, but the anchors are intrinsically competing. | Give channel label and shape note separate lanes (e.g. channel label below stack; shape note below the arrow/output), or place them in a measured non-overlapping annotation column. Recheck image, text, and audio tabs at both sizes. |

\* `PASS*` means source-level geometry has no known defect from static inspection; it is not a final visual PASS until live screenshots, console, and frame-stability evidence exist.

## Interactive-state review

### Chapter 2 toggle

- **State wiring:** source-level PASS. `getState()` reads `.control-panel .toggle-button[aria-pressed]`, and the `MutationObserver` watches `aria-pressed`; the renderer redraws on the state-key change (`deep-learning-renderer.js:611–618, 658–684`).
- **Representative state:** FAIL because the lower explanatory paragraph is outside the mobile canvas bounds as described above.
- **Biased shortcut state:** source-level geometry appears contained, with the callout positioned at `height - 98`; live visual confirmation is pending. Verify that the coral callout clearly points to the stable background cue and that no tile is obscured.
- **Comparison requirement:** tile positions must remain stable when toggling so the learner compares evidence rather than a newly arranged grid. The current code uses deterministic tile seeds and unchanged grid coordinates; live click verification is pending.

### Chapter 4 image/text/audio tabs

- **State wiring:** source-level PASS. `getState()` selects `.tensor-control button[aria-pressed="true"]` and maps button text to `image`, `text`, or `audio`; changes are observed through `aria-pressed` (`deep-learning-renderer.js:611–618, 675–684`).
- **Image:** FAIL from the desktop channel-label/shape-note lane collision above. Mobile stacking is otherwise structurally contained.
- **Text:** source-level conditional PASS. Mobile uses two token rows, with the `DOG` lookup arrow running through the gap between the second-row cards rather than through card bounds; embedding row and footer note fit. Live readability and card seam absence are unverified.
- **Audio:** source-level conditional PASS. Desktop waveform/window → spectrogram and mobile vertical stack are contained by calculated coordinates. Live axis-label readability and actual line/heatmap balance are unverified.
- **No old mask:** CSS source-level PASS for the new renderer: `.canvas-wrap::before/::after` are disabled under the checkpoint flag (`deep-learning-renderer.css:35–37`), and the old branch style/mask script returns early under the flag. Confirm in live pixels that no seam or legacy canvas is visible.

## Active-scene ownership and containment

**Source-level: PASS with a known performance caveat.**

- `deep-learning-renderer.js:621–635` creates one module-local renderer canvas and identifies the React canvas as legacy.
- `deep-learning-renderer.js:658–673` sets `rendererCanvas.hidden = !ownsScene` and `legacyCanvas.hidden = ownsScene`, so Chapters 1–4 should show only the replacement painter and Chapters 5–12 should restore the legacy painter.
- `deep-learning-renderer.css:14–33` gives the two canvases deterministic stacking and hides `[hidden]` canvases.
- The legacy React painter still runs its idle `requestAnimationFrame` while hidden; this should not paint visibly but remains a CPU/stability concern for later cleanup.
- `deep-learning-renderer.css:44–67` changes the visual stage to `position: static`, `height: auto`, and a reserved mobile canvas block at `≤820px`, which should remove the former mobile article occlusion. This is source-level PASS; actual anchor settling and article visibility require the live browser pass.

## Static stability

**Source-level: PASS; pixel gate UNVERIFIED.**

- The replacement renderer contains no `requestAnimationFrame`; it redraws on state, size, mutation, and font-ready changes only.
- Roughness is seeded via `hash`, `random`, and deterministic `jitter` calls. No fresh random value is generated per animation frame in the new renderer.
- The hidden legacy painter still has an idle animation loop, but the visible Chapter 1–4 canvas should be stable if ownership is applied correctly.
- Required live test remains: capture each static state twice 500–1000ms apart and compare pixels, including Chapter 2 representative/biased and Chapter 4 image/text/audio.

## Console and browser evidence

**FAIL/PENDING.**

The current Chrome extension session could list these local tabs:

- `http://127.0.0.1:4173/modules/deep-learning.html`
- `http://127.0.0.1:4174/modules/deep-learning.html`
- `http://127.0.0.1:8765/modules/deep-learning.html`

However, acquisition/control/screenshot/evaluation operations timed out repeatedly. No console error result, viewport screenshot, toggle click, tensor-tab click, or delayed frame comparison can be honestly claimed for this checkpoint.

## Required revisions before visual re-review

1. Fix Chapter 2 representative mobile paragraph placement/clipping.
2. Separate the Chapter 4 desktop image `colour channels` and `height × width × colour` annotation lanes using measured text bounds.
3. Capture live Chapters 1–4 at 1280×720 and 390×844 after those fixes.
4. Click Chapter 2’s toggle in both directions and verify stable tile positions, clear shortcut emphasis, and no clipping.
5. Click Chapter 4 image/text/audio tabs at both sizes and verify the active scene owns the only visible canvas; confirm no legacy seam/mask remains.
6. Verify article anchors at 390×844 after scrolling/dot navigation; visual stage must remain in normal flow and not cover headings or controls.
7. Read console logs and perform two delayed captures per static state; record zero unexpected errors and pixel-stable visible scenes.

## Acceptance gates

- Chapters 1–4 receive live visual PASS at both requested viewport sizes; no conditional PASS remains.
- No semantic label or explanatory line is clipped or overlaps another label, shape, arrow, or canvas edge.
- Chapter 2 toggle changes evidence emphasis without changing tile geometry or introducing unrelated chapter state.
- Chapter 4’s three tabs each have a distinct, legible composition with no image-state annotation collision.
- Only one canvas painter is visible per active scene; no CSS seam/mask hides authored pixels.
- Mobile stage is normal-flow and anchor navigation leaves the article heading visible below the top bar and visual block.
- Console is clean and repeated static captures are pixel-stable.

