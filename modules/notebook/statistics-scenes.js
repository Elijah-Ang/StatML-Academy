import { fmt, palette } from "./ui.js";
import { frame, caption, arrow, line, paper, ink } from "./spatial.js";
import { extent } from "./lab.js";

export function sharedCauseStory(s){
  s.begin(380);
  let y=caption(s,'shared-cause-title','One possible shared cause can affect both outcomes.');
  const center=s.w/2,top=y+17,childTop=top+120,childWidth=(s.w-43)/2;
  s.rect('weather-node',center-75,top,150,47,palette[3]+'22',{stroke:palette[3]});
  s.text('weather-name',center,top+29,'Hot weather',{'text-anchor':'middle','font-size':18});
  for(const [i,words] of [['swimming',['More','swimming']],['sales',['More ice-cream','sales']]]){
    const x=i==='swimming'?14:s.w-14-childWidth,cx=x+childWidth/2;
    arrow(s,'weather-to-'+i,[center,top+47],[cx,childTop-5],palette[3]);
    s.rect(i+'-node',x,childTop,childWidth,73,palette[0]+'16',{stroke:palette[0]});
    words.forEach((word,j)=>s.text(i+'-name'+j,cx,childTop+29+j*23,word,{'text-anchor':'middle','font-size':15}));
  }
  y=caption(s,'shared-cause-scope','Arrows show a possible explanation, not measured effects.',childTop+111);
  y=caption(s,'shared-cause-result','A correlation alone cannot tell us which causal explanation is right.',y+10);
  s.fitHeight(y+20);
}

// Scenes use the same observations and calculations as the written receipt.
// Returned caption positions reserve real space before the next visual band.
export function samplingStory(s, P, d, st, scene) {
  s.begin(530);
  const index = st.sampleIndex - 1,
    sample = d.samples[index],
    average = d.means[index];
  let y = caption(
    s,
    "sampling-title",
    "Many observations become ONE sample mean.",
  );
  y = caption(
    s,
    "sampling-guide",
    `Sample ${st.sampleIndex} of 200 · ${st.n} observations`,
    y + 10,
  );
  const domain = d.sampleDomain;
  const top = frame(
    s,
    "observations",
    { x: 47, y: y + 10, w: s.w - 75, h: 76 },
    domain,
    [0, 1],
    [],
    false,
  );
  sample.forEach((v, i) => {
    const p = P("observation-" + i, top.x(v), top.t + 12 + (i % 6) * 9);
    s.circle("observation-" + i, ...p, 2.8, palette[0], { opacity: 0.7 });
  });
  s.line(
    "sample-average",
    top.x(average),
    top.t,
    top.x(average),
    top.b,
    palette[3],
    2,
    "3 3",
  );
  const centerY = top.b + 52;
  arrow(
    s,
    "collapse",
    [top.x(average), top.b + 8],
    [top.x(average), centerY - 8],
    palette[3],
  );
  s.circle(
    "one-mean",
    ...P("one-mean", top.x(average), centerY),
    6,
    palette[3],
  );
  y = caption(
    s,
    "mean-value",
    `Add the values ÷ ${st.n} = ${fmt(average, 2)}`,
    centerY + 29,
  );
  y = caption(
    s,
    "repeat",
    scene === "sample"
      ? "Repeat the same sampling recipe 200 times."
      : "Each dot below is a whole sample, averaged.",
    y + 8,
  );
  const bottom = frame(
    s,
    "sample-means",
    { x: 47, y: y + 12, w: s.w - 75, h: 96 },
    domain,
    [0, 1],
    ["Same outcome units for BOTH rows"],
    false,
  );
  const counts = new Map();
  d.means.forEach((v) => {
    const bin = Math.round((top.x(v) - top.l) / 6);
    counts.set(bin, (counts.get(bin) || 0) + 1);
  });
  const spacing = Math.min(5, 80 / Math.max(...counts.values())),
    bins = new Map();
  d.means.forEach((v, i) => {
    const bin = Math.round((top.x(v) - top.l) / 6),
      count = bins.get(bin) || 0;
    bins.set(bin, count + 1);
    const p = P("mean-" + i, bottom.x(v), bottom.b - 6 - count * spacing);
    s.circle(
      "mean-" + i,
      ...p,
      i === index ? 5 : 2.5,
      i === index ? palette[3] : palette[2],
      { opacity: i === index ? 1 : 0.55 },
    );
  });
  s.line(
    "population-mean-top",
    top.x(50),
    top.t,
    top.x(50),
    top.b,
    ink,
    1,
    "3 5",
  );
  s.line(
    "population-mean-bottom",
    bottom.x(50),
    bottom.t,
    bottom.x(50),
    bottom.b,
    ink,
    1,
    "3 5",
  );
  [domain[0], 50, domain[1]].forEach((v, i) =>
    s.text("sampling-tick-" + i, bottom.x(v), bottom.b + 17, fmt(v, 0), {
      "text-anchor": "middle",
      "font-size": 12,
    }),
  );
  y = caption(
    s,
    "sampling-footer",
    `Population mean stays 50. SE = SD ÷ √n = ${fmt(d.se, 2)}.`,
    bottom.b + 66,
  );
  caption(
    s,
    "sampling-footer2",
    "Increase n: individuals stay spread out; sample means gather closer.",
    y + 6,
  );
}

