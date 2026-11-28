# Environment 3D pass: progress log

Started 2026-11-28 (ET). Rule: real 3D everywhere (flat art only for posters/signs), everything interactive, Roblox-like movement unchanged, phone-friendly.

## Meshy credit ledger (this pass)
Start balance 1,297 (after the 16-character job). Budget ≤1,000, keep ≥250 in reserve. Never buy credits.

| step | credits | balance after |
|---|---|---|
| Mr. Sal + Brock image-to-3D (2 × 30) | 60 | 1,237 |
| rigging (2 × 5) | 10 | ~1,227 |
| animations Idle/Talk/Wave/Cheer (2 × 12) + Idle 3 (2 × 3) | 30 | 1,197 |
| 21 text-to-3D props, batch 1 (preview 5 + refine 10 each) | 315 | 882 |
| 9 text-to-3D props, batch 2 | 135 | 747 |
| **pass total** | **550** | **747** |

Full per-task ledger: /workspace/meshy_raw/ledger.jsonl (outside the repo).

## Step 1: street + Mr. Sal / Brock in 3D
- **Street buildings (all 24)**:
  - The Canva facade art now covers only the storefront/stoop floor. The painted upper floors are gone.
  - Above it is real 3D (env3d_street.js, 20 instanced meshes, ~4,150 parts):
    - recessed double-hung windows: frames, mullions, stone sills, lintels with keystones
    - lit rooms, curtains, shades
    - flower boxes with flowers, AC units
    - string courses between floors
  - New NYC fire escapes on every non-school building: slatted platforms, railings with balusters, brackets, stairs between floors, a drop ladder. These replace the old flat iron slabs.
- **Interactive**:
  - 🪜 Pull the fire-escape ladder down, with clank sounds. Apartments drop it to the sidewalk; on the arcade and clothing store it gets stuck on the awning.
  - 🪟 Look up at any building: a low camera shot of the windows, then an optional "rows × columns" windows math moment (4.OA.A.1).
  - 🗑️ Lifting a trash-can lid now swings the camera over the rim to show what's inside. The cans also hold more stuff.
- **Mr. Sal and Brock**: Meshy image-to-3D from their existing Canva art, rigged, with idle/talk/wave/cheer/walk clips. Their flat cards are hidden.
  - Sal turns to you, waves, talks and cheers when you shop.
  - Brock turns to you and taunts (talk); once he's your friend he waves and cheers.
  - Both act in cinematic close-ups (head-bone aim).
- **Tests**:
  - new test/p15env.js (desktop + phone in CI)
  - p14chars now also checks Sal and Brock
- **Screenshots**:
  - shots/env3d/before/{desktop,phone}/
  - shots/env3d/after1/{desktop,phone}/ (s_wide, s_north, s_apt, s_up …)

## Step 2: Meshy hero props in every area + arcade neon (env3d_props.js, env3d_rooms.js)
- **Models**: 30 Meshy text-to-3D props (smart topology meshy-t2.5, 2–6k triangles, 512 px WebP, 3.6 MB total) in models/props/. Room props load the first time you enter that room.
- **Placement**: each prop is scaled to a real height and set on the floor or counter. A placement finder keeps props clear of colliders, other taps and door lanes, and big props get colliders.
- **Every prop is interactive** (E / tap): a small animation (spin, wobble, pop or pulse) plus a sound. Most also offer an optional math moment. There are 16 new answer-checked generators (hotdog, icecream, meter, phone, gumball, popcorn, skee, jukebox, lockers, globe, change, tv, claw, hoop, trophy, shoes).
  - **Street**:
    - hot-dog cart (price ×), ice-cream cart (bell jingle, scoops)
    - newspaper boxes (headline rounding), payphone (dial tone, calls per $)
    - 3 parking meters (quarters × 15 min)
  - **Arcade**:
    - gumball crank (gumball pops out, fraction), popcorn machine (popping particles)
    - skee-ball (score sum), jukebox (plays a tune)
    - claw machine (random win, tokens ÷), basketball hoop game (2s and 3s), photo booth (camera flash shot)
    - Decor: neon wall/floor strips, lightning bolts, 6 hanging neon rings, 2 colored fill lights, and a NEON switch by the door that cycles 4 color themes.
  - **Classroom**:
    - The plain box teacher's desk is replaced by a real 3D desk (apple, books, lamp; clock quiz).
    - globe (spins; ÷), bookcase (books ×), backpack (share ÷)
  - **Hallway**: water fountain (water puff), backpack.
  - **Lobby**: couch, trophy case (trophies ×), plant.
  - **Gym**: 2 locker banks (count-by pattern).
  - **Cafeteria**: milk fridge (cold puff, share), lunch-menu TV.
  - **Clothing store**:
    - 2 mannequins (spin, shop +), rolling rack (shirts ×)
    - folded-shirt table, sneaker wall (pairs × 2), plant
    - register on Mr. Sal's counter (change from $20)
    - fitting room: try-on opens the shop
    - mirror (camera shot of you)
  - **Apartment**: plant.
