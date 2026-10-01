import { readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { pilotPage } from "./generate-pilots.mjs";

const root = resolve(import.meta.dirname, "..");
const source = JSON.parse(await readFile(join(root, "lessons/association-rules/lesson.json"), "utf8"));
const links = {
  "association_rules_practical.py": "../assets/association-rules/association_rules_practical.py",
  "../../Lectures/Lecture%2003-Association%20Rules%20Mining_v250205.pdf": "../assets/association-rules/lecture.pdf",
  "../../Seminar/W3%20seminar%20CNS.pdf": "../assets/association-rules/seminar.pdf",
  "../../Seminar/W3%20seminar%20CNS.pptx": "../assets/association-rules/seminar.pptx",
  "../../Practical/Prac_3_Python_ARM_v250206.pdf": "../assets/association-rules/practical.pdf",
  "../chp%206%20-%20association%3Acorr.pdf": "../assets/association-rules/textbook-excerpt.pdf",
  "../ChatGPT%20Image%20Sep%2029%2C%202026%20at%2002_12_15%20AM.png": "../assets/association-rules/revision-sheet.png",
};
function siteLinks(html) {
  return html.replace(/href="([^"]+)"/g, (attribute, href) => links[href] ? `href="${links[href]}"` : attribute);
}

export const associationRulesLesson = {
  ...source,
  slug: "association-rules",
  engine: "association-rules",
  styles: ["notebook/association-rules.css"],
  nextSlug: "correlation",
  next: "Correlation",
  stages: source.stages.map(stage => ({
    ...stage,
    answer: stage.answerHtml,
    receipt: siteLinks(stage.receiptHtml),
    why: siteLinks(stage.whyHtml),
    whyHtml: siteLinks(stage.whyHtml),
  })),
};

export function associationRulesPage() {
  return pilotPage("association-rules", associationRulesLesson)
    .replace("<!-- Generated from lessons/expanded.mjs. Use the matching notebook generator. -->", "<!-- Generated from lessons/association-rules/lesson.json. Run npm run generate:association-rules. -->");
}
export async function generateAssociationRules() {
  await writeFile(join(root, "modules/association-rules.html"), associationRulesPage());
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await generateAssociationRules();
  console.log(`Generated Association Rules: ${source.stages.length} approved sections.`);
}
