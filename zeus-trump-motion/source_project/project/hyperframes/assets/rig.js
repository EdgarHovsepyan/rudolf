/* Thunder-god caricature rig.
 * Original character art, drawn as layered SVG parts in local bone space (bones point down +y),
 * driven per frame by the retargeted motion track in window.MOTION (see motion.js).
 * Everything is deterministic: cloth/tie/hair springs are pre-simulated for all frames at load,
 * so any frame can be seeked in any order (required by frame-accurate renderers such as HyperFrames).
 */
(function () {
  const M = window.MOTION;
  const N = M.n, R = M.rig, C = M.ch;
  const NS = 'http://www.w3.org/2000/svg';
  const D2R = Math.PI / 180;

  // ---------- small math helpers ----------
  const nrm = (a) => ((a + 180) % 360 + 360) % 360 - 180;           // wrap to [-180,180)
  const dir = (a) => [-Math.sin(a * D2R), Math.cos(a * D2R)];          // world dir for angle convention (0 = down)
  const add = (p, v, s = 1) => [p[0] + v[0] * s, p[1] + v[1] * s];
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
  function rot(p, a) { const c = Math.cos(a * D2R), s = Math.sin(a * D2R); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; }
  function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function noise1(t, seed) { const i = Math.floor(t), f = t - i; const a = hash(i + seed * 101), b = hash(i + 1 + seed * 101); const u = f * f * (3 - 2 * f); return lerp(a, b, u) * 2 - 1; }

  // ---------- forward kinematics from the retargeted channels ----------
  // Reference medians: the character keeps fixed bone lengths (identity/proportion consistency);
  // only angles, root translation, torso squash and shoulder-turn come from the reference.
  function pose(f) {
    f = clamp(f, 0, N - 1);
    const g = (k) => C[k][f];
    const torsoA = nrm(g('torso'));
    const torsoLen = R.torso * clamp(g('scale') / R.torso, 0.9, 1.1);
    const turn = clamp(g('sh_w') / R.sh_w, 0.8, 1.15);
    const pelvis = [g('root_x'), g('root_y')];
    const up = dir(torsoA + 180);                 // pelvis -> neck
    const side = [Math.cos(torsoA * D2R), Math.sin(torsoA * D2R)]; // +x of torso frame
    const neck = add(pelvis, up, torsoLen);
    const half = (R.sh_w / 2) * turn;
    const shL = add(neck, side, half), shR = add(neck, side, -half);   // L = character's left = screen right
    const arm = (s, sh) => {
      const ua = nrm(g(s + '_upper')), fa = nrm(g(s + '_fore')), ha = nrm(g(s + '_hand'));
      const el = add(sh, dir(ua), R.upper), wr = add(el, dir(fa), R.fore);
      return { sh, el, wr, ua, fa, ha };
    };
    const hipL = add(pelvis, side, R.hip_w / 2), hipR = add(pelvis, side, -R.hip_w / 2);
    const leg = (s, hp) => {
      const ta = nrm(g(s + '_thigh')), sa = nrm(g(s + '_shin'));
      const kn = add(hp, dir(ta), R.thigh * 0.92), an = add(kn, dir(sa), R.shin * 0.92);
      return { hp, kn, an, ta, sa };
    };
    const nose = [neck[0] + g('head_x'), neck[1] + g('head_y')];
    return { f, torsoA, torsoLen, turn, pelvis, neck, side, L: arm('l', shL), Rr: arm('r', shR),
             legL: leg('l', hipL), legR: leg('r', hipR), nose, roll: g('head_roll') };
  }

  // power factor: how far the bolt arm is raised above its shoulder (drives hand shapes, face, bolt prop)
  const P = [];
  for (let f = 0; f < N; f++) { const p = pose(f); P.push(p); }
  const powerRaw = P.map((p) => smooth(-20, 70, p.L.sh[1] - p.L.wr[1]));
  const power = powerRaw.map((_, i) => { let s = 0, w = 0; for (let k = -2; k <= 2; k++) { const j = clamp(i + k, 0, N - 1); const ww = 3 - Math.abs(k); s += powerRaw[j] * ww; w += ww; } return s / w; });

  // ---------- secondary motion: verlet cloth (cape), chain (tie), springs (hair, coat tails) ----------
  function simulate() {
    const COLS = 7, ROWS = 6, SUB = 4, dt = 1 / 30 / SUB;
    const out = { cape: [], tie: [], hair: [], tails: [] };
    const capeTop = (p) => {           // pinned row: across the back of the shoulders
      const a = add(p.Rr.sh, p.side, -6), b = add(p.L.sh, p.side, 6);
      const pts = [];
      for (let c = 0; c < COLS; c++) { const t = c / (COLS - 1); pts.push([lerp(a[0], b[0], t), lerp(a[1], b[1], t) + 4]); }
      return pts;
    };
    // rest layout
    let p0 = P[0];
    const top0 = capeTop(p0);
    const rowLen = 78, botW = 300;
    let X = [], Xp = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const t = c / (COLS - 1), tr = r / (ROWS - 1);
      const topW = top0[COLS - 1][0] - top0[0][0], w = lerp(topW, botW, tr);
      const cx = (top0[0][0] + top0[COLS - 1][0]) / 2;
      const pt = [cx - w / 2 + w * t, top0[0][1] + r * rowLen];
      X.push(pt.slice()); Xp.push(pt.slice());
    }
    const rest = [];
    const idx = (r, c) => r * COLS + c;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (c < COLS - 1) rest.push([idx(r, c), idx(r, c + 1)]);
      if (r < ROWS - 1) rest.push([idx(r, c), idx(r + 1, c)]);
      if (r < ROWS - 1 && c < COLS - 1) { rest.push([idx(r, c), idx(r + 1, c + 1)]); rest.push([idx(r, c + 1), idx(r + 1, c)]); }
    }
    const restLen = rest.map(([a, b]) => Math.hypot(X[a][0] - X[b][0], X[a][1] - X[b][1]));
    // tie chain in world space
    const TN = 6, tieSeg = 40;
    const knot = (p) => add(add(p.neck, dir(p.torsoA), 14), p.side, 0);
    let T = [], Tp = [];
    for (let i = 0; i < TN; i++) { const q = add(knot(p0), dir(p0.torsoA), i * tieSeg); T.push(q.slice()); Tp.push(q.slice()); }
    // hair swoop + coat tail springs (2D offset, damped)
    let hair = [0, 0], hairV = [0, 0], tail = [0, 0], tailV = [0, 0];
    let prevNose = P[0].nose.slice(), prevNoseV = [0, 0], prevPel = P[0].pelvis.slice(), prevPelV = [0, 0];

    const PRE = 45; // settle frames before frame 0
    for (let F = -PRE; F < N; F++) {
      const f = Math.max(0, F), p = P[f];
      const capeE = Math.max(M.sec.cape_left[f], M.sec.cape_right[f]);
      const top = capeTop(p);
      for (let s = 0; s < SUB; s++) {
        const tt = (F + s / SUB) / 30;
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
          const i = idx(r, c);
          if (r === 0) { X[i] = top[c].slice(); Xp[i] = top[c].slice(); continue; }
          const tr = r / (ROWS - 1);
          // wind blows the cape to screen-left like the reference; gusts follow the reference cape-flow curve
          const gust = 0.55 + 0.9 * capeE + 1.6 * M.flash[f];
          const wx = -(260 + 120 * noise1(tt * 2.1 + c * 0.37, 3 + r)) * gust * tr;
          const wy = 70 * noise1(tt * 3.3 + c * 0.51, 9 + r) * gust * tr;
          const vx = (X[i][0] - Xp[i][0]) * 0.985, vy = (X[i][1] - Xp[i][1]) * 0.985;
          Xp[i] = X[i].slice();
          X[i][0] += vx + wx * dt * dt; X[i][1] += vy + (900 + wy) * dt * dt;
        }
        for (let it = 0; it < 8; it++) {
          rest.forEach(([a, b], k) => {
            const dx = X[b][0] - X[a][0], dy = X[b][1] - X[a][1], d = Math.hypot(dx, dy) || 1e-6;
            const diff = (d - restLen[k]) / d;
            const ra = a < COLS ? 0 : 0.5, rb = b < COLS ? 0 : 0.5, sum = ra + rb || 1;
            X[a][0] += dx * diff * (ra / sum); X[a][1] += dy * diff * (ra / sum);
            X[b][0] -= dx * diff * (rb / sum); X[b][1] -= dy * diff * (rb / sum);
          });
        }
        // tie
        const k0 = knot(p);
        for (let i = 0; i < TN; i++) {
          if (i === 0) { T[0] = k0.slice(); Tp[0] = k0.slice(); continue; }
          const vx = (T[i][0] - Tp[i][0]) * 0.97, vy = (T[i][1] - Tp[i][1]) * 0.97;
          Tp[i] = T[i].slice();
          const gw = (0.4 + capeE + 2.5 * M.flash[f]) * (i / TN);
          T[i][0] += vx + (-90 * gw + 60 * noise1(tt * 4 + i, 21) * gw) * dt * dt;
          T[i][1] += vy + 900 * dt * dt;
        }
        for (let it = 0; it < 6; it++) for (let i = 1; i < TN; i++) {
          const a = T[i - 1], b = T[i]; const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1e-6;
          const diff = (d - tieSeg) / d;
          if (i - 1 === 0) { b[0] -= dx * diff; b[1] -= dy * diff; }
          else { a[0] += dx * diff * 0.5; a[1] += dy * diff * 0.5; b[0] -= dx * diff * 0.5; b[1] -= dy * diff * 0.5; }
        }
        // tie rests on the belly: keep it from swinging behind the torso line too far
        for (let i = 1; i < TN; i++) {
          const rel = [T[i][0] - p.pelvis[0], T[i][1] - p.pelvis[1]];
          const lx = rel[0] * Math.cos(-p.torsoA * D2R) - rel[1] * Math.sin(-p.torsoA * D2R);
          if (Math.abs(lx) > 46) T[i][0] -= (lx - Math.sign(lx) * 46) * 0.5;
        }
      }
      // hair / tails springs driven by head and pelvis acceleration (inertia), plus flash gusts
      const nv = [p.nose[0] - prevNose[0], p.nose[1] - prevNose[1]];
      const na = [nv[0] - prevNoseV[0], nv[1] - prevNoseV[1]];
      prevNose = p.nose.slice(); prevNoseV = nv;
      const hk = 0.18, hd = 0.72;
      const hairWind = [-(2 + 6 * M.flash[f] + 3 * M.sec.head_beard[f]) * (0.6 + 0.4 * noise1(F / 6, 5)), 0];
      hairV = [(hairV[0] - hk * hair[0] - na[0] * 1.6 + hairWind[0] * 0.25) * hd, (hairV[1] - hk * hair[1] - na[1] * 1.6) * hd];
      hair = [clamp(hair[0] + hairV[0], -14, 14), clamp(hair[1] + hairV[1], -12, 12)];
      const pv = [p.pelvis[0] - prevPel[0], p.pelvis[1] - prevPel[1]];
      const pa = [pv[0] - prevPelV[0], pv[1] - prevPelV[1]];
      prevPel = p.pelvis.slice(); prevPelV = pv;
      tailV = [(tailV[0] - 0.15 * tail[0] - pa[0] * 2.0 - (0.6 + 2.5 * M.flash[f] + capeE) * 0.4) * 0.8, (tailV[1] - 0.15 * tail[1] - pa[1] * 2.0) * 0.8];
      tail = [clamp(tail[0] + tailV[0], -12, 12), clamp(tail[1] + tailV[1], -10, 10)];
      if (F >= 0) {
        out.cape.push(X.map((q) => q.slice()));
        out.tie.push(T.map((q) => q.slice()));
        out.hair.push(hair.slice());
        out.tails.push(tail.slice());
      }
    }
    out.COLS = COLS; out.ROWS = ROWS;
    return out;
  }
  const SIM = simulate();

  // ---------- SVG construction ----------
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  const INK = '#1b1424', INKW = 2.6;

  const DEFS = `
  <linearGradient id="gNavy" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#121c3d"/><stop offset=".45" stop-color="#25366e"/><stop offset=".7" stop-color="#1c2a58"/><stop offset="1" stop-color="#0d1430"/></linearGradient>
  <linearGradient id="gNavyV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3d7a"/><stop offset="1" stop-color="#121a3a"/></linearGradient>
  <linearGradient id="gTrouser" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0d1430"/><stop offset=".5" stop-color="#1f2d5e"/><stop offset="1" stop-color="#0b1128"/></linearGradient>
  <linearGradient id="gShirt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cfd3dd"/><stop offset=".5" stop-color="#fbfbf7"/><stop offset="1" stop-color="#c3c8d4"/></linearGradient>
  <linearGradient id="gTie" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8f0a1f"/><stop offset=".5" stop-color="#e01b3a"/><stop offset="1" stop-color="#9c0c22"/></linearGradient>
  <radialGradient id="gSkin" cx=".48" cy=".42" r=".65"><stop offset="0" stop-color="#ffbf7a"/><stop offset=".6" stop-color="#f19a55"/><stop offset="1" stop-color="#cf6f35"/></radialGradient>
  <linearGradient id="gSkinLimb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d9773d"/><stop offset=".5" stop-color="#f7ad68"/><stop offset="1" stop-color="#cc6a33"/></linearGradient>
  <linearGradient id="gHair" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2b0"/><stop offset=".35" stop-color="#f6d265"/><stop offset=".75" stop-color="#e2ad32"/><stop offset="1" stop-color="#b98318"/></linearGradient>
  <linearGradient id="gGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b5"/><stop offset=".4" stop-color="#f7cc45"/><stop offset="1" stop-color="#b9821a"/></linearGradient>
  <linearGradient id="gCape" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9b0f22"/><stop offset=".5" stop-color="#c41a33"/><stop offset="1" stop-color="#7a0918"/></linearGradient>
  <linearGradient id="gShoe" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0a0a10"/><stop offset=".55" stop-color="#3a3a4a"/><stop offset="1" stop-color="#0a0a10"/></linearGradient>
  <linearGradient id="gBolt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff9d6"/><stop offset=".5" stop-color="#ffe066"/><stop offset="1" stop-color="#fff9d6"/></linearGradient>
  <filter id="fGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="fGlowBig" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="16"/></filter>
  <filter id="fSoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.2"/></filter>`;

  // Parts are authored in local bone space. +y runs along the bone (down when unrotated).
  const ART = {
    thigh: `<path d="M-30,-8 C-33,55 -27,118 -24,152 L24,152 C27,118 33,55 30,-8 Z" fill="url(#gTrouser)" stroke="${INK}" stroke-width="${INKW}"/>
            <path d="M4,6 C6,60 5,110 3,148" stroke="#3b4f8f" stroke-width="2.5" fill="none" opacity=".7"/>`,
    shin: `<path d="M-24,-4 C-23,50 -22,95 -20,124 L20,124 C22,95 23,50 24,-4 Z" fill="url(#gTrouser)" stroke="${INK}" stroke-width="${INKW}"/>
           <path d="M3,4 C4,50 4,90 3,120" stroke="#3b4f8f" stroke-width="2.5" fill="none" opacity=".7"/>
           <path d="M-21,118 C-24,140 -18,166 -4,176 C6,180 16,172 19,150 L20,118 Z" fill="url(#gShoe)" stroke="${INK}" stroke-width="${INKW}"/>
           <path d="M-12,140 C-12,156 -6,168 2,172" stroke="#9aa0b8" stroke-width="2.5" fill="none" opacity=".8"/>`,
    upper: `<path d="M-25,-10 C-28,30 -25,70 -21,104 L21,104 C25,70 28,30 25,-10 C17,-24 -17,-24 -25,-10 Z" fill="url(#gNavy)" stroke="${INK}" stroke-width="${INKW}"/>
            <path d="M-10,20 C-12,50 -10,75 -8,95" stroke="#3d55a3" stroke-width="3" fill="none" opacity=".6"/>`,
    fore: `<circle cx="0" cy="0" r="21" fill="url(#gNavy)" stroke="${INK}" stroke-width="${INKW}"/>
           <path d="M-21,0 C-21,30 -19,56 -17,74 L17,74 C19,56 21,30 21,0 Z" fill="url(#gNavy)" stroke="${INK}" stroke-width="${INKW}"/>
           <path d="M-8,14 C-9,40 -8,58 -7,70" stroke="#3d55a3" stroke-width="3" fill="none" opacity=".6"/>
           <path d="M-18,72 L18,72 L17,92 L-17,92 Z" fill="url(#gShirt)" stroke="${INK}" stroke-width="${INKW}"/>
           <circle cx="8" cy="82" r="4.2" fill="url(#gGold)" stroke="${INK}" stroke-width="1.4"/>`,
    handRelax: `<path d="M-13,-2 C-17,14 -16,30 -9,41 C-3,48 9,46 13,37 C17,26 16,10 13,-2 Z" fill="url(#gSkinLimb)" stroke="${INK}" stroke-width="${INKW}"/>
                <path d="M-6,30 L-6,42 M0,32 L0,45 M6,30 L6,42" stroke="#a9542a" stroke-width="2" fill="none"/>
                <path d="M13,6 C22,12 22,24 16,28" fill="url(#gSkinLimb)" stroke="${INK}" stroke-width="${INKW}"/>`,
    handClaw: `<path d="M-14,-2 C-18,10 -17,22 -12,28 L12,28 C17,22 18,10 14,-2 Z" fill="url(#gSkinLimb)" stroke="${INK}" stroke-width="${INKW}"/>
               <path d="M-12,24 C-22,34 -24,46 -18,54" stroke="${INK}" stroke-width="10.5" stroke-linecap="round" fill="none"/>
               <path d="M-12,24 C-22,34 -24,46 -18,54" stroke="#f0a060" stroke-width="6" stroke-linecap="round" fill="none"/>
               <path d="M-4,28 C-6,42 -6,54 0,62" stroke="${INK}" stroke-width="10.5" stroke-linecap="round" fill="none"/>
               <path d="M-4,28 C-6,42 -6,54 0,62" stroke="#f4a866" stroke-width="6" stroke-linecap="round" fill="none"/>
               <path d="M4,28 C6,42 8,52 14,58" stroke="${INK}" stroke-width="10.5" stroke-linecap="round" fill="none"/>
               <path d="M4,28 C6,42 8,52 14,58" stroke="#f4a866" stroke-width="6" stroke-linecap="round" fill="none"/>
               <path d="M11,24 C20,30 26,38 28,48" stroke="${INK}" stroke-width="10" stroke-linecap="round" fill="none"/>
               <path d="M11,24 C20,30 26,38 28,48" stroke="#f0a060" stroke-width="5.5" stroke-linecap="round" fill="none"/>
               <path d="M14,4 C26,6 32,14 34,22" stroke="${INK}" stroke-width="11" stroke-linecap="round" fill="none"/>
               <path d="M14,4 C26,6 32,14 34,22" stroke="#f0a060" stroke-width="6.5" stroke-linecap="round" fill="none"/>`,
    handFist: `<path d="M-15,-2 C-20,12 -19,30 -8,37 C4,42 17,34 18,18 C18,8 16,0 14,-2 Z" fill="url(#gSkinLimb)" stroke="${INK}" stroke-width="${INKW}"/>
               <path d="M-12,22 C-4,26 6,26 14,22 M-10,30 C-2,33 6,33 12,29" stroke="#a9542a" stroke-width="2.2" fill="none"/>
               <path d="M14,6 C22,10 22,20 14,24" fill="url(#gSkinLimb)" stroke="${INK}" stroke-width="${INKW}"/>`,
  };

  // Torso, local: origin pelvis centre, neck at (0,-R.torso). Jacket worn open over shirt; long tie is simulated separately.
  function torsoArt() {
    const T = R.torso, hw = R.sh_w / 2;
    return `
    <path d="M-${hw - 4},${-T + 4} C-${hw + 20},${-T + 40} -${hw + 24},${-T * 0.45} -${hw + 8},-14 L${hw + 8},-14 C${hw + 24},${-T * 0.45} ${hw + 20},${-T + 40} ${hw - 4},${-T + 4} Z" fill="url(#gShirt)" stroke="${INK}" stroke-width="${INKW}"/>
    <ellipse cx="0" cy="${-T * 0.3}" rx="${hw + 2}" ry="${T * 0.3}" fill="#ffffff" opacity=".35"/><path d="M-30,${-T * 0.18} C-14,${-T * 0.08} 14,${-T * 0.08} 30,${-T * 0.18}" stroke="#aab0c0" stroke-width="2" fill="none"/>
    <path d="M-${hw},-12 L${hw},-12 L${hw - 2},4 L-${hw - 2},4 Z" fill="#14141c" stroke="${INK}" stroke-width="2"/>
    <rect x="-11" y="-13" width="22" height="16" rx="3" fill="url(#gGold)" stroke="${INK}" stroke-width="1.6"/>
    <g id="jacketL">
      <path d="M-24,${-T - 2} Q-${hw - 6},${-T - 8} -${hw + 8},${-T + 4} Q-${hw + 22},${-T + 14} -${hw + 20},${-T + 36}
               C-${hw + 28},${-T * 0.62} -${hw + 32},${-T * 0.34} -${hw + 24},-30 C-${hw + 20},-10 -${hw + 14},8 -${hw + 4},18
               L-30,22 C-32,-20 -30,${-T * 0.42} -26,${-T * 0.6} C-30,${-T * 0.72} -34,${-T * 0.8} -24,${-T - 2} Z"
            fill="url(#gNavy)" stroke="${INK}" stroke-width="${INKW}"/>
      <path d="M-24,${-T - 2} L-46,${-T + 40} L-36,${-T + 48} L-26,${-T * 0.6}" fill="#17224a" stroke="${INK}" stroke-width="2"/>
      <path d="M-46,${-T + 40} L-36,${-T + 48} L-26,${-T * 0.6}" stroke="url(#gGold)" stroke-width="3" fill="none"/>
      <path d="M-${hw + 2},18 L-30,22" stroke="url(#gGold)" stroke-width="5" stroke-dasharray="7 4" fill="none"/>
    </g>
    <g id="jacketR">
      <path d="M24,${-T - 2} Q${hw - 6},${-T - 8} ${hw + 8},${-T + 4} Q${hw + 22},${-T + 14} ${hw + 20},${-T + 36}
               C${hw + 28},${-T * 0.62} ${hw + 32},${-T * 0.34} ${hw + 24},-30 C${hw + 20},-10 ${hw + 14},8 ${hw + 4},18
               L30,22 C32,-20 30,${-T * 0.42} 26,${-T * 0.6} C30,${-T * 0.72} 34,${-T * 0.8} 24,${-T - 2} Z"
            fill="url(#gNavy)" stroke="${INK}" stroke-width="${INKW}"/>
      <path d="M24,${-T - 2} L46,${-T + 40} L36,${-T + 48} L26,${-T * 0.6}" fill="#17224a" stroke="${INK}" stroke-width="2"/>
      <path d="M46,${-T + 40} L36,${-T + 48} L26,${-T * 0.6}" stroke="url(#gGold)" stroke-width="3" fill="none"/>
      <path d="M${hw + 2},18 L30,22" stroke="url(#gGold)" stroke-width="5" stroke-dasharray="7 4" fill="none"/>
      <path d="M${hw - 18},${-T + 62} l14,-4 l-2,12 l9,-2 l-17,20 l4,-14 l-9,2 Z" fill="url(#gGold)" stroke="${INK}" stroke-width="1.3"/>
      <path d="M${hw - 10},${-T + 92} l16,-2 l-4,10 Z" fill="#fbfbf7" stroke="${INK}" stroke-width="1.4"/>
    </g>
    <path d="M-${hw + 16},-30 C-${hw + 8},-60 -${hw + 4},-96 -${hw + 6},-120" stroke="#3d55a3" stroke-width="3" fill="none" opacity=".55"/>
    <path d="M${hw + 16},-30 C${hw + 8},-60 ${hw + 4},-96 ${hw + 6},-120" stroke="#3d55a3" stroke-width="3" fill="none" opacity=".55"/>`;
  }
  function collarArt() {
    const T = R.torso;
    return `<path d="M-26,${-T - 4} L-8,${-T + 18} L-2,${-T - 6} Z" fill="url(#gShirt)" stroke="${INK}" stroke-width="2"/>
            <path d="M26,${-T - 4} L8,${-T + 18} L2,${-T - 6} Z" fill="url(#gShirt)" stroke="${INK}" stroke-width="2"/>
            <path d="M-9,${-T + 2} L9,${-T + 2} L6,${-T + 18} L-6,${-T + 18} Z" fill="url(#gTie)" stroke="${INK}" stroke-width="2"/>`;
  }

  // Head, local: origin at jaw/neck pivot; nose tip at NOSE_OFF. Face features in a sub-group so look-up can shift them.
  const HS = 1.3;                       // caricature head scale
  const NOSE_OFF = [0, -52 * HS];
  const HEAD = `<g transform="scale(${HS})">
    <g id="hairBack"><path d="M-55,-58 C-70,-100 -58,-152 -10,-160 C42,-168 74,-136 64,-92 C66,-76 60,-64 55,-56 L45,-84 C30,-104 -30,-104 -45,-84 Z" fill="url(#gHair)" stroke="${INK}" stroke-width="${INKW}"/>
      <path d="M-52,-70 C-58,-96 -50,-120 -36,-134 M54,-70 C60,-92 56,-112 46,-124" stroke="#b98318" stroke-width="2.4" fill="none" opacity=".8"/></g>
    <ellipse cx="-45" cy="-60" rx="8" ry="14" fill="url(#gSkin)" stroke="${INK}" stroke-width="2.2"/>
    <ellipse cx="45" cy="-60" rx="8" ry="14" fill="url(#gSkin)" stroke="${INK}" stroke-width="2.2"/>
    <path id="face" d="M-42,-92 C-48,-60 -48,-32 -40,-14 C-31,0 -15,6 0,6 C15,6 31,0 40,-14 C48,-32 48,-60 42,-92 C36,-114 18,-122 0,-122 C-18,-122 -36,-114 -42,-92 Z" fill="url(#gSkin)" stroke="${INK}" stroke-width="${INKW}"/>
    <ellipse cx="-27" cy="-42" rx="12" ry="8" fill="#e8743f" opacity=".35"/><ellipse cx="27" cy="-42" rx="12" ry="8" fill="#e8743f" opacity=".35"/>
    <path d="M-36,-30 C-32,-14 -22,-6 -12,-4 M36,-30 C32,-14 22,-6 12,-4 M-14,2 C-6,8 6,8 14,2" stroke="#b5592a" stroke-width="2" fill="none" opacity=".75"/>
    <g id="feat">
      <ellipse cx="-19" cy="-70" rx="17" ry="11.5" fill="#fbdcb4" opacity=".92"/>
      <ellipse cx="19" cy="-70" rx="17" ry="11.5" fill="#fbdcb4" opacity=".92"/>
      <g id="eyes">
        <path d="M-31,-70 Q-19,-78 -7,-70 Q-19,-65 -31,-70 Z" fill="#fff" stroke="${INK}" stroke-width="1.8"/>
        <path d="M7,-70 Q19,-78 31,-70 Q19,-65 7,-70 Z" fill="#fff" stroke="${INK}" stroke-width="1.8"/>
        <circle id="irisR" cx="-18" cy="-71" r="3.8" fill="#3c78d8" stroke="${INK}" stroke-width="1"/>
        <circle id="irisL" cx="18" cy="-71" r="3.8" fill="#3c78d8" stroke="${INK}" stroke-width="1"/>
        <path d="M-32,-71 Q-19,-80 -6,-71 M6,-71 Q19,-80 32,-71" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
      </g>
      <path id="browR" d="M-34,-84 Q-21,-91 -7,-84" stroke="#e9c766" stroke-width="5.5" fill="none" stroke-linecap="round"/>
      <path id="browL" d="M34,-84 Q21,-91 7,-84" stroke="#e9c766" stroke-width="5.5" fill="none" stroke-linecap="round"/>
      <path d="M-3,-68 Q-9,-54 -11,-47 Q-5,-41 0,-42 Q5,-41 11,-47 Q9,-54 3,-68" fill="#f3a463" stroke="${INK}" stroke-width="2"/>
      <path d="M-6,-45 Q-4,-43 -2,-45 M2,-45 Q4,-43 6,-45" stroke="#7a3315" stroke-width="2" fill="none"/>
      <g id="mouthIdle"><path d="M-13,-27 Q-6,-35 0,-31 Q6,-35 13,-27 Q6,-19 0,-20 Q-6,-19 -13,-27 Z" fill="#cf6b5c" stroke="${INK}" stroke-width="2"/>
        <path d="M-12,-27 Q0,-25 12,-27" stroke="#7d2b22" stroke-width="1.8" fill="none"/></g>
      <g id="mouthShout"><path d="M-19,-33 Q0,-42 19,-33 Q15,-6 0,-2 Q-15,-6 -19,-33 Z" fill="#4b1218" stroke="${INK}" stroke-width="2.2"/>
        <path d="M-15,-32 Q0,-38 15,-32 L13,-27 Q0,-31 -13,-27 Z" fill="#fff"/>
        <path d="M-9,-10 Q0,-16 9,-10 Q0,-4 -9,-10 Z" fill="#c94b57"/></g>
    </g>
    <g id="laurel"></g>
    <g id="hairFront"><path id="swoop" d="" fill="url(#gHair)" stroke="${INK}" stroke-width="${INKW}"/>
      <path id="swoopHi" d="" stroke="#fff6c9" stroke-width="3" fill="none" stroke-linecap="round" opacity=".85"/></g>
  </g>`;

  function laurelArt() {
    let s = '';
    for (const side of [-1, 1]) {
      s += `<path d="M${side * 47},-62 C${side * 54},-80 ${side * 54},-100 ${side * 44},-118" stroke="#9c6a12" stroke-width="2.4" fill="none"/>`;
      for (let i = 0; i < 6; i++) {
        const t = i / 5, x = side * (47 + 7 * Math.sin(t * Math.PI) - 3 * t), y = -64 - 52 * t;
        for (const k of [-1, 1]) {
          const lx = x + side * k * 6, rotA = side * (k * 38 - 10);
          s += `<ellipse cx="${lx.toFixed(1)}" cy="${y.toFixed(1)}" rx="4.2" ry="9.5" transform="rotate(${rotA.toFixed(1)} ${lx.toFixed(1)} ${y.toFixed(1)})" fill="url(#gGold)" stroke="${INK}" stroke-width="1.2"/>`;
        }
      }
    }
    return s;
  }

  // Thunderbolt prop held in the left (screen-right) fist; local to the hand group.
  function boltPath(seed, len, jag) {
    const pts = [[-len * 0.3, 0]];
    const n = 9;
    for (let i = 1; i < n; i++) {
      const t = i / n;
      pts.push([lerp(-len * 0.3, len * 0.7, t), (i % 2 ? -1 : 1) * jag * (0.6 + 0.6 * hash(seed + i))]);
    }
    pts.push([len * 0.7, 0]);
    // thick zig-zag ribbon
    const top = pts.map(([x, y], i) => [x, y - (i === 0 || i === pts.length - 1 ? 0 : 6)]);
    const bot = pts.map(([x, y], i) => [x + 5, y + (i === 0 || i === pts.length - 1 ? 0 : 6)]);
    return 'M' + top.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' L') + ' L' + bot.reverse().map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' L') + ' Z';
  }
  function arcPath(seed, x0, y0, x1, y1, segs, amp) {
    let d = `M${x0.toFixed(1)},${y0.toFixed(1)}`;
    for (let i = 1; i < segs; i++) {
      const t = i / segs, nx = -(y1 - y0), ny = x1 - x0, L = Math.hypot(nx, ny) || 1;
      const o = (hash(seed * 13 + i) * 2 - 1) * amp;
      d += ` L${(lerp(x0, x1, t) + nx / L * o).toFixed(1)},${(lerp(y0, y1, t) + ny / L * o).toFixed(1)}`;
    }
    return d + ` L${x1.toFixed(1)},${y1.toFixed(1)}`;
  }

  // ---------- build scene ----------
  function build(svg, opts) {
    svg.innerHTML = `<defs>${DEFS}</defs>`;
    const root = el('g', { id: 'character' }, svg);
    const parts = {};
    parts.cape = el('path', { fill: 'url(#gCape)', stroke: INK, 'stroke-width': INKW, 'stroke-linejoin': 'round' }, root);
    parts.capeIn = el('path', { fill: '#5e0612', opacity: '.55' }, root);
    parts.capeTrim = el('path', { fill: 'none', stroke: 'url(#gGold)', 'stroke-width': 6, 'stroke-linecap': 'round' }, root);
    for (const s of ['R', 'L']) {
      parts['thigh' + s] = el('g', {}, root); parts['thigh' + s].innerHTML = ART.thigh;
      parts['shin' + s] = el('g', {}, root); parts['shin' + s].innerHTML = ART.shin;
    }
    parts.neck = el('path', { fill: 'url(#gSkinLimb)', stroke: INK, 'stroke-width': INKW }, root);
    parts.torso = el('g', {}, root); parts.torso.innerHTML = torsoArt();
    parts.tails = el('g', {}, root);
    parts.tailL = el('path', { fill: 'url(#gNavy)', stroke: INK, 'stroke-width': INKW }, parts.tails);
    parts.tailR = el('path', { fill: 'url(#gNavy)', stroke: INK, 'stroke-width': INKW }, parts.tails);
    parts.tie = el('path', { fill: 'url(#gTie)', stroke: INK, 'stroke-width': INKW, 'stroke-linejoin': 'round' }, root);
    parts.tieStripe = el('path', { fill: 'none', stroke: '#ff6f86', 'stroke-width': 2, opacity: '.6' }, root);
    parts.collar = el('g', {}, root); parts.collar.innerHTML = collarArt();
    parts.boltGlow = el('path', { fill: '#7fe9ff', filter: 'url(#fGlowBig)', opacity: 0 }, root);
    // bolt is held over/behind the head (javelin grip); the gripping fist is re-drawn on top later
    parts.bolt = el('g', { opacity: 0 }, root);
    parts.boltBody = el('path', { fill: 'url(#gBolt)', stroke: '#ffffff', 'stroke-width': 1.5, filter: 'url(#fGlow)' }, parts.bolt);
    parts.boltArcs = el('path', { fill: 'none', stroke: '#c9f6ff', 'stroke-width': 2.2, filter: 'url(#fGlow)' }, parts.bolt);
    parts.head = el('g', {}, root); parts.head.innerHTML = HEAD;
    parts.head.querySelector('#laurel').innerHTML = laurelArt();
    for (const s of ['R', 'L']) {
      parts['upper' + s] = el('g', {}, root); parts['upper' + s].innerHTML = ART.upper;
      parts['fore' + s] = el('g', {}, root); parts['fore' + s].innerHTML = ART.fore;
      parts['hand' + s] = el('g', {}, root);
      parts['hand' + s + 'relax'] = el('g', {}, parts['hand' + s]); parts['hand' + s + 'relax'].innerHTML = ART.handRelax;
      parts['hand' + s + 'pose'] = el('g', {}, parts['hand' + s]); parts['hand' + s + 'pose'].innerHTML = s === 'R' ? ART.handClaw : ART.handFist;
    }
    // re-append the bolt fist on top of the bolt so the fingers wrap it
    parts.handLfront = el('g', {}, root); parts.handLfront.innerHTML = ART.handFist;
    parts.skel = el('g', { id: 'skel', opacity: opts && opts.skeleton ? 1 : 0 }, svg);
    return parts;
  }

  const tf = (p, a, sx = 1, sy = 1) => `translate(${p[0].toFixed(2)},${p[1].toFixed(2)}) rotate(${a.toFixed(2)})` + (sx !== 1 || sy !== 1 ? ` scale(${sx.toFixed(3)},${sy.toFixed(3)})` : '');
  const catmull = (pts, closed) => {
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    const n = pts.length;
    for (let i = 0; i < n - (closed ? 0 : 1); i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      const a = i === 0 && !closed ? p1 : p0, b = i + 2 >= n && !closed ? p2 : p3;
      const c1 = [p1[0] + (p2[0] - a[0]) / 6, p1[1] + (p2[1] - a[1]) / 6], c2 = [p2[0] - (b[0] - p1[0]) / 6, p2[1] - (b[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d + (closed ? ' Z' : '');
  };

  // the rig's own joint positions per frame (exported for the frame-by-frame comparison)
  const RIG_JOINTS = [];

  function render(parts, fFloat, opts) {
    const f = clamp(Math.round(fFloat), 0, N - 1);
    const p = P[f], pw = power[f];
    const cape = SIM.cape[f], COLS = SIM.COLS, ROWS = SIM.ROWS;
    // cape outline: top row (shoulders) -> right edge -> hem -> left edge
    const topRow = [], hem = [], leftE = [], rightE = [];
    for (let c = 0; c < COLS; c++) { topRow.push(cape[c]); hem.push(cape[(ROWS - 1) * COLS + c]); }
    for (let r = 0; r < ROWS; r++) { leftE.push(cape[r * COLS]); rightE.push(cape[r * COLS + COLS - 1]); }
    const outline = [...topRow, ...rightE.slice(1), ...hem.slice(0, -1).reverse(), ...leftE.slice(1, -1).reverse()];
    parts.cape.setAttribute('d', catmull(outline, true));
    const inner = [cape[COLS + 1], cape[2 * COLS + 2], cape[3 * COLS + 1], cape[4 * COLS + 2], cape[(ROWS - 1) * COLS + 1], cape[(ROWS - 1) * COLS]];
    parts.capeIn.setAttribute('d', catmull([...inner, ...leftE.slice(1, -1).reverse()], true));
    parts.capeTrim.setAttribute('d', catmull([...hem].reverse(), false));

    // legs
    for (const [s, lg] of [['R', p.legR], ['L', p.legL]]) {
      parts['thigh' + s].setAttribute('transform', tf(lg.hp, lg.ta));
      parts['shin' + s].setAttribute('transform', tf(lg.kn, lg.sa));
    }
    // torso (squash from reference torso length, horizontal squeeze from shoulder-width = body turn)
    parts.torso.setAttribute('transform', tf(p.pelvis, p.torsoA, p.turn, p.torsoLen / R.torso));
    parts.collar.setAttribute('transform', tf(p.pelvis, p.torsoA, p.turn, p.torsoLen / R.torso));
    // coat tails flutter (spring)
    const tl = SIM.tails[f];
    const hw = R.sh_w / 2 * p.turn;
    const tailPath = (sgn) => {
      const a = rot([sgn * (hw + 2), 18], p.torsoA), b = rot([sgn * 30, 22], p.torsoA), c = rot([sgn * (hw - 4) + tl[0] * 1.4, 46 + tl[1]], p.torsoA), d = rot([sgn * 34 + tl[0], 42 + tl[1] * 0.6], p.torsoA);
      const P0 = (q) => [p.pelvis[0] + q[0], p.pelvis[1] + q[1]];
      const A = P0(a), B = P0(b), Cc = P0(c), Dd = P0(d);
      return `M${A[0].toFixed(1)},${A[1].toFixed(1)} L${Cc[0].toFixed(1)},${Cc[1].toFixed(1)} L${Dd[0].toFixed(1)},${Dd[1].toFixed(1)} L${B[0].toFixed(1)},${B[1].toFixed(1)} Z`;
    };
    parts.tailL.setAttribute('d', tailPath(1)); parts.tailR.setAttribute('d', tailPath(-1));

    // head: place so the nose tip lands on the reference nose; roll from the reference eye line.
    // The tilt-back in the power pose is part of the reference roll; look-up shifts the facial features.
    const roll = nrm(p.roll) * 0.9 - 6 * pw;
    const no = rot(NOSE_OFF, roll);
    const hp = [p.nose[0] - no[0], p.nose[1] - no[1]];
    parts.head.setAttribute('transform', tf(hp, roll));
    const look = pw;
    parts.head.querySelector('#feat').setAttribute('transform', `translate(0,${(-5 * look).toFixed(2)})`);
    const shout = smooth(0.35, 0.85, pw);
    parts.head.querySelector('#mouthIdle').setAttribute('opacity', (1 - shout).toFixed(3));
    parts.head.querySelector('#mouthShout').setAttribute('opacity', shout.toFixed(3));
    parts.head.querySelector('#mouthShout').setAttribute('transform', `translate(0,${(-14 * (1 - shout)).toFixed(1)}) scale(1,${(0.3 + 0.7 * shout).toFixed(3)}) translate(0,${(14 * (1 - shout)).toFixed(1)})`);
    parts.head.querySelector('#browR').setAttribute('d', `M-34,${(-84 + 2 * shout).toFixed(1)} Q-21,${(-91 + 1 * shout).toFixed(1)} -7,${(-84 + 7 * shout).toFixed(1)}`);
    parts.head.querySelector('#browL').setAttribute('d', `M34,${(-84 + 2 * shout).toFixed(1)} Q21,${(-91 + 1 * shout).toFixed(1)} 7,${(-84 + 7 * shout).toFixed(1)}`);
    parts.head.querySelector('#irisR').setAttribute('cy', (-71 - 2 * look).toFixed(2));
    parts.head.querySelector('#irisL').setAttribute('cy', (-71 - 2 * look).toFixed(2));
    // hair swoop with spring-driven tip
    const hr = SIM.hair[f];
    const tip = [62 + hr[0] * 1.3, -90 + hr[1]];
    const crest = [8 + hr[0] * 0.4, -166 + hr[1] * 0.3];
    const front = [74 + hr[0] * 0.8, -114 + hr[1] * 0.6];
    const F = (q) => q.map((v) => v.toFixed(1)).join(',');
    parts.head.querySelector('#swoop').setAttribute('d',
      `M-54,-82 C-62,-128 -34,${F([crest[1]])} ${F(crest)} C${F([crest[0] + 40, crest[1] + 2])} ${F([front[0] - 2, front[1] - 26])} ${F(front)} C${F([front[0] + 2, front[1] + 14])} ${F([tip[0] + 6, tip[1] - 6])} ${F(tip)} C${F([tip[0] - 10, tip[1] - 16])} 30,-114 6,-112 C-18,-110 -40,-98 -54,-82 Z`);
    parts.head.querySelector('#swoopHi').setAttribute('d',
      `M-40,-108 C-30,-140 -6,${(crest[1] + 8).toFixed(1)} ${(crest[0] + 14).toFixed(1)},${(crest[1] + 10).toFixed(1)} M-34,-98 C-16,-126 22,-136 ${(front[0] - 16).toFixed(1)},${(front[1] - 4).toFixed(1)} M-24,-90 C-4,-110 30,-118 ${(tip[0] - 8).toFixed(1)},${(tip[1] - 8).toFixed(1)}`);

    // neck quad between collar (torso space) and jaw (head space)
    const tW = (q) => { const r = rot([q[0] * p.turn, q[1] * (p.torsoLen / R.torso)], p.torsoA); return [p.pelvis[0] + r[0], p.pelvis[1] + r[1]]; };
    const hW = (q) => { const r = rot(q, roll); return [hp[0] + r[0], hp[1] + r[1]]; };
    const n1 = tW([-22, -R.torso + 6]), n2 = tW([22, -R.torso + 6]), n3 = hW([24 * HS, -14 * HS]), n4 = hW([-24 * HS, -14 * HS]);
    parts.neck.setAttribute('d', `M${n1.join(',')} L${n2.join(',')} L${n3.join(',')} L${n4.join(',')} Z`);

    // tie: tapered ribbon along the simulated chain
    const T = SIM.tie[f];
    const left = [], right = [];
    for (let i = 0; i < T.length; i++) {
      const a = T[Math.max(0, i - 1)], b = T[Math.min(T.length - 1, i + 1)];
      const d = [b[0] - a[0], b[1] - a[1]], L = Math.hypot(d[0], d[1]) || 1, nx = -d[1] / L, ny = d[0] / L;
      const w = lerp(8, 17, i / (T.length - 1));
      left.push([T[i][0] + nx * w, T[i][1] + ny * w]); right.push([T[i][0] - nx * w, T[i][1] - ny * w]);
    }
    const last = T[T.length - 1], prev = T[T.length - 2];
    const dd = [last[0] - prev[0], last[1] - prev[1]], LL = Math.hypot(dd[0], dd[1]) || 1;
    const tipP = [last[0] + dd[0] / LL * 18, last[1] + dd[1] / LL * 18];
    parts.tie.setAttribute('d', catmull(left, false) + ` L${tipP[0].toFixed(1)},${tipP[1].toFixed(1)} L` + right.slice().reverse().map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' L') + ' Z');
    parts.tieStripe.setAttribute('d', T.slice(1).map((q, i) => { const a = [q[0] - 9, q[1] + 6], b = [q[0] + 9, q[1] - 6]; return `M${a[0].toFixed(1)},${a[1].toFixed(1)} L${b[0].toFixed(1)},${b[1].toFixed(1)}`; }).join(' '));

    // arms + hands
    const boltOn = smooth(0.45, 0.8, pw);
    for (const [s, a] of [['R', p.Rr], ['L', p.L]]) {
      parts['upper' + s].setAttribute('transform', tf(a.sh, a.ua));
      parts['fore' + s].setAttribute('transform', tf(a.el, a.fa));
      parts['hand' + s].setAttribute('transform', tf(a.wr, a.ha));
      const k = s === 'R' ? smooth(0.3, 0.75, pw) : boltOn;
      parts['hand' + s + 'relax'].setAttribute('opacity', (1 - k).toFixed(3));
      parts['hand' + s + 'pose'].setAttribute('opacity', s === 'L' ? 0 : k.toFixed(3));
    }
    // bolt: perpendicular to the left forearm, centred in the fist
    const a = p.L;
    const bAng = a.ha + 33;
    const bc = add(a.wr, dir(a.ha), 22);
    const crackle = Math.max(M.sec.held_prop[f], 0.35);
    parts.bolt.setAttribute('opacity', boltOn.toFixed(3));
    parts.bolt.setAttribute('transform', tf(bc, bAng, 0.4 + 0.6 * boltOn, 0.4 + 0.6 * boltOn));
    parts.boltBody.setAttribute('d', boltPath(3, 270, 13));
    let arcs = '';
    for (let i = 0; i < 5; i++) {
      const sd = f * 7 + i * 31, x0 = lerp(-70, 180, hash(sd)), y0 = (hash(sd + 1) - 0.5) * 14;
      arcs += arcPath(sd, x0, y0, x0 + (hash(sd + 2) - 0.5) * 90, y0 + (hash(sd + 3) - 0.5) * 70 * crackle, 6, 9) + ' ';
    }
    parts.boltArcs.setAttribute('d', arcs);
    parts.boltArcs.setAttribute('opacity', clamp(0.35 + crackle * 0.6, 0, 1).toFixed(3));
    parts.boltGlow.setAttribute('d', boltPath(3, 270, 13));
    parts.boltGlow.setAttribute('transform', tf(bc, bAng));
    parts.boltGlow.setAttribute('opacity', (boltOn * (0.45 + 0.35 * crackle)).toFixed(3));
    parts.handLfront.setAttribute('transform', tf(a.wr, a.ha));
    parts.handLfront.setAttribute('opacity', boltOn.toFixed(3));

    // skeleton overlay (rig joints) for comparison renders
    const J = { nose: p.nose, l_shoulder: p.L.sh, r_shoulder: p.Rr.sh, l_elbow: p.L.el, r_elbow: p.Rr.el, l_wrist: p.L.wr, r_wrist: p.Rr.wr,
                l_hip: p.legL.hp, r_hip: p.legR.hp, l_knee: p.legL.kn, r_knee: p.legR.kn, l_ankle: p.legL.an, r_ankle: p.legR.an, neck: p.neck, pelvis: p.pelvis };
    RIG_JOINTS[f] = J;
    if (opts && opts.skeleton) {
      const E = [['l_shoulder', 'r_shoulder'], ['l_shoulder', 'l_elbow'], ['l_elbow', 'l_wrist'], ['r_shoulder', 'r_elbow'], ['r_elbow', 'r_wrist'], ['neck', 'pelvis'], ['neck', 'nose'], ['l_hip', 'r_hip'], ['l_hip', 'l_knee'], ['l_knee', 'l_ankle'], ['r_hip', 'r_knee'], ['r_knee', 'r_ankle']];
      parts.skel.innerHTML = E.map(([u, v]) => `<line x1="${J[u][0]}" y1="${J[u][1]}" x2="${J[v][0]}" y2="${J[v][1]}" stroke="${u.startsWith('l_') ? '#00ff66' : u.startsWith('r_') ? '#ff8800' : '#00e5ff'}" stroke-width="4"/>`).join('') +
        Object.values(J).map((q) => `<circle cx="${q[0]}" cy="${q[1]}" r="5" fill="#ff1744"/>`).join('');
    }
    return { power: pw, joints: J };
  }

  window.ThunderRig = { build, render, N, power, P, SIM, RIG_JOINTS, pose, hash, noise1, arcPath, lerp, clamp, smooth };
})();