export function coverageStory(s, P, d) {
  s.begin(550);
  let y = caption(
    s,
    "coverage-title",
    "Repeat the study. Keep the true effect fixed at 0.",
  );
  const intervals = d.coverage,
    limit =
      Math.max(...intervals.flatMap((r) => [Math.abs(r.lo), Math.abs(r.hi)])) *
      1.08;
  const a = frame(
    s,
    "coverage",
    { x: 47, y: y + 26, w: s.w - 75, h: 300 },
    [-limit, limit],
    [0, 1],
    ["Estimated effect · outcome units"],
    false,
  );
  intervals.forEach((r, i) => {
    const cy = a.t + 6 + i * 7.2,
      color = r.covers ? palette[0] : palette[1];
    const lo = P("coverage-lo" + i, a.x(r.lo), cy),
      hi = P("coverage-hi" + i, a.x(r.hi), cy);
    s.line("interval" + i, ...lo, ...hi, color, 1.7);
    s.circle(
      "coverage-mean" + i,
      ...P("coverage-mean" + i, a.x(r.mean), cy),
      2.3,
      color,
    );
    if (!r.covers)
      s.path(
        "coverage-miss" + i,
        `M${a.x(r.mean) - 3},${cy - 3}l6,6m-6,0l6,-6`,
        color,
        1.4,
      );
  });
  s.line("fixed-truth", a.x(0), a.t - 8, a.x(0), a.b, ink, 1.6, "4 4");
  s.text("truth-label", a.x(0), a.t - 13, "True effect = 0", {
    "text-anchor": "middle",
    "font-size": 14,
  });
  [-limit, 0, limit].forEach((v, i) =>
    s.text("coverage-tick" + i, a.x(v), a.b + 17, fmt(v, 1), {
      "text-anchor": "middle",
      "font-size": 12,
    }),
  );
  y = caption(
    s,
    "coverage-count",
    `${intervals.filter((r) => r.covers).length} / ${intervals.length} intervals cover 0 in THIS batch.`,
    a.b + 70,
  );
  y = caption(
    s,
    "coverage-key",
    "Blue lines cross 0. Red × marks miss it.",
    y + 4,
  );
  caption(
    s,
    "coverage-foot",
    "95% describes the long-run procedure, not a probability assigned to this fixed truth.",
    y + 5,
  );
}

export function anovaStory(s, P, d, selected) {
  s.begin(560);
  const r = d.result,
    chosen = d.rows[selected - 1];
  let y = caption(s, "anova-title", "One score has two visible distances.");
  y = caption(
    s,
    "anova-grand",
    `Dashed line: grand mean ${fmt(r.grand, 2)}`,
    y + 5,
  );
  const a = frame(
    s,
    "anova-distances",
    { x: 47, y: y + 28, w: s.w - 76, h: 190 },
    [-0.5, 2.5],
    extent(d.rows.map((r) => r.y)),
    ["Teaching method", "Score"],
  );
  ["A", "B", "C"].forEach((label, i) =>
    s.text("anova-distances-xt" + i, a.x(i), a.b + 17, label, {
      "font-size": 12,
      "text-anchor": "middle",
    }),
  );
  s.line("grand-guide", a.l, a.y(r.grand), a.r, a.y(r.grand), ink, 1.6, "4 4");
  d.rows.forEach((row, i) => {
    const cx = a.x(row.group + ((i % 8) - 3.5) * 0.055),
      cy = a.y(row.y);
    s.mark(
      "anova-row" + i,
      ...P("anova-row" + i, cx, cy),
      palette[row.group],
      `Score ${i + 1}: ${fmt(row.y)}`,
      i === selected - 1,
      String(i + 1),
    );
  });
  r.means.forEach((m, i) =>
    s.line(
      "group-mean" + i,
      a.x(i - 0.3),
      a.y(m),
      a.x(i + 0.3),
      a.y(m),
      palette[i],
      3,
    ),
  );
  const cx = a.x(chosen.group + (((selected - 1) % 8) - 3.5) * 0.055),
    mg = r.means[chosen.group];
  s.line(
    "within-distance",
    cx + 7,
    a.y(chosen.y),
    cx + 7,
    a.y(mg),
    palette[4],
    4,
  );
  s.line(
    "between-distance",
    cx + 15,
    a.y(mg),
    cx + 15,
    a.y(r.grand),
    palette[3],
    4,
  );
  y = caption(
    s,
    "anova-selected",
    `Score ${selected}: ${fmt(chosen.y, 2)} · group mean ${fmt(mg, 2)}`,
    a.b + 65,
  );
  y = caption(
    s,
    "anova-distance-key",
    `Purple: score − group = ${fmt(chosen.y - mg, 2)}`,
    y + 6,
    palette[4],
  );
  y = caption(
    s,
    "anova-between-key",
    `Gold: group − grand = ${fmt(mg - r.grand, 2)}`,
    y + 3,
    palette[3],
  );
  y = caption(
    s,
    "anova-total-key",
    `Together: score − grand = ${fmt(chosen.y - r.grand, 2)}`,
    y + 3,
  );
  // One shared height makes area proportional to the aggregate squared distances.
  y = caption(
    s,
    "anova-square-title",
    "Square the distances; sum over EVERY score:",
    y + 13,
  );
  const width = s.w - 30,
    between = (width * r.between) / r.total;
  s.rect("within-area", 15, y, width, 24, palette[4] + "88", { rx: 0 });
  s.rect("between-area", 15, y, between, 24, palette[3] + "aa", { rx: 0 });
  y = caption(
    s,
    "anova-squares",
    `SS total ${fmt(r.total, 1)} = between ${fmt(r.between, 1)} + within ${fmt(r.within, 1)}`,
    y + 48,
  );
  caption(
    s,
    "anova-cancel",
    "This squared identity is for the whole sample. Within-group cross terms cancel.",
    y + 5,
  );
}

