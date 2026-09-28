# Deep Learning hybrid-v2 asset cross-review

Status: read-only visual and technical gate
Reviewer: Deep hybrid-art director
Reviewed against: hybrid-v2/art-bible.md and the four supplied StatSketch/StatML reference images

## Executive verdict

**No currently supplied asset passes for direct integration as-is.** All
fourteen PNGs are opaque RGB 1536×1024 plates with full ruled-paper
backgrounds; none contains an alpha channel. The art bible requires
transparent, crop-safe supporting layers. Several plates also include static
geometry that duplicates live semantics: output tracks, waveform and
spectrogram marks, matrix grid, threshold rail, token positions, and
architecture shapes.

This is not a rejection of the material direction. The generated material is
substantially closer to the references than the old CSS-only roughness:
graphite pressure, torn paper, masking-tape fiber, marker bleed, and notebook
paper are visible. Most plates are salvageable by extracting isolated
components or regenerating a transparent texture-only version. They must not
be placed as whole backgrounds behind the live renderer.

### Global findings

- Alpha: every file reports PNG RGB, not RGBA. Paper, ruled lines, notebook
  margin, and holes are baked into the pixels.
- Native inspection: material is generally coherent and tactile. Main failures
  are full-plate composition, UI-like blank frames, and duplicated data
  geometry.
- 390px inspection: when a 1536×1024 plate is reduced to 390px, meaningful
  objects become small while the large paper field remains. Full-plate
  placement would look empty and leave insufficient room for live labels.
- Text/pseudo-text: no readable baked words, numbers, or fake labels were
  found. Some marks are intentionally abstract. Keep the no-text rule during
  extraction/regeneration.
- Checkerboard: none observed. The problem is the opposite: opaque paper where
  alpha is required.
- Same-artist consistency: graphite/cream/tape treatment is mostly consistent.
  Ch02's realistic colored dog studies are more illustrative and detailed
  than the sparse technical plates; use them as small crops.
- No direct integration: do not hide these issues with CSS masks or a
  paper-colored rectangle. Extraction or regeneration must be explicit.

## Status legend

- REWORK — extract/regenerate: content may be useful, but current file violates
  alpha/crop or semantic ownership and cannot ship unchanged.
- REWORK — semantic duplicate: static art repeats a data/state structure that
  must remain live. Keep only non-semantic material crops.
- REWORK — collision risk: after extraction, reserved live lanes must still be
  measured before placement.

## Asset-by-asset verdicts

### 1. ch01-finish-line-v1.png — REWORK — semantic duplicate

Native: strong graphite cat, blue pencil under-stroke, attached beige tape,
torn output paper, and colored marker dots. However, the plate also contains
three empty horizontal output tracks and three colored class circles. Those
tracks/circles directly duplicate the live probability list and make the asset
read like a fixed UI panel. Notebook holes and ruled paper are baked.

390px: cat/output composition is recognizable, but the subject and tracks
occupy only a small fraction of the plate. Overlaying live text and bars would
produce a tiny fixed mockup with labels pasted on.

Salvage: alpha-extract the cat photo/paper corner/tape only. Discard the output
sheet, colored circles, tracks, notebook margin, and full paper ground. Place
the cat in the live input tile; code owns input frame, arrow, bars, values,
winner, and output labels. Do not use the full PNG.

Acceptable material: graphite cat and tape.
Rejected material: output tracks, class circles, full-scene paper plate.

### 2. ch02-dataset-v1.png — REWORK — state/crop risk

Native: nine attractive hand-drawn dog studies with varied context, tape,
paper edges, and color. The dogs are more detailed/colored than the other
assets but plausibly belong to the same notebook artist. The entire contact
sheet layout, paper frames, backgrounds, and tape are baked together.

390px: nine examples remain visible as a contact sheet, but individual dogs
and context cues are too small for the shortcut toggle to emphasize cleanly.
A whole-plate background prevents stable before/after comparison.

