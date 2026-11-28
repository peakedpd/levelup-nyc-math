# Environment 3D pass: progress log

Started 2026-11-28 (ET). Rule: real 3D everywhere (flat art only for posters/signs), everything interactive, Roblox-like movement unchanged, phone-friendly.

## Meshy credit ledger (this pass)
Start balance 1,297 (after the 16-character job). Budget ≤1,000, keep ≥250 in reserve. Never buy credits.

| step | credits | balance after |
|---|---|---|
| Mr. Sal + Brock image-to-3D (2 × 30) | 60 | 1,237 |
| rigging (2 × 5) | 10 | ~1,227 |
| animations Idle/Talk/Wave/Cheer (2 × 12) + Idle 3 (2 × 3) | 30 | 1,197 |

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
