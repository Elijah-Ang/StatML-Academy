/* Twelve illustrated lessons. Numeric demonstrations are deliberately small,
   deterministic examples; they never pretend to train an image classifier. */
(() => {
  const { ink: I } = StudySketch;
  const A = DeepSketchArt;
  const scene = (title, caption, draw, steps = 4, tools = []) => ({
    title,
    caption,
    draw,
    steps,
    tools,
  });
  const option = (key, label) => ({ key, label });
  const fixed = (v, n = 2) => Number(v).toFixed(n);
  const sigmoid = (x) => 1 / (1 + Math.exp(-x));
  const trainLoss = (e) => 0.95 * Math.exp(-e / 5) + 0.07;
  const valLoss = (e) =>
    0.88 * Math.exp(-e / 5) + 0.17 + Math.max(0, e - 10) ** 2 * 0.0035;
  const bestEpoch = Array.from({ length: 24 }, (_, i) => i + 1).reduce(
    (a, b) => (valLoss(a) < valLoss(b) ? a : b),
  );
  const cases = [
    { animal: "cat", place: "sofa", score: 0.92, y: 1 },
    { animal: "cat", place: "window", score: 0.84, y: 1 },
    { animal: "dog", place: "sofa", score: 0.73, y: 0 },
    { animal: "cat", place: "park", score: 0.62, y: 1 },
    { animal: "dog", place: "clinic", score: 0.51, y: 0 },
    { animal: "cat", place: "clinic", score: 0.43, y: 1 },
    { animal: "dog", place: "park", score: 0.25, y: 0 },
    { animal: "rabbit", place: "window", score: 0.12, y: 0 },
  ];
  const metrics = (t) => {
    const m = { tp: 0, fp: 0, fn: 0, tn: 0 };
    cases.forEach(
      (c) => m[c.score >= t ? (c.y ? "tp" : "fp") : c.y ? "fn" : "tn"]++,
    );
    return m;
  };
  const pixels = Array.from({ length: 16 }, (_, i) => [
    40 + (i % 4) * 49,
    62 + Math.floor(i / 4) * 44,
    95 + (i % 3) * 39,
  ]);
  const imageGrid = [
    [0, 0, 1, 1, 1],
    [0, 0, 1, 1, 1],
    [0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ];
  const filters = {
    vertical: [
      [-1, 0, 1],
      [-1, 0, 1],
      [-1, 0, 1],
    ],
    horizontal: [
      [-1, -1, -1],
      [0, 0, 0],
      [1, 1, 1],
    ],
  };
  function convolve(filter, row, col) {
    return filter.reduce(
      (sum, line, r) =>
        sum + line.reduce((a, v, c) => a + v * imageGrid[row + r][col + c], 0),
      0,
    );
  }
  const tokens = ["The", "cat", "is", "sleeping"],
    queries = [
      [0.2, 0.5],
      [1, 0.1],
      [0.3, 0.2],
      [0.9, 0.7],
    ],
    keys = [
      [0.1, 0.3],
      [1, 0.8],
      [0.2, 0.1],
      [0.8, 0.6],
    ],
    values = [
      [0.1, 0.2],
      [0.9, 0.4],
      [0.2, 0.1],
      [0.7, 0.8],
    ];
  function attention(index) {
    const scores = keys.map(
      (k) =>
        (queries[index][0] * k[0] + queries[index][1] * k[1]) / Math.sqrt(2),
    );
    const ex = scores.map(Math.exp),
      total = ex.reduce((a, b) => a + b);
    const weights = ex.map((x) => x / total);
    return {
      scores,
      weights,
      context: [0, 1].map((d) =>
        weights.reduce((a, w, j) => a + w * values[j][d], 0),
      ),
    };
  }
  function grid(p, data, x, y, size, color = I.blue, active = () => false) {
    data.forEach((row, r) =>
      row.forEach((v, c) => {
        p.box(
          x + c * size,
          y + r * size,
          size - 3,
          size - 3,
          active(r, c) ? I.red : color,
          active(r, c),
        );
        p.text(
          String(v),
          x + c * size + (size - 3) / 2,
          y + r * size + size * 0.68,
          20,
          active(r, c) ? I.red : color,
          "middle",
        );
      }),
    );
  }
  function phase(p, labels, k, y = 30) {
    const gap = 590 / labels.length;
    labels.forEach((l, i) => {
      const x = 25 + i * gap;
      p.text(l, x, y, 22, i === k ? I.red : I.pencil);
      p.line(
        x,
        y + 7,
        x + gap - 20,
        y + 6,
        i === k ? I.red : "#c5baa4",
        i === k ? 3 : 1,
      );
    });
  }
  function applyUpdate(s) {
    const w = s.weight || 0,
      gradient = sigmoid(w) - 1,
      eta = s.learningRate ?? 0.5;
    s.lastUpdate = { w, gradient, eta, next: w - eta * gradient };
    s.weight = s.lastUpdate.next;
    s.learnStep = (s.learnStep || 0) + 1;
  }

  const scenes = [
    scene(
      "One picture; three different questions",
      (s) =>
        s.taskView === "detect"
          ? "Detection asks where the animal is. The drawn box is an annotation example, not a detector result."
          : s.taskView === "segment"
            ? "Segmentation assigns a class to pixels. The shaded silhouette illustrates an animal mask."
            : "Classification matches the lesson: cat 0.89, dog 0.08, rabbit 0.03. These are illustrative model scores.",
      (p, s, k) => {
        const mode = s.taskView || "classify";
        A.picture(p, 25, 55, 292, 200, {
          animal: "cat",
          place: "sofa",
          focus: mode === "detect",
        });
        A.tag(p, "input: one animal photograph", 30, 290);
        p.arrow(327, 154, 377, 154);
        if (mode === "classify") {
          p.text("output: class scores", 386, 55, 24);
          ["cat", "dog", "rabbit"].forEach((label, i) => {
            const value = [0.89, 0.08, 0.03][i],
              y = 93 + i * 65;
            p.text(label, 387, y, 23, i === 0 ? I.red : I.blue);
            p.box(
              388,
              y + 10,
              Math.max(2, value * 188),
              20,
              i === 0 ? I.red : I.blue,
            );
            p.text(fixed(value), 591, y + 27, 22, I.pencil, "end");
          });
          p.path(
            "M379 81 Q407 62 435 79 Q449 104 419 106 Q376 109 379 81",
            I.red,
            1.5,
          );
        } else if (mode === "detect") {
          p.box(387, 90, 221, 131, I.red, false);
          p.text("cat", 402, 122, 29, I.red);
          p.text("box = [x, y, w, h]", 402, 162, 22);
          p.text("location + label", 402, 195, 22, I.pencil);
        } else {
          p.box(386, 70, 222, 174, I.pencil, false);
          p.add('<g transform="translate(390 88) scale(.86)">');
          A.wash(
            p,
            "M55 99 Q40 120 62 143 L124 143 Q144 113 117 99 L121 51 L103 62 Q86 56 76 64 L56 53 Z",
            I.green,
            0.35,
          );
          p.path(
            "M55 99 Q40 120 62 143 L124 143 Q144 113 117 99 L121 51 L103 62 Q86 56 76 64 L56 53 Z",
            I.green,
            2,
          );
          p.add("</g>");
          p.text("animal pixels", 412, 275, 24, I.green);
        }
        phase(p, ["define input", "choose task", "measure success"], k, 340);
        p.wrap(
          [
            "What will arrive? A photograph with an animal in a real setting.",
            "What must leave? A label, a location, or a pixel mask changes the task.",
            "A success measure must match the output and the cost of mistakes.",
          ][k],
          30,
          377,
          56,
          I.blue,
          22,
        );
      },
      3,
      [
        option("taskView:classify", "Classify"),
        option("taskView:detect", "Locate"),
        option("taskView:segment", "Segment"),
      ],
    ),

    scene(
      "The animal stays; the scenery changes",
      (s, k) => {
        const i = s.datasetCase ?? k,
          animal = i < 3 ? "cat" : "dog",
          place = s.biased
            ? i < 3
              ? "sofa"
              : "park"
            : ["sofa", "window", "park", "park", "sofa", "clinic"][i];
        return `Selected: ${animal} ${place === "window" ? "by a window" : place === "sofa" ? "on a sofa" : place === "park" ? "in a park" : "at a clinic"}. ${s.biased ? "Background gives away the label in this narrow collection." : "The same class appears in different settings; the background cannot be the only rule."}`;
      },
      (p, s, k) => {
        const chosen = s.datasetCase ?? k;
        for (let i = 0; i < 6; i++) {
          const x = 26 + (i % 3) * 204,
            y = 30 + Math.floor(i / 3) * 170,
            animal = i < 3 ? "cat" : "dog",
            place = s.biased
              ? i < 3
                ? "sofa"
                : "park"
              : ["sofa", "window", "park", "park", "sofa", "clinic"][i];
          p.action("dataset:" + i, `Inspect ${animal} in ${place}`, () => {
            A.picture(p, x, y, 180, 122, { animal, place, flip: i % 2 === 1 });
            p.text(
              animal +
                " / " +
                {
                  sofa: "sofa",
                  window: "window",
                  park: "grass",
                  clinic: "clinic",
                }[place],
              x + 7,
              y + 148,
              22,
              chosen === i ? I.red : I.blue,
            );
            if (chosen === i)
              p.path(
                `M${x - 5} ${y - 3} L${x + 187} ${y - 2} L${x + 186} ${y + 155} L${x - 6} ${y + 156} Z`,
                I.red,
                2,
              );
          });
        }
        p.note(
          s.biased
            ? "Shortcut: sofa → cat; grass → dog"
            : "Counterexamples break the background shortcut.",
          28,
          417,
        );
      },
      6,
    ),

    scene(
      "Give each pile one job",
      (s) =>
        s.leak === "yes"
          ? "Leak revealed: frames from the same video appear in training and test. Similarity can inflate the test score."
          : "Split related sources together. Fit preprocessing on training data; use validation for choices; reserve test for the final estimate.",
      (p, s, k) => {
        const colors = [I.blue, I.green, I.red],
          labels = ["train 70%", "validate 15%", "test 15%"];
        labels.forEach((label, j) => {
          const x = 22 + j * 208;
          p.box(x, 55, 190, 210, colors[j], false);
          p.path(
            `M${x} 55 L${x + 9} 36 L${x + 97} 36 L${x + 110} 55`,
            colors[j],
            1.7,
          );
          p.text(label, x + 14, 83, 25, colors[j]);
          A.picture(p, x + 18, 101, 152, 102, {
            animal: j === 1 ? "dog" : "cat",
            place:
              j === 0
                ? "sofa"
                : j === 1
                  ? "park"
                  : s.leak === "yes"
                    ? "sofa"
                    : "window",
          });
          p.text(
            j === 0
              ? "video A / frames 1–8"
              : j === 1
                ? "source B"
                : s.leak === "yes"
                  ? "video A / frame 9"
                  : "source C",
            x + 12,
            237,
            20,
            colors[j],
          );
          if (k === j) p.line(x + 10, 276, x + 182, 275, colors[j], 3);
        });
        A.lock(p, 557, 34, s.leak === "yes", I.red);
        if (s.leak === "yes") {
          p.path("M118 246 Q320 324 533 246", I.red, 2.5);
          p.text("same video leaks across the boundary", 113, 327, 23, I.red);
        } else {
          p.text(
            [
              "weights learn here",
              "settings chosen here",
              "sealed until the end",
            ][k],
            70 + k * 148,
            322,
            24,
            colors[k],
          );
        }
        p.wrap(
          [
            "Learn weights and preprocessing statistics from training examples.",
            "Compare settings and checkpoints on validation examples.",
            "Evaluate the finished pipeline once on the untouched final test.",
          ][k],
          28,
          369,
          54,
          colors[k],
          22,
        );
      },
      3,
      [option("leak:no", "Clean split"), option("leak:yes", "Show a leak")],
    ),

    scene(
      "Translate structure into numbers",
      "Inspect a pixel, token, or time window. Values are small teaching examples; positions and units keep their meaning.",
      (p, s, k) => {
        const mode = s.tensorMode || "image";
        if (mode === "image") {
          A.picture(p, 25, 27, 196, 127, { animal: "cat", place: "window" });
          p.text("photograph", 31, 182, 22);
          p.arrow(228, 90, 280, 90);
          const cell = s.pixel ?? k * 5;
          const row = Math.floor(cell / 4),
            col = cell % 4;
          pixels.forEach((rgb, i) => {
            const x = 301 + (i % 4) * 44,
              y = 24 + Math.floor(i / 4) * 39;
            p.action(
              "pixel:" + i,
              `Inspect row ${Math.floor(i / 4) + 1}, column ${(i % 4) + 1}`,
              () => {
                A.wash(
                  p,
                  `M${x} ${y}h39v34h-39Z`,
                  `rgb(${rgb.join(",")})`,
                  0.5,
                );
                p.box(x, y, 39, 34, cell === i ? I.red : I.pencil, false);
              },
            );
          });
          p.text("a 4 × 4 crop", 306, 202, 23);
          p.text(`row ${row + 1}, column ${col + 1}`, 32, 237, 23, I.red);
          p.arrow(235, 232, 290, 262, I.red);
          ["R", "G", "B"].forEach((c, i) => {
            const x = 300 + i * 101,
              color = [I.red, I.green, I.blue][i];
            p.box(x, 236, 86, 77, color);
            p.text(c, x + 10, 260, 23, color);
            p.text(String(pixels[cell][i]), x + 11, 297, 27, color);
            p.text(fixed(pixels[cell][i] / 255), x + 8, 355, 25, color);
          });
          p.text("raw channel values", 32, 292, 23);
          p.text("divide by 255 →", 109, 350, 23);
          p.note("Shape: height × width × channels (+ batch)", 28, 414);
        } else if (mode === "text") {
          const words = ["a", "cat", "sleeps"],
            ids = [12, 47, 93],
            emb = [
              [0.1, 0.2, 0.3],
              [0.8, 0.1, -0.2],
              [0.3, 0.7, 0.4],
            ],
            active = s.token ?? k % 3;
          p.text("“a cat sleeps”", 29, 43, 29);
          p.text("fixed vocabulary → learned table", 269, 43, 23, I.pencil);
          words.forEach((word, i) => {
            const y = 86 + i * 95,
              c = i === active ? I.red : I.blue;
            p.action("token:" + i, "Follow token " + word, () => {
              p.box(29, y, 115, 55, c, i === active);
              p.text(word, 42, y + 35, 27, c);
            });
            p.arrow(154, y + 27, 221, y + 27, c);
            p.text(String(ids[i]), 241, y + 37, 28, c);
            p.arrow(284, y + 27, 355, y + 27, c);
            emb[i].forEach((v, j) => {
              p.box(371 + j * 72, y, 64, 55, c, i === active);
              p.text(fixed(v, 1), 384 + j * 72, y + 36, 24, c);
            });
          });
          p.text("token", 39, 391, 22, I.pencil);
          p.text("ID", 240, 391, 22, I.pencil);
          p.text("embedding vector", 380, 391, 22, I.pencil);
          p.note("IDs are lookups, not quantities or importance.", 31, 429);
        } else {
          const win = s.audioWindow ?? k,
            signal = (n) =>
              Math.sin(n * 0.46) * (0.55 + 0.25 * Math.sin(n * 0.04)) +
              0.18 * Math.sin(n * 1.4);
          p.text("amplitude samples in time", 30, 34, 25);
          let d = "";
          for (let n = 0; n < 120; n++)
            d +=
              (n ? " L" : "M") + (35 + n * 4.7) + " " + (112 - signal(n) * 48);
          p.path(d, I.blue, 1.7);
          p.line(30, 113, 604, 113, I.pencil, 0.8);
          p.box(35 + win * 24 * 4.7, 53, 32 * 4.7, 119, I.red, false);
          p.text(
            "32 samples → one column",
            35 + Math.min(win, 2) * 112.8,
            196,
            21,
            I.red,
          );
          const energies = [];
          for (let col = 0; col < 12; col++) {
            const magnitudes = [];
            for (let bin = 1; bin <= 6; bin++) {
              let re = 0,
                im = 0;
              for (let n = 0; n < 32; n++) {
                const v = signal(col * 8 + n),
                  angle = (2 * Math.PI * bin * n) / 32;
                re += v * Math.cos(angle);
                im -= v * Math.sin(angle);
              }
              magnitudes.push((Math.hypot(re, im) / 16) ** 2);
            }
            energies.push(magnitudes);
          }
          for (let col = 0; col < 12; col++)
            for (let bin = 0; bin < 6; bin++) {
              const x = 122 + col * 36,
                y = 225 + (5 - bin) * 22;
              A.wash(
                p,
                `M${x} ${y}h32v19h-32Z`,
                I.blue,
                Math.min(0.75, energies[col][bin]),
              );
              if (col === win * 3) p.box(x, y, 32, 19, I.red, false);
            }
          p.text("high", 45, 247, 20, I.pencil);
          p.text("low", 55, 352, 20, I.pencil);
          p.text("frequency", 25, 297, 20, I.pencil);
          p.text("time →", 508, 383, 22);
          p.note("Darker cells = more energy at that frequency.", 30, 425);
        }
      },
      4,
    ),

    scene(
      "Mix clues, then apply the activation",
      "The picture supplies illustrative features [0.85, 0.65, 0.25]. Move the lesson weights; every product and the ReLU output recomputes.",
      (p, s, k) => {
        const features = [0.85, 0.65, 0.25],
          weights = [
            s.earWeight ?? 1.2,
            s.furWeight ?? 0.6,
            s.backgroundWeight ?? 0.2,
          ],
          b = s.neuronBias ?? -0.2,
          products = features.map((v, i) => v * weights[i]),
          z = products.reduce((a, b) => a + b, 0) + b;
        ["ear shape", "fur texture", "background"].forEach((label, i) => {
          const y = 40 + i * 97,
            c = i === k ? I.red : I.blue;
          if (i === 0) p.path("M32 80 L36 30 L60 50 L82 30 L85 80", c, 2);
          else if (i === 1) {
            for (let j = 0; j < 7; j++)
              p.path(`M${31 + j * 8} 146 l5 -16 l4 8`, c, 1.4);
          } else {
            p.path(
              "M31 242 L31 207 Q31 197 43 197 L76 197 Q87 197 87 207 L87 242 Z M30 230 H87",
              c,
              1.6,
            );
          }
          p.text(label, 112, y + 6, 22, c);
          p.text(`${features[i]} × ${fixed(weights[i])}`, 112, y + 39, 24, c);
          p.text("= " + fixed(products[i]), 281, y + 39, 24, c);
          p.arrow(361, y + 32, 419, 181, c);
        });
        p.circle(455, 181, 31, I.blue, "Σ", k === 3);
        p.text("bias " + fixed(b), 389, 261, 23, I.pencil);
        p.arrow(455, 240, 455, 217, I.pencil);
        p.arrow(493, 182, 558, 182, I.red);
        p.text("ReLU", 528, 145, 26, I.red);
        p.text(fixed(Math.max(0, z)), 540, 219, 33, I.red);
        p.text("max(0, z)", 515, 260, 21, I.pencil);
        p.text(
          `z = ${products.map((v) => fixed(v)).join(" + ")} + (${fixed(b)})`,
          29,
          345,
          23,
        );
        p.note(
          `raw score ${fixed(z)} → outgoing signal ${fixed(Math.max(0, z))}`,
          29,
          408,
        );
      },
      4,
    ),

    scene(
      "Look through the learned tracing sheets",
      "Keep the same cat in view. These feature sketches are a teaching analogy, not labels assigned to real neurons.",
      (p, s, k) => {
        const names = ["pixels", "edges", "textures", "parts", "task features"];
        phase(p, names, k, 31);
        for (let j = 2; j >= 0; j--)
          p.box(
            34 + j * 9,
            77 - j * 7,
            276,
            238,
            j === 0 ? I.blue : I.pencil,
            false,
          );
        if (k === 0) {
          A.picture(p, 49, 91, 243, 160, { animal: "cat", place: "window" });
          for (let row = 0; row < 4; row++)
            for (let col = 0; col < 4; col++)
              p.box(106 + col * 26, 137 + row * 26, 25, 25, I.red, false);
        } else if (k === 1) {
          p.path(
            "M73 258 L74 106 L265 106 L265 258 M162 107 V239 M75 171 H265",
            I.pencil,
            0.8,
          );
          A.cat(p, 167, 190, 0.9);
          p.path(
            "M136 165 L133 138 L151 151 M179 151 L195 138 L193 165",
            I.red,
            3,
          );
        } else if (k === 2) {
          A.cat(p, 169, 194, 1);
          for (let j = 0; j < 20; j++) {
            const x = 74 + (j % 5) * 37,
              y = 115 + Math.floor(j / 5) * 36;
            p.path(`M${x} ${y} l6 -9 l5 6 l6 -9`, I.gold, 1.8);
          }
        } else if (k === 3) {
          A.cat(p, 161, 189, 1.3);
          p.box(119, 144, 34, 31, I.red, false);
          p.box(174, 144, 34, 31, I.red, false);
          p.box(145, 177, 44, 25, I.green, false);
        } else {
          A.picture(p, 49, 91, 243, 160, {
            animal: "cat",
            place: "window",
            focus: true,
          });
          p.text("cat evidence", 130, 286, 27, I.red);
        }
        p.text("same example, new description", 40, 352, 22, I.pencil);
        const explanation = [
          [
            "Tiny measurements",
            "Nearby pixels preserve the local light and colour changes.",
          ],
          [
            "Local contrast",
            "Small filters respond to edges at many positions.",
          ],
          [
            "Repeated patterns",
            "Earlier edges combine into textures and curves.",
          ],
          [
            "Larger structures",
            "Combinations can respond to ears, eyes, and snouts.",
          ],
          [
            "Useful for the task",
            "Later features gather evidence to distinguish the classes.",
          ],
        ][k];
        p.text(explanation[0], 344, 109, 27, I.red);
        p.wrap(explanation[1], 344, 155, 24, I.blue, 22);
        p.arrow(304, 224, 352, 251, I.red);
        p.wrap(
          "Each layer composes features from the layer before it.",
          345,
          285,
          24,
          I.pencil,
          21,
        );
        p.note("Training discovers useful filters from examples.", 28, 418);
      },
      5,
    ),

    scene(
      "Watch one parameter actually learn",
      (s) =>
        `Scalar teaching neuron: x=1, y=1, p=sigmoid(w), L=−log(p). ${s.learnStep || 0} updates applied. Tracing computes quantities; “Run one learning step” changes w.`,
      (p, s, k) => {
        const w = s.weight || 0,
          prob = sigmoid(w),
          loss = -Math.log(prob),
          grad = prob - 1,
          eta = s.learningRate ?? 0.5;
        phase(p, ["forward", "loss", "backprop", "optimizer"], k, 27);
        A.picture(p, 26, 69, 161, 107, { animal: "cat", place: "sofa" });
        p.text("known class: cat", 32, 207, 22, I.green);
        p.text("toy target y = 1", 32, 237, 22, I.green);
        p.arrow(199, 120, 249, 120, k === 0 ? I.red : I.blue);
        p.circle(281, 120, 29, I.blue, "w");
        p.arrow(315, 120, 371, 120);
        A.metric(p, "current p", fixed(prob, 3), 394, 91, I.blue);
        A.metric(p, "loss −log(p)", fixed(loss, 3), 394, 185, I.red);
        p.path("M548 251 Q308 298 81 257", I.red, 2.3);
        p.text(
          "gradients flow backward; weights are still unchanged",
          29,
          299,
          21,
          I.red,
        );
        p.text(
          `∂L/∂w = (p − y)x = ${fixed(grad, 3)}`,
          29,
          346,
          24,
          k === 2 ? I.red : I.blue,
        );
        p.text(
          `w′ = ${fixed(w, 3)} − ${fixed(eta, 2)} × (${fixed(grad, 3)})`,
          29,
          382,
          23,
          k === 3 ? I.red : I.blue,
        );
        p.note(
          `next weight = ${fixed(w - eta * grad, 3)}   (current w = ${fixed(w, 3)})`,
          29,
          423,
        );
      },
      4,
      [option("training:reset", "Reset example")],
    ),

    scene(
      "Compare practice with the unseen exam",
      "Illustrative loss curves. Select an epoch to compare training and validation at the same checkpoint; the best checkpoint uses validation loss.",
      (p, s, k) => {
        const epoch = Math.max(1, Math.min(24, s.epoch || 12)),
          x = (e) => 55 + (e - 1) * 23,
          y = (v) => 257 - v * 185;
        p.text("loss", 25, 26, 23, I.pencil);
        p.line(55, 45, 55, 260);
        p.line(55, 260, 596, 260);
        [0, 0.5, 1].forEach((v) => {
          p.text(String(v), 44, y(v) + 6, 18, I.pencil, "end");
          p.line(55, y(v), 590, y(v), "#c5baa4", 0.6);
        });
        let tr = "",
          va = "";
        for (let e = 1; e <= 24; e++) {
          tr += (e === 1 ? "M" : " L") + x(e) + " " + y(trainLoss(e));
          va += (e === 1 ? "M" : " L") + x(e) + " " + y(valLoss(e));
        }
        p.path(tr, I.blue, 2.5);
        p.path(va, I.red, 2.5);
        p.text("training", 493, 248, 22, I.blue);
        p.text("validation", 481, 83, 22, I.red);
        p.line(x(epoch), 40, x(epoch), 267, I.purple, 1.6);
        p.circle(x(epoch), y(trainLoss(epoch)), 5, I.blue, "", true);
        p.circle(x(epoch), y(valLoss(epoch)), 5, I.red, "", true);
        p.circle(x(bestEpoch), y(valLoss(bestEpoch)), 12, I.green);
        p.text(
          "keep " + bestEpoch,
          x(bestEpoch) - 35,
          y(valLoss(bestEpoch)) - 24,
          22,
          I.green,
        );
        [1, 6, 12, 18, 24].forEach((e) =>
          p.action("epoch:" + e, "Inspect epoch " + e, () => {
            p.text(String(e), x(e), 286, 20, I.pencil, "middle");
          }),
        );
        p.text(
          `epoch ${epoch}: train ${fixed(trainLoss(epoch))} / validation ${fixed(valLoss(epoch))}`,
          30,
          322,
          23,
        );
        if ((s.regularizer || "augment") === "augment") {
          for (let i = 0; i < 3; i++)
            A.picture(p, 34 + i * 100, 343, 90, 60, {
              animal: "cat",
              place: i === 1 ? "window" : "sofa",
              flip: i === 1,
            });
          p.box(31 + (k % 3) * 100, 340, 96, 66, I.red, false);
          p.wrap(
            "More varied examples; same class.",
            353,
            363,
            23,
            I.green,
            22,
          );
        } else if (s.regularizer === "dropout") {
          for (let i = 0; i < 8; i++)
            p.circle(
              46 + i * 38,
              376,
              12,
              (i + k) % 4 === 0 ? I.pencil : I.green,
              (i + k) % 4 === 0 ? "×" : "",
              true,
            );
          p.wrap(
            "Different training masks. Use all units in evaluation.",
            353,
            349,
            25,
            I.green,
            21,
          );
        } else {
          A.lock(p, 59, 352, false, I.green);
          p.text("saved epoch " + bestEpoch, 111, 380, 26, I.green);
          p.text(
            ["compare", "select", "save", "reuse"][k],
            111,
            412,
            21,
            I.pencil,
          );
          p.wrap(
            "Keep the lowest validation loss, not the final epoch.",
            353,
            349,
            24,
            I.green,
            21,
          );
        }
      },
      4,
      [
        option("regularizer:augment", "Variation"),
        option("regularizer:dropout", "Dropout"),
        option("regularizer:stop", "Early stop"),
      ],
    ),

    scene(
      "See what each architecture actually does",
      "Use CNN / RNN / Transformer in the lesson. Filter values, vectors, and attention scores below are explicit small teaching examples.",
      (p, s, k) => {
        const arch = s.architecture || "cnn";
        if (arch === "cnn") {
          const f = filters[s.filter || "vertical"],
            r = Math.floor(k / 3),
            c = k % 3,
            map = Array.from({ length: 3 }, (_, row) =>
              Array.from({ length: 3 }, (_, col) => convolve(f, row, col)),
            );
          p.text("image patch", 27, 37, 25);
          p.text("same filter", 248, 37, 25, I.red);
          p.text("one feature map", 443, 37, 25, I.green);
          grid(
            p,
            imageGrid,
            27,
            67,
            34,
            I.blue,
            (row, col) => row >= r && row < r + 3 && col >= c && col < c + 3,
          );
          grid(p, f, 243, 98, 42, I.red);
          grid(
            p,
            map,
            450,
            98,
            46,
            I.green,
            (row, col) => row === r && col === c,
          );
          p.arrow(207, 160, 236, 160, I.red);
          p.arrow(377, 160, 439, 160, I.green);
          p.text("5 × 5 input", 45, 279, 22, I.pencil);
          p.text("3 × 3 filter", 249, 279, 22, I.pencil);
          p.text("3 × 3 output", 455, 279, 22, I.pencil);
          p.text(
            `position (${r + 1}, ${c + 1}): multiply 9 pairs, then add`,
            27,
            327,
            24,
          );
          p.text("Σ(patch × filter) = " + map[r][c], 27, 365, 30, I.red);
          p.note("Another filter produces another map of matches.", 27, 422);
        } else if (arch === "rnn") {
          const step = k % 3,
            words = ["the", "cat", "sleeps"],
            memory = [
              [0.2, 0.1],
              [0.5, 0.3],
              [0.6, 0.7],
            ];
          words.forEach((word, i) => {
            const x = 67 + i * 191;
            p.box(x, 48, 127, 49, i === step ? I.red : I.blue, i === step);
            p.text(word, x + 15, 80, 27);
            p.arrow(x + 60, 107, x + 60, 157, I.blue);
            p.box(x, 171, 128, 99, i === step ? I.red : I.blue, i === step);
            p.text("hidden state", x + 9, 201, 22);
            p.text("[" + memory[i].join(", ") + "]", x + 13, 241, 23);
            if (i < 2) p.arrow(x + 137, 224, x + 179, 224, I.green);
          });
          p.text("h₀ = [0, 0]", 26, 306, 22, I.pencil);
          p.text(
            "the same learned weights are reused at each time",
            27,
            351,
            23,
            I.green,
          );
          p.note("Each new token updates the carried context.", 27, 422);
        } else {
          const q = k % 4,
            a = attention(q);
          p.text(
            `query from “${tokens[q]}” = [${queries[q].join(", ")}]`,
            27,
            35,
            26,
            I.red,
          );
          ["token / key", "match ÷ √2", "attention", "value"].forEach((l, i) =>
            p.text(l, [27, 242, 385, 523][i], 76, 20, I.pencil),
          );
          tokens.forEach((word, j) => {
            const y = 111 + j * 60;
            p.text(word, 27, y, 23, j === q ? I.red : I.blue);
            p.text("[" + keys[j].join(", ") + "]", 111, y, 20, I.pencil);
            p.text(fixed(a.scores[j]), 264, y, 23);
            p.box(385, y - 18, a.weights[j] * 300, 22, I.green);
            p.text(fixed(a.weights[j]), 381, y + 27, 19, I.green);
            p.text("[" + values[j].join(", ") + "]", 520, y, 20, I.pencil);
          });
          p.text(
            "softmax makes the attention weights sum to 1",
            27,
            366,
            23,
            I.green,
          );
          p.note(
            "weighted values → context [" +
              a.context.map((v) => fixed(v)).join(", ") +
              "]",
            27,
            422,
          );
        }
      },
      9,
      [
        option("filter:vertical", "Vertical filter"),
        option("filter:horizontal", "Horizontal filter"),
      ],
    ),

    scene(
      "Keep useful features; replace the final head",
      "Start with a frozen backbone and train a new animal-class head. Fine-tuning can update selected backbone layers at a smaller learning rate.",
      (p, s, k) => {
        const tune = s.transfer === "tune";
        p.text("pretrained backbone", 29, 34, 25, I.blue);
        p.text("new output head", 436, 34, 25, I.red);
        ["edges", "textures", "shapes"].forEach((name, i) => {
          const x = 29 + i * 128,
            c = tune && i === 2 ? I.red : I.blue;
          p.box(x, 102, 109, 130, c, false);
          p.text(name, x + 11, 134, 24, c);
          if (i === 0) p.path(`M${x + 21} 206 l15 -45 l27 30 l22 -32`, c, 2);
          else if (i === 1)
            for (let j = 0; j < 5; j++)
              p.path(`M${x + 12 + j * 17} 208 l9 -43`, c, 2);
          else A.cat(p, x + 52, 176, 0.46);
          A.lock(p, x + 40, 55, tune && i === 2, c);
          if (i < 2) p.arrow(x + 114, 166, x + 123, 166);
        });
        p.arrow(400, 166, 437, 166);
        ["cat", "dog", "rabbit"].forEach((l, i) => {
          p.circle(479, 100 + i * 64, 14, I.red, "", k === i);
          p.text(l, 508, 108 + i * 64, 26, I.red);
        });
        p.path(
          tune ? "M556 266 Q448 321 347 256" : "M556 266 Q491 296 463 256",
          I.red,
          2.5,
        );
        p.text(
          tune
            ? "small updates: last block + new head"
            : "updates: new head only",
          132,
          317,
          25,
          I.red,
        );
        p.wrap(
          tune
            ? "Earlier blocks stay frozen; validation checks whether gentle fine-tuning helps."
            : "Reuse the earlier features. Learning a new head is cheaper than relearning everything.",
          29,
          366,
          54,
          I.blue,
          22,
        );
      },
      3,
      [
        option("transfer:freeze", "Train new head"),
        option("transfer:tune", "Fine-tune last block"),
      ],
    ),

    scene(
      "Follow the examples into the confusion matrix",
      "Binary validation illustration: cat versus not-cat. Scores stay fixed. Choose the cutoff on validation data; keep the final test separate.",
      (p, s, k) => {
        const t = s.threshold ?? 0.5,
          m = metrics(t),
          selected = s.errorCase ?? k,
          c = cases[selected],
          pred = c.score >= t,
          kind = pred ? (c.y ? "TP" : "FP") : c.y ? "FN" : "TN";
        p.text("predicted", 124, 23, 21, I.pencil);
        p.text("cat", 131, 53, 22);
        p.text("not-cat", 239, 53, 22);
        p.text("actual", 22, 80, 20, I.pencil);
        p.text("cat", 22, 116, 22);
        p.text("not-cat", 22, 205, 22);
        [
          ["TP", m.tp],
          ["FN", m.fn],
          ["FP", m.fp],
          ["TN", m.tn],
        ].forEach(([label, n], i) => {
          const x = 108 + (i % 2) * 105,
            y = 72 + Math.floor(i / 2) * 92,
            good = label === "TP" || label === "TN";
          p.box(
            x,
            y,
            94,
            78,
            label === kind ? I.red : good ? I.green : I.pencil,
            label === kind,
          );
          p.text(
            label + " " + n,
            x + 12,
            y + 47,
            29,
            label === kind ? I.red : good ? I.green : I.pencil,
          );
        });
        A.picture(p, 356, 42, 250, 163, { animal: c.animal, place: c.place });
        p.text(
          `case ${String.fromCharCode(65 + selected)}: p(cat) = ${fixed(c.score)}`,
          358,
          235,
          24,
        );
        p.text(
          `cutoff ${fixed(t)} → ${pred ? "cat" : "not-cat"} (${kind})`,
          358,
          268,
          23,
          kind === "FP" || kind === "FN" ? I.red : I.green,
        );
        cases.forEach((item, i) => {
          const x = 30 + i * 75;
          p.action(
            "case:" + i,
            `Inspect case ${String.fromCharCode(65 + i)} with score ${item.score}`,
            () => {
              p.circle(
                x + 19,
                322,
                17,
                selected === i ? I.red : item.y ? I.blue : I.purple,
                String.fromCharCode(65 + i),
                selected === i,
              );
              p.text(fixed(item.score), x + 19, 365, 21, I.pencil, "middle");
            },
          );
        });
        const precision = m.tp + m.fp ? fixed(m.tp / (m.tp + m.fp)) : "—",
          recall = fixed(m.tp / (m.tp + m.fn));
        p.note(
          `precision ${precision}   /   recall ${recall}   /   actual cats: 4`,
          28,
          424,
        );
      },
      8,
    ),

    scene(
      "Ship the whole recipe, not just the weights",
      (s) =>
        s.deploy === "wrong"
          ? "The score vector has not changed. Swapping the class-order list changes the decoded label: a packaging error can break a correct model."
          : "The saved preprocessing, weights, class order, and decision rules must travel together. Validate the complete route in its target environment.",
      (p, s, k) => {
        const wrong = s.deploy === "wrong";
        phase(
          p,
          ["check input", "same preprocessing", "eval mode", "decode"],
          k,
          29,
        );
        A.picture(p, 25, 69, 165, 110, { animal: "cat", place: "window" });
        p.text("new photograph", 25, 213, 23);
        p.arrow(198, 125, 237, 125);
        p.box(246, 73, 155, 130, I.blue, false);
        p.text("224 × 224 × 3", 260, 109, 24);
        p.text("same RGB order", 260, 147, 21);
        p.text("same scaling", 260, 178, 21);
        p.arrow(410, 125, 449, 125);
        p.box(461, 75, 143, 125, I.green, false);
        p.text("saved model", 472, 111, 23, I.green);
        p.text("eval mode", 472, 146, 22, I.green);
        p.text("dropout off", 472, 177, 21, I.pencil);
        p.path("M535 213 Q539 249 441 259", I.green, 2);
        p.text("scores: [.89, .08, .03]", 31, 278, 25);
        p.text(
          wrong ? "labels: [dog, cat, rabbit]" : "labels: [cat, dog, rabbit]",
          31,
          322,
          25,
          wrong ? I.red : I.blue,
        );
        p.arrow(335, 302, 408, 302, wrong ? I.red : I.green);
        p.circle(
          501,
          311,
          50,
          wrong ? I.red : I.green,
          wrong ? "dog" : "cat",
          true,
        );
        p.wrap(
          wrong
            ? "Same weights. Wrong class order. Wrong label."
            : "Version the entire package; check latency, failures, and changed input patterns.",
          30,
          384,
          50,
          wrong ? I.red : I.green,
          23,
        );
      },
      4,
      [
        option("deploy:correct", "Correct package"),
        option("deploy:wrong", "Swap class order"),
      ],
    ),
  ];
  scenes[1].initialStep = (s) => s.datasetCase || 0;
  scenes[10].initialStep = (s) => s.errorCase || 0;
  scenes[1].advance = (s, k) => {
    s.datasetCase = k;
  };
  scenes[1].action = (key, s, b) => {
    s.datasetCase = +key.split(":")[1];
    b.step = s.datasetCase;
  };
  scenes[3].action = (key, s) => {
    const [kind, v] = key.split(":");
    s[kind === "pixel" ? "pixel" : "token"] = +v;
  };
  scenes[3].advance = (s, k) => {
    s.pixel = k * 5;
    s.token = k % 3;
    s.audioWindow = k;
  };
  scenes[7].action = (key, s) => {
    s.onEpoch?.(+key.split(":")[1]);
  };
  scenes[8].stepCount = (s) =>
    s.architecture === "rnn" ? 3 : s.architecture === "transformer" ? 4 : 9;
  scenes[8].showTools = (s) => s.architecture === "cnn";
  scenes[10].action = (key, s, b) => {
    s.errorCase = +key.split(":")[1];
    b.step = s.errorCase;
  };
  scenes[10].advance = (s, k) => {
    s.errorCase = k;
  };
  window.DeepSketchScenes = scenes;
  window.DeepSketchMath = {
    sigmoid,
    applyUpdate,
    trainLoss,
    valLoss,
    bestEpoch,
    attention,
    convolve,
    filters,
    imageGrid,
    metrics,
    cases,
  };
})();