Salvage: segment each dog and context into separate transparent crops. Code
keeps tile positions fixed and changes only context emphasis or coral marker
when biased changes. If separation is unreliable, regenerate a text-free sheet
of isolated dog cutouts and isolated context marks.

Acceptable material: dog/context illustrations after separation.
Rejected material: baked contact-sheet frame layout and fixed background
relationship.

### 3. ch03-split-notebook-v1.png — REWORK — semantic duplicate

Native: tied observation bundle, three blank torn sheets, tape, and paper edges
are strong. Dotted paths from bundle to destinations imply the exact live
partition flow and are not neutral decoration.

390px: bundle and sheets are legible but small. Dotted paths become faint noise
and leave little room for role labels and percentages.

Salvage: extract tied bundle, three blank sheets, and tape separately. Remove
baked dotted paths, full paper ground, and ruled margin. Code owns the one
dataset-to-partition arrow, role bands, percentages, jobs, and green seal.
Sheets must be placed with a measured label lane.

Acceptable material: blank paper slips and bundle.
Rejected material: baked dotted flow paths and full plate.

### 4. ch04-audio-v1.png — REWORK — semantic duplicate

Native: tasteful taped waveform paper and low-density spectrogram study; the
material is calm and close to the references. The waveform, amber sample dots,
window wash, and colored spectrogram cells are visual data that the audio
branch must draw and update.

390px: waveform and spectrogram compress to tiny marks; live window, sample
dots, and labels would collide with or disappear into baked marks.

Salvage: retain only paper/tape/edge texture, or regenerate a sparse
texture-only plate with no waveform, sample dots, window, spectrogram cells,
or implicit axes. Code owns waveform, samples, window-to-patch bridge,
time/frequency labels, and selected state.

Acceptable material: paper/tape texture after crop.
Rejected material: waveform, sample dots, window, spectrogram cells.

### 5. ch04-image-v1.png — REWORK — semantic duplicate

Native: hand-colored pixel-picture study and three channel sheets are
coherent, with useful marker/pencil texture. The image grid and channel maps
duplicate the live image-to-channel relationship and contain fixed cell
patterns that may be mistaken for current values.

390px: source picture and channel sheets are clear as a thumbnail but too
small to support live dimensions, labels, and selected values if the whole
plate is used.

Salvage: extract abstract subject/pixel silhouette and quiet blank
channel-paper textures separately. Do not use baked grid as a live pixel grid
or place fixed channel cells beneath live values. Code owns channel geometry,
dimensions, selected pixel, labels, and bridge arrow. Regenerate if channel
texture cannot be separated from its cells.

Acceptable material: subject cutout and non-semantic paper texture.
Rejected material: fixed pixel grid and data-like channel cells.

### 6. ch04-text-v1.png — REWORK — semantic duplicate

Native: blank token scraps, tape, highlighted blank token, and elongated
embedding strip are physically convincing. Their exact five-token sequence and
embedding-row structure duplicate the live text branch, even though no text is
baked.

390px: tokens and embedding strip become hairline-sized when the whole plate
is reduced; live token names and IDs would have no safe typography lane.

Salvage: extract individual blank token scraps/tape and a blank strip as
separate assets, then let the renderer place them from measured bounds. The
highlighted token must not be a baked selected state; use a neutral token and
let code draw selection. Code owns token text, IDs, embedding values, and
lookup arrow. Remove full paper plate and fixed long-strip layout.

Acceptable material: neutral paper scraps/tape.
Rejected material: fixed token sequence, selected token, full strip layout.

### 7. ch05-neuron-material-v2.png — REWORK — semantic duplicate

Native: graphite circle and construction crosshair are a useful node
underdrawing, but four blank left boxes and one blank right box already encode
the live input/output topology. The central circle/crosshair also reads as a
clean technical diagram rather than a tactile neuron mark.

390px: blank boxes and circle become a tiny wireframe; live labels/weights
would sit exactly on baked topology.

