# Level Up NYC — 4th-grade math adventure

Play: https://peakedpd.github.io/levelup-nyc-math/

A 3D New York street where 4th graders learn math by playing. Pick a hero, walk the block, and solve
real-world problems with Ms. Okafor (teacher), Theo, Ms. Marcia, Mr. Sal (clothing store) and the Arcade Worker.

- **Placement Quest (adaptive diagnostic)** — Bayesian adaptive placement, 3–6 items per skill (~28–37 total), in five
  formats: multiple choice, number keypad, fraction entry, tap/drag array builder and story problems. Detects
  prerequisite gaps from a skill dependency graph, flags specific misconceptions from tagged distractors and typed-answer
  slips, sets an instructional starting level per skill with a confidence rating, and reports a scale score (380–560).
  Save & resume mid-quest. **Check-Ups** come due every 14 days or 10 lessons; retakes keep full history and show growth.
- **My Path** — personalized learning path with mastery per skill
- **Teach Me** — mini-lessons with worked examples and 3D desk demos
- **Mini-games** — Ticket Blaster, Tower Climb, Lightning Round, rooftop boss fight (Number Muncher)
- **Teacher/parent dashboard** — mastery, accuracy, time on task, growth, misconception flags, CSV/print
- Grade-4 coverage: multiplication & division, place value, rounding, multi-digit add/sub, factors &
  multiples, multi-step word problems, fractions. Every generated item is checked by a verification script.

Works on desktop (WASD/mouse) and phones (touch joystick). Static site — no install, no login; progress saves in the browser.

## Tests

`.github/workflows/test.yml` runs on every push:

| Script | What it checks |
|---|---|
| `tools/verify_assess.js` | 3,000 simulated students (5% slip / 20% guess): placement within ±1 level, exact recovery for noiseless students, all 5 formats used, prerequisite graph acyclic, gap detection, misconception tagging of every distractor, entry checking, reassessment schedule, growth |
| `tools/verify_learn.js` | every item generator: 9 skills × 6 levels × 3,000 seeds (answers recomputed independently) |
| `tools/verify_math.js` | every story-mission item against an independent hand-made answer key (headless Chrome) |
| `tools/check_dist.js` | shipped files match their sources, scripts wired in order, no file over 95 MB |
| `test/play.js` (+ `test/p1diag.js`) | headless play-test: hero → 3D street → rooms → games, then a full Placement Quest, pause/resume, Check-Up and dashboard; fails on any console error or failed request |

Run locally: `npm i --no-save playwright`, serve the folder on port 8765, then `node tools/verify_assess.js` etc.