- **Test**: test/p16props.js (in CI): every prop loads, sits on its surface, is visible, its tap runs, and its quiz contains the answer. Generators are checked over 400 seeds each.
- **Screenshots**: shots/env3d/after2/{desktop,phone}/ (arcade_a/b, clothing_a/b, lobby_a, hallway_a, cafeteria_a, gym_a …)

## Step 3: school hallway, apartment, wall-depth fix (env3d_rooms.js)
- **Hallway**: two cork bulletin boards above the lockers. Each is a real 3D frame and cork with 6 pinned notices and push pins. Reading one gives a bulletin note and an optional clock math moment.
- **Theo's apartment**:
  - striped rug
  - two wall shelves with 14 books and a toy robot with a glowing eye; tap it for an optional books math moment
  - floor lamp whose switch turns its warm light on and off
- **Fix**: the room walls are 0.4 m thick, so the arcade neon strips and lightning bolts were partly buried in the wall. They now sit on the inner wall face and show.
- **Screenshots**: shots/env3d/after3/desktop/{hall_board,arcade_neon,apt_shelf,hallway_a,apartment_a}.png

## Step 4: perf pass + gym/classroom detail
- **Perf**:
  - The street facade meshes and street props are now hidden while you're inside a room (the facade meshes are never culled).
  - Only fire-escape iron casts shadows.
  - Measured locally on the software renderer (swiftshader, desktop 1100×700), before (6be782b) → after:

    | area | fps | draw calls | triangles |
    |---|---|---|---|
    | street | 3.5 → 3.3 | 259 → 299 | 103k → 115k |
    | arcade | 3.8 → 3.0 | 172 → 187 | 100k → 124k |
    | clothing | 7 → 5 | 114 → 120 | 107k → 159k (Mr. Sal 3D + 9 props) |
    | school | 4.5 → 3.5 | 97 → 90 | 108k → 122k |

  - Before this pass the street env ran 362 calls / 167k triangles.
- **Flat audit**: Meshy GLB props and rigged (skinned) characters no longer count as flat cards. Before, Brock's model tripped p13universe.
- **Gym**: 3-row wooden bleachers with steel braces and a collider. "Cheer from the bleachers" offers a points math moment.
- **Classroom**: cubbies by the door with 8 colored bins and a coat-hook rail. "Check the cubbies" offers a share math moment.

## Final state (2026-11-28)
- **Published SHAs**:
  - 14ff879 street + Mr. Sal/Brock
  - e8ddc69 30 props + arcade neon
  - 0fb5b08 hallway + apartment
  - 55d18e5 perf + gym/classroom + flat-audit fix
  - then this log update
- **CI**:
  - 14ff879 failed on the p9 ArrowLeft timing; the check was made fps-robust in e8ddc69.
  - e8ddc69 and 0fb5b08 failed p13universe because the GLB props counted as flat panels; fixed in 55d18e5.
- **Meshy credits**:
  - This pass used 550: Sal + Brock 100, 30 props 450.
  - Balance 747; the account started at 2,100 credits.
  - No credits were bought.
- **Screenshots**:
  - shots/env3d/final_grid.png: before/after, desktop + phone, for street, arcade, classroom, clothing, hallway, apartment
  - shots/env3d/{before,final}/{desktop,phone}/
- **Gaps**:
  - Numbered-locker doors and the fridge door don't swing. The Meshy props are single meshes, so the interactions are wobble/spin/pop plus sounds.
  - The painted fire escape still shows a little below the storefront cut on the apartment facades.
  - On the software renderer the fps dropped by about 0.5 (street 3.5 → 3.3); real GPUs are unaffected in practice.
  - Mr. Sal and Brock have no lip-sync.
  - The rooftop area wasn't touched.
