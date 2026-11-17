import sys, json, cv2, glob, numpy as np
frames_dir, kp_json, out, step = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
key = sys.argv[5] if len(sys.argv) > 5 else 'kp'
d = json.load(open(kp_json))
E = [('l_shoulder','r_shoulder'),('l_shoulder','l_elbow'),('l_elbow','l_wrist'),('r_shoulder','r_elbow'),('r_elbow','r_wrist'),
     ('l_shoulder','l_hip'),('r_shoulder','r_hip'),('l_hip','r_hip'),('l_hip','l_knee'),('r_hip','r_knee'),('l_knee','l_ankle'),('r_knee','r_ankle'),('nose','neck')]
files = sorted(glob.glob(frames_dir + '/*.png'))
tiles = []
for i in range(0, len(files), step):
    img = cv2.imread(files[i]); kp = dict(d['frames'][i][key])
    if 'l_shoulder' in kp and 'neck' not in kp:
        kp['neck'] = [(kp['l_shoulder'][0]+kp['r_shoulder'][0])/2, (kp['l_shoulder'][1]+kp['r_shoulder'][1])/2, 1]
    for a, b in E:
        if a in kp and b in kp:
            col = (0,255,0) if a.startswith('l_') else ((0,128,255) if a.startswith('r_') else (255,255,0))
            cv2.line(img, tuple(int(v) for v in kp[a][:2]), tuple(int(v) for v in kp[b][:2]), col, 4)
    for n, p in kp.items():
        cv2.circle(img, (int(p[0]), int(p[1])), 7, (0,0,255), -1)
    cv2.putText(img, str(i), (10, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.4, (255,255,255), 3)
    tiles.append(cv2.resize(img, (240, 600)))
while len(tiles) % 8: tiles.append(np.zeros_like(tiles[0]))
rows = [np.hstack(tiles[r:r+8]) for r in range(0, len(tiles), 8)]
cv2.imwrite(out, np.vstack(rows))
