# Deep Learning renderer — checkpoint 3 rework 1 blocker review

Date: 2026-08-29  
Mode: fast, read-only source review; no browser and no source edits.  
Scope: recheck of every blocker in `checkpoint-3/visual-crossreview.md`, plus
the final ownership/Ch1–8 boundary.

## Verdict

**FAIL — two exact blockers remain.** The rework resolves the Ch9 CNN output
lane, Ch9 RNN compact overflow, Ch9 Transformer context hand-off, Ch10 source
note collision, and Ch12 compact DECODE/operations collision plus the desktop
manifest hand-off. Ch11 introduces a new compact label collision, and the
noncompact Ch12 operations/footer lane remains uncomfortably tight. The latter
is a P2 polish blocker; the Ch11 overlap is P1.

## Prior-blocker matrix

| Area | Result | Source verification |
|---|---|---|
| Ch9 — CNN compact output | **PASS** | `outputGap` is now measured (minimum 28px), the arrow runs from `bankBottom+7` to `mapY−9`, and the map label is below the map at `mapY+compactMapSize+16` (`modules/deep-learning-renderer.js:1277–1309`). At 651×418 and 349/364px compact widths, the output connector has a positive 12–18px lane and the label no longer sits on it. |
| Ch9 — RNN compact prediction/footer | **PASS** | Score/prediction placement is derived from `footerY`; at 651×418 the 104px score panel and y≈346 prediction chip fit above the footer, and at 349×472 / 364×491 the chip ends 29px before the footer baseline (`modules/deep-learning-renderer.js:1327–1362`). |
| Ch9 — Transformer context hand-off | **PASS** | The strongest ANIMAL relationship now has a dedicated vertical drop and arrow into the context chip (`modules/deep-learning-renderer.js:1387–1413`). The endpoint is inside the compact context card at 375/390 widths and does not cross token labels. |
| Ch10 — compact backbone source note | **PASS** | The source note has its own 18px lane after the second feature row; the backbone height is expanded to include it (`modules/deep-learning-renderer.js:1427–1459`). At 651×418 the second row ends at y≈158 and the note baseline is y≈176; at the 375 compact canvas the corresponding separation is also positive. |
| Ch11 — compact note-to-threshold label | **PASS for the prior defect** | The threshold rail moved to `noteY+52`, giving a 10px post-chip baseline gap (`modules/deep-learning-renderer.js:1554–1565`). The previous note/threshold collision is resolved. |
| Ch11 — compact range labels/metrics | **FAIL — P1** | The compact `find more`/`fewer alarms` labels are drawn at `railY+19`, but recall/precision are drawn at `metricsY = railY+20` (`modules/deep-learning-renderer.js:1562–1574`). Their baselines differ by only 1px, with both left and right labels sharing the same x anchors, so the range labels and metrics overlap at 651×418 and 349/364 compact widths. `accuracy` follows only 19px later. | Move metrics below the range-label row with a measured gap (or remove the redundant endpoint labels); keep the rail and metrics readable at compact height. |
| Ch12 — compact DECODE/operations | **PASS** | Operations now starts at `height−63`; route top/step/radius are solved against `decodeMaxY = operationsY−24` (`modules/deep-learning-renderer.js:1633–1668`). At 349×472 and 364×491, DECODE ends at roughly y=401/420 and the operations chip begins roughly y=409/428, leaving 8px. The 651×418 short fallback also retains positive clearance. |
| Ch12 — noncompact manifest hand-off | **PASS** | The manifest arrow now terminates at `spineX−18` and a visible hand-off line continues to the spine (`modules/deep-learning-renderer.js:1684–1699`), removing the former 24px disconnected gap. |
| Ch12 — noncompact operations/footer lane | **FAIL — P2** | The noncompact operations chip remains at `height−54` with height26 (bottom `height−28`), while the final footer baseline is `height−19` (`modules/deep-learning-renderer.js:1702–1704`). The text ascent leaves only about 1–2px of clearance and the footer shares the chip’s horizontal span at the 651/719px desktop widths. This is still a visually cramped/touching lane even though it is not clipped. | Reserve a real gap below the operations note or move/remove the duplicate footer sentence in the noncompact branch. |

## Final boundary and preservation

- **One-canvas/legacy retirement: PASS source-level.** The v1 guard remains
  before the legacy component hooks/Canvas, and the module renderer creates or
  reuses one canvas (`modules/deep-learning-renderer.js:1770–1782`). The active
  ownership boundary remains `state.active <= 11` (`modules/deep-learning-renderer.js:1805–1818`); no visible legacy painter is mounted under v1.
- **Ch1–8 preservation: PASS source-level.** Dispatch still covers the original
  scene branches and the new Ch9–12 branches (`modules/deep-learning-renderer.js:1707–1719`); existing Ch1–8 control reads remain in `getState`. No preservation blocker was introduced by rework-1.
- **No active module RAF: PASS source-level.** The module renderer still has
  no `requestAnimationFrame`; legacy RAF/listener text is unreachable under the
  early v1 return. Browser frame/console verification remains outstanding.

## Acceptance gate

1. Fix the Ch11 compact `find more`/`recall` and `fewer alarms`/`precision`
   baseline collision.
2. Give noncompact Ch12 operations/footer text a deliberate gap.
3. Run the live 1280×720, 1440×900, and 390×844 pass once, including all
   architecture tabs, threshold extremes, console errors, one-canvas count,
   and idle-frame stability.

