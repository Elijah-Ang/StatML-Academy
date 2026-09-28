# Audit evidence · 27 September 2026

This folder supports the [UX and learning-design plan](../../docs/ux-learning-redesign/README.md). The audit used the current local checkout, not a deployed website. It created planning documents and audit artifacts without modifying the recorded application source files.

## Coverage

- 33 module pages, plus the universe landing page.
- 359 rendered lesson stages; 347 are directly present in static HTML, and 12 Deep Learning stages render from its embedded client bundle.
- 68 page/viewport visits and 718 stage/viewport traversals at 1440 × 1000 and 390 × 844.
- No recorded `pageerror` exceptions and no document-level horizontal overflow in that sweep. This does not establish full accessibility, control correctness, or cross-browser conformance.
- 20 screenshots of the current landing/representative lesson pages, plus two screenshots of the proposed notebook at different widths.
- Targeted checks of six pages for selected rendering/state behavior.
- A stage playbook with 359 explicit, individually authored directives. Its generator checks exact agreement with the rendered inventory.
- Eleven JavaScript snippets in the implementation plan passed `node --check`. They are proposed integrations, not production-tested replacements.
- SHA-256 comparison of 72 recorded application/source files found no changes. The Git CLI was unavailable because the machine's Xcode license was not accepted; no license/system setting was changed.

## Files

| File | Purpose |
|---|---|
| `source-inventory.json` | Static stages, source lines, text, dependencies, and code-shape counts |
| `runtime-inventory.json` | Rendered stages/text/controls, visible navigation, resources, errors, and geometry smoke checks |
| `targeted-results.json` | SVG replacement, reduced-motion callback counts, regression revisit, and sampling resize observations |
| `verification-summary.json` | Compact counts and source-integrity result |
| `source-hashes-before.json` | Baseline hashes for recorded production/source files |
| `prototype-checks.json` | Computed regression values, responsive overflow checks, and preview error collection |
| `screenshots/` | Current UI samples and proposed-notebook samples |
| `inventory.py` | Read-only source inventory; rerunning intentionally refreshes the evidence baseline |
| `browser-audit.mjs` | Local-server all-module traversal; writes only audit outputs |
| `targeted-audit.mjs` | Selected interaction checks; expects the project served on localhost:8137 |
| `build-playbook.py` | Validates directive coverage and regenerates the planning document |

## Specific reproduced behaviors

The local Chrome run counted about 60 requestAnimationFrame callbacks over one idle second in Simple Linear Regression, K-Means, and PCA even with reduced motion enabled. This is a scheduling observation, not a frame-rate or battery benchmark.

Naive Bayes and Deep Learning returned a different SVG object after a trace step. Their explicit Play actions were still available under reduced motion; that alone is not a standards violation, but spatial animation and automatic progression need clearly defined behavior.

The probability-sampling lab's mean changed 50.1 → 49.7 → 50.5 → 49.7 when only viewport width changed. The sample count and nominal n stayed fixed. Source inspection confirmed randomness inside the draw function called by resizing.

The regression revisit check eventually returned to the correct first stage. Its long easing tail is a transition-design issue; this audit does not report it as a persistent wrong-stage defect.

The proposed regression preview starts at slope 7/intercept 40 with SSE 51.0. Least squares computes slope 4.9/intercept 45.3 with SSE 1.9. Selecting student C gives predicted score 60 and residual +1. Resizing preserved SSE. Checks at outer browser widths 1024, 736, 390, and 320 showed no iframe document overflow; the wrapper adds horizontal margins, so the measured inner widths were smaller. Reduced-motion reset and a changed slope also updated the values. The preview is a concept demonstration, not the full proposed mobile expansion system.

## Reproduction

From the project root, run `node audit-evidence/ux-learning-2026-09-27/browser-audit.mjs` for the all-module sweep. It starts and closes its own localhost server and headless Chrome. The Python inventory/playbook scripts use the already available BeautifulSoup installation; no new dependencies were installed.

For the targeted check, first serve this checkout on localhost:8137, then run `node audit-evidence/ux-learning-2026-09-27/targeted-audit.mjs`. Stop that server after the check. The server used during this audit was stopped.

Do not run the current `npm test` or `build --validate-only` assuming they are read-only: their imported generator modules presently write at import time. The plan includes an explicit fix before using those commands for source-preservation checks.
