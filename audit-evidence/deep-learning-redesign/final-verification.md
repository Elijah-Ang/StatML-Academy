# Deep Learning handwritten renderer — final verification

Date: 2026-08-29

## Outcome

The Deep Learning module now uses one module-local, deterministic handwritten
Canvas renderer for all twelve chapters. The original React lesson shell,
chapter sequence, narrative, controls, ranges, captions, and accessible names
remain the source of truth.

The former bundled Canvas component is retired only when
`data-deep-learning-renderer="v1"` is active. Its surgical early return occurs
before `useRef` / `useEffect`, so the old canvas, requestAnimationFrame loop,
and resize listener are not created. No global Canvas, RAF, or event-listener
monkey patch is active.

## Preservation evidence

- Baseline: `99e3aaceb229d6028b24ec94159462829b965f79`.
- The complete `_l` twelve-chapter authored data segment is byte-for-byte
  identical to baseline: 17,039 characters, SHA-256
  `e8c7a5069d98d554b93c628b797cd57eb4aab2c551a3e6ec3157e5aa5acb2ec8`.
- The `Ss` React shell/control segment is byte-for-byte identical after
  normalising the intentional ARIA correction from “Thirteen chapters” to
  “Twelve chapters”: 11,257 characters.
- No shared theme file or other module was changed by this redesign.

## Live verification

Local URL: `http://127.0.0.1:8765/modules/deep-learning.html?academy=1`

- Desktop live page: one `.canvas-wrap canvas`; renderer version
  `checkpoint-3-rework-1`; zero console warnings/errors.
- Live scenes inspected: Chapter 1, Chapter 9 CNN/RNN/Transformer, Chapter 10
  transfer learning, Chapter 11 confusion matrix/threshold, and Chapter 12
  deployment pipeline.
- Chapter 9 selector changes replaced the complete mechanism while retaining
  one canvas. CNN, RNN, and Transformer were visually distinct and contained.
- Chapter 11 threshold was exercised from 0.50 to 0.90. The knob, matrix
  counts, recall, precision, and accuracy changed together.
- Phone viewport: 390 x 844; document `scrollWidth === clientWidth === 390`;
  replacement canvas 364 x 491.398 CSS pixels; Chapter 1 composition contained.
- Static-frame check: two screenshots 750 ms apart had the same SHA-256,
  `792b9a0e482f6bb46d653cf3728aec0cc36c3d577bf913b74ac258a0366e82f0`.
- Live console after interaction and frame-stability checks: no warnings/errors.

## Mechanical verification

- `node --check modules/deep-learning-renderer.js` — PASS.
- Executable inline scripts parse — PASS (checkpoint-3 verification).
- `git diff --check` — PASS.
- `npm run build` — PASS, 34 pages.
- Post-build Deep Learning file hashes — unchanged.
- `npm test` — PASS, including validation and Logistic browser stages/final reveal.

## Review trail

Independent Luna Max visual and art-direction reviews were run after each
checkpoint. Their blocking findings were repaired in three bounded phases:
Chapters 1–4, Chapters 5–8, and Chapters 9–12. Both reviewers hit their usage
limit during the last blocker-only re-review, so the final rework was completed
with root source inspection plus live desktop/mobile and interaction checks.

No generated image asset was used. Every final scene is code-rendered because
its labels, data, equations, or interaction state must remain live.
