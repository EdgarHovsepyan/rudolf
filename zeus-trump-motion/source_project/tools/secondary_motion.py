"""Secondary-motion timing from dense optical flow in body-relative regions (head/beard, held prop, cape/robe hem)."""
import sys, json, glob, cv2, numpy as np
frames_dir, motion_json, out = sys.argv[1], sys.argv[2], sys.argv[3]
m = json.load(open(motion_json)); J = m['joints']
fs = sorted(glob.glob(frames_dir + '/*.png'))
prev = None; rows = []
for i, f in enumerate(fs):
    g = cv2.cvtColor(cv2.imread(f), cv2.COLOR_BGR2GRAY)
    if prev is None: prev = g; rows.append({'frame': 0}); continue
    flow = cv2.calcOpticalFlowFarneback(prev, g, None, 0.5, 3, 21, 3, 5, 1.1, 0)
    mag = np.linalg.norm(flow, axis=2); H, W = g.shape
    def box(cx, cy, x0, x1, y0, y1):
        a = mag[int(max(0, cy+y0)):int(min(H, cy+y1)), int(max(0, cx+x0)):int(min(W, cx+x1))]
        return float(np.median(a)) if a.size else 0.0, float(np.percentile(a, 90)) if a.size else 0.0
    nx, ny = J['nose'][0][i], J['nose'][1][i]
    hx = (J['l_hip'][0][i] + J['r_hip'][0][i]) / 2; hy = (J['l_hip'][1][i] + J['r_hip'][1][i]) / 2
    lwx, lwy = J['l_wrist'][0][i], J['l_wrist'][1][i]
    sx = (J['l_shoulder'][0][i] + J['r_shoulder'][0][i]) / 2; sy = (J['l_shoulder'][1][i] + J['r_shoulder'][1][i]) / 2
    r = {'frame': i}
    r['head_beard'] = box(nx, ny, -70, 70, -90, 110)
    r['torso'] = box(sx, sy, -60, 60, 20, 180)
    r['held_prop'] = box(lwx, lwy, -120, 120, -120, 60)
    r['cape_left'] = box(hx, hy, -200, -60, 0, 420)
    r['cape_right'] = box(hx, hy, 60, 200, 0, 420)
    r['global'] = (float(np.median(mag)), float(np.percentile(mag, 90)))
    rows.append(r); prev = g
json.dump(rows, open(out, 'w'))
keys = ['head_beard', 'torso', 'held_prop', 'cape_left', 'cape_right', 'global']
print('frame ' + ' '.join(f'{k[:10]:>10s}' for k in keys))
for r in rows[1::3]:
    print(f"{r['frame']:5d} " + ' '.join(f"{r[k][1]:10.2f}" for k in keys))
