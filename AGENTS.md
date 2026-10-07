# Preserve approved features

When simplifying lesson wording or revising visuals, preserve the user's previously requested or approved interactive behaviours. Add clearer explanations or supporting diagrams alongside them. Do not delete, hide or make an approved feature unreachable unless the user explicitly requests that change.

Logistic Regression must retain its moving blue/red probability field, input-space decision field and usable threshold control. Moving the threshold changes the coloured regions and decisions while keeping fitted weights and probabilities unchanged. The Weighted Clues view retains its contribution diagram alongside the decision field.

Keep regression tests that protect these behaviours. A refactor must not change a required-feature assertion from presence to absence to make tests pass. When changing these visuals, run `node scripts/test-logistic-browser.mjs` and the relevant responsive/layout checks.
