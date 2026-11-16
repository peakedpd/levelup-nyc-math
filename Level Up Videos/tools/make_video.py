"""Level Up teaching video: 'Times As Many' (4.OA.A.1) — code-animated explainer.
Frames drawn with PIL, narration by Piper (en_US-lessac-medium), muxed with ffmpeg."""
import subprocess, wave, math, os, json
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 1280, 720, 24
R = "/home/claude/levelup-nyc-math/"
FB = "/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf"
FR = "/usr/share/fonts/truetype/google-fonts/Poppins-Medium.ttf"
F = lambda s, b=True: ImageFont.truetype(FB if b else FR, s)
NAVY = (20, 18, 58); GOLD = (255, 210, 63); WHITE = (255, 255, 255)
MC = [(43, 217, 255), (255, 59, 212), (255, 210, 63), (109, 255, 107), (255, 107, 59)]
os.makedirs("out", exist_ok=True); os.makedirs("frames", exist_ok=True)

bg = Image.open(R + "img/lua_classroom.webp").convert("RGB").resize((W, H)).filter(ImageFilter.GaussianBlur(6))
bg = Image.blend(bg, Image.new("RGB", (W, H), (30, 26, 70)), .35)
T = {k: Image.open(R + f"tex/teacher_{k}.webp").convert("RGBA") for k in ["front", "talk", "wave"]}
for k in T: T[k] = T[k].resize((int(T[k].width * 560 / T[k].height), 560), Image.LANCZOS)

SCENES = [
 ("title", "Hi friends! I'm Ms. Okafor. Today we're learning what times as many means."),
 ("kai", "Kai has 3 marbles. Let's count them. One, two, three."),
 ("groups", "Theo has 4 times as many marbles as Kai. That means Theo has 4 groups, and each group is the same size as Kai's. 3 marbles in every group."),
 ("skip", "Let's skip count by threes. 3, 6, 9, 12. Four groups of three is four times three, which equals twelve."),
 ("bar", "We can draw a bar model too. Kai's bar is 3. Theo's bar is 4 copies of Kai's bar. 4 times 3 equals 12."),
 ("careful", "Careful! Times as many is not the same as more than. 4 more than 3 is 7. But 4 times as many as 3 is 12."),
 ("turn", "Your turn! Maya has 5 stickers. Leo has 3 times as many stickers as Maya. How many stickers does Leo have? Pause the video and solve it!"),
 ("answer", "Did you get 15? Leo has 3 groups of 5. 3 times 5 equals 15. Awesome thinking!"),
 ("outro", "Remember, times as many means multiply. Now go play and level up!"),
]
PAUSE = {"turn": 5.0}

