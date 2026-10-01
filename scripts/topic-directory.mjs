import { topics } from "../modules/notebook/topics.js";

const esc = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

// One inventory supplies the static, no-JavaScript directory on every page.
export function topicDirectory({ prefix = "", slug = "", home = false } = {}) {
  const entries = Object.entries(topics);
  const summary = home ? `Browse all ${entries.length} lessons and topics` : `Explore all ${entries.length} topics`;
  return `<details class="${home ? "academy-directory" : "topic-directory"}"><summary>${summary}</summary><nav aria-label="All academy topics">${entries.map(([key, title]) => `<a href="${prefix}${key}.html"${key === slug ? ' aria-current="page"' : ""}>${esc(title)}</a>`).join("")}</nav></details>`;
}
