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
- **Think Deeper (instructional depth)** — "Why does it work?" reasoning after Tower Climb answers (pick a reason or
  write your own), 3-step **Multi-Step Quests** in real-world contexts (budget, recipe, sports, garden, field trip),
  **Strategy Showdown** (area model vs partial products, standard algorithm vs compensation, common denominator vs
  benchmark ½ — find the strategy with the mistake), **Explain It** open responses auto-scored 0–3 by rubric and
  re-scored by the teacher, and **Intervention Missions** (mini-lesson + targeted items) assigned automatically when a
  misconception repeats.
- **Teacher Hub (teacher platform)** — create a class (class code `LUC-…`), roster from this device plus progress
  codes/files collected from other devices, class heatmap (9 skills × L1–L6), average scale score and growth,
  students needing attention, most common misconceptions with one-tap mission assignment, suggested small groups,
  per-student recommended next steps, teacher-assigned missions (delivered instantly on this device, by assignment
  code `LUA-…` elsewhere) with completion tracking, printable growth reports, class CSV. Students use **My Path → My
  Class** to join, see assignments, share their progress code, and combine progress from another device (merge never
  loses answers). Sync is pluggable: local + codes work now; Supabase accounts/sync switch on with a project URL +
  anon key — see [docs/backend/SETUP.md](docs/backend/SETUP.md).
- **Reteach Plan (Teacher Hub → 🧭 Reteach Plan)** — from the class's real results only: (a) the misconception most
  students have (students, % of class, error count, sample wrong answers) and (b) the CCSS standard most students are
  below grade level on, each with the top 3 and ties called out. Every plan has a goal, why students make the error, a
  3-part mini-lesson (concrete/visual model → guided practice → independent check), a 3–5 question exit ticket with
  key, small groups (≤6), and one-tap assign of the matching Brock challenge + mission. Print/PDF and CSV. Empty
  classes get a clear "no results yet" with how to get data; a demo preview is clearly labeled and never saved.
- **Weakness Challenges vs Brock "The Block"** — every student's home screen and My Path lead with **Your Challenge
  today**, picked from their biggest gaps (prerequisite building blocks first), repeated misconceptions, due Memory
  Checks and teacher assignments. Brock, a smug-but-harmless neighborhood kid, blocks an NYC spot with a math "trick"
  matching the misconception; the student learns the trick-buster (reteach), does 2 guided tries, then a boss battle
  where first-try answers drain Brock's confidence and wrong answers trigger a quick reteach (no penalty). Difficulty
  adapts during the battle; a Memory Check rematch comes 3 days later. Rewards: coins, streaks, badges ("Block
  Buster" when a gap is closed); Brock is redeemed and becomes a friend. Teacher Hub shows **Closing the gap**: below
  grade level per skill at placement vs now and who closed it. Brock art: Canva AI.
- **Teacher/parent dashboard** — mastery, accuracy, time on task, growth, misconception flags, CSV/print
- Grade-4 coverage: multiplication & division, place value, rounding, multi-digit add/sub, factors &
  multiples, multi-step word problems, fractions. Every generated item is checked by a verification script.

Works on desktop (WASD/mouse) and phones (touch joystick). Static site — no install, no login; progress saves in the browser.

## Tests

`.github/workflows/test.yml` (GitHub Actions) runs on every push:

| Script | What it checks |
|---|---|
| `tools/verify_assess.js` | 3,000 simulated students (5% slip / 20% guess): placement within ±1 level, exact recovery for noiseless students, all 5 formats used, prerequisite graph acyclic, gap detection, misconception tagging of every distractor, entry checking, reassessment schedule, growth |
| `tools/verify_mastery.js` | mastery rules (first-try, representations, independence, spaced retention, transfer, retake handling) + 20,400 transfer items keep the source answer, choices and numbers |
| `tools/verify_learn.js` | every item generator: 9 skills × 6 levels × 3,000 seeds (answers recomputed independently) |
| `tools/verify_math.js` | every story-mission item against an independent hand-made answer key (headless Chrome) |
| `tools/verify_itembank.js` | every bank item has verified answer + explanation, CCSS code, difficulty, misconception codes, valid review status; 81,000 fresh generator instances map to a bank template and pass the answer key |
| `test/p3review.js` | review page: approve, flag (note required), persist, filter, export + import approvals.json |
| `tools/verify_depth.js` | 15,000 multi-step tasks (every step equation re-computed, numbers traceable to the story), 9,000 strategy comparisons (error flags + wrong step correct), reasoning prompts for every item type, rubric sanity, intervention targeting |
| `test/p4depth.js` | reasoning prompt, Multi-Step Quest, Strategy Showdown, Explain It, misconception-triggered mission, teacher scoring |
| `tools/verify_classroom.js` | class/progress/assignment codes (round-trip, tamper detection), cross-device merge (no lost evidence, idempotent, order-independent, slips respected), class analytics, recommendations, assignment delivery/status, growth reports, CSV, Supabase adapter against a mock REST server |
| `test/p5class.js` | Teacher Hub end-to-end: create class, import progress codes, heatmap, assign mission (on-device + code), student plan, growth report; student joins, shares, merges progress, opens assigned mission |
| `tools/verify_reteach.js` | reteach content for all 13 misconceptions + 9 standards, every equation in lessons (eqcheck) and every exit-ticket answer (independent key), ranking/ties/groups/samples vs brute force on 150 simulated classes, empty state, no invented data |
| `tools/verify_challenge.js` | challenge selection (building blocks first, biggest gap, repeated misconceptions, Memory Check due, teacher assigned, cool-down, stretch), adaptive difficulty, 3,200 simulated battles, rewards/streaks/badges, gap report, kid-appropriate Brock text |
| `test/p6reteach.js`, `test/p7challenge.js` | Reteach Plan and Weakness Challenge end-to-end in the browser |
| `tools/check_dist.js` | shipped files match their sources, scripts wired in order, no file over 95 MB |
| `test/play.js` (+ `test/p1diag.js`) | headless play-test: hero → 3D street → rooms → games, then a full Placement Quest, pause/resume, Check-Up and dashboard (`p1diag.js`), Tower Climb evidence, Memory Checks and mastery (`p2mastery.js`); fails on any console error or failed request |

Run locally: `npm i --no-save playwright`, serve the folder on port 8765, then `node tools/verify_assess.js` etc.