def tts(text, path):
    subprocess.run(["python3", "-m", "piper", "-m", "en_US-lessac-medium.onnx", "-f", path,
                    "--length-scale", "1.08", "--sentence-silence", "0.25"], input=text.encode(), check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    with wave.open(path) as w: return w.getnframes() / w.getframerate()

def marble(d, x, y, r, c):
    d.ellipse([x - r, y - r, x + r, y + r], fill=c, outline=NAVY, width=3)
    d.ellipse([x - r * .45, y - r * .6, x - r * .05, y - r * .2], fill=(255, 255, 255))

def ease(t): t = max(0, min(1, t)); return t * t * (3 - 2 * t)

def ctext(d, xy, s, f, fill=NAVY, anchor="mm"): d.text(xy, s, font=f, fill=fill, anchor=anchor)

def wrap(d, s, f, maxw):
    ws, ls, cur = s.split(), [], ""
    for w_ in ws:
        if d.textlength(cur + " " + w_, font=f) > maxw and cur: ls.append(cur); cur = w_
        else: cur = (cur + " " + w_).strip()
    return ls + [cur]

def board(img, kind, t, dur):
    """Right-hand teaching board. t = seconds into scene."""
    d = ImageDraw.Draw(img)
    bx0, by0, bx1, by1 = 470, 60, 1240, 560
    d.rounded_rectangle([bx0, by0, bx1, by1], 28, fill=(255, 248, 232), outline=NAVY, width=6)
    cx = (bx0 + bx1) // 2
    if kind == "title":
        ctext(d, (cx, 190), "LEVEL UP VIDEOS", F(34), (120, 90, 200))
        ctext(d, (cx, 270), "Times As Many", F(72))
        ctext(d, (cx, 350), "4.OA.A.1 · Multiplicative comparison", F(26, False), (90, 90, 120))
        for i in range(5):
            k = ease((t - .5 - i * .25) / .4); marble(d, cx - 160 + i * 80, 450 - 30 * k + 30, int(26 * k) + 1, MC[i])
    elif kind == "kai":
        ctext(d, (cx, 120), "Kai has 3 marbles", F(46))
        for i in range(3):
            k = ease((t - 1.6 - i * .8) / .4)
            if k > 0: marble(d, cx - 140 + i * 140, 320, int(48 * k), MC[i])
            if k >= 1: ctext(d, (cx - 140 + i * 140, 410), str(i + 1), F(40), (120, 90, 200))
        ctext(d, (cx, 500), "KAI", F(36), (90, 90, 120))
    elif kind in ("groups", "skip"):
        ctext(d, (cx, 105), "Theo has 4 times as many" if kind == "groups" else "4 groups of 3 = 4 × 3", F(42))
        # Kai reference
        d.text((bx0 + 30, 150), "Kai", font=F(26), fill=(90, 90, 120))
        for i in range(3): marble(d, bx0 + 50 + i * 40, 205, 16, MC[i])
        gw = 160
        for g in range(4):
            gx = bx0 + 175 + g * (gw + 22)
            k = 1 if kind == "skip" else ease((t - 3.0 - g * 1.0) / .5)
            if k <= 0: continue
            hl = kind == "skip" and t > 1.2 + g * .95
            d.rounded_rectangle([gx, 250, gx + gw, 410], 22, fill=(255, 235, 150) if hl else WHITE, outline=NAVY, width=4)
            for i in range(3): marble(d, gx + 38 + i * 42, 330 - int((1 - k) * 60), 17, MC[(g + i) % 5])
            ctext(d, (gx + gw // 2, 440), f"group {g + 1}", F(22, False), (90, 90, 120))
            if kind == "skip" and hl: ctext(d, (gx + gw // 2, 230), str(3 * (g + 1)), F(40), (200, 40, 120))
        if kind == "skip" and t > 6.2:
            ctext(d, (cx, 505), "4 × 3 = 12", F(56), (30, 140, 70))
        if kind == "groups" and t > 7.5:
            ctext(d, (cx, 505), "Each group has 3 — same as Kai", F(30), (120, 90, 200))
    elif kind == "bar":
        ctext(d, (cx, 115), "Bar model", F(46))
        u = 120
        d.text((bx0 + 40, 200), "Kai", font=F(30), fill=NAVY)
        k = ease((t - 1.2) / .6); d.rectangle([bx0 + 150, 190, bx0 + 150 + int(u * k), 250], fill=(43, 217, 255), outline=NAVY, width=4)
        if k >= 1: ctext(d, (bx0 + 150 + u // 2, 220), "3", F(30))
        d.text((bx0 + 40, 320), "Theo", font=F(30), fill=NAVY)
        for i in range(4):
            k = ease((t - 3.6 - i * .7) / .4)
            if k <= 0: continue
            x = bx0 + 150 + i * u
            d.rectangle([x, 310, x + int(u * k), 370], fill=(255, 59, 212), outline=NAVY, width=4)
            if k >= 1: ctext(d, (x + u // 2, 340), "3", F(30), WHITE)
        if t > 7:
            d.line([bx0 + 150, 400, bx0 + 150 + 4 * u, 400], fill=NAVY, width=4)
            ctext(d, (bx0 + 150 + 2 * u, 440), "? = 12", F(40), (200, 40, 120))
            ctext(d, (cx, 510), "4 × 3 = 12", F(48), (30, 140, 70))
    elif kind == "careful":
        ctext(d, (cx, 110), "Careful!", F(54), (220, 60, 40))
        d.line([cx, 170, cx, 520], fill=(200, 190, 170), width=4)
        if t > 2.5:
            ctext(d, (cx - 190, 200), "4 MORE than 3", F(32)); ctext(d, (cx - 190, 290), "3 + 4 = 7", F(52), (90, 90, 120))
            for i in range(7): marble(d, cx - 330 + i * 40, 390, 15, MC[0] if i < 3 else (200, 200, 200))
            ctext(d, (cx - 190, 470), "add", F(28, False), (90, 90, 120))
        if t > 5.2:
            ctext(d, (cx + 190, 200), "4 TIMES as many", F(32)); ctext(d, (cx + 190, 290), "4 × 3 = 12", F(52), (30, 140, 70))
            for g in range(4):
                for i in range(3): marble(d, cx + 70 + g * 62 + (i % 2) * 22, 370 + (i // 2) * 30 + (i == 2) * 0, 12, MC[g + 1])
            ctext(d, (cx + 190, 470), "multiply", F(28, False), (90, 90, 120))
    elif kind == "turn":
        ctext(d, (cx, 110), "Your turn!", F(56), (120, 90, 200))
        ls = wrap(d, "Maya has 5 stickers. Leo has 3 times as many stickers as Maya. How many stickers does Leo have?", F(34), 680)
        for i, l in enumerate(ls): ctext(d, (cx, 200 + i * 52), l, F(34))
        left = dur - t
        if left < PAUSE["turn"] + .2:
            n = max(1, math.ceil(left))
            ctext(d, (cx, 440), "⏸  Pause and solve!", F(36), (220, 60, 40))
            d.ellipse([cx - 45, 470, cx + 45, 545], fill=GOLD, outline=NAVY, width=4); ctext(d, (cx, 507), str(n), F(44))
    elif kind == "answer":
        ctext(d, (cx, 110), "Answer: 15 stickers", F(50), (30, 140, 70))
        for g in range(3):
            k = ease((t - 1.5 - g * .8) / .4)
            if k <= 0: continue
            gx = bx0 + 90 + g * 220
            d.rounded_rectangle([gx, 200, gx + 190, 330], 22, fill=WHITE, outline=NAVY, width=4)
            for i in range(5):
                x, y = gx + 30 + (i % 3) * 65, 235 + (i // 3) * 55
                d.regular_polygon((x, y, 22), 5, fill=GOLD, outline=NAVY)
        if t > 4: ctext(d, (cx, 420), "3 groups of 5 = 3 × 5 = 15", F(44))
    elif kind == "outro":
        ctext(d, (cx, 220), "Times as many", F(60)); ctext(d, (cx, 300), "= MULTIPLY", F(70), (200, 40, 120))
        ctext(d, (cx, 420), "Now go play and LEVEL UP! ⭐", F(40), (120, 90, 200))

def frame(kind, t, dur, speaking, cap):
    img = bg.copy()
    board(img, kind, t, dur)
    # teacher: wave in title/outro, otherwise talk/front flap while speaking
    pose = "wave" if kind in ("title", "outro") and t < 2.5 else ("talk" if speaking and int(t * 5) % 2 == 0 else "front")
    tp = T[pose]; bob = int(math.sin(t * 2.2) * 4)
    img.paste(tp, (40, H - tp.height - 10 + bob), tp)
    d = ImageDraw.Draw(img)
    # caption
    if cap:
        ls = wrap(d, cap, F(26, False), 1100)[:3]
        y0 = H - 40 - 38 * len(ls)
        d.rounded_rectangle([60, y0 - 14, W - 60, H - 22], 18, fill=(20, 18, 58, 220))
        for i, l in enumerate(ls): ctext(d, (W // 2, y0 + 16 + i * 38), l, F(26, False), WHITE)
    d.text((24, 16), "LEVEL UP VIDEOS", font=F(18), fill=GOLD)
    return img

# ---- build ----
audio_parts, n = [], 0
for si, (kind, line) in enumerate(SCENES):
    wavp = f"out/s{si}.wav"; sd = tts(line, wavp)
    dur = sd + .7 + PAUSE.get(kind, 0)
    sil = dur - sd
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wavp, "-af", f"apad=pad_dur={sil}", "-ar", "22050", "-ac", "1", f"out/p{si}.wav"], check=True)
    audio_parts.append(f"out/p{si}.wav")
    words = line.split(); nf = int(dur * FPS)
    for f in range(nf):
        t = f / FPS; speaking = t < sd
        # caption shows the sentence being spoken (approx by time fraction)
        k = min(len(words), int(len(words) * min(1, t / max(sd, .1))) + 8)
        cap = " ".join(words[max(0, k - 22):k]) if speaking else (line if len(line) < 120 else "")
        frame(kind, t, dur, speaking, cap).save(f"frames/{n:05d}.jpg", quality=88); n += 1
    print(kind, round(dur, 1), "s")
with open("out/list.txt", "w") as fh:
    for p in audio_parts: fh.write(f"file '{os.path.abspath(p)}'\n")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", "out/list.txt", "out/narration.wav"], check=True)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", "frames/%05d.jpg", "-i", "out/narration.wav",
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "22", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-shortest",
                "times_as_many_explainer.mp4"], check=True)
print("frames", n)
