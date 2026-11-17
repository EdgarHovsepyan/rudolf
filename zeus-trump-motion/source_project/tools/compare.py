"""Frame-by-frame comparison of the source performance and the reconstruction.
Independent check: the SAME pose model (MediaPipe) is run on the source frames and on the rendered character,
and joint angles / positions / timing are compared on frames where the source pose is visible (not under the bloom)."""
import json, math, sys, glob, cv2, numpy as np
src = json.load(open('analysis/mp_pose_src.json')); ren = json.load(open('analysis/mp_pose_render.json'))
mot = json.load(open('analysis/motion_src.json')); rig = json.load(open('analysis/rig_joints.json'))
N = len(src['frames']); bad = set(mot['flash_frames'])
good_all = [i for i in range(N) if i not in bad]
# frames where the SOURCE detection itself was rejected as an outlier during cleaning (e.g. MediaPipe swapped the arms)
glitch = sorted({i for v in mot.get('outliers', {}).values() for i in v if i not in bad})
MODE = sys.argv[1] if len(sys.argv) > 1 else 'clean'
good = [i for i in good_all if i not in glitch] if MODE == 'clean' else good_all
def ang(kp, a, b):
    if a not in kp or b not in kp: return float('nan')
    v = (kp[b][0] - kp[a][0], kp[b][1] - kp[a][1]); return math.degrees(math.atan2(-v[0], v[1]))
def wrapd(x): return (x + 180) % 360 - 180
BONES = {'L upper arm': ('l_shoulder', 'l_elbow'), 'L forearm': ('l_elbow', 'l_wrist'), 'R upper arm': ('r_shoulder', 'r_elbow'),
         'R forearm': ('r_elbow', 'r_wrist'), 'L thigh': ('l_hip', 'l_knee'), 'R thigh': ('r_hip', 'r_knee')}
def torso(kp):
    if 'l_hip' not in kp: return float('nan')
    S = ((kp['l_shoulder'][0] + kp['r_shoulder'][0]) / 2, (kp['l_shoulder'][1] + kp['r_shoulder'][1]) / 2)
    H = ((kp['l_hip'][0] + kp['r_hip'][0]) / 2, (kp['l_hip'][1] + kp['r_hip'][1]) / 2)
    return wrapd(math.degrees(math.atan2(-(S[0] - H[0]), S[1] - H[1])) - 180)
def head_dir(kp):
    if 'nose' not in kp: return float('nan')
    S = ((kp['l_shoulder'][0] + kp['r_shoulder'][0]) / 2, (kp['l_shoulder'][1] + kp['r_shoulder'][1]) / 2)
    return math.degrees(math.atan2(-(kp['nose'][0] - S[0]), kp['nose'][1] - S[1]))
series = {}
for name, (a, b) in BONES.items():
    series[name] = ([ang(src['frames'][i]['kp'], a, b) for i in range(N)], [ang(ren['frames'][i]['kp'], a, b) for i in range(N)])
series['Torso lean'] = ([torso(src['frames'][i]['kp']) for i in range(N)], [torso(ren['frames'][i]['kp']) for i in range(N)])
series['Head (neck->nose)'] = ([head_dir(src['frames'][i]['kp']) for i in range(N)], [head_dir(ren['frames'][i]['kp']) for i in range(N)])
res = {'mode': MODE, 'frames_total': N, 'frames_compared': len(good), 'source_detector_glitch_frames': glitch, 'excluded_frames_source_pose_hidden': sorted(bad), 'angles': {}, 'positions_px_480x1200': {}, 'lag': {}}
for k, (a, b) in series.items():
    e = [abs(wrapd(b[i] - a[i])) for i in good]
    def ff(v):
        v = np.array(v, float); m = np.isnan(v)
        if m.any(): v[m] = np.interp(np.where(m)[0], np.where(~m)[0], v[~m])
        return v
    ua = np.degrees(np.unwrap(np.radians(ff(a))))
    fb = ff(b); ub = np.array([ua[i] + wrapd(fb[i] - ua[i]) for i in range(N)])   # render expressed on the source's unwrap branch
    ga, gb = np.array([ua[i] for i in good]), np.array([ub[i] for i in good])
    corr = float(np.corrcoef(ga, gb)[0, 1]) if ga.std() > 1 and gb.std() > 1 else None
    # timing: lag (frames) that best aligns the two curves over the compared frames
    best = None
    for L in range(-6, 7):
        idx = [i for i in good if 0 <= i + L < N and (i + L) not in bad]
        err = float(np.mean([abs(wrapd(ub[i + L] - ua[i])) for i in idx]))
        if best is None or err < best[1]: best = (L, err)
    res['angles'][k] = {'mae_deg': round(float(np.mean(e)), 2), 'median_deg': round(float(np.median(e)), 2), 'p90_deg': round(float(np.percentile(e, 90)), 2),
                        'max_deg': round(float(np.max(e)), 2), 'worst_frame': int(good[int(np.argmax(e))]), 'range_src_deg': round(float(ga.max() - ga.min()), 1),
                        'range_render_deg': round(float(gb.max() - gb.min()), 1), 'pearson_r': None if corr is None else round(corr, 3)}
    res['lag'][k] = {'best_lag_frames': best[0], 'mae_at_best_lag': round(best[1], 2)}