export function componentStory(s, P, d) {
  s.begin(680);
  let y = caption(
    s,
    "components-title",
    "The observed series is three signals added together.",
  );
  y = caption(
    s,
    "components-scales",
    "Same months in every row; each row has its own vertical scale.",
    y + 8,
  );
  ["y", "trend", "seasonal", "noise"].forEach((k, i) => {
    const top = y + 32 + i * 132;
    s.text(
      "component-name" + k,
      47,
      top - 13,
      [
        "Observed = trend + season + remainder",
        "Trend / level",
        "Repeating season",
        "Random remainder",
      ][i],
      { "font-size": 14 },
    );
    const a = frame(
      s,
      "component" + k,
      { x: 47, y: top, w: s.w - 77, h: 72 },
      [1, 48],
      extent(d.rows.map((r) => r[k])),
      i === 3 ? ["Month"] : [],
      true,
    );
    line(
      s,
      P,
      "component-line" + k,
      d.rows.map((r) => [a.x(r.x), a.y(r[k])]),
      palette[i],
      2,
    );
  });
  caption(
    s,
    "components-foot",
    "These are known simulation components, not a decomposition estimated from real data.",
    y + 578,
  );
}

export function degreesStory(s, d) {
  s.begin(430);
  let y=caption(s,'df-title','Degrees of freedom: choices left after fitting averages.');
  y=caption(s,'df-example','Separate example: three numbers with average 10 must add to 30.',y+10);
  const values=[8,15,7], width=(s.w-48)/3;
  values.forEach((v,i)=>{
    const x=16+i*(width+8);
    s.rect('df-value-box'+i,x,y+8,width,67,i<2 ? palette[0]+'18' : palette[2]+'18',{stroke:i<2?palette[0]:palette[2]});
    s.text('df-value'+i,x+width/2,y+40,String(v),{'text-anchor':'middle','font-size':25});
    s.text('df-role'+i,x+width/2,y+63,i<2?'Chosen':'Forced',{'text-anchor':'middle','font-size':14});
  });
  y=caption(s,'df-last','8 + 15 + ? = 30, so the last value must be 7.',y+105);
  y=caption(s,'df-free','Two choices remain free; the fixed average determines the third.',y+8);
  const n=d.rows.length,k=d.result.means.length;
  y=caption(s,'df-live',`Live dataset: ${n} scores in ${k} groups.`,y+24);
  y=caption(s,'df-between',`Between groups: ${k} − 1 = ${d.result.d1} degrees of freedom.`,y+8);
  y=caption(s,'df-within',`Within groups: ${n} − ${k} = ${d.result.d2} degrees of freedom.`,y+8);
  y=caption(s,'df-scaling','Dividing each squared total by its own df gives a mean square.',y+14);
  s.fitHeight(y+20);
}

export function effectSizeStory(s, d) {
  s.begin(350);
  const r=d.result;
  let y=caption(s,'eta-title','What share of total squared spread is between groups?');
  y=caption(s,'eta-total',`Whole bar: total SS = ${fmt(r.total,2)}`,y+14);
  const x=16,width=s.w-32,part=r.total>0 ? width*r.between/r.total : 0;
  s.rect('eta-whole',x,y+8,width,45,palette[1]+'45');
  s.rect('eta-between',x,y+8,part,45,palette[0]+'aa');
  y=caption(s,'eta-between-value',`Blue: between SS = ${fmt(r.between,2)}`,y+82,palette[0]);
  y=caption(s,'eta-within-value',`Red: within SS = ${fmt(r.within,2)}`,y+9,palette[1]);
  y=caption(s,'eta-ratio',`η² = between ÷ total = ${fmt(r.eta,3)} (${fmt(r.eta*100,1)}%)`,y+18);
  y=caption(s,'eta-scope','This describes group separation in these scores. It does not establish a cause.',y+14);
  s.fitHeight(y+20);
}
