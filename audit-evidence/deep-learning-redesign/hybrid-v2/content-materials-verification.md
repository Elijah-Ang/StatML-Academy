# Deep Learning hybrid-v2 content-materials verification

Date: 2026-08-29

## Scope

- Added `modules/deep-learning-materials.css`.
- Added one cache-busted stylesheet link in `modules/deep-learning.html` after
  the authored page styles, so the material layer wins without changing the
  renderer boundary.
- No renderer JavaScript, renderer CSS, shared theme, chapter data, DOM order,
  content, chapter min-heights, controls, ARIA attributes, or visual-pane
  rules were changed by this pass.

## Material treatment

The rules are scoped to `html[data-deep-learning-renderer="v1"] body.hw-handwritten
.narrative` and its descendants. The narrative now uses:

- faint notebook ruling and paper grain;
- retraced pencil margin rules and irregular inked chapter numbers;
- highlighter strokes beneath chapter headings and selected explanatory text;
- yellow ruled `Why it matters` / `Picture it` notes with tape;
- dashed worksheet separators for ordered steps;
- rough paper frames for examples, controls, tensor explanations, architecture
  explanations, threshold/epoch notes, and deployment checklists;
- marker-style dataset split bars and hand-inked control states.

Decorative borders/tape are pseudo-elements and therefore do not add layout
height. No transforms are applied to live copy; the slight irregularity is
limited to backgrounds, clip paths, borders, and non-semantic shadows.

## Browser smoke checks

Using a local Playwright static server:

- 1280px desktop: `document.documentElement.scrollWidth === 1280`;
- 390px mobile: `document.documentElement.scrollWidth === 390`;
- 12 `.lesson-step` elements present at both widths;
- no page errors at either width;
- live chapter 1 controls render with unchanged hit-area dimensions;
- screenshots: `/tmp/deep-content-materials-ch1-view.png` and
  `/tmp/deep-content-materials-mobile-ch1.png`.

The screenshots show the left narrative with the new paper, tape, highlighter,
and pencil treatment. The chapter visual pane remains untouched by this file.

## Static checks

- `git diff --check -- modules/deep-learning.html modules/deep-learning-materials.css` — pass.
- No build/generator was run in this subtask, to avoid rewriting unrelated
  generated module source. Parent orchestration should run the final project
  build/test after all parallel work is merged.

