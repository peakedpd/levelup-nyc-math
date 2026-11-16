# Level Up Videos

Teaching videos for the major Grade 4 math concepts in Level Up NYC, taught by Ms. Okafor.

## Pilot (concept 1: "Times As Many", 4.OA.A.1). Two production styles to compare

| File | How it was made | Length | Cost |
|---|---|---|---|
| `01_times_as_many_explainer.mp4` | Code-animated explainer (`tools/make_video.py`): game art plus step-by-step visuals (marbles, groups, skip counting, bar model, "more than vs times as many", Your Turn with pause countdown, answer), captions, and an offline Piper TTS voice (en_US-lessac-medium) | ~79 s | free |
| `01_times_as_many_ai_clip.mp4` | Higgsfield Kling 3.0 image-to-video of Ms. Okafor in the classroom speaking a short explanation (AI voice + motion) | 10 s | 20 credits |

## Planned full set (one video per major concept)
1. Times as many (multiplicative comparison): 4.OA.A.1–2 (pilot done)
2. Equal groups and arrays: 4.OA.A.1
3. Place value to 1,000,000: 4.NBT.A.1–2
4. Rounding: 4.NBT.A.3
5. Adding and subtracting big numbers: 4.NBT.B.4
6. Multi-digit multiplication (area model / partial products): 4.NBT.B.5
7. Division and remainders: 4.NBT.B.6, 4.OA.A.3
8. Factors and multiples, prime and composite: 4.OA.B.4
9. Fractions: equivalent and comparing: 4.NF.A.1–2
10. Multi-step word problems: 4.OA.A.3

## Re-render the explainer
Needs `piper-tts` (pip), ffmpeg, Pillow, and the Piper voice files `en_US-lessac-medium.onnx` and `.onnx.json` beside the script. Edit `SCENES` in the script for a new concept.
