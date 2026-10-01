# Association Rules

The 21-section lesson and scene plan were imported from the reviewed CP3403 Week 03 standalone notebook. `lesson.json` and `storyboard.json` preserve that authored source. The site adapter changes navigation and relative download links, and recommends Correlation as a further lesson.

The live engine is in `modules/notebook/association-rules/`. It uses the academy's shared UI, spatial drawing tools, notebook controller, fonts and stylesheet; `association-rules.css` supplies only the subject's extra controls and receipts.

Source documents and the runnable Python companion are included in `assets/association-rules/`, so their links also work from the production build. The source PDFs retain their original contents. No missing practical CSV has been invented.

After a source edit, run:

```sh
npm run generate:association-rules
npm run generate:navigation
npm run test:association-rules
npm run build
```

`npm run generate:all` includes this lesson and synchronizes every directory and core navigation label. The canonical topic inventory contains 34 lessons; the core sequence contains 22 modules. `scripts/test-association-rules-models.mjs` compares two miners with exhaustive enumeration and checks source counts, thresholds and pruning assumptions.