Salvage: crop only the central organic node/halo if its edge remains handmade.
Remove crosshair if it reads as an unexplained axis. Discard all blank
input/output boxes. Code owns rows, lines, products, sigma, z, ReLU, bias, and
slider response. Regenerate if the node crop still looks too geometric.

Acceptable material: isolated organic node texture.
Rejected material: blank row boxes and crosshair topology.

### 8. ch06-feature-sheets-v1.png — REWORK — extraction required

Native: one of the strongest material plates. Four separated tracing sheets,
progressive pixel/edge/texture/part marks, tape, and restrained graphite are
coherent and not noisy. The progression is conceptually appropriate, but the
plate is opaque and sheets need independent placement.

390px: four sheets remain distinct and the progression reads, but a whole
plate leaves too much empty paper and makes live layer labels too small.

Salvage: alpha-extract each sheet, tape, and mark independently; remove full
paper ground. Do not bake layer names or arrows. Code places sheets in measured
lanes and owns labels, arrows, final class, and reveal.

Content decision: PASS after extraction. Delivery decision: REWORK.

### 9. ch07-learning-loop-material-v1.png — REWORK — semantic duplicate

Native: four colored scraps and center paper are tactile and fit the reference
material. Four colored arrowhead swashes imply learning-loop direction,
conflicting with the live route and potentially creating double arrows.
Registration ticks may read as stray marks in the live loop.

390px: scraps and center are attractive, but arrowheads compete with live
arrows and the step marker.

Salvage: extract four scraps and center paper only. Remove arrowhead swashes,
full ruled paper, notebook holes, and registration marks in live corridors.
Code owns route, arrowheads, nodes, loss, step, marker, and rate update.
Place scraps behind nodes without obscuring subtitles.

Acceptable material: colored paper scraps and center.
Rejected material: baked directional arrowheads and full plate.

### 10. ch08-training-chart-material-v1.png — REWORK — extraction required

Native: blank graph-paper patch and blue/coral/green marker swashes align with
the chart concept and contain no text or fake values. The graph grid can still
compete with live axes if drawn at equal opacity.

390px: graph patch is readable, but edge swashes could be mistaken for
clipped chart continuations when the live plot scales.

Salvage: alpha-extract graph texture and swashes. Keep graph opacity below
live axes/curves, and use the green strip only if code does not duplicate the
best-validation marker. Code owns curves, ticks, zones, legend, checkpoint,
epoch, and range response.

Content decision: PASS after extraction. Delivery decision: REWORK.

### 11. ch09-architecture-v1.png — REWORK — semantic duplicate/collision risk

Native: material treatment is consistent and the three groups are
recognizable. CNN pixel grid/filter stack, three RNN circles, five Transformer
token cards, highlighted token, and lavender attention bed duplicate live
branch geometry. The broad lavender hatch is ornamental noise.

390px: all three groups compress into a tiny strip; token cards, circles, and
filter squares cannot safely host live labels or links.

Salvage: do not use the whole plate. Extract only neutral paper scraps, one
CNN stencil texture without fixed cells, neutral RNN circle texture, and
unselected Transformer token paper. Remove lavender hatch, fixed highlighted
token, and geometry that code will update. Better fallback: regenerate three
transparent texture-only groups with no token count, fixed links, or selected
state. Code owns the complete active branch and mobile reflow.

Acceptable material: neutral branch-specific paper texture after cleanup.
Rejected material: fixed grids, token count, selected card, attention bed.

### 12. ch10-transfer-v1.png — REWORK — extraction required

Native: lavender folder, six feature swatches, coral head paper, and tape are
strong physical materials. No readable baked text or arrow is present.
However, six swatches and the coral rectangle form a fixed frozen/trainable
composition that would duplicate live structure.

390px: folder and coral head remain understandable, but swatches are too small
for code labels and the large empty field dominates.

