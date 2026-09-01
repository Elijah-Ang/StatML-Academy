/*
 * Deep Learning hybrid-v2 renderer.
 *
 * The generated plates are the physical notebook underdrawing.  This file
 * only adds the things that must stay truthful and live: labels, values,
 * equations, data marks, selections, and bounded state cues.  It deliberately
 * has no global Canvas hooks, no scroll owner, and no idle animation loop.
 */
(() => {
  'use strict';

  const VERSION = '2026-08-31-hybrid-v2-centered-1';
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const ATTR = 'deepLearningRenderer';
  const ART_WIDTH = 1000;
  const ART_HEIGHT = 666;
  const ART_VIEWBOX = `0 0 ${ART_WIDTH} ${ART_HEIGHT}`;
  const ART_RATIO = ART_WIDTH / ART_HEIGHT;
  const MOTION_MS = 560;
  const BASE = new URL('../assets/deep-learning/hybrid-v2/', document.currentScript?.src || location.href);
  const PAPER = '#fbf6e9';
  const INK = '#2c2926';
  const PENCIL = '#6c675f';
  const BLUE = '#356fae';
  const GREEN = '#4f956b';
  const CORAL = '#c85e58';
  const AMBER = '#bf8c3d';
  const LAVENDER = '#7960ae';
  const HAND = 'Patrick Hand, Kalam, Marker Felt, Segoe Print, cursive';
  const UTILITY = 'Kalam, Patrick Hand, Marker Felt, cursive';
  const DEFAULT_STATE = Object.freeze({
    active: 0,
    biased: false,
    tensorMode: 'image',
    earWeight: 1.2,
    furWeight: 0.6,
    backgroundWeight: 0.2,
    neuronBias: -0.2,
    learnStep: 3,
    learningRate: 0.5,
    epoch: 12,
    architecture: 'cnn',
    threshold: 0.5
  });

  const fallbackManifest = {
    schema: 'statml.deep-learning.hybrid-scene@2',
    version: VERSION,
    baseUrl: '../../assets/deep-learning/hybrid-v2/',
    style: {
      referenceSet: ['statml-handwritten-01', 'statml-handwritten-02'],
      paper: 'warm-ruled-cream',
      ink: 'graphite-ink',
      palette: {structure: 'blue', healthy: 'green', risk: 'coral', caution: 'amber', secondary: 'lavender'}
    },
    assets: {
      'ch01.finish-line': {chapter: 1, src: 'ch01-finish-line-v1.png', kind: 'plate', intrinsic: {width: 1536, height: 1024}, textFree: true, opaque: true, focal: {x: .5, y: .5}, crop: {desktop: {x: 0, y: 0, width: 1, height: 1}, mobile: {x: 0, y: 0, width: 1, height: 1}}, slots: {probabilityRows: [{x: .68, y: .33, width: .24, height: .055}, {x: .68, y: .49, width: .24, height: .055}, {x: .68, y: .65, width: .24, height: .055}]}, provenance: {promptFile: 'prompts/ch01-finish-line-v1.txt', referenceImages: ['user-supplied-statml-handwriting-set'], generator: 'imagegen', sha256: 'pending'}},
      'ch02.dataset': {chapter: 2, src: 'ch02-dataset-v1.png', kind: 'plate', intrinsic: {width: 1536, height: 1024}, textFree: true, opaque: true, focal: {x: .35, y: .45}, crop: {desktop: {x: 0, y: 0, width: 1, height: 1}, mobile: {x: 0, y: 0, width: 1, height: 1}}, provenance: {promptFile: 'prompts/ch02-dataset-v1.txt', referenceImages: ['user-supplied-statml-handwriting-set'], generator: 'imagegen', sha256: 'pending'}},
      'ch03.split': {chapter: 3, src: 'ch03-split-notebook-v1.png', kind: 'plate', intrinsic: {width: 1536, height: 1024}, textFree: true, opaque: true, focal: {x: .55, y: .5}, crop: {desktop: {x: 0, y: 0, width: 1, height: 1}, mobile: {x: 0, y: 0, width: 1, height: 1}}, provenance: {promptFile: 'prompts/ch03-split-notebook-v1.txt', referenceImages: ['user-supplied-statml-handwriting-set'], generator: 'imagegen', sha256: 'pending'}},
      'ch04.image': {chapter: 4, src: 'ch04-image-v1.png', kind: 'plate', intrinsic: {width: 1536, height: 1024}, textFree: true, opaque: true, focal: {x: .5, y: .5}, crop: {desktop: {x: 0, y: 0, width: 1, height: 1}, mobile: {x: 0, y: 0, width: 1, height: 1}}, provenance: {promptFile: 'prompts/ch04-image-v1.txt', referenceImages: ['user-supplied-statml-handwritten-set'], generator: 'imagegen', sha256: 'pending'}},
      'ch04.text': {chapter: 4, src: 'ch04-text-v1.png', kind: 'plate', intrinsic: {width: 1536, height: 1024}, textFree: true, opaque: true, focal: {x: .5, y: .5}, crop: {desktop: {x: 0, y: 0, width: 1, height: 1}, mobile: {x: 0, y: 0, width: 1, height: 1}}, provenance: {promptFile: 'prompts/ch04-text-v1.txt', referenceImages: ['user-supplied-statml-handwritten-set'], generator: 'imagegen', sha256: 'pending'}},
      'ch04.audio': {chapter: 4, src: 'ch04-audio-v1.png', kind: 'plate', intrinsic: {width: 1536, height: 1024}, textFree: true, opaque: true, focal: {x: .5, y: .5}, crop: {desktop: {x: 0, y: 0, width: 1, height: 1}, mobile: {x: 0, y: 0, width: 1, height: 1}}, provenance: {promptFile: 'prompts/ch04-audio-v1.txt', referenceImages: ['user-supplied-statml-handwritten-set'], generator: 'imagegen', sha256: 'pending'}},
      'ch05.neuron': {chapter: 5, src: 'ch05-neuron-material-v2.png', kind: 'plate', intrinsic: {width: 1536, height: 1024}, textFree: true, opaque: true, focal: {x: .5, y: .5}, crop: {desktop: {x: 0, y: 0, width: 1, height: 1}, mobile: {x: 0, y: 0, width: 1, height: 1}}, provenance: {promptFile: 'prompts/ch05-neuron-material-v2.txt', referenceImages: ['user-supplied-statml-handwritten-set'], generator: 'imagegen', sha256: 'pending'}},
      'ch06.feature-ladder': {chapter: 6, src: 'ch06-feature-sheets-v1.png', kind: 'plate', intrinsic: {width: 1536, height: 1024}, textFree: true, opaque: true, focal: {x: .5, y: .35}, crop: {desktop: {x: 0, y: 0, width: 1, height: 1}, mobile: {x: 0, y: 0, width: 1, height: 1}}, provenance: {promptFile: 'prompts/ch06-feature-sheets-v1.txt', referenceImages: ['user-supplied-statml-handwritten-set'], generator: 'imagegen', sha256: 'pending'}},
      'ch07.learning-loop': {chapter: 7, src: 'ch07-learning-loop-material-v2.png', kind: 'plate', intrinsic: {width: 1536, height: 1024}, textFree: true, opaque: true, focal: {x: .5, y: .5}, crop: {desktop: {x: 0, y: 0, width: 1, height: 1}, mobile: {x: 0, y: 0, width: 1, height: 1}}, provenance: {promptFile: 'prompts/ch07-learning-loop-material-v2.txt', referenceImages: ['user-supplied-statml-handwritten-set'], generator: 'imagegen', sha256: 'pending'}},
      'ch08.training-curve': {chapter: 8, src: 'ch08-training-chart-material-v1.png', kind: 'plate', intrinsic: {width: 1536, height: 1024}, textFree: true, opaque: true, focal: {x: .5, y: .48}, crop: {desktop: {x: 0, y: 0, width: 1, height: 1}, mobile: {x: 0, y: 0, width: 1, height: 1}}, provenance: {promptFile: 'prompts/ch08-training-chart-material-v1.txt', referenceImages: ['user-supplied-statml-handwritten-set'], generator: 'imagegen', sha256: 'pending'}},
      'ch09.architecture': {chapter: 9, src: 'ch09-architecture-v1.png', kind: 'plate', intrinsic: {width: 1536, height: 1024}, textFree: true, opaque: true, focal: {x: .5, y: .45}, crop: {desktop: {x: 0, y: 0, width: 1, height: 1}, mobile: {x: 0, y: 0, width: 1, height: 1}}, provenance: {promptFile: 'prompts/ch09-architecture-v1.txt', referenceImages: ['user-supplied-statml-handwritten-set'], generator: 'imagegen', sha256: 'pending'}},
      'ch09.rnn': {chapter: 9, src: 'ch09-rnn-v1.png', kind: 'plate', intrinsic: {width: 1536, height: 1024}, textFree: true, opaque: true, focal: {x: .5, y: .5}, crop: {desktop: {x: 0, y: 0, width: 1, height: 1}, mobile: {x: 0, y: 0, width: 1, height: 1}}, provenance: {promptFile: 'prompts/ch09-rnn-v1.txt', referenceImages: ['user-supplied-statml-handwritten-set'], generator: 'imagegen', sha256: 'pending'}},
      'ch09.transformer': {chapter: 9, src: 'ch09-transformer-v2.png', kind: 'plate', intrinsic: {width: 1536, height: 1024}, textFree: true, opaque: true, focal: {x: .5, y: .5}, crop: {desktop: {x: 0, y: 0, width: 1, height: 1}, mobile: {x: 0, y: 0, width: 1, height: 1}}, provenance: {promptFile: 'prompts/ch09-transformer-v2.txt', referenceImages: ['user-supplied-statml-handwritten-set'], generator: 'imagegen', sha256: 'pending'}},
      'ch10.transfer': {chapter: 10, src: 'ch10-transfer-v1.png', kind: 'plate', intrinsic: {width: 1536, height: 1024}, textFree: true, opaque: true, focal: {x: .5, y: .48}, crop: {desktop: {x: 0, y: 0, width: 1, height: 1}, mobile: {x: 0, y: 0, width: 1, height: 1}}, provenance: {promptFile: 'prompts/ch10-transfer-v1.txt', referenceImages: ['user-supplied-statml-handwritten-set'], generator: 'imagegen', sha256: 'pending'}},
      'ch11.threshold': {chapter: 11, src: 'ch11-threshold-v1.png', kind: 'plate', intrinsic: {width: 1536, height: 1024}, textFree: true, opaque: true, focal: {x: .42, y: .45}, crop: {desktop: {x: 0, y: 0, width: 1, height: 1}, mobile: {x: 0, y: 0, width: 1, height: 1}}, provenance: {promptFile: 'prompts/ch11-threshold-v1.txt', referenceImages: ['user-supplied-statml-handwritten-set'], generator: 'imagegen', sha256: 'pending'}},
      'ch12.release': {chapter: 12, src: 'ch12-release-v1.png', kind: 'plate', intrinsic: {width: 1536, height: 1024}, textFree: true, opaque: true, focal: {x: .5, y: .5}, crop: {desktop: {x: 0, y: 0, width: 1, height: 1}, mobile: {x: 0, y: 0, width: 1, height: 1}}, provenance: {promptFile: 'prompts/ch12-release-v1.txt', referenceImages: ['user-supplied-statml-handwritten-set'], generator: 'imagegen', sha256: 'pending'}}
    }
  };

  /* Keep the embedded fallback aligned with the edited v2 plate when the
     manifest request is unavailable (for example in an offline capture). */
  fallbackManifest.assets['ch08.training-curve'].src = 'ch08-training-chart-material-v2.png';
  fallbackManifest.assets['ch08.training-curve'].provenance = {
    ...fallbackManifest.assets['ch08.training-curve'].provenance,
    promptFile: 'prompts/ch08-training-chart-material-v2.txt',
    generator: 'imagegen-edit'
  };

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const hash = value => {
    let result = 2166136261 >>> 0;
    for (const char of String(value)) {
      result ^= char.charCodeAt(0);
      result = Math.imul(result, 16777619) >>> 0;
    }
    return result >>> 0;
  };
  const noise = (seed, index, amount = 1) => {
    const n = Math.sin((hash(`${seed}:${index}`) || 1) * .000017) * 43758.5453;
    return (n - Math.floor(n) - .5) * amount;
  };
  const round = (n, digits = 2) => Number(n.toFixed(digits));
  const escapeText = value => String(value).replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'}[char]));

  const node = (tag, attrs = {}, parent) => {
    const element = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null) element.setAttribute(key, String(value));
    });
    if (parent) parent.appendChild(element);
    return element;
  };

  const text = (parent, value, x, y, size = 21, color = INK, options = {}) => {
    const classes = [
      options.utility ? 'deep-live-utility' : '',
      options.value ? 'deep-live-value value' : '',
      !options.utility && !options.value ? 'deep-live-label' : '',
      options.semantic ? `deep-live-${String(options.semantic).replace(/[^a-z0-9_-]/gi, '')}` : '',
      options.className || ''
    ].filter(Boolean).join(' ');
    const element = node('text', {
      x: round(x), y: round(y), fill: color, 'font-size': size,
      'font-family': options.utility ? UTILITY : HAND,
      'font-weight': options.weight || 400,
      'text-anchor': options.anchor || 'start',
      'dominant-baseline': options.baseline || 'alphabetic',
      'letter-spacing': options.letterSpacing || undefined,
      'paint-order': options.halo ? 'stroke fill' : undefined,
      stroke: options.halo || undefined,
      'stroke-width': options.haloWidth || undefined,
      'stroke-linejoin': options.halo ? 'round' : undefined,
      opacity: options.opacity === undefined ? 1 : options.opacity,
      class: `deep-live-text${classes ? ` ${classes}` : ''}`
    }, parent);
    element.textContent = String(value);
    element.style.setProperty('--deep-live-size', `${size}px`);
    if (options.mobileCap !== undefined) element.style.setProperty('--deep-live-mobile-cap', `${options.mobileCap}px`);
    return element;
  };

  const path = (parent, d, attrs = {}) => node('path', {d, fill: 'none', pathLength: 1, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...attrs}, parent);
  const rough = (points, seed, amount = 1) => points.map(([x, y], index) => [round(x + noise(seed, index * 2, amount)), round(y + noise(seed, index * 2 + 1, amount))]);
  const pathFrom = points => points.map(([x, y], index) => `${index ? 'L' : 'M'} ${round(x)} ${round(y)}`).join(' ');
  const stroke = (parent, points, seed, color = INK, width = 2, opacity = 1, options = {}) => {
    const pts = rough(points, seed, options.jitter === undefined ? .9 : options.jitter);
    const d = pathFrom(pts);
    const markClass = ['deep-live-mark', options.className || ''].filter(Boolean).join(' ');
    path(parent, d, {stroke: color, 'stroke-width': width, opacity, class: markClass});
    if (options.echo) path(parent, pathFrom(rough(points, `${seed}:echo`, options.jitter === undefined ? .55 : options.jitter * .7)), {stroke: color, 'stroke-width': Math.max(.7, width * .48), opacity: opacity * .24, class: `deep-live-echo${options.className ? ` ${options.className}` : ''}`});
    return d;
  };
  const line = (parent, x1, y1, x2, y2, color = INK, width = 2, seed = 'line', opacity = 1, options = {}) => stroke(parent, [[x1, y1], [x2, y2]], seed, color, width, opacity, options);
  const arrow = (parent, x1, y1, x2, y2, color = BLUE, width = 2.4, seed = 'arrow', options = {}) => {
    line(parent, x1, y1, x2, y2, color, width, seed, options.opacity === undefined ? 1 : options.opacity, {echo: options.echo !== false, jitter: options.jitter});
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const size = options.size || 13;
    const left = [x2 - Math.cos(angle - .5) * size, y2 - Math.sin(angle - .5) * size];
    const right = [x2 - Math.cos(angle + .5) * size, y2 - Math.sin(angle + .5) * size];
    stroke(parent, [left, [x2, y2], right], `${seed}:head`, color, width * .82, options.opacity === undefined ? 1 : options.opacity, {echo: true, jitter: .65});
  };
  const circle = (parent, cx, cy, r, color = BLUE, width = 2, seed = 'circle', opacity = 1, fill = 'none', options = {}) => {
    const points = [];
    for (let index = 0; index <= 20; index += 1) {
      const angle = (index / 20) * Math.PI * 2;
      points.push([cx + Math.cos(angle) * (r + noise(seed, index, 1.2)), cy + Math.sin(angle) * (r + noise(seed, index + 40, 1.2))]);
    }
    return path(parent, pathFrom(rough(points, `${seed}:path`, .45)), {stroke: color, 'stroke-width': width, opacity, fill, class: ['deep-live-mark', options.className || ''].filter(Boolean).join(' ')});
  };
  const roughBox = (parent, x, y, width, height, seed, color = INK, fill = 'none', opacity = 1, widthStroke = 1.7) => {
    const pts = [[x, y], [x + width, y], [x + width, y + height], [x, y + height], [x, y]];
    return path(parent, pathFrom(rough(pts, seed, 1.6)), {stroke: color, 'stroke-width': widthStroke, opacity, fill, class: 'deep-live-paper-edge'});
  };
  const filledRect = (parent, x, y, width, height, fill = PAPER, attrs = {}) => node('rect', {
    x: round(x), y: round(y), width: round(width), height: round(height), fill,
    ...attrs
  }, parent);
  const cleanBoard = (parent, seed = 'board') => {
    /* The generated plates are useful texture for most chapters, but the
       architecture/release plates carry competing diagrams.  A full paper
       wash lets those two scenes own their reading order without changing
       the shared raster assets. */
    filledRect(parent, 0, 34, ART_WIDTH, ART_HEIGHT - 34, PAPER, {opacity: .985, class: 'deep-live-board'});
    for (let y = 82; y <= 610; y += 72) line(parent, 28, y, 972, y, PENCIL, .8, `${seed}:rule:${y}`, .1, {echo: false, jitter: .3, className: 'deep-live-board-rule'});
  };
  const paperCard = (parent, x, y, width, height, seed, color = PENCIL, fill = '#fffaf0', opacity = .96) => {
    roughBox(parent, x, y, width, height, seed, color, fill, opacity, 1.7);
  };
  const pixelGrid = (parent, x, y, width, height, columns, rows, seed, palette = [BLUE, GREEN], highlight = false) => {
    const cellW = width / columns;
    const cellH = height / rows;
    filledRect(parent, x, y, width, height, '#fffaf0', {opacity: .92, class: 'deep-live-pixel-grid'});
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const value = (hash(`${seed}:${row}:${column}`) % 100) / 100;
        const color = palette[(row + column) % palette.length];
        filledRect(parent, x + column * cellW + 2, y + row * cellH + 2, Math.max(2, cellW - 4), Math.max(2, cellH - 4), color, {opacity: .12 + value * .58, class: 'deep-live-pixel'});
      }
    }
    roughBox(parent, x, y, width, height, `${seed}:edge`, PENCIL, 'none', .72, 1.5);
    if (highlight) roughBox(parent, x + cellW * 2, y + cellH * 2, cellW * 2, cellH * 2, `${seed}:focus`, CORAL, 'none', .9, 2.4);
  };
  const filterBank = (parent, x, y, width, height, seed) => {
    paperCard(parent, x, y, width, height, `${seed}:card`, BLUE, '#fffaf0', .96);
    const swatch = Math.min(56, (width - 38) / 3);
    const startX = x + (width - swatch * 3 - 16) / 2;
    [BLUE, CORAL, GREEN].forEach((color, index) => {
      const sx = startX + index * (swatch + 8);
      pixelGrid(parent, sx, y + 26, swatch, swatch, 3, 3, `${seed}:${index}`, [color, PENCIL]);
    });
    label(parent, 'scan · respond · repeat', x + width / 2, y + height - 18, {size: 15, color: PENCIL, anchor: 'middle', utility: true, weight: 600});
  };
  const featureMap = (parent, x, y, width, height, seed) => {
    paperCard(parent, x, y, width, height, `${seed}:card`, GREEN, '#fffaf0', .96);
    pixelGrid(parent, x + 20, y + 20, width - 40, height - 40, 6, 5, `${seed}:map`, [GREEN, BLUE, CORAL]);
  };
  const smallChip = (parent, value, x, y, width, color, seed, detail, options = {}) => {
    paperCard(parent, x, y, width, options.height || 58, seed, color, '#fffaf0', .96);
    label(parent, value, x + width / 2, y + (options.titleOffset || 25), {size: options.size || 18, color, anchor: 'middle', utility: options.utility !== false, weight: 700});
    if (detail) label(parent, detail, x + width / 2, y + (options.detailOffset || 46), {size: options.detailSize || 13, color: PENCIL, anchor: 'middle', utility: true, weight: 600});
  };
  /* The raster plate owns every paper card and broad marker slab.  Keep this
     helper as a compatibility seam for existing scenes, but make it a short
     underline so an old highlight option can never pollute the composition. */
  const highlighter = (parent, x, y, width, height, color = AMBER, seed = 'highlight', opacity = .28) => {
    const underlineWidth = clamp(Math.min(width, 156), 24, 156);
    const baseline = y + Math.max(4, height * .72);
    line(parent, x, baseline, x + underlineWidth, baseline + noise(seed, 1, 1.2), color, Math.max(1, Math.min(2.6, height * .1)), `${seed}:underline`, opacity, {echo: false, jitter: .35, className: 'deep-live-underline'});
  };
  const dot = (parent, x, y, r, color, seed = 'dot', opacity = 1) => {
    const c = node('circle', {cx: round(x + noise(seed, 0, .7)), cy: round(y + noise(seed, 1, .7)), r, fill: color, opacity, class: 'deep-live-dot'}, parent);
    return c;
  };
  const label = (parent, value, x, y, options = {}) => {
    if (options.highlight) highlighter(parent, x - 2, y - (options.size || 21) * .78, options.width || 120, (options.size || 21) * .8, options.highlight, options.seed || value, .42);
    return text(parent, value, x, y, options.size || 21, options.color || INK, options);
  };
  const note = (parent, value, x, y, width, options = {}) => {
    const baseline = y + (options.baseline || 27);
    label(parent, value, x, baseline, {size: options.size || 18, color: options.textColor || INK, mobileCap: options.mobileCap, className: 'deep-live-note', highlight: options.highlight, width: Math.min(width, 180), seed: `${options.seed || value}:hl`});
    line(parent, x, baseline + 8, x + Math.min(Math.max(60, width * .56), 220), baseline + 8, options.color || PENCIL, 1.1, `${options.seed || value}:rule`, .46, {echo: false, jitter: .25, className: 'deep-live-note-rule'});
  };
  const tag = (parent, value, x, y, color = BLUE, seed = value) => {
    const width = clamp(String(value).length * 10.2, 42, 160);
    text(parent, value, x, y, 17, color, {utility: true, weight: 700, letterSpacing: '.05em', className: 'deep-live-tag'});
    line(parent, x, y + 6, x + width, y + 6 + noise(seed, 2, .7), color, 1.2, `${seed}:tag-rule`, .64, {echo: false, jitter: .28, className: 'deep-live-tag-rule'});
  };

  const fullLayout = (width, height, extra = {}) => ({
    viewportClass: width < 560 || width < height * .85 ? 'phone' : width < 1100 ? 'column' : 'wide',
    phone: width < 560 || width < height * .85,
    width, height,
    /* Raster plate and live ink always share the exact 1000×666 artboard.
       A former 1350-unit phone board shifted only some live groups and showed
       a second diagram above the plate. Responsive sizing belongs in CSS. */
    viewBox: ART_VIEWBOX,
    artOffset: 0,
    safe: {x: 26, y: 20, right: ART_WIDTH - 26, bottom: ART_HEIGHT - 20},
    ...extra
  });

  /* Scene-local composition metadata.  The notebook plates retain their
     native 1000×666 frame; these small, bounded transforms move the shared
     plate + live ink together inside that frame.  Keeping the values with
     the scene (and splitting desktop/mobile) avoids a global crop and lets
     sparse diagrams use their available paper without touching the shell's
     header/caption safe areas. */
  const SCENE_COMPOSITION = Object.freeze({
    finishLine: {desktop: {scale: 1.04, y: 20}, mobile: {scale: 1.04, y: 55}},
    dataset: {desktop: {scale: 1.03, y: -6}, mobile: {scale: 1.02, y: -6}},
    split: {desktop: {scale: 1.02, y: 16}, mobile: {scale: 1.02, y: 16}},
    tensor: {desktop: {scale: 1.03, y: -26}, mobile: {scale: 1.03, y: -26}},
    neuron: {desktop: {scale: 1.08, y: 22}, mobile: {scale: 1.12, y: 48}},
    featureDepth: {desktop: {scale: 1.10, y: 108}, mobile: {scale: 1.12, y: 108}},
    learningLoop: {desktop: {scale: 1.02, y: 21}, mobile: {scale: 1.02, y: 21}},
    trainingCurve: {desktop: {scale: 1.02, y: -7}, mobile: {scale: 1.02, y: -7}},
    architecture: {desktop: {scale: 1.01, y: 20}, mobile: {scale: 1.01, y: -34}},
    transfer: {desktop: {scale: 1.05, y: -24}, mobile: {scale: 1.08, y: -24}},
    threshold: {desktop: {scale: 1.02, y: 36}, mobile: {scale: 1.04, y: 36}},
    release: {desktop: {scale: 1, y: 0}, mobile: {scale: 1, y: 0}}
  });

  const compositionFor = (scene, layout) => {
    const mode = layout.phone ? 'mobile' : 'desktop';
    const spec = scene.composition?.[mode] || {};
    const scale = clamp(Number(spec.scale) || 1, .96, 1.14);
    const x = clamp(Number(spec.x) || 0, -36, 36);
    const y = clamp(Number(spec.y) || 0, -140, 140);
    const edge = 500 * (1 - scale);
    const verticalEdge = 333 * (1 - scale);
    const transform = scale === 1 && x === 0 && y === 0
      ? ''
      : `matrix(${round(scale, 4)} 0 0 ${round(scale, 4)} ${round(edge + x)} ${round(verticalEdge + y)})`;
    /* Composition is applied once to the shared DOM scene frame below.  The
       SVG matrix above remains the stable art-coordinate description used by
       diagnostics/cache keys; CSS needs the equivalent translation in pixels
       because the DOM frame is sized in the current viewport. */
    const unitScale = Math.max(.0001, Math.min(layout.width / ART_WIDTH, layout.height / ART_HEIGHT));
    const cssTransform = transform
      ? `matrix(${round(scale, 4)}, 0, 0, ${round(scale, 4)}, ${round((edge + x) * unitScale, 3)}, ${round((verticalEdge + y) * unitScale, 3)})`
      : '';
    return {scale, x, y, transform, cssTransform};
  };

  const inArt = (parent, layout, fn) => {
    const group = node('g', {transform: layout.artOffset ? `translate(0 ${layout.artOffset})` : undefined, 'data-art-coordinates': '1000x666'}, parent);
    fn(group);
    return group;
  };

  const fallbackPlate = chapter => {
    const svg = `<svg xmlns="${SVG_NS}" viewBox="0 0 1000 666"><rect width="1000" height="666" fill="${PAPER}"/><path d="M20 90H980M20 170H980M20 250H980M20 330H980M20 410H980M20 490H980M20 570H980" stroke="#8a8376" stroke-opacity=".12" stroke-width="1"/>${chapter === 11 ? '<path d="M160 180h360v300H160z" fill="none" stroke="#6c675f" stroke-width="3"/><path d="M280 180v300M400 180v300M160 280h360M160 380h360" stroke="#6c675f" stroke-opacity=".35"/>' : chapter === 12 ? '<path d="M180 160h260v300H180zM600 160v300" fill="none" stroke="#6c675f" stroke-width="3"/>' : '<path d="M160 170h680v300H160z" fill="none" stroke="#6c675f" stroke-opacity=".3" stroke-width="2"/>'}</svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  class AssetRegistry {
    constructor(manifest) {
      this.manifest = manifest;
      this.cache = new Map();
      this.limit = 4;
    }

    get(id) {
      return this.manifest.assets?.[id] || null;
    }

    url(id) {
      const record = this.get(id);
      return record?.src ? new URL(record.src, BASE).href : fallbackPlate(record?.chapter || 0);
    }

    async preload(id) {
      if (!id) return null;
      if (this.cache.has(id)) return this.cache.get(id);
      const record = this.get(id);
      const source = this.url(id);
      const image = new Image();
      image.decoding = 'async';
      image.alt = '';
      const promise = new Promise(resolve => {
        let settled = false;
        const finish = result => {
          if (settled) return;
          settled = true;
          resolve(result);
        };
        image.onload = async () => {
          try { if (image.decode) await Promise.race([image.decode(), new Promise(r => setTimeout(r, 900))]); } catch {}
          finish({image, record, source, ok: true});
        };
        image.onerror = () => finish({image: null, record, source: fallbackPlate(record?.chapter || 0), ok: false});
        image.src = source;
        setTimeout(() => finish({image: null, record, source: fallbackPlate(record?.chapter || 0), ok: false, timeout: true}), 2500);
      });
      this.cache.set(id, promise);
      while (this.cache.size > this.limit) this.cache.delete(this.cache.keys().next().value);
      const result = await promise;
      if (!result.ok) {
        window.__statmlDeepLearningRendererDiagnostics = window.__statmlDeepLearningRendererDiagnostics || [];
        if (!window.__statmlDeepLearningRendererDiagnostics.some(item => item.id === id)) window.__statmlDeepLearningRendererDiagnostics.push({id, reason: result.timeout ? 'decode-timeout' : 'asset-error'});
      }
      return result;
    }
  }

  const validateManifest = manifest => {
    if (!manifest || typeof manifest !== 'object' || !manifest.assets) return fallbackManifest;
    const entries = Object.entries(manifest.assets);
    if (!entries.length) return fallbackManifest;
    entries.forEach(([id, record]) => {
      if (!record || !Number.isInteger(record.chapter) || record.chapter < 1 || record.chapter > 12) throw new Error(`Invalid hybrid asset chapter: ${id}`);
      if (!record.intrinsic || !record.crop || record.textFree !== true) throw new Error(`Invalid hybrid asset metadata: ${id}`);
    });
    return manifest;
  };

  const loadManifest = async () => {
    try {
      const response = await fetch(new URL('manifest.json', BASE), {cache: 'no-cache'});
      if (!response.ok) throw new Error(`Manifest ${response.status}`);
      return validateManifest(await response.json());
    } catch (error) {
      window.__statmlDeepLearningRendererDiagnostics = window.__statmlDeepLearningRendererDiagnostics || [];
      window.__statmlDeepLearningRendererDiagnostics.push({id: 'manifest', reason: String(error)});
      return fallbackManifest;
    }
  };

  const activeFromDOM = () => {
    const buttons = [...document.querySelectorAll('.chapter-dots button')];
    const active = buttons.findIndex(button => button.classList.contains('is-active'));
    if (active >= 0) return active;
    const meta = document.querySelector('.stage-header p')?.textContent?.match(/(\d+)/);
    return meta ? clamp(Number(meta[1]) - 1, 0, 11) : 0;
  };
  const numberFrom = (selector, fallback) => {
    const element = document.querySelector(selector);
    const value = Number(element?.value);
    return Number.isFinite(value) ? value : fallback;
  };
  const readShellState = previous => {
    const tensorButton = document.querySelector('.tensor-control button[aria-pressed="true"]');
    const architectureButton = document.querySelector('.architecture-tabs button[aria-pressed="true"] span');
    const toggle = document.querySelector('.control-panel .toggle-button[aria-pressed]');
    return {
      active: activeFromDOM(),
      biased: toggle?.getAttribute('aria-pressed') === 'true',
      tensorMode: tensorButton?.textContent?.trim().toLowerCase() || previous.tensorMode,
      earWeight: numberFrom('.sliders label:nth-of-type(1) input[type="range"]', previous.earWeight),
      furWeight: numberFrom('.sliders label:nth-of-type(2) input[type="range"]', previous.furWeight),
      backgroundWeight: numberFrom('.sliders label:nth-of-type(3) input[type="range"]', previous.backgroundWeight),
      neuronBias: numberFrom('.sliders label:nth-of-type(4) input[type="range"]', previous.neuronBias),
      learnStep: previous.learnStep,
      learningRate: numberFrom('.control-stack .range-row input', previous.learningRate),
      epoch: numberFrom('.epoch-control input', previous.epoch),
      architecture: architectureButton?.textContent?.trim().toLowerCase() || previous.architecture,
      threshold: numberFrom('.threshold-control input', previous.threshold)
    };
  };

  const baseAsset = chapter => ({
    1: 'ch01.finish-line', 2: 'ch02.dataset', 3: 'ch03.split', 4: 'ch04.image',
    5: 'ch05.neuron', 6: 'ch06.feature-ladder', 7: 'ch07.learning-loop',
    8: 'ch08.training-curve', 9: 'ch09.architecture', 10: 'ch10.transfer',
    11: 'ch11.threshold', 12: 'ch12.release'
  }[chapter]);

  const scenes = [];

  scenes.push({
    key: 'finishLine', asset: () => 'ch01.finish-line', composition: SCENE_COMPOSITION.finishLine, sentence: 'one input becomes a probability distribution',
    measure: ({width, height}) => fullLayout(width, height, {objects: {cat: {x: 44, y: 130, width: 360, height: 400}, rows: {x: 582, y: 150, width: 380, height: 380}}}),
    drawStatic: ({group}) => {
      tag(group, 'INPUT', 62, 126, BLUE, 'ch01:input');
      /* The tape on the paper is centred over the prediction card.  The old
         x=616 label landed in the blank gutter, which made it look like an
         unrelated annotation. */
      tag(group, 'PREDICTION', 704, 136, GREEN, 'ch01:prediction');
      arrow(group, 410, 327, 573, 327, BLUE, 2.4, 'ch01:predict', {echo: false, size: 11});
    },
      drawState: ({group, layout}) => {
      /* These coordinates sit inside the three blank bars in the plate.  The
         image supplies the circles, cards, tape, and paper edge. */
      const rows = [{name: 'cat', value: .89, color: BLUE, y: 240}, {name: 'dog', value: .08, color: GREEN, y: 329}, {name: 'rabbit', value: .03, color: CORAL, y: 418}];
      rows.forEach((row, index) => {
        /* The plate's class circles are the owner of these names.  Keep the
           ink centred inside each circle and leave the probability bars to
           their right unobstructed. */
        /* Keep the class name independent from the probability colour.  The
           plate circles are pale tinted fills, so neutral ink plus a small
           paper halo stays readable in every state and at mobile scale. */
        const classLabel = label(group, row.name, 624, row.y, {
          size: row.name === 'rabbit' ? 12 : 14,
          color: INK,
          halo: PAPER,
          haloWidth: 2.8,
          anchor: 'middle',
          baseline: 'middle',
          weight: 700,
          className: `deep-common-label enter${layout?.phone ? ' deep-mobile-primary' : ''}`,
          mobileCap: layout?.phone ? (row.name === 'rabbit' ? 42 : 44) : (row.name === 'rabbit' ? 31 : 34)
        });
        /* Rabbit is the longest class name and must stay inside the small
           coral circle at both artboard scales.  Constrain its measured text
           width instead of moving the centre point away from the circle. */
        if (row.name === 'rabbit') {
          classLabel.setAttribute('textLength', layout?.phone ? '44' : '38');
          classLabel.setAttribute('lengthAdjust', 'spacingAndGlyphs');
        }
        /* Leave a quiet value lane at the right of each outlined bar.  The
           previous fill ran underneath the percentage and made both appear
           outside the paper. */
        const barX = 668;
        const barWidth = layout?.phone ? 190 : 214;
        const fillWidth = barWidth * row.value;
        stroke(group, [[barX, row.y], [barX + fillWidth, row.y]], `ch01:bar:${index}`, row.color, 8, .82, {echo: false, jitter: .35, className: 'draw'});
        label(group, `${Math.round(row.value * 100)}%`, layout?.phone ? 920 : 900, row.y + 7, {size: 24, color: row.color, anchor: 'middle', utility: true, weight: 700, value: true, className: `pulse${layout?.phone ? ' deep-mobile-metric' : ''}`, mobileCap: layout?.phone ? 46 : undefined});
        if (index === 0) line(group, layout?.phone ? 958 : 930, row.y - 12, layout?.phone ? 958 : 930, row.y + 12, GREEN, 2.2, 'ch01:winner-tick', .9, {echo: false, jitter: .25, className: 'pulse'});
      });
    }
  });

  scenes.push({
    key: 'dataset', asset: () => 'ch02.dataset', composition: SCENE_COMPOSITION.dataset, sentence: 'class identity should survive changing surroundings',
    measure: ({width, height}) => fullLayout(width, height, {objects: {tiles: {x: 70, y: 25, width: 650, height: 560}, callout: {x: 750, y: 150, width: 200, height: 240}}}),
    drawStatic: ({group, layout}) => {
      tag(group, 'NINE OBSERVATIONS', 70, 622, BLUE, 'ch02:tag');
      const phone = Boolean(layout?.phone);
      const laneX = phone ? 730 : 750;
      line(group, laneX, phone ? 92 : 86, 944, phone ? 92 : 86, PENCIL, 1.2, 'ch02:right-rule', .28, {echo: true});
      /* The phone lane gets a readable two-line reminder.  Keep the desktop
         wording/coordinates intact, but reserve enough width for the larger
         mobile glyphs instead of letting the sentence clip at the edge. */
      label(group, 'same subjects,', laneX, phone ? 136 : 142, {size: 23, color: PENCIL, mobileCap: phone ? 38 : 31, className: phone ? 'deep-mobile-primary' : undefined});
      label(group, 'different context', laneX, phone ? 190 : 172, {size: 23, color: PENCIL, mobileCap: phone ? 38 : 31, className: phone ? 'deep-mobile-primary' : undefined});
    },
    drawState: ({group, state, layout}) => {
      /* One small focus cue belongs to the selected portrait.  The former
         98-unit ring crossed two neighbouring tiles and read like a second
         panel instead of a selection. */
      const centerX = 382;
      const centerY = 294;
      const focusRadius = 54;
      circle(group, centerX, centerY, focusRadius, state.biased ? CORAL : GREEN, 3, 'ch02:focus', .92);
      /* Keep every annotation in the blank right-hand lane.  The photo grid
         ends before x≈700, so leaders and text no longer sit on a portrait. */
      const phone = Boolean(layout?.phone);
      const calloutX = phone ? 730 : 750;
      const laneLeader = (color, seed) => {
        const startX = centerX + focusRadius + 12;
        const laneX = calloutX - 16;
        const bendY = 380;
        /* The middle photo ends at roughly y=372 and the bottom row starts
           near y=387.  A short orthogonal dog-leg uses that quiet seam before
           rising through the reserved right lane, so the leader never cuts
           through another portrait. */
        path(group, `M ${startX} ${centerY} L ${startX + 26} ${bendY} L ${laneX} ${bendY} L ${laneX} 252`, {stroke: color, 'stroke-width': 2.3, opacity: .9, class: 'deep-live-mark'});
        const head = 10;
        stroke(group, [[laneX - 5, 252 + head], [laneX, 252], [laneX + 5, 252 + head]], `${seed}:head`, color, 1.9, .9, {echo: false, jitter: .45});
      };
      if (state.biased) {
        if (phone) {
          label(group, 'shortcut', calloutX, 254, {size: 19, color: CORAL, utility: true, weight: 700, mobileCap: 38, className: 'pulse deep-mobile-primary'});
          label(group, 'the backdrop', calloutX, 306, {size: 19, color: CORAL, utility: true, weight: 700, mobileCap: 38, className: 'deep-mobile-primary'});
        } else {
          label(group, 'shortcut: the backdrop', calloutX, 254, {size: 19, color: CORAL, utility: true, weight: 700, mobileCap: 31, className: 'pulse'});
        }
        laneLeader(CORAL, 'ch02:leader:biased');
      } else {
        label(group, 'look for the dog', calloutX, 254, {size: 19, color: GREEN, utility: true, weight: 700, mobileCap: phone ? 38 : 31, className: `pulse${phone ? ' deep-mobile-primary' : ''}`});
        laneLeader(GREEN, 'ch02:leader:representative');
      }
      if (phone) {
        label(group, state.biased ? 'biased lens' : 'representative', calloutX, state.biased ? 372 : 342, {size: 20, color: INK, mobileCap: 36, className: 'deep-mobile-secondary'});
        if (!state.biased) label(group, 'variation', calloutX, 390, {size: 20, color: INK, mobileCap: 36, className: 'deep-mobile-secondary'});
      } else {
        label(group, state.biased ? 'biased lens' : 'representative variation', calloutX, 326, {size: 20, color: INK, mobileCap: 29});
      }
    }
  });

  scenes.push({
    key: 'split', asset: () => 'ch03.split', composition: SCENE_COMPOSITION.split, sentence: 'one dataset gets three separate jobs',
    measure: ({width, height}) => fullLayout(width, height, {objects: {source: {x: 70, y: 255, width: 250, height: 360}, roles: {x: 370, y: 34, width: 600, height: 590}}}),
    drawStatic: ({group}) => {
      tag(group, 'ONE DATASET', 68, 152, BLUE, 'ch03:source');
      /* The plate already draws the three dotted routes from the bundle.
         Repeating them as solid arrows created six competing connectors. */
    },
    drawState: ({group}) => {
      const roles = [
        /* These are the interior bounds of the three sheets in the plate,
           not generic card coordinates.  Keeping a centre and a text lane
           makes every word breathe inside its own piece of paper. */
        {name: 'train', job: 'learn weights', pct: '70%', cx: 532, titleY: 112, jobY: 150, pctY: 184, color: BLUE},
        {name: 'validate', job: 'choose / stop', pct: '15%', cx: 736, titleY: 302, jobY: 338, pctY: 373, color: GREEN},
        {name: 'test', job: 'sealed final exam', pct: '15%', cx: 606, titleY: 482, jobY: 518, pctY: 553, color: CORAL}
      ];
      roles.forEach((role, index) => {
        label(group, role.name, role.cx, role.titleY, {size: 34, color: role.color, anchor: 'middle', weight: 600, className: 'enter'});
        label(group, role.job, role.cx, role.jobY, {size: 24, color: INK, anchor: 'middle', weight: 500});
        label(group, role.pct, role.cx, role.pctY, {size: 30, color: role.color, anchor: 'middle', utility: true, weight: 700, value: true, className: 'pulse'});
        if (index === 2) {
          circle(group, role.cx + 112, role.pctY - 4, 10, GREEN, 2.4, 'ch03:seal', .9);
          label(group, 'sealed', role.cx + 130, role.pctY + 1, {size: 15, color: GREEN, utility: true, weight: 600});
        }
      });
    }
  });

  const drawTensorImage = group => {
    tag(group, 'IMAGE', 72, 138, BLUE, 'ch04:image');
    label(group, 'input image', 208, 452, {size: 23, color: INK, anchor: 'middle', weight: 500, mobileCap: 44, className: 'deep-mobile-primary'});
    arrow(group, 360, 300, 620, 300, BLUE, 2.7, 'ch04:image:bridge');
    /* The channel stack starts around x≈650.  Keep its heading in the quiet
       left gutter so it identifies the representation without sitting on a
       colour sheet. */
    label(group, 'channels', 570, 132, {size: 24, color: BLUE, anchor: 'middle', weight: 600, mobileCap: 44, className: 'deep-mobile-primary'});
    ['red', 'green', 'blue'].forEach((name, index) => {
      const y = 178 + index * 144;
      label(group, name, 770, y, {size: 23, color: [CORAL, GREEN, BLUE][index], anchor: 'middle', weight: 600, mobileCap: 44, className: 'deep-mobile-primary'});
    });
    /* This dimensional cue belongs below the input image, not underneath
       the stacked channel cards.  The baseline lands at y≈532 in the
       requested x≈110–150 left gutter. */
    note(group, 'height × width × colour', 130, 505, 330, {size: 19, seed: 'ch04:image:note', mobileCap: 29});
  };
  const drawTensorText = group => {
    tag(group, 'TEXT', 76, 138, LAVENDER, 'ch04:text');
    const tokens = ['the', 'small', 'dog', 'runs', 'home'];
    const tokenX = [134, 304, 468, 636, 842];
    tokens.forEach((token, index) => {
      const x = tokenX[index];
      if (index === 2) highlighter(group, x - 38, 184, 76, 32, LAVENDER, 'ch04:text:selected', .24);
      label(group, token, x, 222, {size: 25, color: INK, anchor: 'middle', weight: 600, className: index === 2 ? 'pulse' : undefined});
      label(group, `id ${index + 1}`, x, 258, {size: 18, color: LAVENDER, anchor: 'middle', utility: true, weight: 600});
    });
    arrow(group, 470, 350, 510, 430, LAVENDER, 2.5, 'ch04:text:bridge');
    label(group, 'one token → vector', 540, 468, {size: 23, color: LAVENDER, weight: 650});
    note(group, 'order stays visible', 280, 548, 310, {size: 20, textColor: INK, color: LAVENDER, seed: 'ch04:text:note'});
  };
  const drawTensorAudio = group => {
    tag(group, 'AUDIO', 72, 138, AMBER, 'ch04:audio');
    label(group, 'samples', 160, 270, {size: 23, color: BLUE, anchor: 'middle', weight: 600});
    arrow(group, 520, 335, 640, 335, AMBER, 2.7, 'ch04:audio:bridge');
    label(group, 'time × frequency', 800, 270, {size: 23, color: LAVENDER, anchor: 'middle', weight: 600});
    /* The plate already contains the waveform window and spectrogram patch;
       do not redraw either of them in the live layer. */
    note(group, 'a short window becomes a patch', 614, 520, 340, {size: 18, seed: 'ch04:audio:note'});
  };
  scenes.push({
    key: 'tensor', asset: state => `ch04.${state.tensorMode}`, composition: SCENE_COMPOSITION.tensor, sentence: 'examples become tensors without losing structure',
    measure: ({width, height}) => fullLayout(width, height, {objects: {source: {x: 45, y: 110, width: 470, height: 410}, representation: {x: 600, y: 100, width: 350, height: 430}}}),
    drawStatic: ({group}) => {
      line(group, 54, 600, 946, 600, PENCIL, 1.1, 'ch04:lower-rule', .27, {echo: true});
      label(group, 'choose one representation', 660, 622, {size: 17, color: PENCIL, utility: true});
    },
    drawState: ({group, state}) => {
      if (state.tensorMode === 'text') drawTensorText(group);
      else if (state.tensorMode === 'audio') drawTensorAudio(group);
      else drawTensorImage(group);
    }
  });

  scenes.push({
    key: 'neuron', asset: () => 'ch05.neuron', composition: SCENE_COMPOSITION.neuron, sentence: 'weighted evidence meets a sum and an activation',
    measure: ({width, height}) => fullLayout(width, height, {objects: {inputs: {x: 50, y: 100, width: 360, height: 500}, node: {x: 420, y: 170, width: 260, height: 330}, output: {x: 700, y: 245, width: 260, height: 200}}}),
    drawStatic: ({group}) => {
      tag(group, 'EVIDENCE', 72, 142, BLUE, 'ch05:evidence');
      tag(group, 'ONE NEURON', 428, 124, LAVENDER, 'ch05:neuron');
      tag(group, 'ACTIVATION', 730, 244, GREEN, 'ch05:activation');
    },
    drawState: ({group, state}) => {
      const inputs = [
        {name: 'ear shape', value: state.earWeight, y: 198, color: BLUE},
        {name: 'fur texture', value: state.furWeight, y: 287, color: GREEN},
        {name: 'background', value: state.backgroundWeight, y: 376, color: CORAL},
        {name: 'bias', value: state.neuronBias, y: 465, color: AMBER}
      ];
      const nodeX = 504;
      inputs.forEach((input, index) => {
        const strength = clamp(Math.abs(input.value) / 2, .08, 1);
        line(group, 300, input.y, nodeX - 62, 348, input.color, 1.25 + strength * 3.1, `ch05:wire:${index}`, .82, {echo: false, className: 'draw'});
        label(group, input.name, 118, input.y + 7, {size: 20, color: INK});
        label(group, input.value.toFixed(1), 278, input.y + 7, {size: 20, color: input.color, anchor: 'end', utility: true, weight: 700, value: true, className: 'pulse'});
      });
      const z = state.earWeight * .8 + state.furWeight * .5 + state.backgroundWeight * .35 + state.neuronBias;
      const relu = Math.max(0, z);
      const output = (relu / 3.1).toFixed(2);
      label(group, 'Σ', nodeX, 350, {size: 36, color: LAVENDER, anchor: 'middle', utility: true, weight: 700, className: 'enter'});
      label(group, z.toFixed(2), nodeX, 387, {size: 21, color: INK, anchor: 'middle', utility: true, value: true, className: 'pulse'});
      arrow(group, 568, 348, 688, 348, LAVENDER, 2.4, 'ch05:relu', {echo: false, size: 11});
      label(group, `ReLU → ${output}`, 710, 356, {size: 22, color: relu > 0 ? GREEN : CORAL, value: true, className: 'pulse'});
    }
  });

  scenes.push({
    key: 'featureDepth', asset: () => 'ch06.feature-ladder', composition: SCENE_COMPOSITION.featureDepth, sentence: 'deeper layers turn marks into useful features',
    measure: ({width, height}) => fullLayout(width, height, {objects: {ladder: {x: 40, y: 120, width: 930, height: 420}, result: {x: 360, y: 560, width: 300, height: 60}}}),
    drawStatic: ({group}) => {
      tag(group, 'A SIGNAL GETS RICHER', 68, 150, BLUE, 'ch06:tag');
      const arrows = [[242, 330, 292, 330], [478, 330, 528, 330], [712, 330, 762, 330]];
      arrows.forEach((coords, index) => arrow(group, ...coords, BLUE, 2.6, `ch06:arrow:${index}`));
    },
    drawState: ({group}) => {
      const layers = [
        /* The four sheets occupy the upper half of the plate.  The old
           captions sat underneath them in a low-contrast strip, so the
           learner had to guess which sheet each word described. */
        ['pixels', 138, 246, PENCIL], ['edges', 381, 246, BLUE], ['texture', 615, 246, AMBER], ['parts', 853, 246, GREEN]
      ];
      layers.forEach(([name, x, y, color], index) => {
        label(group, name, x, y, {size: 24, color, anchor: 'middle', weight: 600, className: index === 3 ? 'pulse' : undefined});
      });
      circle(group, 853, 290, 34, GREEN, 2.2, 'ch06:class-ring', .8);
      label(group, 'DOG', 853, 298, {size: 22, color: GREEN, anchor: 'middle', utility: true, weight: 700});
      label(group, 'class signal', 853, 338, {size: 18, color: GREEN, utility: true, anchor: 'middle', weight: 600});
    }
  });

  scenes.push({
    key: 'learningLoop', asset: () => 'ch07.learning-loop', composition: SCENE_COMPOSITION.learningLoop, sentence: 'a batch moves forward, measures loss, and updates weights',
    measure: ({width, height}) => fullLayout(width, height, {objects: {loop: {x: 70, y: 70, width: 860, height: 520}, center: {x: 360, y: 220, width: 280, height: 230}}}),
    drawStatic: ({group}) => {
      /* Keep the chapter cue in the quiet margin above the forward sheet;
         sharing a baseline with “forward” made the phrases collide at
         narrow sizes. */
      tag(group, 'ONE STEP AT A TIME', 70, 94, BLUE, 'ch07:tag');
      // The plate supplies the four colored paper scraps.  Route arrows stop
      // at each paper edge so they never cut through a label or the centre
      // error circle.
      const route = [
        [318, 151, 690, 156],
        [827, 278, 827, 410],
        [690, 529, 310, 510],
        [164, 394, 164, 266]
      ];
      const routeColors = [BLUE, CORAL, AMBER, LAVENDER];
      route.forEach(([x1, y1, x2, y2], index) => {
        const length = Math.hypot(x2 - x1, y2 - y1) || 1;
        const ux = (x2 - x1) / length;
        const uy = (y2 - y1) / length;
        arrow(group, x1 + ux * 8, y1 + uy * 8, x2 - ux * 8, y2 - uy * 8, routeColors[index], 2.8, `ch07:loop-route:${index}`, {echo: true, opacity: .88, size: 15});
      });
    },
    drawState: ({group, state, previousState}) => {
      const rate = clamp(state.learningRate, .1, 1);
      const loss = Math.max(.06, 1.15 - (state.learnStep - 1) * .095 * rate);
      const nodes = [
        {name: 'forward', detail: 'make a guess', x: 164, y: 138, detailY: 176, color: BLUE},
        {name: 'loss', detail: loss.toFixed(2), x: 827, y: 142, detailY: 180, color: CORAL},
        {name: 'backprop', detail: 'send blame', x: 827, y: 508, detailY: 546, color: AMBER},
        {name: 'update', detail: `step ${state.learnStep}`, x: 164, y: 491, detailY: 529, color: LAVENDER}
      ];
      nodes.forEach(item => {
        label(group, item.name, item.x, item.y, {size: 30, color: item.color, anchor: 'middle', weight: 600, className: 'enter'});
        label(group, item.detail, item.x, item.detailY, {size: 23, color: INK, anchor: 'middle', utility: true, weight: 500, value: item.name === 'loss'});
      });
      label(group, `error ${loss.toFixed(2)}`, 508, 338, {size: 24, color: CORAL, anchor: 'middle', value: true, className: 'pulse'});
      label(group, `rate ${rate.toFixed(1)}`, 508, 370, {size: 18, color: PENCIL, anchor: 'middle', utility: true, value: true});
      /* The marker is deliberately absent at the initial state.  The shell's
         Run button increments learnStep; only then does a single marker
         appear at a deterministic route node. */
      if (state.learnStep > DEFAULT_STATE.learnStep) {
        const route = [[500, 153], [827, 342], [500, 519], [164, 342]];
        /* Step 4 is the first completed edge: the marker travels from
           forward to loss.  Subsequent clicks advance one edge around the
           same four-node loop. */
        const markerIndex = (state.learnStep - DEFAULT_STATE.learnStep) % route.length;
        const previousIndex = (markerIndex + route.length - 1) % route.length;
        const [markerX, markerY] = route[markerIndex];
        const stepChanged = Boolean(previousState && state.learnStep !== previousState.learnStep);
        const marker = circle(group, markerX, markerY, 10, GREEN, 2.5, 'ch07:marker', .95, 'none', {className: stepChanged ? 'pulse travel' : 'pulse'});
        if (stepChanged) {
          const [fromX, fromY] = route[previousIndex];
          marker.setAttribute('data-motion-from-x', String(fromX));
          marker.setAttribute('data-motion-from-y', String(fromY));
          marker.setAttribute('data-motion-to-x', String(markerX));
          marker.setAttribute('data-motion-to-y', String(markerY));
        }
      }
    }
  });

  scenes.push({
    key: 'trainingCurve', asset: () => 'ch08.training-curve', composition: SCENE_COMPOSITION.trainingCurve, sentence: 'validation loss tells us when to keep the checkpoint',
    measure: ({width, height}) => fullLayout(width, height, {objects: {plot: {x: 148, y: 124, width: 730, height: 445}, legend: {x: 700, y: 40, width: 250, height: 70}}}),
    drawStatic: ({group}) => {
      tag(group, 'LOSS OVER TIME', 74, 116, BLUE, 'ch08:tag');
      label(group, 'loss', 118, 182, {size: 19, color: PENCIL, utility: true, anchor: 'middle'});
      label(group, 'epoch', 860, 575, {size: 19, color: PENCIL, utility: true});
    },
    drawState: ({group, state}) => {
      const pointsTrain = [];
      const pointsValid = [];
      for (let epoch = 1; epoch <= 24; epoch += 1) {
        const x = 148 + ((epoch - 1) / 23) * 742;
        /* Both curves improve while the model learns.  At the best
           checkpoint the validation curve turns upward first; the training
           curve also turns gently upward so the learner can see the intended
           overfit story instead of two lines drifting in the same direction. */
        const train = epoch <= 13
          ? .90 - epoch * .032 + Math.sin(epoch * .6) * .010
          : .90 - 13 * .032 + (epoch - 13) * .020 + Math.sin(epoch * .6) * .010;
        const valid = epoch <= 13
          ? .96 - epoch * .045 + Math.sin(epoch * .8) * .012
          : .96 - 13 * .045 + (epoch - 13) * .060 + Math.sin(epoch * .8) * .012;
        /* SVG y grows downward, while a loss chart grows upward.  Invert the
           value-to-pixel mapping so a falling loss travels toward the bottom
           of the graph and the post-checkpoint rise is immediately legible. */
        pointsTrain.push([x, 520 - train * 330]);
        pointsValid.push([x, 520 - valid * 330]);
      }
      stroke(group, pointsTrain.slice(0, state.epoch), 'ch08:train', BLUE, 3.1, .9, {echo: false, jitter: .35, className: 'draw'});
      stroke(group, pointsValid.slice(0, state.epoch), 'ch08:valid', CORAL, 3.1, .9, {echo: false, jitter: .35, className: 'draw'});
      const bestEpoch = 13;
      const bestX = 148 + ((bestEpoch - 1) / 23) * 742;
      line(group, bestX, 144, bestX, 548, GREEN, 2.1, 'ch08:checkpoint', .82, {echo: true});
      label(group, 'best checkpoint', bestX + 12, 170, {size: 20, color: GREEN, className: 'enter'});
      const epochX = 148 + ((state.epoch - 1) / 23) * 742;
      circle(group, epochX, pointsValid[state.epoch - 1]?.[1] || 300, 11, AMBER, 2.6, 'ch08:epoch-marker', .95);
      label(group, `epoch ${state.epoch}`, epochX > 730 ? epochX - 10 : epochX + 15, 610, {size: 20, color: AMBER, anchor: epochX > 730 ? 'end' : 'start', utility: true, weight: 700, value: true, className: 'pulse'});
      line(group, 690, 80, 724, 80, BLUE, 4, 'ch08:legend:train', .9, {echo: true});
      label(group, 'training', 734, 86, {size: 18, color: BLUE, utility: true});
      line(group, 830, 80, 864, 80, CORAL, 4, 'ch08:legend:valid', .9, {echo: true});
      label(group, 'validation', 874, 86, {size: 18, color: CORAL, utility: true});
      if (state.epoch < 7) tag(group, 'UNDERFIT', 740, 510, AMBER, 'ch08:under');
      else if (state.epoch < 18) tag(group, 'USEFUL FIT', 740, 510, GREEN, 'ch08:useful');
      else tag(group, 'OVERFIT', 740, 510, CORAL, 'ch08:over');
    }
  });

  scenes.push({
    key: 'architecture', asset: state => state.architecture === 'rnn' ? 'ch09.rnn' : state.architecture === 'transformer' ? 'ch09.transformer' : 'ch09.architecture', composition: SCENE_COMPOSITION.architecture, sentence: 'architecture changes which relationships are cheap to learn',
    measure: ({width, height}) => fullLayout(width, height, {objects: {branch: {x: 45, y: 70, width: 910, height: 535}}}),
    drawStatic: ({group, state}) => {
      tag(group, state.architecture.toUpperCase(), 62, 120, state.architecture === 'cnn' ? BLUE : state.architecture === 'rnn' ? LAVENDER : CORAL, `ch09:${state.architecture}:tag`);
    },
    drawState: ({group, state, layout}) => {
      if (state.architecture === 'cnn') {
        /* The plate has four loose colour strips and three loose squares from
           an earlier sketch.  Clip a clean sample of the same ruled-paper
           plate over each residue.  Reusing the plate texture keeps the
           cleanup invisible instead of introducing a conspicuous blank panel;
           the input card, filter circles, and feature-map stack remain
           untouched. */
        /* Cover only the disconnected strips/squares, with no blur or
           contrast shift.  The previous soft masks left seven pale ghost
           cards; these exact paper-safe polygons end at the feature-card and
           input-card edges while leaving that pipeline untouched. */
        const erasePatches = [
          ['M 650 368 L 792 365 L 801 472 L 638 478 Z', 'output:blue'],
          ['M 799 348 L 978 352 L 985 462 L 801 468 Z', 'output:coral'],
          ['M 666 400 L 839 405 L 847 538 L 658 544 Z', 'output:green'],
          ['M 799 436 L 979 442 L 986 549 L 801 544 Z', 'output:lavender'],
          ['M 68 394 L 205 400 L 212 550 L 67 545 Z', 'input:one'],
          ['M 145 428 L 285 416 L 293 584 L 149 590 Z', 'input:two'],
          ['M 220 394 L 360 388 L 371 562 L 225 571 Z', 'input:three']
        ];
        erasePatches.forEach(([d, seed]) => node('path', {
          d,
          /* The raster's paper is the warmer #fbefdf in these lower lanes;
             matching that substrate keeps the cleanup invisible at desktop
             and phone scale. */
          fill: '#fbefdf',
          opacity: 1,
          class: `ch09-cnn-strip-mask ch09-cnn-${seed.replace(':', '-')}`
        }, group));
        /* The loose marks carry soft shadows outside their drawn outlines.
           Two quiet lower-lane washes catch those antialiased fringes in one
           pass; they begin below the input card/feature cards and never cross
           the filter-bank pipeline. */
        filledRect(group, 48, 424, 348, 214, '#fbefdf', {class: 'ch09-cnn-clean-band ch09-cnn-clean-input'});
        filledRect(group, 616, 354, 378, 244, '#fbefdf', {class: 'ch09-cnn-clean-band ch09-cnn-clean-output'});
        label(group, 'local pixels', 112, 168, {size: 22, color: BLUE, mobileCap: 44, className: 'deep-mobile-primary'});
        /* The plate already contains the picture/grid, three filter circles,
           the feature-map cards, and the coloured swatches.  One small live
           scan window is enough to show what moves through that substrate. */
        const scanX = 188 + ((state.learnStep % 3) * 42);
        roughBox(group, scanX, 198, 52, 58, 'ch09:cnn:scan', CORAL, 'none', .86, 1.9);
        arrow(group, 332, 286, 440, 286, BLUE, 2.5, 'ch09:cnn:bridge', {echo: false, size: 11});
        label(group, 'filter bank', 500, 236, {size: 23, color: BLUE, anchor: 'middle', mobileCap: 44, className: 'deep-mobile-primary'});
        label(group, 'feature map', 820, 178, {size: 22, color: GREEN, anchor: 'middle', mobileCap: 44, className: 'deep-mobile-primary'});
      } else if (state.architecture === 'rnn') {
        label(group, 'one state carried forward', 260, 158, {size: 23, color: LAVENDER});
        const xs = [190, 400, 610];
        xs.forEach((x, index) => {
          label(group, `h${index + 1}`, x, 306, {size: 28, color: LAVENDER, anchor: 'middle', utility: true, weight: 700, className: index === 2 ? 'pulse' : undefined});
          label(group, ['the', 'dog', 'runs'][index], x, 458, {size: 24, color: INK, anchor: 'middle', weight: 500});
        });
        arrow(group, 700, 306, 770, 306, CORAL, 2.2, 'ch09:rnn:predict', {echo: false, size: 10});
        label(group, 'next-word scores', 845, 286, {size: 20, color: CORAL, anchor: 'middle', weight: 600});
        label(group, 'ball 67%', 845, 315, {size: 19, color: GREEN, anchor: 'middle', utility: true, weight: 700, value: true});
        label(group, 'cat 18%', 845, 338, {size: 18, color: PENCIL, anchor: 'middle', utility: true});
        label(group, 'home 9%', 845, 361, {size: 18, color: PENCIL, anchor: 'middle', utility: true});
        note(group, 'memory is compressed, not copied', 260, 566, 420, {size: 17, seed: 'ch09:rnn:note'});
      } else {
        label(group, 'select useful relationships', 86, 158, {size: 23, color: CORAL});
        const tokens = ['the', 'animal', 'did', 'not', 'cross'];
        const tokenX = [120, 270, 420, 570, 720];
        tokens.forEach((token, index) => {
          const x = tokenX[index];
          label(group, token, x, 458, {size: 23, color: INK, anchor: 'middle', weight: 500, className: index === 1 ? 'pulse' : undefined});
          label(group, 'K', x, 500, {size: 17, color: BLUE, anchor: 'middle', utility: true, weight: 700});
        });
        label(group, 'Q', 842, 120, {size: 21, color: CORAL, anchor: 'middle', utility: true, weight: 700});
        label(group, 'K', 842, 214, {size: 21, color: BLUE, anchor: 'middle', utility: true, weight: 700});
        label(group, 'V', 842, 308, {size: 21, color: GREEN, anchor: 'middle', utility: true, weight: 700});
        [[1, 0, .9], [1, 4, .55], [3, 2, .35]].forEach(([from, to, strength], index) => { const x1 = tokenX[from]; const x2 = tokenX[to]; path(group, `M ${x1} 432 C ${x1} ${278 + index * 24}, ${x2} ${278 + index * 24}, ${x2} 432`, {stroke: index === 0 ? CORAL : BLUE, 'stroke-width': 2 + strength * 4, opacity: .72, class: 'deep-live-mark draw'}); });
        arrow(group, 730, 500, 780, 535, GREEN, 2.4, 'ch09:transformer:context');
        label(group, 'context handoff', 692, 566, {size: 21, color: GREEN});
        note(group, 'attention links stay sparse', 250, 592, 360, {size: 18, seed: 'ch09:transformer:note'});
      }
    }
  });

  scenes.push({
    key: 'transfer', asset: () => 'ch10.transfer', composition: SCENE_COMPOSITION.transfer, sentence: 'a frozen general backbone feeds a small trainable head',
    measure: ({width, height}) => fullLayout(width, height, {objects: {backbone: {x: 48, y: 190, width: 520, height: 360}, head: {x: 650, y: 240, width: 290, height: 260}}}),
    drawStatic: ({group}) => {
      tag(group, 'PRETRAINED', 68, 152, LAVENDER, 'ch10:pretrained');
      tag(group, 'NEW TASK', 730, 246, CORAL, 'ch10:new-task');
      arrow(group, 566, 345, 678, 345, BLUE, 3, 'ch10:handoff');
    },
    drawState: ({group}) => {
      const featureX = [176, 288, 401];
      ['edges', 'textures', 'curves', 'parts', 'shapes', 'colour'].forEach((name, index) => {
        const x = featureX[index % 3];
        const y = 258 + Math.floor(index / 3) * 118;
        label(group, name, x, y, {size: 20, color: [BLUE, GREEN, AMBER, LAVENDER, CORAL, BLUE][index], anchor: 'middle', weight: 500, className: index === 1 ? 'pulse' : undefined});
      });
      circle(group, 510, 414, 16, GREEN, 2.2, 'ch10:lock', .85);
      label(group, 'frozen', 510, 448, {size: 19, color: LAVENDER, utility: true, anchor: 'middle', weight: 600});
      ['cat', 'dog', 'rabbit'].forEach((name, index) => { label(group, name, 808, 300 + index * 42, {size: 23, color: index === 1 ? GREEN : CORAL, anchor: 'middle', weight: 600, className: index === 1 ? 'pulse' : undefined}); });
      note(group, 'fine-tune only if validation asks for it', 270, 548, 470, {size: 17, seed: 'ch10:note'});
    }
  });

  scenes.push({
    key: 'threshold', asset: () => 'ch11.threshold', composition: SCENE_COMPOSITION.threshold, sentence: 'the threshold changes which mistakes we accept',
    measure: ({width, height}) => fullLayout(width, height, {objects: {matrix: {x: 100, y: 120, width: 500, height: 430}, metrics: {x: 650, y: 120, width: 300, height: 430}}}),
    drawStatic: ({group}) => {
      tag(group, 'ACTUAL × PREDICTED', 72, 78, BLUE, 'ch11:tag');
    },
    drawState: ({group, state}) => {
      const threshold = clamp(state.threshold, .1, .9);
      const matrix = [[18, 3, 1], [4, 15, 2], [1, 3, 17]];
      const x0 = 104; const y0 = 120; const cw = 154; const ch = 145;
      /* The generated tape crosses the old header lane.  Put all column
         labels on one quiet line just under its lower edge, before the
         matrix's coloured marks begin. */
      ['cat', 'dog', 'rabbit'].forEach((name, index) => { label(group, name, x0 + index * cw + cw / 2, 96, {size: 17, color: PENCIL, anchor: 'middle', baseline: 'middle', className: 'enter', weight: 600}); label(group, name, 92, y0 + index * ch + ch / 2 + 7, {size: 18, color: PENCIL, anchor: 'end', weight: 600}); });
      matrix.forEach((row, r) => row.forEach((value, c) => {
        const correct = r === c;
        label(group, String(value + (correct ? Math.round((threshold - .5) * 4) : 0)), x0 + c * cw + cw / 2, y0 + r * ch + ch / 2 + 9, {size: 25, color: correct ? GREEN : CORAL, anchor: 'middle', utility: true, weight: 700, value: true, className: correct ? 'pulse' : undefined});
      }));
      tag(group, 'THRESHOLD', 716, 236, BLUE, 'ch11:threshold');
      line(group, 716, 274, 864, 274, BLUE, 2.4, 'ch11:rail', .74, {echo: false, jitter: .35, className: 'draw'});
      const knobX = 724 + ((threshold - .1) / .8) * 132;
      circle(group, knobX, 274, 13, AMBER, 2.8, 'ch11:knob', .95);
      label(group, threshold.toFixed(2), knobX, 312, {size: 23, color: AMBER, anchor: 'middle', utility: true, weight: 700, value: true, className: 'pulse'});
      const recall = Math.round(97 - threshold * 48);
      const precision = Math.round(52 + threshold * 45);
      label(group, `recall ${recall}%`, 792, 350, {size: 21, color: CORAL, anchor: 'middle', utility: true, weight: 700, value: true, className: 'pulse'});
      label(group, `precision ${precision}%`, 792, 378, {size: 21, color: GREEN, anchor: 'middle', utility: true, weight: 700, value: true, className: 'pulse'});
      note(group, 'fewer alarms · more misses', 654, 508, 290, {size: 17, seed: 'ch11:tradeoff'});
    }
  });

  scenes.push({
    key: 'release', asset: () => 'ch12.release', composition: SCENE_COMPOSITION.release, sentence: 'a deployable model is a versioned route from input to answer',
    measure: ({width, height}) => fullLayout(width, height, {objects: {manifest: {x: 45, y: 100, width: 430, height: 450}, route: {x: 580, y: 100, width: 360, height: 480}}}),
    drawStatic: ({group, layout}) => {
      if (layout.phone) {
        /* The desktop plate is intentionally left as a visual reference, but
           its left stack and right runtime card cannot provide three readable
           phone zones.  A paper wash plus three bounded sheets gives mobile a
           real manifest → route → runtime reading order. */
        cleanBoard(group, 'ch12:phone-board');
        paperCard(group, 58, 40, 884, 210, 'ch12:phone:manifest', LAVENDER, '#fffaf0', .97);
        paperCard(group, 58, 260, 884, 284, 'ch12:phone:route', BLUE, '#fffaf0', .97);
        paperCard(group, 58, 552, 884, 106, 'ch12:phone:runtime', AMBER, '#fffaf0', .97);
        tag(group, 'MANIFEST', 88, 64, LAVENDER, 'ch12:phone:manifest-tag');
        tag(group, 'ROUTE', 88, 286, BLUE, 'ch12:phone:route-tag');
        tag(group, 'RUNTIME', 88, 576, AMBER, 'ch12:phone:runtime-tag');
        line(group, 220, 320, 220, 518, PENCIL, 2.1, 'ch12:phone:spine', .66, {echo: true});
        return;
      }
      /* Desktop keeps the three zones explicit: the manifest ends before
         x≈475, the route owns the centre lane, and runtime starts at x≈790. */
      /* The raster card has a tape strip and a green seal baked into its
         underdrawing.  Put one clean paper face over that front sheet so the
         live manifest has a quiet title safe-area and the seal cannot sit on
         top of class labels.  The coloured tabs and paper stack stay visible
         behind the new face. */
      const manifestFace = node('g', {class: 'ch12-manifest-face'}, group);
      paperCard(manifestFace, 70, 112, 350, 390, 'ch12:manifest:face', PENCIL, '#fffaf0', .99);
      filledRect(manifestFace, 82, 122, 320, 54, '#fffaf0', {opacity: .995, class: 'ch12-manifest-title-safe'});
      tag(manifestFace, 'RELEASE BUNDLE', 98, 154, LAVENDER, 'ch12:bundle');
      tag(group, 'ROUTE', 520, 130, BLUE, 'ch12:route-tag');
      label(group, 'one tested route', 600, 160, {size: 21, color: BLUE, anchor: 'middle'});
      line(group, 500, 112, 500, 558, PENCIL, .9, 'ch12:manifest-separator', .14, {echo: false, jitter: .4});
      line(group, 772, 112, 772, 558, PENCIL, .9, 'ch12:runtime-separator', .14, {echo: false, jitter: .4});
      line(group, 590, 198, 590, 506, PENCIL, 2.2, 'ch12:spine', .72, {echo: true});
    },
    drawState: ({group, layout}) => {
      if (layout.phone) {
        const items = [
          ['weights', 'learned', 104, 112],
          ['preprocessing', 'same transform', 508, 112],
          /* Keep the lower manifest row inside its sheet.  The original
             spacing put the detail text and divider through the card edge
             at phone scale; this tighter rhythm leaves a quiet lower lane. */
          ['class order', 'cat · dog · rabbit', 104, 184],
          ['threshold', '0.50', 508, 184]
        ];
        items.forEach(([name, detail, x, y], index) => {
          label(group, name, x, y, {size: 21, color: INK, mobileCap: 42, className: 'deep-mobile-primary'});
          label(group, detail, x, y + 44, {size: 16, color: PENCIL, mobileCap: 34, className: 'deep-mobile-secondary'});
          if (index < items.length - 2) line(group, x - 2, y + 56, x + 340, y + 56, PENCIL, 1, `ch12:phone:item:${index}`, .3, {echo: false, jitter: .3});
        });
        const route = [
          {name: 'validate', sub: 'shape / type', y: 334, color: GREEN},
          {name: 'prepare', sub: 'same recipe', y: 396, color: AMBER},
          {name: 'predict', sub: 'no gradients', y: 458, color: BLUE},
          {name: 'decode', sub: 'class order', y: 520, color: CORAL}
        ];
        route.forEach((item, index) => {
          circle(group, 220, item.y, 24, item.color, 2.2, `ch12:phone:route:${index}`, .92);
          label(group, String(index + 1), 220, item.y + 7, {size: 16, color: item.color, anchor: 'middle', utility: true, weight: 700, mobileCap: 44, semantic: 'route-step'});
          label(group, item.name, 264, item.y + 4, {size: 22, color: item.color, mobileCap: 44, className: 'deep-mobile-primary'});
          /* On a phone the supporting phrase shares the route row.  This
             keeps the larger route names and step numbers on a clean
             baseline without squeezing four name/detail pairs vertically. */
          label(group, item.sub, 500, item.y + 4, {size: 16, color: PENCIL, mobileCap: 34, semantic: 'route-sub', className: 'deep-mobile-secondary'});
        });
        label(group, 'monitor drift', 110, 610, {size: 20, color: INK, mobileCap: 38, className: 'deep-mobile-secondary'});
        label(group, 'log failures', 350, 610, {size: 20, color: INK, mobileCap: 38, className: 'deep-mobile-secondary'});
        line(group, 110, 626, 890, 626, PENCIL, 1, 'ch12:phone:ops-rule', .36, {echo: false, jitter: .25, className: 'ch12-ops-rule'});
        label(group, 'latency · memory · privacy · failures', 110, 648, {size: 16, color: INK, utility: true, mobileCap: 34, className: 'deep-mobile-secondary ch12-ops-caption'});
        return;
      }
      const items = [['weights', 'learned'], ['preprocessing', 'same transform'], ['class order', 'cat · dog · rabbit'], ['threshold', '0.50']];
      items.forEach(([name, detail], index) => {
        const y = 216 + index * 72;
        label(group, name, 102, y, {size: 22, color: INK, className: 'ch12-manifest-name'});
        label(group, detail, 102, y + 28, {size: 17, color: PENCIL, className: 'ch12-manifest-detail'});
        if (index < items.length - 1) line(group, 100, y + 44, 410, y + 44, PENCIL, 1.1, `ch12:item:${index}`, .35, {echo: true, className: 'ch12-manifest-divider'});
      });
      const route = [
        {name: 'validate', sub: 'shape / type', y: 214, color: GREEN},
        {name: 'prepare', sub: 'same recipe', y: 304, color: AMBER},
        {name: 'predict', sub: 'no gradients', y: 394, color: BLUE},
        {name: 'decode', sub: 'class order', y: 484, color: CORAL}
      ];
      route.forEach((item, index) => {
        circle(group, 590, item.y, 23, item.color, 2.4, `ch12:route:${index}`, .92);
        label(group, String(index + 1), 590, item.y + 7, {size: 20, color: item.color, anchor: 'middle', utility: true, weight: 700, className: 'ch12-route-number'});
        label(group, item.name, 635, item.y + 5, {size: 24, color: item.color, className: 'ch12-route-name'});
        label(group, item.sub, 635, item.y + 31, {size: 17, color: PENCIL, className: 'ch12-route-detail'});
      });
      tag(group, 'RUNTIME', 806, 166, AMBER, 'ch12:runtime');
      label(group, 'monitor drift', 794, 212, {size: 19, color: INK});
      label(group, 'log failures', 794, 246, {size: 19, color: INK});
      /* Keep the operational caption in the route lane.  An unboxed footer
         avoids crossing the runtime separator while still giving the caption
         a deliberate rule and label beneath the final route detail. */
      const opsFooter = node('g', {class: 'ch12-ops-footer'}, group);
      line(opsFooter, 512, 538, 760, 538, PENCIL, 1, 'ch12:ops-rule', .42, {echo: false, jitter: .25, className: 'ch12-ops-rule'});
      tag(opsFooter, 'OPS', 520, 558, AMBER, 'ch12:ops-tag');
      label(opsFooter, 'latency · memory · privacy · failures', 636, 584, {size: 15, color: INK, anchor: 'middle', utility: true, weight: 600, className: 'ch12-ops-caption'});
    }
  });

  const prefersReducedMotion = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

  const decorateMotionLayer = (layer, {controlsOnly = false} = {}) => {
    const elements = [...layer.querySelectorAll('path, text, circle, rect, polyline, polygon')];
    elements.forEach((element, index) => {
      const classes = element.getAttribute('class') || '';
      const classList = classes.split(/\s+/);
      const kind = classList.includes('travel')
        ? 'travel'
        : classList.includes('pulse')
        ? 'pulse'
        : classList.includes('value') || element.tagName.toLowerCase() === 'text'
          ? 'enter'
          : 'draw';
      element.setAttribute('data-motion', kind);
      const active = !controlsOnly || classList.some(className => ['draw', 'pulse', 'travel', 'value'].includes(className));
      element.setAttribute('data-motion-active', active ? 'true' : 'false');
      element.style.setProperty('--deep-motion-delay', `${Math.min(index * 9, 126)}ms`);
    });
    return elements;
  };

  const travelTransform = (host, element) => {
    const fromX = Number.parseFloat(element.getAttribute('data-motion-from-x'));
    const fromY = Number.parseFloat(element.getAttribute('data-motion-from-y'));
    const toX = Number.parseFloat(element.getAttribute('data-motion-to-x'));
    const toY = Number.parseFloat(element.getAttribute('data-motion-to-y'));
    const rect = host.live.getBoundingClientRect();
    const viewBox = host.live.viewBox?.baseVal;
    const scaleX = viewBox?.width ? rect.width / viewBox.width : 1;
    const scaleY = viewBox?.height ? rect.height / viewBox.height : 1;
    const dx = Number.isFinite(fromX) && Number.isFinite(toX) ? (fromX - toX) * scaleX : 0;
    const dy = Number.isFinite(fromY) && Number.isFinite(toY) ? (fromY - toY) * scaleY : 0;
    return `translate(${round(dx, 3)}px, ${round(dy, 3)}px)`;
  };

  const settleMotion = host => {
    const layer = host.stateLayer;
    layer.querySelectorAll('path[data-motion="draw"]').forEach(element => {
      element.removeAttribute('stroke-dasharray');
      element.removeAttribute('stroke-dashoffset');
    });
    layer.querySelectorAll('[data-motion="travel"]').forEach(element => element.style.removeProperty('--deep-motion-from-transform'));
    layer.classList.remove('deep-motion-pending', 'deep-motion-run');
    layer.classList.add('deep-motion-settled');
    host.motion.animations.forEach(animation => {
      try { animation.cancel(); } catch {}
    });
    host.motion.animations.clear();
    if (host.motion.endListener) {
      layer.removeEventListener('animationend', host.motion.endListener);
      host.motion.endListener = null;
    }
    host.motion.active = false;
    host.motion.finish = null;
  };

  const stopMotion = (host, reason = 'stop') => {
    if (!host?.motion) return;
    host.motion.id += 1;
    host.motion.reason = reason;
    settleMotion(host);
  };

  const startMotion = (host, reason) => {
    if (!host?.motion || !reason || !host.motion.visible || host.motion.reduced || prefersReducedMotion()) {
      settleMotion(host);
      return;
    }
    stopMotion(host, 'replace');
    const layer = host.stateLayer;
    const elements = [...layer.querySelectorAll('[data-motion-active="true"]')];
    if (!elements.length) {
      settleMotion(host);
      return;
    }
    const motionId = host.motion.id;
    const duration = MOTION_MS;
    const easing = 'cubic-bezier(.22,1,.36,1)';
    host.motion.active = true;
    host.motion.reason = reason;
    layer.classList.remove('deep-motion-settled');
    layer.classList.add('deep-motion-pending');
    elements.filter(element => element.getAttribute('data-motion') === 'travel').forEach(element => {
      element.style.setProperty('--deep-motion-from-transform', travelTransform(host, element));
    });

    if (typeof Element !== 'undefined' && typeof Element.prototype.animate === 'function') {
      const animations = elements.map(element => {
        const kind = element.getAttribute('data-motion');
        if (kind === 'draw' && element.tagName.toLowerCase() === 'path') {
          element.setAttribute('stroke-dasharray', '1');
          element.setAttribute('stroke-dashoffset', '1');
        }
        const keyframes = kind === 'travel'
          ? (() => {
            const fromTransform = travelTransform(host, element);
            return [{opacity: 1, transform: fromTransform}, {opacity: 1, transform: 'translate(0, 0)'}];
          })()
          : kind === 'pulse'
          ? [{opacity: 0, transform: 'scale(.97)'}, {opacity: 1, transform: 'scale(1.025)'}, {opacity: 1, transform: 'scale(1)'}]
          : kind === 'enter'
            ? [{opacity: 0, transform: 'translateY(5px)'}, {opacity: 1, transform: 'translateY(0)'}]
            : [{opacity: 0, strokeDashoffset: 1}, {opacity: 1, strokeDashoffset: 0}];
        const animation = element.animate(keyframes, {
          duration: kind === 'pulse' ? Math.min(duration, 480) : duration,
          delay: Number.parseFloat(element.style.getPropertyValue('--deep-motion-delay')) || 0,
          easing,
          fill: 'both'
        });
        host.motion.animations.add(animation);
        return animation;
      });
      host.motion.finish = Promise.all(animations.map(animation => animation.finished.catch(() => null))).then(() => {
        if (host.motion.id !== motionId) return;
        settleMotion(host);
      });
      return;
    }

    /* Older WebKit builds still get one finite CSS pass.  The listener is
       attached to the final element; there is no timer or render loop. */
    layer.classList.remove('deep-motion-pending');
    layer.classList.add('deep-motion-run');
    const last = elements[elements.length - 1];
    const endListener = event => {
      if (event.target !== last || host.motion.id !== motionId) return;
      settleMotion(host);
    };
    host.motion.endListener = endListener;
    layer.addEventListener('animationend', endListener);
  };

  const setMotionReduced = (host, reduced) => {
    if (!host?.motion) return;
    host.motion.reduced = Boolean(reduced);
    if (host.motion.reduced) stopMotion(host, 'reduced-motion');
  };

  const createSceneHost = wrap => {
    wrap.classList.add('deep-hybrid-wrap');
    const host = document.createElement('div');
    host.className = 'deep-hybrid-host';
    host.setAttribute('data-hybrid-version', VERSION);
    host.setAttribute('aria-hidden', 'true');
    /* Keep the physical raster and live ink in one transformed scene.  This
       prevents a centering or scale update from ever moving one layer without
       the other. */
    const sceneFrame = document.createElement('div');
    sceneFrame.className = 'deep-hybrid-scene-frame';
    const plate = document.createElementNS(SVG_NS, 'svg');
    plate.classList.add('deep-hybrid-plate');
    plate.setAttribute('viewBox', ART_VIEWBOX);
    plate.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    plate.setAttribute('aria-hidden', 'true');
    const plateFrame = node('g', {class: 'deep-hybrid-frame'}, plate);
    const plateImage = document.createElementNS(SVG_NS, 'image');
    plateImage.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    plateImage.setAttribute('x', '0');
    plateImage.setAttribute('y', '0');
    plateImage.setAttribute('width', String(ART_WIDTH));
    plateImage.setAttribute('height', String(ART_HEIGHT));
    plateImage.setAttribute('aria-hidden', 'true');
    plateFrame.appendChild(plateImage);
    const live = document.createElementNS(SVG_NS, 'svg');
    live.classList.add('deep-hybrid-live');
    live.setAttribute('viewBox', ART_VIEWBOX);
    live.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    live.setAttribute('role', 'img');
    live.setAttribute('aria-label', 'Live visual; the chapter text explains this scene.');
    live.setAttribute('data-no-ink-filter', 'true');
    const liveFrame = node('g', {class: 'deep-hybrid-frame'}, live);
    const staticLayer = node('g', {'data-layer': 'live-static'}, liveFrame);
    const stateLayer = node('g', {'data-layer': 'live-state'}, liveFrame);
    const motionLayer = node('g', {'data-layer': 'live-motion'}, liveFrame);
    const focusLayer = node('g', {'data-layer': 'focus'}, liveFrame);
    sceneFrame.append(plate, live);
    host.append(sceneFrame);
    wrap.appendChild(host);
    return {
      wrap, host, sceneFrame, plate, plateFrame, plateImage, live, liveFrame, staticLayer, stateLayer, motionLayer, focusLayer,
      staticCache: new Map(), lastAsset: '', lastView: '', lastStateKey: '', lastState: null, lastStaticKey: '',
      loaded: null, loadToken: 0, collisions: [], layout: null,
      motion: {id: 0, active: false, visible: document.visibilityState !== 'hidden', reduced: prefersReducedMotion(), reason: '', animations: new Set(), endListener: null, finish: null}
    };
  };

  const applyCrop = (plateImage, record, state, layout) => {
    const crop = record?.crop?.[layout.viewportClass === 'phone' ? 'mobile' : 'desktop'] || {x: 0, y: 0, width: 1, height: 1};
    /* Crop is represented by the SVG viewBox, not by an independently
       stretched image rectangle.  Both the plate SVG and live SVG receive
       the same frame from renderScene(). */
    const x = (crop.x || 0) * ART_WIDTH;
    const y = (crop.y || 0) * ART_HEIGHT + layout.artOffset;
    const width = ART_WIDTH * (crop.width || 1);
    const height = ART_HEIGHT * (crop.height || 1);
    plateImage.setAttribute('x', '0');
    plateImage.setAttribute('y', String(layout.artOffset || 0));
    plateImage.setAttribute('width', String(ART_WIDTH));
    plateImage.setAttribute('height', String(ART_HEIGHT));
    plateImage.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    return {viewBox: `${round(x)} ${round(y)} ${round(width)} ${round(height)}`, x, y, width, height};
  };

  const applyComposition = (host, scene, layout) => {
    const composition = compositionFor(scene, layout);
    /* One outer frame owns the composition.  The two SVGs stay in the same
       coordinate system and can no longer drift apart under centering. */
    host.sceneFrame.style.transform = composition.cssTransform || 'none';
    host.host.dataset.compositionScale = String(composition.scale);
    host.host.dataset.compositionOffset = `${composition.x},${composition.y}`;
    host.host.dataset.compositionTransform = composition.cssTransform || 'none';
    return composition;
  };

  const renderScene = (host, scene, state, assets, rect) => {
    const previousAsset = host.lastAsset;
    const previousView = host.lastView;
    const previousStateKey = host.lastStateKey;
    const layout = scene.measure({width: rect.width, height: rect.height, state});
    host.layout = layout;
    host.host.dataset.chapter = String(state.active + 1);
    host.host.dataset.viewport = layout.viewportClass;
    const assetId = typeof scene.asset === 'function' ? scene.asset(state) : scene.asset;
    const record = assets.get(assetId);
    const frame = applyCrop(host.plateImage, record, state, layout);
    const composition = applyComposition(host, scene, layout);
    /* Attach the raster URL before waiting on an offscreen decode.  A cold
       navigation must paint the complete plate as soon as the browser can
       fetch it; decode remains a readiness/fallback check, not a visibility
       gate that leaves the live overlay floating over empty paper. */
    const initialSource = assets.url(assetId);
    if (host.plateImage.getAttribute('href') !== initialSource) {
      host.plateImage.setAttribute('href', initialSource);
      host.plateImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', initialSource);
    }
    host.plateImage.style.display = '';
    host.live.setAttribute('viewBox', frame.viewBox);
    host.plate.setAttribute('viewBox', frame.viewBox);
    host.live.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    host.plate.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    const staticKey = `${scene.key}:${assetId}:${layout.viewportClass}:${frame.viewBox}:${composition.transform}`;
    const stateKey = JSON.stringify({active: state.active, biased: state.biased, tensorMode: state.tensorMode, earWeight: state.earWeight, furWeight: state.furWeight, backgroundWeight: state.backgroundWeight, neuronBias: state.neuronBias, learnStep: state.learnStep, learningRate: state.learningRate, epoch: state.epoch, architecture: state.architecture, threshold: state.threshold});
    /* Control events can produce one React commit and one observer
       invalidation.  If the second pass describes the exact same frame,
       leave the active one-shot animation alone instead of cancelling it. */
    if (previousAsset === assetId && previousView === layout.viewportClass && previousStateKey === stateKey && host.lastStaticKey === staticKey) return layout;
    stopMotion(host, 'render');
    if (host.lastStaticKey !== staticKey) {
      let cached = host.staticCache.get(staticKey);
      if (!cached) {
        const scratch = node('g');
        scene.drawStatic({group: scratch, layout, state, assetMeta: record, seed: staticKey});
        cached = scratch;
        host.staticCache.set(staticKey, cached);
        if (host.staticCache.size > 8) host.staticCache.delete(host.staticCache.keys().next().value);
      }
      host.staticLayer.replaceChildren(cached.cloneNode(true));
      host.lastStaticKey = staticKey;
    }
    host.stateLayer.replaceChildren();
    host.motionLayer.replaceChildren();
    host.focusLayer.replaceChildren();
    scene.drawState({group: host.stateLayer, layout, state, previousState: host.lastState, assetMeta: record, seed: `${staticKey}:state`});
    host.collisions = [];
    host.host.dataset.asset = assetId;
    host.lastAsset = assetId;
    host.lastView = layout.viewportClass;
    host.lastStateKey = stateKey;
    host.lastState = {...state};
    host.motion.reduced = prefersReducedMotion();
    host.motion.visible = document.visibilityState !== 'hidden';
    const motionReason = !previousStateKey
      ? 'chapter-enter'
      : previousAsset !== assetId
        ? 'asset-change'
        : previousView !== layout.viewportClass
          ? null
          : previousStateKey !== stateKey
            ? 'control-change'
            : null;
    decorateMotionLayer(host.stateLayer, {controlsOnly: motionReason === 'control-change'});
    if (motionReason) startMotion(host, motionReason);
    if (previousAsset !== assetId || previousView !== layout.viewportClass) {
      const loadToken = ++host.loadToken;
      host.loaded = assets.preload(assetId).then(result => {
        /* A branch switch can request three plates before the first decode
           finishes.  Do not let an older promise repaint a clipped sliver of
           the previous scene over the current one. */
        if (loadToken !== host.loadToken || host.lastAsset !== assetId) return result;
        host.plateImage.setAttribute('href', result.source);
        host.plateImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', result.source);
        host.plateImage.style.display = '';
        return result;
      });
    }
    return layout;
  };

  const readRect = wrap => {
    const rect = wrap.getBoundingClientRect();
    return {width: Math.max(1, rect.width), height: Math.max(1, rect.height)};
  };

  const isMobileViewport = () => window.matchMedia
    ? window.matchMedia('(max-width: 820px)').matches
    : window.innerWidth <= 820;

  let runtime = null;
  const boot = async () => {
    if (runtime || !document.querySelector('.visual-stage .canvas-wrap')) return;
    const wrap = document.querySelector('.visual-stage .canvas-wrap');
    const stage = document.querySelector('.visual-stage');
    const host = createSceneHost(wrap);
    const manifest = await loadManifest();
    const assets = new AssetRegistry(manifest);
    let current = {...DEFAULT_STATE};
    let invalidation = false;
    let destroyed = false;
    let mobileMode = false;
    const mobileHosts = new Map();
    const articleList = [...document.querySelectorAll('.lesson-step[data-step]')]
      .map(article => ({article, index: Number(article.dataset.step)}))
      .filter(item => Number.isInteger(item.index) && item.index >= 0 && item.index < scenes.length)
      .sort((left, right) => left.index - right.index);
    const resize = new ResizeObserver(() => invalidate());
    const mobileResize = new ResizeObserver(() => invalidate());

    const createInlineScene = (article, index) => {
      const intro = article.querySelector('.chapter-intro');
      if (!intro) return null;
      const sceneWrap = document.createElement('div');
      sceneWrap.className = 'deep-mobile-scene';
      sceneWrap.dataset.chapter = String(index + 1);
      sceneWrap.setAttribute('aria-hidden', 'true');
      intro.insertAdjacentElement('afterend', sceneWrap);
      const sceneHost = createSceneHost(sceneWrap);
      mobileResize.observe(sceneWrap);
      return sceneHost;
    };

    /* Mobile scenes belong to their article, so the shared visual stage can
       disappear without leaving a blank grid row.  This is an explicit
       viewport sync rather than a DOM observer: observing the root while
       replacing SVG layers would observe our own writes. */
    const syncMobileScenes = () => {
      const shouldUseMobileScenes = isMobileViewport();
      mobileMode = shouldUseMobileScenes;
      if (shouldUseMobileScenes) {
        articleList.forEach(({article, index}) => {
          if (!mobileHosts.has(index)) {
            const sceneHost = createInlineScene(article, index);
            if (sceneHost) mobileHosts.set(index, sceneHost);
          }
        });
        return;
      }
      mobileHosts.forEach(sceneHost => {
        stopMotion(sceneHost, 'viewport');
        mobileResize.unobserve(sceneHost.wrap);
        sceneHost.wrap.remove();
      });
      mobileHosts.clear();
    };

    const render = () => {
      if (destroyed) return;
      current = readShellState(current);
      syncMobileScenes();
      if (mobileMode) {
        mobileHosts.forEach((sceneHost, index) => {
          const scene = scenes[index] || scenes[0];
          renderScene(sceneHost, scene, {...current, active: index}, assets, readRect(sceneHost.wrap));
        });
        stage?.setAttribute('data-hybrid-mobile', 'true');
        stage?.removeAttribute('data-hybrid-scene');
        return;
      }
      const scene = scenes[current.active] || scenes[0];
      const rect = readRect(wrap);
      renderScene(host, scene, current, assets, rect);
      stage?.setAttribute('data-hybrid-scene', scene.key);
      stage?.removeAttribute('data-hybrid-mobile');
    };
    const invalidate = () => {
      if (invalidation || destroyed) return;
      invalidation = true;
      Promise.resolve().then(() => { invalidation = false; render(); });
    };
    const onInput = event => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement) invalidate();
    };
    /* The bundled shell centers the entire article when a chapter dot is
       clicked.  Because each article has a large top pad, that puts its
       heading under the fixed top bar.  Own the dot navigation here and
       place the heading itself below the bar; the IntersectionObserver still
       updates the active dot once the target settles. */
    const scrollToChapter = index => {
      const article = document.getElementById(`chapter-${index + 1}`);
      const heading = article?.querySelector('h2') || article;
      if (!heading) return;
      const topbar = document.querySelector('.topbar');
      const topbarRect = topbar?.getBoundingClientRect();
      const offset = Math.max(74, (topbarRect?.bottom || 54) + 20);
      const top = Math.max(0, heading.getBoundingClientRect().top + window.scrollY - offset);
      window.scrollTo({top, behavior: prefersReducedMotion() ? 'auto' : 'smooth'});
    };
    const onChapterNavigate = event => {
      const target = event.target instanceof Element
        ? event.target.closest('.chapter-dots button')
        : null;
      if (!target) return;
      const index = [...document.querySelectorAll('.chapter-dots button')].indexOf(target);
      if (index < 0) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      scrollToChapter(index);
    };
    const onClick = event => {
      const target = event.target instanceof Element
        ? event.target.closest('.control-stack .primary-button, .chapter-dots button, .toggle-button, .segmented-control button, .architecture-tabs button')
        : null;
      if (!target) return;
      if (target.matches('.control-stack .primary-button')) current.learnStep += 1;
      invalidate();
    };
    const controller = new AbortController();
    document.addEventListener('click', onChapterNavigate, {capture: true, signal: controller.signal});
    document.getElementById('root')?.addEventListener('input', onInput, {signal: controller.signal});
    document.getElementById('root')?.addEventListener('click', onClick, {signal: controller.signal});
    resize.observe(wrap);
    const shellStateTargets = [...new Set([
      stage?.querySelector('.chapter-dots'),
      ...document.querySelectorAll('.control-panel, .tensor-control, .sliders, .control-stack, .epoch-control, .architecture-control, .threshold-control')
    ].filter(Boolean))];
    const mutations = new MutationObserver(records => {
      if (records.some(record => record.type === 'childList' || record.attributeName === 'class' || record.attributeName === 'aria-pressed')) invalidate();
    });
    shellStateTargets.forEach(target => mutations.observe(target, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class', 'aria-pressed']
    }));
    const allHosts = () => [host, ...mobileHosts.values()];
    const onVisibility = () => {
      const visible = document.visibilityState !== 'hidden';
      allHosts().forEach(sceneHost => {
        sceneHost.motion.visible = visible;
        if (!visible) stopMotion(sceneHost, 'hidden');
      });
      if (visible) invalidate();
    };
    document.addEventListener('visibilitychange', onVisibility, {signal: controller.signal});
    const media = typeof window.matchMedia === 'function' ? window.matchMedia('(max-width: 820px)') : null;
    const reducedMedia = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    const onMediaChange = () => { syncMobileScenes(); invalidate(); };
    const onReducedMotionChange = event => {
      allHosts().forEach(sceneHost => setMotionReduced(sceneHost, event.matches));
      if (!event.matches) invalidate();
    };
    if (media?.addEventListener) media.addEventListener('change', onMediaChange);
    else media?.addListener?.(onMediaChange);
    if (reducedMedia?.addEventListener) reducedMedia.addEventListener('change', onReducedMotionChange);
    else reducedMedia?.addListener?.(onReducedMotionChange);
    runtime = {
      host,
      mobileHosts,
      assets,
      getState: () => ({...current}),
      render,
      invalidate,
      destroy: () => {
        destroyed = true;
        controller.abort();
        resize.disconnect();
        mobileResize.disconnect();
        mutations.disconnect();
        if (media?.removeEventListener) media.removeEventListener('change', onMediaChange);
        else media?.removeListener?.(onMediaChange);
        if (reducedMedia?.removeEventListener) reducedMedia.removeEventListener('change', onReducedMotionChange);
        else reducedMedia?.removeListener?.(onReducedMotionChange);
        allHosts().forEach(sceneHost => stopMotion(sceneHost, 'destroy'));
        host.host.remove();
        mobileHosts.forEach(sceneHost => sceneHost.wrap.remove());
        mobileHosts.clear();
      }
    };
    window.__statmlDeepLearningRenderer = {
      version: VERSION,
      getState: () => ({...current}),
      render,
      preload: id => assets.preload(id),
      debugBounds: () => {
        const activeHost = mobileMode ? (mobileHosts.get(current.active) || host) : host;
        return {
          active: current.active,
          mobile: mobileMode,
          staticKey: activeHost.lastStaticKey,
          motionActive: Boolean(activeHost.motion?.active),
          rafActive: false,
          animationCount: activeHost.motion?.animations?.size || 0,
          assetId: activeHost.lastAsset,
          collisions: activeHost.collisions || []
        };
      },
      destroy: runtime.destroy
    };
    render();
    // Fonts can change SVG text metrics once; repaint once, never continuously.
    if (document.fonts?.ready) document.fonts.ready.then(invalidate).catch(() => {});
    const preloadChapter = index => {
      const scene = scenes[index];
      if (!scene) return;
      const assetId = typeof scene.asset === 'function' ? scene.asset({...current, active: index}) : scene.asset;
      assets.preload(assetId);
    };
    [0, current.active - 1, current.active, current.active + 1].forEach(preloadChapter);
  };

  const shellReady = () => document.querySelector('.visual-stage .canvas-wrap')
    && document.querySelectorAll('.lesson-step[data-step]').length >= scenes.length;
  const waitForShell = () => {
    if (shellReady()) { boot(); return; }
    const observer = new MutationObserver(() => {
      if (shellReady()) { observer.disconnect(); boot(); }
    });
    observer.observe(document.getElementById('root') || document.body, {childList: true, subtree: true});
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', waitForShell, {once: true});
  else waitForShell();
})();
