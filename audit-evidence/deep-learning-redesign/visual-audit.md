# Deep Learning visual defect matrix

**Audit mode:** read-only. No application source files were changed for this report.  
**Evidence basis:** the already-captured Deep Learning screenshots and runtime measurements in `audit-evidence/deep-learning-final/`, `audit-evidence/advanced-crossreview/`, `renderer-audit.md`, and `art-direction.md`. No additional screenshots were taken for this checkpoint.  
**Viewports represented:** 1440×900, 1280×720, and 390×844 evidence; interactive branches were exercised for dataset bias, image/text/audio tensors, CNN/RNN/Transformer, weights/bias, learning, epoch, and threshold states.

## Executive finding

The module is still fundamentally a fixed 720×540 Canvas drawing with a global Canvas monkey-patch, branch-specific CSS masks, continuous repainting, and a separate hero Canvas. The latest pass changes surface styling but does not repair scene geometry or reading order. This is an architectural visual-quality problem, not a few isolated offsets. The rebuild should preserve the lesson shell and state contract while moving Deep Learning scene geometry into one editable, module-local, responsive renderer.

## Stage-by-stage defect matrix

| Stage / concept | Current visual defect | Mobile / responsive defect | Severity | Recommended decision |
|---|---|---|---|---|
| 01 — Define the finish line | Oversized cat/input tile dominates; two unexplained white square marks; tan background slab merges input and output; arrow is isolated; probability labels are too small and weakly grouped. | Fixed drawing scales below comfortable label size; input/output relationship becomes hard to scan. | High | Recompose as quiet input tile → one arrow → compact, clearly selected probability list. Remove the white marks and unrelated slab. Optional text-free subject cutout only if code silhouette remains poor. |
| 02 — Collect reality, not shortcuts | Repeated silhouettes compete with large rounded color blocks; pause-shaped mark and bottom annotation have no clear referent; shortcut outline reaches edges and does not identify one causal cue. | Contact sheet and annotations become cramped; clipped background panels make the shortcut state ambiguous. | High | Use a bounded 3×3/4×3 contact sheet and one highlighted shortcut comparison. Keep tile positions stable between states; remove pause mark, stray blocks, and off-canvas outline. |
| 03 — Split before you tune | Dot cloud does not visibly become train/validation/test; role labels, percentages, and mostly empty cards have no strong reading order; `test set`/`15%` collide; bottom-right rounded region reads as an accidental crop. | Fixed three-card layout shrinks and leaves labels detached from roles. Chapter 2 bias state can leak into Chapter 3 without an explicit control. | High | Draw one compact dataset → partition flow with three labelled roles, jobs, percentages, and one sealed-test mark. Isolate leakage as an explicit alternate state, if retained. |
| 04 — Turn examples into tensors | Image branch is too sparse; text branch has token/ID/embedding collisions and a white seam/mask that hides values; audio waveform, window, and spectrogram compete at one scale. | Long text row reaches the logical edge; all representations shrink instead of reflowing into a legible sequence. | High | Keep image/text/audio as three distinct but parallel translation strips. Use vertical mobile flow; remove seam/mask and duplicate bars; keep labels, IDs, and values live. |
| 05 — Inside one neuron | Most coherent scene, but fixed signal labels, lines, and output become tiny and can touch at narrow widths; controls are visually distant from their target. | Desktop coordinates only scale down; neuron diagram and labels lose legibility. | Medium | Retain coded diagram and live sliders, but use two explicit lanes for inputs/activation/output and anchor the output response near the neuron. |
| 06 — Depth builds features | Four translucent, sheared feature sheets overdraw one another; repeated internal strokes and shared label band obscure the layer progression; large moving white wash has no teaching meaning. | Overdraw and tiny labels become an unreadable translucent stack. | Critical | Rebuild first as separated `pixel → edge → texture → part` columns/cards. Keep one highlighted layer and quiet predecessors; remove the white wash and any cosmetic repeated redraw. |
| 07 — How learning happens | Forward/loss/backprop/update loop is understandable but detached `step N`/loss annotations compete with the cycle; old annotations are suppressed by Canvas filtering rather than correctly laid out. | Loop and badge compress into a small dense cluster; labels can cross the cycle. | High | Reserve four quadrants and one anchored state lane. Keep one meaningful marker after a learning step; render step/loss as live, positioned state, never as a filtered-away pill. |
| 08 — Learn patterns, not the answer sheet | Training/validation curves, underfit/useful/overfit regions, checkpoint line, epoch marker, and chips share narrow lanes; annotations can cross curves. | Chart and legend reduce below reliable reading size; checkpoint/epoch labels have no safe lane. | High | Separate plot, legend, checkpoint annotation, and epoch readout. Keep curves distinguishable in reduced motion and ensure marker never crosses text. |
| 09 — Choose an architecture | CNN stack, RNN state/output, and Transformer tokens use dense, inconsistent compositions. Transformer’s final token extends beyond the 720 logical viewport; curves/labels collide. CNN/transfer edge masks hide pixels rather than fixing layout. | All branches become tiny at 390px; Transformer edge clipping and label collisions worsen. | Critical | Give each architecture a deliberate 3-stage composition with identical safe margins. Use 5–6 Transformer tokens or a two-row layout with an explicit query token; remove paper-colored masks. |
| 10 — Start from a pretrained model | Lavender library/backbone, features, arrow, new-head card, and chips compete; broad animated/hatch-like field dominates; transfer boundary is weak; edge seam hides authored content. | Two-column relationship collapses into overlapping slabs and the hatch field overwhelms the small labels. | Critical | Rebuild as bounded `frozen backbone/features → trainable head`. Any texture is low-opacity and clipped inside the library card; remove broad animated wash and seam. |
| 11 — Make an honest judgement | Confusion matrix, threshold control/curve, metrics, colored callout, and bottom annotation compete for the same space; some callouts are detached from cells. | Matrix, slider, and metrics collapse into one narrow column with little label clearance. | High | Make matrix focal; put threshold and metrics in a separate desktop side lane or mobile below lane. Keep only callouts anchored to a cell or metric. |
| 12 — Ship the whole pipeline | Release card, arrow, route, four stages, moving token, translucent panels, and labels occupy competing layers; route labels sit too close to edge. | Card/route become overlapping slabs and the token/labels have insufficient room. | Critical | Use two bounded columns: release bundle → runtime route, with one moving token. Reserve rows for route labels; remove broad translucent background panels. |

