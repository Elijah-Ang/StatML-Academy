/*
 * Legacy modules keep their original DOM and renderer ownership. This shared
 * bootstrap intentionally performs no painting: no Canvas prototype mutation,
 * SVG cloning, overlay insertion, portal movement, or stage-path injection.
 * Individual modules opt into explicit ink primitives from their own draw code.
 */
(() => {
  const link = document.querySelector('link[href$="legacy-paper-workbench.css"]');
  if (link?.parentNode) link.parentNode.appendChild(link);
  document.body?.classList.add('legacy-sketch');
})();
