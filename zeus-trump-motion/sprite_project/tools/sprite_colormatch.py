"""Reduce colour flicker between sheet drawings: match each sprite's body colour stats (Lab, glow excluded) to the idle median."""
import sys, os, glob, cv2, numpy as np
src_dir, dst_dir = sys.argv[1], sys.argv[2]
def stats(im):
    a = im[..., 3] > 200; lab = cv2.cvtColor(im[..., :3], cv2.COLOR_BGR2LAB).astype(np.float32)
    glow = (lab[..., 0] > 235) | ((im[..., 0].astype(int) > 200) & (im[..., 2].astype(int) < 170))   # bright / cyan glow pixels
    m = a & ~glow
    return lab, m, np.array([lab[..., c][m].mean() for c in range(3)])
files = sorted(glob.glob(os.path.join(dst_dir, '*.png')))
ref = np.median([stats(cv2.imread(f.replace(dst_dir, src_dir), cv2.IMREAD_UNCHANGED))[2] for f in files if os.path.basename(f).startswith('idle_')], axis=0)
for f in files:
    im = cv2.imread(os.path.join(src_dir, os.path.basename(f)), cv2.IMREAD_UNCHANGED)
    lab, m, mu = stats(im)
    shift = (ref - mu) * np.array([0.6, 1.0, 1.0])
    lab2 = lab.copy()
    w = (im[..., 3].astype(np.float32) / 255)[..., None]
    lab2 += shift * w
    out = cv2.cvtColor(np.clip(lab2, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)
    cv2.imwrite(f, np.dstack([out, im[..., 3]]))
    print(os.path.basename(f), 'shift L/a/b', np.round(shift, 1))