## Exact non-pedagogical or misleading decoration to remove

These are safe removal candidates because they do not encode a state, relationship, value, or control response in the current evidence:

- Chapter 1’s two white square marks and the large tan slab behind the input/output relationship.
- Chapter 2’s pause-shaped mark, unattached lower rounded blocks, and any bottom annotation that has no leader/reference to a tile.
- Chapter 3’s large bottom/right rounded region that is not one of the three dataset roles.
- Chapter 4’s white text-branch seam/mask and repeated vertical separator marks that obscure rather than explain tokenization.
- Chapter 6’s moving white wash, redundant translucent sheet overdraw, and frame-to-frame cosmetic roughness; keep only marks that distinguish feature stages.
- Chapter 10’s broad animated lavender/hatch field outside the bounded pretrained-backbone card and the paper-colored edge seam.
- Chapter 12’s broad translucent background slabs that do not represent a pipeline stage.
- Any branch-specific paper-colored CSS masks, exact-coordinate fill suppression, or duplicate visual layer used to hide old geometry rather than draw the intended scene.
- Continuous random-looking stroke/position jitter on static scenes, pulsing backgrounds, and any decorative animation without a learner-observable state change.

Do not remove meaningful arrows, labels, metrics, controls, selected-state highlights, dataset examples, layer representations, or the production token merely because they are currently misplaced. Reposition or rebuild those in code.

## Global defects that block acceptance

1. **Mobile occlusion:** the sticky visual stage paints over the active article after anchor settling (measured stage approximately `top=54…526.63` while Chapter 1 content begins at approximately `top=74.06`). `pointer-events:none` does not fix paint-order occlusion.
2. **No responsive reflow:** one fixed coordinate system scales down instead of recomposing. There is no collision pass, safe-bound check, text-wrap strategy, or minimum readable text constraint.
3. **Multiple competing render layers:** original Canvas painter + global Canvas hooks + branch CSS masks + shared handwritten decoration + separate hero Canvas. This causes hidden pixels, seams, duplicate overdraw, and brittle behavior.
4. **Continuous repaint of static scenes:** `requestAnimationFrame` runs even where no meaningful animation exists. Roughness counters and time-dependent strokes make static states unstable.
5. **Double scroll ownership:** React’s chapter-dot smooth scroll and a delayed capturing `scrollTo` compete, especially near the top bar.
6. **State coupling:** chapter 2 bias state can influence chapter 3 leakage rendering without an explicit Chapter 3 control, creating an unexplained dependency.
7. **Accessible/content mismatch:** the shell has 12 authored chapters while its ARIA label says “Thirteen chapters”; preserve content but resolve this deliberately during the renderer extraction.

## Acceptance criteria for checkpoint review

### Visual and geometry

- Every scene has one obvious focal object, one reading direction, and no unexplained marks.
- All semantic objects and labels remain within a documented safe rectangle at 375, 390, 1280, and 1440 widths.
- No text is clipped, crossed by a connector, hidden by a pseudo-element, or covered by the sticky stage.
- Static visual geometry is deterministic and visually stable across delayed frames.
- No CSS mask or Canvas interception hides old geometry.
- Handwritten roughness is restrained, seeded, and consistent; it does not read as vibration or noise.

### Interaction and motion

- Every existing control still has its original default, range, keyboard behavior, and accessible name.
- Each stateful control changes one clearly identifiable visual target; unrelated chapters do not change silently.
- Animation is information-bearing only, stops for static scenes, and fully resolves to an understandable still image under `prefers-reduced-motion`.
- Chapter 7/8/11/12 animated cues remain meaningful; cosmetic washes, jitter, and infinite decorative loops are removed.

### Responsive and navigation

- At 390×844, the visual is in normal flow or has exact reserved space; no article heading or control is occluded.
- Mobile is recomposed into stacked lanes where required, not merely a shrunken 720×540 desktop drawing.
- There is no page-level horizontal overflow and all touch targets remain usable.
- Chapter navigation has one scroll owner and top-bar-aware anchor spacing.

### Preservation and implementation

- All 12 chapters, authored text, controls, state defaults, data, and navigation remain present and ordered.
- Deep Learning scene geometry lives in one editable module-local renderer/scene registry.
- Shared handwritten theme files remain untouched unless a separately verified, cross-module-safe change is required.
- Image generation, if used, is limited to text-free transparent supporting art; labels, metrics, arrows, controls, and stateful geometry remain live code.
- `npm run build`, `npm test`, relevant syntax checks, and `git diff --check` pass.
- Final evidence includes every chapter at desktop/mobile, key control states, reduced-motion behavior, static frame comparison, console status, overflow checks, and preservation checks.