Salvage: alpha-extract folder, neutral swatches, lock/tape, and coral paper
scrap separately. Code owns feature names, frozen/trainable labels, transfer
arrow, classes, and fine-tuning note. Use no broad hatch.

Content decision: PASS after extraction. Delivery decision: REWORK.

### 13. ch11-threshold-v1.png — REWORK — semantic duplicate

Native: hand-drawn matrix paper and colored marker swatches are tactile, but
the 3×3 grid, green diagonal, coral off-diagonal, amber note, and blank
threshold rail directly duplicate live matrix and threshold controls.

390px: matrix and rail are visible, but fixed grid consumes most of the small
plate and leaves no safe lane for actual/predicted labels or metrics.

Salvage: retain only paper/tape/sticky-note texture, or regenerate a
texture-only version. Remove grid, semantic diagonal/off-diagonal swatches,
and threshold rail. Code owns matrix geometry, counts, orientation, knob,
metrics, and trade-off curve. Amber note may be a blank substrate behind a
live note, never the source of meaning.

Acceptable material: neutral paper/sticky-note texture.
Rejected material: fixed matrix cells and threshold rail.

### 14. ch12-release-v1.png — REWORK — extraction required

Native: release folder, layered papers, colored tabs, green sticker, amber
note, and tape are coherent, quiet, and well matched to the references. No
readable pseudo-text or route arrows are baked. Paper ground and fixed folder
placement remain opaque.

390px: folder and note remain recognizable, but full-plate placement wastes
width and can make live manifest/spine too small.

Salvage: alpha-extract folder, tabs, sticker, note, and tape independently.
Code owns version, manifest text, four-stage spine, route labels, moving token,
and operational footer.

Content decision: PASS after extraction. Delivery decision: REWORK.

## Required rework order

1. Build an alpha-extraction/regeneration pass for every plate. Do not ship a
   current RGB plate as a whole canvas background.
2. Prioritize highest semantic-risk files: Ch01, Ch04 audio/image/text, Ch05,
   Ch09, and Ch11. Their baked geometry directly duplicates live state.
3. Next extract strong neutral materials: Ch03, Ch06, Ch07, Ch08, Ch10, and
   Ch12. Keep each physical component independently crop-able.
4. For Ch02, split dog subjects from context or regenerate isolated cutouts.
   The shortcut toggle must change emphasis without replacing evidence.
5. Add a manifest with source, alpha status, intrinsic dimensions, crop IDs,
   anchor, safe bounds, and fallback behavior.
6. Verify every extracted asset on cream paper at native desktop size and
   390px. A component that looks good native but becomes an opaque slab or
   unreadable speck at 390px fails.

## Integration cautions

- Never layer a full opaque plate behind live canvas and call it hybrid. It
  duplicates paper ground and creates a ghosted second diagram.
- Never use a generated line, dot, grid, bar, matrix cell, token, threshold
  rail, or curve as a substitute for its live counterpart.
- Static assets sit below live labels/values but above plain paper. No CSS mask
  may cover an asset or old painter.
- Component crops need anchor names such as inputSubject, featureSheet[2],
  backboneFolder, or releaseSticker; do not use accidental 1536×1024 pixel
  coordinates.
- On state changes, clear the active dynamic layer before composing the new
  state. Never leave a previous tensor/architecture/threshold branch visible.
- Keep asset opacity low enough that live ink remains primary. Generated art
  supplies physical material, not a second source of truth.
- Placement must be deterministic and frame-stable. No global canvas
  roughness/filter applies to raster assets.

## Acceptance decision

The current files are **promising source material, not shippable hybrid
assets**. After extraction/regeneration, Ch06, Ch08, Ch10, and Ch12 are likely
to pass quickly; Ch01, Ch04, Ch05, Ch09, and Ch11 need the strictest semantic
cleanup. Do not mark hybrid-v2 complete until alpha status, crop bounds,
native/390 screenshots, and live-overlay ownership are proven for all chapters
and states.
