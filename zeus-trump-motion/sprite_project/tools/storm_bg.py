"""Procedural storm-sky background plate (original art): domain-warped fBm clouds, gold glow, lightning-lit flashes."""
import sys, os, json, numpy as np, cv2
out, tl_json = sys.argv[1], sys.argv[2]
TL = json.load(open(tl_json)); W, H, N = TL['W'], TL['H'], TL['n']
rng = np.random.default_rng(7)
def value_noise(h, w, cell):
    g = rng.random((h // cell + 3, w // cell + 3)).astype(np.float32)
    return cv2.resize(g, (w + 3 * cell, h + 3 * cell), interpolation=cv2.INTER_CUBIC)[:h, :w]
def fbm(h, w, base, oct=6):
    acc = np.zeros((h, w), np.float32); amp = 1.0; tot = 0
    for o in range(oct):
        acc += amp * value_noise(h, w, max(2, int(base / 2 ** o))); tot += amp; amp *= 0.55
    return acc / tot
PH, PW = H + 400, W + 600
n1 = fbm(PH, PW, 520); n2 = fbm(PH, PW, 300); warp = fbm(PH, PW, 640)
# billowy cumulus: 1-|2n-1| ridges, then lit from above via the vertical derivative
bil = 1 - np.abs(2 * n1 - 1)
litmap = np.clip(0.5 + 6.0 * (np.roll(n1, 6, axis=0) - n1), 0, 1)
os.makedirs(out, exist_ok=True)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
STRIKE = {15: .5, 16: .8, 17: 1.0, 18: .7, 19: .5, 76: .5, 77: .8, 78: 1.0, 79: .7, 80: .5}
def bloom(f):
    fl = 0.0
    if 20 <= f <= 25: fl = [1, .95, .85, .7, .5, .3][f - 20]
    if 79 <= f <= 84: fl = [.8, 1, .9, .7, .5, .3][f - 79]
    return fl
for f in range(N):
    t = f / 30.0
    ox, oy = int(160 + t * 22), int(120 + t * 6)
    w1 = cv2.remap(n1, (xx + ox + 60 * (warp[oy:oy + H, ox:ox + W] - .5)).astype(np.float32), (yy + oy).astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    w2 = n2[oy // 2:oy // 2 + H, (ox * 2) % 400:(ox * 2) % 400 + W]
    b1 = cv2.remap(bil, (xx + ox).astype(np.float32), (yy + oy).astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    lit = cv2.remap(litmap, (xx + ox).astype(np.float32), (yy + oy).astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    cloud = np.clip((0.55 * w1 + 0.25 * w2 + 0.35 * b1 - 0.52) * 2.2, 0, 1)
    w1 = 0.5 * w1 + 0.5 * lit
    # vertical gradient sky: deep indigo -> violet -> magenta-violet near the horizon
    v = yy / H
    sky = np.dstack([(46 + 70 * v), (10 + 22 * v), (18 + 60 * v)])          # BGR
    hand = TL['frames'][f]['hand']; chest = TL['frames'][f]['chest']
    # warm gold glow behind the hero (chest) and a cool glow at the charged hand
    gx, gy = chest[0], chest[1] - 120
    gold = np.exp(-(((xx - gx) / 420) ** 2 + ((yy - gy) / 520) ** 2))
    hx, hy = hand
    cool = np.exp(-(((xx - hx) / 260) ** 2 + ((yy - hy) / 260) ** 2)) * (0.35 if 26 <= f <= 84 else 0.0)
    flash = STRIKE.get(f, 0) * 0.35 + bloom(f) * 0.25
    lav = np.array([235, 170, 200], np.float32)                               # lavender highlight (BGR)
    shade = np.array([70, 25, 40], np.float32)
    c3 = cloud[..., None]
    img = sky * (1 - 0.85 * c3) + (shade + (lav - shade) * np.clip(w1[..., None] * 1.6 - 0.4, 0, 1)) * 0.85 * c3
    img += gold[..., None] * np.array([40, 140, 255], np.float32) * 0.55 * (0.6 + 0.4 * c3)
    img += cool[..., None] * np.array([255, 220, 120], np.float32) * 0.6
    img = img * (1 + flash * 1.4) + flash * np.array([90, 40, 60], np.float32)
    # god rays from behind the hero
    ang = np.arctan2(yy - gy, xx - gx); rays = (0.5 + 0.5 * np.cos(ang * 7 + t * 0.35)) ** 3
    rays = cv2.GaussianBlur((rays * gold).astype(np.float32), (0, 0), 18)
    img += (rays * 0.16)[..., None] * np.array([60, 170, 255], np.float32)
    vign = 1 - 0.55 * (((xx - W / 2) / (W * 0.75)) ** 2 + ((yy - H * 0.45) / (H * 0.7)) ** 2)
    img = cv2.GaussianBlur(img.astype(np.float32), (0, 0), 2.2)            # background depth-of-field softness
    img = np.clip(img * np.clip(vign, 0.35, 1)[..., None], 0, 255).astype(np.uint8)
    cv2.imwrite(os.path.join(out, f'bg_{f + 1:03d}.png'), img)
print('bg frames', N)
