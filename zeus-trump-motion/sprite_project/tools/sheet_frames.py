"""Crop every animation frame + effect asset from the sheet, Real-ESRGAN x4, green-screen key + despill -> RGBA PNGs."""
import sys, os, json, cv2, numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from esrgan import upscale
sheet, boxes_json, out = sys.argv[1:4]
im = cv2.imread(sheet); B = json.load(open(boxes_json))
def key(bgr):
    f = bgr.astype(np.float32); b, g, r = f[..., 0], f[..., 1], f[..., 2]
    d = g - np.maximum(r, b)                              # green dominance
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    alpha = 1.0 - np.clip((d - 18.0) / (70.0 - 18.0), 0, 1)
    alpha = cv2.GaussianBlur(alpha, (0, 0), 0.8)
    # despill: clamp green to the brighter of red/blue wherever it dominates
    g2 = np.where(d > 0, np.maximum(r, b) + 0.15 * np.clip(d, 0, 20), g)
    rgb = np.dstack([b, g2, r])
    a = (alpha * 255).astype(np.uint8)
    return np.dstack([np.clip(rgb, 0, 255).astype(np.uint8), a])
os.makedirs(out, exist_ok=True); meta = {}
for name, boxes in B.items():
    for i, (x0, y0, x1, y1) in enumerate(boxes):
        P = 6
        crop = im[max(0, y0 - P):min(im.shape[0], y1 + 2), max(0, x0 - P):min(im.shape[1], x1 + P)]
        up = upscale(crop); rgba = key(up)
        fn = f'{name}_{i + 1:02d}.png'; cv2.imwrite(os.path.join(out, fn), rgba)
        meta[fn] = {'band': name, 'index': i + 1, 'sheet_box': [int(max(0, x0 - P)), int(max(0, y0 - P)), int(min(im.shape[1], x1 + P)), int(min(im.shape[0], y1 + 2))], 'size': [int(rgba.shape[1]), int(rgba.shape[0])]}
# effect assets row (bottom-left band)
hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
fg = ~((hsv[..., 0] >= 35) & (hsv[..., 0] <= 85) & (hsv[..., 1] >= 90) & (hsv[..., 2] >= 60))
y0, y1, x0, x1 = 800, 935, 0, 1040
col = fg[y0:y1, x0:x1].sum(axis=0); occ = col > 2; runs = []; i = 0
while i < len(occ):
    if occ[i]:
        j = i
        while j < len(occ) and occ[j]: j += 1
        if j - i > 20: runs.append((i, j))
        i = j
    else: i += 1
for k, (a, b) in enumerate(runs):
    sub = fg[y0:y1, x0 + a:x0 + b]; ys = np.where(sub.any(axis=1))[0]
    crop = im[y0 + ys[0] - 4:y0 + ys[-1] + 5, x0 + a - 4:x0 + b + 4]
    up = upscale(crop); rgba = key(up)
    fn = f'fx_{k + 1:02d}.png'; cv2.imwrite(os.path.join(out, fn), rgba); meta[fn] = {'band': 'fx', 'index': k + 1, 'size': [int(rgba.shape[1]), int(rgba.shape[0])]}
json.dump(meta, open(os.path.join(out, 'frames.json'), 'w'), indent=1)
print(len(meta), 'assets;', 'fx runs:', len(runs))
