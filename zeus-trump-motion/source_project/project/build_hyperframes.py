"""Generate the HyperFrames composition (index.html) for the full reconstruction.
Each layer is its own timed clip; strike/bloom clips get data-start/data-duration from the frames measured on the reference."""
import json, os, shutil, sys
here = os.path.dirname(os.path.abspath(__file__))
hf = os.path.join(here, 'hyperframes')
src = open(os.path.join(here, 'motion.js')).read()
M = json.loads(src[src.index('=') + 1:].strip().rstrip(';'))
FPS, N = M['fps'], M['n']
bloom = [max(0.0, min(1.0, (x - 0.3) / 0.7)) for x in M['flash']]
def windows(mask):
    out, start = [], None
    for i, v in enumerate(mask + [False]):
        if v and start is None: start = i
        if not v and start is not None: out.append((start, i - 1)); start = None
    return out
STRIKES = [(15, 19), (76, 80)]                       # vertical strike frames measured on the reference
BLOOMS = windows([b > 0 for b in bloom])             # full-body white bloom frames measured on the reference
sec = lambda fr: round(fr / FPS, 4)
W, H = 720, 1800
clips = []
clips.append(f'<svg id="sky" class="clip" data-start="0" data-duration="{N / FPS:g}" data-track-index="0" viewBox="0 0 480 1200" xmlns="http://www.w3.org/2000/svg"><g id="skyG"></g></svg>')
clips.append(f'<svg id="hero" class="clip" data-start="0" data-duration="{N / FPS:g}" data-track-index="1" viewBox="0 0 480 1200" xmlns="http://www.w3.org/2000/svg"></svg>')
for k, (a, b) in enumerate(STRIKES):
    clips.append(f'<svg id="strike{k + 1}" class="clip strike" data-start="{sec(a)}" data-duration="{sec(b - a + 1)}" data-track-index="{2 + k * 2}" viewBox="0 0 480 1200" xmlns="http://www.w3.org/2000/svg">'
                 f'<path class="bolt" fill="none" stroke="#f4fdff" stroke-width="5" stroke-linejoin="round" filter="url(#fStrikeHF)"/></svg>')
for k, (a, b) in enumerate(BLOOMS):
    clips.append(f'<svg id="bloom{k + 1}" class="clip bloom" data-start="{sec(a)}" data-duration="{sec(b - a + 1)}" data-track-index="{3 + k * 2}" viewBox="0 0 480 1200" xmlns="http://www.w3.org/2000/svg">'
                 f'<ellipse class="glow" cx="240" cy="560" rx="260" ry="420" fill="url(#gBloomHF)"/><rect class="white" width="480" height="1200" fill="#eaf9ff" opacity="0"/></svg>')
z = {'sky': 0, 'hero': 1}
css_clips = '\n'.join(f'      #{cid} {{ z-index: {zi}; }}' for cid, zi in [('sky', 0), ('hero', 1)] +
                      [(f'strike{k + 1}', 2) for k in range(len(STRIKES))] + [(f'bloom{k + 1}', 3) for k in range(len(BLOOMS))])
