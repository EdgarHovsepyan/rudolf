"""Turn raw MediaPipe keypoints into a clean per-frame motion track (angles + root) for retargeting.
Flash frames (pose hidden by white bloom) are filled by angle-space interpolation between reliable frames."""
import json, sys, math, numpy as np
src, flash_json, out = sys.argv[1], sys.argv[2], sys.argv[3]
d = json.load(open(src)); flash = json.load(open(flash_json))
N = len(d['frames'])
J = ['nose','l_eye','r_eye','l_ear','r_ear','l_shoulder','r_shoulder','l_elbow','r_elbow','l_wrist','r_wrist','l_index','r_index','l_hip','r_hip','l_knee','r_knee','l_ankle','r_ankle']
P = np.full((N, len(J), 3), np.nan)
for i, fr in enumerate(d['frames']):
    for j, n in enumerate(J):
        if n in fr['kp']: P[i, j] = fr['kp'][n]
idx = {n: j for j, n in enumerate(J)}
# reliability: frames under the white flash are unreliable for every joint
flash = np.array(flash)
bad = flash > 0.12           # full-body white bloom (crackle during the hold stays < 0.08)
bad = bad | np.roll(bad, 1) | np.roll(bad, -1)   # bloom ramps
bad = bad | ((flash > 0.07) & (np.roll(flash, -2) > 0.12))  # strike frames right before the bloom
# the vertical strike bolt crosses the body for 2 frames before each bloom; MediaPipe reads it as a raised forearm
starts = [i for i in range(1, N) if bad[i] and not bad[i - 1]]
for st in starts:
    bad[max(0, st - 2):st] = True
bad_frames = [int(i) for i in np.where(bad)[0]]

def pt(i, n): return P[i, idx[n], :2]
def ang(a, b):  # world angle of vector a->b, degrees, 0 = pointing down (+y), positive = counter-clockwise on screen
    v = b - a; return math.degrees(math.atan2(-v[0], v[1]))
def mid(a, b): return (a + b) / 2

ch = {k: np.full(N, np.nan) for k in ['root_x','root_y','scale','torso','sh_w','head_x','head_y','head_roll','neck_len',
      'l_upper','l_fore','l_hand','r_upper','r_fore','r_hand','l_thigh','l_shin','r_thigh','r_shin',
      'l_elbow_bend','r_elbow_bend']}
for i in range(N):
    if bad[i]: continue
    ls, rs, lh, rh = pt(i,'l_shoulder'), pt(i,'r_shoulder'), pt(i,'l_hip'), pt(i,'r_hip')
    S, H = mid(ls, rs), mid(lh, rh)
    ch['root_x'][i], ch['root_y'][i] = H
    ch['scale'][i] = np.linalg.norm(S - H)
    ch['torso'][i] = ang(H, S) - 180.0  # 0 when shoulders straight above hips
    ch['sh_w'][i] = np.linalg.norm(ls - rs)
    nose, le, re = pt(i,'nose'), pt(i,'l_eye'), pt(i,'r_eye')
    ch['head_x'][i], ch['head_y'][i] = (nose - S)
    v = le - re; ch['head_roll'][i] = math.degrees(math.atan2(v[1], v[0]))
    ch['neck_len'][i] = np.linalg.norm(nose - S)
    for s in 'lr':
        sh, el, wr, ix = pt(i,f'{s}_shoulder'), pt(i,f'{s}_elbow'), pt(i,f'{s}_wrist'), pt(i,f'{s}_index')
        ch[f'{s}_upper'][i] = ang(sh, el); ch[f'{s}_fore'][i] = ang(el, wr); ch[f'{s}_hand'][i] = ang(wr, ix)
        hp, kn, an = pt(i,f'{s}_hip'), pt(i,f'{s}_knee'), pt(i,f'{s}_ankle')
        ch[f'{s}_thigh'][i] = ang(hp, kn); ch[f'{s}_shin'][i] = ang(kn, an)
# per-channel outlier rejection (MediaPipe sometimes swaps arms for a frame): circular median of +-3 good frames
def circ_med(vals):
    best=None
    for c in vals:
        e=sum(abs((v-c+180)%360-180) for v in vals)
        if best is None or e<best[0]: best=(e,c)
    return best[1]
