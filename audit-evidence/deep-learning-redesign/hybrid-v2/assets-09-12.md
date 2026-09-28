# Deep Learning hybrid-v2 generated art: Chapters 9–12

**Status:** accepted for renderer integration

**Generated:** 2026-08-29 (Asia/Singapore)

**Generator:** built-in ImageGen tool (default mode; no CLI fallback)

**Asset contract:** all accepted plates are intentional opaque RGB PNGs at
1536×1024. `sips -g hasAlpha` reports `no` for every file. The generator did
not provide alpha, so these plates use the uniform warm cream `#FBF6E9` paper
ground with broad blank live-code lanes; no checkerboard or fake transparency
was accepted. The plates contain no intended copy, numbers, equations, axes,
labels, controls, state indicators, or UI. Live code owns all semantic text,
values, links, selection, and motion.

## Shared reference set

The four supplied images were included as style-only references in each
ImageGen request. They define the single-person notebook material language;
their browser chrome, branding, wording, layout, and exact diagrams were not
copied.

- `/Users/elijahang/Downloads/ChatGPT Image Aug 23, 2026, 07_11_55 PM (4).png`
- `/Users/elijahang/Downloads/ChatGPT Image Aug 23, 2026, 07_11_53 PM (1).png`
- `/Users/elijahang/Downloads/ChatGPT Image Aug 23, 2026, 07_11_54 PM (2).png`
- `/Users/elijahang/Downloads/ChatGPT Image Aug 23, 2026, 07_11_55 PM (3).png`

## Accepted files and provenance

| Asset ID | Final file | Exact prompt | SHA-256 | Dimensions | Alpha | `opaque` | Visual sentence / reserved live lanes |
|---|---|---|---|---:|---|:---:|---|
| `ch09.architecture` | `assets/deep-learning/hybrid-v2/ch09-architecture-v1.png` | `assets/deep-learning/hybrid-v2/prompts/ch09-architecture-v1.txt` | `dcccae680f8c1451f4292661fe5b150bde03a5691c73873c47aa521bf2a7da81` | 1536×1024 | none; RGB | true | Three separated architecture studies: CNN picture patch/stencil/filter swatches, RNN blank memory scraps, and Transformer blank token chips/thread swatches. The groups are crop-safe and leave space for one active live branch, labels, links, states, scores, and controls. |
| `ch10.transfer` | `assets/deep-learning/hybrid-v2/ch10-transfer-v1.png` | `assets/deep-learning/hybrid-v2/prompts/ch10-transfer-v1.txt` | `8fd52b5888f2c5a27e7778dce59180fc64ac8714b60dda739d279494afa964e0` | 1536×1024 | none; RGB | true | Lavender paper folder/backbone with six blank feature swatches, attached blank lock scrap, open transfer corridor, and coral trainable-head paper. Feature names, hand-off arrow, classes, and fine-tuning copy remain live. |
| `ch11.threshold-matrix` | `assets/deep-learning/hybrid-v2/ch11-threshold-v1.png` | `assets/deep-learning/hybrid-v2/prompts/ch11-threshold-v1.txt` | `d2d4fa120930a5f14a15675a90bf687db2a0099ad29e6678e3da93707a3ed360` | 1536×1024 | none; RGB | true | Imperfect 3×3 graphite matrix substrate with separate green diagonal and coral error swatches, amber sticky-note scrap, and blank threshold rail. Counts, orientation labels, metrics, knob, curve, and threshold response remain live. |
| `ch12.release-pipeline` | `assets/deep-learning/hybrid-v2/ch12-release-v1.png` | `assets/deep-learning/hybrid-v2/prompts/ch12-release-v1.txt` | `5642e37aacad0b2ea24ea2fd3c4a1e299aa6d5e0e6a19076d0e98a1dc9538f50` | 1536×1024 | none; RGB | true | Layered cream release folder with four blank colored tabs, attached green validation sticker, amber operations scrap, and masking tape. Open route lane remains for live manifest, four-stage spine, moving request token, and operational note. |

