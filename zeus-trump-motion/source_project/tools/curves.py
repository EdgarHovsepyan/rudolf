import json, os, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt, numpy as np
B = os.environ.get('ZT_WORK', os.getcwd())
d = json.load(open(f'{B}/analysis/comparison_metrics_all.json')); s = d['series']; bad = d['summary']['excluded_frames_source_pose_hidden']; gl = d['glitch_frames']
keys = ['L upper arm', 'L forearm', 'R upper arm', 'R forearm', 'Torso lean', 'Head (neck->nose)']
fig, axs = plt.subplots(3, 2, figsize=(13, 9), sharex=True)
t = np.arange(90)
for ax, k in zip(axs.flat, keys):
    a = np.array(s[k]['source'], float); b = np.array(s[k]['render'], float)
    def fillnan(v):
        m = np.isnan(v); v = v.copy()
        if m.any(): v[m] = np.interp(np.where(m)[0], np.where(~m)[0], v[~m])
        return v
    good = [i for i in range(90) if i not in bad and i not in gl]
    a2 = a.copy(); a2[[i for i in range(90) if i not in good]] = np.nan
    a = np.degrees(np.unwrap(np.radians(fillnan(a2))))          # source: unwrap through visible frames only
    b = np.degrees(np.unwrap(np.radians(fillnan(b))))           # render: its own continuous unwrap
    b = b + 360 * np.round((a[good[0]] - b[good[0]]) / 360)      # same branch at the first visible frame
    a_raw = np.array(s[k]['source'], float); a_raw = a + ((a_raw - a + 180) % 360 - 180)
    for i in bad: ax.axvspan(i - .5, i + .5, color='#f0c060', alpha=.25, lw=0)
    for i in gl: ax.axvspan(i - .5, i + .5, color='#e06060', alpha=.25, lw=0)
    av = a_raw.copy(); av[bad] = np.nan
    ax.plot(t, av, color='#222222', lw=2.2, label='source (MediaPipe on reference)')
    ax.plot(t, b, color='#1f77b4', lw=1.6, label='render (MediaPipe on rig output)')
    m = d['summary']['angles'][k]
    ax.set_title(f"{k}   (clean-frame MAE {json.load(open(f'{B}/analysis/comparison_metrics_clean.json'))['summary']['angles'][k]['mae_deg']} deg)", fontsize=11)
    ax.set_ylabel('deg'); ax.grid(alpha=.3)
for ax in axs[-1]: ax.set_xlabel('frame (30 fps)')
axs[0, 0].legend(fontsize=8, loc='upper left')
fig.suptitle('Frame-by-frame joint angles: source vs reconstruction  (amber = source pose hidden by VFX, red = source detector glitch)', fontsize=12)
fig.tight_layout(); fig.savefig(f'{B}/deliver/angle_curves.png', dpi=110)
print('ok')
