# Deep Learning hybrid-v2 live-layer cleanup audit

Date: 2026-08-30  
Scope: the 12 desktop and 12 mobile chapter captures, the hybrid-v2 renderer/styles, and the generated-asset manifest. This is a read-only visual and interaction audit. The source renderer, CSS, materials, and generated plates were not modified.

## Executive finding

The current hybrid-v2 render is deterministic and does not use an active requestAnimationFrame loop, but the live SVG is still visually over-authored. The dominant pollution is structural rather than a small spacing defect:

- tag(), label(), and note() routinely call highlighter(), so nearly every heading, label, value, or note receives a translucent rounded-looking swash;
- live geometry redraws structure already present in several opaque generated plates (CNN grids/filter/map cards, audio sample/spectrogram marks, matrix marks, paper frames, and some paths);
- labels and values are laid out against the 1000 × 666 artboard, not against the paper/lane that owns them;
- the desktop/mobile SVG uses preserveAspectRatio="none", while a 1000 × 666 scene is squeezed into approximately 322 × 492 on mobile;
- .deep-hybrid-live currently permits overflow: visible, so an element that is a few pixels outside its lane becomes a detached or clipped mark;
- debugBounds reports collisions: [] without running a real collision or safe-bound pass;
- live-motion is present as a layer but is not populated, so the current experience does not yet provide semantic “come to life” motion.

The cleanup should be a reduction of live marks, not an attempt to paint over generated art. Generated plates are text-free, but they are opaque RGB PNGs with full-paper backgrounds and, in a number of branches, semantic-looking underdrawings. That asset decision must be resolved alongside the live-layer cleanup.

## Evidence inspected

User-supplied reference captures:

- /Users/elijahang/Desktop/Screenshot 2026-08-30 at 12.06.54 AM.png — neuron/evidence example.
- /Users/elijahang/Desktop/Screenshot 2026-08-30 at 12.07.23 AM.png — prediction scores example.
- /Users/elijahang/Desktop/Screenshot 2026-08-30 at 12.07.11 AM.png — CNN architecture example.
- /Users/elijahang/Desktop/Screenshot 2026-08-30 at 12.07.03 AM.png — learning-loop example.

Current capture set:

- /tmp/deep-hybrid-v2/desktop-ch01.png through desktop-ch12.png, including the ch02-biased, ch04-text, ch04-audio, ch09-rnn, and ch09-transformer branches.
- /tmp/deep-hybrid-v2/mobile-ch01.png through mobile-ch12.png and mobile-actual-ch05.png.
- /tmp/deep-hybrid-v2/report.json.
- QA runner: audit-evidence/deep-learning-redesign/hybrid-v2/qa.mjs.
- Prior runtime assertions: audit-evidence/deep-learning-redesign/hybrid-v2/final/runtime-report.json and final-verification.md.
- Historical visual audit: audit-evidence/deep-learning-redesign/visual-audit.md.
- Binding visual rules: audit-evidence/deep-learning-redesign/hybrid-v2/art-bible.md.
- Asset review: audit-evidence/deep-learning-redesign/hybrid-v2/asset-crossreview.md.

Implementation/asset sources:

- modules/deep-learning-hybrid-renderer.js
- modules/deep-learning-hybrid-renderer.css
- modules/deep-learning-materials.css
- assets/deep-learning/hybrid-v2/manifest.json and its 16 active plate entries.

The supplied and current captures agree on the failure mode: wide translucent blocks, duplicate outlines, connectors that read like code/debug plumbing, and text that leaves its paper or lane. The current QA report’s empty collision list is not visual evidence because the renderer resets collisions to an empty array and does not perform collision detection.

## Decision rubric

Use these action meanings consistently:

- REMOVE: do not render the mark in the stage live layer. If it is baked into an opaque generated plate, it requires a crop/regeneration decision; CSS masking is not an acceptable silent fix under the art-bible rules.
- RETAIN: keep because it carries the chapter’s semantic payload or is a necessary orientation cue.
- REPOSITION: move the live item into its owning paper/lane and give it an explicit safe inset.
- CLIP: constrain a line, ring, scan window, or label to the owning paper/lane with a declared clip path or equivalent geometry. Do not rely on overflow: visible.
- MOTION: convert a retained mark into a bounded, event-driven transition. Motion must settle on a deterministic final state.

