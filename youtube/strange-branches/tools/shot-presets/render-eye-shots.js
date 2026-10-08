// Renders the Floating Eye shot presets (struggle / drift / notice / crashzoom) frame by frame.
const { chromium } = require('playwright'); const fs = require('fs');
const S = process.env.S, FPS = 24;
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), ease = x => { x = cl(x); return x * x * (3 - 2 * x); };
const lerp = (a, b, u) => a + (b - a) * u, lerp3 = (a, b, u) => a.map((v, i) => lerp(v, b[i], u));
const after = (tau, at, k) => tau >= at ? Math.exp(-(tau - at) * k) : 0;
const base = { lc: 0, gOff: [0, 0], pupil: 0.085, open: 1, pulse: 0, exposure: 1, figYank: 0, figUp: 0, figLean: 0, figShake: 0 };
const BEATS = {
  // the wounded knight tries to rise, the tendril yanks them back down twice
  struggle: { dur: 3, at(tau, u, port) {
    const up1 = ease(tau / 1.1) * (1 - ease((tau - 1.2) / 0.12)), up2 = ease((tau - 1.7) / 0.6) * (1 - ease((tau - 2.45) / 0.12)) * 0.6;
    const yank = Math.max(after(tau, 1.2, 4), 0.7 * after(tau, 2.45, 4));
    return { shot: { ...base, figUp: 0.5 * Math.max(up1, up2), figLean: -0.22 * Math.max(up1, up2), figYank: yank * 2.4, figShake: Math.max(up1, up2) + yank, pulse: 0.6 * yank, pupil: 0.07 },
      cam: port ? { pos: lerp3([-0.9, 0.8, 10], [-0.9, 0.9, 9], ease(u)), look: [-1.7, 3.6, 0], fov: 68 } : { pos: lerp3([-0.6, 0.7, 9], [-0.6, 0.8, 8], ease(u)), look: [-1.6, 2.6, 0], fov: 50 } };
  } },
  // calm establishing shot: slow upward drift, the great eye looks away
  drift: { dur: 3, at(tau, u, port) {
    return { shot: { ...base, gOff: [-0.12, 0.2], pupil: 0.09 },
      cam: port ? { pos: lerp3([0, 3, 40], [0, 8, 36], ease(u)), look: lerp3([0, 8, -20], [0, 12, -20], ease(u)), fov: 74 } : { pos: lerp3([0, 4, 32], [0, 8, 28], ease(u)), look: lerp3([0, 9, -20], [0, 11.5, -20], ease(u)), fov: 46 } };
  } },
  // the great eye and every small eye snap onto the viewer
  notice: { dur: 3, at(tau, u, port) {
    const snap = ease((tau - 1.0) / 0.35), thump = after(tau, 1.35, 5), sh = 0.25 * thump;
    const c = port ? { pos: [0, 11, 2], look: [0, 13, -40], fov: 66 } : { pos: [0, 11, -6], look: [0, 13, -40], fov: 46 };
    return { shot: { ...base, lc: snap, gOff: [lerp(-0.12, 0, snap), lerp(0.2, 0, snap)], pupil: lerp(0.11, 0.04, snap), pulse: 0.5 * thump },
      cam: { pos: c.pos.map((v, i) => v + (i < 2 ? sh * Math.sin(tau * (i ? 61 : 73)) : 0)), look: c.look, fov: c.fov } };
  } },
  // fast push straight into the pupil, glitch, cut to black
  crashzoom: { dur: 2, at(tau, u, port) {
    const k = Math.pow(cl((tau - 0.25) / 1.0), 3), start = port ? [0, 11, 2] : [0, 11, -6];
    return { shot: { ...base, lc: 1, pupil: lerp(0.04, 0.16, k), pulse: 0.15 + 0.85 * cl((tau - 0.95) / 0.3), exposure: 1 - cl((tau - 1.3) / 0.3) },
      cam: { pos: lerp3(start, [0, 13, -24], k), look: [0, 13, -40], fov: lerp(port ? 66 : 46, 16, k) } };
  } },
};
(async () => {
  const [file, out] = process.argv.slice(2), which = (process.env.BEATS || 'struggle,drift,notice,crashzoom').split(','), ports = (process.env.PORTS || '0,1').split(',').map(Number), step = +(process.env.STEP || 1);
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  for (const port of ports) {
    const p = await b.newPage({ viewport: port ? { width: 1134, height: 2016 } : { width: 2016, height: 1134 } });
    await p.route('**/three.min.js', r => r.fulfill({ path: S + '/npmthree/package/build/three.min.js', contentType: 'text/javascript' }));
    p.on('pageerror', e => console.log('ERR', e.message));
    await p.goto('file://' + file);
    await p.addStyleTag({ content: '#cv{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;max-width:none!important;max-height:none!important;aspect-ratio:auto!important}' });
    await p.waitForTimeout(1200); await p.evaluate(() => dispatchEvent(new Event('resize')));
    await p.keyboard.press('r'); await p.waitForTimeout(400); await p.evaluate(() => SB.setState('none'));
    for (const name of which) {
      const B = BEATS[name], N = Math.round(B.dur * FPS), dir = `${out}/${name}-${port ? '9x16' : '16x9'}`; fs.mkdirSync(dir, { recursive: true });
      for (let f = 0; f < N; f += step) {
        const tau = f / FPS, st = B.at(tau, f / (N - 1), port);
        const d = await p.evaluate(([st, t]) => { window.SHOT = st.shot; window.CAMO = st.cam; SB.renderAt(t); return document.getElementById('cv').toDataURL('image/png'); }, [st, 1 + tau]);
        fs.writeFileSync(`${dir}/f${String(f).padStart(4, '0')}.png`, Buffer.from(d.split(',')[1], 'base64'));
      }
      console.log('done', name, port);
    }
    await p.close();
  }
  await b.close();
})();
