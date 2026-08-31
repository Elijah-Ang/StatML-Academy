(() => {
  'use strict';

  // The shared theme promotes itself to the end of <head>. Promote this
  // module's final notebook layer once more so its deliberately authored
  // Naive Bayes details remain the last word in the cascade.
  const notebookStyles = document.querySelector('link[href*="naive-bayes-handwritten.css"]');
  if (notebookStyles?.parentNode) notebookStyles.parentNode.appendChild(notebookStyles);

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
  function updateHeight() {
    const value = Number(heightSlider.value);
    const ratio = (value - 160) / 27;
    const x = 46 + ratio * 553;
    const supportA = gaussian(value, 168, 5);
    const supportB = gaussian(value, 181, 5);
    const closer = supportA >= supportB ? 'Class A' : 'Class B';
    const stronger = Math.max(supportA, supportB);
    const weaker = Math.min(supportA, supportB);
    const y = 260 - 30 - Math.max(supportA, supportB) * 100;
    heightValue.textContent = String(value);
    heightInterpretation.textContent = `closer to ${closer} · support ${stronger.toFixed(2)} / ${weaker.toFixed(2)}`;
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