## Global cleanup rules

1. Treat the generated plate as a static underdrawing. Do not redraw a frame, grid, circle, paper edge, waveform, map card, or matrix that the plate already owns. A live mark is justified only when it changes with state or explains a relationship that the plate does not show.

2. Make highlighting opt-in and sparse. A tag should be plain ink with, at most, a short underline or one narrow swash behind a single semantic word. Do not highlight every tag, label, note, numeric value, or row. Remove broad translucent slabs and rounded UI-like blocks.

3. Notes are captions, not controls. Use one small rough ink outline only when the caption is needed; keep the text inside it. Remove the full-width highlight behind note text and move the caption outside the plate tear or into a reserved caption lane.

4. Prefer thin pencil/ink relationship lines, with one visual weight and a clear endpoint. Arrows must stop before labels, circles, tape, and paper edges. Avoid parallel colored wires and repeated echo strokes when they do not communicate a second relationship.

5. Give each branch a layout contract: paper bounds, text safe inset, connector corridor, and caption lane. The current fixed 1000 × 666 coordinates should not be stretched into a mobile portrait scene. Use responsive measures or a deliberate mobile crop/reflow; keep the same semantic order, not the same absolute positions.

6. Clip to the owning lane. The live layer should not be globally overflow-visible. A connector may leave one object only through a declared corridor; labels and values may not cross generated-paper boundaries.

7. Keep live state and motion separate. State drawings should be stable and deterministic. Motion should be a short overlay that appears only after an entry or control event, then clears or settles. No per-frame random roughness, Date.now(), requestAnimationFrame vibration, CSS infinite animation, or perpetual pulsing.

8. Preserve the narrative materials in modules/deep-learning-materials.css. Its ruled paper, tape, and card treatments belong to the narrative column; they are not the source of the stage overlays. Any future CSS changes must ensure those pseudo-elements cannot leak into the visual stage.

## Chapter cleanup matrix

### Ch1 — prediction / finish line

Active plate: ch01. Current live elements include INPUT and PREDICTION tags, a blue relation arrow, three scored bars/values, a winner ring, and the “largest score wins” note.

- REMOVE: highlighter blocks behind INPUT and PREDICTION; the translucent bar backplates behind each score; any repeated highlighter behind row text; the oversized/edge-crossing note outline and highlight.
- RETAIN: generated cat and output-paper underdrawing; three score bars, percentage values, and one winner cue; the single “largest score wins” caption if it is still needed.
- REPOSITION: put cat/dog/rabbit labels and percentages inside the prediction sheet with one consistent left/right inset. Keep the value column away from the sheet tear and the 974 artboard edge. Put the winner ring around the selected row/score, not between the row and the paper edge.
- CLIP: bar fills and winner ring to the prediction-sheet lane. The relation arrow should terminate at the sheet edge or selected row, not at a free-floating coordinate.
- MOTION: on chapter entry or prediction-state change, draw the one relation arrow, fill the three bars once in order, then settle the winner ring on the largest score. Changing the scores may interpolate widths for 120–180 ms; no looping bar shimmer.

### Ch2 — dataset / representative variation

Active plate: ch02, neutral and biased states. Current live elements include a large selected-observation circle, a long right rule, a broad callout highlight, an arrow, and state text.

- REMOVE: the oversized circle that spills over neighboring tiles; the broad “look for the dog”/“shortcut: the backdrop” slab; the floating right rule if it does not anchor a real caption; any duplicate live tile frame already in the 3 × 3 plate.
- RETAIN: the 3 × 3 generated observation plate; one selected tile cue; one short explanation and one state arrow.
- REPOSITION: center the selected circle on a single observation, with enough inset to avoid adjacent tiles. Put the neutral/bias sentence in a dedicated right caption lane and keep the arrow short.
- CLIP: selected cue to the tile or plate bounds; caption and arrow to the right lane.
- MOTION: switching biased/neutral should crossfade the selected cue and sentence once (approximately 220–300 ms), with the circle settling on the selected tile. No moving lens or breathing circle.

