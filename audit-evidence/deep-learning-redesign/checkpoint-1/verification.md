# Deep Learning renderer checkpoint 1 — verification record

Date: 2026-08-29

Scope: Chapters 1–4 only. Chapters 5–12 remain on the bundled renderer and were not redesigned in this checkpoint.

Follow-up hero repair: `modules/deep-learning-renderer.css` now replaces the
unbounded legacy hero pseudo-layers with a bounded, static loop sketch using
the existing orbit/signal nodes. The title/hero footprint is unchanged; the
four labels and lower-right cue are explicitly positioned inside the hero.

## Static verification

The following checks passed from the repository root:

- `node --check modules/deep-learning-renderer.js`
- `git diff --check`
- `node scripts/build.mjs --validate-only` — 34 pages validated with statistical-content and local-link checks.
- Module-local invariant scan: renderer hook, both legacy Deep-only gates, six inert legacy style blocks, Chapters 1–4 branches, image/text/audio selector states, seeded roughness, no replacement `requestAnimationFrame`, normal-flow mobile CSS, and twelve-chapter ARIA normalization all passed.

## What is wired

- `modules/deep-learning.html` sets the Deep-only renderer flag and loads the module-local CSS/JS boundary. The old Deep-only Canvas adapter and scene-state/mask script return immediately under that flag. Their style blocks are retained as inert `type="text/plain"` historical fallback code so shared theme files and other modules are untouched.
- `modules/deep-learning-renderer.js` creates one authoritative renderer canvas, hides the legacy canvas for active chapters 1–4, and restores the legacy canvas for chapters 5–12. It observes React chapter/control state and redraws only on state or size changes.
- `modules/deep-learning-renderer.css` provides the scoped canvas stacking boundary and removes mobile sticky occlusion by putting the visual stage in normal flow at `<=820px`.
- The shell's authored ARIA label is normalized from “Thirteen chapters…” to “Twelve chapters…” after the bundled React tree mounts; chapter order/count and visible controls remain authored by the shell.

## Browser evidence limitation

The existing Chrome extension connection could list the open local Deep Learning tab (`http://127.0.0.1:4174/modules/deep-learning.html`), but every page-control operation required for visual evidence—tab acquisition, DOM snapshot, screenshot, or opening a fresh local tab—timed out repeatedly, including a retry after the hero repair. The extension was therefore left untouched; no shell/AppleScript/browser substitute was used. Screenshot capture at 1440×900, 1280×720, 390×844, the Chapter 2 toggle, and the Chapter 4 selector states remains pending a functioning browser connection/review pass.

## Known tradeoff for review

The legacy React Canvas is hidden for Chapters 1–4 but its bundled effect still owns an idle animation loop until the later chapters are rebuilt. The replacement renderer itself has no idle RAF. Removing that loop safely would require a separate, deliberate bundle/source boundary decision; no global RAF or Canvas monkey patch was added in this checkpoint.
