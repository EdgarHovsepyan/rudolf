"""Per-frame VFX timing on the excerpt: white-bloom coverage over the character (flash_ratio.json)
and strike / held-bolt brightness bands (vfx_timing.json)."""
import sys, json, glob, cv2, numpy as np
frames_dir, out_flash, out_vfx = sys.argv[1:4]
fs = sorted(glob.glob(frames_dir + '/*.png')); flash, vfx = [], []
for i, f in enumerate(fs):
    im = cv2.imread(f); g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY); hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
    flash.append(float((cv2.imread(f, cv2.IMREAD_GRAYSCALE)[250:1100, 80:420] > 235).mean()))   # bloom coverage on the body
    top = hsv[100:330, :]
    vfx.append({'frame': i, 'strike_band': float((g[0:330, 120:380] > 240).mean()),   # vertical strike / raised bolt above head
                'cyan': float(((top[..., 0] > 80) & (top[..., 0] < 110) & (top[..., 2] > 220) & (top[..., 1] > 40)).mean())})
json.dump(flash, open(out_flash, 'w')); json.dump(vfx, open(out_vfx, 'w'))
print('bloom frames (>0.12):', [i for i, v in enumerate(flash) if v > 0.12])
