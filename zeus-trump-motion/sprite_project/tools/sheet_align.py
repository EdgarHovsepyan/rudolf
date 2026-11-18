"""Clean neighbour fragments from keyed frames and measure pose (MediaPipe) for alignment."""
import sys, os, json, glob, cv2, numpy as np, mediapipe as mp
from mediapipe.tasks import python as mpt
from mediapipe.tasks.python import vision
d = sys.argv[1]; model = sys.argv[2]
opts = vision.PoseLandmarkerOptions(base_options=mpt.BaseOptions(model_asset_path=model), running_mode=vision.RunningMode.IMAGE,
                                    num_poses=1, min_pose_detection_confidence=0.2, min_pose_presence_confidence=0.2)
lm = vision.PoseLandmarker.create_from_options(opts)
NAMES = {0: 'nose', 11: 'l_shoulder', 12: 'r_shoulder', 13: 'l_elbow', 14: 'r_elbow', 15: 'l_wrist', 16: 'r_wrist', 19: 'l_index', 20: 'r_index', 23: 'l_hip', 24: 'r_hip'}
meta = json.load(open(os.path.join(d, 'frames.json')))
for fn, m in meta.items():
    if m['band'] == 'fx': continue
    p = os.path.join(d, fn); im = cv2.imread(p, cv2.IMREAD_UNCHANGED); a = im[..., 3]
    # keep the main figure + anything overlapping its box; drop fragments of neighbouring frames touching left/right edges
    n, lab, st, _ = cv2.connectedComponentsWithStats((a > 60).astype(np.uint8), 8)
    main = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
    mx0, my0, mw, mh = st[main, :4]
    keep = np.zeros_like(a, bool)
    for k in range(1, n):
        x, y, w, h, area = st[k]
        touches = x <= 2 or x + w >= a.shape[1] - 2
        inside = x >= mx0 - 10 and x + w <= mx0 + mw + 10
        if k == main or (inside and not touches) or (area > 0.02 * st[main, 4] and not touches):
            keep |= lab == k
    keep = cv2.dilate(keep.astype(np.uint8), np.ones((7, 7), np.uint8)).astype(bool)
    a2 = np.where(keep, a, 0).astype(np.uint8); im[..., 3] = a2; cv2.imwrite(p, im)
    # pose on a neutral grey composite with padding
    al = a2[..., None].astype(float) / 255; comp = (im[..., :3] * al + 128 * (1 - al)).astype(np.uint8)
    pad = 200; big = cv2.copyMakeBorder(comp, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=(128, 128, 128))
    r = lm.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(big, cv2.COLOR_BGR2RGB)))
    kp = {}
    if r.pose_landmarks:
        H, W = big.shape[:2]
        for i, nm in NAMES.items():
            q = r.pose_landmarks[0][i]; kp[nm] = [q.x * W - pad, q.y * H - pad, float(q.visibility)]
    ys, xs = np.where(a2 > 60)
    m['bbox'] = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
    m['kp'] = kp
json.dump(meta, open(os.path.join(d, 'frames.json'), 'w'), indent=1)
for fn, m in meta.items():
    if m['band'] == 'fx': continue
    k = m['kp']
    if not k: print(fn, 'NO POSE'); continue
    S = np.mean([k['l_shoulder'][:2], k['r_shoulder'][:2]], 0); Hh = np.mean([k['l_hip'][:2], k['r_hip'][:2]], 0)
    print(f"{fn:16s} torso={np.linalg.norm(S - Hh):6.1f} hip=({Hh[0]:6.1f},{Hh[1]:6.1f}) sh_w={abs(k['l_shoulder'][0]-k['r_shoulder'][0]):6.1f} hipvis={k['l_hip'][2]:.2f}")
