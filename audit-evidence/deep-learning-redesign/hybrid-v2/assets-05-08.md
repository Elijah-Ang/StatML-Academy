# Hybrid-v2 generated art: Chapters 5–8

Date: 2026-08-29
Generator: built-in ImageGen (not CLI fallback)
Style references (material only; no layout copied):

- `/Users/elijahang/Downloads/ChatGPT Image Aug 23, 2026, 07_11_55 PM (4).png`
- `/Users/elijahang/Downloads/ChatGPT Image Aug 23, 2026, 07_11_53 PM (1).png`
- `/Users/elijahang/Downloads/ChatGPT Image Aug 23, 2026, 07_11_54 PM (2).png`
- `/Users/elijahang/Downloads/ChatGPT Image Aug 23, 2026, 07_11_55 PM (3).png`

All accepted plates are intentionally opaque `#FBF6E9` paper plates. ImageGen
returned RGB PNGs (`hasAlpha: no`), so no fake checkerboard transparency was
accepted. The plates are designed as bounded paper underdrawings: live code
must own every label, value, equation, axis, connector, state, and control.
All four were inspected at original size and at a 390px-wide downsample.

| Chapter | Accepted file | ImageGen output | Dimensions | Bytes | SHA-256 | `opaque` | Integration anchor / live-code reservation |
| ---: | --- | --- | ---: | ---: | --- | :---: | --- |
| 5 | `assets/deep-learning/hybrid-v2/ch05-neuron-material-v2.png` | `exec-4819851b-8529-4128-8f5c-3ab0f98da9af.png` | 1536×1024 | 1,744,350 | `df938362f95742e9c5cdb403cf3d2f4d1da9d79e14efc7e3001fbe0d7c4620b8` | true | Neuron center; four left paper tabs; one right output tab. No wires or arrows in plate. Reserve top/lower lanes for live equation, products, activation and values. |
| 6 | `assets/deep-learning/hybrid-v2/ch06-feature-sheets-v1.png` | `exec-9eb524de-ff2e-4323-8746-2e9d91ff5434.png` | 1536×1024 | 2,071,046 | `949fea981791dbeb86561ca23cd73c06d5eef8ed80f793e6b1f245cd52e061b5` | true | Four separated tracing sheets left-to-right: pixels, edges, texture, parts. Reserve gaps for live layer names/arrows and lower/right lane for class result. |
| 7 | `assets/deep-learning/hybrid-v2/ch07-learning-loop-material-v1.png` | `exec-ef1b7b49-a59f-4868-8340-0f04c1cb961f.png` | 1536×1024 | 2,368,607 | `4a6e266b44d2a3aecb6ea2d55232f96f7f537cad5774d4dac9aee709850aa2d1` | true | Four separate colored notebook scraps around a blank center paper. Isolated marker swashes are material only; live code owns the loop route, arrows, step, loss and rate. |
| 8 | `assets/deep-learning/hybrid-v2/ch08-training-chart-material-v1.png` | `exec-966e65e7-bd34-4eb1-8c9e-f221d8078b3c.png` | 1536×1024 | 1,824,892 | `a594463b79385511640fcd5e3cbd4350fd89d5dd3145c7b6bb2618e5cdaf1d4d` | true | Blank graph-paper patch with restrained blue/coral swashes and green side strip. Live code owns axes, ticks, curves, checkpoint, epoch marker, legend, and regime labels. |

## Prompt provenance

The exact prompts used for the accepted assets are checked in beside the asset
family:

- `assets/deep-learning/hybrid-v2/prompts/ch05-neuron-material-v2.txt`
- `assets/deep-learning/hybrid-v2/prompts/ch06-feature-sheets-v1.txt`
- `assets/deep-learning/hybrid-v2/prompts/ch07-learning-loop-material-v1.txt`
- `assets/deep-learning/hybrid-v2/prompts/ch08-training-chart-material-v1.txt`

Each prompt explicitly requires the same single-person warm-paper/graphite/
felt-tip/marker material language, excludes text and semantic marks, requests
an opaque uniform cream background, and forbids checkerboard transparency,
website cards, digital gradients, glossy effects, and dense noise.

## Inspection / rejection notes

- `ch05-neuron-material-v1.png` was rejected and moved to
  `audit-evidence/deep-learning-redesign/hybrid-v2/rejected-assets/` because
  ImageGen visibly rendered a checkerboard fake-alpha background and included
  baked connecting lines. It is not an accepted or consuming asset.
- Accepted Chapter 5 has no baked connectors; its input/output tabs, tape, and
  node remain visually separable and leave blank live-code lanes.
- Accepted Chapter 6 has four distinct sheets with no overlap at 100% or
  390px; the final abstract part mark is static underdrawing only.
- Accepted Chapter 7 has four physically separated scraps and one central
  blank paper piece; the four small directional-looking swashes are isolated
  material accents and must not be treated as the live learning route.
- Accepted Chapter 8's grid is low-contrast and intentionally contains no
  axes, tick marks, curves, labels, or values.
- No module source or asset manifest was changed in this production pass.

## Verification commands

```text
sips -g pixelWidth -g pixelHeight -g hasAlpha assets/deep-learning/hybrid-v2/ch05-neuron-material-v2.png
sips -g pixelWidth -g pixelHeight -g hasAlpha assets/deep-learning/hybrid-v2/ch06-feature-sheets-v1.png
sips -g pixelWidth -g pixelHeight -g hasAlpha assets/deep-learning/hybrid-v2/ch07-learning-loop-material-v1.png
sips -g pixelWidth -g pixelHeight -g hasAlpha assets/deep-learning/hybrid-v2/ch08-training-chart-material-v1.png
```

Result for every accepted asset: `1536×1024`, `hasAlpha: no`; `opaque:true`
is therefore required when the consuming manifest is updated by the renderer
implementer.
