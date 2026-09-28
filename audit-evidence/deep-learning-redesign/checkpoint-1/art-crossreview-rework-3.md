# Deep Learning checkpoint 1 — rework-3 blocker review

Date: 2026-08-29  
Review mode: read-only source review; no application source files were edited.  
Compared against: [`art-direction.md`](../art-direction.md),
[`art-crossreview.md`](art-crossreview.md), and
[`art-crossreview-rework-2.md`](art-crossreview-rework-2.md).

## Decision

**PASS at source level for the four previously identified blocker areas.**

Rework-3 resolves the concrete source blockers from rework-2:

- Chapter 2 moves `same class` into the contact-sheet header and gives the
  variation legend its own measured lane; the footer remains below the final
  row at the intended phone sizes. The causal cue and the angle/light/context
  marks remain explicit and state-stable.
- Chapter 4 derives the desktop audio strip from the actual output bounds,
  preserving a forward connector through the 450–500px narrow-column case.
  The selected sample is redrawn over the amber window, so the sample cue is
  not hidden by the highlight.
- The hero now has one directional outer loop. The inner coral ring is a
  faint, non-directional material accent with no arrowhead; the signal spine
  and crossing connector decoration are gone.
- Chapter 3 now uses a single quiet blue dot treatment and a shared fork into
  all three role cards, resolving the low-risk polish items carried from the
  previous review.

This is a source-evidence PASS, not a claim that browser screenshots have
been captured. Browser transport was unavailable and the parent explicitly
requested no further retries. A final visual screenshot pass remains useful
for proof, but no blocker from the requested rework list remains in the
current source.

## Blocker checklist

| Prior blocker | Verdict | Evidence |
| --- | --- | --- |
| Chapter 2 compact label/footer clearance | **PASS** | `sceneTwo()` (`deep-learning-renderer.js:349–386`) places `same class` at the compact frame header (`gridY - 4`), starts `what should vary?` at `frameBottom + 14`, keeps rows at 22px spacing, and retains the footer at `height - 24`. At the intended 390px/375px compact heights, the last legend row is separated from the footer; the former y=336/y=348 near-collision is removed. |
| Chapter 2 cue/variation semantics | **PASS** | `drawDatasetTile()` (`deep-learning-renderer.js:319–347`) still varies rotation, lighting, and background visibly; biased mode repeats one grass line, circles the bottom-right cue, and leads to `background → dog?` without changing tile positions. |
| Chapter 4 450–500px audio bounds | **PASS** | `sceneAudioTensor()` (`deep-learning-renderer.js:641–683`) computes `outputWidth`, `outputX`, `connectorGap`, and `waveWidth` from the output bounds. At 450–500px widths, the arrow start is before its end and the spectrogram remains inside the right pad. |
| Chapter 4 selected-sample layering | **PASS** | The base waveform draws four samples; after the amber window fill, `drawWaveformSamples(..., [24])` redraws the selected sample on top (`deep-learning-renderer.js:663–675`). |
| Hero single dominant directional loop | **PASS** | `deep-learning-renderer.css:79–170` makes only the blue outer orbit directional (`orbit-one::after`), removes the signal ellipse/spine, disables the inner orbit arrowhead, and keeps the inner coral ring at low opacity. Labels remain in a cardinal clockwise sequence: data → features → prediction → feedback. |
| Chapter 3 low-risk polish | **PASS** | `drawDotCloud()` (`deep-learning-renderer.js:416–423`) is now quiet monochrome blue; `sceneThree()` (`447–474`) routes one source arrow to a shared fork and three clean entry marks rather than implying TRAIN alone receives the dataset. |

## Focused review notes

### Chapter 2

The compact frame geometry now has an intentional hierarchy:

1. the `same class` label is attached to the frame header;
2. the frame ends at `frameBottom`;
3. the `what should vary?` heading begins 14px below that boundary;
4. the angle/light/background rows use a consistent 22px rhythm;
5. the final takeaway occupies the last baseline lane.

The label is inside the frame's top inset rather than floating on the old
bottom border. That is a deliberate placement and is materially cleaner than
the rework-2 arrangement. No additional generated asset is warranted: the
dog silhouette, fixed rotations, light mark, and grass line are live evidence.

### Chapter 4 audio

The prior failure came from an arrow target defined as a percentage of the
canvas instead of from the spectrogram's actual left edge. Rework-3 instead
sets the output rectangle first, then derives the waveform width and the
connector endpoints. The minimum `waveWidth` guard is still conservative, and
the requested 450–500px range has a positive connector span with the
spectrogram inside the right margin.

The selected sample index 24 falls inside the amber window and is intentionally
redrawn after the translucent window fill. This is a semantic highlight, not
an extra decorative mark.

### Hero

The revised CSS now matches the art brief's “one dominant path” rule. The
outer blue orbit owns direction; the inner coral oval is an unlabelled,
low-opacity material accent and has no arrow. The `hero-signal` element only
provides the four label anchors and central dot; it no longer adds a competing
ellipse or diagonal spine. The existing label positions map to the intended
clockwise sequence. Do not reintroduce the legacy canvas overlay or any
label-to-label connectors.

### Chapter 3

The monochrome cloud removes the former unstated four-color data dimension.
The shared fork makes the three roles a true partition target. The cards remain
equal height, which is acceptable for this small role diagram because the
percentages are explicit labels and the narrative split key carries the
proportion cue.

## Non-blocking final proof

No source blocker remains, but the final handoff should still capture:

- Chapter 2 representative and shortcut states at 390px and 375px;
- Chapter 4 audio at 450px, 500px, 1280px, and 1440px, plus image/text selector
  states;
- hero at desktop and mobile widths with settled fonts and reduced motion;
- Chapter 3 source-to-fork composition at the same widths.

Those screenshots are validation evidence, not reasons to reopen the current
source blocker decision unless they reveal a browser-specific font or CSS
measurement issue.

Static source checks for this review: `node --check
modules/deep-learning-renderer.js`, `git diff --check`, and
`node scripts/build.mjs --validate-only` all pass.
