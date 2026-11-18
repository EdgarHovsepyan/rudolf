"""Split the user's tech-art sheet into animation frames (green-screen bands), report boxes + debug overlay."""
import cv2, numpy as np, json, sys, os
src, outdir = sys.argv[1], sys.argv[2]
im = cv2.imread(src); hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
H, S, V = [hsv[..., i].astype(int) for i in range(3)]
green = (H >= 35) & (H <= 85) & (S >= 90) & (V >= 60)
fg = ~green
BANDS = {  # name: (y0, y1, x0, x1, expected count, label box to ignore (x1,y1))
    'idle':     (26, 176, 0, 1088, 8, (190, 28)),
    'raise':    (204, 364, 0, 1088, 10, (240, 212)),
    'cast':     (402, 552, 0, 1088, 12, (300, 410)),
    'recovery': (598, 748, 0, 1088, 8, (262, 600)),
}
res = {}; dbg = im.copy()
for name, (y0, y1, x0, x1, n, (lx, ly)) in BANDS.items():
    m = fg[y0:y1, x0:x1].copy()
    m[:max(0, ly - y0), :lx] = False
    m = cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)).astype(bool)
    col = m.sum(axis=0).astype(float)
    k = np.ones(9) / 9; cs = np.convolve(col, k, 'same')
    # occupied column runs; split the widest run at its deepest valley until there are n, merge closest if too many
    occ = cs > 2
    runs = []; i = 0
    while i < len(occ):
        if occ[i]:
            j = i
            while j < len(occ) and occ[j]: j += 1
            runs.append([i, j]); i = j
        else: i += 1
    runs = [r for r in runs if r[1] - r[0] > 12]
    while len(runs) < n:
        w = max(range(len(runs)), key=lambda q: runs[q][1] - runs[q][0]); ra, rb = runs[w]
        c = ra + 25 + int(np.argmin(cs[ra + 25:rb - 25])); runs[w:w + 1] = [[ra, c], [c, rb]]
    while len(runs) > n:
        g = min(range(len(runs) - 1), key=lambda q: runs[q + 1][0] - runs[q][1]); runs[g:g + 2] = [[runs[g][0], runs[g + 1][1]]]
    edges = None
    boxes = []
    for i in range(n):
        xa, xb = runs[i][0], runs[i][1]
        sub = m[:, xa:xb]; ys = np.where(sub.any(axis=1))[0]
        boxes.append([int(x0 + xa), int(y0 + ys[0]), int(x0 + xb), int(y0 + ys[-1] + 1)])
        cv2.rectangle(dbg, (x0 + xa, y0 + ys[0]), (x0 + xb, y0 + ys[-1]), (0, 0, 255), 1)
    res[name] = boxes
    print(name, [b[2] - b[0] for b in boxes])
json.dump(res, open(os.path.join(outdir, 'boxes.json'), 'w'), indent=1)
cv2.imwrite(os.path.join(outdir, 'boxes_debug.png'), dbg[:760, :1090])
