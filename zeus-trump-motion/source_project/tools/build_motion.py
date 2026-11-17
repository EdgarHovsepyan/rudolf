"""Bundle the cleaned motion track + rig constants + secondary-motion and VFX timing curves into motion.js for the rig."""
import json, sys, numpy as np
motion, secondary, raw, out = sys.argv[1:5]
m = json.load(open(motion)); s = json.load(open(secondary)); r = json.load(open(raw))
J = m['joints']; N = m['n']; good = [i for i in range(N) if i not in set(m['flash_frames'])]
def L(a, b):
    v = [np.hypot(J[a][0][i]-J[b][0][i], J[a][1][i]-J[b][1][i]) for i in good]; return float(np.median(v))
rig = {
 'upper': (L('l_shoulder','l_elbow') + L('r_shoulder','r_elbow'))/2,
 'fore': (L('l_elbow','l_wrist') + L('r_elbow','r_wrist'))/2,
 'thigh': (L('l_hip','l_knee') + L('r_hip','r_knee'))/2,
 'shin': (L('l_knee','l_ankle') + L('r_knee','r_ankle'))/2,
 'hip_w': L('l_hip','r_hip'),
 'torso': float(np.median([m['channels']['scale'][i] for i in good])),
 'sh_w': float(np.median([m['channels']['sh_w'][i] for i in good])),
 'neck': float(np.median([m['channels']['neck_len'][i] for i in good])),
}
def norm(key, q=90):
    v = np.array([0.0] + [row[key][1] for row in s[1:]]); v = v / (np.percentile(v, 95) + 1e-6)
    return [round(float(min(1.5, x)), 3) for x in v]
sec = {k: norm(k) for k in ['head_beard','held_prop','cape_left','cape_right','torso']}
fl = np.array(m['flash_ratio']); fl = fl / fl.max()
data = {'fps': 30, 'n': N, 'w': m['w'], 'h': m['h'], 'rig': {k: round(v, 2) for k, v in rig.items()},
        'ch': m['channels'], 'flash': [round(float(x), 3) for x in fl], 'flash_frames': m['flash_frames'],
        'sec': sec, 'ref_joints': {k: [[round(x, 1) for x in v[0]], [round(y, 1) for y in v[1]]] for k, v in J.items()}}
open(out, 'w').write('window.MOTION = ' + json.dumps(data, separators=(',', ':')) + ';\n')
print(json.dumps(data['rig']))
