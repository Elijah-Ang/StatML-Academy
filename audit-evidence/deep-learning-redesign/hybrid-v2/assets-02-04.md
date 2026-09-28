# Deep Learning hybrid-v2 asset batch: Chapters 2–4

**Status:** accepted for renderer integration

**Generated:** 2026-08-29 (Asia/Singapore)

**Generator:** built-in ImageGen tool (default mode; no CLI fallback)

**Asset contract:** all plates are opaque RGB PNGs at 1536×1024. `sips -g hasAlpha` reports `no` for every file, so these are intentional warm-cream paper plates, not fake transparency/checkerboard previews. They are decorative material layers only. They contain no intended copy, labels, numbers, axes, controls, state indicators, or UI. Live code owns all text, values, arrows, selection, and animation.

## Shared reference set

The four supplied images were passed as style-only references to each ImageGen request. They define the single-person notebook language; their browser chrome, brands, wording, layout, and exact diagrams were not copied.

- `/Users/elijahang/Downloads/ChatGPT Image Aug 23, 2026, 07_11_55 PM (4).png`
- `/Users/elijahang/Downloads/ChatGPT Image Aug 23, 2026, 07_11_53 PM (1).png`
- `/Users/elijahang/Downloads/ChatGPT Image Aug 23, 2026, 07_11_54 PM (2).png`
- `/Users/elijahang/Downloads/ChatGPT Image Aug 23, 2026, 07_11_55 PM (3).png`

The accepted Chapter 1 material floor was also inspected before generation:
`assets/deep-learning/hybrid-v2/ch01-finish-line-v1.png` (1536×1024 opaque RGB PNG).

## Accepted files and provenance

| Asset ID | Final file | Prompt file | SHA-256 | Dimensions | Alpha | Visual sentence / reserved live lanes |
|---|---|---|---|---:|---|---|
| `ch02.dataset-neutral` | `assets/deep-learning/hybrid-v2/ch02-dataset-v1.png` | `assets/deep-learning/hybrid-v2/prompts/ch02-dataset-v1.txt` | `b99fd639ec5e3a3f2b460959e1620bfe6106d92093fe11ac3113f3f68ad108e` | 1536×1024 | none; opaque | Stable 3×3 contact sheet of nine varied hand-sketched dogs and contexts; open right/lower lanes for the live shortcut emphasis, leader, ring, and callout. |
| `ch03.split-notebook` | `assets/deep-learning/hybrid-v2/ch03-split-notebook-v1.png` | `assets/deep-learning/hybrid-v2/prompts/ch03-split-notebook-v1.txt` | `c23b6313966ac52cf7f1d8da4a2d746023beaf83c107ea044ad7f88999d819c8` | 1536×1024 | none; opaque | Tied dataset stack feeding exactly three separated taped blank sheets; quiet dotted underdrawing is subordinate, while live code owns the authoritative flow/arrows, role labels, proportions, and green seal. |
| `ch04.image` | `assets/deep-learning/hybrid-v2/ch04-image-v1.png` | `assets/deep-learning/hybrid-v2/prompts/ch04-image-v1.txt` | `e4c33539787ad6a4bab8e703e2981d1cbe2ff39b80327c964c631babb45a3a17` | 1536×1024 | none; opaque | Hand-colored pixel-picture study at left and three separated channel sheets at right; central and top/bottom lanes remain open for live bridge, channel labels, dimensions, and selected-pixel values. |
| `ch04.text` | `assets/deep-learning/hybrid-v2/ch04-text-v1.png` | `assets/deep-learning/hybrid-v2/prompts/ch04-text-v1.txt` | `0c9f11e41377780acad3e9f91513919b8660f3498b8872bc7a383fa4b83f383f` | 1536×1024 | none; opaque | Exactly five blank taped token scraps above one long blank embedding strip; the blank center corridor is reserved for the live lookup arrow and the strips are reserved for live labels/IDs/values. |
| `ch04.audio` | `assets/deep-learning/hybrid-v2/ch04-audio-v1.png` | `assets/deep-learning/hybrid-v2/prompts/ch04-audio-v1.txt` | `08110ad27e6699e6e4f5646d6f74ace20191fca6782ca7d9b3f9700ab2fbfc7d` | 1536×1024 | none; opaque | Sparse taped waveform with a quiet amber window and separate low-density spectrogram patch; live code owns sample markers, window state, bridge arrow, and time/frequency/value labels. |

## Inspection and acceptance

Each accepted output was visually inspected at native 1536×1024 (100% view) and at a 390px-wide proportional preview. All five assets passed the following checks:

- subjects are fully inside the artboard and remain recognizable at 390px;
- warm ruled paper, graphite/fineliner pressure, marker grain, tape, torn edges, and calm negative space match the Chapter 1/reference material language;
- no visible readable words, letters, numbers, equations, axes, legends, captions, buttons, browser chrome, logos, watermarks, or pseudo-writing;
- no fake checkerboard transparency, gradients, glossy effects, software-card shells, hard digital outer border, or clipped focal object;
- no overlapping sheets/tiles that would conflict with live overlays;
- reserved lanes remain intentionally blank enough for responsive SVG labels and state marks.

No targeted re-generation was necessary: the first generated candidate for each requested plate passed the native and 390px inspection. The prompts explicitly repeat the text-free and live-overlay ownership constraints; future variants must retain the same stable subject positions and composition.

## Integration notes

- Use `object-fit: contain`/the renderer's normalized transform; do not stretch these 3:2 plates.
- Treat each plate as one bounded decorative layer below live SVG/Canvas state layers. Do not redraw a second frame, channel sheet, token sheet, waveform, or spectrogram over the plate.
- The Ch3 dotted routes are deliberately light underdrawing; code may add a single authoritative directional route, but should not stack a heavy duplicate on top.
- Ch4 uses three asset IDs/variants. Selecting `image`, `text`, or `audio` must swap the plate without changing the existing stage footprint or control contract.
