// Deterministic frame renderer: loads scene.html in headless Chromium, seeks each frame, screenshots it.
// usage: node render_frames.js <outDir> <mode> [skel=0|1] [frames=all|a,b,c] [jointsOut.json]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
(async () => {
  const [outDir, mode = 'full', skel = '0', which = 'all', jointsOut] = process.argv.slice(2);
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 720, height: 1800 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  const url = 'file://' + path.resolve(__dirname, 'scene.html') + `?mode=${mode}&skel=${skel}`;
  await page.goto(url);
  await page.waitForFunction(() => window.__ready === true);
  const n = await page.evaluate(() => ThunderScene.N);
  const frames = which === 'all' ? [...Array(n).keys()] : which.split(',').map(Number);
  const joints = {};
  for (const f of frames) {
    const res = await page.evaluate((f) => { const o = window.__setFrame(f); return { power: o.power, joints: o.joints }; }, f);
    joints[f] = res;
    await page.screenshot({ path: path.join(outDir, `f${String(f + 1).padStart(3, '0')}.png`), clip: { x: 0, y: 0, width: 720, height: 1800 } });
  }
  if (jointsOut) fs.writeFileSync(jointsOut, JSON.stringify(joints));
  if (errors.length) { console.error('PAGE ERRORS:\n' + errors.join('\n')); process.exitCode = 2; }
  console.log(`rendered ${frames.length} frames (${mode}) -> ${outDir}`);
  await browser.close();
})();