### Ch3 — dataset split / roles

Active plate: ch03. Current live elements include the source-to-role arrows, role labels/jobs/percentages, role highlighters, a test seal, and the “one dataset” tag. The plate itself includes paper sheets and dotted/path-like marks.

- REMOVE: the large role highlighter slabs; duplicate dotted/path geometry when it is semantically equivalent to the live arrows; rounded live grouping boxes; any label that sits on tape or outside the role sheet.
- RETAIN: source bundle and three role sheets; the three role names, job descriptions, percentages, and one “sealed” cue for test.
- REPOSITION: anchor each arrow to the source/role paper edge. Keep role name, job, and percentage in an internal vertical stack with an explicit bottom inset. Put the sealed cue inside the test sheet, not below its tear.
- CLIP: arrowheads to the inter-paper corridor and all role text/seal to its sheet. If baked dotted paths cannot be removed, suppress the corresponding live route or regenerate/crop the plate.
- MOTION: a one-shot source-to-train/validate/test trace on entry may be retained if it uses one route at a time and stops. Do not animate all three lines continuously.

### Ch4 — representation branches

Active plates: ch04.image, ch04.text, ch04.audio.

Image branch:

- REMOVE: live duplicate channel/pixel rectangles when the plate already supplies the grids; the large tag swash; broad note highlight.
- RETAIN: source image/subject, one translation arrow, channel names, and one compact “picture → channels” explanation.
- REPOSITION/CLIP: keep picture label inside the source paper and channel labels in their three channel lanes; arrow ends before the channel papers.

Text branch:

- REMOVE: the five full-width token highlighters; repeated rectangular token backplates; broad note highlight.
- RETAIN: five token cards/labels and IDs, with one selected token cue only.
- REPOSITION/CLIP: use a five-column row on desktop and a two-row/reflowed arrangement on mobile; keep token labels/IDs inside each card. Do not cross the long generated strip with live labels.
- MOTION: selecting a token may pulse/underline it once and reveal its vector ID; no simultaneous token pulsing.

Audio branch:

- REMOVE: the large live roughBox over the spectrogram when it duplicates the generated frame; duplicate live sample dots and waveform points; broad note highlight.
- RETAIN: the waveform/spectrogram plate, one meaningful time-frequency window, one arrow, and the “time × frequency” explanation.
- REPOSITION/CLIP: place the window wholly within the actual waveform/spectrogram region; clip it to that region and keep the explanatory labels in a side lane.
- MOTION: the selected window may slide once across a bounded sample interval on mode change, then stop. It must not scan forever.

For all three branches, modality changes should crossfade or swap the branch state once. Do not leave marks from another branch visible.

### Ch5 — inside one neuron

Active plate: ch05. This is the closest match to user screenshot 1. Current live elements include EVIDENCE/ONE NEURON/ACTIVATION tags, four input labels/values, four “+ evidence”/“− evidence” callouts, weighted wires, Σ/z, a green activation slab, and a highlighted note.

- REMOVE: highlighter blocks behind all three tags; the four “+ evidence”/“− evidence” callouts when the colored thin wire already conveys sign; the output green highlighter rectangle; the broad note highlight and any extra rounded live box; the duplicate central outline if the generated plate’s circle is kept.
- RETAIN: input names and numeric weights, one thin wire per input, the sum symbol/score, ReLU/output value, and one directional wire into the activation paper.
- REPOSITION: anchor each input label/value to the right inset of its input paper. Keep values in one aligned column. Start wires at the input-paper edge and terminate at the neuron circle; keep Σ/z inside the central node. Put the activation label/value inside the output paper with a safe right inset.
- CLIP: each wire to the input-to-node corridor; the activation arrow and value to the output lane; no label may cross a torn paper edge or sit on a connector.
- MOTION: slider/state changes may interpolate wire thickness/opacity and z/ReLU numeric text once over 120–180 ms. A single input can briefly draw from input to Σ, then the whole value settles. No pulsing wires, random jitter, or always-visible evidence callouts.

### Ch6 — feature depth

