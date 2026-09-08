/* Reusable pen illustrations for the Deep Learning notebook.
   Coordinates use a 260 × 170 photograph; all details remain live SVG marks. */
(() => {
  const { ink: I, esc } = StudySketch;
  function wash(p, d, color = I.gold, opacity = 0.12) {
    p.add(`<path d="${d}" fill="${color}" opacity="${opacity}"/>`);
  }
  function cat(p, x = 135, y = 110, scale = 1) {
    p.add(`<g transform="translate(${x} ${y}) scale(${scale})">`);
    p.add(
      `<path d="M-28 15 Q-49 46 -29 58 L33 58 Q46 33 23 11 Z M-27 9 L-30 -28 L-12 -15 Q0 -22 12 -15 L31 -28 L27 9 Q1 33 -27 9 Z" fill="${I.paper}"/>`,
    );
    wash(p, "M-28 15 Q-49 46 -29 58 L33 58 Q46 33 23 11 Z", I.gold, 0.18);
    p.path("M-24 15 Q-48 36 -30 58 L35 58 Q49 39 22 15", I.blue, 2);
    p.path("M28 53 C69 56 66 27 52 28 C38 30 43 43 46 45", I.blue, 2.6);
    p.path(
      "M-27 9 L-30 -28 L-12 -15 Q0 -22 12 -15 L31 -28 L27 9 Q1 33 -27 9 Z",
      I.blue,
      2,
    );
    p.path("M-25 -19 L-17 -13 M25 -19 L18 -13", I.red, 1.2);
    p.path("M-16 1 Q-10 -3 -5 1 M7 1 Q13 -3 18 1", I.blue, 1.7);
    p.path(
      "M-3 7 L2 11 L6 7 Z M2 11 L2 16 M2 16 Q-4 20 -8 15 M2 16 Q7 20 11 15",
      I.blue,
      1.2,
    );
    for (const side of [-1, 1])
      for (let i = 0; i < 3; i++)
        p.line(side * 16, 9 + i * 4, side * 43, 5 + i * 9, I.pencil, 0.9);
    p.path(
      "M-14 33 L-11 55 M10 31 L13 55 M-20 58 L-9 58 M9 58 L21 58",
      I.blue,
      1.4,
    );
    for (let j = 0; j < 3; j++) {
      p.path(`M${-10 + j * 9} -15 l3 9`, I.gold, 1.7);
      p.path(`M-27 ${29 + j * 7} l8 4`, I.gold, 1.4);
    }
    p.add("</g>");
  }
  function dog(p, x = 132, y = 112, scale = 1) {
    p.add(`<g transform="translate(${x} ${y}) scale(${scale})">`);
    p.add(
      `<path d="M-35 13 Q-55 0 -31 -9 L26 -7 Q46 4 28 25 L-27 25 Z M9 -24 Q10 -50 34 -47 Q54 -46 55 -23 L67 -16 L65 -3 L39 1 Q13 -1 9 -24 Z M-25 20 L-27 51 L-13 51 L-10 24 Z M20 24 L23 51 L37 51 L31 17 Z" fill="${I.paper}"/>`,
    );
    wash(p, "M-35 13 Q-55 0 -31 -9 L26 -7 Q46 4 28 25 L-27 25 Z", I.gold, 0.15);
    p.path(
      "M-29 -9 Q-56 -17 -48 9 M-33 -7 Q-5 -19 28 -5 Q43 7 25 25 L-28 25 Q-44 20 -33 -7",
      I.blue,
      2,
    );
    p.path(
      "M-25 20 L-27 51 L-13 51 L-10 24 M20 24 L23 51 L37 51 L31 17",
      I.blue,
      2,
    );
    p.path(
      "M9 -24 Q10 -50 34 -47 Q54 -46 55 -23 L67 -16 L65 -3 L39 1 Q13 -1 9 -24 Z",
      I.blue,
      2,
    );
    p.path("M14 -42 Q-4 -45 4 -15 Q11 -4 18 -22", I.blue, 2);
    p.circle(40, -28, 2, I.blue);
    p.path("M60 -18 L67 -16 L63 -11 Z M47 -9 Q54 -4 60 -9", I.blue, 1.5);
    p.line(23, 0, 41, 1, I.red, 3);
    p.circle(32, 7, 3, I.gold);
    p.add("</g>");
  }
  function rabbit(p, x = 133, y = 113, scale = 1) {
    p.add(`<g transform="translate(${x} ${y}) scale(${scale})">`);
    p.path(
      "M-23 17 Q-42 54 -18 56 L24 56 Q46 31 21 17 M-17 15 Q-34 -5 -15 -24 Q-22 -67 -11 -65 Q0 -63 -3 -29 L7 -29 Q13 -74 23 -67 Q34 -59 22 -21 Q40 -2 21 15 Q0 32 -17 15",
      I.blue,
      2,
    );
    p.circle(-10, -2, 2, I.blue);
    p.circle(12, -2, 2, I.blue);
    p.path("M-2 6 l4 3 l4 -3 M2 9 v6 M-15 48 l-7 8 M17 48 l7 8", I.blue, 1.2);
    p.circle(-31, 39, 10, I.pencil);
    p.add("</g>");
  }
  function scene(p, place = "sofa") {
    p.line(0, 128, 260, 127, I.pencil, 0.9);
    if (place === "sofa") {
      wash(
        p,
        "M15 73 Q12 40 36 40 L220 42 Q244 43 243 73 L243 138 L15 138 Z",
        I.gold,
        0.16,
      );
      p.path(
        "M25 79 L23 54 Q22 41 37 41 L221 42 Q235 42 236 56 L234 78 M18 81 Q7 73 7 91 L12 137 L246 137 L252 91 Q253 74 239 81 L238 116 L22 116 Z",
        I.pencil,
        1.8,
      );
      p.path(
        "M23 102 Q73 94 123 104 L123 116 M130 104 Q184 94 237 103 M31 137 L28 151 M226 137 L230 151 M73 48 Q79 66 72 87 M187 48 Q180 65 187 87",
        I.pencil,
        1.3,
      );
      p.path(
        "M39 71 L71 68 L75 97 L42 97 Z M199 70 L224 73 L218 98 L193 93 Z",
        I.green,
        1.5,
      );
      p.box(23, 9, 42, 25, I.pencil, false);
      p.path("M28 29 L39 18 L46 24 L55 16 L62 28", I.green, 1);
      p.line(224, 37, 224, 13, I.pencil);
      p.path("M210 14 L216 2 L232 2 L239 14 Z", I.gold, 1.2);
    } else if (place === "window") {
      wash(p, "M65 7 L211 7 L211 104 L65 104 Z", I.blue, 0.06);
      p.box(66, 7, 145, 99, I.pencil, false);
      p.box(73, 14, 131, 84, I.blue, false);
      p.line(139, 15, 139, 98, I.pencil, 1.7);
      p.line(74, 56, 204, 56, I.pencil, 1.7);
      p.path(
        "M83 46 Q100 35 110 46 Q118 25 137 36 M148 81 L164 66 L180 80 L196 58",
        I.green,
        0.8,
      );
      p.path(
        "M58 5 Q81 51 61 109 L38 109 Q49 58 39 5 Z M216 5 Q200 61 214 110 L238 110 Q228 57 241 5 Z",
        I.gold,
        1.2,
      );
      p.line(40, 3, 244, 3, I.pencil, 2);
      p.line(55, 110, 224, 110, I.pencil, 2);
      p.path(
        "M18 128 L14 107 L37 107 L33 128 Z M26 108 Q6 88 10 74 Q30 77 26 106 M26 104 Q43 84 45 74 Q25 79 26 104",
        I.green,
        1.4,
      );
      for (let i = 0; i < 3; i++)
        p.line(71 + i * 45, 130, 103 + i * 45, 167, I.gold, 0.8);
    } else if (place === "park") {
      wash(p, "M0 105 Q100 93 260 105 L260 170 L0 170 Z", I.green, 0.09);
      p.path(
        "M16 34 Q18 18 33 25 Q40 9 53 25 Q72 22 72 35 Z M159 42 Q165 25 178 35 Q191 22 203 38",
        I.blue,
        0.9,
      );
      p.path(
        "M233 100 L231 53 M233 58 Q207 57 214 41 Q204 25 222 21 Q226 9 242 22 Q260 24 252 43 Q263 57 233 58",
        I.green,
        1.5,
      );
      for (let i = 0; i < 18; i++) {
        let x = 10 + i * 14,
          y = 133 + (i % 3) * 11;
        p.path(`M${x} ${y} l-3 -6 M${x} ${y} l4 -8`, I.green, 0.85);
      }
      p.path(
        "M14 104 L14 67 M42 104 L42 67 M70 104 L70 67 M4 76 L83 76 M4 91 L83 91",
        I.pencil,
        0.9,
      );
    } else {
      p.path(
        "M49 113 L222 113 L217 125 L54 125 Z M66 125 L60 158 M202 125 L211 158",
        I.pencil,
        1.6,
      );
      p.box(15, 18, 50, 48, I.pencil, false);
      p.line(39, 28, 39, 55, I.red, 4);
      p.line(26, 41, 53, 41, I.red, 4);
      p.box(211, 18, 39, 68, I.pencil, false);
      p.line(212, 50, 250, 50, I.pencil, 1);
      p.circle(231, 57, 2, I.gold);
      p.text("clinic", 93, 30, 17, I.pencil);
    }
  }
  function picture(
    p,
    x,
    y,
    w,
    h,
    { animal = "cat", place = "sofa", flip = false, focus = false } = {},
  ) {
    const id = `photo-${p.id}-${p.serial++}`;
    p.add(
      `<defs><clipPath id="${id}"><path d="M0 1 L259 0 L260 169 L1 170 Z"/></clipPath></defs><g transform="translate(${x} ${y}) scale(${w / 260} ${h / 170})"><g clip-path="url(#${id})">`,
    );
    wash(p, "M0 0H260V170H0Z", I.gold, 0.06);
    scene(p, place);
    const ay =
      place === "sofa"
        ? 62
        : place === "window"
          ? 75
          : place === "clinic"
            ? 62
            : 91;
    p.add(flip ? '<g transform="translate(260 0) scale(-1 1)">' : "<g>");
    (({ cat, dog, rabbit })[animal] || cat)(p, 135, ay, 0.95);
    p.add("</g>");
    if (focus)
      p.path(
        `M88 ${ay - 33} L209 ${ay - 33} L209 ${ay + 59} L88 ${ay + 59} Z`,
        I.red,
        2.2,
        'stroke-dasharray="5 4"',
      );
    p.add("</g>");
    p.path("M1 1 Q126 -2 259 1 L259 169 Q131 172 1 168 Z", I.pencil, 1.4);
    p.add("</g>");
  }
  function tag(p, label, x, y, color = I.blue) {
    p.text(label, x, y, 21, color);
    p.line(x, y + 4, x + Math.min(label.length * 8, 160), y + 3, color, 0.8);
  }
  function lock(p, x, y, open = false, color = I.pencil) {
    p.path(
      `M${x + 5} ${y + 12} V${y + 5} Q${x + 14} ${y - 6} ${x + 23} ${y + 5} ${open ? "" : "V" + (y + 12)}`,
      color,
      1.7,
    );
    p.box(x, y + 12, 28, 23, color, false);
    p.circle(x + 14, y + 23, 2, color);
  }
  function metric(p, label, value, x, y, color = I.blue) {
    p.text(label, x, y, 20, I.pencil);
    p.text(value, x, y + 33, 31, color);
  }
  function pill(p, key, label, x, y, w, active = false) {
    p.action(key, label, () => {
      p.box(x, y, w, 33, active ? I.red : I.pencil, active);
      p.text(label, x + w / 2, y + 23, 20, active ? I.red : I.blue, "middle");
    });
  }
  function scope(p, selected = 2) {
    const colors = [I.blue, I.green, I.red];
    p.box(18, 18, 604, 393, colors[0], false);
    p.text("Artificial intelligence (AI)", 40, 56, 29, colors[0]);
    p.text(
      "Systems performing tasks that call for intelligence",
      40,
      89,
      21,
      I.pencil,
    );
    p.text("Can include hand-written rules and search.", 40, 119, 20, I.pencil);
    p.box(61, 146, 536, 244, colors[1], false);
    p.text("Machine learning (ML)", 83, 181, 27, colors[1]);
    p.text("Learns patterns from data", 83, 212, 21, I.pencil);
    p.text(
      "Also includes linear models and decision trees.",
      83,
      241,
      20,
      I.pencil,
    );
    p.box(112, 263, 459, 108, colors[2], selected === 2);
    p.text("Deep learning (DL)", 133, 299, 26, colors[2]);
    p.text(
      "Learns representations through many neural layers",
      133,
      332,
      20,
      I.pencil,
    );
    p.note("Deep learning ⊂ machine learning ⊂ AI", 72, 435);
  }
  window.DeepSketchArt = {
    picture,
    cat,
    dog,
    rabbit,
    tag,
    lock,
    metric,
    pill,
    wash,
    scope,
  };
})();