html = f'''<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width={W}, height={H}" />
    <title>Thunder God Reconstruction</title>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ width: {W}px; height: {H}px; overflow: hidden; background: #050b1f; }}
      #root {{ position: relative; width: 100%; height: 100%; }}
      .clip {{ position: absolute; inset: 0; width: {W}px; height: {H}px; display: block; }}
{css_clips}
    </style>
    <script src="assets/motion.js"></script>
    <script src="assets/rig.js"></script>
    <script src="assets/scene.js"></script>
  </head>
  <body>
    <svg width="0" height="0" style="position:absolute" aria-hidden="true">
      <defs>
        <radialGradient id="gBloomHF" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#e8fbff" stop-opacity=".9"/><stop offset="1" stop-color="#9fe8ff" stop-opacity="0"/></radialGradient>
        <filter id="fStrikeHF" x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
    </svg>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{N / FPS:g}" data-fps="{FPS}" data-width="{W}" data-height="{H}" data-no-timeline>
      {chr(10).join('      ' + c for c in clips).strip()}
    </div>
    <script>
      // Deterministic per-frame state from time alone (seeked by HyperFrames via the hf-seek event).
      const S = window.ThunderScene, RIG = window.ThunderRig, MO = window.MOTION;
      S.backdrop(document.getElementById('skyG'), 'full');
      const parts = RIG.build(document.getElementById('hero'), {{ skeleton: false }});
      const STRIKES = {json.dumps([{'id': f'strike{k + 1}', 'start': a, 'peak': a + 2, 'end': b} for k, (a, b) in enumerate(STRIKES)])};
      const BLOOMS = {json.dumps([{'id': f'bloom{k + 1}', 'start': a, 'end': b} for k, (a, b) in enumerate(BLOOMS)])};
      function render(t) {{
        const f = Math.max(0, Math.min(MO.n - 1, Math.round(t * MO.fps)));
        const out = RIG.render(parts, f, {{}});
        const sky = document.getElementById('sky');
        sky.querySelectorAll('#clouds .cl').forEach((c) => {{ const i = +c.dataset.i; c.setAttribute('transform', `translate(${{(Math.sin(f / 30 * 0.7 + i) * 6 - f * 0.25 * (i % 3 + 1)).toFixed(2)}},${{(Math.cos(f / 30 * 0.9 + i) * 3).toFixed(2)}})`); }});
        sky.querySelectorAll('#hiClouds .ch').forEach((c) => {{ const i = +c.dataset.i; c.setAttribute('transform', `translate(${{(-f * 0.15 * (i % 2 + 1)).toFixed(2)}},0)`); }});
        sky.querySelector('#rays').setAttribute('opacity', (0.08 + 0.10 * out.power + 0.04 * RIG.noise1(f / 5, 2)).toFixed(3));
        const j = out.joints;
        const cx = (j.l_shoulder[0] + j.r_shoulder[0]) / 2, cy = (j.l_shoulder[1] + j.r_shoulder[1]) / 2;
        for (const s of STRIKES) {{
          const p = document.querySelector('#' + s.id + ' .bolt');
          const on = f >= s.start && f <= s.end;
          p.setAttribute('d', on ? S.strikePath(s.start * 17 + f, cx + 30, -20, cx, cy + 40) : '');
          p.setAttribute('opacity', f === s.peak ? 1 : 0.75);
        }}
        const b = S.bloomAt(f);
        for (const s of BLOOMS) {{
          const g = document.querySelector('#' + s.id + ' .glow');
          g.setAttribute('cx', cx.toFixed(1)); g.setAttribute('cy', (j.pelvis[1] - 60).toFixed(1));
          g.setAttribute('opacity', Math.min(1, b * 1.15).toFixed(3));
          document.querySelector('#' + s.id + ' .white').setAttribute('opacity', Math.max(0, Math.min(0.5, (b - 0.55) * 0.9)).toFixed(3));
        }}
      }}
      window.addEventListener('hf-seek', (e) => render(e.detail.time));
      render(0);
    </script>
  </body>
</html>
'''
open(os.path.join(hf, 'index.html'), 'w').write(html)
for fn in ['motion.js', 'rig.js', 'scene.js']:
    shutil.copy(os.path.join(here, fn), os.path.join(hf, 'assets', fn))
json.dump({"$schema": "https://hyperframes.heygen.com/schema/hyperframes.json", "paths": {"blocks": "compositions", "components": "compositions/components", "assets": "assets"}, "media": {"autoProxy": True}},
          open(os.path.join(hf, 'hyperframes.json'), 'w'), indent=2)
json.dump({"id": "thunder-god-reconstruction", "name": "thunder-god-reconstruction"}, open(os.path.join(hf, 'meta.json'), 'w'), indent=2)
print('strikes', STRIKES, 'blooms', BLOOMS)