for j in ['nose', 'l_shoulder', 'r_shoulder', 'l_elbow', 'r_elbow', 'l_wrist', 'r_wrist', 'l_hip', 'r_hip']:
    d = [math.hypot(ren['frames'][i]['kp'][j][0] - src['frames'][i]['kp'][j][0], ren['frames'][i]['kp'][j][1] - src['frames'][i]['kp'][j][1]) for i in good]
    dr = [math.hypot(rig[str(i)]['joints'][j][0] - src['frames'][i]['kp'][j][0], rig[str(i)]['joints'][j][1] - src['frames'][i]['kp'][j][1]) for i in good] if j in rig['0']['joints'] else None
    res['positions_px_480x1200'][j] = {'render_vs_source_mean': round(float(np.mean(d)), 1), 'render_vs_source_p90': round(float(np.percentile(d, 90)), 1),
                                       'rig_vs_source_mean': None if dr is None else round(float(np.mean(dr)), 1)}
# motion energy (character region) source vs render: correlation of per-frame body-motion curves
def energy(globpat, box):
    fs = sorted(glob.glob(globpat)); prev = None; out = [0.0]
    for f in fs:
        g = cv2.cvtColor(cv2.resize(cv2.imread(f), (480, 1200)), cv2.COLOR_BGR2GRAY).astype(np.float32)[box[1]:box[3], box[0]:box[2]]
        if prev is not None: out.append(float(np.abs(g - prev).mean()))
        prev = g
    return np.array(out)
box = (40, 150, 440, 1100)
es, er = energy('analysis/frames_2x/*.png', box), energy('renders/char_480/*.png', box)
# wrist speed curves (px/frame) from the same pose model: the cleanest "is it moving at the same moments" signal
def speed(fr, j):
    p = np.array([fr[i]['kp'][j][:2] if j in fr[i]['kp'] else [np.nan, np.nan] for i in range(N)]); v = np.r_[0, np.linalg.norm(np.diff(p, axis=0), axis=1)]; return v
for j in ['l_wrist', 'r_wrist']:
    vs, vr = speed(src['frames'], j), speed(ren['frames'], j)
    gs = set(good)
    ok = [i for i in range(1, N) if i in gs and (i - 1) in gs and not np.isnan(vs[i])]
    res.setdefault('wrist_speed', {})[j] = {'pearson_r': round(float(np.corrcoef(vs[ok], vr[ok])[0, 1]), 3),
                                            'src_peak_frame': int(ok[int(np.argmax(vs[ok]))]), 'render_peak_frame': int(ok[int(np.argmax(vr[ok]))])}
res['motion_energy_render_char_pass'] = {'mean': round(float(er[1:].mean()), 2), 'frames_without_motion(<0.05)': int((er[1:] < 0.05).sum())}
json.dump({'summary': res, 'glitch_frames': glitch, 'series': {k: {'source': [round(x, 2) for x in a], 'render': [round(x, 2) for x in b]} for k, (a, b) in series.items()}},
          open(f'analysis/comparison_metrics_{MODE}.json', 'w'), indent=1)
print(json.dumps(res, indent=1))
