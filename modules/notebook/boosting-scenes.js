import { frame, caption, line, arrow } from "./spatial.js";
import { extent, linspace, palette, fmt } from "./lab.js";
import { treePredict } from "./science.js";

export function boostingStory(s, P, d, st, selected) {
  s.begin(760);
  const previous = Math.max(0, st.round - 1),
    before = (r) => d.ensemble.predict(r, previous),
    correction = (r) =>
      st.round ? treePredict(d.ensemble.trees[st.round - 1], r) : 0,
    after = (r) => d.ensemble.predict(r, st.round),
    rows = d.split.train,
    xs = linspace(-2.4, 2.4, 101),
    queries = xs.map((x) => ({ x, z: st.second }));
  let y = caption(
    s,
    "boost-title",
    st.round
      ? `Round ${st.round}: repair what the previous model missed.`
      : "Round 0: start with the training mean.",
  );
  y = caption(
    s,
    "boost-slice",
    `Curves hold x₂ = ${fmt(st.second)}. Dots retain each row’s own x₂.`,
    y + 6,
  );
  const outcome = extent([
      ...rows.map((r) => r.y),
      ...queries.flatMap((r) => [before(r), after(r)]),
    ]),
    residual = extent([
      0,
      ...rows.map((r) => r.y - before(r)),
      ...queries.map(correction),
    ]);
  ["before", "residual", "after"].forEach((kind, j) => {
    const top = y + 40 + j * 180;
    s.text(
      "boost-panel" + j,
      47,
      top - 15,
      [
        `1 · Previous prediction F${previous}`,
        "2 · Fit a small tree to the residuals",
        `3 · Add ${fmt(st.rate, 2)} × correction`,
      ][j],
      { "font-size": 14 },
    );
    const a = frame(
      s,
      "boost-" + kind,
      { x: 47, y: top, w: s.w - 77, h: 108 },
      [-2.4, 2.4],
      j === 1 ? residual : outcome,
      j === 2 ? ["Input x₁"] : [],
      true,
    );
    const fn = j === 0 ? before : j === 1 ? correction : after;
    line(
      s,
      P,
      "boost-curve" + j,
      queries.map((r) => [a.x(r.x), a.y(fn(r))]),
      palette[j === 0 ? 0 : j === 1 ? 1 : 2],
      2.6,
    );
    if (j === 2)
      line(
        s,
        P,
        "boost-before-ghost",
        queries.map((r) => [a.x(r.x), a.y(before(r))]),
        palette[0],
        1.4,
        "4 4",
      );
    if (j === 1)
      s.line("residual-zero", a.l, a.y(0), a.r, a.y(0), "#8d988e", 1, "3 4");
    rows.forEach((r) => {
      const value = j === 1 ? r.y - before(r) : r.y;
      s.mark(
        "boost-row" + j + r.id,
        ...P("boost-row" + j + r.id, a.x(r.x), a.y(value)),
        palette[0],
        `${r.id}: ${j === 1 ? "residual" : "outcome"} ${fmt(value, 2)}`,
        selected.id === r.id,
        r.id,
      );
    });
    const rowValue = j === 1 ? selected.y - before(selected) : selected.y;
    s.line(
      "selected-gap" + j,
      a.x(selected.x),
      a.y(rowValue),
      a.x(selected.x),
      a.y(fn(selected)),
      palette[3],
      2.5,
    );
    if (j === 2)
      arrow(
        s,
        "applied-correction",
        [a.x(selected.x) + 8, a.y(before(selected))],
        [a.x(selected.x) + 8, a.y(after(selected))],
        palette[3],
        2.5,
      );
  });
  y = caption(
    s,
    "boost-equation",
    `${selected.id}: ${fmt(before(selected), 3)} + ${fmt(st.rate, 2)} × ${fmt(correction(selected), 3)} = ${fmt(after(selected), 3)}`,
    y + 603,
  );
  caption(
    s,
    "boost-foot",
    "Gold follows one training row. The correction is learned from training residuals only.",
    y + 5,
  );
}
