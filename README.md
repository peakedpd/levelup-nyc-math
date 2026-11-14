# Level Up NYC — 4th-grade math adventure

Play: https://peakedpd.github.io/levelup-nyc-math/

A 3D New York street where 4th graders learn math by playing. Pick a hero, walk the block, and solve
real-world problems with Ms. Okafor (teacher), Theo, Ms. Marcia, Mr. Sal (clothing store) and the Arcade Worker.

- **Placement Quest (adaptive diagnostic)** — Bayesian adaptive placement, 3–6 items per skill (~28–37 total), in five
  formats: multiple choice, number keypad, fraction entry, tap/drag array builder and story problems. Detects
  prerequisite gaps from a skill dependency graph, flags specific misconceptions from tagged distractors and typed-answer
  slips, sets an instructional starting level per skill with a confidence rating, and reports a scale score (380–560).
  Save & resume mid-quest. **Check-Ups** come due every 14 days or 10 lessons; retakes keep full history and show growth.
- **My Path + meaningful mastery** — a level is passed only with ≥80% first-attempt accuracy, success in ≥2
  representations (picture, typed, story, new-situation transfer) and at least one solo answer (no hints, no pictures).
  Passed levels get spaced **Memory Checks** (+3, +7, +21 days); forgetting sends the student back. A skill is
  **mastered** only after L6 + a delayed Memory Check + an unfamiliar-context transfer problem. Diagnostic retakes never
  erase practice evidence.
- **Teach Me** — mini-lessons with worked examples and 3D desk demos
- **Mini-games** — Ticket Blaster, Tower Climb, Lightning Round, rooftop boss fight (Number Muncher)
- **Educator verification** — `item_bank.json` lists every question template and fixed item (208 records: generator
  templates, transfer contexts, story missions, Practice Lab, boss problems) with a machine-verified answer and explanation,
  CCSS standard, difficulty, misconception tags and an educator review status (default **pending review**).
  [`review.html`](https://peakedpd.github.io/levelup-nyc-math/review.html) lets a Grade 4 educator approve or flag each
  item with notes and export `approvals.json`; `tools/build_itembank.js` merges approvals back without overwriting them.
- **Teacher/parent dashboard** — mastery, accuracy, time on task, growth, misconception flags, CSV/print
- Grade-4 coverage: multiplication & division, place value, rounding, multi-digit add/sub, factors &
  multiples, multi-step word problems, fractions. Every generated item is checked by a verification script.

Works on desktop (WASD/mouse) and phones (touch joystick). Static site — no install, no login; progress saves in the browser.

## Tests

`.github/workflows/test.yml` runs on every push:

| Script | What it checks |
|---|---|
| `tools/verify_assess.js` | 3,000 simulated students (5% slip / 20% guess): placement within ±1 level, exact recovery for noiseless students, all 5 formats used, prerequisite graph acyclic, gap detection, misconception tagging of every distractor, entry checking, reassessment schedule, growth |
| `tools/verify_mastery.js` | mastery rules (first-try, representations, independence, spaced retention, transfer, retake handling) + 20,400 transfer items keep the source answer, choices and numbers |
| `tools/verify_learn.js` | every item generator: 9 skills × 6 levels × 3,000 seeds (answers recomputed independently) |
| `tools/verify_math.js` | every story-mission item against an independent hand-made answer key (headless Chrome) |
| `tools/verify_itembank.js` | every bank item has verified answer + explanation, CCSS code, difficulty, misconception codes, valid review status; 81,000 fresh generator instances map to a bank template and pass the answer key |
| `test/p3review.js` | review page: approve, flag (note required), persist, filter, export + import approvals.json |
| `tools/check_dist.js` | shipped files match their sources, scripts wired in order, no file over 95 MB |
| `test/play.js` (+ `test/p1diag.js`) | headless play-test: hero → 3D street → rooms → games, then a full Placement Quest, pause/resume, Check-Up and dashboard (`p1diag.js`), Tower Climb evidence, Memory Checks and mastery (`p2mastery.js`); fails on any console error or failed request |

Run locally: `npm i --no-save playwright`, serve the folder on port 8765, then `node tools/verify_assess.js` etc.