Active plate: ch06. Current live elements include a swashed heading, a four-stage arrow chain, four labels, a highlighted “parts” label, and a DOG/result ring and arrow.

- REMOVE: the tag swash; the large parts highlighter; any second ring/arrow that duplicates a selected part already visible in the generated plate; unnecessary echo strokes.
- RETAIN: four feature papers, one left-to-right chain, stage labels, and one final selected-part/class cue.
- REPOSITION: keep labels under or within each feature card. Move the DOG/result cue inward from the right/bottom edge and give it a dedicated result lane.
- CLIP: arrows to the card corridor and the result ring to the result paper.
- MOTION: reveal one arrow/card relationship left-to-right on entry or selection, then settle. A selected part may receive one short ring draw-on; no continuous orbit or glow.

### Ch7 — learning loop

Active plate: ch07. This is the closest match to user screenshot 4. Current live elements include a full colored cycle route, four node highlighter blocks/labels/details, a central loss ring, a green marker, and a bottom instruction note.

- REMOVE: highlighter blocks behind forward/loss/backprop/update; the always-on green marker (default learnStep is visible even before an action); long parallel/echo connectors that read like code plumbing; the broad note highlight/outline if the instruction can live in the narrative control; any central halo beyond one thin loss ring.
- RETAIN: four generated papers, one thin directional cycle route, node names/details, one loss/rate readout, and a step marker only while a learning step is running.
- REPOSITION: anchor each node label and detail within its paper/lane. Route arrows should stop before the label and turn at clear paper edges. Keep the loss/rate readout inside the central circle with no overlap.
- CLIP: route segments to the four-node corridor; marker to the route path; loss ring/readout to the center lane.
- MOTION: “Run one learning step” is the sole trigger. Move one marker along the four bounded route segments over roughly 450–700 ms, update loss/rate once, and settle on the next deterministic step. Clear the marker when idle or show only a static final dot after completion. Use the final state directly under reduced motion. No RAF vibration, Date.now-driven position, CSS infinite motion, or marker at rest before the click.

### Ch8 — loss over time

Active plate: ch08. Current live elements include axes/grid/curves, best-checkpoint line/label, epoch marker/value, legend, fit-status tag/highlighter, and generated color swatches outside the plot.

- REMOVE: the large status highlighter/block; any decorative marker that competes with the current epoch; raw color swatches only if they read as live chart data rather than paper accents; broad caption highlight.
- RETAIN: graph paper, one set of axes, train/validation curves, one best-checkpoint cue, current epoch value, and a compact legend/status.
- REPOSITION: keep the legend in a reserved top lane, checkpoint label in a side/top lane, epoch value below the x-axis, and status as plain text outside the plotted data. Do not let a label sit on a curve or outside the graph paper.
- CLIP: curves, epoch marker, and checkpoint line to the plot rectangle. Keep labels outside the plot clip.
- MOTION: changing epoch draws/traces only the newly exposed curve segment over 180–300 ms and moves one marker to the selected epoch. It then stops. No animated chart sweep on idle.

### Ch9 — architecture branches

Active plates: ch09.architecture (CNN), ch09.rnn, ch09.transformer.

CNN:

- REMOVE: giant live input frame and nine cell rectangles; duplicate live filter boxes; duplicate green feature-map box; tag/note highlighters; any second outline around generated papers. These are the exact duplicate/selection rectangles shown in user screenshot 3.
- RETAIN: generated three-stage plate, one compact scan window tied to learnStep, one bridge arrow, and stage labels.
- REPOSITION/CLIP: keep scan window inside the raw image grid; keep the bridge arrow in the inter-stage corridor; place filter/map labels inside their stage lanes. Clip scan to the image/grid and the map cue to one map card.
- MOTION: architecture entry or step change may run one bounded scan sweep across the input grid, then stop. It may reveal the bridge arrow once. No perpetual scanner, frame, or map pulse.

RNN:

- REMOVE: duplicate purple outer rings when the generated plate already has the three state circles; broad label/note highlights; duplicate paper outlines.
- RETAIN: h1/h2/h3 state labels, the/dog/runs tokens, two carry arrows, output score/readout, and the generated state papers.
- REPOSITION/CLIP: put h labels inside each circle/card; keep words in one row or a deliberate mobile stack; keep the output readout within its paper.
- MOTION: one-shot state handoff from h1 to h2 to h3 on entry/selection, with a single moving token/arrow that stops at the output.

