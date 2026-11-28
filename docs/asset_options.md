# 3D avatars + scene assets — shortlist (checked 2026-11-27)

Product constraints: browser (Three.js, phones), paid kids' education product, John prefers Canva for art, no Higgsfield. License notes are summaries of the vendors' own pages — not legal advice.

## A. Avatars (rigged, animatable, lightweight GLB)
| Option | Link | License / cost | Verdict |
|---|---|---|---|
| Ready Player Me | https://readyplayer.me | **Shut down 31 Jan 2026** (Netflix bought it; creator, PlayerZero, APIs offline; old exported GLBs still work as plain files) | Dead — do not build on it. |
| Avaturn | https://avaturn.me · https://docs.avaturn.me | Free embed (users sign in to Avaturn, no API); API/web SDK **$800/mo** Pro (only startups <$1M revenue); commercial use needs prior notice + attribution; Avaturn owns the 3D model content | Selfie→avatar of *real children's faces* + vendor-owned models + $800/mo: poor fit for a kids' product. Skip. |
| Mixamo (Adobe) | https://www.mixamo.com · https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html | Free with Adobe ID; royalty-free commercial use in games, no credit; **cannot redistribute raw character/animation files** (a public GitHub Pages repo serving the FBX/GLB is a grey area — ship baked/renamed GLBs only inside the game, keep originals private); no AI/ML training use | Best *free* rigging + animation library (auto-rigs any humanoid, 2,000+ clips). Use to rig/animate Canva-sourced characters. |
| VRoid Studio (VRM) | https://vroid.com/en/studio | Free; exported models usable commercially (guidelines: no CC0, check each preset's license); you can't ship an app that lets players generate/export VRoid-derived avatars without a separate pixiv license | Anime look — doesn't match Level Up's realistic-stylized kids. Skip unless style changes. |
| Meshy (image→3D, auto-rig, animate) | https://www.meshy.ai/pricing · https://docs.meshy.ai/en/webapp/pricing | Free = CC BY 4.0 (credit required), only 10 untextured "Lite" downloads/mo; **Pro $20/mo = private, full commercial ownership**; rigging + animation free in the web app; GLB export with rig | Best AI route: feed John's Canva character renders (Canva art, not Higgsfield) → rigged textured GLB for $20/mo. Quality varies; needs hand cleanup and a poly/texture budget (<10k tris, 1k textures) for phones. |
| Tripo (image→3D, rig) | https://www.tripo3d.ai/pricing | Free = public, **non-commercial**; Pro $20/mo = private, commercial; rig 20 credits; rigs to Mixamo/VRM/Unity skeletons | Comparable to Meshy; pick whichever gives the better face on Ms. Okafor/Mr. Sal in a one-character trial. |
| Canva | https://www.canva.com/help/3d-elements/ | Canva "3D elements"/Magic Media render inside designs; **no documented GLB export** | Keep Canva for art (posters, signs, whiteboard writing, character reference sheets) — not for GLBs. |
| AvatarCLIP (hongfz16) | https://github.com/hongfz16/AvatarCLIP | **S-Lab License 1.0: non-commercial only** ("contact the contributors" for commercial); SMPL models also need separate registration/license; V100-class GPU, hours/avatar; rigged FBX export exists but low-res blobby SMPL bodies | No. Research-only license, wrong quality. |
| YourEditableAvatar (liuhx02) | https://github.com/liuhx02/YourEditableAvatar | **No LICENSE file** (all rights reserved by default); depends on non-commercial Inria Gaussian-Splatting + SuGaR code; needs A40/A6000-class GPU + CUDA 11.7; edits Gaussian-splat avatars captured from *monocular video of a real person*; custom-data pipeline "TODO"; output = renders/splats, no mesh, no rig, not glTF/Three.js | No. Cannot produce a rigged GLB; license blocks commercial use. |

**Recommended avatar route:** keep the characters Claude is already converting (small rigged .glb in models/). For *new* characters: Canva AI character render → Meshy (or Tripo) Pro for rigged GLB → Mixamo for extra animations → decimate/compress (meshopt) to phone budget. Don't use real kids' photos (COPPA/FERPA). Trial = 1 character (Mr. Sal), ~1 hour, $20.

## B. Scene assets (rooms, streets, props)
| Source | Link | License / cost | Verdict |
|---|---|---|---|
| Kenney (Furniture Kit, City Kit, etc.) | https://kenney.nl/assets · https://poly.pizza/bundle/Furniture-Kit-NoG1sEUD1z | **CC0**, free; GLB included; 10–40 KB per model, flat-color low-poly | Chosen for the classroom pilot. Tiny, phone-safe, consistent style. |
| Quaternius | https://quaternius.com/faq.html | Each pack CC0 **or** "QAL" (free commercial, no resale of the pack); no attribution | Great for street props/characters/buildings; check each pack's license. |
| Poly Pizza | https://poly.pizza | Aggregator of Kenney/Quaternius/others; each model labelled CC0 or CC-BY (filter to CC0) | Easiest way to grab single models as GLB. |
| Poly Haven | https://polyhaven.com/license · https://api.polyhaven.com | **CC0** textures, HDRIs, models; free; API free incl. commercial (credit only if you use the *live API* to show assets; send a unique User-Agent) | Chosen for PBR floor/wall/wood. Best textures available free. |
| Sketchfab (CC-BY filter) | https://sketchfab.com/features/gltf | Free downloads under CC-BY need credit; avoid CC-BY-NC/ND/SA; download needs account | Good for hero props (globe, trophy, claw machine) — keep a credits list. Heavier files; budget each model. |
| Canva | — | Art only | Posters, signs, whiteboard writing, sky/windows — never objects painted on a wall. |

**Recommended scene route:** Kenney + Quaternius CC0 models for furniture/props/street furniture, Poly Haven CC0 PBR textures (WebP, 512–1024), Canva art only for flat things (posters, signs, whiteboard writing), 1–3 Sketchfab CC-BY hero props max with credits. Bake static props per material into single meshes to keep draw calls low on phones.
