import { readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { topics } from "../modules/notebook/topics.js";
import { generateCoreNavigation } from "./core-modules.mjs";
import { topicDirectory } from "./topic-directory.mjs";

const root = resolve(import.meta.dirname, "..");
await generateCoreNavigation();
for (const slug of ["", ...Object.keys(topics)]) {
  const file = join(root, slug ? `modules/${slug}.html` : "index.html");
  const html = await readFile(file, "utf8");
  const directory = /<details class="(?:topic-directory|academy-directory)">[\s\S]*?<\/details>/;
  if (!directory.test(html)) throw Error(`Missing topic directory: ${file}`);
  let updated = html.replace(directory, topicDirectory({ slug, prefix: slug ? "" : "modules/", home: !slug }));
  updated = updated.replace(/(<button[^>]*data-reset[^>]*)(>↺<\/button>)/, (_, attributes, end) =>
    attributes.replace(/aria-label="[^"]*"/, 'aria-label="Reset notebook"').replace(/title="[^"]*"/, 'title="Reset notebook to its starting values"') + end);
  if (updated !== html) await writeFile(file, updated);
}
console.log(`Synchronized navigation and directories for ${Object.keys(topics).length} lessons.`);