Transformer:

- REMOVE: highlighter behind every token; excess K labels and attention curves; broad note/highlighter blocks; duplicate context outline.
- RETAIN: five token cards, one selected token, Q/K/V labels inside their papers, one or two sparse attention links, and the context handoff.
- REPOSITION/CLIP: keep token labels/keys inside their cards and Q/K/V labels inside the right-side papers; reflow into two rows or a reduced token row on mobile; clip attention links to the token/QKV corridor.
- MOTION: selecting a token draws one or two semantic attention links once and moves the context handoff once. No web of always-on Bezier links and no pulsing token set.

All three architecture branches should crossfade state once; do not retain CNN geometry when RNN/Transformer is selected.

### Ch10 — transfer / frozen features

Active plate: ch10. Current live elements include pretrained/new-task tags, six feature labels, a lock/frozen cue, a bridge arrow, class labels/highlighters, and a bottom note.

- REMOVE: highlighters behind every feature/class label; tag swashes; oversized note/highlight; a lock ring that is not conveying a state change.
- RETAIN: generated pretrained stack and new-task paper, feature names, one frozen badge, bridge arrow, and class outputs.
- REPOSITION: align six feature labels within their cards and class labels within the new-task paper. Keep the lock/frozen badge beside the relevant feature group, not floating between papers.
- CLIP: feature labels to card bounds and class labels/arrow to the task lane.
- MOTION: frozen/unfrozen or transfer state may flash the badge once and draw the bridge arrow once; no animated wash over all features.

### Ch11 — threshold / confusion matrix

Active plate: ch11. Current live elements include a live 3 × 3 matrix/counts, colored cell highlighters, threshold label/rail/knob, recall/precision callouts, and a highlighted note. The plate already contains matrix-like color marks and a threshold paper.

- REMOVE: per-cell highlighter slabs/scribbles that duplicate the generated matrix; the outer roughBox around the threshold rail; recall/precision highlighter slabs; the oversized tradeoff note; duplicate matrix borders when the plate owns them.
- RETAIN: live counts if they are the changing data, one subtle diagonal/off-diagonal cue, threshold value/knob, and plain recall/precision values.
- REPOSITION: put the threshold control in a reserved right lane on desktop and below the matrix on mobile. Keep metric labels in a compact metric lane. Do not place text over cells or cross the yellow threshold paper edge.
- CLIP: matrix counts/cues to the matrix, knob to its rail, and labels to their lanes.
- MOTION: threshold input may move the knob and interpolate the metrics once over 180–240 ms; optionally draw one changed cell cue. No rail pulsing or repeated cell flashing.

### Ch12 — release bundle

Active plate: ch12. Current live elements include release-bundle/runtime tags, four manifest rows, a vertical route with numbered circles, runtime labels, and a bottom note. The generated stack/runtime paper remains a useful underdrawing.

- REMOVE: tag/highlighter slabs; the wide note/highlight; any duplicate colored tab/route decoration already carried by the plate; the Date.now()-based dummy marker, even though it currently has zero radius.
- RETAIN: four manifest items and details, one tested route/spine with numbered checkpoints, runtime/drift/failure labels, and the generated release papers.
- REPOSITION: keep route and checkpoint circles inside a dedicated right lane, labels inside the yellow runtime paper, and manifest text inside the bundle safe inset. Move the caption into narrative or a reserved bottom lane.
- CLIP: route token/circles to the route lane; manifest rows to the bundle paper; runtime text to the runtime paper.
- MOTION: on entry or an explicit release check, move one small token through validate → prepare → predict → decode once, stopping at the selected checkpoint. No idle route motion and no time-dependent marker.

## Motion and interaction contract

### Idle state

Every chapter must be a calm deterministic still. A user looking at an unchanged chapter should see no moving pixels, random re-seeding, pulsing opacity, breathing scale, or traveling marker. Static roughness is seeded once per element and must not be regenerated per frame.