Prompt SHA-256 values (to detect accidental provenance drift):

| Prompt file | SHA-256 |
|---|---|
| `assets/deep-learning/hybrid-v2/prompts/ch09-architecture-v1.txt` | `f1cb14fbb04cb7f1747fd519bc71077be6719be61e387212d47acfdcd78d9e6e` |
| `assets/deep-learning/hybrid-v2/prompts/ch10-transfer-v1.txt` | `0fe1ff7f5aa59ccfe82c5ce3be1ea7c08ff4bdf0e5577375a69d335d59f2f8ef` |
| `assets/deep-learning/hybrid-v2/prompts/ch11-threshold-v1.txt` | `92d647f70d9fb4a11b214883574699fe88ea7b9680dcabd2dddd9d2ad5b0075d` |
| `assets/deep-learning/hybrid-v2/prompts/ch12-release-v1.txt` | `bde9cb4ad8ade04fa75a9ff2dba981e7646bd9eabf21b7e497b119a2430386f9` |

## Inspection and acceptance

Each accepted output was inspected at native 1536×1024 (100% view) and at a
390px-wide proportional preview:

- `/tmp/deep-assets-09-12/ch09-architecture-390.png`
- `/tmp/deep-assets-09-12/ch10-transfer-390.png`
- `/tmp/deep-assets-09-12/ch11-threshold-390.png`
- `/tmp/deep-assets-09-12/ch12-release-390.png`

All four plates passed the material and integrity gate:

- graphite/ink pressure, marker bleed, paper fibers, torn edges, and attached
  tape are visible at native size and remain recognizable at 390px;
- no readable words, letters, numbers, equations, axes, legends, captions,
  controls, browser chrome, logos, watermarks, or pseudo-writing are present;
- there is no fake checkerboard alpha, hard digital UI frame, glossy gradient,
  or dashboard-card treatment;
- subjects have broad blank space for live overlays and no source-boundary
  clipping;
- Ch9 groups are isolated and crop-safe; only one branch should be shown by
  the renderer at a time, with the live branch geometry above this plate;
- Ch10 folder and head are separated by an intentional live transfer corridor;
- Ch11 matrix is the focal substrate and the rail/note sit in a separate lane;
- Ch12 has one folder and one open route lane, not a pre-baked competing route.

### Ch9 targeted rejection

The first Ch9 generated candidate was rejected because it contained lavender
directional arrowheads around the RNN scraps. Those arrows would duplicate
live architecture links. A targeted ImageGen edit removed only the arrowheads
and replaced them with quiet, non-directional lavender registration marks;
the edited output is the accepted `ch09-architecture-v1.png`. No other
accepted plate required regeneration.

## Integration contract

- Use each file as a bounded decorative material layer below live SVG/Canvas
  state layers; do not draw a second folder, matrix, architecture study, tape,
  or route over the plate.
- Preserve the 3:2 aspect ratio with `contain`/normalized transform. Do not
  stretch a plate into a tall mobile strip.
- Ch9 uses one source plate with three generous separated groups. The renderer
  must crop/position the selected group without showing stale branches; all
  branch labels, filters, states, scores, tokens, Q/K/V, and links are live.
- Ch10's blank white lock scrap, feature swatches, and coral head are static
  material; the renderer owns the lock meaning, names, arrow, classes, and
  fine-tuning state.
- Ch11's green/coral swatches are non-authoritative underlays only. The
  renderer owns cell counts, threshold-dependent coloring, labels, metrics,
  knob, and trade-off curve.
- Ch12's colored tabs are blank route-material hints, not route nodes. The
  renderer owns version, manifest rows, the one four-stage spine, token, and
  operations copy.
- If a plate fails to load, the renderer must provide the clean deterministic
  live-code fallback and report one non-fatal diagnostic; no layout shift or
  broken-image icon is acceptable.

No module source or asset manifest was changed in this art-production pass.
