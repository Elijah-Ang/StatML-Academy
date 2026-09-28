# Deep Learning redesign — Checkpoint 3 verification

Date: 2026-08-29  
Scope: Chapters 9–12 and final renderer ownership only

## Files

- `modules/deep-learning-renderer.js` — module-local deterministic Canvas
  renderer. Checkpoint 3 adds the Chapter 9–12 scenes and extends the existing
  dispatch/resize/state boundary through chapter index 11.
- `modules/deep-learning-renderer.css` — Deep-only canvas and responsive
  boundary. The shared handwritten theme and every other module are untouched.
- `modules/deep-learning.html` — renderer asset cache key, twelve-chapter
  shell label, inactive legacy adapter, and the surgical legacy component
  guard described below.

## Chapter implementation

- **09 — architecture choice:** CNN is one input grid with a highlighted 3×3
  stencil, a compact three-filter bank, and one related feature map. RNN has
  exactly `h1`, `h2`, and `h3`, with one stable next-word score list. The
  Transformer branch uses five tokens, selects `IT`, keeps Q/K/V in a dedicated
  row, and draws three orthogonal attention links in separate lanes before a
  single context result. Compact geometry is width- and height-aware.
- **10 — transfer learning:** three explicit zones communicate frozen
  backbone → `reuse general features` → trainable task head. The backbone
  exposes six feature chips; the head exposes the three authored classes; the
  fine-tune note is a small separate annotation. No hatch or wash is used.
- **11 — honest judgement:** a filled 3×3 CAT/DOG/RABBIT actual-versus-
  predicted matrix is paired with a threshold rail, recall, precision,
  accuracy, and trade-off labels. The deterministic nine-example fixture is
  recomputed on every threshold input, so the displayed counts and metrics
  change truthfully with the control. Compact mode reserves separate matrix,
  legend, rail, metrics, and trade-off lanes.
- **12 — production release:** a versioned `RELEASE v27 · ONE BUNDLE`
  manifest is connected to one numbered vertical
  `VALIDATE INPUT → PREPARE → PREDICT → DECODE` spine and one operations note.
  There is no duplicate route, mask, or moving painter.

All scene marks use seeded `jitter`/`roughPath` values. Chapters 9–12 have no
idle animation loop; redraws occur only after a relevant state or size change.
Existing controls, labels, captions, chapter IDs/order, navigation, and ARIA
attributes remain in the React shell.

## Legacy painter retirement

The bundled React shell is retained for its authored narrative and controls,
but its minified `My` visual component is now guarded at the component boundary
in `modules/deep-learning.html`. The exact seam is:

```js
function My({active:e,biased:t,tensorMode:l,earWeight:a,furWeight:n,backgroundWeight:u,neuronBias:i,learnStep:f,learningRate:s,epoch:h,architecture:b,threshold:T}){if(document.documentElement.dataset.deepLearningRenderer==="v1")return null;let y=...
```

The guard runs before `useRef`, `useEffect`, the Canvas JSX, or any legacy
resize/RAF setup. Because the Deep-only `v1` flag is set before the shell
loads, `My` consistently returns `null` for the lifetime of this page and
cannot violate hook ordering. The module-local renderer creates the only
`.deep-learning-renderer-canvas`. The previous adapter script is now
`type="text/plain"` reference text, and the obsolete `deep-learning-scene-state`
runtime hook was removed. No global Canvas, RAF, or event-listener monkey patch
was added. The old fallback remains only as unreachable source text for the
flag-off historical path; it is not mounted under the active Deep page.

The old broad Deep-only style blocks remain inert `type="text/plain"` historical
references so this checkpoint does not mutate shared theme files. The active
base hero mask declaration was removed, and the live renderer CSS contains no
mask-based cover layer.

## Static verification

Passed on the current worktree:

```text
node --check modules/deep-learning-renderer.js
git diff --check -- modules/deep-learning.html modules/deep-learning-renderer.js modules/deep-learning-renderer.css
node scripts/build.mjs --validate-only
Validated 34 pages with statistical-content and local-link checks.
```

Additional source invariants passed: 12 scene dispatches are present; the
renderer contains no `requestAnimationFrame`; the guarded bundle seam appears
once and precedes `function Ss`; the source contains `Twelve chapters`; the
legacy state hook is absent; the renderer cache key is `checkpoint-3`; and all
executable inline scripts, including the guarded bundle, parse successfully.

## Review limitation

No browser automation or screenshot capture was run in this checkpoint by
instruction. Therefore exact loaded-font pixel bounds, browser compositing, and
interaction evidence at 1440×900, 1280×720, and 390×844 remain for the dual
visual review. Source geometry is explicitly bounded for those dimensions and
the existing 456px mobile canvas contract.
