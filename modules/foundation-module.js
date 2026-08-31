(() => {
  /*
   * Foundation canvases retain their original size, stage order, controls,
   * calculations, and interaction semantics. This renderer owns each canvas
   * surface completely: there is no digital chart underneath a second sketch
   * layer. The irregularities are cosmetic only and come from a seeded
   * generator, so changing a slider never changes a lesson's data path.
   */
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const ink = '#252822';
  const muted = '#596259';
  const paper = '#fbf4e2';
  const blue = '#2869ad';
  const green = '#4f956b';
  const purple = '#7960ae';
  const yellow = '#e5b94d';
  const red = '#c85e58';
  const orange = '#d89439';

  const cosmeticRandom = (seed) => {
    if (window.StatMLInk?.inkRandom) return window.StatMLInk.inkRandom(seed);
    let s = 2166136261 >>> 0;
    for (const ch of String(seed)) {
      s ^= ch.charCodeAt(0);
      s = Math.imul(s, 16777619) >>> 0;
    }
    return () => {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  };

  /*
   * The page stylesheet owns the grid and spacing.  This small, scoped layer
   * only changes the medium: paper, pencil/marker ink, and intentionally
   * imperfect edges.  Borders are painted by a seeded SVG stroke (with the
   * native border made transparent), so there is no clean digital rectangle
   * underneath a sketch overlay.  The data attributes are presentation hooks;
   * they do not affect tab order, semantics, or the lesson's DOM topology.
   */
  const svgUrl = svg => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  const selectArrow = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M4 7.5c3 2.7 5.8 4.2 6 4.3 1.4-.8 3.3-2.4 6-4.4" fill="none" stroke="#4f5a51" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.8 8.2c2.2 2 4.2 3 5.2 3.5 1.4-.8 3-2 5.3-3.6" fill="none" stroke="#4f5a51" stroke-width=".65" stroke-linecap="round" opacity=".35"/></svg>`);
  const rangeTrack = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 14" preserveAspectRatio="none"><path d="M3 7c35-1.8 61 1.4 94-.2s63 .9 95-.2 73 1.2 125-.1" fill="none" stroke="#7c9999" stroke-width="1.25" stroke-linecap="round"/><path d="M4 8c35-1 63 1.7 95-.1s63 .7 95-.2 72 1.2 123 0" fill="none" stroke="#d6e4df" stroke-width="2.2" stroke-linecap="round" opacity=".72"/></svg>`);
  const pencilRule = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 5" preserveAspectRatio="none"><path d="M2 2.5c28-.7 51 .6 78 0s55-.9 84 0 54 .7 75-.1 53 .4 79-.1" fill="none" stroke="#8d8978" stroke-width=".8" stroke-linecap="round"/><path d="M3 3.3c25-.4 52 .9 78 .2s54-.7 83 .1 56 .6 76-.2 53 .5 76 0" fill="none" stroke="#d1c8b0" stroke-width=".55" stroke-linecap="round" opacity=".72"/></svg>`);
  const stageRule = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 5" preserveAspectRatio="none"><path d="M2 2.5c28-.7 51 .6 78 0s55-.9 84 0 54 .7 75-.1 53 .4 79-.1" fill="none" stroke="#9f9a8a" stroke-width=".7" stroke-linecap="round" opacity=".6"/><path d="M3 3.2c25-.4 52 .9 78 .2s54-.7 83 .1 56 .6 76-.2 53 .5 76 0" fill="none" stroke="#d4cbb4" stroke-width=".5" stroke-linecap="round" opacity=".6"/></svg>`);
  const paperTexture = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140">
    <g fill="none" stroke="#b7a986" stroke-linecap="round" opacity=".18">
      <path d="M8 24c24-.8 41 .9 66-.2s39-1.1 57 .2" stroke-width=".7"/>
      <path d="M-2 83c22 .7 45-1 69 .2s43 .9 75-.1" stroke-width=".55"/>
      <path d="M32 7c-.8 13 .8 21-.2 33M111 96c.8 13-.7 24 .2 37" stroke-width=".5"/>
    </g>
    <g fill="#8e8062" opacity=".18">
      <circle cx="21" cy="49" r=".55"/><circle cx="79" cy="18" r=".45"/><circle cx="124" cy="55" r=".5"/>
      <circle cx="48" cy="122" r=".45"/><circle cx="96" cy="109" r=".52"/><circle cx="6" cy="132" r=".38"/>
    </g>
  </svg>`);

  const roughBorder = (seed, stroke = '#6b6659', accent = '', single = false) => {
    const r = cosmeticRandom(seed);
    const j = amount => (r() - .5) * amount;
    const p = (x, y) => `${(x + j(2.2)).toFixed(1)} ${(y + j(2.2)).toFixed(1)}`;
    const d = `M${p(3, 4)} C${p(23, 2)} ${p(48, 5)} ${p(72, 3)} C${p(84, 2)} ${p(92, 3)} ${p(97, 4)} C${p(99, 26)} ${p(96, 49)} ${p(98, 72)} C${p(99, 83)} ${p(98, 92)} ${p(97, 97)} C${p(74, 99)} ${p(48, 96)} ${p(26, 98)} C${p(16, 99)} ${p(8, 98)} ${p(3, 97)} C${p(1, 76)} ${p(4, 50)} ${p(2, 27)} C${p(1, 18)} ${p(2, 9)} ${p(3, 4)} Z`;
    const d2 = `M${p(4, 5)} C${p(24, 4)} ${p(47, 6)} ${p(73, 4)} C${p(85, 4)} ${p(93, 4)} ${p(96, 6)} C${p(97, 26)} ${p(95, 48)} ${p(96, 72)} C${p(98, 84)} ${p(96, 93)} ${p(95, 96)} C${p(73, 97)} ${p(50, 95)} ${p(26, 97)} C${p(15, 98)} ${p(8, 96)} ${p(5, 95)} C${p(3, 74)} ${p(5, 50)} ${p(4, 27)} C${p(3, 16)} ${p(3, 9)} ${p(4, 5)} Z`;
    const marker = accent ? `<path d="M${p(3, 9)} C${p(2, 30)} ${p(4, 67)} ${p(3, 91)}" fill="none" stroke="${accent}" stroke-width="2.2" stroke-linecap="round" opacity=".34" vector-effect="non-scaling-stroke"/>` : '';
    return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">${marker}<path d="${d}" fill="none" stroke="${stroke}" stroke-width=".82" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>${single ? '' : `<path d="${d2}" fill="none" stroke="${stroke}" stroke-width=".48" stroke-linecap="round" stroke-linejoin="round" opacity=".24" vector-effect="non-scaling-stroke"/>`}</svg>`);
  };

  const styleScenarioChoice = element => {
    const selected = element.getAttribute('aria-pressed') === 'true';
    element.style.setProperty('border', '1px solid transparent', 'important');
    element.style.setProperty('border-radius', '0', 'important');
    element.style.setProperty('box-shadow', 'none', 'important');
    element.style.setProperty('background-color', selected ? 'rgba(232, 243, 232, .72)' : 'transparent', 'important');
    element.style.setProperty('background-image', pencilRule, 'important');
    element.style.setProperty('background-position', '0 100%', 'important');
    element.style.setProperty('background-repeat', 'no-repeat', 'important');
    element.style.setProperty('background-size', '100% 7px', 'important');
    element.style.setProperty('padding-left', '0', 'important');
    element.style.setProperty('padding-right', '0', 'important');
  };

  const installFoundationInkTheme = () => {
    const body = document.body;
    if (!body || document.getElementById('foundation-ink-theme')) return;
    body.classList.add('foundation-handwritten');
    const wrapTitleSet = new Set([
      'Confidence Intervals & Hypothesis Testing',
      'Data Leakage & Pipelines',
      'Experimental Design & Randomisation',
      'Imbalanced Classification',
      'Missing Data & Encoding',
      'Probability & Sampling Distributions',
      'Regression Diagnostics',
    ]);
    if (wrapTitleSet.has(body.querySelector('.hero h1')?.textContent?.trim())) body.classList.add('foundation-title-wrap');
    const tripleTitleSet = new Set(['Confidence Intervals & Hypothesis Testing', 'Experimental Design & Randomisation']);
    if (tripleTitleSet.has(body.querySelector('.hero h1')?.textContent?.trim())) body.classList.add('foundation-title-triple');
    const mobileTitleWidths = {
      'Confidence Intervals & Hypothesis Testing': '200px',
      'Data Leakage & Pipelines': '250px',
      'Evaluation Metrics': '240px',
      'Experimental Design & Randomisation': '235px',
      'Gradient Boosting': '230px',
      'Imbalanced Classification': '270px',
      'Missing Data & Encoding': '270px',
      'Probability & Sampling Distributions': '235px',
      'Random Forest': '343.2px',
      'Regression Diagnostics': '270px',
    };
    const mobileTitle = body.querySelector('.hero h1')?.textContent?.trim();
    if (mobileTitleWidths[mobileTitle]) {
      body.classList.add(`foundation-mobile-title-${Object.keys(mobileTitleWidths).indexOf(mobileTitle)}`);
    }
    /* The handwritten face is intentionally wider than the original system
     * face in a few long foundation passages. Restore the baseline stage
     * floor where that changed a desktop wrap, without ever shrinking a stage
     * that naturally needs more room at a narrower viewport. These values are
     * rendered heights from the pre-handwriting foundation layout. */
    const baselineStageMinHeights = {
      'data-leakage-pipelines': { 8: 320.72 },
      'imbalanced-classification': { 3: 207.94 },
      'probability-sampling': { 1: 207.94, 6: 383.11 },
    };
    const pageSlug = location.pathname.split('/').pop()?.replace(/\.html$/, '');
    Object.entries(baselineStageMinHeights[pageSlug] || {}).forEach(([stage, minHeight]) => {
      const element = body.querySelector(`#stage-${stage}`);
      if (element) element.style.minHeight = `${minHeight}px`;
    });
    const focusBorder = roughBorder('foundation-focus', '#2869ad', '', true);

    const surfaceSelector = [
      '.map', '.interactive', 'canvas.viz', '.metric', '.quiz-option',
      '.scenario-options button', '.outcomes span', '.pathway div',
      '.workflow li', '.callout', '.control select'
    ].join(',');
    let surfaceIndex = 0;
    const decorateSurface = element => {
      if (element.dataset.inkSurface === 'paper') return;
      element.dataset.inkSurface = 'paper';
      const border = element.matches('.map')
        ? roughBorder(`foundation-surface:${surfaceIndex++}`, '#8b877b', '', true)
        : roughBorder(`foundation-surface:${surfaceIndex++}`);
      element.style.setProperty('--foundation-ink-border', border);
      if (element.matches('.scenario-options button')) styleScenarioChoice(element);
      if (element.matches('.control select')) {
        /* Native selects retain an author-visible bezel even when appearance
         * is removed. Make that bezel transparent inline so the rough SVG
         * edge is the only border, while keeping the original one-pixel box. */
        element.style.setProperty('border', '1px solid transparent', 'important');
      }
    };
    body.querySelectorAll(surfaceSelector).forEach(decorateSurface);

    /* Metrics and controls are rendered by each lab after this bootstrap. A
     * child-list observer gives those new nodes the same sole rough border as
     * the authored surfaces, without reparenting or changing their order. */
    const observer = new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(node => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (node.matches(surfaceSelector)) decorateSurface(node);
        node.querySelectorAll?.(surfaceSelector).forEach(decorateSurface);
        if (node.matches('input[type="range"]')) decorateRange(node);
        node.querySelectorAll?.('input[type="range"]').forEach(decorateRange);
      }));
    });
    observer.observe(body, { childList: true, subtree: true });

    const decorateRange = element => {
      if (element.dataset.inkControl === 'range') return;
      element.dataset.inkControl = 'range';
      element.style.setProperty('--foundation-ink-border', roughBorder(`foundation-range:${surfaceIndex++}`, '#4f5a51'));
    };
    body.querySelectorAll('input[type="range"]').forEach(decorateRange);

    const style = document.createElement('style');
    style.id = 'foundation-ink-theme';
    style.textContent = `
      body.foundation-handwritten {
        --foundation-paper: #fbf4e2;
        --foundation-paper-deep: #f2e5c8;
        --foundation-card: rgba(255, 252, 242, .78);
        --foundation-ink: #252822;
        --foundation-muted: #596259;
        --foundation-blue: #2869ad;
        --foundation-green: #4f956b;
        --foundation-purple: #7960ae;
        --foundation-yellow: #f1d477;
        --foundation-red: #c85e58;
        color: var(--foundation-ink) !important;
        background-color: var(--foundation-paper) !important;
        background-image: ${paperTexture} !important;
        font-family: "Patrick Hand", "Kalam", "Marker Felt", "Chalkboard SE", cursive !important;
      }
      body.foundation-handwritten *,
      body.foundation-handwritten *::before,
      body.foundation-handwritten *::after {
        font-family: "Patrick Hand", "Kalam", "Marker Felt", "Chalkboard SE", cursive !important;
      }
      body.foundation-handwritten .hero {
        color: var(--foundation-ink) !important;
        background-color: var(--foundation-paper) !important;
        background-image: ${paperTexture} !important;
        border-color: transparent !important;
      }
      body.foundation-handwritten .hero h1,
      body.foundation-handwritten .stage h2,
      body.foundation-handwritten .stage h3 {
        color: var(--foundation-ink) !important;
        font-family: "Patrick Hand", "Kalam", "Marker Felt", "Chalkboard SE", cursive !important;
        text-shadow: none !important;
      }
      body.foundation-handwritten .hero h1 {
        font-weight: 700 !important;
        letter-spacing: .01em !important;
      }
      /* Patrick Hand is intentionally retained for the handwritten voice, but
       * its compact glyph metrics otherwise pull authored copy onto fewer
       * lines than the foundation baseline.  A small tracking adjustment
       * restores those wraps without changing the content box geometry. */
      body.foundation-handwritten .hero p,
      body.foundation-handwritten .stage > div,
      body.foundation-handwritten .stage > div p,
      body.foundation-handwritten .stage > div li,
      body.foundation-handwritten .pathway div,
      body.foundation-handwritten .outcomes span,
      body.foundation-handwritten .callout,
      body.foundation-handwritten .workflow li,
      body.foundation-handwritten .question legend,
      body.foundation-handwritten .static-answer {
        letter-spacing: .08em !important;
      }
      body.foundation-handwritten .hero p {
        letter-spacing: .08em !important;
      }
      body.foundation-handwritten .stage h2 {
        letter-spacing: .10em !important;
      }
      body.foundation-handwritten .stage .feedback {
        letter-spacing: .14em !important;
      }
      body.foundation-handwritten.foundation-mobile-title-0 .stage:nth-child(5) .feedback {
        letter-spacing: .08em !important;
      }
      body.foundation-handwritten.foundation-mobile-title-5 .stage:nth-child(5) .feedback {
        letter-spacing: .08em !important;
      }
      body.foundation-handwritten .stage:nth-child(4) > div > p:nth-of-type(2) {
        letter-spacing: .10em !important;
      }
      @media (max-width: 800px) {
        body.foundation-handwritten .hero h1 {
          font-size: 44px !important;
          line-height: 39.2px !important;
        }
        ${Object.keys(mobileTitleWidths).map((title, index) => `body.foundation-handwritten.foundation-mobile-title-${index} .hero h1 { max-width: ${mobileTitleWidths[title]} !important; }`).join('\n        ')}
        body.foundation-handwritten.foundation-mobile-title-2 .hero p {
          letter-spacing: .10em !important;
        }
        body.foundation-handwritten.foundation-mobile-title-6 .outcomes span,
        body.foundation-handwritten.foundation-mobile-title-7 .outcomes span {
          letter-spacing: .16em !important;
        }
        body.foundation-handwritten.foundation-mobile-title-4 .stage:nth-child(5) > div > p:first-child {
          letter-spacing: .10em !important;
        }
        body.foundation-handwritten.foundation-mobile-title-1 .scenario-options button {
          line-height: 15.5px !important;
        }
        body.foundation-handwritten .stage:nth-child(4) h2 {
          max-width: 270px !important;
        }
        body.foundation-handwritten .stage:nth-child(4) > div > p:nth-of-type(2) {
          letter-spacing: .10em !important;
        }
        body.foundation-handwritten.foundation-mobile-title-0 .stage:nth-child(8) .callout.report,
        body.foundation-handwritten.foundation-mobile-title-1 .stage:nth-child(8) .callout.report,
        body.foundation-handwritten.foundation-mobile-title-2 .stage:nth-child(8) .callout:not(.report),
        body.foundation-handwritten.foundation-mobile-title-3 .stage:nth-child(8) .callout.report {
          letter-spacing: .16em !important;
        }
        body.foundation-handwritten.foundation-mobile-title-0 .stage:nth-child(2) > div,
        body.foundation-handwritten.foundation-mobile-title-1 .stage:nth-child(1) > div,
        body.foundation-handwritten.foundation-mobile-title-3 .stage:nth-child(2) > div,
        body.foundation-handwritten.foundation-mobile-title-3 .stage:nth-child(3) > div,
        body.foundation-handwritten.foundation-mobile-title-6 .stage:nth-child(7) > div,
        body.foundation-handwritten.foundation-mobile-title-7 .stage:nth-child(3) > div {
          letter-spacing: .10em !important;
        }
        body.foundation-handwritten.foundation-mobile-title-0 .stage:nth-child(2) > div,
        body.foundation-handwritten.foundation-mobile-title-3 .stage:nth-child(2) > div,
        body.foundation-handwritten.foundation-mobile-title-3 .stage:nth-child(4) > div > p:first-of-type {
          letter-spacing: .11em !important;
        }
        body.foundation-handwritten.foundation-mobile-title-0 .stage:nth-child(7) > div li,
        body.foundation-handwritten.foundation-mobile-title-6 .stage:nth-child(7) > div li,
        body.foundation-handwritten.foundation-mobile-title-8 .stage:nth-child(6) > div p {
          letter-spacing: .10em !important;
        }
        body.foundation-handwritten.foundation-mobile-title-3 .stage:nth-child(7) > div .workflow li:nth-child(2) {
          letter-spacing: .10em !important;
        }
        body.foundation-handwritten.foundation-mobile-title-1 .stage:nth-child(1) > div {
          letter-spacing: .12em !important;
        }
        body.foundation-handwritten.foundation-mobile-title-3 .stage:nth-child(3) > div,
        body.foundation-handwritten.foundation-mobile-title-7 .stage:nth-child(3) > div {
          letter-spacing: .11em !important;
        }
        body.foundation-handwritten.foundation-mobile-title-1 .stage:nth-child(3) .question legend,
        body.foundation-handwritten.foundation-mobile-title-9 .stage:nth-child(9) .question:nth-child(2) legend {
          letter-spacing: .12em !important;
        }
        body.foundation-handwritten.foundation-mobile-title-0 .stage:nth-child(9) .question:nth-child(5) .quiz-option:first-of-type {
          letter-spacing: .04em !important;
        }
        body.foundation-handwritten.foundation-mobile-title-1 .stage:nth-child(9) .question:nth-child(3) legend {
          letter-spacing: .16em !important;
        }
        body.foundation-handwritten.foundation-mobile-title-3 .stage:nth-child(9) .question:nth-child(4) .quiz-option:first-of-type {
          letter-spacing: .12em !important;
        }
      }
      @media (min-width: 801px) {
        body.foundation-handwritten.foundation-mobile-title-6 .stage:nth-child(4) > div > p:first-of-type {
          letter-spacing: .10em !important;
        }
        body.foundation-handwritten.foundation-mobile-title-1 .stage:nth-child(8) .callout.report {
          letter-spacing: .16em !important;
        }
      }
      /* The source lessons used a wider Georgia face and wrapped these seven
       * titles one line earlier. Keep their original hero/stage start while
       * leaving the three already-single-line titles at the natural width. */
      @media (min-width: 801px) {
        body.foundation-handwritten.foundation-title-wrap .hero h1 {
          max-width: 740px !important;
        }
        body.foundation-handwritten.foundation-title-triple .hero h1 {
          max-width: 650px !important;
        }
      }
      body.foundation-handwritten .stage h2 {
        text-decoration-line: underline;
        text-decoration-style: wavy;
        text-decoration-thickness: 1.15px;
        text-decoration-color: rgba(40, 105, 173, .58);
        text-underline-offset: .16em;
      }
      body.foundation-handwritten .hero p,
      body.foundation-handwritten .stage,
      body.foundation-handwritten .stage p,
      body.foundation-handwritten .stage li,
      body.foundation-handwritten .map,
      body.foundation-handwritten .map a,
      body.foundation-handwritten .pathway div,
      body.foundation-handwritten .outcomes span,
      body.foundation-handwritten .control label,
      body.foundation-handwritten .feedback,
      body.foundation-handwritten .question legend,
      body.foundation-handwritten .static-answer,
      body.foundation-handwritten .workflow li {
        color: var(--foundation-ink) !important;
      }
      body.foundation-handwritten .eyebrow,
      body.foundation-handwritten .stage-label,
      body.foundation-handwritten .pathway small {
        color: var(--foundation-blue) !important;
        font-weight: 700 !important;
        letter-spacing: .1em !important;
      }
      body.foundation-handwritten [data-ink-surface="paper"] {
        border-color: transparent !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        background-color: var(--foundation-card) !important;
        background-image: ${paperTexture}, var(--foundation-ink-border) !important;
        background-position: 0 0, 0 0 !important;
        background-repeat: repeat, no-repeat !important;
        background-size: 140px 140px, 100% 100% !important;
      }
      /* The authored confidence header uses pill/card borders. Keep its
       * original layout and content, but let the shared rough surface paint
       * be the only visible edge on this foundation page too. */
      body.foundation-handwritten.hw-confidence .outcomes span,
      body.foundation-handwritten.hw-confidence .pathway div {
        border-color: transparent !important;
        border-radius: 0 !important;
      }
      body.foundation-handwritten .stage {
        background-color: transparent !important;
        background-image: ${stageRule} !important;
        background-position: 0 100% !important;
        background-repeat: no-repeat !important;
        background-size: 100% 5px !important;
        border: 1px solid transparent !important;
        border-radius: 0 !important;
        box-shadow: none !important;
      }
      body.foundation-handwritten .map {
        background-color: rgba(255, 253, 245, .82) !important;
      }
      body.foundation-handwritten .interactive {
        background-color: rgba(255, 253, 245, .72) !important;
      }
      body.foundation-handwritten canvas.viz {
        display: block;
        border-color: transparent !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        background-color: transparent !important;
        background-image: none !important;
      }
      body.foundation-handwritten .outcomes span,
      body.foundation-handwritten .pathway div,
      body.foundation-handwritten .metric,
      body.foundation-handwritten .quiz-option,
      body.foundation-handwritten .scenario-options button,
      body.foundation-handwritten .control select,
      body.foundation-handwritten .workflow li {
        background-color: rgba(255, 253, 245, .78) !important;
      }
      body.foundation-handwritten .outcomes span {
        color: var(--foundation-ink) !important;
        text-decoration: underline;
        text-decoration-style: wavy;
        text-decoration-color: rgba(121, 96, 174, .44);
        text-underline-offset: .18em;
      }
      body.foundation-handwritten .stage strong,
      body.foundation-handwritten .callout strong {
        background-color: rgba(241, 212, 119, .48) !important;
        padding: 0 .1em;
      }
      body.foundation-handwritten .callout {
        background-color: #fff3bf !important;
        border-left-color: transparent !important;
        background-image: ${paperTexture}, var(--foundation-ink-border) !important;
      }
      body.foundation-handwritten .callout.report {
        background-color: #e8f3e8 !important;
      }
      /* The shared sticky-note helper uses a painted texture on its little
       * tape strip. Foundation pages keep that strip, but render its material
       * as the same paper-fibre SVG so every decoration stays visibly tactile. */
      html body.foundation-handwritten .hw-tape {
        background-color: rgba(221, 199, 151, .72) !important;
        background-image: ${paperTexture} !important;
        background-repeat: repeat !important;
        background-size: 140px 140px !important;
      }
      body.foundation-handwritten .metric {
        text-align: center;
      }
      body.foundation-handwritten .metric b {
        color: var(--foundation-blue) !important;
        font-weight: 700 !important;
        text-decoration: underline;
        text-decoration-style: wavy;
        text-decoration-color: rgba(40, 105, 173, .35);
        text-underline-offset: .16em;
      }
      body.foundation-handwritten .question {
        border-top: 0 !important;
        background-image: ${pencilRule} !important;
        background-position: 0 0 !important;
        background-repeat: no-repeat !important;
        background-size: 100% 3px !important;
      }
      body.foundation-handwritten .question:first-child {
        background-image: none !important;
      }
      body.foundation-handwritten .quiz-option,
      body.foundation-handwritten .scenario-options button,
      body.foundation-handwritten .control select {
        cursor: pointer;
        color: var(--foundation-ink) !important;
        border-color: transparent !important;
        border-radius: 0 !important;
        box-shadow: none !important;
      }
      body.foundation-handwritten .quiz-option {
        line-height: 15.75px !important;
        letter-spacing: .08em !important;
      }
      /* Scenario choices are loose, underlined prompts rather than software
       * buttons. The stronger qualifier wins over the shared control rules;
       * the small SVG rule remains visibly uneven without changing placement. */
      html body.foundation-handwritten .scenario-options button {
        border: 1px solid transparent !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        background-color: transparent !important;
        background-image: ${pencilRule} !important;
        background-position: 0 100% !important;
        background-repeat: no-repeat !important;
        background-size: 100% 7px !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
      }
      html body.foundation-handwritten .scenario-options button[aria-pressed="true"] {
        background-color: rgba(232, 243, 232, .72) !important;
      }
      body.foundation-handwritten .quiz-option.correct,
      body.foundation-handwritten .scenario-options button[aria-pressed="true"] {
        background-color: #e8f3e8 !important;
        color: #245d3b !important;
      }
      body.foundation-handwritten .quiz-option.incorrect {
        background-color: #fde9de !important;
        color: #873b37 !important;
      }
      body.foundation-handwritten .control select {
        appearance: none;
        -webkit-appearance: none;
        padding-right: 1.6rem;
        border: 1px solid transparent !important;
        background-image: ${paperTexture}, var(--foundation-ink-border), ${selectArrow} !important;
        background-position: 0 0, 0 0, right .45rem center !important;
        background-repeat: repeat, no-repeat, no-repeat !important;
        background-size: 140px 140px, 100% 100%, .72rem .72rem !important;
      }
      body.foundation-handwritten input[type="range"] {
        appearance: none;
        -webkit-appearance: none;
        height: 1rem;
        background: transparent !important;
      }
      /* The extra html qualifier keeps this paper track authoritative even
       * after the shared theme re-appends its stylesheet during bootstrap. */
      html body.foundation-handwritten input[type="range"]::-webkit-slider-runnable-track {
        height: .38rem;
        border: 1px solid rgba(88, 83, 72, .34) !important;
        border-radius: 42% 58% 46% 54% !important;
        background-color: #dce8e5 !important;
        background-image: ${rangeTrack} !important;
        background-repeat: no-repeat !important;
        background-size: 100% 100% !important;
      }
      html body.foundation-handwritten input[type="range"]::-moz-range-track {
        height: .38rem;
        border: 1px solid rgba(88, 83, 72, .34) !important;
        border-radius: 42% 58% 46% 54% !important;
        background-color: #dce8e5 !important;
        background-image: ${rangeTrack} !important;
        background-repeat: no-repeat !important;
        background-size: 100% 100% !important;
      }
      html body.foundation-handwritten input[type="range"]::-webkit-slider-thumb {
        appearance: none;
        -webkit-appearance: none;
        width: 1.05rem;
        height: 1.05rem;
        margin-top: -.36rem;
        border: 1px solid rgba(88, 83, 72, .58) !important;
        border-radius: 42% 58% 48% 52% !important;
        background-color: var(--foundation-yellow) !important;
        background-image: ${paperTexture} !important;
      }
      html body.foundation-handwritten input[type="range"]::-moz-range-thumb {
        width: 1.05rem;
        height: 1.05rem;
        border: 1px solid rgba(88, 83, 72, .58) !important;
        border-radius: 42% 58% 48% 52% !important;
        background-color: var(--foundation-yellow) !important;
        background-image: ${paperTexture} !important;
      }
      body.foundation-handwritten .workflow li::before {
        border: 1px solid rgba(88, 83, 72, .58) !important;
        border-radius: 38% 62% 47% 53% !important;
        background-color: var(--foundation-yellow) !important;
        color: var(--foundation-ink) !important;
        box-shadow: none !important;
      }
      body.foundation-handwritten .static-answer summary {
        color: var(--foundation-purple) !important;
        text-decoration: underline;
        text-decoration-style: wavy;
        text-underline-offset: .18em;
      }
      body.foundation-handwritten .static-answer summary::marker {
        color: var(--foundation-purple) !important;
      }
      body.foundation-handwritten :focus-visible {
        outline: 0 !important;
        outline-offset: 0 !important;
        background-image: ${focusBorder} !important;
        background-position: 0 0 !important;
        background-repeat: no-repeat !important;
        background-size: 100% 100% !important;
      }
    `;
    document.head.appendChild(style);
  };

  const controls = (root, defs, update) => {
    const box = root.querySelector('.interactive-controls');
    box.innerHTML = defs.map(d => d.type === 'select'
      ? `<div class="control"><label for="${d.id}">${d.label}</label><select id="${d.id}">${d.options.map(o => `<option value="${o[0]}">${o[1]}</option>`).join('')}</select></div>`
      : `<div class="control"><label for="${d.id}">${d.label}<output id="${d.id}-out">${d.value}</output></label><input id="${d.id}" type="range" min="${d.min}" max="${d.max}" step="${d.step}" value="${d.value}"></div>`).join('')
      + '<div class="metrics" aria-live="polite"></div><p class="feedback"></p>';
    defs.forEach(d => {
      const el = box.querySelector('#' + d.id);
      const refresh = () => {
        const out = box.querySelector('#' + d.id + '-out');
        if (out) out.value = el.value;
        update();
      };
      el.addEventListener('input', refresh);
    });
    return {
      box,
      val: id => {
        const e = box.querySelector('#' + id);
        return e.type === 'range' ? +e.value : e.value;
      },
      metrics: items => {
        box.querySelector('.metrics').innerHTML = items.map(x => `<div class="metric"><b>${x[1]}</b>${x[0]}</div>`).join('');
      },
      note: s => { box.querySelector('.feedback').textContent = s; },
    };
  };

  const canvas = root => {
    const c = root.querySelector('canvas');
    const ctx = c.getContext('2d');
    /* The authored canvas attributes are the renderer's logical coordinate
     * system. Keep those dimensions intact: the original modules use them as
     * part of their layout contract. The stylesheet may display the canvas at
     * a responsive size, so map the logical coordinates into that CSS box
     * without rewriting the backing bitmap (which can change the intrinsic
     * aspect ratio and make a resize observer chase its own updates). */
    const logicalWidth = Number(c.getAttribute('width')) || c.width || 620;
    const logicalHeight = Number(c.getAttribute('height')) || c.height || 300;
    let cssWidth = 0;
    let cssHeight = 0;
    let redraw = null;
    const syncCanvas = () => {
      const rect = c.getBoundingClientRect();
      const width = Math.max(1, rect.width || logicalWidth);
      const height = Math.max(1, rect.height || logicalHeight);
      const changed = Math.abs(width - cssWidth) > .01 || Math.abs(height - cssHeight) > .01;
      cssWidth = width;
      cssHeight = height;
      return changed;
    };
    const screen = () => {
      /* A draw pass is a single logical frame. The canvas bitmap stays at the
       * authored dimensions, while this transform makes the logical drawing
       * coordinates land in the measured CSS display box. ResizeObserver calls
       * sync before requesting a fresh frame. */
      if (!cssWidth || !cssHeight) syncCanvas();
      ctx.setTransform(logicalWidth / cssWidth, 0, 0, logicalHeight / cssHeight, 0, 0);
    };
    const mapPoint = p => [p[0] * cssWidth / logicalWidth, p[1] * cssHeight / logicalHeight];
    const mapPoints = points => points.map(mapPoint);
    const font = (size, weight = 400) => `${weight} ${size}px "Patrick Hand", "Kalam", "Marker Felt", "Chalkboard SE", cursive`;
    const roughPoints = (points, seed, amount = 2.15) => {
      const r = cosmeticRandom(seed);
      return points.map((p, i) => {
        if (i === 0 || i === points.length - 1) return [p[0], p[1]];
        return [p[0] + (r() - .5) * amount, p[1] + (r() - .5) * amount];
      });
    };
    const line = (points, { color = ink, width = 1.25, seed = 'line', dash = [], rough = true } = {}) => {
      if (!points || points.length < 2) return;
      let pts = points;
      if (rough) {
        pts = roughPoints(points, seed);
        if (points.length === 2) {
          const r = cosmeticRandom(`${seed}:middle`);
          pts = [pts[0], [
            (points[0][0] + points[1][0]) / 2 + (r() - .5) * 2.6,
            (points[0][1] + points[1][1]) / 2 + (r() - .5) * 2.6,
          ], pts[1]];
        }
      }
      screen();
      pts = mapPoints(pts);
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash(dash);
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.stroke();
      /* A second, lighter pass is the small wobble of a pen returning over
       * the same mark.  It is deliberately subtle so axes stay legible while
       * curves, intervals, arrows, and guide rules no longer read as perfect
       * one-pass vector strokes. */
      if (rough && width >= .8) {
        const secondary = roughPoints(pts, `${seed}:second-pass`, .95);
        ctx.globalAlpha = .23;
        ctx.lineWidth = Math.max(.45, width * .48);
        ctx.beginPath();
        secondary.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
        ctx.stroke();
      }
      ctx.restore();
    };
    const polygon = (points, { stroke = ink, fill = null, width = 1.2, seed = 'polygon', rough = true } = {}) => {
      if (!points || points.length < 2) return;
      screen();
      const pts = mapPoints(rough ? roughPoints(points, seed, 2.8) : points);
      ctx.save();
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (fill) {
        ctx.fillStyle = fill;
        ctx.beginPath();
        pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
        ctx.closePath();
        ctx.fill();
      }
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.beginPath();
        pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
        ctx.closePath();
        ctx.stroke();
        if (rough && width >= .8) {
          const secondary = roughPoints(pts, `${seed}:second-pass`, .95);
          ctx.globalAlpha = .23;
          ctx.lineWidth = Math.max(.45, width * .46);
          ctx.beginPath();
          secondary.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
          ctx.closePath();
          ctx.stroke();
        }
      }
      ctx.restore();
    };
    const dot = (x, y, radius, { color = blue, seed = 'dot', outline = null } = {}) => {
      const r = cosmeticRandom(seed);
      const sx = cssWidth / logicalWidth;
      const sy = cssHeight / logicalHeight;
      const radiusCss = Math.min(sx, sy);
      const points = [];
      for (let i = 0; i < 18; i++) {
        const a = i / 18 * Math.PI * 2;
        const rr = radius + (r() - .5) * Math.min(1.2, radius * .16);
        /* Map the marker's radius through the smaller display scale on both
         * axes. The chart may be taller than its logical coordinate system,
         * but dots/points must stay round rather than turning into ovals. */
        points.push([x + Math.cos(a) * rr * radiusCss / sx, y + Math.sin(a) * rr * radiusCss / sy]);
      }
      polygon(points, { stroke: outline || color, fill: color, width: .9, seed: `${seed}:edge`, rough: false });
      if (radius >= 4) line([[x - radius * .35, y - radius * .18], [x + radius * .15, y + radius * .25]], { color: 'rgba(255,255,255,.65)', width: .7, seed: `${seed}:shine`, rough: false });
    };
    const hatch = (x, y, w, h, color, seed = 'hatch', spacing = 9) => {
      if (w <= 0 || h <= 0) return;
      screen();
      ctx.save();
      ctx.beginPath();
      ctx.rect(x * cssWidth / logicalWidth, y * cssHeight / logicalHeight, w * cssWidth / logicalWidth, h * cssHeight / logicalHeight);
      ctx.clip();
      ctx.globalAlpha = .36;
      for (let i = -h; i < w + h; i += spacing) line([[x + i, y + h], [x + i + h, y]], { color, width: .85, seed: `${seed}:${i}`, rough: true });
      ctx.restore();
    };
    const bar = (x, baseline, w, h, { color = blue, label = '', value = '', seed = 'bar', fillAlpha = .18 } = {}) => {
      const y = baseline - Math.max(0, h);
      const height = Math.max(0, h);
      /* Fill the same slightly uneven path as the outline.  A clean
       * rectangle underneath a rough stroke would leave a digital bar visible
       * at its edges, so the bar owns one hand-drawn path from fill to ink. */
      ctx.save();
      ctx.globalAlpha = fillAlpha;
      polygon([[x, baseline], [x + w * .02, y], [x + w * .49, y + (h > 2 ? .8 : 0)], [x + w, y + .2], [x + w * .98, baseline]], { stroke: null, fill: color, width: 0, seed: `${seed}:fill` });
      ctx.restore();
      hatch(x, y, w, height, color, `${seed}:hatch`);
      polygon([[x, baseline], [x, y], [x + w, y], [x + w, baseline]], { stroke: color, fill: null, width: 1.25, seed: `${seed}:outline` });
      if (value !== '') text(value, x + w / 2, Math.max(17, y - 7), color, 12, 'center', 700);
      if (label) text(label, x + w / 2, baseline + 21, ink, 13, 'center');
    };
    const text = (s, x, y, color = ink, size = 13, align = 'left', weight = 400, angle = 0) => {
      screen();
      ctx.save();
      ctx.translate(x * cssWidth / logicalWidth, y * cssHeight / logicalHeight);
      ctx.rotate(angle);
      ctx.fillStyle = color;
      ctx.font = font(size, weight);
      ctx.textAlign = align;
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(s, 0, 0);
      ctx.restore();
    };
    const clear = () => {
      syncCanvas();
      screen();
      ctx.clearRect(0, 0, cssWidth, cssHeight);
    };
    const axes = ({ x0 = 45, y0 = 260, x1 = 600, y1 = 15 } = {}) => {
      line([[x0, y1], [x0, y0], [x1, y0]], { color: muted, width: 1.25, seed: 'axes' });
    };
    const arrow = (from, to, { color = ink, width = 1.15, seed = 'arrow' } = {}) => {
      line([from, to], { color, width, seed });
      const a = Math.atan2(to[1] - from[1], to[0] - from[0]), s = 6;
      line([to, [to[0] - s * Math.cos(a - .55), to[1] - s * Math.sin(a - .55)]], { color, width, seed: `${seed}:a` });
      line([to, [to[0] - s * Math.cos(a + .55), to[1] - s * Math.sin(a + .55)]], { color, width, seed: `${seed}:b` });
    };
    const mark = (kind, x, y, { color = ink, seed = 'status-mark' } = {}) => {
      const sx = cssWidth / logicalWidth;
      const sy = cssHeight / logicalHeight;
      const uniform = Math.min(sx, sy);
      const ux = uniform / sx;
      const uy = uniform / sy;
      if (kind === 'warning') {
        polygon([[x + 6 * ux, y - 7 * uy], [x, y + 7 * uy], [x + 12 * ux, y + 7 * uy]], { stroke: color, fill: null, width: 1.15, seed: `${seed}:triangle` });
        line([[x + 6 * ux, y - 2 * uy], [x + 6 * ux, y + 3 * uy]], { color, width: 1.05, seed: `${seed}:stem` });
        dot(x + 6 * ux, y + 5 * uy, 1, { color, seed: `${seed}:dot` });
        return;
      }
      line([[x, y + 2 * uy], [x + 4 * ux, y + 7 * uy], [x + 13 * ux, y - 3 * uy]], { color, width: 1.35, seed: `${seed}:check` });
      line([[x + ux, y + 3 * uy], [x + 4 * ux, y + 8 * uy], [x + 14 * ux, y - 2 * uy]], { color, width: .55, seed: `${seed}:second-pass` });
    };
    const setRedraw = fn => {
      redraw = fn;
      syncCanvas();
    };
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(() => {
        if (redraw && syncCanvas()) redraw();
      });
      observer.observe(c);
    } else {
      window.addEventListener('resize', () => {
        if (redraw && syncCanvas()) redraw();
      });
    }
    return { c, ctx, clear, line, polygon, dot, hatch, bar, text, axes, arrow, mark, setRedraw };
  };

  function metricsLab(root) {
    const v = canvas(root);
    const ui = controls(root, [
      { id: 'threshold', label: 'Decision threshold', min: .1, max: .9, step: .05, value: .5 },
      { id: 'prevalence', label: 'Positive prevalence (%)', min: 5, max: 50, step: 5, value: 20 },
      { id: 'fncost', label: 'False-negative cost', min: 1, max: 10, step: 1, value: 5 },
    ], draw);
    function draw() {
      const t = ui.val('threshold'), p = ui.val('prevalence') / 100, n = 1000;
      const recall = clamp(1.08 - t * .72, .35, .98), fpr = clamp(.52 - t * .5, .03, .47);
      const tp = Math.round(n * p * recall), fn = Math.round(n * p) - tp, fp = Math.round(n * (1 - p) * fpr), tn = n - tp - fn - fp;
      const precision = tp / (tp + fp);
      ui.metrics([['Precision', (precision * 100).toFixed(1) + '%'], ['Recall', (recall * 100).toFixed(1) + '%'], ['Cost', String(fp + fn * ui.val('fncost'))]]);
      v.clear();
      v.axes();
      const vals = [tp, fp, fn, tn], labs = ['TP', 'FP', 'FN', 'TN'], cols = [green, orange, red, blue];
      vals.forEach((value, i) => {
        const x0 = 70 + i * 135, h = value / Math.max(...vals) * 180;
        v.bar(x0, 235, 100, h, { color: cols[i], seed: `metrics:${labs[i]}` });
        v.text(`${labs[i]} ${value}`, x0, 253, cols[i], 12);
      });
      ui.note('The “best” threshold changes when prevalence or error costs change. Choose it on validation data.');
    }
    v.setRedraw(draw);
    draw();
  }

  function pipelineLab(root) {
    const v = canvas(root);
    const scenarios = [
      ['Scale all rows → random CV', 'Leakage: validation rows influence scaling.'],
      ['Grouped split → fold-fitted imputer → model', 'Safe: groups stay together and preprocessing fits within folds.'],
      ['Oversample all rows → create folds', 'Leakage: related synthetic cases can cross folds.'],
      ['Chronological split → train-fitted features', 'Safe for ordered data when every validation row occurs later.'],
    ];
    const box = root.querySelector('.interactive-controls');
    box.innerHTML = `<div class="scenario-options">${scenarios.map((s, i) => `<button type="button" data-i="${i}">${s[0]}</button>`).join('')}</div><p class="feedback" aria-live="polite">Choose a pipeline.</p>`;
    let selectedIndex = 0;
    const draw = i => {
      v.clear();
      v.text('Data boundary audit', 40, 35, purple, 18);
      const labels = ['Raw rows', 'Split', 'Fit transforms', 'Validate'];
      labels.forEach((label, j) => {
        const x = 45 + j * 145, active = j === i % 4;
        const fill = active ? 'rgba(241,212,119,.42)' : 'rgba(255,253,245,.58)';
        const boxPoints = [[x, 95], [x + 34, 95], [x + 72, 95], [x + 110, 95], [x + 110, 130], [x + 110, 165], [x + 74, 165], [x + 35, 165], [x, 165], [x, 130]];
        v.polygon(boxPoints, { stroke: active ? yellow : muted, fill, width: 1.15, seed: `pipeline:box:${j}` });
        const labelSize = label === 'Fit transforms' ? 10 : 12;
        v.text(label, x + 55, 135, active ? ink : muted, labelSize, 'center', active ? 700 : 400);
        if (j < 3) v.arrow([x + 120, 138], [x + 140, 138], { color: active ? blue : muted, seed: `pipeline:arrow:${j}` });
      });
    };
    box.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
      box.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', 'true');
      box.querySelectorAll('button').forEach(styleScenarioChoice);
      const i = +button.dataset.i;
      selectedIndex = i;
      box.querySelector('.feedback').textContent = scenarios[i][1];
      draw(i);
    }));
    v.setRedraw(() => draw(selectedIndex));
    draw(0);
  }

  function diagnosticsLab(root) {
    const v = canvas(root);
    const ui = controls(root, [{ id: 'pattern', label: 'Residual pattern', type: 'select', options: [['healthy', 'Healthy cloud'], ['curve', 'Curvature'], ['funnel', 'Funnel'], ['influence', 'Influential point']] }], draw);
    function draw() {
      v.clear();
      const kind = ui.val('pattern');
      v.axes();
      for (let i = 0; i < 55; i++) {
        const x = 55 + i * 9.5;
        let spread = kind === 'funnel' ? 4 + i * .35 : 16;
        let y = 137 + Math.sin(i * 2.17) * spread;
        if (kind === 'curve') y = 180 - .004 * (i * 9.5 - 250) ** 2 + Math.sin(i) * 8;
        if (kind === 'influence' && i === 52) y = 35;
        v.dot(x, y, i === 52 && kind === 'influence' ? 4.8 : 3.3, { color: i === 52 && kind === 'influence' ? red : blue, seed: `diagnostics:${kind}:${i}` });
      }
      v.line([[45, 137], [600, 137]], { color: red, width: 1.05, seed: 'diagnostics:zero' });
      const notes = { healthy: 'No obvious structure; continue checking independence and influence.', curve: 'Curvature suggests missing functional form.', funnel: 'A funnel suggests heteroscedasticity.', influence: 'An isolated high-leverage residual may strongly alter the fit.' };
      ui.metrics([['Pattern', kind], ['Next', 'Investigate'], ['Delete?', 'Not automatically']]);
      ui.note(notes[kind]);
    }
    v.setRedraw(draw);
    draw();
  }

  function samplingLab(root) {
    const v = canvas(root);
    const means = [];
    const ui = controls(root, [{ id: 'n', label: 'Independent sample size', min: 4, max: 144, step: 4, value: 16 }, { id: 'draws', label: 'Repeated samples', min: 20, max: 300, step: 20, value: 100 }], draw);
    /* Keep this call path identical to the original foundation lesson. */
    function rnd() { let s = 0; for (let i = 0; i < 12; i++) s += Math.random(); return s - 6; }
    function draw() {
      means.length = 0;
      const n = ui.val('n'), d = ui.val('draws');
      for (let k = 0; k < d; k++) { let m = 0; for (let i = 0; i < n; i++) m += 50 + 12 * rnd(); means.push(m / n); }
      v.clear();
      v.axes();
      const bins = 24, c = Array(24).fill(0);
      means.forEach(x => c[clamp(Math.floor((x - 38) / 1), 0, 23)]++);
      c.forEach((value, i) => {
        const h = value / Math.max(...c) * 210;
        v.bar(48 + i * 22.5, 258, 18, h, { color: purple, seed: `sampling:bin:${i}` });
      });
      ui.metrics([['SE theory', (12 / Math.sqrt(n)).toFixed(2)], ['Samples', d], ['Mean', (means.reduce((a, b) => a + b, 0) / d).toFixed(1)]]);
      ui.note('This histogram is a distribution of sample means, not of individual scores.');
    }
    v.setRedraw(draw);
    draw();
  }

  function testingLab(root) {
    const v = canvas(root);
    const ui = controls(root, [{ id: 'n', label: 'Sample size per group', min: 10, max: 300, step: 10, value: 50 }, { id: 'effect', label: 'Observed effect', min: 0, max: 1, step: .05, value: .3 }], draw);
    function erf(x) { const s = Math.sign(x), a = Math.abs(x), t = 1 / (1 + .3275911 * a); return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - .284496736) * t + .254829592) * t * Math.exp(-a * a)); }
    function draw() {
      const n = ui.val('n'), e = ui.val('effect'), se = Math.sqrt(2 / n), z = e / se, p = 2 * (1 - (.5 * (1 + erf(Math.abs(z) / Math.sqrt(2))))), lo = e - 1.96 * se, hi = e + 1.96 * se;
      v.clear();
      v.axes();
      const x0 = 320, scale = 210;
      v.line([[x0 + lo * scale, 135], [x0 + hi * scale, 135]], { color: blue, width: 4.2, seed: 'testing:interval' });
      v.dot(x0 + e * scale, 135, 7, { color: red, seed: 'testing:estimate' });
      v.line([[x0, 45], [x0, 225]], { color: muted, width: 1, seed: 'testing:null' });
      v.text('null', x0 + 7, 57, muted, 11);
      ui.metrics([['SE', se.toFixed(3)], ['95% CI', `${lo.toFixed(2)}, ${hi.toFixed(2)}`], ['p-value', p < .001 ? '<.001' : p.toFixed(3)]]);
      ui.note('Larger n can make a small effect precise; it does not make the effect practically important.');
    }
    v.setRedraw(draw);
    draw();
  }

  function forestLab(root) {
    const v = canvas(root);
    const ui = controls(root, [{ id: 'trees', label: 'Number of trees', min: 1, max: 500, step: 10, value: 100 }, { id: 'mtry', label: 'Features tried per split', min: 1, max: 12, step: 1, value: 4 }], draw);
    function draw() {
      const trees = ui.val('trees'), m = ui.val('mtry');
      v.clear();
      v.axes();
      const points = [];
      for (let x = 0; x < 540; x += 6) { const k = 1 + x / 540 * (trees - 1), err = .3 - .09 * (1 - Math.exp(-k / 55)) + .01 * Math.sin(x * .2) / Math.sqrt(k); points.push([50 + x, 40 + err * 600]); }
      v.line(points, { color: green, width: 2.6, seed: 'forest:oob' });
      const corr = clamp(.18 + m * .045, .2, .8), err = .21 + .035 * Math.abs(m - 4) / 8 + .05 / Math.sqrt(trees);
      ui.metrics([['OOB error', (err * 100).toFixed(1) + '%'], ['Tree correlation', corr.toFixed(2)], ['Stability', trees > 150 ? 'High' : 'Growing']]);
      ui.note('More trees stabilise the average; feature sampling trades individual-tree strength against correlation.');
    }
    v.setRedraw(draw);
    draw();
  }

  function boostingLab(root) {
    const v = canvas(root);
    const ui = controls(root, [{ id: 'rate', label: 'Learning rate', min: .02, max: .4, step: .02, value: .1 }, { id: 'trees', label: 'Boosting rounds', min: 10, max: 500, step: 10, value: 150 }], draw);
    function draw() {
      const r = ui.val('rate'), t = ui.val('trees'), complex = r * t;
      const train = .55 * Math.exp(-complex / 10) + .05, val = .48 * Math.exp(-complex / 13) + .11 + .0009 * Math.max(0, complex - 14) ** 1.7;
      v.clear();
      v.axes();
      const curveValue = (kind, k) => kind
        ? (.48 * Math.exp(-k / 13) + .11 + .0009 * Math.max(0, k - 14) ** 1.7)
        : (.55 * Math.exp(-k / 10) + .05);
      const steps = [];
      let maxLoss = Math.max(.2, train, val);
      for (let x = 0; x < 540; x += 5) {
        const k = x / 540 * complex;
        steps.push({ x: 50 + x, k });
        maxLoss = Math.max(maxLoss, curveValue(0, k), curveValue(1, k));
      }
      const yForLoss = loss => 35 + clamp(loss / maxLoss, 0, 1) * 205;
      [['Training loss', blue], ['Validation loss', red]].forEach(([label, color], j) => {
        const points = steps.map(({ x, k }) => [x, yForLoss(curveValue(j, k))]);
        v.line(points, { color, width: 2.4, seed: `boosting:${j}` });
        /* Keep the two handwritten curve labels on separate portions of the
         * plot, including when validation loss rises sharply at an extreme
         * setting. This leaves the data path untouched while avoiding an
         * unreadable pile-up on narrow canvases. */
        const labelFraction = j ? .62 : .18;
        const p = points[Math.min(points.length - 1, Math.floor(points.length * labelFraction))];
        const labelY = j ? clamp(p[1] - 10, 48, 248) : clamp(p[1] + 16, 48, 248);
        v.text(label, p[0], labelY, color, 12, 'left', 700);
      });
      ui.metrics([['Train loss', train.toFixed(3)], ['Validation loss', val.toFixed(3)], ['State', complex < 5 ? 'Underfit' : complex > 22 ? 'Overfit' : 'Useful range']]);
      ui.note('Learning rate and round count must be tuned together on validation data.');
    }
    v.setRedraw(draw);
    draw();
  }

  function missingLab(root) {
    const v = canvas(root);
    const ui = controls(root, [{ id: 'missing', label: 'Missing values (%)', min: 5, max: 50, step: 5, value: 20 }, { id: 'strategy', label: 'Strategy', type: 'select', options: [['mean', 'Mean imputation'], ['indicator', 'Mean + indicator'], ['multiple', 'Multiple imputation'], ['complete', 'Complete cases']] }], draw);
    function draw() {
      const m = ui.val('missing') / 100, s = ui.val('strategy');
      const vals = { mean: [.8 * m, 1 + m], indicator: [.45 * m, 1 + .7 * m], multiple: [.2 * m, 1 + .35 * m], complete: [.35 * m, 1 + 1.7 * m] };
      const [bias, rmse] = vals[s];
      v.clear();
      v.axes();
      const bars = [['Bias', bias * 260, red], ['Prediction error', (rmse - 1) * 180, orange], ['Uncertainty', s === 'multiple' ? 55 : 25 + m * 180, purple]];
      bars.forEach((b, i) => {
        v.bar(85 + i * 170, 250, 100, b[1], { color: b[2], seed: `missing:${b[0]}` });
        v.text(b[0], 135 + i * 170, 270, ink, 13, 'center');
      });
      ui.metrics([['Bias index', bias.toFixed(2)], ['Error index', rmse.toFixed(2)], ['Inference', s === 'multiple' ? 'Uncertainty propagated' : 'Use caution']]);
      ui.note('This stylised comparison changes with the missingness assumption; no imputation method proves that assumption.');
    }
    v.setRedraw(draw);
    draw();
  }

  function imbalanceLab(root) {
    const v = canvas(root);
    const ui = controls(root, [{ id: 'prev', label: 'Prevalence (%)', min: 1, max: 30, step: 1, value: 5 }, { id: 'threshold', label: 'Threshold', min: .1, max: .9, step: .05, value: .5 }, { id: 'fncost', label: 'False-negative cost', min: 1, max: 20, step: 1, value: 10 }], draw);
    function draw() {
      const p = ui.val('prev') / 100, t = ui.val('threshold'), n = 10000, rec = clamp(1.05 - .8 * t, .25, .97), fpr = clamp(.4 - .38 * t, .02, .37), tp = n * p * rec, fn = n * p - tp, fp = n * (1 - p) * fpr, prec = tp / (tp + fp), cost = fp + fn * ui.val('fncost');
      v.clear();
      v.axes();
      [['Precision', prec, blue], ['Recall', rec, green], ['False-positive rate', fpr, red]].forEach((b, i) => {
        v.bar(80 + i * 170, 250, 105, b[1] * 190, { color: b[2], seed: `imbalance:${b[0]}` });
        v.text(b[0], 132.5 + i * 170, 272, ink, 13, 'center');
      });
      ui.metrics([['Precision', (prec * 100).toFixed(1) + '%'], ['Recall', (rec * 100).toFixed(1) + '%'], ['Expected cost', Math.round(cost)]]);
      ui.note('Natural prevalence strongly affects precision. Keep it natural in validation and test evaluation.');
    }
    v.setRedraw(draw);
    draw();
  }

  function designLab(root) {
    const v = canvas(root);
    const ui = controls(root, [{ id: 'n', label: 'Total participants', min: 40, max: 1000, step: 20, value: 400 }, { id: 'cluster', label: 'Cluster size', min: 1, max: 50, step: 1, value: 20 }, { id: 'icc', label: 'Intraclass correlation', min: 0, max: .3, step: .01, value: .05 }, { id: 'effect', label: 'Standardised effect', min: .1, max: .8, step: .05, value: .3 }], draw);
    function draw() {
      const n = ui.val('n'), m = ui.val('cluster'), icc = ui.val('icc'), de = 1 + (m - 1) * icc, eff = n / de, e = ui.val('effect'), z = e * Math.sqrt(eff / 2) - 1.96, power = clamp(.5 + .35 * z, .05, .99);
      v.clear();
      v.axes();
      v.bar(110, 250, 130, n / 1000 * 190, { color: blue, seed: 'design:nominal' });
      v.bar(350, 250, 130, eff / 1000 * 190, { color: purple, seed: 'design:effective' });
      v.text('Nominal n', 135, 272, ink, 13);
      v.text('Effective n', 370, 272, ink, 13);
      ui.metrics([['Design effect', de.toFixed(2)], ['Effective n', Math.round(eff)], ['Approx. power', (power * 100).toFixed(0) + '%']]);
      ui.note('Cluster assignment reduces independent information; power and analysis must use the randomisation unit.');
    }
    v.setRedraw(draw);
    draw();
  }

  installFoundationInkTheme();
  const labs = { metrics: metricsLab, pipeline: pipelineLab, diagnostics: diagnosticsLab, sampling: samplingLab, testing: testingLab, forest: forestLab, boosting: boostingLab, missing: missingLab, imbalance: imbalanceLab, design: designLab };
  document.querySelectorAll('[data-interactive]').forEach(root => labs[root.dataset.interactive]?.(root));
  document.querySelectorAll('.quiz-option').forEach(button => button.addEventListener('click', () => {
    const q = button.closest('.question');
    q.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('correct', 'incorrect'));
    const ok = button.dataset.correct === 'true';
    button.classList.add(ok ? 'correct' : 'incorrect');
    q.querySelector('.feedback').textContent = (ok ? 'Correct. ' : 'Not quite. ') + button.dataset.feedback;
  }));
})();
