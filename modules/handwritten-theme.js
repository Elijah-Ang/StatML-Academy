/*
 * Shared presentation bootstrap only.
 *
 * Painting belongs to each module's existing renderer. This file deliberately
 * does not patch CanvasRenderingContext2D, clone SVG nodes, move visuals, or
 * change the document's layout. Modules may opt into the small deterministic
 * cosmetic helpers below from their own draw functions.
 */
(() => {
  const link = document.querySelector('link[href*="handwritten-theme.css"]');
  if (link?.parentNode) link.parentNode.appendChild(link);
  const body = document.body;
  body?.classList.add('hw-handwritten');
  /* Page markers are presentation hooks only. The renderer and DOM remain
     the sole owners of geometry, content, stages, and responsive placement. */
  if (body?.querySelector('.interactive[data-interactive="testing"]') && !body.querySelector('#regCanvas')) {
    body.classList.add('hw-confidence');
  }
  if (body?.querySelector('#regCanvas')) body.classList.add('hw-simple-regression');
  if (document.querySelector('script[src*="foundation-module.js"]')) body?.classList.add('hw-foundation-module');

  const hash = (value, salt = 0) => {
    let h = 2166136261 >>> 0;
    const text = `${value}:${salt}`;
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  };

  /* A local PRNG for cosmetic wobble. It never replaces a module's data RNG. */
  const inkRandom = (seed = 1) => {
    let state = hash(seed) || 1;
    return () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 4294967296;
    };
  };

  const SVG_NS = 'http://www.w3.org/2000/svg';

  const ensureInkFilter = () => {
    if (!body || document.getElementById('hw-ink-filter-bank')) return;
    const bank = document.createElementNS(SVG_NS, 'svg');
    bank.id = 'hw-ink-filter-bank';
    bank.classList.add('hw-ink-filter-bank');
    bank.setAttribute('aria-hidden', 'true');
    bank.setAttribute('width', '0');
    bank.setAttribute('height', '0');
    bank.style.cssText = 'position:fixed;width:0;height:0;overflow:hidden;pointer-events:none';
    const defs = document.createElementNS(SVG_NS, 'defs');
    const filter = document.createElementNS(SVG_NS, 'filter');
    filter.id = 'hw-ink-distort';
    filter.setAttribute('x', '-4%');
    filter.setAttribute('y', '-4%');
    filter.setAttribute('width', '108%');
    filter.setAttribute('height', '108%');
    filter.setAttribute('color-interpolation-filters', 'sRGB');
    const noise = document.createElementNS(SVG_NS, 'feTurbulence');
    noise.setAttribute('type', 'fractalNoise');
    noise.setAttribute('baseFrequency', '.018 .035');
    noise.setAttribute('numOctaves', '2');
    noise.setAttribute('seed', '41');
    noise.setAttribute('result', 'paperNoise');
    const displace = document.createElementNS(SVG_NS, 'feDisplacementMap');
    displace.setAttribute('in', 'SourceGraphic');
    displace.setAttribute('in2', 'paperNoise');
    displace.setAttribute('scale', '.85');
    displace.setAttribute('xChannelSelector', 'R');
    displace.setAttribute('yChannelSelector', 'G');
    filter.append(noise, displace);
    defs.append(filter);
    bank.append(defs);
    body.prepend(bank);
  };

  const roughRectPath = (seed, pass = 0, renderedWidth = 100, renderedHeight = 100) => {
    const random = inkRandom(`${seed}:frame:${pass}`);
    /* Work in the normalized viewBox, but calibrate every deviation in screen
       pixels. Percentage-only jitter disappeared on shallow, wide surfaces
       (nav bars and callouts), leaving a visibly ruler-straight edge. */
    const width = Math.max(48, renderedWidth);
    const height = Math.max(28, renderedHeight);
    const pxX = value => value * 100 / width;
    const pxY = value => value * 100 / height;
    const jx = pixels => (random() - .5) * 2 * pxX(pixels);
    const jy = pixels => (random() - .5) * 2 * pxY(pixels);
    const inset = 1.15 + pass * .48;
    const x0 = pxX(inset) + jx(.55), y0 = pxY(inset) + jy(.55);
    const x1 = 100 - pxX(inset) + jx(.55), y1 = 100 - pxY(inset) + jy(.55);
    const t1 = 25 + jx(4.2), t2 = 69 + jx(4.2);
    const r1 = 28 + jy(4.2), r2 = 72 + jy(4.2);
    const b1 = 70 + jx(4.2), b2 = 30 + jx(4.2);
    const l1 = 71 + jy(4.2), l2 = 29 + jy(4.2);
    return [
      `M ${x0.toFixed(2)} ${(y0 + jy(.45)).toFixed(2)}`,
      `C ${t1.toFixed(2)} ${(y0 + jy(1.65)).toFixed(2)} ${t2.toFixed(2)} ${(y0 + jy(1.65)).toFixed(2)} ${x1.toFixed(2)} ${(y0 + jy(.7)).toFixed(2)}`,
      `C ${(x1 + jx(1.55)).toFixed(2)} ${r1.toFixed(2)} ${(x1 + jx(1.55)).toFixed(2)} ${r2.toFixed(2)} ${(x1 + jx(.7)).toFixed(2)} ${y1.toFixed(2)}`,
      `C ${b1.toFixed(2)} ${(y1 + jy(1.65)).toFixed(2)} ${b2.toFixed(2)} ${(y1 + jy(1.65)).toFixed(2)} ${x0.toFixed(2)} ${(y1 + jy(.7)).toFixed(2)}`,
      `C ${(x0 + jx(1.55)).toFixed(2)} ${l1.toFixed(2)} ${(x0 + jx(1.55)).toFixed(2)} ${l2.toFixed(2)} ${x0.toFixed(2)} ${(y0 + jy(.25)).toFixed(2)}`
    ].join(' ');
  };

  const surfaceSelector = [
    '.statml-site-nav', '.site-nav', '.topbar', '.top-nav', '.statml-module-footer',
    '.statml-brand-mark', '.brand-mark', '.stage-dots', '.objective', '.scope-note',
    '.glass-card', '.card', '.quiz-card', '.control-card', '.interactive',
    '.panel', '.map', '.lesson-map', '.metric', '.metric-card', '.question-card',
    '.formula', '.formula-block', '.math-block', '.insight-box', '.insight',
    '.callout', '.warning-note', '.report', '.plain-translation', '.takeaway',
    '.statml-prereq', '.statml-deepening', '.statml-takeaways', '.visual-panel',
    '.viz-panel', '.chart-card', '.figure-card', '.statml-visual-card',
    '.control-panel', '.procedural-step', '.explain-block', '.quiz-option',
    '.feedback', '.static-answer', '.live-calc', '.terminal-card', '.mini-table',
    '.data-table', '.statml-overview', '.statml-overview-item', '.statml-stage-rail',
    '.visual-head', '.visual-foot', '.outcomes > span', '.pathway > div'
  ].join(',');
  const stickySelector = [
    '.callout', '.insight-box', '.warning-note', '.report', '.plain-translation',
    '.takeaway', '.statml-prereq', '.statml-takeaways'
  ].join(',');
  const markerSelector = [
    '.pill', '.chip', '.tag', '.badge', '.topic-badge', '.hero-badge', '.hotspot-tag',
    '.scroll-cue'
  ].join(',');

  const makeFrame = element => {
    if (!(element instanceof HTMLElement) || element.dataset.hwRoughFrame === '1') return;
    if (element.closest('.hw-rough-frame') || element.matches('table,tbody,thead,tfoot,tr,canvas,svg')) return;
    /* Foundation pages already draw their own two-pass borders. One surface
       must have one border owner, otherwise the result looks like nested UI. */
    if (body?.classList.contains('hw-foundation-module')) return;
    const isStatic = getComputedStyle(element).position === 'static';
    if (isStatic) {
      const hasPositionedChild = [...element.children].some(child =>
        ['absolute', 'fixed', 'sticky'].includes(getComputedStyle(child).position)
      );
      const ownsPositionedPseudo = ['::before', '::after'].some(pseudo => {
        const style = getComputedStyle(element, pseudo);
        return style.position === 'absolute' && style.content && !['none', 'normal'].includes(style.content);
      });
      if (hasPositionedChild || ownsPositionedPseudo) return;
    }
    const seed = `${element.tagName}:${element.className}:${element.id}:${element.textContent?.slice(0, 48)}`;
    /* The rough SVG is the sole visible border owner. Some page-local
       selectors contain an ID inside :is(...), which can otherwise beat the
       shared class rule and leave a ruler-straight digital border underneath.
       Keep the existing border width (and therefore layout) while making its
       paint transparent. */
    element.style.setProperty('border-color', 'transparent', 'important');
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.classList.add('hw-rough-frame');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    const rect = element.getBoundingClientRect();
    for (let pass = 0; pass < 2; pass += 1) {
      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', roughRectPath(seed, pass, rect.width, rect.height));
      path.setAttribute('stroke-width', pass ? '.7' : '1.05');
      path.setAttribute('opacity', pass ? '.24' : '.58');
      svg.append(path);
    }
    element.classList.add('hw-rough-surface');
    if (getComputedStyle(element).position === 'static') element.classList.add('hw-frame-relative');
    element.dataset.hwRoughFrame = '1';
    element.append(svg);
  };

  const addTape = element => {
    if (!(element instanceof HTMLElement) || element.querySelector(':scope > .hw-tape')) return;
    element.classList.add('hw-sticky-material');
    const ownsPseudoMaterial = ['::before', '::after'].some(pseudo => {
      const content = getComputedStyle(element, pseudo).content;
      return content && content !== 'none' && content !== 'normal';
    });
    if (ownsPseudoMaterial) return;
    const tape = document.createElement('span');
    tape.className = 'hw-tape';
    tape.setAttribute('aria-hidden', 'true');
    element.append(tape);
  };

  const addHeadingStroke = heading => {
    if (!(heading instanceof HTMLElement) || heading.querySelector(':scope > .hw-heading-stroke')) return;
    const stroke = document.createElement('span');
    stroke.className = 'hw-heading-stroke';
    stroke.setAttribute('aria-hidden', 'true');
    heading.classList.add('hw-ink-heading');
    heading.append(stroke);
  };

  const decorate = root => {
    if (!root || root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    const collect = selector => {
      const matches = [];
      if (root.nodeType === 1 && root.matches?.(selector)) matches.push(root);
      root.querySelectorAll?.(selector).forEach(el => matches.push(el));
      return matches;
    };
    if (!body?.classList.contains('hw-foundation-module')) {
      collect(surfaceSelector).forEach(makeFrame);
      collect(stickySelector).forEach(addTape);
      collect(markerSelector).forEach(el => el.classList.add('hw-marker-label'));
      collect('h1,h2').forEach(addHeadingStroke);
    }
    collect('svg:not(.hw-rough-frame):not(.hw-ink-filter-bank)').forEach(svg => {
      const rect = svg.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && rect.width <= 128 && rect.height <= 128) svg.classList.add('hw-ink-svg');
    });
  };

  try {
    ensureInkFilter();
    decorate(document);
    if (body && 'MutationObserver' in window) {
      const observer = new MutationObserver(records => {
        records.forEach(record => {
          const target = record.target;
          if (target instanceof HTMLElement && !body?.classList.contains('hw-foundation-module')) {
            if (target.matches(surfaceSelector) && !target.querySelector(':scope > .hw-rough-frame')) {
              delete target.dataset.hwRoughFrame;
              makeFrame(target);
            }
            if (target.matches(stickySelector)) addTape(target);
            if (target.matches('h1,h2')) addHeadingStroke(target);
          }
          record.addedNodes.forEach(node => {
            if (node.nodeType === 1) decorate(node);
          });
        });
      });
      observer.observe(body, { childList: true, subtree: true });
    }
  } catch (error) {
    /* Keep module renderers available if a browser lacks one of the optional
       decorative DOM APIs; QA can read this diagnostic without changing the
       page's instructional behavior. */
    window.__statmlHandwrittenThemeError = String(error?.stack || error);
    console.error('Handwritten material layer:', error);
  }

  window.StatMLInk = Object.freeze({
    hash,
    inkRandom,
    jitter: (random, amount = 1) => (random() - .5) * amount
  });
})();