### Triggers and bounds

Only these triggers are allowed:

- chapter entry/scroll reveal: one draw-on or trace for the one primary relationship;
- an existing control action: update only the semantic mark controlled by that input;
- an explicit branch/state toggle: crossfade the old branch out and the new branch in once;
- reduced-motion mode: skip interpolation and render the final state immediately.

Each transition should be approximately 120–300 ms, except the Ch7 learning-loop route token, which may take 450–700 ms because it represents four semantic stages. One moving object or one sequential trace is enough. Every animation must have a deterministic start/end value and an automatic stop.

### Chapter trigger map

- Ch1: score bars and winner cue on prediction state.
- Ch2: selected-observation cue and neutral/biased caption on state toggle.
- Ch3: one source-to-role trace on entry.
- Ch4: branch crossfade; selected text token or bounded audio window only.
- Ch5: weighted value/wire interpolation on input change.
- Ch6: left-to-right feature reveal or one selected-part ring.
- Ch7: Run one learning step only; bounded cycle marker and loss update.
- Ch8: epoch curve extension and marker move on epoch change.
- Ch9: branch crossfade; CNN scan, RNN handoff, or Transformer sparse attention once.
- Ch10: frozen/transfer badge and bridge reveal on state change.
- Ch11: threshold knob/metric update on threshold change.
- Ch12: one release-check token through the four checkpoints.

### Accessibility and implementation guardrails

The DOM controls remain the source of truth. The live SVG can remain aria-hidden when the narrative/control copy exposes the same meaning, or expose one concise description per scene; it must not create duplicate screen-reader prose for every decorative stroke. Honor prefers-reduced-motion by snapping to the final state. Do not add requestAnimationFrame, CSS infinite animation, Date.now, or per-frame noise to implement the contract. The motion layer can be populated only for these bounded transitions and should be empty at rest.

## Blockers and acceptance tests

1. Asset transparency/ownership is unresolved. The manifest marks 16 active plates as text-free, opaque, full 1536 × 1024 RGB PNGs with no crop variants. The asset cross-review confirms that several plates already contain grid/filter/map/waveform/matrix/path-like geometry. If those marks must be removed, the plates need transparent extraction, deliberate crop/regeneration, or an explicit decision to treat them as immutable underdrawings and remove the corresponding live duplicates. Do not use a CSS mask to hide baked geometry.

2. Mobile geometry is not a simple scale. A 1000 × 666 SVG is currently stretched into approximately 322 × 492 mobile scenes with preserveAspectRatio="none". Separate mobile measures/reflow or a deliberate crop is required before labels can reliably remain in their lanes.

3. Overflow is not a safety boundary. .deep-hybrid-live uses overflow: visible while the mobile host uses hidden. Replace this with declared per-paper/lane clipping after the responsive measure is solved.

4. Collision diagnostics are not trustworthy. debugBounds exposes collisions: [] but the renderer does not calculate collisions. Add a real test-only collision/safe-bound pass covering text boxes, paper bounds, connector corridors, and mobile captures.

5. The motion promise is currently unmet. live-motion exists but is unused; current CSS disables motion and the renderer does not advance a bounded semantic transition. Implement only the event map above, with idle stillness and reduced-motion final states.

6. QA coverage is mostly runtime/DOM assertions and screenshots at 1440 × 900 and 390 × 844. Acceptance should include visual inspection or image-diff review at those sizes plus intermediate widths, branch/state toggles, slider/input changes, one Ch7 run, and prefers-reduced-motion. A passing console/RAF check alone does not establish visual cleanliness.

Suggested acceptance gate for each chapter:

- no live text crosses a generated-paper edge or connector;
- no large translucent rectangle exists unless it is the single selected semantic cue and is explicitly justified;
- no live outline duplicates a generated frame/grid/circle;
- every arrow has one clear source, destination, and reading direction;
- at most one focal motion is active, it stops automatically, and idle capture is pixel-stable;
- desktop and mobile retain the same semantic order without nonuniform distortion;
- generated plate remains unchanged unless an asset decision explicitly authorizes replacement.

Only this audit report is created by this task; source files and generated plates remain unchanged.

