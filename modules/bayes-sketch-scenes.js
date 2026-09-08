(() => {
  const { ink: I, chain } = StudySketch;
  const scene = (title, caption, draw, steps = 4, action) => ({
    title,
    caption,
    draw,
    steps,
    action,
  });
  const evidence = {
    free: [0.75, 0.1],
    winner: [0.6, 0.05],
    meeting: [0.05, 0.5],
  };
  function posterior(s) {
    let a = 0.4,
      b = 0.6;
    for (const k of s.clues || ["free", "winner"]) {
      a *= evidence[k][0];
      b *= evidence[k][1];
    }
    return { a, b, p: a / (a + b) };
  }
  const rows = [
    ["yes", "yes", "—", "spam"],
    ["yes", "—", "—", "spam"],
    ["—", "yes", "—", "spam"],
    ["—", "—", "yes", "not spam"],
    ["—", "—", "yes", "not spam"],
    ["—", "—", "—", "not spam"],
  ];
  window.BayesPosterior = posterior;
  window.BayesSketchScenes = [
    scene(
      "Read the labeled evidence",
      "Trace each email. Three examples are spam and three are not spam.",
      (p, s, k) => {
        ["email", "free", "winner", "meeting", "class"].forEach((t, i) =>
          p.text(t, 35 + i * 118, 55, 22, i === 4 ? I.red : I.blue),
        );
        rows.forEach((r, j) => {
          if (j === k) p.line(30, 87 + j * 43, 608, 87 + j * 43, "#ebce73", 27);
          [j + 1, ...r].forEach((v, i) =>
            p.text(v, 40 + i * 118, 96 + j * 43, 22, i === 4 ? I.red : I.blue),
          );
        });
        p.note("Rows are examples; columns are measured clues.", 35, 408);
      },
      6,
    ),
    scene(
      "Turn words into binary clues",
      "Trace each named feature. A present word is 1; an absent word is 0.",
      (p, s, k) => {
        p.text("“You are a winner. Claim your free prize.”", 35, 70, 26);
        ["free", "winner", "meeting"].forEach((t, i) => {
          p.box(40 + i * 200, 140, 155, 75, i === k ? I.red : I.blue);
          p.text(t, 63 + i * 200, 183, 27, i === k ? I.red : I.blue);
          p.arrow(112 + i * 200, 227, 112 + i * 200, 283);
          p.circle(112 + i * 200, 315, 27, I.green, i === 2 ? "0" : "1", true);
        });
        p.note("X = [1, 1, 0]     label = the known class", 65, 409);
      },
      3,
    ),
    scene(
      "Learn on 80%; protect the other 20%",
      "The split is illustrative. The final test examples never select a model or preprocessing rule.",
      (p, s, k) => {
        for (let i = 0; i < 20; i++)
          p.box(
            70 + (i % 10) * 49,
            90 + Math.floor(i / 10) * 90,
            34,
            52,
            i < 16 ? I.blue : I.red,
          );
        p.text("train = learn", 85, 301, 28);
        p.text("test = sealed", 350, 301, 28, I.red);
        p.note(
          [
            "Assign each example to one split",
            "Train using only the training rows",
            "Use CV inside training to choose settings",
            "Open the final test only after choices are fixed",
          ][k],
          30,
          392,
        );
      },
    ),
    scene(
      "One family; different likelihoods",
      "Choose a model type. The feature representation determines the likelihood.",
      (p, s, k) => {
        const names = ["Bernoulli", "Multinomial", "Categorical", "Gaussian"],
          type = s.model || "bernoulli",
          i = names.findIndex((n) => n.toLowerCase() === type);
        p.text(names[i], 50, 66, 30);
        if (i === 0) {
          p.circle(145, 210, 43, I.blue, "1", true);
          p.circle(365, 210, 43, I.pencil, "0");
          p.text("present", 104, 292);
          p.text("absent", 330, 292);
        } else if (i === 1)
          p.bars([3, 1, 2], ["free", "prize", "now"], { max: 3 });
        else if (i === 2) {
          ["red", "blue", "green"].forEach((t, j) => {
            p.box(50 + j * 195, 160, 145, 90, [I.red, I.blue, I.green][j]);
            p.text(t, 83 + j * 195, 215, 27, [I.red, I.blue, I.green][j]);
          });
        } else {
          for (const [mu, c] of [
            [210, I.blue],
            [420, I.red],
          ]) {
            let d = "";
            for (let j = 0; j < 100; j++) {
              let x = 35 + j * 5.6;
              d +=
                (j ? " L" : "M") +
                x +
                " " +
                (300 - 190 * Math.exp(-0.5 * ((x - mu) / 65) ** 2));
            }
            p.path(d, c, 2.5);
          }
        }
        p.note(
          [
            "binary presence / absence",
            "counts, such as word occurrences",
            "one of several named categories",
            "continuous values → a fitted density",
          ][i],
          40,
          395,
        );
      },
      1,
    ),
    scene(
      "Prior first; likelihood second",
      "This is the separate 100-email example: 40 spam, 60 not spam. Trace the clues.",
      (p, s, k) => {
        const key = ["free", "winner", "meeting"][k % 3];
        p.text("before the clues", 50, 50, 24);
        p.bars([0.4, 0.6], ["spam", "not spam"], {
          x: 50,
          y: 245,
          w: 260,
          h: 130,
          colors: [I.red, I.blue],
        });
        p.text("P(" + key + " | class)", 330, 50, 24);
        p.bars(evidence[key], ["spam", "not spam"], {
          x: 330,
          y: 245,
          w: 260,
          h: 130,
          colors: [I.red, I.blue],
        });
        p.note("Prior = class frequency. Likelihood = clue fit.", 30, 369);
      },
      3,
    ),
    scene(
      "Separate clues, once class is known",
      "Toggle the assumption note. Real word dependence can make posteriors overconfident.",
      (p, s, k) => {
        p.circle(320, 80, 43, I.green, "class");
        ["free", "winner", "meeting"].forEach((t, i) => {
          p.arrow(320, 123, 110 + i * 210, 231);
          p.circle(110 + i * 210, 265, 44, i === k ? I.red : I.blue, t);
        });
        if (s.correlated) {
          p.path("M150 275 Q213 350 277 275", I.red, 2.5);
          p.text("real words can travel together", 127, 354, 22, I.red);
        }
        p.note(
          s.correlated
            ? "The model omits these within-class links."
            : "P(clues | class) ≈ product of likelihoods",
          36,
          410,
        );
      },
      3,
    ),
    scene(
      "Multiply; then normalize",
      "Tap clues to include or ignore them. Ignored is not the same as observed absent.",
      (p, s, k) => {
        const r = posterior(s);
        Object.keys(evidence).forEach((word, i) =>
          p.action("clue:" + word, "Toggle " + word + " evidence", () => {
            const on = (s.clues || []).includes(word);
            p.box(40 + i * 200, 48, 160, 57, on ? I.green : I.pencil, on);
            p.text(
              word + (on ? " ✓" : ""),
              64 + i * 200,
              84,
              25,
              on ? I.green : I.pencil,
            );
          }),
        );
        p.text("spam score", 55, 165, 23, I.red);
        p.text(
          [0.4, ...s.clues.map((key) => evidence[key][0])]
            .map((v) => v.toFixed(2))
            .join(" × "),
          55,
          201,
          21,
          I.red,
        );
        p.text("= " + r.a.toFixed(5), 55, 241, 29, I.red);
        p.text("not-spam score", 354, 165, 23);
        p.text(
          [0.6, ...s.clues.map((key) => evidence[key][1])]
            .map((v) => v.toFixed(2))
            .join(" × "),
          354,
          201,
          21,
        );
        p.text("= " + r.b.toFixed(5), 354, 241, 29);
        p.arrow(190, 273, 270, 321, I.red);
        p.arrow(462, 273, 375, 321);
        p.text("P(spam | selected clues)", 166, 356, 23, I.green);
        p.note(
          r.a.toFixed(4) +
            " ÷ " +
            (r.a + r.b).toFixed(4) +
            " = " +
            (r.p * 100).toFixed(1) +
            "%",
          92,
          410,
        );
      },
      1,
      (key, s) => {
        const word = key.split(":")[1];
        s.clues = s.clues.includes(word)
          ? s.clues.filter((x) => x !== word)
          : [...s.clues, word];
        s.onScore?.();
      },
    ),
    scene(
      "How typical is this height?",
      "Move the height slider. Densities are not point probabilities; equal-spread curves are illustrative.",
      (p, s, k) => {
        const h = s.height || 169;
        [
          [168, I.blue],
          [181, I.red],
        ].forEach(([mu, c]) => {
          let d = "";
          for (let i = 0; i <= 100; i++) {
            const x = 157 + i * 0.33;
            d +=
              (i ? " L" : "M") +
              (50 + i * 5.4) +
              " " +
              (300 - Math.exp(-0.5 * ((x - mu) / 3.7) ** 2) * 200);
          }
          p.path(d, c, 2.6);
          p.text("mean " + mu, mu === 168 ? 110 : 410, 64, 24, c);
        });
        const x = 50 + ((h - 157) / 33) * 540;
        p.line(x, 80, x, 310, I.green, 2.3);
        p.text(h + " cm", x, 344, 23, I.green, "middle");
        p.note("Compare each class density at this same height.", 30, 410);
      },
      1,
    ),
    scene(
      "Avoid zero products and underflow",
      "Laplace smoothing is for discrete/count likelihoods. Log space works with products as sums.",
      (p, s, k) => {
        const log = s.stability === "logs";
        chain(
          p,
          log
            ? ["small numbers", "log each", "add", "compare"]
            : ["unseen clue", "zero count", "add α", "nonzero fit"],
          k,
          133,
        );
        p.text(log ? "log(a × b × c)" : "P(unseen | class)", 112, 282, 29);
        p.text(
          log ? "= log(a) + log(b) + log(c)" : "= (0 + α) / (class total + αK)",
          112,
          329,
          26,
          I.green,
        );
        p.note(
          log
            ? "Same class ranking, safer arithmetic."
            : "Count example: α = 1 is Laplace smoothing.",
          35,
          405,
        );
      },
    ),
    scene(
      "Rotate the held-out fold",
      "Use the round buttons, or trace the five rounds. All fitting happens within each training fold.",
      (p, s, k) => {
        const fold = s.fold || k + 1;
        for (let i = 0; i < 5; i++) {
          const c = i === fold - 1 ? I.green : I.blue;
          p.box(40 + i * 120, 114, 96, 137, c);
          p.text("fold " + (i + 1), 50 + i * 120, 156, 23, c);
          p.text(i === fold - 1 ? "check" : "fit", 52 + i * 120, 214, 25, c);
        }
        p.text("four folds fit → one fold validates", 106, 324, 25);
        p.note("Do not reuse the final test to choose the model.", 33, 407);
      },
      5,
    ),
    scene(
      "Which mistake matters more?",
      "Choose Protect inbox or Catch more spam to inspect the cost of each kind of error.",
      (p, s, k) => {
        const protect = s.priority !== "recall";
        p.text(
          protect ? "Protect the inbox" : "Catch more spam",
          75,
          66,
          31,
          protect ? I.blue : I.red,
        );
        p.box(80, 125, 180, 145, I.blue);
        p.box(378, 125, 180, 145, I.red);
        p.text("important email", 91, 170, 23);
        p.text("spam email", 399, 170, 23, I.red);
        p.arrow(protect ? 182 : 478, 285, 322, 337, protect ? I.blue : I.red);
        p.text(
          protect
            ? "wrongly buried → false positive"
            : "missed spam → false negative",
          78,
          380,
          26,
          protect ? I.blue : I.red,
        );
      },
      1,
    ),
    scene(
      "Rehearse the evidence chain",
      "Start from priors, combine class-conditional likelihoods, normalize, then make a decision.",
      (p, s, k) => {
        chain(p, ["prior", "likelihoods", "posterior", "decision"], k, 171);
        p.text(
          "P(class | evidence) ∝ P(class) × P(evidence | class)",
          30,
          316,
          23,
          I.green,
        );
        p.note("Evaluate on held-out data before trusting the rule.", 25, 410);
      },
    ),
  ];
  BayesSketchScenes[9].initialStep = (s) => (s.fold || 1) - 1;
  BayesSketchScenes[9].advance = (s, k) => {
    s.fold = k + 1;
    s.onFold?.(s.fold);
  };
})();