ANG0 = {'torso','head_roll','l_upper','l_fore','l_hand','r_upper','r_fore','r_hand','l_thigh','l_shin','r_thigh','r_shin'}
rejected = {}
for k in ANG0:
    a = ch[k]; gi = [i for i in range(N) if not np.isnan(a[i])]
    rej=[]
    for n_, i in enumerate(gi):
        nb = [a[j] for j in gi[max(0,n_-3):n_+4] if j != i]
        if len(nb) >= 3 and abs((a[i]-circ_med(nb)+180)%360-180) > 40: rej.append(i)
    for i in rej: a[i] = np.nan
    rejected[k] = rej
print('outliers rejected:', {k:v for k,v in rejected.items() if v})
# unwrap angles over reliable frames, interpolate gaps, smooth
from numpy import interp
def fill(a, is_angle):
    a = a.copy(); good = ~np.isnan(a)
    gi = np.where(good)[0]
    if is_angle:
        a[gi] = np.degrees(np.unwrap(np.radians(a[gi])))
    # smoothstep interpolation across gaps (ease in/out like an animator's in-between)
    out = a.copy()
    for k in range(len(gi) - 1):
        i0, i1 = gi[k], gi[k+1]
        if i1 - i0 > 1:
            for i in range(i0+1, i1):
                t = (i - i0) / (i1 - i0); t = t*t*(3-2*t)
                out[i] = a[i0] + (a[i1]-a[i0]) * t
    out[:gi[0]] = a[gi[0]]; out[gi[-1]+1:] = a[gi[-1]]
    return out
def gsmooth(a, sigma):
    if sigma <= 0: return a
    r = int(3*sigma); k = np.exp(-0.5*(np.arange(-r, r+1)/sigma)**2); k /= k.sum()
    p = np.pad(a, r, mode='edge'); return np.convolve(p, k, 'valid')
SIG = {'l_bendW':1.5,'r_bendW':1.5,'root_x':2.0,'root_y':2.0,'scale':3.0,'sh_w':2.0,'torso':1.5,'head_x':1.0,'head_y':1.0,'head_roll':1.5,'neck_len':1.5,
       'l_thigh':3.0,'l_shin':3.0,'r_thigh':3.0,'r_shin':3.0,'l_hand':1.5,'r_hand':1.5}
ANG = {'torso','head_roll','l_upper','l_fore','l_hand','r_upper','r_fore','r_hand','l_thigh','l_shin','r_thigh','r_shin'}
res = {}
# forearms/hands are filled as angles RELATIVE to their parent bone (elbow bend, wrist bend), so a gap
# in-between rotates the joint the anatomical way instead of the shortest absolute way through the body
wrap = lambda x: (x + 180.0) % 360.0 - 180.0
for s_ in 'lr':
    ch[f'{s_}_bendE'] = np.where(np.isnan(ch[f'{s_}_fore']) | np.isnan(ch[f'{s_}_upper']), np.nan, wrap(ch[f'{s_}_fore'] - ch[f'{s_}_upper']))
    ch[f'{s_}_bendW'] = np.where(np.isnan(ch[f'{s_}_hand']) | np.isnan(ch[f'{s_}_fore']), np.nan, wrap(ch[f'{s_}_hand'] - ch[f'{s_}_fore']))
for k, a in ch.items():
    if k.endswith('_bend') or k.endswith('_fore') or k.endswith('_hand'): continue
    f = fill(a, k in ANG or k.endswith('_bendE') or k.endswith('_bendW'))
    res[k] = gsmooth(f, SIG.get(k, 1.0))
for s_ in 'lr':
    res[f'{s_}_fore'] = res[f'{s_}_upper'] + res[f'{s_}_bendE']
    res[f'{s_}_hand'] = res[f'{s_}_fore'] + res[f'{s_}_bendW']
    res[f'{s_}_elbow_bend'] = res[f'{s_}_bendE']
# raw joint positions (for overlays / comparison), filled + lightly smoothed
raw = {}
for n in J:
    xs, ys = P[:, idx[n], 0].copy(), P[:, idx[n], 1].copy()
    xs[bad] = np.nan; ys[bad] = np.nan
    raw[n] = [list(map(float, gsmooth(fill(xs, False), 1.0))), list(map(float, gsmooth(fill(ys, False), 1.0)))]
json.dump({'fps': 30, 'n': N, 'w': d['w'], 'h': d['h'], 'flash_frames': bad_frames, 'flash_ratio': list(map(float, flash)),
           'outliers': rejected, 'channels': {k: [round(float(x), 3) for x in v] for k, v in res.items()}, 'joints': raw}, open(out, 'w'))
print('bad frames:', bad_frames)
for k in ['torso','l_upper','l_fore','r_upper','r_fore','head_roll']:
    v = res[k]; print(f"{k:10s} " + ' '.join(f'{x:6.0f}' for x in v[::6]))
