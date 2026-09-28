import { writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { expanded } from "../lessons/expanded.mjs";
import { pilotPage } from "./generate-pilots.mjs";
export async function generateNotebooks(slugs = Object.keys(expanded)) {
  for (const slug of slugs)
    await writeFile(
      join(import.meta.dirname, "..", "modules", slug + ".html"),
      pilotPage(slug, expanded[slug]),
    );
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  await generateNotebooks();
  console.log("Generated 29 extended notebooks: 321 static stages.");
}
