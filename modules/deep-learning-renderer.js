/*
 * Deep Learning checkpoint 3 renderer.
 *
 * This file is intentionally module-local. It owns all twelve chapter scenes
 * and leaves the existing React shell, copy, controls, and navigation in
 * place. The bundled React painter is guarded at its component boundary, so
 * only this canvas is created while the Deep renderer flag is active.
 */
(() => {
  'use strict';

  const ATTR = 'deepLearningRenderer';
  const stageSelector = '.visual-stage';
  const paper = '#fbf6e9';
  const ink = '#2c2926';
  const muted = '#6c675f';
  const blue = '#356fae';
  const blueSoft = '#e6f0f8';
  const green = '#4f956b';
  const greenSoft = '#e8f3e8';
  const coral = '#c85e58';
  const coralSoft = '#fde9de';
  const amber = '#bf8c3d';
  const amberSoft = '#fff3bf';
  const lavender = '#7960ae';
  const lavenderSoft = '#f0eafb';
  const grid = 'rgba(88,83,72,.045)';
  const thin = 'rgba(88,83,72,.25)';
  const FONT = '"Patrick Hand", "Kalam", "Marker Felt", "Segoe Print", cursive';
  const UTILITY = '"Kalam", "Patrick Hand", "Marker Felt", cursive';
  // The CSS reserves at least 456px for the vertical/compact composition on
  // phone-sized stages. The height guard prevents a narrow desktop column
  // (which can be <520px wide but only ~385px tall) from entering that layout.
  const COMPACT_MIN_HEIGHT = 456;
  const isCompactLayout = (width, height) => width < 520 && height >= COMPACT_MIN_HEIGHT;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const hash = value => {
    let h = 2166136261 >>> 0;
    const text = String(value);
    for (let index = 0; index < text.length; index += 1) {
      h ^= text.charCodeAt(index);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  };

  const random = seed => {
    let state = hash(seed) || 1;
    return () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 4294967296;
    };
  };

  const jitter = (seed, index, amount) => {
    const value = Math.sin((hash(`${seed}:${index}`) || 1) * 0.000017) * 43758.5453;
    return (value - Math.floor(value) - 0.5) * amount;
  };

  const setFont = (ctx, size, {utility = false, weight = 400} = {}) => {
    ctx.font = `${weight} ${size}px ${utility ? UTILITY : FONT}`;
    ctx.textBaseline = 'alphabetic';
  };

  const write = (ctx, value, x, y, size, color = ink, options = {}) => {
    ctx.save();
    setFont(ctx, size, options);
    ctx.fillStyle = color;
    ctx.textAlign = options.align || 'left';
    ctx.globalAlpha = options.alpha ?? 1;
    ctx.fillText(String(value), x, y);
    ctx.restore();
  };

  const wrap = (ctx, value, maxWidth, size, options = {}) => {
    setFont(ctx, size, options);
    const words = String(value).split(/\s+/);
    const lines = [];
    let line = '';
    words.forEach(word => {
      const next = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(next).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    });
    if (line) lines.push(line);
    return lines;
  };

  const writeWrapped = (ctx, value, x, y, maxWidth, size, lineHeight, color = ink, options = {}) => {
    const lines = wrap(ctx, value, maxWidth, size, options);
    lines.forEach((line, index) => write(ctx, line, x, y + index * lineHeight, size, color, options));
    return lines.length;
  };

  const roughPath = (ctx, points, seed, color, width = 1.5, alpha = 1) => {
    if (!points.length) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = alpha;
    for (let pass = 0; pass < 2; pass += 1) {
      ctx.beginPath();
      points.forEach((point, index) => {
        const amount = pass ? 0.62 : 0.28;
        const x = point[0] + jitter(`${seed}:x:${pass}`, index, amount);
        const y = point[1] + jitter(`${seed}:y:${pass}`, index, amount);
        if (!index) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
    ctx.restore();
  };

  const roundedPath = (ctx, x, y, width, height, radius, seed) => {
    const r = Math.min(radius, width / 2, height / 2);
    const n = index => jitter(`${seed}:edge`, index, 1.15);
    ctx.beginPath();
    ctx.moveTo(x + r + n(0), y + n(1));
    ctx.lineTo(x + width - r + n(2), y + n(3));
    ctx.quadraticCurveTo(x + width + n(4), y + n(5), x + width + n(6), y + r + n(7));
    ctx.lineTo(x + width + n(8), y + height - r + n(9));
    ctx.quadraticCurveTo(x + width + n(10), y + height + n(11), x + width - r + n(12), y + height + n(13));
    ctx.lineTo(x + r + n(14), y + height + n(15));
    ctx.quadraticCurveTo(x + n(16), y + height + n(17), x + n(18), y + height - r + n(19));
    ctx.lineTo(x + n(20), y + r + n(21));
    ctx.quadraticCurveTo(x + n(22), y + n(23), x + r + n(24), y + n(25));
    ctx.closePath();
  };

  const panel = (ctx, x, y, width, height, radius, seed, fill = '#fffaf0', stroke = thin, lineWidth = 1.3) => {
    ctx.save();
    roundedPath(ctx, x, y, width, height, radius, seed);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.restore();
  };

  const line = (ctx, x1, y1, x2, y2, color = ink, width = 1.3, seed = 'line', alpha = 1, dashed = false) => {
    ctx.save();
    if (dashed) ctx.setLineDash([5, 5]);
    roughPath(ctx, [[x1, y1], [x2, y2]], seed, color, width, alpha);
    ctx.restore();
  };

  const arrow = (ctx, x1, y1, x2, y2, color = blue, width = 1.8, seed = 'arrow', label = '') => {
    line(ctx, x1, y1, x2, y2, color, width, seed);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const size = 7;
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - Math.cos(angle - 0.48) * size, y2 - Math.sin(angle - 0.48) * size);
    ctx.lineTo(x2 - Math.cos(angle + 0.48) * size, y2 - Math.sin(angle + 0.48) * size);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    if (label) write(ctx, label, (x1 + x2) / 2, (y1 + y2) / 2 - 9, 10, color, {align: 'center', utility: true, weight: 700});
  };

  const chip = (ctx, value, x, y, width, fill, color = ink, seed = 'chip', height = 24) => {
    panel(ctx, x, y, width, height, 7, seed, fill, `${color}55`, 1);
    write(ctx, value, x + width / 2, y + height / 2 + 4, 11, color, {align: 'center', utility: true, weight: 700});
  };

  const dot = (ctx, x, y, radius, color, seed = 'dot', alpha = 1) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + jitter(`${seed}:x`, 0, 0.8), y + jitter(`${seed}:y`, 1, 0.8), radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawGrid = (ctx, width, height) => {
    ctx.save();
    ctx.strokeStyle = grid;
    ctx.lineWidth = 0.6;
    for (let x = 24; x < width; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 24; y < height; y += 36) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  };

  const begin = (ctx, width, height, meta) => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, width, height);
    drawGrid(ctx, width, height);
    write(ctx, meta, 24, 24, 10, blue, {utility: true, weight: 700});
  };

  const drawCat = (ctx, cx, cy, size, color = '#6f5d50') => {
    const bodyWidth = size * 0.52;
    const bodyHeight = size * 0.52;
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = `${ink}aa`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(cx, cy + size * 0.16, bodyWidth, bodyHeight, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.32, cy - size * 0.15);
    ctx.lineTo(cx - size * 0.2, cy - size * 0.52);
    ctx.lineTo(cx - size * 0.03, cy - size * 0.3);
    ctx.lineTo(cx + size * 0.18, cy - size * 0.53);
    ctx.lineTo(cx + size * 0.31, cy - size * 0.12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fffaf0';
    ctx.beginPath();
    ctx.arc(cx - size * 0.12, cy - size * 0.15, size * 0.045, 0, Math.PI * 2);
    ctx.arc(cx + size * 0.12, cy - size * 0.15, size * 0.045, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawDog = (ctx, cx, cy, size, color = '#8b6b4f', variant = 0, rotation = 0) => {
    const bodyWidth = size * 0.49;
    const bodyHeight = size * 0.34;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.translate(-cx, -cy);
    ctx.fillStyle = color;
    ctx.strokeStyle = `${ink}66`;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.ellipse(cx, cy + size * 0.12, bodyWidth, bodyHeight, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + (variant - 1) * size * 0.03, cy - size * 0.12, size * 0.27, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.2, cy - size * 0.28);
    ctx.lineTo(cx - size * 0.37, cy - size * 0.43);
    ctx.lineTo(cx - size * 0.31, cy - size * 0.1);
    ctx.moveTo(cx + size * 0.18, cy - size * 0.29);
    ctx.lineTo(cx + size * 0.36, cy - size * 0.43);
    ctx.lineTo(cx + size * 0.29, cy - size * 0.06);
    ctx.stroke();
    ctx.fillStyle = '#fffaf0';
    ctx.beginPath();
    ctx.arc(cx - size * 0.1, cy - size * 0.15, size * 0.035, 0, Math.PI * 2);
    ctx.arc(cx + size * 0.1, cy - size * 0.15, size * 0.035, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const sceneOne = (ctx, width, height) => {
    begin(ctx, width, height, 'ONE INPUT  →  ONE DISTRIBUTION');
    const mobile = isCompactLayout(width, height);
    const pad = mobile ? 18 : 34;
    const tile = mobile ? clamp(width * 0.28, 94, 116) : clamp(width * 0.27, 128, 176);
    const tileX = pad;
    const tileY = mobile ? 72 : 88;
    panel(ctx, tileX, tileY, tile, tile, 12, 'input-tile', '#f4eee1', `${ink}66`, 1.5);
    write(ctx, 'input', tileX, tileY - 10, 10, muted, {utility: true, weight: 700});
    drawCat(ctx, tileX + tile / 2, tileY + tile / 2 + 8, tile * 0.62);

    const outputX = mobile ? Math.max(tileX + tile + 38, width * 0.5) : width * 0.59;
    const rightPad = mobile ? 16 : 34;
    const valueWidth = 34;
    const labelWidth = mobile ? 34 : 44;
    const barWidth = Math.max(58, width - outputX - rightPad - labelWidth - valueWidth);
    const rowStart = mobile ? 104 : 124;
    write(ctx, 'output probabilities', outputX, rowStart - 20, 10, blue, {utility: true, weight: 700});
    arrow(ctx, tileX + tile + 14, tileY + tile / 2, outputX - 18, tileY + tile / 2, blue, 1.8, 'predict-arrow', 'predict');
    const rows = [
      ['cat', 0.89, blue],
      ['dog', 0.08, coral],
      ['rabbit', 0.03, amber]
    ];
    rows.forEach(([label, value, color], index) => {
      const y = rowStart + index * (mobile ? 43 : 48);
      write(ctx, label, outputX, y + 4, mobile ? 12 : 13, ink, {utility: true, weight: 700});
      const bx = outputX + labelWidth;
      ctx.save();
      ctx.fillStyle = '#e9e1d4';
      ctx.fillRect(bx, y - 7, barWidth, 13);
      ctx.fillStyle = color;
      ctx.globalAlpha = index === 0 ? 0.84 : 0.42;
      ctx.fillRect(bx, y - 7, Math.max(4, barWidth * value), 13);
      ctx.restore();
      write(ctx, `${Math.round(value * 100)}%`, bx + barWidth + 8, y + 4, mobile ? 11 : 12, color, {utility: true, weight: 700});
    });
    const noteY = rowStart + rows.length * (mobile ? 43 : 48) + 18;
    chip(ctx, 'largest score  →  cat', outputX, noteY, Math.min(166, width - outputX - rightPad), blueSoft, blue, 'winner-note', mobile ? 25 : 27);
    write(ctx, '0.89 + 0.08 + 0.03 = 1.00', width / 2, height - 24, 11, muted, {align: 'center', utility: true, weight: 700});
  };

  const drawDatasetTile = (ctx, x, y, size, index, biased) => {
    const generator = random(`dataset:${index}`);
    const contexts = ['#dce8ee', '#f1e1db', '#e8e0f5', '#e8f3e8', '#f6edcc'];
    const background = biased ? '#d7ead7' : contexts[index % contexts.length];
    const variation = index % 3;
    const rotations = [-0.14, 0.06, 0.14];
    panel(ctx, x, y, size, size, 7, `tile:${index}`, background, `${ink}32`, 1);
    if (biased || variation === 2) {
      ctx.save();
      ctx.strokeStyle = biased ? `${green}aa` : `${green}66`;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + size * 0.74);
      ctx.lineTo(x + size - 4, y + size * 0.74);
      ctx.stroke();
      ctx.restore();
    }
    if (!biased && variation === 1) {
      // A single soft highlight makes the advertised lighting variation
      // visible without adding another decorative legend to the scene.
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,.56)';
      ctx.beginPath();
      ctx.arc(x + size * 0.2, y + size * 0.2, Math.max(4, size * 0.085), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    drawDog(ctx, x + size * (0.48 + (generator() - 0.5) * 0.12), y + size * (0.56 + (generator() - 0.5) * 0.08), size * (0.48 + generator() * 0.1), ['#8b6b4f', '#9e7959', '#78695e'][index % 3], variation, rotations[variation]);
  };

  const sceneTwo = (ctx, width, height, biased) => {
    begin(ctx, width, height, biased ? 'SHORTCUT VIEW' : 'SAME CLASS  ·  VARIED CONTEXT');
    const mobile = isCompactLayout(width, height);
    const pad = mobile ? 18 : 30;
    const tile = mobile ? clamp((width - 2 * pad - 2 * 8) / 3, 58, 82) : clamp((width * 0.42 - 2 * 10) / 3, 62, 78);
    const gridWidth = tile * 3 + 20;
    const gridX = mobile ? (width - gridWidth) / 2 : pad;
    const gridY = mobile ? 64 : 76;
    panel(ctx, gridX - 10, gridY - 12, gridWidth + 20, tile * 3 + 40, 10, 'dataset-group', '#fffaf0', `${ink}42`, 1.2);
    for (let index = 0; index < 9; index += 1) {
      const x = gridX + (index % 3) * (tile + 10);
      const y = gridY + Math.floor(index / 3) * (tile + 10);
      drawDatasetTile(ctx, x, y, tile, index, biased);
    }
    const frameBottom = gridY + tile * 3 + 28;
    // On compact scenes this label belongs to the frame header; the explicit
    // lane below the frame is reserved for the variation legend and footer.
    write(ctx, 'same class', gridX, mobile ? gridY - 4 : frameBottom - 2, 10, blue, {utility: true, weight: 700});
    if (!biased) {
      const x = mobile ? pad : width * 0.57;
      // The compact legend starts in its own measured lane below the frame;
      // its final row stays above the reserved footer baseline on 375/390px.
      const y = mobile ? frameBottom + 14 : 104;
      const variationStep = mobile ? 22 : 28;
      const variationOffset = mobile ? 20 : 28;
      const variationLabelOffset = mobile ? 24 : 32;
      write(ctx, 'what should vary?', x, y, 10, blue, {utility: true, weight: 700});
      ['angle', 'light', 'background'].forEach((label, index) => {
        dot(ctx, x + 6, y + variationOffset + index * variationStep, 4, [blue, amber, green][index], `variation:${index}`);
        write(ctx, label, x + 18, y + variationLabelOffset + index * variationStep, 12, ink, {utility: true});
      });
      if (mobile) {
        // The compact scene reserves its final baseline as a measured caption
        // lane; it never relies on a fixed y below the canvas.
        write(ctx, 'Follow the animal, not the backdrop.', x, height - 24, 11, muted, {utility: true});
      } else {
        writeWrapped(ctx, 'The label should follow the animal, not one lucky backdrop.', x, y + 116, width * 0.35, 12, 16, muted);
      }
    } else {
      const x = mobile ? pad : width * 0.57;
      const calloutWidth = mobile ? width - 2 * pad : width * 0.37;
      const calloutHeight = mobile ? 78 : 210;
      const y = mobile ? gridY + tile * 3 + 54 : 106;
      const highlightIndex = 8;
      const highlightX = gridX + (highlightIndex % 3) * (tile + 10) + tile / 2;
      const highlightY = gridY + Math.floor(highlightIndex / 3) * (tile + 10) + tile * 0.74;
      const targetX = mobile ? x + calloutWidth * 0.82 : x;
      const targetY = mobile ? y : y + 40;
      ctx.save();
      ctx.strokeStyle = coral;
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.arc(highlightX, highlightY, mobile ? 10 : 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      line(ctx, highlightX, highlightY, targetX, targetY, coral, 1.4, 'shortcut-leader');
      panel(ctx, x, y, calloutWidth, calloutHeight, 9, 'shortcut-callout', coralSoft, `${coral}88`, 1.4);
      write(ctx, 'shortcut?', x + 14, y + 22, 10, coral, {utility: true, weight: 700});
      write(ctx, 'background  →  dog?', x + 14, y + 46, mobile ? 13 : 15, coral, {utility: true, weight: 700});
      if (mobile) {
        write(ctx, 'The same grass cue repeats.', x + 14, y + 68, 10, muted, {utility: true});
      } else {
        writeWrapped(ctx, 'If the grass never changes, the model can learn grass instead of dogs.', x + 14, y + 84, calloutWidth - 28, 12, 16, muted);
      }
    }
  };

  const drawDotCloud = (ctx, x, y, width, height) => {
    panel(ctx, x, y, width, height, 9, 'sample-cloud', '#fffaf0', `${ink}42`, 1.2);
    write(ctx, 'one dataset', x + width / 2, y - 10, 10, muted, {align: 'center', utility: true, weight: 700});
    for (let index = 0; index < 18; index += 1) {
      const generator = random(`sample:${index}`);
      dot(ctx, x + 16 + generator() * (width - 32), y + 20 + generator() * (height - 40), 3.2, blue, `sample-dot:${index}`, index % 3 === 0 ? 0.72 : 0.42);
    }
  };

  const splitCard = (ctx, x, y, width, height, title, pct, job, color, seed, sealed = false) => {
    panel(ctx, x, y, width, height, 8, seed, '#fffaf0', `${color}88`, 1.5);
    write(ctx, title, x + 14, y + 23, 11, color, {utility: true, weight: 700});
    write(ctx, pct, x + width - 14, y + 23, 12, color, {align: 'right', utility: true, weight: 700});
    write(ctx, job, x + 14, y + 46, 12, ink, {utility: true});
    if (sealed) {
      ctx.save();
      ctx.strokeStyle = green;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x + width - 22, y + height - 17, 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + width - 25, y + height - 17);
      ctx.lineTo(x + width - 22, y + height - 14);
      ctx.lineTo(x + width - 18, y + height - 20);
      ctx.stroke();
      ctx.restore();
      write(ctx, 'sealed', x + width - 38, y + height - 13, 9, green, {align: 'right', utility: true, weight: 700});
    }
  };

  const sceneThree = (ctx, width, height) => {
    begin(ctx, width, height, 'SPLIT BEFORE YOU TUNE');
    const mobile = isCompactLayout(width, height);
    const pad = mobile ? 18 : 30;
    const sourceWidth = mobile ? 82 : 112;
    const sourceHeight = mobile ? 170 : 214;
    const sourceX = pad;
    const sourceY = mobile ? 88 : 108;
    drawDotCloud(ctx, sourceX, sourceY, sourceWidth, sourceHeight);
    const cardX = mobile ? pad + sourceWidth + 34 : width * 0.43;
    const cardWidth = Math.max(164, width - cardX - pad);
    const cardHeight = mobile ? 74 : 70;
    const gap = mobile ? 16 : 13;
    const top = mobile ? 64 : 98;
    const stackHeight = cardHeight * 3 + gap * 2;
    const forkX = cardX - 12;
    const forkY = top + stackHeight / 2;
    arrow(ctx, sourceX + sourceWidth + 10, sourceY + sourceHeight / 2, forkX, forkY, blue, 1.7, 'split-arrow', mobile ? '' : 'partition');
    line(ctx, forkX, top + cardHeight / 2, forkX, top + stackHeight - cardHeight / 2, blue, 1.2, 'split-fork');
    [0, 1, 2].forEach(index => {
      const centerY = top + index * (cardHeight + gap) + cardHeight / 2;
      line(ctx, forkX, centerY, cardX - 2, centerY, blue, 1.2, `split-entry:${index}`);
    });
    splitCard(ctx, cardX, top, cardWidth, cardHeight, 'TRAIN', '70%', 'learn weights', blue, 'split-train');
    splitCard(ctx, cardX, top + cardHeight + gap, cardWidth, cardHeight, 'VALIDATE', '15%', 'choose & stop', lavender, 'split-validate');
    splitCard(ctx, cardX, top + (cardHeight + gap) * 2, cardWidth, cardHeight, 'TEST', '15%', 'one final exam', green, 'split-test', true);
    write(ctx, 'keep the exam sealed', cardX, top + (cardHeight + gap) * 3 + 22, 11, green, {utility: true, weight: 700});
  };

  const pixelGrid = (ctx, x, y, size, seed = 'pixels', highlight = true) => {
    const count = 8;
    const cell = size / count;
    panel(ctx, x - 8, y - 8, size + 16, size + 16, 7, `${seed}:frame`, '#fffaf0', `${ink}42`, 1.2);
    for (let row = 0; row < count; row += 1) {
      for (let column = 0; column < count; column += 1) {
        const value = (Math.sin(row * 1.2 + column * 0.8) + 1) / 2;
        ctx.fillStyle = `rgba(53,111,174,${0.12 + value * 0.45})`;
        ctx.fillRect(x + column * cell + 1, y + row * cell + 1, cell - 2, cell - 2);
      }
    }
    if (highlight) {
      const column = 5;
      const row = 2;
      ctx.save();
      ctx.strokeStyle = coral;
      ctx.lineWidth = 1.8;
      ctx.strokeRect(x + column * cell + 2, y + row * cell + 2, cell - 4, cell - 4);
      ctx.restore();
    }
  };

  const channelStack = (ctx, x, y, size, mobile) => {
    const count = mobile ? 3 : 3;
    const gap = mobile ? 8 : 10;
    const card = mobile ? Math.min(70, (size - gap * 2) / 3) : size - 36;
    ['R', 'G', 'B'].forEach((label, index) => {
      const px = mobile ? x + index * (card + gap) : x + index * 11;
      const py = mobile ? y : y + index * 10;
      panel(ctx, px, py, card, mobile ? card : card, 6, `channel:${label}`, [coralSoft, greenSoft, blueSoft][index], [coral, green, blue][index], 1.2);
      for (let n = 0; n < 5; n += 1) {
        line(ctx, px + 12, py + 16 + n * 9, px + card - 12, py + 16 + n * 9, [coral, green, blue][index], 1, `channel-line:${label}:${n}`, 0.45);
      }
      ctx.save();
      ctx.fillStyle = coral;
      ctx.globalAlpha = 0.72;
      const marker = Math.max(4, Math.min(9, card * 0.12));
      ctx.fillRect(px + card * 0.62, py + card * 0.3, marker, marker);
      ctx.restore();
      write(ctx, label, px + card / 2, py + card / 2 + 4, 12, [coral, green, blue][index], {align: 'center', utility: true, weight: 700});
    });
    write(ctx, 'colour channels', mobile ? x : x + card + 24, mobile ? y + card + 20 : y + 14, 10, muted, {utility: true, weight: 700});
  };

  const sceneImageTensor = (ctx, width, height) => {
    const mobile = isCompactLayout(width, height);
    const pad = mobile ? 18 : 30;
    const gridSize = mobile ? 106 : 126;
    const gx = mobile ? (width - gridSize) / 2 : pad;
    const gy = mobile ? 56 : 90;
    write(ctx, 'picture', gx, gy - 15, 10, muted, {utility: true, weight: 700});
    pixelGrid(ctx, gx, gy, gridSize, 'image-pixels', true);
    if (mobile) {
      arrow(ctx, width / 2, gy + gridSize + 28, width / 2, gy + gridSize + 62, blue, 1.7, 'tensor-image-arrow');
      channelStack(ctx, width / 2 - 105, gy + gridSize + 80, 210, true);
      write(ctx, '224 × 224 × 3', width / 2, height - 23, 12, blue, {align: 'center', utility: true, weight: 700});
    } else {
      const arrowX = gx + gridSize + 42;
      arrow(ctx, gx + gridSize + 14, gy + gridSize / 2, arrowX + 22, gy + gridSize / 2, blue, 1.8, 'tensor-image-arrow', 'same pixel');
      const stackX = arrowX + 48;
      const stackSize = 160;
      const stackCard = stackSize - 36;
      channelStack(ctx, stackX, gy - 2, stackSize, false);
      // The shape annotation has its own lane under the output stack; it no
      // longer shares a baseline with the channel label.
      const shapeLaneX = stackX + (stackCard + 22) / 2;
      const shapeLaneY = gy + gridSize + 38;
      write(ctx, 'height × width × colour', shapeLaneX, shapeLaneY, 11, blue, {align: 'center', utility: true, weight: 700});
      write(ctx, '224 × 224 × 3', shapeLaneX, shapeLaneY + 22, 13, ink, {align: 'center', utility: true, weight: 700});
    }
  };

  const tokenChip = (ctx, label, id, x, y, width, selected, seed) => {
    panel(ctx, x, y, width, 42, 7, seed, selected ? blueSoft : '#fffaf0', selected ? blue : `${ink}42`, selected ? 1.7 : 1.1);
    write(ctx, label, x + width / 2, y + 17, 12, selected ? blue : ink, {align: 'center', utility: true, weight: 700});
    write(ctx, id, x + width / 2, y + 33, 10, selected ? blue : muted, {align: 'center', utility: true, weight: 700});
  };

  const embeddingRow = (ctx, x, y, width, selected = true) => {
    panel(ctx, x, y, width, 66, 8, 'embedding-row', selected ? lavenderSoft : '#fffaf0', selected ? `${lavender}88` : `${ink}42`, 1.2);
    write(ctx, 'embedding for ID 3912', x + 14, y + 19, 10, selected ? lavender : muted, {utility: true, weight: 700});
    const values = ['+0.42', '-0.18', '+0.77', '-0.06', '…'];
    values.forEach((value, index) => {
      const cellWidth = (width - 28) / values.length;
      const cx = x + 14 + cellWidth * index + cellWidth / 2;
      write(ctx, value, cx, y + 47, 11, value.startsWith('-') ? coral : blue, {align: 'center', utility: true, weight: 700});
    });
  };

  const sceneTextTensor = (ctx, width, height) => {
    const mobile = isCompactLayout(width, height);
    const pad = mobile ? 18 : 30;
    write(ctx, 'raw text', pad, 54, 10, muted, {utility: true, weight: 700});
    write(ctx, 'THE DOG IS SLEEPING', pad, 76, mobile ? 15 : 16, ink, {utility: true, weight: 700});
    const labels = ['THE', 'DOG', 'IS', 'SLEEP', 'ING'];
    const ids = ['142', '3912', '318', '7821', '95'];
    const tokenWidth = mobile ? 64 : Math.min(82, (width - 2 * pad - 4 * 9) / 5);
    if (mobile) {
      const firstX = (width - (tokenWidth * 3 + 18)) / 2;
      // Keep a measured 44px center gutter under DOG so the lookup arrow has
      // its own lane instead of touching the SLEEP/ING cards.
      const secondGap = 44;
      const secondX = (width - (tokenWidth * 2 + secondGap)) / 2;
      labels.forEach((label, index) => {
        const row = index < 3 ? 0 : 1;
        const col = row === 0 ? index : index - 3;
        const x = row ? secondX + col * (tokenWidth + secondGap) : firstX + col * (tokenWidth + 9);
        tokenChip(ctx, label, ids[index], x, 106 + row * 52, tokenWidth, index === 1, `token:${index}`);
      });
      const dogX = firstX + tokenWidth + 9 + tokenWidth / 2;
      arrow(ctx, dogX, 148, dogX, 264, blue, 1.7, 'token-to-embedding');
      embeddingRow(ctx, pad, 286, width - 2 * pad);
      write(ctx, 'real embeddings are much longer', width / 2, 386, 11, muted, {align: 'center', utility: true});
    } else {
      const total = tokenWidth * labels.length + 9 * (labels.length - 1);
      const start = (width - total) / 2;
      labels.forEach((label, index) => tokenChip(ctx, label, ids[index], start + index * (tokenWidth + 9), 108, tokenWidth, index === 1, `token:${index}`));
      const dogX = start + tokenWidth + 9 + tokenWidth / 2;
      arrow(ctx, dogX, 156, dogX, 216, blue, 1.8, 'token-to-embedding', 'look up');
      embeddingRow(ctx, width * 0.17, 236, width * 0.66);
      write(ctx, 'one row is shown; real embeddings are much longer', width / 2, 342, 11, muted, {align: 'center', utility: true});
    }
  };

  const WAVE_SAMPLE_INDICES = [6, 15, 24, 32];

  const drawWaveformSamples = (ctx, x, y, width, height, seed, indices = WAVE_SAMPLE_INDICES) => {
    indices.forEach(index => {
      const px = x + (index / 36) * width;
      const py = y + height / 2 + Math.sin(index * 0.73) * height * 0.31 + Math.sin(index * 1.57) * height * 0.12;
      dot(ctx, px, py, 2.5, amber, `${seed}:sample:${index}`);
      line(ctx, px, y + height + 5, px, y + height + 12, amber, 1, `${seed}:tick:${index}`);
    });
  };

  const waveform = (ctx, x, y, width, height, seed = 'wave') => {
    const points = [];
    for (let index = 0; index <= 36; index += 1) {
      const px = x + (index / 36) * width;
      const py = y + height / 2 + Math.sin(index * 0.73) * height * 0.31 + Math.sin(index * 1.57) * height * 0.12;
      points.push([px, py]);
    }
    line(ctx, x, y + height / 2, x + width, y + height / 2, thin, 0.8, `${seed}:baseline`);
    roughPath(ctx, points, seed, blue, 1.7);
    drawWaveformSamples(ctx, x, y, width, height, seed);
  };

  const spectrogram = (ctx, x, y, width, height) => {
    panel(ctx, x, y, width, height, 8, 'spectrogram', '#fffaf0', `${ink}42`, 1.2);
    const columns = 10;
    const rows = 5;
    const cellWidth = (width - 22) / columns;
    const cellHeight = (height - 26) / rows;
    for (let column = 0; column < columns; column += 1) {
      for (let row = 0; row < rows; row += 1) {
        const value = (Math.sin(column * 0.84 + row * 1.27) + 1) / 2;
        ctx.fillStyle = `rgba(121,96,174,${0.06 + value * 0.24})`;
        ctx.fillRect(x + 11 + column * cellWidth, y + 9 + row * cellHeight, cellWidth - 2, cellHeight - 2);
      }
    }
    write(ctx, 'high frequency', x + width - 8, y + 16, 9, lavender, {align: 'right', utility: true});
    write(ctx, 'low frequency', x + width - 8, y + height - 8, 9, muted, {align: 'right', utility: true});
    write(ctx, 'time', x + width / 2, y + height + 15, 9, muted, {align: 'center', utility: true});
  };

  const sceneAudioTensor = (ctx, width, height) => {
    const mobile = isCompactLayout(width, height);
    const pad = mobile ? 18 : 30;
    const waveX = mobile ? pad : pad;
    const waveY = mobile ? 62 : 94;
    const waveHeight = 84;
    let waveWidth;
    let outputX;
    let outputWidth;
    let connectorGap;
    if (mobile) {
      waveWidth = width - 2 * pad;
    } else {
      // Derive the horizontal strip from the actual output bounds. This keeps
      // a 450–500px narrow desktop column forward-reading instead of letting
      // the arrow reverse or stop short of the spectrogram.
      outputWidth = clamp(width * 0.31, 128, 210);
      outputX = Math.max(pad + 170, width - pad - outputWidth);
      connectorGap = 14;
      waveWidth = Math.max(132, Math.min(width * 0.48, outputX - waveX - connectorGap * 2 - 28));
    }
    write(ctx, 'audio waveform', waveX, waveY - 15, 10, muted, {utility: true, weight: 700});
    waveform(ctx, waveX, waveY, waveWidth, waveHeight, 'audio-wave');
    const windowX = waveX + waveWidth * 0.52;
    ctx.save();
    ctx.fillStyle = amberSoft;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(windowX, waveY - 5, waveWidth * 0.2, 94);
    ctx.restore();
    line(ctx, windowX, waveY - 5, windowX, waveY + 89, amber, 1.5, 'audio-window-left');
    line(ctx, windowX + waveWidth * 0.2, waveY - 5, windowX + waveWidth * 0.2, waveY + 89, amber, 1.5, 'audio-window-right');
    write(ctx, 'short window', windowX + waveWidth * 0.1, waveY - 13, 10, amber, {align: 'center', utility: true, weight: 700});
    // The selected sample inside the amber window is redrawn on top of the
    // translucent fill so the transformation cue remains visible.
    drawWaveformSamples(ctx, waveX, waveY, waveWidth, waveHeight, 'audio-wave', [24]);
    if (mobile) {
      arrow(ctx, width / 2, waveY + 116, width / 2, waveY + 152, blue, 1.7, 'audio-arrow');
      spectrogram(ctx, pad, waveY + 172, width - 2 * pad, 154);
    } else {
      arrow(ctx, waveX + waveWidth + connectorGap, waveY + 42, outputX - connectorGap, waveY + 42, blue, 1.8, 'audio-arrow', 'encode');
      spectrogram(ctx, outputX, waveY - 5, outputWidth, 170);
    }
  };

  const sceneFour = (ctx, width, height, mode) => {
    begin(ctx, width, height, `TENSOR FORM  ·  ${String(mode).toUpperCase()}`);
    if (mode === 'text') sceneTextTensor(ctx, width, height);
    else if (mode === 'audio') sceneAudioTensor(ctx, width, height);
    else sceneImageTensor(ctx, width, height);
  };

  const formatNumber = (value, digits = 2) => {
    const rounded = Number(Number(value || 0).toFixed(digits));
    return Object.is(rounded, -0) ? (0).toFixed(digits) : rounded.toFixed(digits);
  };

  const drawNeuronSum = (ctx, x, y, radius, seed) => {
    ctx.save();
    ctx.fillStyle = '#fffaf0';
    ctx.strokeStyle = blue;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    write(ctx, 'Σ', x, y + 7, 23, blue, {align: 'center', utility: true, weight: 700});
    write(ctx, 'sum', x, y + radius + 15, 9, muted, {align: 'center', utility: true, weight: 700});
    // A second seeded contour keeps the hand-drawn character without adding a
    // large halo that could compete with the signal lines.
    ctx.save();
    ctx.strokeStyle = `${blue}55`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(x + jitter(`${seed}:x`, 0, 0.5), y + jitter(`${seed}:y`, 1, 0.5), radius + 2, 0.2, Math.PI * 1.92);
    ctx.stroke();
    ctx.restore();
  };

  const drawReluGate = (ctx, x, y, width, height, z, relu, seed) => {
    panel(ctx, x, y, width, height, 7, `${seed}:gate`, blueSoft, `${blue}88`, 1.4);
    write(ctx, 'ReLU(z)', x + width / 2, y + 17, 12, blue, {align: 'center', utility: true, weight: 700});
    write(ctx, `= ${formatNumber(relu)}`, x + width / 2, y + height - 9, 12, relu > 0 ? green : coral, {align: 'center', utility: true, weight: 700});
    const baselineY = y + height + 17;
    const zeroX = x + width * 0.45;
    line(ctx, x + 8, baselineY, x + width - 8, baselineY, thin, 1, `${seed}:baseline`);
    line(ctx, zeroX, baselineY - 10, zeroX, baselineY + 8, ink, 1, `${seed}:zero`);
    line(ctx, x + 9, baselineY - 7, zeroX, baselineY, coral, 1.8, `${seed}:negative`, .82, true);
    const positiveWidth = Math.max(5, (x + width - 9) - zeroX);
    const visibleWidth = relu > 0 ? clamp(positiveWidth * Math.min(relu / 1.6, 1), 5, positiveWidth) : 5;
    line(ctx, zeroX, baselineY, zeroX + visibleWidth, baselineY, green, 2.6, `${seed}:positive`, relu > 0 ? .86 : .28);
    write(ctx, 'clip negative → 0', x + width / 2, baselineY + 19, 8.5, muted, {align: 'center', utility: true});
  };

  const drawNeuronOutput = (ctx, x, y, width, height, relu, seed) => {
    panel(ctx, x, y, width, height, 7, `${seed}:output`, greenSoft, `${green}88`, 1.3);
    write(ctx, 'output', x + 9, y + 16, 10, green, {utility: true, weight: 700});
    write(ctx, formatNumber(relu), x + width - 9, y + 16, 12, green, {align: 'right', utility: true, weight: 700});
    const barX = x + 9;
    const barY = y + height - 13;
    const barWidth = Math.max(12, width - 18);
    ctx.save();
    ctx.fillStyle = '#dce8dc';
    ctx.fillRect(barX, barY - 4, barWidth, 8);
    ctx.fillStyle = green;
    ctx.globalAlpha = relu > 0 ? .82 : .18;
    ctx.fillRect(barX, barY - 4, clamp(barWidth * Math.min(relu / 1.6, 1), 0, barWidth), 8);
    ctx.restore();
  };

  const sceneFive = (ctx, width, height, state) => {
    begin(ctx, width, height, 'INSIDE ONE NEURON');
    const mobile = isCompactLayout(width, height);
    const compact = mobile || width < 560;
    const pad = compact ? 18 : 26;
    const inputs = [0.8, 0.6, 0.4];
    const weights = [
      Number.isFinite(Number(state.earWeight)) ? Number(state.earWeight) : 1.2,
      Number.isFinite(Number(state.furWeight)) ? Number(state.furWeight) : 0.6,
      Number.isFinite(Number(state.backgroundWeight)) ? Number(state.backgroundWeight) : 0.2
    ];
    const bias = Number.isFinite(Number(state.neuronBias)) ? Number(state.neuronBias) : -0.2;
    const products = inputs.map((input, index) => input * weights[index]);
    const z = products.reduce((sum, value) => sum + value, bias);
    const relu = Math.max(0, z);
    const rows = [
      ['ear shape', blue],
      ['fur texture', lavender],
      ['background', green]
    ];
    const rowYs = compact ? [86, 126, 166] : [104, 162, 220];
    const chipWidth = compact ? 84 : 96;
    const valueX = pad + chipWidth + (compact ? 11 : 15);
    const sumRadius = compact ? 25 : 29;
    // The input rail and Σ node are measured as one hand-off.  The old
    // fractional positions left only a couple of pixels between the rail and
    // the node at the real desktop visual-column width, so the arrowhead read
    // as a stray mark instead of a connection.
    const railX = compact ? width * 0.58 : width * 0.48;
    const requestedSumX = compact ? width * 0.70 : width * 0.56;
    const sumX = clamp(Math.max(requestedSumX, railX + sumRadius + 20), pad + sumRadius, width - pad - sumRadius);
    const sumY = rowYs[1];

    rows.forEach(([label, color], index) => {
      const y = rowYs[index];
      chip(ctx, label, pad, y - 13, chipWidth, `${color}16`, color, `neuron-input:${index}`, compact ? 25 : 27);
      write(ctx, formatNumber(inputs[index], 1), valueX, y + 4, compact ? 10 : 12, ink, {utility: true, weight: 700});
      const startX = valueX + (compact ? 28 : 34);
      const thickness = 1.1 + Math.min(3.8, Math.abs(weights[index]) * 1.45);
      const signalColor = weights[index] < 0 ? coral : (weights[index] === 0 ? muted : color);
      const dashed = weights[index] <= 0;
      line(ctx, startX, y, railX, y, signalColor, thickness, `neuron-input-line:${index}`, weights[index] === 0 ? .66 : .9, dashed);
      write(ctx, `${formatNumber(inputs[index], 1)} × ${formatNumber(weights[index], 1)} = ${formatNumber(products[index])}`,
        (startX + railX) / 2, y - 10, compact ? 8.5 : 10, signalColor, {align: 'center', utility: true, weight: 700});
    });
    line(ctx, railX, rowYs[0], railX, rowYs[2], blue, 1.15, 'neuron-rail', .78);
    arrow(ctx, railX, sumY, sumX - sumRadius - 5, sumY, blue, 1.7, 'neuron-sum-arrow');
    drawNeuronSum(ctx, sumX, sumY, sumRadius, 'neuron-sum');
    line(ctx, sumX, sumY - (compact ? 38 : 44), sumX, sumY - (compact ? 27 : 32), amber, 1.3, 'neuron-bias-link');
    write(ctx, `b = ${formatNumber(bias)}`, sumX, sumY - (compact ? 43 : 49), compact ? 10 : 11, amber, {align: 'center', utility: true, weight: 700});
    write(ctx, 'z = Σ(wᵢxᵢ) + b', sumX, sumY + (compact ? 53 : 58), compact ? 11 : 12, ink, {align: 'center', utility: true, weight: 700});
    write(ctx, `z = ${formatNumber(z)}`, sumX, sumY + (compact ? 70 : 76), compact ? 10 : 11, z < 0 ? coral : blue, {align: 'center', utility: true, weight: 700});

    // The activation path is a measured lane.  Every card is placed from the
    // preceding card's right edge, and every arrow is drawn from actual card
    // bounds.  This prevents a reversed ReLU→output arrow in the ~651px
    // desktop visual column and keeps the 375/390 compact path intentional.
    const pathY = compact ? 290 : Math.min(height - 104, sumY + 122);
    const zWidth = compact ? 74 : 78;
    const gateWidth = compact ? 92 : 100;
    const outputWidth = compact ? 76 : 90;
    const cardHeight = 40;
    const available = width - pad * 2;
    const minimumGap = compact ? 14 : 20;
    const panelWidth = zWidth + gateWidth + outputWidth;
    const requiredWidth = panelWidth + minimumGap * 2;
    const horizontal = available >= requiredWidth;
    if (horizontal) {
      const gap = Math.min(compact ? 24 : 44, Math.max(minimumGap, (available - panelWidth) / 2));
      const totalWidth = panelWidth + gap * 2;
      const startX = clamp((width - totalWidth) / 2, pad, width - pad - totalWidth);
      const zX = startX;
      const gateX = zX + zWidth + gap;
      const outputX = gateX + gateWidth + gap;
      panel(ctx, zX, pathY - cardHeight / 2, zWidth, cardHeight, 7, 'neuron-z-card', '#fffaf0', `${ink}52`, 1.1);
      write(ctx, 'z', zX + 12, pathY - 1, 11, muted, {utility: true, weight: 700});
      write(ctx, formatNumber(z), zX + zWidth - 10, pathY - 1, 12, z < 0 ? coral : blue, {align: 'right', utility: true, weight: 700});
      arrow(ctx, zX + zWidth + 5, pathY, gateX - 5, pathY, blue, compact ? 1.6 : 1.7, 'neuron-z-to-relu');
      drawReluGate(ctx, gateX, pathY - cardHeight / 2, gateWidth, cardHeight, z, relu, 'neuron-relu');
      arrow(ctx, gateX + gateWidth + 5, pathY, outputX - 5, pathY, green, compact ? 1.6 : 1.7, 'neuron-relu-to-output');
      drawNeuronOutput(ctx, outputX, pathY - cardHeight / 2, outputWidth, cardHeight, relu, 'neuron');
    } else {
      // Extremely narrow embeds get a vertical, still-forward fallback rather
      // than squeezed cards.  This branch is outside the ordinary phone and
      // desktop targets, but keeps the renderer's geometry contract total.
      const verticalGap = 14;
      const verticalHeight = cardHeight * 3 + verticalGap * 2 + 42;
      const startY = Math.max(sumY + 82, Math.min(pathY, height - verticalHeight));
      const center = width / 2;
      const zY = startY;
      const gateY = zY + cardHeight + verticalGap;
      const outputY = gateY + cardHeight + verticalGap + 42;
      const zX = center - zWidth / 2;
      const gateX = center - gateWidth / 2;
      const outputX = center - outputWidth / 2;
      panel(ctx, zX, zY - cardHeight / 2, zWidth, cardHeight, 7, 'neuron-z-card-vertical', '#fffaf0', `${ink}52`, 1.1);
      write(ctx, 'z', center - zWidth / 2 + 12, zY - 1, 11, muted, {utility: true, weight: 700});
      write(ctx, formatNumber(z), center + zWidth / 2 - 10, zY - 1, 12, z < 0 ? coral : blue, {align: 'right', utility: true, weight: 700});
      arrow(ctx, center, zY + cardHeight / 2 + 5, center, gateY - cardHeight / 2 - 5, blue, 1.5, 'neuron-z-to-relu-vertical');
      drawReluGate(ctx, gateX, gateY - cardHeight / 2, gateWidth, cardHeight, z, relu, 'neuron-relu-vertical');
      arrow(ctx, center, gateY + cardHeight / 2 + 28, center, outputY - cardHeight / 2 - 5, green, 1.5, 'neuron-relu-to-output-vertical');
      drawNeuronOutput(ctx, outputX, outputY - cardHeight / 2, outputWidth, cardHeight, relu, 'neuron-vertical');
    }
    write(ctx, 'line weight = |w|', pad, height - 23, 10, muted, {utility: true, weight: 700});
    write(ctx, 'coral dashed = negative weight', width - pad, height - 23, 10, coral, {align: 'right', utility: true, weight: 700});
  };

  const drawFeatureMarks = (ctx, x, y, width, height, kind, seed) => {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (kind === 'pixels') {
      const columns = 6;
      const rows = 4;
      const cellW = (width - 18) / columns;
      const cellH = (height - 16) / rows;
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const value = (Math.sin((row + 1) * 1.4 + (column + 2) * .72) + 1) / 2;
          ctx.fillStyle = `rgba(53,111,174,${.12 + value * .42})`;
          ctx.fillRect(x + 9 + column * cellW, y + 8 + row * cellH, Math.max(2, cellW - 3), Math.max(2, cellH - 3));
        }
      }
    } else if (kind === 'edges') {
      for (let index = 0; index < 5; index += 1) {
        const startX = x + 12 + (index % 2) * (width * .26);
        const band = Math.max(3, (height - 24) / 4);
        const startY = y + 12 + (index % 4) * band;
        const lower = Math.min(10, Math.max(3, height - 14));
        const upper = Math.min(6, Math.max(3, height - 18));
        line(ctx, startX, startY + lower, startX + width * .52, startY - upper, blue, 1.4, `${seed}:edge:${index}`, .72);
      }
    } else if (kind === 'textures') {
      const rows = 4;
      for (let row = 0; row < rows; row += 1) {
        const yy = y + 12 + row * Math.max(8, (height - 24) / rows);
        for (let column = 0; column < 5; column += 1) {
          const xx = x + 12 + column * Math.max(8, (width - 24) / 5);
          roughPath(ctx, [[xx, yy + 4], [xx + 4, yy - 2], [xx + 8, yy + 4]], `${seed}:texture:${row}:${column}`, amber, 1.1, .66);
        }
      }
    } else {
      const size = Math.min(width, height) * .55;
      drawDog(ctx, x + width / 2, y + height * .53, size, '#8b6b4f', 1, 0);
      line(ctx, x + width * .14, y + height * .82, x + width * .86, y + height * .82, green, 1.2, `${seed}:ground`, .46);
    }
    ctx.restore();
  };

  const featureSheet = (ctx, x, y, width, height, label, color, index, compact) => {
    const palette = [blueSoft, lavenderSoft, amberSoft, greenSoft];
    panel(ctx, x, y, width, height, 8, `feature-sheet:${index}`, palette[index], `${color}88`, 1.3);
    write(ctx, label.toUpperCase(), x + 10, y - 8, compact ? 10 : 11, color, {utility: true, weight: 700});
    drawFeatureMarks(ctx, x, y, width, height, label, `feature:${index}`);
  };

  const sceneSix = (ctx, width, height) => {
    begin(ctx, width, height, 'DEPTH BUILDS FEATURES');
    const mobile = isCompactLayout(width, height);
    const compact = mobile || width < 560;
    const labels = ['pixels', 'edges', 'textures', 'parts'];
    const colors = [blue, lavender, amber, green];
    if (compact) {
      const pad = 20;
      const cardWidth = width - pad * 2;
      // Measure the stack against the actual stage height.  The old fixed
      // 62/140/218/296 rhythm could put the class chip back inside `parts`
      // when a narrow desktop embed was shorter than a phone stage.
      const footerReserve = 28;
      const cardY = height < 360 ? 40 : (height < 420 ? 50 : 62);
      const classHeight = 29;
      const classGap = 16;
      const arrowGap = 16;
      const maximumCardHeight = (height - cardY - footerReserve - classHeight - classGap - arrowGap * 4) / 4;
      const cardHeight = clamp(maximumCardHeight, 40, 58);
      const step = cardHeight + arrowGap;
      labels.forEach((label, index) => {
        const y = cardY + index * step;
        featureSheet(ctx, pad, y, cardWidth, cardHeight, label, colors[index], index, true);
        if (index < labels.length - 1) arrow(ctx, width / 2, y + cardHeight + 5, width / 2, y + step - 5, colors[index], 1.5, `features-arrow:${index}`);
      });
      const classY = cardY + 3 * step + cardHeight + classGap;
      const partsBottom = cardY + 3 * step + cardHeight;
      arrow(ctx, width / 2, partsBottom + 5, width / 2, classY - 5, green, 1.6, 'features-to-class');
      chip(ctx, 'DOG  ·  class', width / 2 - 55, classY, 110, greenSoft, green, 'feature-class', 29);
      write(ctx, 'same signal → richer description → decision', width / 2, height - 19, 10, muted, {align: 'center', utility: true, weight: 700});
    } else {
      const pad = width < 600 ? 18 : 28;
      const classWidth = width < 600 ? 72 : 84;
      const arrowSlot = width < 600 ? 34 : 40;
      // Reserve an intentional final-class gutter.  A 18px slot minus the
      // two 8px insets left only a 2px connector, which read as a collision.
      const lastGap = width < 600 ? 32 : 40;
      const cardWidth = clamp((width - 2 * pad - classWidth - 3 * arrowSlot - lastGap) / 4, 76, 112);
      const cardHeight = clamp(height * .38, 126, 174);
      const total = cardWidth * 4 + arrowSlot * 3 + lastGap + classWidth;
      const startX = Math.max(pad, (width - total) / 2);
      const cardY = 104;
      labels.forEach((label, index) => {
        const x = startX + index * (cardWidth + arrowSlot);
        featureSheet(ctx, x, cardY, cardWidth, cardHeight, label, colors[index], index, false);
        if (index < labels.length - 1) {
          const nextX = x + cardWidth + arrowSlot;
          arrow(ctx, x + cardWidth + 8, cardY + cardHeight / 2, nextX - 8, cardY + cardHeight / 2, colors[index], 1.6, `features-arrow:${index}`);
        }
      });
      const partsX = startX + 3 * (cardWidth + arrowSlot);
      const classX = partsX + cardWidth + lastGap;
      arrow(ctx, partsX + cardWidth + 8, cardY + cardHeight / 2, classX - 8, cardY + cardHeight / 2, green, 1.7, 'features-to-class');
      chip(ctx, 'DOG', classX, cardY + cardHeight / 2 - 15, classWidth, greenSoft, green, 'feature-class', 30);
      write(ctx, 'pixels → edges → textures → parts → class', width / 2, height - 22, 10, muted, {align: 'center', utility: true, weight: 700});
    }
  };

  let learningTrace = {
    lastStep: null,
    progress: 0.08,
    loss: 0.82,
    rate: 0.5
  };

  const syncLearningTrace = state => {
    const step = Math.max(1, Math.round(Number(state.learnStep) || 3));
    const rate = clamp(Number(state.learningRate) || .5, .1, 1);
    if (learningTrace.lastStep === null) {
      learningTrace.lastStep = step;
      learningTrace.progress = clamp(.08 + (step - 1) * .09, .08, .86);
      learningTrace.loss = clamp(.86 - (step - 1) * .06, .18, .86);
      learningTrace.rate = rate;
      return;
    }
    if (step < learningTrace.lastStep) {
      learningTrace.lastStep = step;
      learningTrace.progress = clamp(.08 + (step - 1) * .09, .08, .86);
      learningTrace.loss = clamp(.86 - (step - 1) * .06, .18, .86);
    } else if (step > learningTrace.lastStep) {
      for (let current = learningTrace.lastStep; current < step; current += 1) {
        learningTrace.progress = (learningTrace.progress + .075 + rate * .07) % 1;
        learningTrace.loss = Math.max(.12, learningTrace.loss - (.035 + rate * .035));
      }
      learningTrace.lastStep = step;
    }
    // Changing the rate redraws the prospective update vector, but does not
    // rewrite the already-observed loss/marker until the user runs a step.
    learningTrace.rate = rate;
  };

  const drawLoopNode = (ctx, x, y, width, height, number, title, subtitle, color, seed, updateLength = 0) => {
    panel(ctx, x - width / 2, y - height / 2, width, height, 9, seed, '#fffaf0', `${color}88`, 1.5);
    ctx.save();
    ctx.fillStyle = `${color}18`;
    ctx.beginPath();
    ctx.arc(x - width / 2 + 18, y - height / 2 + 17, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    write(ctx, String(number), x - width / 2 + 18, y - height / 2 + 21, 9, color, {align: 'center', utility: true, weight: 700});
    write(ctx, title, x, y - 3, 12, color, {align: 'center', utility: true, weight: 700});
    if (updateLength) {
      const vectorY = y + 14;
      arrow(ctx, x - updateLength / 2, vectorY, x + updateLength / 2, vectorY, amber, 1.8, `${seed}:update-vector`);
    }
    write(ctx, subtitle, x, y + height / 2 + 17, 10, muted, {align: 'center', utility: true, weight: 700});
  };

  const loopPoint = (progress, left, right, top, bottom) => {
    const lengths = [right - left, bottom - top, right - left, bottom - top];
    const perimeter = lengths.reduce((sum, value) => sum + value, 0);
    let distance = ((progress % 1) + 1) % 1 * perimeter;
    if (distance <= lengths[0]) return [left + distance, top];
    distance -= lengths[0];
    if (distance <= lengths[1]) return [right, top + distance];
    distance -= lengths[1];
    if (distance <= lengths[2]) return [right - distance, bottom];
    distance -= lengths[2];
    return [left, bottom - Math.min(distance, lengths[3])];
  };

  const sceneSeven = (ctx, width, height, state) => {
    begin(ctx, width, height, 'HOW LEARNING HAPPENS');
    const mobile = isCompactLayout(width, height);
    const compact = mobile || width < 560;
    // Keep a real interior lane for the current-loss card on phones. The
    // quadrants stay readable while the loop's side rails remain outside that
    // card instead of disappearing behind it.
    const pad = compact ? 22 : 46;
    // Narrow the side cards just enough to create a real interior lane.  The
    // previous 104px cards left the rails exactly under the fixed 96px center
    // card at the 390px target, so painting order hid both vertical rails.
    const nodeWidth = compact ? 88 : 134;
    const nodeHeight = compact ? 56 : 60;
    const left = pad + nodeWidth / 2;
    const right = width - pad - nodeWidth / 2;
    const top = compact ? 100 : 103;
    const bottom = compact ? 304 : Math.min(height - 126, 292);
    const routeLeft = left + nodeWidth / 2 + 8;
    const routeRight = right - nodeWidth / 2 - 8;
    const routeTop = top;
    const routeBottom = bottom;
    const centerX = width / 2;
    const centerY = (top + bottom) / 2 + (compact ? 3 : 0);
    const rate = clamp(Number(state.learningRate) || .5, .1, 1);
    const loss = learningTrace.loss;
    const step = Math.max(1, Math.round(Number(state.learnStep) || 3));

    arrow(ctx, routeLeft, routeTop, routeRight, routeTop, blue, 1.7, 'learn-forward');
    arrow(ctx, routeRight, routeTop + 11, routeRight, routeBottom - 11, coral, 1.7, 'learn-loss');
    arrow(ctx, routeRight, routeBottom, routeLeft, routeBottom, lavender, 1.7, 'learn-backprop');
    arrow(ctx, routeLeft, routeBottom - 11, routeLeft, routeTop + 11, amber, 1.7, 'learn-update');
    arrow(ctx, pad - 17, top, left - nodeWidth / 2 - 8, top, blue, 1.4, 'learn-start', 'start');

    drawLoopNode(ctx, left, top, nodeWidth, nodeHeight, 1, 'FORWARD', 'make a guess', blue, 'learn-forward-node');
    drawLoopNode(ctx, right, top, nodeWidth, nodeHeight, 2, 'LOSS', 'measure error', coral, 'learn-loss-node');
    drawLoopNode(ctx, right, bottom, nodeWidth, nodeHeight, 3, 'BACKPROP', 'assign blame', lavender, 'learn-backprop-node');
    drawLoopNode(ctx, left, bottom, nodeWidth, nodeHeight, 4, 'UPDATE', 'nudge weights', amber, 'learn-update-node', 12 + rate * 18);

    const interiorGap = routeRight - routeLeft;
    const centerWidth = compact ? Math.max(52, Math.min(104, interiorGap - 24)) : 144;
    const centerHeight = compact ? 66 : 70;
    panel(ctx, centerX - centerWidth / 2, centerY - centerHeight / 2, centerWidth, centerHeight, 9, 'learn-center', '#fffaf0', `${ink}42`, 1.1);
    const centerLabelSize = centerWidth < 84 ? 8 : 9;
    write(ctx, 'CURRENT LOSS', centerX, centerY - 15, centerLabelSize, muted, {align: 'center', utility: true, weight: 700});
    write(ctx, formatNumber(loss), centerX, centerY + 8, centerWidth < 76 ? 18 : 22, coral, {align: 'center', utility: true, weight: 700});
    write(ctx, centerWidth < 84 ? `batch 32 · r${rate.toFixed(1)}` : `batch 32  ·  rate ${rate.toFixed(1)}`, centerX, centerY + 25, centerWidth < 84 ? 8 : 9, ink, {align: 'center', utility: true});

    const marker = loopPoint(learningTrace.progress, routeLeft, routeRight, routeTop, routeBottom);
    dot(ctx, marker[0], marker[1], 5, ink, 'learn-marker');
    // Keep the moving marker quiet and put its state label in a measured
    // reserve gutter.  Candidate badge positions are tested against every
    // node and the center card, so no reachable progress/rate state can push
    // `step N` into BACKPROP (or any other loop node).
    const nodeRects = [
      {x: left - nodeWidth / 2, y: top - nodeHeight / 2, width: nodeWidth, height: nodeHeight},
      {x: right - nodeWidth / 2, y: top - nodeHeight / 2, width: nodeWidth, height: nodeHeight},
      {x: right - nodeWidth / 2, y: bottom - nodeHeight / 2, width: nodeWidth, height: nodeHeight},
      {x: left - nodeWidth / 2, y: bottom - nodeHeight / 2, width: nodeWidth, height: nodeHeight},
      {x: centerX - centerWidth / 2, y: centerY - centerHeight / 2, width: centerWidth, height: centerHeight}
    ];
    const badgeWidth = compact ? 64 : 72;
    const badgeHeight = 22;
    const badgeCandidates = [
      [width - pad - badgeWidth, 34],
      [pad, 34],
      [width - pad - badgeWidth, Math.max(34, height - 56)],
      [pad, Math.max(34, height - 56)]
    ];
    const overlaps = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
    const badge = badgeCandidates.map(([x, y]) => ({x, y, width: badgeWidth, height: badgeHeight})).find(candidate => !nodeRects.some(rect => overlaps(candidate, rect))) || {x: pad, y: 34, width: badgeWidth, height: badgeHeight};
    chip(ctx, `step ${step}`, badge.x, badge.y, badge.width, '#fffaf0', ink, 'learn-step-badge', badge.height);
    write(ctx, 'gradient = direction  ·  learning rate = step size', width / 2, height - 20, 10, muted, {align: 'center', utility: true, weight: 700});
  };

  const trainingCurve = Array.from({length: 24}, (_, index) => 1.16 * Math.exp(-index / 8.2) + .13);
  const validationCurve = Array.from({length: 24}, (_, index) => .98 * Math.exp(-index / 6.8) + .16 + Math.max(0, index - 9) * .041);
  const bestValidationEpoch = validationCurve.reduce((best, value, index, values) => value < values[best] ? index : best, 0) + 1;

  const sceneEight = (ctx, width, height, state) => {
    begin(ctx, width, height, 'LEARN PATTERNS, NOT THE ANSWER SHEET');
    const mobile = isCompactLayout(width, height);
    const compact = mobile || width < 560;
    const padLeft = compact ? 43 : 56;
    const padRight = compact ? 18 : 30;
    const plotTop = compact ? 88 : 76;
    const plotBottom = Math.max(plotTop + 150, height - (compact ? 142 : 126));
    const plotLeft = padLeft;
    const plotRight = width - padRight;
    const plotWidth = plotRight - plotLeft;
    const plotHeight = plotBottom - plotTop;
    const epoch = clamp(Math.round(Number(state.epoch) || 12), 1, 24);
    const xForEpoch = value => plotLeft + ((value - 1) / 23) * plotWidth;
    const yForLoss = value => plotBottom - clamp((value - .1) / 1.25, 0, 1) * plotHeight;
    const curvePoint = (values, index) => [xForEpoch(index + 1), yForLoss(values[index])];

    // At compact width the legend gets its own two-row lane on the left; the
    // best-validation chip remains in the right lane and never competes with
    // the validation label at the 375px canvas width.
    if (compact) {
      dot(ctx, plotLeft + 4, 42, 3, blue, 'chart-legend-train');
      write(ctx, 'training', plotLeft + 13, 46, 10, blue, {utility: true, weight: 700});
      dot(ctx, plotLeft + 4, 64, 3, coral, 'chart-legend-validation');
      write(ctx, 'validation', plotLeft + 13, 68, 10, coral, {utility: true, weight: 700});
    } else {
      dot(ctx, plotLeft + 4, 46, 3, blue, 'chart-legend-train');
      write(ctx, 'training', plotLeft + 13, 50, 10, blue, {utility: true, weight: 700});
      dot(ctx, plotLeft + 92, 46, 3, coral, 'chart-legend-validation');
      write(ctx, 'validation', plotLeft + 101, 50, 10, coral, {utility: true, weight: 700});
    }
    const calloutWidth = compact ? 130 : 150;
    chip(ctx, `best val  ·  epoch ${bestValidationEpoch}`, plotRight - calloutWidth, 32, calloutWidth, greenSoft, green, 'chart-best-callout', 22);

    for (let index = 0; index <= 4; index += 1) {
      const y = plotTop + (plotHeight / 4) * index;
      line(ctx, plotLeft, y, plotRight, y, thin, .8, `chart-grid:${index}`, .55, true);
      write(ctx, formatNumber(1.25 - index * .2875, 1), plotLeft - 9, y + 4, 9, muted, {align: 'right', utility: true});
    }
    line(ctx, plotLeft, plotTop, plotLeft, plotBottom, ink, 1.1, 'chart-y-axis');
    line(ctx, plotLeft, plotBottom, plotRight, plotBottom, ink, 1.1, 'chart-x-axis');
    // All layouts use the same dedicated rotated y-axis gutter. Tick labels
    // stay right-aligned at plotLeft−9 and can never share the horizontal
    // text envelope that previously collided with them on desktop.
    ctx.save();
    ctx.translate(plotLeft - 32, plotTop + plotHeight / 2);
    ctx.rotate(-Math.PI / 2);
    write(ctx, 'loss', 0, 0, 9, muted, {align: 'center', utility: true, weight: 700});
    ctx.restore();
    // The x-axis label lives below the three regime cells, never inside them.
    const zoneY = plotBottom + 28;
    const zoneHeight = 20;
    write(ctx, 'epoch', plotRight, zoneY + zoneHeight + 16, 9, muted, {align: 'right', utility: true, weight: 700});

    const drawCurve = (values, color, seed) => {
      const points = values.slice(0, epoch).map((_, index) => curvePoint(values, index));
      roughPath(ctx, points, seed, color, 2.1, .9);
      if (points.length) dot(ctx, points[points.length - 1][0], points[points.length - 1][1], 3.5, color, `${seed}:current`);
    };
    drawCurve(trainingCurve, blue, 'chart-training');
    drawCurve(validationCurve, coral, 'chart-validation');

    const bestPoint = curvePoint(validationCurve, bestValidationEpoch - 1);
    if (epoch >= bestValidationEpoch) {
      line(ctx, bestPoint[0], plotTop, bestPoint[0], plotBottom, green, 1.4, 'chart-best-line', .84, true);
      dot(ctx, bestPoint[0], bestPoint[1], 5, green, 'chart-best-dot');
    }
    const currentX = xForEpoch(epoch);
    line(ctx, currentX, plotBottom + 1, currentX, plotBottom + 9, ink, 1.8, 'chart-current-tick');
    write(ctx, `epoch ${epoch}`, clamp(currentX, plotLeft + 30, plotRight - 30), plotBottom + 22, 9, ink, {align: 'center', utility: true, weight: 700});

    const zones = [
      [1, 7, 'underfit', amberSoft, amber],
      [8, 14, 'useful fit', greenSoft, green],
      [15, 24, 'overfit', coralSoft, coral]
    ];
    zones.forEach(([start, end, label, fill, color], index) => {
      const x = xForEpoch(start);
      const right = xForEpoch(end);
      ctx.save();
      ctx.fillStyle = fill;
      ctx.globalAlpha = .7;
      ctx.fillRect(x, zoneY, Math.max(2, right - x), zoneHeight);
      ctx.restore();
      write(ctx, label, x + (right - x) / 2, zoneY + 14, mobile ? 8.5 : 9, color, {align: 'center', utility: true, weight: 700});
      if (index < zones.length - 1) line(ctx, right, zoneY, right, zoneY + zoneHeight, `${ink}35`, .8, `chart-zone:${index}`);
    });
  };

  const drawImageGrid = (ctx, x, y, size, seed, highlight = true) => {
    const count = 8;
    const cell = (size - 16) / count;
    panel(ctx, x, y, size, size, 8, `${seed}:frame`, '#fffaf0', `${blue}88`, 1.4);
    for (let row = 0; row < count; row += 1) {
      for (let column = 0; column < count; column += 1) {
        const value = (Math.sin((row + 1) * 1.21 + (column + 2) * .83) + 1) / 2;
        ctx.save();
        ctx.fillStyle = `rgba(53,111,174,${.12 + value * .42})`;
        ctx.fillRect(x + 8 + column * cell, y + 8 + row * cell, Math.max(2, cell - 2), Math.max(2, cell - 2));
        ctx.restore();
      }
    }
    if (highlight) {
      const hx = x + 8 + 2 * cell;
      const hy = y + 8 + 2 * cell;
      const hSize = cell * 3;
      line(ctx, hx, hy, hx + hSize, hy, coral, 2.2, `${seed}:stencil-top`);
      line(ctx, hx + hSize, hy, hx + hSize, hy + hSize, coral, 2.2, `${seed}:stencil-right`);
      line(ctx, hx + hSize, hy + hSize, hx, hy + hSize, coral, 2.2, `${seed}:stencil-bottom`);
      line(ctx, hx, hy + hSize, hx, hy, coral, 2.2, `${seed}:stencil-left`);
      dot(ctx, hx + hSize + 7, hy + hSize / 2, 3, coral, `${seed}:stencil-dot`);
    }
  };

  const drawFilterBank = (ctx, x, y, width, height, seed) => {
    panel(ctx, x, y, width, height, 8, `${seed}:frame`, '#fffaf0', `${amber}88`, 1.3);
    const swatch = Math.max(22, Math.min(44, (width - 28) / 3, height - 34));
    const startX = x + (width - swatch * 3 - 12) / 2;
    for (let filter = 0; filter < 3; filter += 1) {
      const sx = startX + filter * (swatch + 6);
      panel(ctx, sx, y + 18, swatch, swatch, 4, `${seed}:swatch:${filter}`, filter === 1 ? amberSoft : blueSoft, `${[blue, amber, lavender][filter]}88`, filter === 1 ? 2 : 1);
      for (let row = 0; row < 3; row += 1) {
        for (let column = 0; column < 3; column += 1) {
          ctx.save();
          ctx.fillStyle = `${[blue, amber, lavender][filter]}${['28', '62', 'a0'][(row + column + filter) % 3]}`;
          ctx.fillRect(sx + 7 + column * ((swatch - 14) / 3), y + 25 + row * ((swatch - 14) / 3), Math.max(2, (swatch - 18) / 3), Math.max(2, (swatch - 18) / 3));
          ctx.restore();
        }
      }
    }
    write(ctx, 'many learned filters', x + width / 2, y + height - 10, 9, muted, {align: 'center', utility: true, weight: 700});
  };

  const drawFeatureMap = (ctx, x, y, size, seed) => {
    const count = 5;
    const cell = (size - 14) / count;
    panel(ctx, x, y, size, size, 8, `${seed}:frame`, '#fffaf0', `${green}88`, 1.4);
    for (let row = 0; row < count; row += 1) {
      for (let column = 0; column < count; column += 1) {
        const value = (Math.sin((row + 2) * 1.09 + (column + 1) * .72) + 1) / 2;
        ctx.save();
        ctx.fillStyle = `rgba(79,149,107,${.13 + value * .55})`;
        ctx.fillRect(x + 7 + column * cell, y + 7 + row * cell, Math.max(3, cell - 2), Math.max(3, cell - 2));
        ctx.restore();
      }
    }
    const hotspot = x + 7 + 2 * cell + cell / 2;
    const hotspotY = y + 7 + 2 * cell + cell / 2;
    dot(ctx, hotspot, hotspotY, 3.5, green, `${seed}:hotspot`);
  };

  const drawScoreList = (ctx, x, y, width, height, scores, seed) => {
    panel(ctx, x, y, width, height, 8, `${seed}:frame`, '#fffaf0', `${blue}55`, 1.2);
    write(ctx, 'NEXT-WORD SCORES', x + 12, y + 18, 9, blue, {utility: true, weight: 700});
    const barX = x + 48;
    const barWidth = Math.max(34, width - 88);
    const rowGap = Math.min(30, (height - 30) / scores.length);
    scores.forEach(([label, value], index) => {
      const rowY = y + 37 + index * rowGap;
      write(ctx, label, x + 12, rowY + 4, 9.5, index === 0 ? green : ink, {utility: true, weight: 700});
      ctx.save();
      ctx.fillStyle = '#e6e1d7';
      ctx.fillRect(barX, rowY - 4, barWidth, 8);
      ctx.fillStyle = index === 0 ? green : blue;
      ctx.globalAlpha = index === 0 ? .84 : .42;
      ctx.fillRect(barX, rowY - 4, barWidth * value, 8);
      ctx.restore();
      write(ctx, `${Math.round(value * 100)}%`, x + width - 10, rowY + 4, 9, index === 0 ? green : muted, {align: 'right', utility: true, weight: 700});
    });
  };

  const sceneNineCnn = (ctx, width, height, compact) => {
    const compactScale = clamp((height - 350) / 141, .72, 1);
    const gridSize = compact ? Math.min(132, width - 44, 132 * compactScale) : 132;
    const mapSize = compact ? Math.min(108, 108 * compactScale) : 132;
    if (compact) {
      const center = width / 2;
      const gridY = height < 470 ? 64 : 78;
      const bankY = gridY + gridSize + 38;
      const bankHeight = Math.max(62, 78 * compactScale);
      const bankBottom = bankY + bankHeight;
      const outputGap = Math.max(28, 34 * compactScale);
      const footerY = height - 19;
      // Size the output from the available lower lane first. The former
      // fixed 18px offset left only a five-pixel arrow and put its label on
      // top of the connector at compact widths.
      const compactMapSize = Math.min(
        mapSize,
        Math.max(58, footerY - bankBottom - outputGap - 32)
      );
      const mapY = bankBottom + outputGap;
      const mapLabelY = mapY + compactMapSize + 16;
      write(ctx, 'input image', center, gridY - 10, 10, blue, {align: 'center', utility: true, weight: 700});
      drawImageGrid(ctx, center - gridSize / 2, gridY, gridSize, 'cnn-input');
      write(ctx, 'one 3×3 stencil', center, bankY - 12, 10, coral, {align: 'center', utility: true, weight: 700});
      arrow(ctx, center, gridY + gridSize + 7, center, bankY - 5, coral, 1.6, 'cnn-scan-down');
      const bankWidth = Math.min(252, width - 36);
      drawFilterBank(ctx, center - bankWidth / 2, bankY, bankWidth, bankHeight, 'cnn-bank');
      arrow(ctx, center, bankBottom + 7, center, mapY - 9, green, 1.6, 'cnn-map-down');
      drawFeatureMap(ctx, center - compactMapSize / 2, mapY, compactMapSize, 'cnn-map');
      // Keep the map annotation below the output card, away from the
      // bank→map connector and its arrowhead.
      write(ctx, 'one related feature map', center, mapLabelY, 10, green, {align: 'center', utility: true, weight: 700});
      write(ctx, 'TRAIN learns the bank  ·  TEST reuses it', center, height - 19, 9.5, muted, {align: 'center', utility: true, weight: 700});
    } else {
      const y = 126;
      const gridX = 28;
      const bankX = Math.round(width * .42);
      const mapX = width - 28 - mapSize;
      write(ctx, 'input image', gridX + gridSize / 2, y - 13, 10, blue, {align: 'center', utility: true, weight: 700});
      drawImageGrid(ctx, gridX, y, gridSize, 'cnn-input');
      arrow(ctx, gridX + gridSize + 9, y + gridSize / 2, bankX - 10, y + gridSize / 2, coral, 1.7, 'cnn-scan-right', 'scan');
      write(ctx, 'one 3×3 stencil', bankX + 42, y - 13, 10, coral, {align: 'center', utility: true, weight: 700});
      drawFilterBank(ctx, bankX, y, 84, 132, 'cnn-bank');
      arrow(ctx, bankX + 94, y + gridSize / 2, mapX - 10, y + gridSize / 2, green, 1.7, 'cnn-map-right');
      write(ctx, 'one related feature map', mapX + mapSize / 2, y - 13, 10, green, {align: 'center', utility: true, weight: 700});
      drawFeatureMap(ctx, mapX, y, mapSize, 'cnn-map');
      write(ctx, 'TRAIN learns the bank  ·  TEST reuses it', width / 2, height - 20, 9.5, muted, {align: 'center', utility: true, weight: 700});
    }
  };

  const sceneNineRnn = (ctx, width, height, compact) => {
    const labels = ['THE', 'DOG', 'CHASED'];
    const centers = compact ? [width * .19, width * .5, width * .81] : [118, 258, 398];
    const stateY = compact ? (height < 470 ? 156 : 170) : 188;
    const radius = compact ? 34 : 38;
    const scoreWidth = compact ? Math.min(280, width - 44) : 148;
    const scoreX = compact ? width / 2 - scoreWidth / 2 : width - scoreWidth - 24;
    const footerY = height - 19;
    const scoreHeight = compact ? (height < 440 ? 104 : 126) : 194;
    const predictionHeight = 24;
    const predictionGap = compact ? 12 : 11;
    const predictionY = compact ? footerY - predictionHeight - 10 : 321;
    const scoreY = compact ? predictionY - scoreHeight - predictionGap : 116;
    // The descriptor has a dedicated lane between the scene title and the
    // token chips; it no longer competes with the title baseline.
    write(ctx, 'same update rule', compact ? width / 2 : (centers[0] + centers[2]) / 2, compact ? 64 : 82, 10, lavender, {align: 'center', utility: true, weight: 700});
    centers.forEach((center, index) => {
      if (index < centers.length - 1) arrow(ctx, center + radius + 7, stateY, centers[index + 1] - radius - 7, stateY, blue, 1.6, `rnn-state:${index}`);
      chip(ctx, labels[index], center - 34, stateY - radius - 44, 68, index === 1 ? lavenderSoft : '#fffaf0', index === 1 ? lavender : ink, `rnn-token:${index}`, 24);
      ctx.save();
      ctx.fillStyle = '#fffaf0';
      ctx.beginPath();
      ctx.arc(center, stateY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `${lavender}aa`;
      ctx.lineWidth = 1.7;
      ctx.stroke();
      ctx.restore();
      write(ctx, `h${index + 1}`, center, stateY + 5, compact ? 14 : 16, lavender, {align: 'center', utility: true, weight: 700});
      if (!compact) write(ctx, 'hidden state', center, stateY + radius + 18, 8.5, muted, {align: 'center', utility: true});
    });
    if (!compact) arrow(ctx, centers[2] + radius + 8, stateY, scoreX - 10, stateY, green, 1.7, 'rnn-to-scores');
    if (compact) arrow(ctx, centers[1], stateY + radius + 16, width / 2, scoreY - 9, green, 1.6, 'rnn-to-scores-down');
    drawScoreList(ctx, scoreX, scoreY, scoreWidth, scoreHeight, [['BALL', .67], ['CAT', .18], ['HOME', .09], ['…', .06]], 'rnn-scores');
    chip(ctx, 'predict BALL', compact ? width / 2 - 56 : scoreX + 16, predictionY, 112, amberSoft, amber, 'rnn-prediction', 24);
    write(ctx, 'three steps are enough to show compressed memory', width / 2, footerY, 9.5, muted, {align: 'center', utility: true, weight: 700});
  };

  const sceneNineTransformer = (ctx, width, height, compact) => {
    const tokens = ['THE', 'ANIMAL', 'IT', 'WAS', 'TIRED'];
    const tokenWidth = compact ? Math.min(56, (width - 44) / tokens.length - 5) : 66;
    const tokenGap = compact ? 5 : 12;
    const total = tokens.length * tokenWidth + (tokens.length - 1) * tokenGap;
    const startX = (width - total) / 2;
    const tokenY = compact ? 158 : 170;
    const selectedIndex = 2;
    const centers = tokens.map((_, index) => startX + index * (tokenWidth + tokenGap) + tokenWidth / 2);
    const qkvY = compact ? 74 : 72;
    const badgeWidth = compact ? Math.min(104, (width - 48) / 3) : 118;
    const qkvGap = compact ? 5 : 10;
    const qkvTotal = badgeWidth * 3 + qkvGap * 2;
    const qkvStart = (width - qkvTotal) / 2;
    chip(ctx, 'Q  ·  ask', qkvStart, qkvY, badgeWidth, blueSoft, blue, 'transformer-q', 24);
    chip(ctx, 'K  ·  match', qkvStart + badgeWidth + qkvGap, qkvY, badgeWidth, amberSoft, amber, 'transformer-k', 24);
    chip(ctx, 'V  ·  carry', qkvStart + (badgeWidth + qkvGap) * 2, qkvY, badgeWidth, greenSoft, green, 'transformer-v', 24);
    write(ctx, 'dedicated query · key · value row', width / 2, compact ? 66 : qkvY - 9, 9, muted, {align: 'center', utility: true, weight: 700});
    tokens.forEach((token, index) => chip(ctx, token, startX + index * (tokenWidth + tokenGap), tokenY, tokenWidth, index === selectedIndex ? '#e8e8ff' : '#fffaf0', index === selectedIndex ? lavender : ink, `transformer-token:${index}`, compact ? 28 : 30));
    // The query label sits in the measured gap above the token row, leaving
    // every attention drop below the token baseline instead of crossing text.
    write(ctx, 'selected query', centers[selectedIndex], tokenY - 9, 9, lavender, {align: 'center', utility: true, weight: 700});
    const links = [[1, .92, green], [3, .56, blue], [4, .34, amber]];
    const laneBase = compact ? tokenY + 78 : tokenY + 86;
    links.forEach(([target, weight, color], index) => {
      const laneY = laneBase + index * (compact ? 25 : 29);
      const source = centers[selectedIndex];
      const destination = centers[target];
      // Fan the three links by a few pixels at the selected token. This keeps
      // each vertical drop in its own lane instead of stacking three strokes
      // on one column and making the attention map look like a knot.
      const sourceLane = source + (index - 1) * (compact ? 4 : 5);
      line(ctx, source, tokenY + 31, sourceLane, tokenY + 31, color, 1 + weight * 2.4, `transformer-link:${index}:fan`, .45 + weight * .5);
      line(ctx, sourceLane, tokenY + 31, sourceLane, laneY, color, 1 + weight * 2.4, `transformer-link:${index}:down`, .45 + weight * .5);
      line(ctx, sourceLane, laneY, destination, laneY, color, 1 + weight * 2.4, `transformer-link:${index}:across`, .45 + weight * .5);
      line(ctx, destination, laneY, destination, tokenY + 31, color, 1 + weight * 2.4, `transformer-link:${index}:up`, .45 + weight * .5);
      dot(ctx, destination, tokenY + 35, 3, color, `transformer-target:${index}`);
      write(ctx, `${Math.round(weight * 100)}%`, (source + destination) / 2, laneY - 5, 8.5, color, {align: 'center', utility: true, weight: 700});
    });
    const contextY = compact ? Math.min(337, height - 96) : 322;
    const contextWidth = compact ? Math.min(280, width - 44) : 250;
    chip(ctx, 'context for IT  ←  mostly ANIMAL', width / 2 - contextWidth / 2, contextY, contextWidth, greenSoft, green, 'transformer-context', 30);
    // Carry the strongest ANIMAL relationship into the explicit context
    // result, so the final claim is diagrammed rather than implied.
    const strongestDestination = centers[1];
    const contextHandoffY = contextY - 9;
    line(ctx, strongestDestination, laneBase, strongestDestination, contextHandoffY, green, 1 + .92 * 2.4, 'transformer-context:drop', .45 + .92 * .5);
    arrow(ctx, strongestDestination, contextHandoffY, strongestDestination, contextY - 1, green, 1 + .92 * 2.4, 'transformer-context:handoff');
    write(ctx, 'query asks  ·  keys match  ·  values carry context', width / 2, height - 19, 9.5, muted, {align: 'center', utility: true, weight: 700});
  };

  const sceneNine = (ctx, width, height, state) => {
    begin(ctx, width, height, 'CHOOSE AN ARCHITECTURE');
    const compact = width < 560 || height < 456;
    const architecture = ['cnn', 'rnn', 'transformer'].includes(state.architecture) ? state.architecture : 'cnn';
    const titles = {cnn: 'local patterns', rnn: 'running memory', transformer: 'relevance on demand'};
    write(ctx, titles[architecture], 24, 49, compact ? 18 : 21, ink, {weight: 700});
    if (architecture === 'cnn') sceneNineCnn(ctx, width, height, compact);
    else if (architecture === 'rnn') sceneNineRnn(ctx, width, height, compact);
    else sceneNineTransformer(ctx, width, height, compact);
  };

  const sceneTen = (ctx, width, height) => {
    begin(ctx, width, height, 'START FROM A PRETRAINED MODEL');
    const compact = width < 560 || height < 456;
    const features = ['edges', 'textures', 'curves', 'parts', 'shapes', 'colour'];
    if (compact) {
      const compactScale = clamp((height - 350) / 141, .72, 1);
      const cardX = 18;
      const cardW = width - 36;
      const backboneY = height < 470 ? 48 : 66;
      const featureY = backboneY + 58;
      const featureGap = Math.max(28, 34 * compactScale);
      const featureBottom = featureY + featureGap + 24;
      // Give the source-note its own measured lane below the second feature
      // row, then size the frozen card around that lane.
      const sourceNoteY = featureBottom + 18;
      const backboneH = Math.max(126, sourceNoteY + 12 - backboneY);
      panel(ctx, cardX, backboneY, cardW, backboneH, 9, 'transfer-backbone-mobile', '#fffaf0', `${lavender}88`, 1.5);
      chip(ctx, 'FROZEN FIRST  ·  backbone', cardX + 14, backboneY + 12, Math.min(190, cardW - 28), lavenderSoft, lavender, 'transfer-frozen', 24);
      features.forEach((feature, index) => chip(ctx, feature, cardX + 14 + (index % 3) * ((cardW - 28) / 3), featureY + Math.floor(index / 3) * featureGap, (cardW - 42) / 3, index === 5 ? greenSoft : blueSoft, index === 5 ? green : blue, `transfer-feature:${index}`, 24));
      write(ctx, 'millions of earlier examples', width / 2, sourceNoteY, 8.5, muted, {align: 'center', utility: true, weight: 700});
      const headY = backboneY + backboneH + 36;
      arrow(ctx, width / 2, backboneY + backboneH + 10, width / 2, headY - 12, blue, 1.8, 'transfer-arrow-mobile');
      write(ctx, 'reuse general features', width / 2 + 14, headY - 16, 9.5, blue, {utility: true, weight: 700});
      const headX = 34;
      const headW = width - 68;
      const headH = Math.max(112, 137 * compactScale);
      panel(ctx, headX, headY, headW, headH, 9, 'transfer-head-mobile', coralSoft, `${coral}88`, 1.5);
      chip(ctx, 'TRAINABLE  ·  new head', headX + 14, headY + 12, Math.min(194, headW - 28), '#fffaf0', coral, 'transfer-trainable', 24);
      ['cat', 'dog', 'rabbit'].forEach((label, index) => chip(ctx, label, headX + 18 + index * ((headW - 54) / 3), headY + headH - 51, (headW - 72) / 3, index === 1 ? coralSoft : '#fffaf0', index === 1 ? coral : ink, `transfer-class:${index}`, 28));
      const fineY = headY + headH + 16;
      line(ctx, headX + 20, fineY, headX + headW - 20, fineY, amber, 1.2, 'transfer-finetune', .8, true);
      write(ctx, 'fine-tune gently if validation needs it', width / 2, fineY + 23, 9.5, amber, {align: 'center', utility: true, weight: 700});
      write(ctx, 'frozen features → trainable task head', width / 2, height - 18, 9.5, muted, {align: 'center', utility: true, weight: 700});
    } else {
      const backboneX = 28;
      const backboneY = 92;
      const backboneW = 244;
      const backboneH = 224;
      panel(ctx, backboneX, backboneY, backboneW, backboneH, 9, 'transfer-backbone', '#fffaf0', `${lavender}88`, 1.5);
      chip(ctx, 'FROZEN FIRST', backboneX + 14, backboneY + 14, 116, lavenderSoft, lavender, 'transfer-frozen', 24);
      write(ctx, 'pretrained backbone', backboneX + 146, backboneY + 30, 10, lavender, {align: 'center', utility: true, weight: 700});
      features.forEach((feature, index) => chip(ctx, feature, backboneX + 16 + (index % 3) * 72, backboneY + 70 + Math.floor(index / 3) * 42, 62, index === 5 ? greenSoft : blueSoft, index === 5 ? green : blue, `transfer-feature:${index}`, 24));
      write(ctx, 'millions of earlier examples', backboneX + backboneW / 2, backboneY + backboneH - 16, 9, muted, {align: 'center', utility: true, weight: 700});
      const headX = width - 28 - 180;
      const headY = 122;
      const headW = 180;
      const headH = 164;
      arrow(ctx, backboneX + backboneW + 12, headY + 66, headX - 12, headY + 66, blue, 1.9, 'transfer-arrow', 'reuse general features');
      panel(ctx, headX, headY, headW, headH, 9, 'transfer-head', coralSoft, `${coral}88`, 1.5);
      chip(ctx, 'TRAINABLE', headX + 18, headY + 16, 104, '#fffaf0', coral, 'transfer-trainable', 24);
      write(ctx, 'new task head', headX + 144, headY + 31, 9, coral, {align: 'center', utility: true, weight: 700});
      ['cat', 'dog', 'rabbit'].forEach((label, index) => chip(ctx, label, headX + 24, headY + 58 + index * 30, headW - 48, index === 1 ? '#fffaf0' : coralSoft, index === 1 ? coral : ink, `transfer-class:${index}`, 23));
      line(ctx, headX + 18, headY + headH + 30, headX + headW - 18, headY + headH + 30, amber, 1.2, 'transfer-finetune', .8, true);
      write(ctx, 'fine-tune gently if validation needs it', headX + headW / 2, headY + headH + 48, 9, amber, {align: 'center', utility: true, weight: 700});
      write(ctx, 'frozen features → trainable task head', width / 2, height - 18, 9.5, muted, {align: 'center', utility: true, weight: 700});
    }
  };

  const thresholdSamples = [
    [0, .92, 1], [0, .74, 2], [0, .43, 1],
    [1, .86, 1], [1, .61, 0], [1, .32, 2],
    [2, .81, 2], [2, .54, 1], [2, .24, 0]
  ];

  const thresholdMatrix = threshold => {
    const matrix = Array.from({length: 3}, () => [0, 0, 0]);
    thresholdSamples.forEach(([actual, confidence, fallback]) => {
      const predicted = confidence >= threshold ? actual : fallback;
      matrix[actual][predicted] += 1;
    });
    let correct = 0;
    let predictedTotal = 0;
    matrix.forEach((row, actual) => {
      correct += row[actual];
      predictedTotal += row.reduce((sum, value) => sum + value, 0);
    });
    const actualTotals = matrix.map(row => row.reduce((sum, value) => sum + value, 0));
    const predictedTotals = [0, 1, 2].map(column => matrix.reduce((sum, row) => sum + row[column], 0));
    const recall = matrix.reduce((sum, row, index) => sum + row[index] / Math.max(1, actualTotals[index]), 0) / 3;
    const precision = matrix.reduce((sum, row, index) => sum + row[index] / Math.max(1, predictedTotals[index]), 0) / 3;
    return {
      matrix,
      accuracy: correct / predictedTotal,
      recall,
      precision
    };
  };

  const drawConfusionMatrix = (ctx, x, y, size, matrix, compact) => {
    const labels = ['CAT', 'DOG', 'RABBIT'];
    const labelSize = compact ? 8.5 : 9;
    const cell = size / 3;
    write(ctx, 'predicted →', x + size / 2, y - 22, labelSize, blue, {align: 'center', utility: true, weight: 700});
    labels.forEach((label, index) => write(ctx, label, x + cell * index + cell / 2, y - 7, labelSize, muted, {align: 'center', utility: true, weight: 700}));
    ctx.save();
    ctx.translate(x - 34, y + size / 2);
    ctx.rotate(-Math.PI / 2);
    write(ctx, 'actual →', 0, 0, labelSize, blue, {align: 'center', utility: true, weight: 700});
    ctx.restore();
    labels.forEach((label, row) => write(ctx, label, x - 8, y + row * cell + cell / 2 + 4, labelSize, muted, {align: 'right', utility: true, weight: 700}));
    matrix.forEach((row, actual) => row.forEach((value, predicted) => {
      const cellX = x + predicted * cell;
      const cellY = y + actual * cell;
      const correct = actual === predicted;
      ctx.save();
      ctx.fillStyle = correct ? `${green}24` : `${coral}18`;
      ctx.fillRect(cellX + 2, cellY + 2, cell - 4, cell - 4);
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = `${correct ? green : coral}75`;
      ctx.lineWidth = 1.1;
      ctx.strokeRect(cellX + 2, cellY + 2, cell - 4, cell - 4);
      ctx.restore();
      write(ctx, String(value), cellX + cell / 2, cellY + cell / 2 + 6, compact ? 15 : 18, correct ? green : coral, {align: 'center', utility: true, weight: 700});
    }));
  };

  const sceneEleven = (ctx, width, height, state) => {
    begin(ctx, width, height, 'MAKE AN HONEST JUDGEMENT');
    const compact = width < 560 || height < 456;
    const threshold = clamp(Number(state.threshold) || .5, .1, .9);
    const summary = thresholdMatrix(threshold);
    if (compact) {
      const compactScale = clamp((height - 330) / 161, .65, 1);
      const size = Math.min(190, width - 104, 190 * compactScale);
      const matrixX = (width - size) / 2 + 14;
      const matrixY = height < 430 ? 58 : (height < 470 ? 68 : 82);
      drawConfusionMatrix(ctx, matrixX, matrixY, size, summary.matrix, true);
      const legendY = matrixY + size + 20;
      chip(ctx, 'diagonal = correct  ·  off-diagonal = confusion', 22, legendY, width - 44, '#fffaf0', muted, 'matrix-legend', 24);
      const noteY = legendY + 30;
      chip(ctx, 'accuracy is not enough', width / 2 - 82, noteY, 164, amberSoft, amber, 'threshold-note', 26);
      const railX = 38;
      // Keep the threshold label and rail below the note chip, with a
      // measured ten-pixel gap from the chip's lower border.
      const railY = noteY + 52;
      const railWidth = width - 76;
      write(ctx, `threshold  ${threshold.toFixed(2)}`, railX, railY - 16, 10, blue, {utility: true, weight: 700});
      line(ctx, railX, railY, railX + railWidth, railY, muted, 2, 'threshold-rail');
      dot(ctx, railX + railWidth * ((threshold - .1) / .8), railY, 7, blue, 'threshold-knob');
      write(ctx, 'find more', railX, railY + 19, 8.5, muted, {utility: true});
      write(ctx, 'fewer alarms', railX + railWidth, railY + 19, 8.5, muted, {align: 'right', utility: true});
      // Keep the accuracy line above the dedicated trade-off lane even when
      // the mobile canvas is at its shortest supported height (456px).
      const metricsY = railY + 20;
      write(ctx, `recall  ${Math.round(summary.recall * 100)}%`, railX, metricsY, 12, coral, {utility: true, weight: 700});
      write(ctx, `precision  ${Math.round(summary.precision * 100)}%`, railX + railWidth, metricsY, 12, green, {align: 'right', utility: true, weight: 700});
      write(ctx, `accuracy  ${Math.round(summary.accuracy * 100)}%`, railX, metricsY + 19, 10.5, muted, {utility: true, weight: 700});
      const tradeY = height - 46;
      const tradeSpan = Math.min(86, railWidth * .45);
      arrow(ctx, railX + 10, tradeY, railX + tradeSpan, tradeY, coral, 1.3, 'threshold-recall-arrow');
      arrow(ctx, railX + railWidth - tradeSpan, tradeY, railX + railWidth - 10, tradeY, green, 1.3, 'threshold-precision-arrow');
      write(ctx, 'lower threshold → recall ↑', railX, tradeY + 15, 8.2, coral, {utility: true});
      write(ctx, 'higher threshold → precision ↑', railX + railWidth, tradeY + 15, 8.2, green, {align: 'right', utility: true});
    } else {
      const size = 210;
      const matrixX = 48;
      const matrixY = 126;
      drawConfusionMatrix(ctx, matrixX, matrixY, size, summary.matrix, false);
      chip(ctx, 'diagonal = correct  ·  off-diagonal = confusion', matrixX, matrixY + size + 34, 210, '#fffaf0', muted, 'matrix-legend', 24);
      const railX = 328;
      const railY = 152;
      const railWidth = width - railX - 30;
      write(ctx, `threshold  ${threshold.toFixed(2)}`, railX, railY - 16, 10, blue, {utility: true, weight: 700});
      line(ctx, railX, railY, railX + railWidth, railY, muted, 2, 'threshold-rail');
      dot(ctx, railX + railWidth * ((threshold - .1) / .8), railY, 7, blue, 'threshold-knob');
      write(ctx, 'find more', railX, railY + 19, 8.5, muted, {utility: true});
      write(ctx, 'fewer alarms', railX + railWidth, railY + 19, 8.5, muted, {align: 'right', utility: true});
      const metricsY = railY + 50;
      write(ctx, `recall  ${Math.round(summary.recall * 100)}%`, railX, metricsY, 13, coral, {utility: true, weight: 700});
      write(ctx, `precision  ${Math.round(summary.precision * 100)}%`, railX, metricsY + 25, 13, green, {utility: true, weight: 700});
      write(ctx, `accuracy  ${Math.round(summary.accuracy * 100)}%`, railX, metricsY + 50, 11, muted, {utility: true, weight: 700});
      arrow(ctx, railX + 10, metricsY + 75, railX + Math.min(86, railWidth * .45), metricsY + 75, coral, 1.3, 'threshold-recall-arrow');
      arrow(ctx, railX + railWidth - Math.min(86, railWidth * .45), metricsY + 75, railX + railWidth - 10, metricsY + 75, green, 1.3, 'threshold-precision-arrow');
      write(ctx, 'lower threshold → recall ↑', railX, metricsY + 93, 8.5, coral, {utility: true});
      write(ctx, 'higher threshold → precision ↑', railX + railWidth, metricsY + 93, 8.5, green, {align: 'right', utility: true});
      chip(ctx, 'accuracy is not enough', railX, height - 53, 164, amberSoft, amber, 'threshold-note', 26);
    }
  };

  const drawPipelineNode = (ctx, x, y, number, title, subtitle, color, compact, radiusOverride = null) => {
    const radius = radiusOverride ?? (compact ? 16 : 18);
    dot(ctx, x, y, radius, '#fffaf0', `pipeline-node:${number}`);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    write(ctx, String(number), x, y + 4, 11, color, {align: 'center', utility: true, weight: 700});
    write(ctx, title, x + (compact ? 27 : 30), y - 3, compact ? 10 : 11, color, {utility: true, weight: 700});
    write(ctx, subtitle, x + (compact ? 27 : 30), y + 14, compact ? 8 : 8.5, muted, {utility: true});
  };

  const sceneTwelve = (ctx, width, height) => {
    begin(ctx, width, height, 'SHIP THE WHOLE PIPELINE');
    const compact = width < 560 || height < 456;
    const manifest = [
      ['weights', 'learned parameters'],
      ['preprocessing', 'resize · normalise'],
      ['class order', 'cat · dog · rabbit'],
      ['threshold', '0.62 decision rule'],
      ['software', 'versions pinned'],
      ['failures', 'safe fallback']
    ];
    if (compact) {
      const manifestX = 18;
      const manifestW = width - 36;
      panel(ctx, manifestX, 54, manifestW, 164, 9, 'manifest-mobile', '#fffaf0', `${blue}66`, 1.4);
      chip(ctx, 'RELEASE v27  ·  ONE BUNDLE', manifestX + 12, 66, Math.min(220, manifestW - 24), blueSoft, blue, 'manifest-title-mobile', 24);
      manifest.forEach(([label, value], index) => {
        const yy = 105 + index * 17;
        dot(ctx, manifestX + 18, yy - 3, 3, [blue, lavender, green, amber, coral, muted][index], `manifest-dot:${index}`);
        write(ctx, label, manifestX + 28, yy, 8.5, ink, {utility: true, weight: 700});
        write(ctx, value, manifestX + manifestW - 14, yy, 8.2, muted, {align: 'right', utility: true});
      });
      const spineX = 47;
      // Reserve operations and footer lanes before placing the route. This
      // makes DECODE's subtitle stop above the operations note at both the
      // 375px phone canvas and the short desktop canvas.
      const shortCompact = height < 470;
      const footerY = height - 19;
      const operationsY = height - 63;
      const routeTop = shortCompact ? 236 : Math.min(250, height - 232);
      const routeRadius = shortCompact && height < 440 ? 14 : 16;
      const decodeMaxY = operationsY - 24;
      const routeStep = Math.min(54, Math.max(routeRadius * 2 + 4, (decodeMaxY - routeTop) / 3));
      const nodes = [
        [1, routeTop, 'VALIDATE INPUT', 'shape · type · missing data', blue],
        [2, routeTop + routeStep, 'PREPARE', 'same training transform', green],
        [3, routeTop + routeStep * 2, 'PREDICT', 'eval mode · no gradients', lavender],
        [4, routeTop + routeStep * 3, 'DECODE', 'class order · threshold', amber]
      ];
      line(ctx, spineX, routeTop - 18, spineX, nodes[nodes.length - 1][1], muted, 1.4, 'pipeline-spine-mobile');
      arrow(ctx, spineX, routeTop - 18, spineX, routeTop - 9, blue, 1.5, 'manifest-to-pipeline-mobile');
      nodes.forEach(([number, yy, title, subtitle, color], index) => {
        if (index < nodes.length - 1) arrow(ctx, spineX, yy + routeRadius + 2, spineX, nodes[index + 1][1] - routeRadius - 2, color, 1.6, `pipeline-arrow-mobile:${index}`);
        drawPipelineNode(ctx, spineX, yy, number, title, subtitle, color, true, routeRadius);
      });
      dot(ctx, spineX, nodes[2][1], 5, ink, 'pipeline-sample-mobile');
      chip(ctx, 'latency · memory · privacy · failures', width / 2 - Math.min(150, (width - 32) / 2), operationsY, Math.min(300, width - 32), amberSoft, amber, 'operations-mobile', 26);
    } else {
      const manifestX = 24;
      const manifestY = 74;
      const manifestW = 258;
      const manifestH = 244;
      panel(ctx, manifestX, manifestY, manifestW, manifestH, 9, 'manifest', '#fffaf0', `${blue}66`, 1.4);
      chip(ctx, 'RELEASE v27', manifestX + 16, manifestY + 16, 128, blueSoft, blue, 'manifest-title', 25);
      write(ctx, 'one versioned bundle', manifestX + manifestW - 16, manifestY + 32, 9, blue, {align: 'right', utility: true, weight: 700});
      manifest.forEach(([label, value], index) => {
        const yy = manifestY + 70 + index * 26;
        dot(ctx, manifestX + 20, yy - 4, 3.5, [blue, lavender, green, amber, coral, muted][index], `manifest-dot:${index}`);
        write(ctx, label, manifestX + 31, yy, 9.5, ink, {utility: true, weight: 700});
        write(ctx, value, manifestX + manifestW - 16, yy + 14, 8.5, muted, {align: 'right', utility: true});
        if (index < manifest.length - 1) line(ctx, manifestX + 31, yy + 19, manifestX + manifestW - 16, yy + 19, thin, .7, `manifest-rule:${index}`, .65, true);
      });
      const spineX = width - 170;
      const nodes = [
        [1, 92, 'VALIDATE INPUT', 'shape · type · missing data', blue],
        [2, 158, 'PREPARE', 'same training transform', green],
        [3, 224, 'PREDICT', 'eval mode · no gradients', lavender],
        [4, 290, 'DECODE', 'class order · threshold', amber]
      ];
      line(ctx, spineX, nodes[0][1] - 22, spineX, nodes[nodes.length - 1][1] + 22, muted, 1.5, 'pipeline-spine');
      const manifestTargetX = spineX - 18;
      arrow(ctx, manifestX + manifestW + 12, manifestY + 54, manifestTargetX, nodes[0][1], blue, 1.8, 'manifest-to-pipeline', 'one bundle');
      // The arrow meets the first node at the spine edge; this short segment
      // makes the hand-off to the actual vertical rail explicit.
      line(ctx, manifestTargetX, nodes[0][1], spineX, nodes[0][1], blue, 1.5, 'manifest-spine-handoff');
      nodes.forEach(([number, yy, title, subtitle, color], index) => {
        if (index < nodes.length - 1) arrow(ctx, spineX, yy + 20, spineX, nodes[index + 1][1] - 20, color, 1.7, `pipeline-arrow:${index}`);
        drawPipelineNode(ctx, spineX, yy, number, title, subtitle, color, false);
      });
      dot(ctx, spineX, nodes[2][1], 5, ink, 'pipeline-sample');
      chip(ctx, 'latency · memory · privacy · failures', width - 300, height - 54, 276, amberSoft, amber, 'operations', 26);
    }
    write(ctx, 'raw request → tested route → decoded answer', width / 2, height - 19, 9.5, muted, {align: 'center', utility: true, weight: 700});
  };

  const drawScene = (ctx, width, height, active, state) => {
    if (active === 0) sceneOne(ctx, width, height);
    else if (active === 1) sceneTwo(ctx, width, height, state.biased);
    else if (active === 2) sceneThree(ctx, width, height);
    else if (active === 3) sceneFour(ctx, width, height, state.tensorMode);
    else if (active === 4) sceneFive(ctx, width, height, state);
    else if (active === 5) sceneSix(ctx, width, height);
    else if (active === 6) sceneSeven(ctx, width, height, state);
    else if (active === 7) sceneEight(ctx, width, height, state);
    else if (active === 8) sceneNine(ctx, width, height, state);
    else if (active === 9) sceneTen(ctx, width, height, state);
    else if (active === 10) sceneEleven(ctx, width, height, state);
    else if (active === 11) sceneTwelve(ctx, width, height, state);
  };

  const moduleRoot = document.documentElement;
  if (!moduleRoot || moduleRoot.dataset[ATTR] !== 'v1') return;

  let stage = null;
  let rendererCanvas = null;
  let resizeObserver = null;
  let mutationObserver = null;
  let queued = false;
  let lastStateKey = '';
  let trackedLearnStep = 3;

  const normalizeShellLabel = () => {
    const shell = document.querySelector('.story-shell');
    if (shell?.getAttribute('aria-label') === 'Thirteen chapters of the deep learning journey') {
      shell.setAttribute('aria-label', 'Twelve chapters of the deep learning journey');
    }
  };

  const getActive = () => {
    const buttons = [...document.querySelectorAll(`${stageSelector} .chapter-dots button` )];
    const active = buttons.findIndex(button => button.classList.contains('is-active'));
    return active >= 0 ? active : 0;
  };

  const getState = () => {
    const tensorButton = document.querySelector('.tensor-control button[aria-pressed="true"]');
    const toggle = document.querySelector('.control-panel .toggle-button');
    const sliderValues = [...document.querySelectorAll('.sliders input[type="range"]')].map(input => Number(input.value));
    const learningRateInput = document.querySelector('.control-stack .range-row input[type="range"]');
    const epochInput = document.querySelector('.epoch-control input[type="range"]');
    const architectureButton = document.querySelector('.architecture-tabs button[aria-pressed="true"]');
    const thresholdInput = document.querySelector('.threshold-control input[type="range"]');
    return {
      active: getActive(),
      biased: toggle?.getAttribute('aria-pressed') === 'true',
      tensorMode: tensorButton?.textContent?.trim().toLowerCase() || 'image',
      earWeight: Number.isFinite(sliderValues[0]) ? sliderValues[0] : 1.2,
      furWeight: Number.isFinite(sliderValues[1]) ? sliderValues[1] : .6,
      backgroundWeight: Number.isFinite(sliderValues[2]) ? sliderValues[2] : .2,
      neuronBias: Number.isFinite(sliderValues[3]) ? sliderValues[3] : -.2,
      learnStep: trackedLearnStep,
      learningRate: Number.isFinite(Number(learningRateInput?.value)) ? Number(learningRateInput.value) : .5,
      epoch: Number.isFinite(Number(epochInput?.value)) ? Number(epochInput.value) : 12,
      architecture: architectureButton?.querySelector('span')?.textContent?.trim().toLowerCase() || 'cnn',
      threshold: Number.isFinite(Number(thresholdInput?.value)) ? Number(thresholdInput.value) : .5
    };
  };

  const ensureCanvases = () => {
    stage = document.querySelector(stageSelector);
    const wrap = stage?.querySelector('.canvas-wrap');
    if (!wrap) return false;
    rendererCanvas = wrap.querySelector('canvas.deep-learning-renderer-canvas');
    if (!rendererCanvas) {
      rendererCanvas = document.createElement('canvas');
      rendererCanvas.className = 'deep-learning-renderer-canvas';
      rendererCanvas.setAttribute('aria-hidden', 'true');
      rendererCanvas.dataset.renderer = 'checkpoint-3-rework-1';
      wrap.append(rendererCanvas);
    }
    return true;
  };

  const resizeAndDraw = state => {
    if (!rendererCanvas || state.active > 11 || rendererCanvas.hidden) return;
    const wrap = rendererCanvas.parentElement;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const targetWidth = Math.round(width * ratio);
    const targetHeight = Math.round(height * ratio);
    if (rendererCanvas.width !== targetWidth || rendererCanvas.height !== targetHeight) {
      rendererCanvas.width = targetWidth;
      rendererCanvas.height = targetHeight;
    }
    const ctx = rendererCanvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawScene(ctx, width, height, state.active, state);
  };

  const sync = () => {
    if (!ensureCanvases()) return;
    normalizeShellLabel();
    const state = getState();
    const ownsScene = state.active <= 11;
    rendererCanvas.hidden = !ownsScene;
    // The bundled My component returns null under the module flag before its
    // hooks run. This canvas is therefore the only painter in the shell.
    if (state.active === 6) syncLearningTrace(state);
    const key = `${state.active}:${state.biased}:${state.tensorMode}:${state.earWeight}:${state.furWeight}:${state.backgroundWeight}:${state.neuronBias}:${state.learnStep}:${state.learningRate}:${state.epoch}:${state.architecture}:${state.threshold}:${rendererCanvas.clientWidth}:${rendererCanvas.clientHeight}`;
    if (key !== lastStateKey) {
      lastStateKey = key;
      resizeAndDraw(state);
    }
  };

  const scheduleSync = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      sync();
    });
  };

  const boot = () => {
    if (!ensureCanvases()) {
      window.setTimeout(boot, 30);
      return;
    }
    sync();
    mutationObserver = new MutationObserver(scheduleSync);
    mutationObserver.observe(document.getElementById('root') || document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'aria-pressed', 'aria-current']
    });
    resizeObserver = new ResizeObserver(() => {
      const state = getState();
      if (state.active <= 11) resizeAndDraw(state);
    });
    resizeObserver.observe(rendererCanvas.parentElement);
    window.addEventListener('resize', scheduleSync, {passive: true});
    document.addEventListener('input', scheduleSync, true);
    document.addEventListener('click', event => {
      const button = event.target && event.target.closest ? event.target.closest('.control-stack .primary-button') : null;
      if (!button) return;
      trackedLearnStep += 1;
      scheduleSync();
    }, true);
    window.__statmlDeepLearningRenderer = Object.freeze({
      version: 'checkpoint-3-rework-1',
      getState,
      render: () => resizeAndDraw(getState())
    });
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        const state = getState();
        if (state.active <= 11) resizeAndDraw(state);
      });
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once: true});
  else boot();
})();
