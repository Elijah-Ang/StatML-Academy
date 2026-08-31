(() => {
  'use strict';

  // The shared theme promotes itself to the end of <head>. Promote this
  // module's final notebook layer once more so its deliberately authored
  // Naive Bayes details remain the last word in the cascade.
  const notebookStyles = document.querySelector('link[href*="naive-bayes-handwritten.css"]');
  if (notebookStyles?.parentNode) notebookStyles.parentNode.appendChild(notebookStyles);

  const SVG_NS = 'http://www.w3.org/2000/svg';

  document.querySelectorAll('.scene[aria-label]').forEach((scene) => {
    if (!scene.hasAttribute('role')) scene.setAttribute('role', 'group');
  });

  function sketchHash(value) {
    let hash = 2166136261 >>> 0;
    for (const character of String(value)) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    return hash >>> 0;
  }

  function sketchRandom(seed) {
    let state = sketchHash(seed) || 1;
    return () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function makeNotebookFilter() {
    if (document.getElementById('nb-sketch-filter-bank')) return;
    const bank = document.createElementNS(SVG_NS, 'svg');
    bank.id = 'nb-sketch-filter-bank';
    bank.setAttribute('aria-hidden', 'true');
    bank.style.cssText = 'position:fixed;width:0;height:0;overflow:hidden;pointer-events:none';
    const defs = document.createElementNS(SVG_NS, 'defs');
    const filter = document.createElementNS(SVG_NS, 'filter');
    filter.id = 'nb-sketch-wobble';
    filter.setAttribute('x', '-12%');
    filter.setAttribute('y', '-12%');
    filter.setAttribute('width', '124%');
    filter.setAttribute('height', '124%');
    filter.setAttribute('color-interpolation-filters', 'sRGB');
    const noise = document.createElementNS(SVG_NS, 'feTurbulence');
    noise.setAttribute('type', 'fractalNoise');
    noise.setAttribute('baseFrequency', '.018 .065');
    noise.setAttribute('numOctaves', '2');
    noise.setAttribute('seed', '29');
    noise.setAttribute('result', 'inkNoise');
    const displacement = document.createElementNS(SVG_NS, 'feDisplacementMap');
    displacement.setAttribute('in', 'SourceGraphic');
    displacement.setAttribute('in2', 'inkNoise');
    displacement.setAttribute('scale', '2.25');
    displacement.setAttribute('xChannelSelector', 'R');
    displacement.setAttribute('yChannelSelector', 'G');
    filter.append(noise, displacement);
    defs.append(filter);
    bank.append(defs);
    document.body.prepend(bank);
  }

  function roughFramePath(seed, pass, width, height) {
    const random = sketchRandom(`${seed}:${pass}`);
    const pxX = (pixels) => pixels * 100 / Math.max(width, 48);
    const pxY = (pixels) => pixels * 100 / Math.max(height, 32);
    const jx = (pixels) => (random() - .5) * 2 * pxX(pixels);
    const jy = (pixels) => (random() - .5) * 2 * pxY(pixels);
    const insetX = pxX(1.8 + pass * .55);
    const insetY = pxY(1.8 + pass * .55);
    const x0 = insetX + jx(.8), x1 = 100 - insetX + jx(.8);
    const y0 = insetY + jy(.8), y1 = 100 - insetY + jy(.8);
    return [
      `M ${x0.toFixed(2)} ${y0.toFixed(2)}`,
      `Q ${(24 + jx(5)).toFixed(2)} ${(y0 + jy(3)).toFixed(2)} ${(50 + jx(4)).toFixed(2)} ${(y0 + jy(2.2)).toFixed(2)}`,
      `Q ${(76 + jx(5)).toFixed(2)} ${(y0 + jy(3)).toFixed(2)} ${x1.toFixed(2)} ${(y0 + jy(1.3)).toFixed(2)}`,
      `Q ${(x1 + jx(2.8)).toFixed(2)} ${(28 + jy(5)).toFixed(2)} ${(x1 + jx(2.1)).toFixed(2)} ${(52 + jy(4)).toFixed(2)}`,
      `Q ${(x1 + jx(2.8)).toFixed(2)} ${(77 + jy(5)).toFixed(2)} ${x1.toFixed(2)} ${y1.toFixed(2)}`,
      `Q ${(74 + jx(5)).toFixed(2)} ${(y1 + jy(3)).toFixed(2)} ${(49 + jx(4)).toFixed(2)} ${(y1 + jy(2.2)).toFixed(2)}`,
      `Q ${(24 + jx(5)).toFixed(2)} ${(y1 + jy(3)).toFixed(2)} ${x0.toFixed(2)} ${(y1 + jy(1.3)).toFixed(2)}`,
      `Q ${(x0 + jx(2.8)).toFixed(2)} ${(72 + jy(5)).toFixed(2)} ${(x0 + jx(2.1)).toFixed(2)} ${(49 + jy(4)).toFixed(2)}`,
      `Q ${(x0 + jx(2.8)).toFixed(2)} ${(25 + jy(5)).toFixed(2)} ${x0.toFixed(2)} ${y0.toFixed(2)}`
    ].join(' ');
  }

  const notebookFrameObserver = 'ResizeObserver' in window ? new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      const element = entry.target;
      const frame = element.querySelector(':scope > .nb-scribble-frame');
      if (!frame) return;
      const rect = element.getBoundingClientRect();
      frame.querySelectorAll('path').forEach((path, pass) => {
        path.setAttribute('d', roughFramePath(element.dataset.nbSketchSeed, pass, rect.width, rect.height));
      });
    });
  }) : null;

  function sketchSurface(element, index) {
    if (!(element instanceof HTMLElement) || element.dataset.nbSketchFrame === '1') return;
    const computed = getComputedStyle(element);
    if (computed.position === 'static') element.classList.add('nb-frame-relative');
    element.classList.add('nb-sketched-surface');
    element.dataset.nbSketchFrame = '1';
    element.dataset.nbSketchSeed = `${element.className}:${element.textContent?.slice(0, 28)}:${index}`;
    element.style.setProperty('border-color', 'transparent', 'important');
    element.style.setProperty('border-image', 'none', 'important');
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.classList.add('nb-scribble-frame');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    const rect = element.getBoundingClientRect();
    for (let pass = 0; pass < 2; pass += 1) {
      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', roughFramePath(element.dataset.nbSketchSeed, pass, rect.width, rect.height));
      path.setAttribute('stroke-width', pass ? '.82' : '1.22');
      path.setAttribute('opacity', pass ? '.40' : '.84');
      svg.append(path);
    }
    element.append(svg);
    notebookFrameObserver?.observe(element);
  }

  function roughenIllustrationStrokes() {
    const illustrations = document.querySelectorAll('svg:not(.nb-scribble-frame):not(.hw-rough-frame):not(.hw-ink-filter-bank):not(#nb-sketch-filter-bank)');
    illustrations.forEach((svg) => {
      svg.classList.add('nb-rough-illustration');
      svg.querySelectorAll('path,line,circle,ellipse,polyline,polygon').forEach((shape) => {
        shape.setAttribute('filter', 'url(#nb-sketch-wobble)');
        if (shape.id || shape.dataset.nbGhost === '1') return;
        const style = getComputedStyle(shape);
        if (!style.stroke || style.stroke === 'none' || style.stroke === 'rgba(0, 0, 0, 0)') return;
        const echo = shape.cloneNode(false);
        echo.removeAttribute('id');
        echo.dataset.nbGhost = '1';
        echo.setAttribute('fill', 'none');
        echo.setAttribute('stroke', style.stroke);
        echo.setAttribute('stroke-width', String(Math.max(1, Number.parseFloat(style.strokeWidth || '1') * .82)));
        echo.setAttribute('opacity', '.22');
        echo.setAttribute('transform', `${shape.getAttribute('transform') || ''} translate(.75 -.45)`.trim());
        echo.setAttribute('pointer-events', 'none');
        shape.parentNode.insertBefore(echo, shape);
      });
    });
  }

  function decorateNotebookVisuals() {
    makeNotebookFilter();
    const surfaceSelector = [
      '.visual-stage', '.stage-nav', '.email-hero-card', '.class-lens',
      '.ledger-wrap', '.email-note-card', '.feature-rack', '.target-lock',
      '.paper-stack', '.split-branch', '.split-seal', '.model-choice',
      '.model-specimen', '.prior-column', '.likelihood-column', '.learn-equation',
      '.score-email', '.score-compare', '.winner-stamp', '.height-readout',
      '.zero-card', '.zero-result', '.smoothing-band', '.log-chain', '.log-result',
      '.fold-block', '.final-train-path', '.matrix-cell', '.metric-readout',
      '.ribbon-node', '.four-ideas > div', '.synthesis-verdict', '.type-summary',
      '.score-readout', '.continuous-note span', '.insight-note', '.formula-strip',
      '.stability-switch', '.fold-buttons', '.metric-switch'
    ].join(',');
    document.querySelectorAll(surfaceSelector).forEach(sketchSurface);
    roughenIllustrationStrokes();
  }

  window.requestAnimationFrame(decorateNotebookVisuals);

  const root = document.documentElement;
  const stages = [...document.querySelectorAll('[data-stage]')].filter((el) => el.classList.contains('stage-section'));
  const scenes = [...document.querySelectorAll('[data-scene]')];
  const navLinks = [...document.querySelectorAll('[data-nav-stage]')];
  const stageNames = ['Premise', 'Observe', 'Frame', 'Split', 'Choose', 'Learn', 'Assume', 'Score', 'Continuous', 'Stabilise', 'Validate', 'Evaluate', 'Remember'];
  const currentStageEl = document.getElementById('progressCurrent');
  const totalStageEl = document.getElementById('progressTotal');
  const railName = document.getElementById('railName');
  const railFill = document.getElementById('railFill');
  const menuToggle = document.querySelector('.menu-toggle');
  const stageNav = document.getElementById('stageNav');
  let currentStage = -1;
  let scrollTick = false;

  totalStageEl.textContent = String(stageNames.length).padStart(2, '0');

  function setStage(stage) {
    if (stage === currentStage) return;
    currentStage = stage;
    document.body.classList.toggle('lesson-active', stage > 0);
    currentStageEl.textContent = String(stage + 1).padStart(2, '0');
    railName.textContent = stageNames[stage] || stageNames[1];
    railFill.style.width = `${Math.max(8, (stage / (stageNames.length - 1)) * 100)}%`;

    navLinks.forEach((link) => {
      const isActive = Number(link.dataset.navStage) === stage;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });

    scenes.forEach((scene) => {
      const visible = stage > 0 && Number(scene.dataset.scene) === stage;
      scene.classList.toggle('is-visible', visible);
      scene.setAttribute('aria-hidden', String(!visible));
      scene.inert = !visible;
    });
  }

  function syncStage() {
    // A couple of pixels inside the anchor avoids a stage boundary being
    // rounded onto the chapter above it on high-DPI and fractional layouts.
    const viewportAnchor = window.innerHeight * 0.43 + 2;
    let bestStage = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    let bestInsideTop = Number.NEGATIVE_INFINITY;

    stages.forEach((section) => {
      const rect = section.getBoundingClientRect();
      // Treat the lower edge as exclusive so a stage boundary belongs to the
      // next chapter rather than leaving the previous one active.
      const inside = rect.top <= viewportAnchor && rect.bottom > viewportAnchor;
      const distance = inside ? 0 : Math.min(Math.abs(rect.top - viewportAnchor), Math.abs(rect.bottom - viewportAnchor));
      if (inside && (bestInsideTop === Number.NEGATIVE_INFINITY || rect.top > bestInsideTop)) {
        bestInsideTop = rect.top;
        bestDistance = 0;
        bestStage = Number(section.dataset.stage);
      } else if (bestInsideTop === Number.NEGATIVE_INFINITY && distance < bestDistance) {
        bestDistance = distance;
        bestStage = Number(section.dataset.stage);
      }
    });

    setStage(bestStage);
  }

  function requestStageSync() {
    if (scrollTick) return;
    scrollTick = true;
    window.requestAnimationFrame(() => {
      scrollTick = false;
      syncStage();
    });
  }

  window.addEventListener('scroll', requestStageSync, { passive: true });
  window.addEventListener('resize', requestStageSync);
  window.addEventListener('load', syncStage, { once: true });
  setStage(0);

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      stageNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  menuToggle.addEventListener('click', () => {
    const isOpen = stageNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      stageNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Model family selector: the visual specimen stays connected to the written explanation.
  const modelContent = {
    bernoulli: { main: 'free? → yes', foot: 'a binary feature', annotation: 'Bernoulli counts presence or absence.', summary: ['Bernoulli', 'yes / no features'], spark: 'binary' },
    multinomial: { main: 'free × 3', foot: 'a word-count feature', annotation: 'Multinomial works with counts, such as word occurrences.', summary: ['Multinomial', 'counts'], spark: 'count' },
    categorical: { main: 'colour → blue', foot: 'a named category', annotation: 'Categorical handles one of several named categories.', summary: ['Categorical', 'named categories'], spark: 'category' },
    gaussian: { main: 'height → 169', foot: 'a continuous measurement', annotation: 'Gaussian estimates how typical a numeric value is.', summary: ['Gaussian', 'continuous numbers'], spark: 'curve' }
  };
  const modelSpecimen = document.getElementById('modelSpecimen');
  const specimenMain = document.getElementById('specimenMain');
  const specimenFoot = document.getElementById('specimenFoot');
  const specimenSpark = document.getElementById('specimenSpark');
  const modelAnnotation = document.getElementById('modelAnnotation');
  const typeSummary = document.getElementById('typeSummary');
  const modelButtons = [...document.querySelectorAll('[data-model]')];
  modelButtons.forEach((button, index) => {
    button.setAttribute('aria-pressed', String(index === 0));
    button.addEventListener('click', () => {
      const key = button.dataset.model;
      const data = modelContent[key];
      modelButtons.forEach((choice) => {
        const selected = choice === button;
        choice.classList.toggle('is-selected', selected);
        choice.setAttribute('aria-pressed', String(selected));
      });
      specimenMain.textContent = data.main;
      specimenFoot.textContent = data.foot;
      modelAnnotation.textContent = data.annotation;
      typeSummary.innerHTML = `<span class="summary-label">Selected</span><strong>${data.summary[0]}</strong><span>${data.summary[1]}</span>`;
      modelSpecimen.dataset.specimen = data.spark;
    });
  });

  function activateOnClickOrKey(element, handler) {
    element.addEventListener('click', handler);
    element.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      handler();
    });
  }

  // The first static scenes now reward inspection instead of behaving like posters.
  const ledgerRows = [...document.querySelectorAll('[data-ledger-row]')];
  const ledgerDetail = document.getElementById('ledgerDetail');
  ledgerRows.forEach((row) => {
    row.setAttribute('aria-selected', 'false');
    activateOnClickOrKey(row, () => {
      ledgerRows.forEach((candidate) => {
        const selected = candidate === row;
        candidate.classList.toggle('is-inspected', selected);
        candidate.setAttribute('aria-selected', String(selected));
      });
      ledgerDetail.textContent = row.dataset.ledgerRow;
    });
  });

  const splitParts = [...document.querySelectorAll('[data-split-part]')];
  const splitDetail = document.getElementById('splitDetail');
  const splitCopy = {
    train: 'training may be revisited: it teaches probabilities and supports validation',
    test: 'test stays sealed: it is used once for the final, honest estimate'
  };
  splitParts.forEach((part) => {
    activateOnClickOrKey(part, () => {
      splitParts.forEach((candidate) => {
        const selected = candidate === part;
        candidate.classList.toggle('is-inspected', selected);
        candidate.setAttribute('aria-pressed', String(selected));
      });
      splitDetail.textContent = splitCopy[part.dataset.splitPart];
    });
  });

  const likelihoodRows = [...document.querySelectorAll('[data-likelihood]')];
  const likelihoodDetail = document.getElementById('likelihoodDetail');
  const learnEquation = document.getElementById('learnEquation');
  likelihoodRows.forEach((row) => {
    row.setAttribute('aria-pressed', 'false');
    activateOnClickOrKey(row, () => {
      likelihoodRows.forEach((candidate) => {
        const selected = candidate === row;
        candidate.classList.toggle('is-inspected', selected);
        candidate.setAttribute('aria-pressed', String(selected));
      });
      const clue = row.dataset.likelihood;
      const spam = row.dataset.spam;
      const safe = row.dataset.safe;
      likelihoodDetail.textContent = `“${clue}” supports ${Number(spam) > Number(safe) ? 'spam' : 'not spam'} more strongly`;
      learnEquation.innerHTML = `<span class="mono">P(${clue} | Spam) = ${spam}</span><b>vs</b><span class="mono">P(${clue} | Not Spam) = ${safe}</span>`;
    });
  });

  const pipelineNodes = [...document.querySelectorAll('[data-pipeline-note]')];
  const pipelineDetail = document.getElementById('pipelineDetail');
  const synthesisVerdict = document.getElementById('synthesisVerdict');
  pipelineNodes.forEach((node) => {
    node.setAttribute('aria-pressed', 'false');
    activateOnClickOrKey(node, () => {
      pipelineNodes.forEach((candidate) => {
        const selected = candidate === node;
        candidate.classList.toggle('is-inspected', selected);
        candidate.setAttribute('aria-pressed', String(selected));
      });
      pipelineDetail.textContent = node.dataset.pipelineNote;
      synthesisVerdict.querySelector('strong').textContent = `${node.querySelector('b').textContent} step`;
    });
  });

  // The naive assumption toggle changes the evidence map, not just the label.
  const assumptionToggle = document.getElementById('assumptionToggle');
  const naiveScene = document.querySelector('.scene-naive');
  const naiveModeLabel = document.getElementById('naiveModeLabel');
  const naiveAnnotation = document.getElementById('naiveAnnotation');
  assumptionToggle.addEventListener('click', () => {
    const correlated = naiveScene.classList.toggle('is-correlation');
    assumptionToggle.setAttribute('aria-pressed', String(correlated));
    assumptionToggle.innerHTML = correlated ? 'Return to the naive shortcut <span aria-hidden="true">↗</span>' : 'Show what the shortcut ignores <span aria-hidden="true">↗</span>';
    naiveModeLabel.innerHTML = correlated ? 'the clues<br>can pull on each other' : 'treat each clue<br>as separate evidence';
    naiveAnnotation.textContent = correlated ? 'the real world is messier; the model chooses a simpler map' : 'not “features are unrelated” — just a useful approximation';
  });

  // Score calculator for the running email example.
  const evidence = {
    free: { spam: 0.75, safe: 0.10 },
    winner: { spam: 0.60, safe: 0.05 },
    meeting: { spam: 0.05, safe: 0.50 }
  };
  const spamScoreText = document.getElementById('spamScoreText');
  const safeScoreText = document.getElementById('safeScoreText');
  const spamScoreBar = document.getElementById('spamScoreBar');
  const safeScoreBar = document.getElementById('safeScoreBar');
  const posteriorFormula = document.getElementById('posteriorFormula');
  const predictionLabel = document.getElementById('predictionLabel');
  const predictionConfidence = document.getElementById('predictionConfidence');
  const winnerStamp = document.getElementById('winnerStamp');
  const winnerStampNote = document.getElementById('winnerStampNote');
  const scoreInputs = [...document.querySelectorAll('[data-score-feature]')];

  function formatScore(value) {
    return value.toFixed(3);
  }

  function updateScore() {
    let spam = 0.40;
    let safe = 0.60;
    const chosen = scoreInputs.filter((input) => input.checked).map((input) => input.dataset.scoreFeature);
    chosen.forEach((feature) => {
      spam *= evidence[feature].spam;
      safe *= evidence[feature].safe;
    });
    const total = spam + safe;
    const spamPosterior = total ? spam / total : 0.5;
    const safePosterior = 1 - spamPosterior;
    const winner = spamPosterior >= safePosterior ? 'Spam' : 'Not Spam';
    const confidence = Math.max(spamPosterior, safePosterior) * 100;
    const winningScore = winner === 'Spam' ? spam : safe;
    const winningPosterior = winner === 'Spam' ? spamPosterior : safePosterior;

    spamScoreText.textContent = formatScore(spam);
    safeScoreText.textContent = formatScore(safe);
    spamScoreBar.style.width = `${spamPosterior * 100}%`;
    safeScoreBar.style.width = `${safePosterior * 100}%`;
    posteriorFormula.textContent = `${formatScore(winningScore)} ÷ ${formatScore(total)} = ${winningPosterior.toFixed(3)}`;
    predictionLabel.textContent = winner;
    predictionLabel.style.color = winner === 'Spam' ? 'var(--red)' : 'var(--blue)';
    predictionConfidence.textContent = `${confidence.toFixed(1)}% posterior`;
    winnerStamp.textContent = winner.toUpperCase();
    winnerStamp.style.color = winner === 'Spam' ? 'var(--red)' : 'var(--blue)';
    winnerStamp.style.borderColor = winner === 'Spam' ? 'var(--red)' : 'var(--blue)';
    winnerStampNote.textContent = `${confidence.toFixed(1)}% likely`;
  }

  scoreInputs.forEach((input) => input.addEventListener('change', updateScore));
  document.getElementById('resetEvidence').addEventListener('click', () => {
    scoreInputs.forEach((input) => { input.checked = input.dataset.scoreFeature !== 'meeting'; });
    updateScore();
  });
  updateScore();

  // Gaussian scene: a movable observation over two illustrative distributions.
  const heightSlider = document.getElementById('heightSlider');
  const heightValue = document.getElementById('heightValue');
  const heightInterpretation = document.getElementById('heightInterpretation');
  const heightGuide = document.getElementById('heightGuide');
  const heightPoint = document.getElementById('heightPoint');
  function gaussian(x, mean, spread) {
    return Math.exp(-((x - mean) ** 2) / (2 * spread ** 2));
  }
  const heightX = (value) => 46 + ((value - 160) / 27) * 553;
  function gaussianCurvePath(mean, spread, seed) {
    const random = sketchRandom(`gaussian:${seed}`);
    const points = [];
    for (let value = 160; value <= 187.001; value += 0.45) {
      const x = heightX(value);
      const support = gaussian(value, mean, spread);
      const edgeFade = Math.min(1, (value - 160) / 1.3, (187 - value) / 1.3);
      const jitter = (random() - .5) * 2.2 * Math.max(0, edgeFade);
      const y = 260 - support * 137 + jitter;
      points.push([x, y]);
    }
    return points.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  }
  const curveAPath = gaussianCurvePath(168, 5, 'a');
  const curveBPath = gaussianCurvePath(181, 5, 'b');
  document.getElementById('curveAStrokePath').setAttribute('d', curveAPath);
  document.getElementById('curveAFillPath').setAttribute('d', `${curveAPath} L599 260 L46 260 Z`);
  document.getElementById('curveBStrokePath').setAttribute('d', curveBPath);
  document.getElementById('curveBFillPath').setAttribute('d', `${curveBPath} L599 260 L46 260 Z`);
  const meanAX = heightX(168);
  const meanBX = heightX(181);
  for (const [line, x] of [[document.getElementById('meanALine'), meanAX], [document.getElementById('meanBLine'), meanBX]]) {
    line.setAttribute('x1', String(x));
    line.setAttribute('x2', String(x));
  }
  function updateHeight() {
    const value = Number(heightSlider.value);
    const x = heightX(value);
    const supportA = gaussian(value, 168, 5);
    const supportB = gaussian(value, 181, 5);
    const nearlyEqual = Math.abs(supportA - supportB) < .13;
    const closer = nearlyEqual ? 'about equally supported' : `closer to ${supportA > supportB ? 'Class A' : 'Class B'}`;
    const stronger = Math.max(supportA, supportB);
    const weaker = Math.min(supportA, supportB);
    const y = 260 - Math.max(supportA, supportB) * 137;
    heightValue.textContent = String(value);
    heightInterpretation.textContent = `${closer} · support ${stronger.toFixed(2)} / ${weaker.toFixed(2)}`;
    heightGuide.setAttribute('x1', String(x));
    heightGuide.setAttribute('x2', String(x));
    heightPoint.setAttribute('cx', String(x));
    heightPoint.setAttribute('cy', String(Math.max(118, y)));
  }
  heightSlider.addEventListener('input', updateHeight);
  updateHeight();

  // Toggle the two numerical-stability views.
  const stabilityCaption = document.getElementById('stabilityCaption');
  const stabilityCaptions = {
    smooth: 'Smoothing keeps a single unseen clue from becoming a veto.',
    logs: 'Log probabilities keep a long chain of tiny numbers inside a safe numerical range.'
  };
  const stabilityButtons = [...document.querySelectorAll('[data-stability]')];
  stabilityButtons.forEach((button, index) => {
    button.setAttribute('aria-pressed', String(index === 0));
    button.addEventListener('click', () => {
      const view = button.dataset.stability;
      stabilityButtons.forEach((choice) => {
        const selected = choice === button;
        choice.classList.toggle('is-selected', selected);
        choice.setAttribute('aria-pressed', String(selected));
      });
      document.querySelectorAll('[data-stability-panel]').forEach((panel) => panel.classList.toggle('is-active', panel.dataset.stabilityPanel === view));
      stabilityCaption.textContent = stabilityCaptions[view];
    });
  });

  // Cross-validation fold selector.
  const foldCaption = document.getElementById('foldCaption');
  const roundLabel = document.getElementById('roundLabel');
  const foldButtons = [...document.querySelectorAll('[data-fold]')];
  foldButtons.forEach((button, index) => {
    button.setAttribute('aria-pressed', String(index === 0));
    button.addEventListener('click', () => {
      const fold = Number(button.dataset.fold);
      foldButtons.forEach((choice) => {
        const selected = choice === button;
        choice.classList.toggle('is-selected', selected);
        choice.setAttribute('aria-pressed', String(selected));
      });
      document.querySelectorAll('[data-fold-block]').forEach((block) => {
        const active = Number(block.dataset.foldBlock) === fold;
        block.classList.toggle('is-validation', active);
        block.querySelector('small').textContent = active ? 'validate' : 'train';
      });
      foldCaption.textContent = `Round ${fold} · Fold ${fold} validates`;
      roundLabel.textContent = `round ${fold}`;
    });
  });

  // Evaluation focus: show that the important error depends on the context.
  const metricCaption = document.getElementById('metricCaption');
  const evaluateAnnotation = document.getElementById('evaluateAnnotation');
  const priorityCopy = {
    precision: {
      caption: 'Precision focus · keep false positives visible.',
      annotation: 'protecting the inbox highlights<br>the false-positive cell',
      focus: 'cell-fp'
    },
    recall: {
      caption: 'Recall focus · keep false negatives visible.',
      annotation: 'catching more spam highlights<br>the false-negative cell',
      focus: 'cell-fn'
    }
  };
  const priorityButtons = [...document.querySelectorAll('[data-priority]')];
  priorityButtons.forEach((button, index) => {
    button.setAttribute('aria-pressed', String(index === 0));
    button.addEventListener('click', () => {
      const priority = button.dataset.priority;
      const copy = priorityCopy[priority];
      priorityButtons.forEach((choice) => {
        const selected = choice === button;
        choice.classList.toggle('is-selected', selected);
        choice.setAttribute('aria-pressed', String(selected));
      });
      document.querySelectorAll('.matrix-cell').forEach((cell) => cell.classList.toggle('is-focus', cell.classList.contains(copy.focus)));
      metricCaption.textContent = copy.caption;
      evaluateAnnotation.innerHTML = copy.annotation;
    });
  });

  // Keep the active scene accurate after programmatic anchor navigation.
  document.querySelectorAll('a[href^="#stage-"]').forEach((link) => {
    link.addEventListener('click', () => window.setTimeout(syncStage, 80));
  });
})();
