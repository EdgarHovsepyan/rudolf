/* Scene: original stormy-sky backdrop + lightning strike / bloom VFX timed from the reference, around the rig.
 * modes: 'char'  = motion-transfer pass (neutral backdrop, no strike/bloom, so body motion is fully visible)
 *        'full'  = full reconstruction (backdrop, strikes, bloom, crackle) on the reference timeline
 */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const M = window.MOTION, RIG = window.ThunderRig;
  const { hash, noise1, arcPath, lerp, clamp } = RIG;
  const W = 480, H = 1200;

  // Strike timing measured on the reference (frames at 30 fps, excerpt-relative).
  const STRIKES = [{ start: 15, peak: 17, end: 19 }, { start: 76, peak: 78, end: 80 }];
  const bloomAt = (f) => Math.pow(clamp((M.flash[clamp(f, 0, M.n - 1)] - 0.3) / 0.7, 0, 1), 0.7);

  function el(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }

  function backdrop(g, mode) {
    if (mode === 'char') {
      g.innerHTML = `<defs><radialGradient id="bgN" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="#3a4256"/><stop offset="1" stop-color="#151925"/></radialGradient></defs>
        <rect width="${W}" height="${H}" fill="url(#bgN)"/>
        <g stroke="#ffffff" stroke-opacity=".05">${Array.from({ length: 13 }, (_, i) => `<line x1="0" y1="${i * 100}" x2="${W}" y2="${i * 100}"/>`).join('')}${Array.from({ length: 6 }, (_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="${H}"/>`).join('')}</g>`;
      return;
    }
    // Original backdrop: deep storm-blue sky, golden god-rays behind the figure, drifting cumulus banks, distant marble terrace.
    let clouds = '';
    for (let i = 0; i < 26; i++) {
      const x = hash(i * 3.1) * W, y = 760 + hash(i * 5.7) * 460, r = 70 + hash(i * 1.3) * 110;
      clouds += `<ellipse class="cl" data-i="${i}" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${r.toFixed(0)}" ry="${(r * 0.55).toFixed(0)}" fill="url(#gCloud)" opacity="${(0.55 + 0.4 * hash(i * 7.7)).toFixed(2)}"/>`;
    }
    let hiClouds = '';
    for (let i = 0; i < 10; i++) {
      const x = hash(i * 9.1 + 4) * W, y = 60 + hash(i * 2.9 + 1) * 380, r = 60 + hash(i * 4.4) * 90;
      hiClouds += `<ellipse class="ch" data-i="${i}" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${r.toFixed(0)}" ry="${(r * 0.35).toFixed(0)}" fill="#3b5a8c" opacity=".35"/>`;
    }
    let stars = '';
    for (let i = 0; i < 40; i++) stars += `<circle cx="${(hash(i * 11.3) * W).toFixed(0)}" cy="${(hash(i * 6.1) * 520).toFixed(0)}" r="${(0.8 + hash(i) * 1.6).toFixed(1)}" fill="#e8f4ff" opacity="${(0.3 + hash(i * 2.2) * 0.6).toFixed(2)}"/>`;
    let rays = '';
    for (let i = 0; i < 12; i++) { const a = -90 + (i - 5.5) * 13; rays += `<path d="M240,520 L${(240 + Math.cos(a * Math.PI / 180) * 900).toFixed(0)},${(520 + Math.sin(a * Math.PI / 180) * 900).toFixed(0)} L${(240 + Math.cos((a + 5) * Math.PI / 180) * 900).toFixed(0)},${(520 + Math.sin((a + 5) * Math.PI / 180) * 900).toFixed(0)} Z" fill="#ffd36a"/>`; }
    let columns = '';
    for (let i = 0; i < 7; i++) { const x = 10 + i * 78; columns += `<rect x="${x}" y="1010" width="26" height="150" fill="#9fb2d1" opacity=".55"/><rect x="${x - 6}" y="1002" width="38" height="10" fill="#b8c7e0" opacity=".6"/>`; }
    g.innerHTML = `<defs>
        <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050b1f"/><stop offset=".45" stop-color="#11285a"/><stop offset=".8" stop-color="#1f4f86"/><stop offset="1" stop-color="#2d6a9e"/></linearGradient>
        <radialGradient id="gHalo" cx=".5" cy=".43" r=".5"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".55"/><stop offset=".5" stop-color="#ffb84a" stop-opacity=".12"/><stop offset="1" stop-color="#ffb84a" stop-opacity="0"/></radialGradient>
        <radialGradient id="gCloud" cx=".45" cy=".35" r=".65"><stop offset="0" stop-color="#c7d8f0"/><stop offset=".55" stop-color="#6f8fbe"/><stop offset="1" stop-color="#2a4675" stop-opacity="0"/></radialGradient>
        <filter id="fBlurBg"><feGaussianBlur stdDeviation="3"/></filter>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#gSky)"/>
      <g id="stars">${stars}</g>
      <g id="rays" opacity=".10">${rays}</g>
      <rect width="${W}" height="${H}" fill="url(#gHalo)" id="halo"/>
      <g id="hiClouds" filter="url(#fBlurBg)">${hiClouds}</g>
      <g id="terrace">${columns}<rect x="0" y="1150" width="${W}" height="50" fill="#8ea3c6" opacity=".5"/></g>
      <g id="clouds" filter="url(#fBlurBg)">${clouds}</g>`;
  }

  function strikePath(seed, x0, y0, x1, y1) {
    // main jagged channel plus two branches
    let d = arcPath(seed, x0, y0, x1, y1, 14, 22);
    for (let b = 0; b < 3; b++) {
      const t = 0.25 + hash(seed + b * 7) * 0.5, bx = lerp(x0, x1, t) + (hash(seed + b) - 0.5) * 30, by = lerp(y0, y1, t);
      d += ' ' + arcPath(seed + 50 + b, bx, by, bx + (hash(seed + b * 3) - 0.5) * 160, by + 80 + hash(seed + b * 5) * 120, 7, 12);
    }
    return d;
  }

  function mount(container, opts) {
    const mode = opts.mode || 'full';
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: opts.width || W, height: opts.height || H, xmlns: NS, 'shape-rendering': 'geometricPrecision' }, container);
    svg.style.display = 'block';
    const bg = el('g', { id: 'bg' }, svg);
    backdrop(bg, mode);
    const charSvg = el('g', { id: 'charLayer' }, svg);
    // the rig builds into its own <g>; reuse its build by giving it a nested svg group
    const holder = el('svg', { x: 0, y: 0, width: W, height: H, viewBox: `0 0 ${W} ${H}`, overflow: 'visible' }, charSvg);
    const parts = RIG.build(holder, { skeleton: !!opts.skeleton });
    const fx = el('g', { id: 'fx' }, svg);
    fx.innerHTML = `<defs><radialGradient id="gBloom" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#e8fbff" stop-opacity=".9"/><stop offset="1" stop-color="#9fe8ff" stop-opacity="0"/></radialGradient>
      <filter id="fStrike" x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <path id="strike" fill="none" stroke="#f4fdff" stroke-width="5" stroke-linejoin="round" filter="url(#fStrike)" opacity="0"/>
      <ellipse id="bloom" cx="240" cy="560" rx="260" ry="420" fill="url(#gBloom)" opacity="0"/>
      <rect id="whiteout" width="${W}" height="${H}" fill="#eaf9ff" opacity="0"/>`;
    const st = { svg, parts, mode, opts };
    return st;
  }

  function frame(st, f) {
    const { parts, mode } = st;
    const fi = clamp(Math.round(f), 0, M.n - 1);
    const out = RIG.render(parts, fi, st.opts);
    const svg = st.svg;
    if (mode === 'full') {
      // slow cloud drift (environment life; camera is locked like the reference)
      svg.querySelectorAll('#clouds .cl').forEach((c) => { const i = +c.dataset.i; c.setAttribute('transform', `translate(${(Math.sin(fi / 30 * 0.7 + i) * 6 - fi * 0.25 * (i % 3 + 1)).toFixed(2)},${(Math.cos(fi / 30 * 0.9 + i) * 3).toFixed(2)})`); });
      svg.querySelectorAll('#hiClouds .ch').forEach((c) => { const i = +c.dataset.i; c.setAttribute('transform', `translate(${(-fi * 0.15 * (i % 2 + 1)).toFixed(2)},0)`); });
      svg.querySelector('#rays').setAttribute('opacity', (0.08 + 0.10 * out.power + 0.04 * noise1(fi / 5, 2)).toFixed(3));
      // lightning strikes from the top of frame into the chest
      const strike = svg.querySelector('#strike');
      let sOp = 0, sd = '';
      for (const s of STRIKES) {
        if (fi >= s.start && fi <= s.end) {
          const j = out.joints;
          const tx = (j.l_shoulder[0] + j.r_shoulder[0]) / 2, ty = (j.l_shoulder[1] + j.r_shoulder[1]) / 2 + 40;
          sOp = fi === s.peak ? 1 : 0.75;
          sd = strikePath(s.start * 17 + fi, tx + 30, -20, tx, ty);
        }
      }
      strike.setAttribute('d', sd); strike.setAttribute('opacity', sOp);
      // white bloom follows the reference bloom-coverage curve frame by frame
      const fl = bloomAt(fi);
      const bloom = svg.querySelector('#bloom');
      const j = out.joints;
      bloom.setAttribute('cx', ((j.l_shoulder[0] + j.r_shoulder[0]) / 2).toFixed(1));
      bloom.setAttribute('cy', (j.pelvis[1] - 60).toFixed(1));
      bloom.setAttribute('opacity', clamp(fl * 1.15, 0, 1).toFixed(3));
      svg.querySelector('#whiteout').setAttribute('opacity', clamp((fl - 0.55) * 0.9, 0, 0.5).toFixed(3));
    }
    return out;
  }

  window.ThunderScene = { mount, frame, backdrop, strikePath, bloomAt, STRIKES, N: M.n, FPS: M.fps, W, H };
})();
