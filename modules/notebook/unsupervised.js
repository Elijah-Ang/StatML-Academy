import {
  makeLab,
  fmt,
  palette,
  extent,
  linspace,
  plotLine,
  bars,
} from "./lab.js";
import { pca, hierarchical, mean, sum } from "./science.js";
const points = [
  [-1.9, -1.2],
  [-1.5, -0.7],
  [-0.9, -0.9],
  [-0.3, 0.3],
  [0.2, 0.1],
  [0.6, 0.8],
  [1.2, 0.9],
  [1.8, 1.7],
].map(([x, z], i) => ({ id: String.fromCharCode(65 + i), x, z }));
export function create(host, slug) {
  const principal = slug === "pca",
    initial = {
      angle: 35,
      scale: "no",
      stretch: 1,
      linkage: "average",
      merge: 0,
      selected: "D",
      components: 1,
    };
  const controls = principal
    ? [
        {
          key: "angle",
          label: "Candidate direction (degrees)",
          min: -90,
          max: 90,
          step: 1,
        },
        {
          key: "scale",
          label: "Standardize by feature SD",
          options: [
            ["no", "Keep raw feature units"],
            ["yes", "Use unit-variance inputs"],
          ],
        },
        {
          key: "stretch",
          label: "Change z measurement units",
          min: 0.5,
          max: 4,
          step: 0.1,
        },
        {
          key: "components",
          label: "Retained components",
          min: 1,
          max: 2,
          step: 1,
        },
      ]
    : [
        {
          key: "linkage",
          label: "Linkage rule",
          options: [
            ["single", "Single: closest pair"],
            ["complete", "Complete: farthest pair"],
            ["average", "Average pair distance"],
            ["ward", "Ward: increase in SSE"],
          ],
        },
        { key: "merge", label: "Completed merges", min: 0, max: 7, step: 1 },
        {
          key: "stretch",
          label: "Change z measurement units",
          min: 0.5,
          max: 4,
          step: 0.1,
        },
      ];
  controls.push({
    key: "selected",
    label: "Inspect observation",
    options: points.map((p) => [p.id, p.id]),
  });
  const L = makeLab(host, slug, initial, controls);
  let key = "",
    data;
  function compute() {
    const st = L.state,
      k = st.scale + "|" + st.stretch + "|" + st.linkage;
    if (k === key) return data;
    key = k;
    const rows = points.map((p) => ({ ...p, z: p.z * st.stretch }));
    return (data = {
      rows,
      pca: pca(rows, st.scale === "yes"),
      hierarchy: hierarchical(rows, st.linkage),
    });
  }
  L.surface.onAction = (selected) => L.update({ selected });
  if (principal)
    L.action("best-axis", "Align with fitted PC1", () =>
      L.update({ angle: (compute().pca.angle * 180) / Math.PI }),
    );
  else {
    L.action("merge-back", "Previous merge", () =>
      L.update({ merge: Math.max(0, L.state.merge - 1) }),
    );
    L.action("merge-next", "Merge closest groups", () =>
      L.update({ merge: Math.min(7, L.state.merge + 1) }),
    );
  }
  return L.init((animate = false) => {
    const d = compute(),
      st = L.state,
      scene = L.scene,
      pc = d.pca,
      a = (st.angle * Math.PI) / 180,
      c = Math.cos(a),
      sn = Math.sin(a),
      projections = pc.centered.map((r) => ({
        ...r,
        score: r.x * c + r.z * sn,
        reconstructedX: (r.x * c + r.z * sn) * c,
        reconstructedZ: (r.x * c + r.z * sn) * sn,
      }));
    const projectedVariance =
        sum(projections.map((r) => r.score ** 2)) / (points.length - 1),
      error = sum(
        projections.map(
          (r) => (r.x - r.reconstructedX) ** 2 + (r.z - r.reconstructedZ) ** 2,
        ),
      ),
      chosen = projections.find((r) => r.id === st.selected),
      groups = d.hierarchy.snapshots[st.merge],
      last = d.hierarchy.merges[st.merge - 1],
      next = d.hierarchy.merges[st.merge];
    L.data = { ...d, projectedVariance, error, groups };
    let receipt;
    if (principal) {
      L.metrics([
        ["Candidate variance", fmt(projectedVariance, 3)],
        ["PC1 variance share", fmt(pc.pve * 100, 1) + "%"],
        ["Candidate SSE", fmt(error, 3)],
      ]);
      receipt = [
        [
          "Selected " + chosen.id,
          "centered (" + fmt(chosen.x, 3) + ", " + fmt(chosen.z, 3) + ")",
        ],
        ["Candidate loadings", fmt(c, 3) + ", " + fmt(sn, 3)],
        ["Candidate score", fmt(chosen.score, 3)],
        [
          "Candidate reconstruction",
          "(" +
            fmt(chosen.reconstructedX, 3) +
            ", " +
            fmt(chosen.reconstructedZ, 3) +
            ")",
        ],
        ["Fitted PC1 angle", fmt((pc.angle * 180) / Math.PI, 2) + "°"],
      ];
      if (scene === "scree")
        receipt = [
          ["PC1 eigenvalue", fmt(pc.eigenvalues[0], 4)],
          ["PC2 eigenvalue", fmt(pc.eigenvalues[1], 4)],
          [
            "Retained variance",
            fmt((st.components === 1 ? pc.pve : 1) * 100, 2) + "%",
          ],
          [
            "Meaning",
            "Variance in the selected input scale; not predictive accuracy.",
          ],
        ];
      L.note(
        "Eight fixed observations. Candidate-axis calculations are distinct from fitted PC1. Standardization uses these eight rows; predictive use would fit the transform on training folds only.",
      );
      L.legend(
        scene === "scores"
          ? [["Observations in fitted PC coordinates", palette[0]]]
          : [
              ["Observed", palette[0]],
              ["Candidate axis", palette[3]],
              ["Projection", palette[2]],
            ],
      );
    } else {
      L.metrics([
        ["Groups remaining", groups.length],
        ["Last merge height", last ? fmt(last.height, 3) : "No merge yet"],
        ["Next merge height", next ? fmt(next.height, 3) : "Complete"],
      ]);
      receipt = groups.map((g, i) => [
        "Group " + (i + 1),
        g.members.map((j) => points[j].id).join(", "),
      ]);
      receipt.push(
        [
          "Height units",
          st.linkage === "ward"
            ? "Increase in within-group SSE"
            : "Euclidean linkage distance",
        ],
        ["Tie rule", "First encountered pair in deterministic group order"],
      );
      L.note(
        "Exact agglomeration on the eight displayed observations. The slider selects a snapshot of the same hierarchy. A new linkage or unit scale recomputes the hierarchy.",
      );
      L.legend(
        groups
          .slice(0, 6)
          .map((g, i) => [
            g.members.map((j) => points[j].id).join(""),
            palette[i % 6],
          ]),
      );
    }
    L.receipt(L.table(["Calculation", "Value"], receipt));
    L.draw((s, P) => {
      const { w } = s.begin(310);
      if (principal && scene === "scree") {
        bars(
          s,
          P,
          pc.eigenvalues.map((value, i) => ({
            label: "PC" + (i + 1),
            value,
            color: palette[i],
          })),
        );
      } else if (principal && scene === "loadings") {
        bars(
          s,
          P,
          [
            { label: "x loading", value: c },
            { label: "z loading", value: sn },
          ],
          { domain: 1 },
        );
      } else if (principal && scene === "scores") {
        const domain = extent(pc.scores.flatMap((r) => [r.pc1, r.pc2])),
          axis = s.axes(domain, domain, "PC1 score", "PC2 score");
        pc.scores.forEach((r) => {
          const p = P(r.id, axis.x(r.pc1), axis.y(r.pc2));
          s.mark(
            r.id,
            ...p,
            palette[0],
            r.id + " PC1 " + fmt(r.pc1, 3) + " PC2 " + fmt(r.pc2, 3),
            r.id === st.selected,
            r.id,
          );
          s.text("label" + r.id, p[0] + 8, p[1] - 9, r.id, { "font-size": 15 });
        });
      } else if (!principal && scene === "dendrogram") {
        const h = d.hierarchy.merges.at(-1).height || 1,
          axis = s.axes(
            [0, 7],
            [0, h * 1.15],
            "Observation",
            st.linkage === "ward" ? "Δ SSE" : "Linkage height",
            [0, 1, 2, 3, 4, 5, 6, 7],
          );
        // Leaf order follows the hierarchy, avoiding crossed branches.
        const nodes = new Map(d.hierarchy.merges.map((m) => [m.id, m])),
          order = [];
        function visit(id) {
          const n = nodes.get(id);
          if (n) {
            visit(n.left);
            visit(n.right);
          } else order.push(id);
        }
        visit(d.hierarchy.merges.at(-1).id);
        const coords = new Map(order.map((id, i) => [id, { x: i, y: 0 }]));
        order.forEach((id, i) => {
          s.text("leaf" + id, axis.x(i), axis.b + 24, points[id].id, {
            "text-anchor": "middle",
            "font-size": 15,
          });
        });
        for (const m of d.hierarchy.merges) {
          const l = coords.get(m.left),
            r = coords.get(m.right),
            x = (l.x + r.x) / 2,
            active = d.hierarchy.merges.indexOf(m) < st.merge;
          plotLine(
            s,
            P,
            "merge" + m.id,
            [
              [axis.x(l.x), axis.y(l.y)],
              [axis.x(l.x), axis.y(m.height)],
              [axis.x(r.x), axis.y(m.height)],
              [axis.x(r.x), axis.y(r.y)],
            ],
            active ? palette[2] : "#a7aea1",
            active ? 2.8 : 1.5,
          );
          coords.set(m.id, { x, y: m.height });
        }
        const cut =
          last && next ? (last.height + next.height) / 2 : last ? h * 1.08 : 0;
        s.line(
          "cut",
          axis.l,
          axis.y(cut),
          axis.r,
          axis.y(cut),
          palette[1],
          1.6,
          "5 4",
        );
        // Hide the numerical leaf ticks; leaves carry observation IDs instead.
        for (let i = 0; i < 8; i++)
          s.nodes.get("xtick-" + i)?.setAttribute("display", "none");
      } else {
        const rows = principal ? pc.centered : d.rows,
          domain = extent(
            rows.flatMap((r) => [r.x, r.z]),
            0.25,
          ),
          axis = s.axes(
            domain,
            domain,
            principal ? "Centered x" : "Input x",
            principal ? "Centered z" : "Input z",
          );
        if (principal) {
          const reach = Math.max(...domain.map(Math.abs)),
            ends = [
              [-reach * c, -reach * sn],
              [reach * c, reach * sn],
            ];
          plotLine(
            s,
            P,
            "axis",
            ends.map(([x, z]) => [axis.x(x), axis.y(z)]),
            palette[3],
            2,
          );
          if (scene === "reconstruction" && st.components === 2) {
          } else
            projections.forEach((r) => {
              const p = P(
                "projection" + r.id,
                axis.x(r.reconstructedX),
                axis.y(r.reconstructedZ),
              );
              s.line(
                "project-line" + r.id,
                axis.x(r.x),
                axis.y(r.z),
                p[0],
                p[1],
                palette[2] + "70",
                1,
                "3 4",
              );
              s.circle("projected" + r.id, ...p, 3, palette[2]);
            });
        } else {
          groups.forEach((g, i) => {
            const center = {
              x: mean(g.members.map((j) => d.rows[j].x)),
              z: mean(g.members.map((j) => d.rows[j].z)),
            };
            g.members.forEach((j) =>
              s.line(
                "member" + j,
                axis.x(center.x),
                axis.y(center.z),
                axis.x(d.rows[j].x),
                axis.y(d.rows[j].z),
                palette[i % 6] + "75",
                1.6,
              ),
            );
          });
        }
        rows.forEach((r, j) => {
          const i = principal
              ? 0
              : groups.findIndex((g) => g.members.includes(j)),
            p = P(r.id, axis.x(r.x), axis.y(r.z));
          s.mark(
            r.id,
            ...p,
            palette[i % 6],
            r.id + " x " + fmt(r.x, 3) + " z " + fmt(r.z, 3),
            r.id === st.selected,
            r.id,
          );
          s.text("label" + r.id, p[0] + 8, p[1] - 9, r.id, { "font-size": 15 });
        });
      }
      s.end(receipt.map((r) => r.join(": ")).join(". "));
    }, animate);
  });
}
