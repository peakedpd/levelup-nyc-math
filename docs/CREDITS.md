# Credits — third-party assets

## Character voices (voice/*/*.mp3)
Every pre-recorded character line was generated on our own machine with **Kokoro-82M** (hexgrad/Kokoro-82M, open-weight neural text-to-speech, **Apache License 2.0**, which allows commercial use; the voice packs ship in the same Apache-2.0 repo). Runtime used: kokoro-onnx (MIT) with the `kokoro-v1.0.onnx` / `voices-v1.0.bin` files. No cloud service was used, and no real person's voice was cloned.

| Character | Kokoro voice | Speed | Pitch/formant shift | Notes |
|---|---|---|---|---|
| Ms. Okafor | af_heart (US English, female) | 0.93 | 0.97 | warm, firm teacher. Kokoro has no Nigerian-English voice, so she uses its warmest adult female voice instead of an imitation accent |
| Ms. Marcia | bf_emma (UK English, female) | 1.00 | — | friendly festival organizer |
| Theo | am_puck (US English, male) | 1.10 | 1.24 (younger) | upbeat kid |
| Mr. Sal | bm_george (UK English, male) | 0.92 | 0.94 (older) | friendly retired teacher |
| Arcade Worker | am_michael (US English, male) | 0.88 | — | laid-back young adult |
| Brock | am_fenrir (US English, male) | 1.04 | 1.16 (younger), louder | tough kid → friendly after you beat him |
| Number Muncher | am_onyx (US English, male) | 0.90 | 0.74 + echo | cartoon monster |

Lines that include the player's name or changing numbers (hints, "Yes! 42 is right!") are read by the device's built-in browser voice (Web Speech API), with a different pitch and speed for each character.
To re-record: `node tools/voice_lines.js && /workspace/tts/venv/bin/python tools/voice_render.py` (writes voice/manifest.js).

- Universe detail pass (w2u–w2x): all props are procedural Three.js geometry made for this project; no third-party models or textures added.
