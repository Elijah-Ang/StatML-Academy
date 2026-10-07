// Exact learner-facing copy for the course visual revision.
export const visualRevisions = [
  {
    "slug": "one-r",
    "section": 1,
    "question": "Which part of a new row does One-R actually read?",
    "guide": "One new row has two inputs. The saved rule reads one of them, finds its interval, and returns that interval’s saved class.",
    "action": "Switch Rule feature between input x and input z. Move the input the rule reads, then move the other input. Compare which move can change the answer.",
    "purpose": "Identify the one input used at prediction time.",
    "steps": [
      "Show the new row as two labelled fields: x and z. Highlight the saved input and name the unused input.",
      "Project the chosen value into the three saved intervals. Outline the matched interval in gold.",
      "Connect the matched interval to its saved class. State that moving a query does not refit the rule."
    ],
    "labels": [
      "New row: x = {x}; z = {z}",
      "Saved input: {feature}",
      "Unused input: {other}",
      "Read {feature} → interval {bucket} → class {prediction}",
      "Training rows teach the rule. This new row only uses it."
    ],
    "check": "Does changing the unused input change this prediction?"
  },
  {
    "slug": "one-r",
    "section": 2,
    "question": "How well can we do without reading any inputs?",
    "guide": "Count the known training labels. Predict their majority class for every row; labels in the other class become mistakes.",
    "action": "Choose a different data pattern or draw a new development example. Count both classes, predict the majority, and compare its mistakes with One-R.",
    "purpose": "Establish a computed baseline and make tie handling explicit.",
    "steps": [
      "Draw one mark per training label in separate class groups.",
      "Show the saved majority label and the number of opposite-class mistakes over all training rows.",
      "When counts tie, explicitly show the teaching model’s tie policy: class 1."
    ],
    "labels": [
      "Class 0: {n0} training rows",
      "Class 1: {n1} training rows",
      "Always predict class {fallback}",
      "Baseline mistakes: {mistakes} / {n}",
      "An equal count chooses class 1 in this teaching model."
    ],
    "check": "Which labels become mistakes when every row receives the same answer?"
  },
  {
    "slug": "one-r",
    "section": 3,
    "question": "How does each interval get its saved class?",
    "guide": "Group the training rows by one input. Each interval saves its majority class; the minority labels in that interval count as mistakes.",
    "action": "Choose input x or z. Count both classes in each interval, add the minority counts, and compare your total with Training mistakes.",
    "purpose": "Expose fitting as grouped counts instead of a compact lookup list.",
    "steps": [
      "Create three stacked interval panels, each with its exact bounds.",
      "Draw the actual class labels in each panel. Print both counts, the saved class, and local mistakes.",
      "Add the three local mistake counts into the feature’s training error. Explain empty intervals and ties."
    ],
    "labels": [
      "Interval {i}: {bounds}",
      "Class 0: {n0}; class 1: {n1}",
      "Save class {prediction}; mistakes {errors}",
      "Total mistakes: {e0} + {e1} + {e2} = {total}",
      "Empty interval: use the saved training-majority fallback."
    ],
    "check": "Why does an interval save a class rather than an average input value?"
  },
  {
    "slug": "one-r",
    "section": 4,
    "question": "How do we choose between the x rule and the z rule?",
    "guide": "Fit a complete rule for each input using the same training rows. Compare their mistake counts, then save the lower-error rule.",
    "action": "Choose automatic selection, then inspect input x and input z manually. Compare the two training-error bars. A manual choice is a diagnostic override.",
    "purpose": "Make model selection and its tie rule visible.",
    "steps": [
      "Draw two comparable error bars on a common 0-to-training-row-count scale.",
      "Name the automatically selected input and highlight the active input separately if manually overridden.",
      "Explain that equal errors select x in this teaching model; validation is a separate check."
    ],
    "labels": [
      "Input x: {errorsX} / {n} mistakes",
      "Input z: {errorsZ} / {n} mistakes",
      "Automatic choice: {automatic}",
      "Active choice: {active}",
      "Equal errors choose x. Manual selection overrides that choice."
    ],
    "check": "If both errors tie, which rule does this model save?"
  },
  {
    "slug": "one-r",
    "section": 5,
    "question": "Where do numeric interval boundaries come from?",
    "guide": "The teaching model sorts the training values and places two boundaries near their thirds. A value on a boundary belongs to the interval on its left.",
    "action": "Move the selected rule input across each boundary. Read the inequality and watch the matched interval change. Drawing new training rows can move the boundaries.",
    "purpose": "Teach exact boundary inclusion and training-only cut points.",
    "steps": [
      "Draw the chosen input’s training-value rug and two labelled cut points.",
      "Show all three intervals on one number line, including the ≤ comparisons.",
      "Place the query on the same ruler and show its bucket and saved class."
    ],
    "labels": [
      "Training-only cuts: {cut1}, {cut2}",
      "1: {feature} ≤ {cut1}",
      "2: {cut1} < {feature} ≤ {cut2}",
      "3: {feature} > {cut2}",
      "Query {value} → interval {bucket} → class {prediction}"
    ],
    "check": "Which interval contains a value exactly equal to the second cut?"
  },
  {
    "slug": "one-r",
    "section": 6,
    "question": "What happens when the required input is missing?",
    "guide": "Missing is not zero and is not the largest interval. This model returns a fallback label saved from the training-class counts.",
    "action": "Choose Missing value for the selected rule input. Read the saved fallback and its training counts. Restore Measured value to use the interval lookup again.",
    "purpose": "Make the fallback a separate prediction route.",
    "steps": [
      "Show required input status: Measured or Missing.",
      "For missing input, bypass the interval ruler and connect training-majority counts to the fallback class.",
      "For measured input, restore the same saved interval lookup. Do not invent an unseen categorical value in this numeric example."
    ],
    "labels": [
      "Required input: {feature}",
      "Input status: Missing",
      "Saved training majority: {n0} class 0; {n1} class 1",
      "Fallback → class {fallback}",
      "Missing is not zero. No interval is looked up."
    ],
    "check": "Does a missing value belong to interval 3?"
  },
  {
    "slug": "one-r",
    "section": 7,
    "question": "What changes when we predict a new row?",
    "guide": "Prediction is a lookup in the saved rule. It does not learn new boundaries or change any training counts.",
    "action": "Move the input the rule reads. Follow value → interval → class. Move the unused input and verify that the saved rule and returned class stay the same.",
    "purpose": "Separate fitting from prediction through one concrete row.",
    "steps": [
      "Show both input values and identify the saved feature.",
      "Use a gold query marker on the saved interval ruler.",
      "Show the returned class beside a short saved-rule summary."
    ],
    "labels": [
      "Saved cuts stay fixed: {cut1}, {cut2}",
      "New value {value}",
      "Matched interval {bucket}",
      "Returned class {prediction}",
      "Moving a query does not refit the model."
    ],
    "check": "Which values stay fixed while the gold query moves?"
  },
  {
    "slug": "one-r",
    "section": 8,
    "question": "Can one coordinate describe a two-coordinate ring pattern?",
    "guide": "The existing decision map uses both coordinates for position, but One-R reads only its saved coordinate. Its boundary strips run parallel to the ignored input.",
    "action": "Choose Inner and outer rings. Move both coordinates. Compare the known class dots with the strip-shaped predictions and identify the input the rule ignores.",
    "purpose": "Preserve the approved interactive map and explain its geometric limitation.",
    "steps": [
      "Keep the existing input-space map, class dots, and gold query.",
      "Add a wrapped caption naming the active input and the ignored input.",
      "Keep all scenario, feature, and query controls available; do not replace the map with a rule list."
    ],
    "labels": [
      "Map: predicted class from input {feature}",
      "Changing {other} alone cannot change this rule’s answer.",
      "Known labels and predicted strips describe different things."
    ],
    "check": "Why can a ring cross several strips with different known labels?"
  },
  {
    "slug": "one-r",
    "section": 9,
    "question": "What must be refitted inside each validation fold?",
    "guide": "Hold out one group of training rows. Fit cut points, interval labels, and feature selection on the other groups; then predict the held-out group.",
    "action": "Choose Held-out fold 1, 2, then 3. Compare the fitted feature, boundaries, and held-out mistake counts. Final-test rows stay outside this experiment.",
    "purpose": "Replace a generic split flow with an actual refit and held-out result.",
    "steps": [
      "Partition the 48 development-training rows into three class-stratified groups.",
      "Show one marked row per example: blue fit rows and red held-out rows.",
      "Show the fold-specific fitted input, cuts, and error score; show all three fold scores below.",
      "Label the separate 16 validation rows and 16 sealed final-test rows as outside this training-only fold demonstration."
    ],
    "labels": [
      "Fold {fold}: fit {nFit}; check {nHold}",
      "Refit input {feature}; cuts {cut1}, {cut2}",
      "Held-out mistakes: {errors} / {nHold}",
      "Final-test rows are outside these folds.",
      "Manual feature choice evaluates that fixed feature; automatic mode reselects inside each fold."
    ],
    "check": "May the held-out rows teach the interval boundaries?"
  },
  {
    "slug": "one-r",
    "section": 10,
    "question": "Which held-out decisions are correct and which are errors?",
    "guide": "Each validation row belongs in one of four groups: correct positive, missed positive, false alert, or correct negative. Each metric uses its own denominator.",
    "action": "Change the rule feature or data pattern. Count the four validation groups and compare precision, recall, and overall accuracy. These are validation results.",
    "purpose": "Connect exact decisions to named denominator groups.",
    "steps": [
      "Draw four labelled validation cells with one class mark per row.",
      "Print found positives, misses, false alerts, and correct negatives as words and counts.",
      "Print precision, recall, and accuracy as explicit count fractions. Keep final-test rows sealed."
    ],
    "labels": [
      "Correct positive (TP): {tp}",
      "Missed positive (FN): {fn}",
      "False alert (FP): {fp}",
      "Correct negative (TN): {tn}",
      "Precision: {tp} / ({tp} + {fp})",
      "Recall: {tp} / ({tp} + {fn})",
      "Accuracy: ({tp} + {tn}) / {n}"
    ],
    "check": "Which group is the denominator for precision?"
  },
  {
    "slug": "one-r",
    "section": 11,
    "question": "How does a three-interval rule differ from a one-split rule?",
    "guide": "Compare the saved One-R intervals with a two-leaf teaching stump fitted to the same input and training rows. Different partitions can return different answers.",
    "action": "Move the query across both rulers. Compare the three-interval answer with the one-split answer and their training mistakes. The stump here minimizes mistakes, rather than demonstrating CART impurity.",
    "purpose": "Supply a concrete comparison for the diagnostic-model section.",
    "steps": [
      "Keep the original One-R model unchanged.",
      "Fit an explanatory one-dimensional stump by trying midpoint splits and minimizing training classification mistakes.",
      "Draw the two models as separate labelled rulers for the same input and query. State the illustrative stump criterion."
    ],
    "labels": [
      "One-R: three saved intervals; {errors} mistakes",
      "Teaching stump: one split; {stumpErrors} mistakes",
      "Same input {feature}; same {n} training rows",
      "Query → One-R class {onePrediction}; stump class {stumpPrediction}",
      "This comparison stump minimizes mistakes; it is not a CART impurity demonstration."
    ],
    "check": "Do the two models have to make the same prediction?"
  },
  {
    "slug": "one-r",
    "section": 12,
    "question": "Can you explain the complete saved rule for one row?",
    "guide": "Trace the selected input, its saved boundaries, the lookup or fallback, and the returned class. Training fit and validation checking answer different questions.",
    "action": "Choose Measured value, trace one row, then choose Missing value. Explain both routes and compare training mistakes with the separate validation result.",
    "purpose": "End with a linked, concrete explanation rather than another repeated compact table.",
    "steps": [
      "Show the new row and saved feature.",
      "Show its measured interval route or missing fallback route.",
      "Show training error and separate validation error with named populations.",
      "Keep the input-status selector and all existing numeric controls."
    ],
    "labels": [
      "1. Read input {feature}",
      "2. Use saved cuts {cut1}, {cut2}",
      "3. Return class {prediction}",
      "Training mistakes: {trainErrors} / {nTrain}",
      "Validation mistakes: {valErrors} / {nVal}",
      "A missing required input uses class {fallback}."
    ],
    "check": "Which part of this result was learned, and which part was checked?"
  },
  {
    "slug": "association-rules",
    "section": 1,
    "question": "What makes one transaction?",
    "guide": "One outlined basket is one transaction. Product names show what it contains; the basket ID only identifies the row.",
    "action": "Select a basket and edit its product checkboxes. Compare the named products with the Boolean receipt. An empty basket still counts as a transaction.",
    "purpose": "Make the observed objects recognizable without decoding a letter legend.",
    "steps": [
      "Retain the four basket outlines and IDs.",
      "Place full product-name tokens inside each basket, wrapping vertically at narrow widths.",
      "Highlight the selected basket and retain its editable checkboxes and presence receipt."
    ],
    "labels": [
      "Basket {id}",
      "{productName}",
      "Empty basket",
      "Selected basket {id}: {productNames}."
    ],
    "check": "Does an empty basket disappear from N?"
  },
  {
    "slug": "association-rules",
    "section": 2,
    "question": "What do the two sides of a rule mean?",
    "guide": "X names all required items on the left; Y names all required items on the right. The arrow describes co-occurrence, rather than time or cause.",
    "action": "Choose a rule. Read its named left and right sides, then identify baskets with X, with Y, and with both.",
    "purpose": "Separate antecedent, consequent, and joint group.",
    "steps": [
      "Print X and Y as full product-name lists.",
      "Show each basket ID against three columns: Contains X?, Contains Y?, Both?",
      "Use Yes/No text as well as color; retain the exact counts."
    ],
    "labels": [
      "X (left): {leftNames}",
      "Y (right): {rightNames}",
      "X?",
      "Y?",
      "Both?",
      "Yes",
      "No",
      "The arrow does not establish sequence or cause."
    ],
    "check": "Does Bread + Coke mean either item or both?"
  },
  {
    "slug": "association-rules",
    "section": 3,
    "question": "Support: how many of all baskets contain both sides?",
    "guide": "Keep every basket in the denominator. Count baskets containing every required item on both sides.",
    "action": "Choose Apple → Coke, then Coke → Apple. Inspect the named basket contents and compare the joint count and support.",
    "purpose": "Anchor support to all observed baskets.",
    "steps": [
      "Display all four basket cards with full contents and Match/No match labels.",
      "Highlight joint matches green.",
      "Print the numerator and denominator beside the share bar."
    ],
    "labels": [
      "All baskets: {n}",
      "Joint matches: {both}",
      "Match",
      "No match",
      "Support = {both} / {n} = {support}"
    ],
    "check": "Why does reversing the arrow leave support unchanged?"
  },
  {
    "slug": "association-rules",
    "section": 4,
    "question": "Confidence: among X baskets, how many also contain Y?",
    "guide": "First keep the baskets containing all of X. Within that smaller group, count baskets also containing all of Y.",
    "action": "Choose a rule. Compare the full basket population with the filtered X group. Explain which denominator changed.",
    "purpose": "Show filtering before dividing.",
    "steps": [
      "Show all named basket cards with X matches blue.",
      "Below, show only qualifying X baskets; mark joint successes green.",
      "Keep a visible zero-denominator message if the edited data contains no X baskets."
    ],
    "labels": [
      "Start: all {n} baskets",
      "Keep only {leftNames}: {a} baskets",
      "Also contain {rightNames}: {both}",
      "Confidence = {both} / {a} = {confidence}",
      "No qualifying baskets: confidence is undefined."
    ],
    "check": "Does confidence divide by all baskets?"
  },
  {
    "slug": "association-rules",
    "section": 5,
    "question": "Why can reversing a rule change confidence?",
    "guide": "The successful baskets are the same. The conditioning group changes when the two sides swap.",
    "action": "Inspect Apple → Coke and its reverse. Find the extra qualifying Coke basket and explain why the reverse fraction is smaller.",
    "purpose": "Expose the directional denominator through observed contents.",
    "steps": [
      "Stack forward and reverse named qualifying groups.",
      "Keep successful baskets green and non-successes visibly labelled.",
      "Print each ratio and the unchanged support."
    ],
    "labels": [
      "{leftNames} → {rightNames}",
      "{both} successes / {a} qualifying baskets = {confidence}",
      "{rightNames} → {leftNames}",
      "{both} successes / {b} qualifying baskets = {reverse}",
      "Same successful basket IDs; same support {support}."
    ],
    "check": "Which extra basket enters the reverse denominator?"
  },
  {
    "slug": "association-rules",
    "section": 8,
    "question": "Why can Apriori reject a larger itemset early?",
    "guide": "A basket containing every item in a larger set must also contain every item in each subset. Adding requirements can only remove matches.",
    "action": "Choose an itemset and increase minimum support. Compare aligned basket cards for its subsets and complete set. Find a failing subset before counting extensions.",
    "purpose": "Make the anti-monotone property observable.",
    "steps": [
      "Retain aligned transaction IDs for all subsets.",
      "Use full-name subset captions and retain aligned transaction-ID strips. List the named basket contents once below the strips, rather than repeating 16 large basket cards.",
      "Print each count against the common minimum count."
    ],
    "labels": [
      "Subset {productNames}: count {count}",
      "Complete set {productNames}: count {count}",
      "Minimum count: {cutoff}",
      "Adding required items cannot add matching baskets."
    ],
    "check": "Can a superset have a larger support count than its subset?"
  },
  {
    "slug": "association-rules",
    "section": 9,
    "question": "How does Apriori join, check subsets, then count?",
    "guide": "Walk one candidate through three steps. Cₖ means candidate itemsets; Lₖ means the candidates that passed the minimum count.",
    "action": "Use Apriori step to inspect Join, Check subsets, and Count baskets. Change the candidate or cutoff, replay the steps, then choose Whole walkthrough to see the complete trace.",
    "purpose": "Reduce simultaneous detail while retaining the complete existing trace.",
    "steps": [
      "Add an Apriori step selector with Join, Check subsets, Count baskets, Whole walkthrough.",
      "Join displays two full-name frequent parents and their union.",
      "Subset check displays every immediate subset, its exact count, and Pass/Missing result.",
      "Counting displays actual named baskets if the candidate survived; explicitly state Skipped if a subset caused pruning.",
      "Keep candidate length, candidate selector, cutoff, and the complete trace accessible."
    ],
    "labels": [
      "1. Join frequent parents",
      "2. Check every immediate subset",
      "3. Count matching baskets",
      "Whole walkthrough",
      "Candidate: {productNames}",
      "Cutoff = {cutoff} of {n}",
      "Pruned before scanning: {missingSubset} is not frequent.",
      "Keep in L{k}",
      "Reject below cutoff"
    ],
    "check": "Why is a pruned candidate not scanned?"
  },
  {
    "slug": "association-rules",
    "section": 10,
    "question": "How can one frequent itemset become several rules?",
    "guide": "Divide the same itemset into nonempty left and right sides. Every split shares its joint count; confidence uses the current left-side count. Check support and confidence separately against their current cutoffs. Equality passes; an empty left-side group has undefined confidence.",
    "action": "Move Inspect a split. Read the full product names on both sides and compare the qualifying basket group with the unchanged joint count. Change Minimum support and Minimum confidence, then read which check passes.",
    "purpose": "Make rule generation a partition followed by a conditional fraction.",
    "steps": [
      "Use full-name chips for the chosen itemset and its two sides.",
      "Show the arrow between named left and right groups.",
      "Show qualifying named baskets and the current confidence fraction; retain all split choices.",
      "Show separate support and confidence fractions, rates, current cutoffs and pass decisions. Keep a rule only when both defined rates pass; compare unrounded rates."
    ],
    "labels": [
      "Whole itemset: {productNames}",
      "Left side X: {leftNames}",
      "Right side Y: {rightNames}",
      "Joint count stays {both}",
      "Support: {both}/{n} = {support}; cutoff {minSupport}; {supportDecision}.",
      "Confidence: {both}/{a} = {confidence}; cutoff {minConfidence}; {confidenceDecision}.",
      "Undefined (no baskets contain X)",
      "Passes both cutoffs.",
      "Does not pass both cutoffs."
    ],
    "check": "What changes between splits: the joint count or the left-side count?"
  },
  {
    "slug": "association-rules",
    "section": 11,
    "question": "How do FP-tree paths share a prefix?",
    "guide": "Scan all five lecture baskets once for global counts and one item order. Insert their filtered paths one at a time; shared prefixes reuse nodes and increase counts.",
    "action": "Use Previous basket, Next basket, or Replay insertion. Compare the raw basket, removed items, ordered path, and highlighted tree path. The Inserted baskets slider still jumps to any step.",
    "purpose": "Preserve the tree mechanism while making its sequence controllable.",
    "steps": [
      "Retain the separate five-transaction letter example and its fixed global order.",
      "Add bounded previous/next/replay insertion buttons alongside the existing slider.",
      "Show the inserted transaction number, filtered ordered path, and gold shared prefix.",
      "Explain node counts as the number of inserted baskets reaching that prefix; keep header-sum evidence."
    ],
    "labels": [
      "Previous basket",
      "Next basket",
      "Replay insertion",
      "Inserted baskets: {step} / 5",
      "Global order: {order}",
      "A node count counts baskets reaching that prefix.",
      "Shared prefix: reuse the node and add one."
    ],
    "check": "Why can item c appear in more than one tree node?"
  },
  {
    "slug": "association-rules",
    "section": 12,
    "question": "How does FP-growth build a suffix’s conditional tree?",
    "guide": "Trace a suffix node, copy its count to the preceding path, then add those weights and remove items below the conditional minimum count.",
    "action": "Use Projection step to inspect Trace suffix, Copy weighted prefixes, and Filter conditional tree. Change the suffix, replay the steps, or choose Whole walkthrough.",
    "purpose": "Make weighted projection a visible sequence rather than a tall simultaneous display.",
    "steps": [
      "Add three projection steps and an accessible complete walkthrough.",
      "Trace shows the full source tree and gold suffix paths.",
      "Copy displays each prefix as tokens with its suffix-node weight.",
      "Filter shows exact weighted sums, keep/remove decisions, the conditional tree, and generated suffix patterns.",
      "Retain the separate letter dataset and global cutoff 3; never relabel these letters as shopping products."
    ],
    "labels": [
      "1. Trace suffix",
      "2. Copy weighted prefixes",
      "3. Filter conditional tree",
      "Whole walkthrough",
      "Prefix {path}: suffix count {weight} → weight {weight}",
      "{item}: {weights} = {total}",
      "Keep total ≥ 3",
      "Remove below support",
      "No nonempty prefix remains."
    ],
    "check": "Which node supplies the prefix weight?"
  },
  {
    "slug": "association-rules",
    "section": 13,
    "question": "How does Eclat find joint matches using transaction IDs?",
    "guide": "An ID names the same basket in every row. An ID survives the intersection only if it appears in both input sets.",
    "action": "Choose a rule. Follow the aligned ID columns from X and Y into their intersection; compare the surviving IDs with the joint count.",
    "purpose": "Explain intersection through consistent row identity and visible membership.",
    "steps": [
      "Retain the aligned ID rows and exact sets.",
      "Add a shared-ID column explanation and connectors for IDs present on both sides.",
      "Print the resulting ID set and its count; show Empty explicitly."
    ],
    "labels": [
      "Each column is the same basket ID.",
      "X IDs: {idsX}",
      "Y IDs: {idsY}",
      "Intersection: {sharedIds}",
      "Shared count {both}; support {both} / {n}"
    ],
    "check": "Can an ID present in only one side survive the intersection?"
  },
  {
    "slug": "association-rules",
    "section": 20,
    "question": "How do baskets become a mining result?",
    "guide": "The input is a basket-by-product Boolean table. Mine frequent itemsets first, then split them into rules and apply confidence.",
    "action": "Switch Apriori and FP-growth on the same shopping baskets. Use Workflow step to inspect input, frequent itemsets, and passing rules. Compare the exact results.",
    "purpose": "Separate input representation, support filtering, and confidence filtering.",
    "steps": [
      "Add Input, Frequent itemsets, Passing rules, Whole workflow views.",
      "Use full product names in table headers on desktop; use labelled basket cards with named Boolean fields on phones.",
      "Print itemsets as full names with count/N bars.",
      "Keep the exact rule table and algorithm selector, both thresholds, downloadable companion, and explicit illustrative dataset scope."
    ],
    "labels": [
      "1. Boolean input",
      "2. Frequent itemsets",
      "3. Passing rules",
      "Whole workflow",
      "Basket ID is an identifier, not a mining feature.",
      "1 = present; 0 = absent",
      "{productNames}: {count}/{n} = {support}",
      "{leftNames} → {rightNames}: confidence {confidence}"
    ],
    "check": "Why must basket ID be removed from mining features?"
  },
  {
    "slug": "imbalanced-classification",
    "section": 1,
    "question": "How rare are the actual positives?",
    "guide": "Count actual positives and negatives first. One tile represents 100 cases; later scenes split those label pools into decisions.",
    "action": "Change positive prevalence. Count the gold tiles and read the exact positive and negative totals. Move the decision threshold and verify that these actual labels stay fixed.",
    "purpose": "Keep rare cases visible and make denominator differences intuitive.",
    "steps": [
      "Draw a 100-tile actual-label population. Each tile represents exactly 100 of the 10,000 illustrative cases.",
      "Color positive tiles gold and negative tiles blue; print both exact pool counts.",
      "Changing prevalence changes actual labels; moving the threshold does not change this population diagram."
    ],
    "labels": [
      "One tile = 100 cases. Gold tiles are actual positives; blue tiles are actual negatives.",
      "Actual positives: {positive} / 10,000 = {prevalence}%",
      "Actual negatives: {negative}. Start with the actual labels, then inspect decisions.",
      "Changing the threshold changes decisions, not these actual-label pools."
    ],
    "check": "Which denominator includes false alerts?"
  },
  {
    "slug": "imbalanced-classification",
    "section": 2,
    "question": "Why can accuracy look high while alerts are unreliable?",
    "guide": "A correct-negative majority can dominate accuracy. Precision asks a different question: what fraction of alerts are real positives?",
    "action": "Change positive prevalence, then decision threshold. Read both actual-label pools and the alert pool. Rebuild precision, recall, and accuracy from the named counts.",
    "purpose": "Keep rare cases visible and make denominator differences intuitive.",
    "steps": [
      "Show the majority-only negative baseline, with correct negatives over the complete population and recall zero.",
      "Show the current model’s alert pool on a separate explicitly named denominator.",
      "Compare all-case accuracy with alert precision as two different questions."
    ],
    "labels": [
      "Predict negative for everyone: {negative} correct out of 10,000.",
      "Accuracy {baselineAccuracy}, but recall 0%: every actual positive is missed.",
      "Current model alerts",
      "{tp} real positives + {fp} false alerts = {alerts}. Precision = {tp}/{alerts} = {precision}.",
      "Accuracy asks about every case. Precision asks about alerts."
    ],
    "check": "Which denominator includes false alerts?"
  },
  {
    "slug": "imbalanced-classification",
    "section": 3,
    "question": "Where do 10,000 decisions go?",
    "guide": "The four outcomes are counted in two actual-label pools. Each pool has its own labelled scale so rare positives remain visible.",
    "action": "Change positive prevalence, then decision threshold. Read both actual-label pools and the alert pool. Rebuild precision, recall, and accuracy from the named counts.",
    "purpose": "Keep rare cases visible and make denominator differences intuitive.",
    "steps": [
      "Show actual positives as found positives plus misses, on a pool-specific scale.",
      "Show actual negatives as false alerts plus correct negatives, on its own explicitly labelled scale.",
      "Show the alert pool as found positives plus false alerts.",
      "Show exact fractions for recall, precision, and accuracy; display Undefined when the denominator is zero.",
      "Use the section-specific guide above to connect this common count diagram to the current lesson."
    ],
    "labels": [
      "Actual positives: {tp} found + {fn} missed = {positive}",
      "Actual negatives: {fp} false alerts + {tn} correct negatives = {negative}",
      "Alerts: {tp} real positives + {fp} false alerts = {alerts}",
      "Each pool fills its own track; track lengths do not compare pool sizes.",
      "Recall = {tp}/{positive}",
      "Precision = {tp}/{alerts}",
      "Accuracy = ({tp}+{tn})/{n}",
      "Illustrative rate scenario; not a locked final-test result."
    ],
    "check": "Which denominator includes false alerts?"
  },
  {
    "slug": "imbalanced-classification",
    "section": 4,
    "question": "Which people belong in each metric’s denominator?",
    "guide": "Precision uses alerts, recall uses actual positives, and accuracy uses every case. Keep each numerator connected to its denominator.",
    "action": "Change positive prevalence, then decision threshold. Read both actual-label pools and the alert pool. Rebuild precision, recall, and accuracy from the named counts.",
    "purpose": "Keep rare cases visible and make denominator differences intuitive.",
    "steps": [
      "Show actual positives as found positives plus misses, on a pool-specific scale.",
      "Show actual negatives as false alerts plus correct negatives, on its own explicitly labelled scale.",
      "Show the alert pool as found positives plus false alerts.",
      "Show exact fractions for recall, precision, and accuracy; display Undefined when the denominator is zero.",
      "Use the section-specific guide above to connect this common count diagram to the current lesson."
    ],
    "labels": [
      "Actual positives: {tp} found + {fn} missed = {positive}",
      "Actual negatives: {fp} false alerts + {tn} correct negatives = {negative}",
      "Alerts: {tp} real positives + {fp} false alerts = {alerts}",
      "Each pool fills its own track; track lengths do not compare pool sizes.",
      "Recall = {tp}/{positive}",
      "Precision = {tp}/{alerts}",
      "Accuracy = ({tp}+{tn})/{n}",
      "Illustrative rate scenario; not a locked final-test result."
    ],
    "check": "Which denominator includes false alerts?"
  },
  {
    "slug": "imbalanced-classification",
    "section": 5,
    "question": "What changes when the decision threshold moves?",
    "guide": "A new threshold changes the decision counts in this illustrative rate model. The 10,000-case population and prevalence stay fixed.",
    "action": "Change positive prevalence, then decision threshold. Read both actual-label pools and the alert pool. Rebuild precision, recall, and accuracy from the named counts.",
    "purpose": "Keep rare cases visible and make denominator differences intuitive.",
    "steps": [
      "Show actual positives as found positives plus misses, on a pool-specific scale.",
      "Show actual negatives as false alerts plus correct negatives, on its own explicitly labelled scale.",
      "Show the alert pool as found positives plus false alerts.",
      "Show exact fractions for recall, precision, and accuracy; display Undefined when the denominator is zero.",
      "Use the section-specific guide above to connect this common count diagram to the current lesson."
    ],
    "labels": [
      "Actual positives: {tp} found + {fn} missed = {positive}",
      "Actual negatives: {fp} false alerts + {tn} correct negatives = {negative}",
      "Alerts: {tp} real positives + {fp} false alerts = {alerts}",
      "Each pool fills its own track; track lengths do not compare pool sizes.",
      "Recall = {tp}/{positive}",
      "Precision = {tp}/{alerts}",
      "Accuracy = ({tp}+{tn})/{n}",
      "Illustrative rate scenario; not a locked final-test result."
    ],
    "check": "Which denominator includes false alerts?"
  },
  {
    "slug": "imbalanced-classification",
    "section": 6,
    "question": "What happens when prevalence changes?",
    "guide": "Keep the threshold fixed and change prevalence. The positive pool, negative pool, and fraction of genuine alerts can change.",
    "action": "Change positive prevalence, then decision threshold. Read both actual-label pools and the alert pool. Rebuild precision, recall, and accuracy from the named counts.",
    "purpose": "Keep rare cases visible and make denominator differences intuitive.",
    "steps": [
      "At the fixed current threshold, compute the same illustrative rate model across prevalence 1–40%.",
      "Plot genuine-alert fraction against actual-positive fraction; mark the current prevalence in gold.",
      "At threshold one, show undefined precision with no invented zero curve.",
      "Name the model assumption: sensitivity and false-positive rate fixed at a chosen threshold; real populations can change them."
    ],
    "labels": [
      "Keep threshold {threshold} fixed. Change prevalence and inspect genuine alerts.",
      "Actual positives (%)",
      "Genuine alerts (%)",
      "No alerts at this threshold: precision is undefined at every prevalence.",
      "Current alert pool: {tp} genuine + {fp} false. Precision {precision}.",
      "This rate model holds sensitivity and false-alarm rate fixed at a chosen threshold. Real populations may also change those rates."
    ],
    "check": "Which denominator includes false alerts?"
  },
  {
    "slug": "imbalanced-classification",
    "section": 7,
    "question": "What should be locked before a final evaluation?",
    "guide": "These are illustrative development rates. Lock data preparation, the fitted model, and the threshold before evaluating a separate final sample.",
    "action": "Change positive prevalence, then decision threshold. Read both actual-label pools and the alert pool. Rebuild precision, recall, and accuracy from the named counts.",
    "purpose": "Keep rare cases visible and make denominator differences intuitive.",
    "steps": [
      "Show a four-step locked-evaluation workflow instead of another live score chart.",
      "Retain current prevalence and threshold controls; their receipt remains explicitly illustrative.",
      "Do not add a final-test reveal or label the live scenario a final result."
    ],
    "labels": [
      "1. Learn preparation and model on training rows.",
      "2. Choose and lock the decision threshold during development.",
      "3. Apply the locked procedure to an independent final sample.",
      "4. Count outcomes and report their denominators.",
      "The live 10,000-case scenario remains illustrative development evidence. It has no revealed final-test sample."
    ],
    "check": "Which denominator includes false alerts?"
  },
  {
    "slug": "imbalanced-classification",
    "section": 8,
    "question": "How do we report accuracy, recall, and precision together?",
    "guide": "Report the three named fractions and the four counts. Their denominators describe different populations.",
    "action": "Change positive prevalence, then decision threshold. Read both actual-label pools and the alert pool. Rebuild precision, recall, and accuracy from the named counts.",
    "purpose": "Keep rare cases visible and make denominator differences intuitive.",
    "steps": [
      "Print all four outcome counts together.",
      "Show the three metric fractions with separate explicit denominator descriptions.",
      "Name prevalence, threshold, and evaluation population in the reporting instruction."
    ],
    "labels": [
      "Counts: {tp} found positives, {fn} misses, {fp} false alerts, {tn} correct negatives.",
      "Recall: {tp} / {positive} = {recall}",
      "Denominator: all actual positives.",
      "Precision: {tp} / {alerts} = {precision}",
      "Denominator: every alert, including false alerts.",
      "Accuracy: {correct} / 10,000 = {accuracy}",
      "Denominator: every case in the population.",
      "Report prevalence, threshold, and the population role beside these scores."
    ],
    "check": "Which denominator includes false alerts?"
  },
  {
    "slug": "imbalanced-classification",
    "section": 9,
    "question": "Can you reconstruct the three fractions?",
    "guide": "Trace found positives into the actual-positive pool, alert pool, and full population. Rebuild each fraction from the displayed counts.",
    "action": "Change positive prevalence, then decision threshold. Read both actual-label pools and the alert pool. Rebuild precision, recall, and accuracy from the named counts.",
    "purpose": "Keep rare cases visible and make denominator differences intuitive.",
    "steps": [
      "Show actual positives as found positives plus misses, on a pool-specific scale.",
      "Show actual negatives as false alerts plus correct negatives, on its own explicitly labelled scale.",
      "Show the alert pool as found positives plus false alerts.",
      "Show exact fractions for recall, precision, and accuracy; display Undefined when the denominator is zero.",
      "Use the section-specific guide above to connect this common count diagram to the current lesson."
    ],
    "labels": [
      "Actual positives: {tp} found + {fn} missed = {positive}",
      "Actual negatives: {fp} false alerts + {tn} correct negatives = {negative}",
      "Alerts: {tp} real positives + {fp} false alerts = {alerts}",
      "Each pool fills its own track; track lengths do not compare pool sizes.",
      "Recall = {tp}/{positive}",
      "Precision = {tp}/{alerts}",
      "Accuracy = ({tp}+{tn})/{n}",
      "Illustrative rate scenario; not a locked final-test result."
    ],
    "check": "Which denominator includes false alerts?"
  },
  {
    "slug": "correlation",
    "section": 5,
    "question": "Why do matching deviation signs increase correlation?",
    "guide": "The selected point and the two means form a signed rectangle. Its side lengths are the input and outcome deviations; its signed area is their product.",
    "action": "Choose an observation, then a negative data pattern. Compare the two deviations, their product, and the sum used to compute r.",
    "purpose": "Turn invisible multiplication into a spatial signed area.",
    "steps": [
      "Retain the scatter and both mean guides.",
      "Draw the selected point’s rectangle to the mean intersection; use green for positive product and red for negative product.",
      "Print both signed differences, their product, the sum of all products, and r’s normalization."
    ],
    "labels": [
      "Δx = {x} − {meanX} = {dx}",
      "Δy = {y} − {meanY} = {dy}",
      "Selected product: {dx} × {dy} = {product}",
      "Matching signs: positive product",
      "Opposite signs: negative product",
      "r = sum of products / √(sum Δx² × sum Δy²) = {r}"
    ],
    "check": "What sign does a point above both means contribute?"
  },
  {
    "slug": "confidence-hypothesis-testing",
    "section": 4,
    "question": "Which areas are false alarms, power, and missed detection?",
    "guide": "The top null curve shades its two rejection tails: together they are α = 5%. The bottom alternative curve shades detection in green and missed detection in gold.",
    "action": "Change the planned true effect and sample size. Compare the green detection area with the gold missed area; the null false-alarm total stays 5%.",
    "purpose": "Distinguish prospective detection probability from a density height or observed p-value.",
    "steps": [
      "Use two vertically separated density panels on the same estimate scale.",
      "Shade the null rejection tails blue and label their total 5%.",
      "Shade the alternative’s rejection areas green and its non-rejection area gold.",
      "Print the model’s exact normal-CDF power and beta, rather than estimating them from pixel area.",
      "State independent normal observations and known population SD."
    ],
    "labels": [
      "Null truth: effect 0",
      "Two-sided false-alarm probability α = 5%",
      "Planned truth: effect {effect}",
      "Power: reject under this alternative = {power}",
      "Missed detection β = {beta}",
      "Same rejection boundaries: ±{critical}",
      "These are planned sampling probabilities, not the probability a hypothesis is true."
    ],
    "check": "If the planned effect is zero, what should the power equal?"
  },
  {
    "slug": "confidence-hypothesis-testing",
    "section": 6,
    "question": "Which areas are false alarms, power, and missed detection?",
    "guide": "The top null curve shades its two rejection tails: together they are α = 5%. The bottom alternative curve shades detection in green and missed detection in gold.",
    "action": "Change the planned true effect and sample size. Compare the green detection area with the gold missed area; the null false-alarm total stays 5%.",
    "purpose": "Distinguish prospective detection probability from a density height or observed p-value.",
    "steps": [
      "Use two vertically separated density panels on the same estimate scale.",
      "Shade the null rejection tails blue and label their total 5%.",
      "Shade the alternative’s rejection areas green and its non-rejection area gold.",
      "Print the model’s exact normal-CDF power and beta, rather than estimating them from pixel area.",
      "State independent normal observations and known population SD."
    ],
    "labels": [
      "Null truth: effect 0",
      "Two-sided false-alarm probability α = 5%",
      "Planned truth: effect {effect}",
      "Power: reject under this alternative = {power}",
      "Missed detection β = {beta}",
      "Same rejection boundaries: ±{critical}",
      "These are planned sampling probabilities, not the probability a hypothesis is true."
    ],
    "check": "If the planned effect is zero, what should the power equal?"
  },
  {
    "slug": "missing-data-encoding",
    "section": 2,
    "question": "How is each category represented, including an unknown one?",
    "guide": "Column headings name the saved category indicators. New? is an explicit unknown-category flag: Purple has zeros in the known-category columns and a one in New?.",
    "action": "Switch one-hot and ordinal coding. Read Red, Blue, Green, and New? headings. Compare Purple’s unknown handling with the distances implied by ordinal codes.",
    "purpose": "Eliminate ambiguous unlabeled bits and make the stated fallback actually visible.",
    "steps": [
      "Add full column headings and row labels to the existing one-hot grid.",
      "Add the fourth indicator New? with value 1 only for the unknown Purple example.",
      "For ordinal mode, use a Code heading and ? for unknown; label the assumed order rather than calling the codes nominal.",
      "Retain the existing selector and all missingness and imputation scenes."
    ],
    "labels": [
      "Category",
      "Red",
      "Blue",
      "Green",
      "New?",
      "New? = 1 when the category was absent from training.",
      "Code",
      "Ordinal codes assume an order and numerical distances.",
      "Unknown category: no saved ordinal code."
    ],
    "check": "Why must an unknown Purple row be distinguished from an all-zero known row?"
  },
  {
    "slug": "missing-data-encoding",
    "section": 6,
    "question": "How is each category represented, including an unknown one?",
    "guide": "Column headings name the saved category indicators. New? is an explicit unknown-category flag: Purple has zeros in the known-category columns and a one in New?.",
    "action": "Switch one-hot and ordinal coding. Read Red, Blue, Green, and New? headings. Compare Purple’s unknown handling with the distances implied by ordinal codes.",
    "purpose": "Eliminate ambiguous unlabeled bits and make the stated fallback actually visible.",
    "steps": [
      "Add full column headings and row labels to the existing one-hot grid.",
      "Add the fourth indicator New? with value 1 only for the unknown Purple example.",
      "For ordinal mode, use a Code heading and ? for unknown; label the assumed order rather than calling the codes nominal.",
      "Retain the existing selector and all missingness and imputation scenes."
    ],
    "labels": [
      "Category",
      "Red",
      "Blue",
      "Green",
      "New?",
      "New? = 1 when the category was absent from training.",
      "Code",
      "Ordinal codes assume an order and numerical distances.",
      "Unknown category: no saved ordinal code."
    ],
    "check": "Why must an unknown Purple row be distinguished from an all-zero known row?"
  },
  {
    "slug": "missing-data-encoding",
    "section": 9,
    "question": "How is each category represented, including an unknown one?",
    "guide": "Column headings name the saved category indicators. New? is an explicit unknown-category flag: Purple has zeros in the known-category columns and a one in New?.",
    "action": "Switch one-hot and ordinal coding. Read Red, Blue, Green, and New? headings. Compare Purple’s unknown handling with the distances implied by ordinal codes.",
    "purpose": "Eliminate ambiguous unlabeled bits and make the stated fallback actually visible.",
    "steps": [
      "Add full column headings and row labels to the existing one-hot grid.",
      "Add the fourth indicator New? with value 1 only for the unknown Purple example.",
      "For ordinal mode, use a Code heading and ? for unknown; label the assumed order rather than calling the codes nominal.",
      "Retain the existing selector and all missingness and imputation scenes."
    ],
    "labels": [
      "Category",
      "Red",
      "Blue",
      "Green",
      "New?",
      "New? = 1 when the category was absent from training.",
      "Code",
      "Ordinal codes assume an order and numerical distances.",
      "Unknown category: no saved ordinal code."
    ],
    "check": "Why must an unknown Purple row be distinguished from an all-zero known row?"
  },
  {
    "slug": "model-selection",
    "section": 8,
    "question": "How does penalty strength affect error at a fixed degree?",
    "guide": "Hold polynomial degree fixed. Compare training and validation error across penalty strength λ, then mark the current λ on those same curves.",
    "action": "Keep degree fixed and move λ. Compare its marked training and validation errors. Switch Ridge and Lasso, then explain the evaluation population.",
    "purpose": "Correct the axis mismatch between the question about λ and the degree plot.",
    "steps": [
      "Compute fits across λ from 0 to 2 using the current fixed degree and same training and validation rows.",
      "Plot mean squared prediction error against Penalty strength λ.",
      "Mark the exact current λ on both curves; retain degree and penalty controls.",
      "Label this as a development holdout comparison; do not claim a cross-validation selection or final-test result."
    ],
    "labels": [
      "Penalty strength λ",
      "Mean squared prediction error",
      "Training",
      "Validation",
      "Fixed degree: {degree}",
      "Current λ = {lambda}",
      "Same training rows and validation rows across λ.",
      "Final-test rows are not used."
    ],
    "check": "What is held fixed while moving along the λ axis?"
  },
  {
    "slug": "regression-diagnostics",
    "section": 3,
    "question": "How much does one training case change the fitted prediction?",
    "guide": "Compare the fit using all training rows with a fit omitting only the selected row. Their prediction gap at the same input shows influence.",
    "action": "Choose an observation and compare both curves. Move Query x, then omit and restore the selected row. Both comparison fits stay visible.",
    "purpose": "Show influence directly without deleting the source observation.",
    "steps": [
      "Draw the observed outcomes and ring the selected row.",
      "Draw one curve fitted to every training row and another fitted without the selected row.",
      "Show both predictions at the same query input and their signed difference.",
      "Keep the original omit/restore control and mark which fit is active."
    ],
    "labels": [
      "Fit with every training row",
      "Fit without {rowId}",
      "Same query x = {x}",
      "All-row prediction: {allPrediction}",
      "Without-row prediction: {withoutPrediction}",
      "Change = {withoutPrediction} − {allPrediction} = {delta}",
      "Active fit: {active}"
    ],
    "check": "Does a large residual necessarily mean a large prediction change?"
  },
  {
    "slug": "knn",
    "section": 5,
    "question": "How do input gaps determine the nearest neighbors?",
    "guide": "The gold query and closest training row form a right triangle in the active distance coordinates. Square each input gap, add, then take the square root.",
    "action": "Move the query and switch feature scaling. Compare the displayed gaps, distance, and ranked neighbors. Scaled distances use training-only standard deviations.",
    "purpose": "Connect spatial proximity to exact arithmetic and rank.",
    "steps": [
      "Retain all training marks and highlighted K neighbors.",
      "Draw horizontal and vertical gap segments from the gold query to the nearest row.",
      "Add a clearly labelled zoomed gap triangle with equal axis scales. Gold is the query origin, the colored endpoint is the closest row, and the green diagonal is distance. Do not imply the zoom shares the overview scale.",
      "Use the same raw or standardized coordinates as the actual model.",
      "Print both differences, squared-distance arithmetic, and all K neighbor IDs and distances in the receipt."
    ],
    "labels": [
      "Distance coordinates: {rawOrScaled}",
      "Closest row: {rowId}",
      "Δx = {dx}",
      "Δz = {dz}",
      "Distance = √({dx}² + {dz}²) = {distance}",
      "Nearest first; K = {k}",
      "Training-only scaling; original observations stay unchanged.",
      "Zoomed gaps",
      "Equal axis scales",
      "Gold: query. Colored endpoint: closest row. Green diagonal: distance. The detail is zoomed; numbers use the original distance coordinates."
    ],
    "check": "Why can a change in scaling change the nearest row?"
  },
  {
    "slug": "knn",
    "section": 7,
    "question": "How do input gaps determine the nearest neighbors?",
    "guide": "The gold query and closest training row form a right triangle in the active distance coordinates. Square each input gap, add, then take the square root.",
    "action": "Move the query and switch feature scaling. Compare the displayed gaps, distance, and ranked neighbors. Scaled distances use training-only standard deviations.",
    "purpose": "Connect spatial proximity to exact arithmetic and rank.",
    "steps": [
      "Retain all training marks and highlighted K neighbors.",
      "Draw horizontal and vertical gap segments from the gold query to the nearest row.",
      "Add a clearly labelled zoomed gap triangle with equal axis scales. Gold is the query origin, the colored endpoint is the closest row, and the green diagonal is distance. Do not imply the zoom shares the overview scale.",
      "Use the same raw or standardized coordinates as the actual model.",
      "Print both differences, squared-distance arithmetic, and all K neighbor IDs and distances in the receipt."
    ],
    "labels": [
      "Distance coordinates: {rawOrScaled}",
      "Closest row: {rowId}",
      "Δx = {dx}",
      "Δz = {dz}",
      "Distance = √({dx}² + {dz}²) = {distance}",
      "Nearest first; K = {k}",
      "Training-only scaling; original observations stay unchanged.",
      "Zoomed gaps",
      "Equal axis scales",
      "Gold: query. Colored endpoint: closest row. Green diagonal: distance. The detail is zoomed; numbers use the original distance coordinates."
    ],
    "check": "Why can a change in scaling change the nearest row?"
  }
];
export const visualRevision = (slug,index) => visualRevisions.find(r=>r.slug===slug && r.section===index+1);
