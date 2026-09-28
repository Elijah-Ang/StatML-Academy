# Deep Learning checkpoint 2 — art blocker re-review, rework 1

Date: 2026-08-29  
Review mode: read-only source review; no browser retry and no application-source edits.  
Scope: only the four previously identified Chapter 5–8 blockers.

## Decision

**Overall: FAIL — three prior blockers are repaired at source level, but one
Chapter 8 gutter blocker remains.**

The current rework is materially better constructed: the Chapter 5 activation
lane is measured, Chapter 6 computes its compact rhythm from the actual stage
height, Chapter 7 derives a real center lane and collision-checks the step
badge, and Chapter 8 separates the compact legend rows. Those repairs address
the original failures at the ordinary phone/desktop target dimensions by
inspection of the formulas. The noncompact Chapter 8 `loss` title, however,
still uses the old horizontal placement and can share the y-axis tick-label
envelope. That is a remaining reading-order collision, so checkpoint 2 should
not be released as a full art PASS yet.

No generated asset is indicated for these fixes. All four visuals are
data-driven and the remaining failure is layout math, not an illustration
quality problem.

## Blocker matrix

| Prior blocker | Verdict | Source evidence |
| --- | --- | --- |
| Ch5 ReLU → output connector | **PASS** | Activation cards and arrows are placed from measured widths and card bounds; a vertical fallback exists below the fit threshold (`deep-learning-renderer.js:804–852`). |
| Ch6 `parts` → class connector | **PASS** | Compact card height and class position are derived from stage height with a positive class gutter; desktop reserves a 32/40px final gutter (`:913–960`). |
| Ch7 center card / `step` badge | **PASS** | Compact center width is derived from the rail gap, and badge candidates are rejected when they intersect any node or center card (`:1032–1098`). |
| Ch8 compact legend / loss gutter | **FAIL** | Compact legend and rotated loss title are separated, but the desktop/noncompact branch still draws horizontal `loss` beside the tick labels (`:1123–1158`). |

## Chapter 5 — ReLU → output connector: PASS

The rework now defines explicit compact/desktop widths for the `z`, ReLU,
and output cards, enforces a minimum gap, and only chooses the horizontal lane
when the available width satisfies the measured requirement
(`deep-learning-renderer.js:804–824`). Both activation arrows start and end
from the actual neighboring card bounds (`:828–831`), so the old reversed or
degenerate ReLU-to-output segment cannot occur in the intended horizontal
case. At a roughly 333px compact canvas, the source yields a 297px available
lane against a 270px requirement; at a roughly 651px desktop canvas it yields
a wide positive gap. The narrow fallback is forward-only and vertically
stacked (`:832–852`).

This preserves the live slider relationship: products, `z`, ReLU output, line
weight, and negative/zero styling remain code-driven (`:756–802`). No art
asset would improve this; the previous issue was connector geometry.

## Chapter 6 — `parts` → class connector: PASS

The compact branch now measures the four-sheet stack against the actual canvas
height, including card height, four arrow gaps, the class gap, class-chip
height, and a footer reserve (`deep-learning-renderer.js:913–926`). The final
arrow is explicitly drawn from `partsBottom + 5` to `classY - 5`, and the class
chip follows at `classY` (`:932–936`); there is no upward `min()` clamp that can
put the class back inside the `parts` sheet.

The short-column case is source-safe by the target geometry: with a stage near
385px high, the measured card height is about 49.5px, `parts` ends near 296px,
the class starts near 312px, and the final connector runs downward from about
301px to 307px. A normal compact phone stage uses the capped 58px cards and
leaves the same positive final gutter. The desktop branch separately reserves
`lastGap = 32px` below 600px-wide noncompact layouts and `40px` above it
(`:938–960`).

The compact inter-sheet arrow spans are short (the 16px slot leaves roughly
6px of line before the arrowhead), but this is a polish concern, not the prior
overflow/reversal blocker. The layer names, marks, and class decision remain
live code and need no generated asset.

## Chapter 7 — center card / `step` badge: PASS

The compact side nodes are 88px wide, creating an interior rail gap instead
of painting the loop underneath a fixed-width center card
(`deep-learning-renderer.js:1032–1069`). The center width is derived from
`routeRight - routeLeft - 24`, bounded to a readable range; at the ordinary
phone canvas this leaves positive clearance on both sides of the center card.

The moving marker remains a quiet code-driven dot, while the `step N` label is
now placed by testing four candidate gutter badges against rectangles for all
four loop nodes and the center card (`:1075–1098`). This removes the prior
state-dependent collision with `BACKPROP` and keeps the learning-step state
truthful. The button-only learning trace contract is unchanged. No asset is
justified.

## Chapter 8 — compact legend and loss gutter: FAIL

### Repaired compact behavior

The compact branch puts `training` and `validation` on separate rows at y=42
and y=64, while the best-validation chip occupies the right lane at y=32
(`deep-learning-renderer.js:1123–1138`). The compact `loss` title is rotated
inside a dedicated left gutter at `plotLeft - 32`, while y-axis tick labels
remain right-aligned at `plotLeft - 9` (`:1140–1155`). At the roughly 333px
phone canvas, this is a deliberate, readable separation and fixes the original
compact legend/tick collision.

### Remaining blocker: desktop/noncompact loss gutter

The noncompact `else` branch still uses:

```js
write(ctx, 'loss', plotLeft - 31, plotTop + plotHeight / 2, 9, muted,
  {utility: true, weight: 700});
```

at `deep-learning-renderer.js:1156–1158`, while the y-axis tick labels are
still drawn right-aligned at `plotLeft - 9` (`:1140–1144`). On the ordinary
desktop visual canvas (approximately 651px wide, with `plotLeft = 56`), the
horizontal `loss` word occupies the same middle-height gutter as the `0.7`
style tick label; their text envelopes can touch or overlap. The compact fix
does not cover this branch. The result is still a left-margin text tangle on
desktop, violating the requirement that labels sit in distinct annotation
lanes.

### Required release fix

Use the same rotated loss-title treatment for the noncompact branch, or give
the desktop title a measured gutter that cannot intersect the tick-label
envelope. Keep the tick labels, chart geometry, epoch control, best-validation
marker, and regime labels unchanged. Recheck the desktop canvas at 1280px and
1440px shell widths after the one-line/one-lane repair.

## Verification boundary

This is a source-only verdict. Browser capture and interaction replay were
not attempted, as instructed. The current source was inspected with exact
line references; the prior rework report records passing `node --check`,
`git diff --check`, and `node scripts/build.mjs --validate-only`. The remaining
FAIL is therefore a concrete source-level blocker, not a claim about an
unseen screenshot.

## Final Ch8 desktop-gutter recheck — PASS

Rework 2 removes the last blocker identified above. The renderer now uses one
dedicated rotated `loss` title gutter for both compact and noncompact layouts;
there is no desktop `else` branch that writes horizontal `loss` beside the
y-axis ticks (`modules/deep-learning-renderer.js:1147–1154`). Tick labels
remain right-aligned at `plotLeft - 9` (`:1140–1144`), while the title is
translated to `plotLeft - 32` and rotated before drawing. These envelopes are
therefore separated at the desktop visual-column widths that previously
failed, as well as on compact screens.

**Final targeted verdict: PASS — the Chapter 8 desktop `loss` gutter blocker
is cleared at source level.** Together with the Ch5, Ch6, and Ch7 PASS findings
above, all four checkpoint-2 rework blockers are now source-level PASS. This
remains a source-only judgment; browser capture was not attempted.
