// Renders the Ascension shot presets (strain / wrath / lunge) frame by frame.
const { chromium } = require('playwright'); const fs = require('fs');
const S = process.env.S, FPS = 24;
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), ease = x => { x = cl(x); return x * x * (3 - 2 * x); };
const easeOut = x => 1 - Math.pow(1 - cl(x), 3), lerp = (a, b, u) => a + (b - a) * u, lerp3 = (a, b, u) => a.map((v, i) => lerp(v, b[i], u));
const after = (tau, at, k) => tau >= at ? Math.exp(-(tau - at) * k) : 0;
const BEATS = {
  strain: { dur: 3, at(tau, u, port) {
    const s = ease(u / 0.35), surge = s * (0.6 + 0.4 * Math.abs(Math.sin(tau * 5)));
    return { shot: { shake: 0.18 * surge + 0.25 * after(tau, 2.2, 5), strain: surge + after(tau, 2.2, 3), tilt: 0.9 + 0.05 * Math.sin(tau * 7) * s, lunge: -0.3 * s, lean: -0.04 * s,
        open: 0.2, gaze: [-0.1, -0.5], pupil: 0.09, pulse: 0.1 * s + 0.55 * after(tau, 2.2, 7), sparkAge: tau >= 2.2 ? tau - 2.2 : -1, drip: 0.5 + 0.5 * s },
      cam: port ? { pos: lerp3([0, 11, 4], [0, 12, -4], ease(u)), look: [0, 12.5, -41], fov: 70 } : { pos: lerp3([0, 11, -6], [0, 12, -12], ease(u)), look: [0, 12.5, -41], fov: 46 } };
  } },
  wrath: { dur: 3, at(tau, u, port) {
    const lift = ease((u - 0.15) / 0.5), glare = cl((u - 0.6) / 0.06);
    return { shot: { shake: 0.04 + 0.05 * glare, strain: 0.3, tilt: 0.9 - 0.8 * lift, lunge: 0, lean: 0, open: lerp(0.2, 0.55, glare), gaze: [lerp(-0.1, 0, lift), lerp(-0.5, 0, lift)],
        pupil: lerp(0.09, 0.045, glare), pulse: 0.05 + 0.6 * after(tau, 1.85, 6), sparkAge: -1, drip: 1 },
      cam: port ? { pos: lerp3([0, 14.5, -17], [0, 16, -24], ease(u)), look: [0, 17.3, -41], fov: 62 } : { pos: lerp3([0, 15, -19], [0, 17, -27], ease(u)), look: [0, 17.3, -41], fov: 42 } };
  } },
  lunge: { dur: 2.5, at(tau, u, port) {
    const T = 0.65; let lunge, lean;
    if (tau < 0.4) { lunge = -1.5 * ease(tau / 0.4); lean = -0.08 * ease(tau / 0.4); }
    else if (tau < T) { const k = easeOut((tau - 0.4) / (T - 0.4)); lunge = lerp(-1.5, 9, k); lean = lerp(-0.08, 0.2, k); }
    else { const d = Math.exp(-(tau - T) * 4) * Math.cos((tau - T) * 16); lunge = 4 + 5 * d; lean = 0.1 + 0.1 * d; }
    const sh = 0.6 * after(tau, T, 4), cs = [sh * Math.sin(tau * 71), sh * Math.sin(tau * 59), 0];
    const base = port ? { pos: [0, 14.5, -4], look: [0, 17, -41], fov: 66 } : { pos: [0, 15, -8], look: [0, 17, -41], fov: 46 };
    return { shot: { shake: tau >= T ? 0.5 * after(tau, T, 3) : 0.05, strain: tau >= T ? 1.5 * after(tau, T, 2) : 0.4, tilt: 0.1, lunge, lean, open: 0.7, gaze: [0, 0], pupil: 0.04,
        pulse: tau >= T ? after(tau, T, 3) : 0.1, sparkAge: tau >= T ? tau - T : -1, drip: 1 },
      cam: { pos: base.pos.map((v, i) => v + cs[i]), look: base.look, fov: base.fov } };
  } },
};
(async () => {
  const [file, out] = process.argv.slice(2), which = (process.env.BEATS || 'strain,wrath,lunge').split(','), ports = (process.env.PORTS || '0,1').split(',').map(Number), step = +(process.env.STEP || 1);
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 860 } });
  await p.route('**/three.min.js', r => r.fulfill({ path: S + '/npmthree/package/build/three.min.js', contentType: 'text/javascript' }));
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + file); await p.waitForTimeout(1500); await p.evaluate(() => SB.setState('none'));
  for (const port of ports) {
    await p.evaluate(port => port ? SB.setExport(720, 1280, true) : SB.setExport(1280, 720, false), port);
    for (const name of which) {
      const B = BEATS[name], N = Math.round(B.dur * FPS), dir = `${out}/${name}-${port ? '9x16' : '16x9'}`; fs.mkdirSync(dir, { recursive: true });
      for (let f = 0; f < N; f += step) {
        const tau = f / FPS, st = B.at(tau, f / (N - 1), port);
        const d = await p.evaluate(([st, t]) => { window.SHOT = st.shot; window.CAMO = st.cam; SB.renderAt(t); return document.getElementById('cv').toDataURL('image/png'); }, [st, 2 + tau]);
        fs.writeFileSync(`${dir}/f${String(f).padStart(4, '0')}.png`, Buffer.from(d.split(',')[1], 'base64'));
      }
      console.log('done', name, port);
    }
  }
  await b.close();
})();
