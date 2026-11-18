"""Build the 90-frame sprite timeline (reference beats) with per-row scale + hip alignment, and FX anchor points."""
import json, os, sys, shutil, numpy as np
d, out_dir = sys.argv[1], sys.argv[2]
W, H = 720, 1280
meta = json.load(open(os.path.join(d, 'frames.json')))
def kp(fn): return meta[fn]['kp']
def hipc(fn): k = kp(fn); return np.mean([k['l_hip'][:2], k['r_hip'][:2]], 0)
def shc(fn): k = kp(fn); return np.mean([k['l_shoulder'][:2], k['r_shoulder'][:2]], 0)
def torso(fn): return float(np.linalg.norm(shc(fn) - hipc(fn)))
rows = {'idle': [f'idle_{i:02d}.png' for i in range(1, 9)], 'raise': [f'raise_{i:02d}.png' for i in range(1, 11)],
        'cast': [f'cast_{i:02d}.png' for i in range(1, 13)], 'recovery': [f'recovery_{i:02d}.png' for i in range(1, 9)]}
T_TARGET = 410.0
row_scale = {'idle': T_TARGET / np.median([torso(f) for f in rows['idle']]),
             'raise': T_TARGET / np.median([torso(f) for f in rows['raise'][3:]]),
             'cast': T_TARGET / np.median([torso(f) for f in rows['cast'][:4]]),
             'recovery': T_TARGET / np.median([torso(f) for f in rows['recovery'][3:]])}
# sequence on the reference beats (excerpt frames @30 fps)
seq = []
seq += [f'idle_{1 + i // 2:02d}.png' for i in range(16)]                       # 0-15 idle
seq += ['idle_01.png', 'idle_01.png', 'idle_02.png', 'idle_02.png']             # 16-19 sky strike
seq += ['raise_01.png', 'raise_01.png', 'raise_02.png', 'raise_02.png', 'raise_03.png', 'raise_03.png']  # 20-25 under bloom
for fi, n in zip(range(4, 11), [3, 3, 3, 3, 3, 3, 2]): seq += [f'raise_{fi:02d}.png'] * n               # 26-45 raise + charge
for fi in [8, 9, 10, 9, 8, 9, 10, 9, 8, 9]: seq += [f'raise_{fi:02d}.png'] * 3                         # 46-75 hold, orb pulsing
seq += [f'cast_{i:02d}.png' for i in range(3, 12)]                              # 76-84 cast (second strike beat)
seq += ['idle_01.png', 'idle_01.png', 'idle_02.png', 'idle_02.png', 'idle_03.png']  # 85-89 back to idle
assert len(seq) == 90, len(seq)
HIP = np.array([W * 0.47, 0.0])
# hip height: every sprite's bottom crop edge must fall below the frame
need = max(H - (meta[f]['size'][1] - hipc(f)[1]) * row_scale[meta[f]['band']] for f in set(seq)) + 6
HIP[1] = need
tl = []
for i, fn in enumerate(seq):
    band = meta[fn]['band']; s = float(row_scale[band]); hc = hipc(fn)
    tx, ty = HIP[0] - hc[0] * s, HIP[1] - hc[1] * s
    k = kp(fn)
    # FX anchor: the casting hand = the wrist farthest from the shoulder centre (index tip if visible)
    best = None
    for side in 'lr':
        w = np.array(k[f'{side}_index'][:2] if f'{side}_index' in k else k[f'{side}_wrist'][:2])
        dist = np.linalg.norm(w - shc(fn))
        if best is None or dist > best[0]: best = (dist, w, side)
    hand = best[1] * s + [tx, ty]
    top = meta[fn]['bbox'][1] * s + ty
    tl.append({'f': i, 'img': fn, 's': round(s, 4), 'tx': round(float(tx), 2), 'ty': round(float(ty), 2),
               'hand': [round(float(hand[0]), 1), round(float(hand[1]), 1)], 'hand_side': best[2],
               'chest': [round(float((shc(fn) * s + [tx, ty])[0]), 1), round(float((shc(fn) * s + [tx, ty])[1] + 60), 1)], 'top': round(float(top), 1)})
os.makedirs(os.path.join(out_dir, 'assets', 'sprites'), exist_ok=True)
for fn in sorted(set(seq)): shutil.copy(os.path.join(d, fn), os.path.join(out_dir, 'assets', 'sprites', fn))
for fn in [f for f in meta if f.startswith('fx_')]: shutil.copy(os.path.join(d, fn), os.path.join(out_dir, 'assets', 'fx', fn))
json.dump({'W': W, 'H': H, 'fps': 30, 'n': 90, 'frames': tl, 'row_scale': {k: round(float(v), 4) for k, v in row_scale.items()}},
          open(os.path.join(out_dir, 'assets', 'timeline.json'), 'w'), indent=1)
open(os.path.join(out_dir, 'assets', 'timeline.js'), 'w').write('window.TL = ' + json.dumps({'W': W, 'H': H, 'n': 90, 'frames': tl}) + ';\n')
print('hip y', round(HIP[1], 1), 'row scales', {k: round(float(v), 3) for k, v in row_scale.items()})
print('min top (head/hand):', min(t['top'] for t in tl), ' unique sprites:', len(set(seq)))
