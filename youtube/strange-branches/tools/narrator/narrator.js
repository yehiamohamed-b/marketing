// BILL DINGUS: Strange Branches intro / outro + scenario clips. Pure canvas 2D, deterministic.
// render(canvas, t, mode, W, H, { overlay }) ; modes: intro, outro (10 s) ; think, frustrated (4 s loops) ; spiritgun (4 s one-shot)
(() => {
  const TAU = Math.PI * 2;
  const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const ease = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const easeOut = x => 1 - Math.pow(1 - cl(x), 3);
  const easeIn = x => Math.pow(cl(x), 3);
  const lerp = (a, b, u) => a + (b - a) * u;
  const after = (t, at, k) => t >= at ? Math.exp(-(t - at) * k) : 0;
  const frac = x => x - Math.floor(x);
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const INK = '#0b0b0d', PAPER = '#f6f5ef', CREAM = '#efe6cf', AMBER = '#e0a020', VIOLET = '#8a4fd8';

  // ---------- 3D value noise ----------
  function h3(i, j, k) { let n = Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(k, 1274126177); n = Math.imul(n ^ (n >>> 13), 1274126177); n ^= n >>> 16; return (n >>> 0) / 4294967295; }
  function vn(x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
    const a = lerp(lerp(h3(xi, yi, zi), h3(xi + 1, yi, zi), u), lerp(h3(xi, yi + 1, zi), h3(xi + 1, yi + 1, zi), u), v);
    const b = lerp(lerp(h3(xi, yi, zi + 1), h3(xi + 1, yi, zi + 1), u), lerp(h3(xi, yi + 1, zi + 1), h3(xi + 1, yi + 1, zi + 1), u), v);
    return lerp(a, b, w);
  }
  const fbm = (x, y, z) => (vn(x, y, z) * 0.5 + vn(x * 2.03, y * 2.03, z * 1.7) * 0.25 + vn(x * 4.1, y * 4.1, z * 2.3) * 0.125) / 0.875;

  // ---------- glow sprites ----------
  function glowSprite(core, halo, rim) { const k = document.createElement('canvas'); k.width = k.height = 64; const g = k.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    if (rim) { gr.addColorStop(0, core); gr.addColorStop(0.42, core); gr.addColorStop(0.55, rim); gr.addColorStop(1, 'rgba(0,0,0,0)'); } else { gr.addColorStop(0, core); gr.addColorStop(0.25, halo); gr.addColorStop(1, 'rgba(0,0,0,0)'); }
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return k; }
  const SPR = { white: glowSprite('rgba(255,255,255,1)', 'rgba(255,240,210,0.55)'), amber: glowSprite('rgba(255,236,190,1)', 'rgba(224,160,32,0.6)'), green: glowSprite('rgba(220,255,235,1)', 'rgba(95,224,160,0.55)'),
    violet: glowSprite('rgba(240,220,255,1)', 'rgba(138,79,216,0.6)'), dark: glowSprite('rgba(6,4,10,1)', null, 'rgba(150,90,230,0.85)') };
  const spr = (c, s, x, y, r) => { if (r > 0.05) c.drawImage(s, x - r, y - r, r * 2, r * 2); };

  // ---------- fixed scene data ----------
  const STARS = Array.from({ length: 170 }, () => [(rnd() - 0.5) * 2400, (rnd() - 0.5) * 1700 - 100, 0.6 + rnd() * 1.6, rnd()]);
  const MATTER = Array.from({ length: 150 }, (_, i) => {
    const dark = i % 3 === 0, side = rnd() < 0.5 ? -1 : 1, x0 = side * (60 + rnd() * 660);
    return { dark, x0, y0: 300 + rnd() * 30, x1: x0 * (0.8 + rnd() * 0.35), y1: -460 + rnd() * 690, size: dark ? 7 + Math.pow(rnd(), 2) * 16 : 2 + rnd() * 5, amber: rnd() < 0.35,
      ts: 2.0 + rnd() * 1.8, dur: 1.3 + rnd() * 1.2, front: rnd() < 0.25, ph: rnd() * TAU, speed: 900 + rnd() * 800 };
  });
  const BITS = Array.from({ length: 46 }, () => ({ a: rnd() * TAU, r: 150 + rnd() * 280, s: 2 + rnd() * 5, d: rnd() * 0.5, dark: rnd() < 0.3 }));
  const STRANDS = Array.from({ length: 7 }, (_, i) => ({ a: -Math.PI / 2 + (i / 6 - 0.5) * 3.0 + (rnd() - 0.5) * 0.2, len: 130 + rnd() * 120 - Math.abs(i - 3) * 8, r0: 56 + rnd() * 12, curl: 0.5 + rnd() * 0.5, ph: rnd() * TAU, jit: Array.from({ length: 14 }, () => [(rnd() - 0.5) * 1.1, 0.7 + rnd() * 0.6]) }));
  const CRACKS = Array.from({ length: 14 }, () => { let x = (rnd() - 0.5) * 1300, y = 312 + rnd() * 120; const pts = [[x, y]]; for (let k = 0; k < 5; k++) { x += (rnd() - 0.5) * 120; y += rnd() * 22; pts.push([x, y]); } return pts; });
  const LAND = Array.from({ length: 6 }, () => ({ a: rnd() * TAU, lat: (rnd() - 0.5) * 1.4, r: 0.25 + rnd() * 0.3 }));
  const SPEED = Array.from({ length: 70 }, () => [rnd() * TAU, 0.25 + rnd() * 0.5, 1 + rnd() * 5]);
  const GALAXY = Array.from({ length: 260 }, (_, i) => { const arm = i % 2, u = Math.pow(rnd(), 0.7); return { arm, u, jit: (rnd() - 0.5) * 0.5, col: rnd() < 0.15 ? 'violet' : rnd() < 0.3 ? 'green' : 'white', s: 1.5 + rnd() * 3, v: [(rnd() - 0.5), (rnd() - 0.5)], sp: 300 + rnd() * 900 }; });
  let grain = null;

  // ---------- figure ----------
  const SH_R = [70, -174], SH_L = [-70, -174];
  const armA = (sh, ua, fa, L1 = 114, L2 = 102) => { const e = [sh[0] + Math.cos(ua) * L1, sh[1] + Math.sin(ua) * L1], w = [e[0] + Math.cos(fa) * L2, e[1] + Math.sin(fa) * L2]; return { e, w, h: [w[0] + Math.cos(fa) * 26, w[1] + Math.sin(fa) * 26] }; };
  const mixArm = (A, B, u) => ({ e: [lerp(A.e[0], B.e[0], u), lerp(A.e[1], B.e[1], u)], w: [lerp(A.w[0], B.w[0], u), lerp(A.w[1], B.w[1], u)], h: [lerp(A.h[0], B.h[0], u), lerp(A.h[1], B.h[1], u)], pose: u > 0.5 ? B.pose : A.pose, front: u > 0.5 ? B.front : A.front });
  const REST_R = s => armA(SH_R, 1.41 - 0.1 * s, 1.51 - 0.2 * s), REST_L = s => armA(SH_L, Math.PI - 1.41 + 0.1 * s, Math.PI - 1.51 + 0.2 * s);
  function capsule(c, a, b, wa, wb) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    c.beginPath(); c.moveTo(a[0] + nx * wa / 2, a[1] + ny * wa / 2); c.lineTo(b[0] + nx * wb / 2, b[1] + ny * wb / 2); c.lineTo(b[0] - nx * wb / 2, b[1] - ny * wb / 2); c.lineTo(a[0] - nx * wa / 2, a[1] - ny * wa / 2); c.fill();
    c.beginPath(); c.arc(a[0], a[1], wa / 2, 0, TAU); c.fill(); c.beginPath(); c.arc(b[0], b[1], wb / 2, 0, TAU); c.fill();
  }
  function smoothClosed(c, pts) { c.beginPath(); const n = pts.length; for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; if (i === 0) c.moveTo(m[0], m[1]); else c.quadraticCurveTo(p[0], p[1], m[0], m[1]); } const p = pts[0], q = pts[1]; c.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); c.closePath(); }
  // silhouette hands: palm + four fingers + thumb, posed per gesture
  function handFrame(A) {
    const w = A.w, dx = A.h[0] - w[0], dy = A.h[1] - w[1], L = Math.hypot(dx, dy) || 1, u = [dx / L, dy / L];
    let v = [-u[1], u[0]]; if (v[0] * -w[0] + v[1] * (-110 - w[1]) < 0) v = [-v[0], -v[1]];
    const HS = 1.35, P = (a, b) => [w[0] + (u[0] * a + v[0] * b) * HS, w[1] + (u[1] * a + v[1] * b) * HS], D = th => [u[0] * Math.cos(th) + v[0] * Math.sin(th), u[1] * Math.cos(th) + v[1] * Math.sin(th)];
    return { u, v, P, D };
  }
  function handTip(A) { const { P } = handFrame(A); return A.pose === 'point' ? P(43, 6) : P(30, 0); }
  function hand(c, A) {
    const { v, P, D } = handFrame(A), HS = 1.35, pose = A.pose || 'relaxed', fing = (b, d, l, wd) => capsule(c, b, [b[0] + d[0] * l * HS, b[1] + d[1] * l * HS], wd * HS, wd * 0.82 * HS);
    if (pose === 'fist' || pose === 'point') {
      capsule(c, P(-2, 0), P(13, 0), 20 * HS, 23 * HS); for (let i = 0; i < 4; i++) { c.beginPath(); const k = P(16, (i - 1.5) * 4.8); c.arc(k[0], k[1], 3.8 * HS, 0, TAU); c.fill(); }
      if (pose === 'point') { fing(P(15, 6), D(0), 28, 5.4); const up = v[1] < 0 ? 1 : -1; fing(P(5, 3 * up), D(up * Math.PI / 2), 14, 5.8); }
      else fing(P(6, 9), D(-0.9), 9, 6);
      return;
    }
    capsule(c, P(0, 0), P(15, 0), 17 * HS, 19 * HS);
    const spec = { relaxed: [15, 0.06, 0.55, 11], open: [21, 0.2, 1.15, 15], splay: [23, 0.33, 1.4, 16], cup: [16, 0.12, 0.9, 12] }[pose] || [15, 0.06, 0.55, 11];
    for (let i = 0; i < 4; i++) fing(P(15, (i - 1.5) * 4.4), D((i - 1.5) * spec[1]), spec[0] * (i === 0 || i === 3 ? 0.85 : 1), 4.8);
    fing(P(4, 7.5), D(spec[2]), spec[3], 5.8);
  }
  function body(c, P) {
    smoothClosed(c, [[-76, -182], [-66, -140], [-46, -72], [-36, -36], [-50, 8], [-30, 36], [0, 48], [30, 36], [50, 8], [36, -36], [46, -72], [66, -140], [76, -182], [22, -198], [-22, -198]]); c.fill();
    capsule(c, [0, -216], [0, -186], 24, 32);
    for (const s of [-1, 1]) { capsule(c, [s * 26, 10], [s * 29, 150], 42, 25); capsule(c, [s * 29, 150], [s * 27, 286], 25, 14); c.beginPath(); c.ellipse(s * 31, 294, 15, 7, 0, 0, TAU); c.fill(); }
    for (const [A, sh] of [[P.R, SH_R], [P.L, SH_L]]) { capsule(c, sh, A.e, 33, 24); capsule(c, A.e, A.w, 24, 15); if (!A.front) hand(c, A); }
  }

  // ---------- main render ----------
  const mask = document.createElement('canvas'), pat = document.createElement('canvas'), small = document.createElement('canvas');
  const PALETTES = { green: { main: '#4dff88', drop: '#0a3a1c', glow: 'rgba(0,255,90,0.55)', tag: '#86ffae', line: '#2fd36a', name: '#0f7a3a' },
    purple: { main: '#7b3fe4', drop: '#14062a', glow: 'rgba(110,50,220,0.5)', tag: '#9a6cf0', line: '#5a2aa6', name: '#3d1580' } };
  function render(cv, t, mode, W, H, opts = {}) {
    const TC = PALETTES[opts.palette || 'purple'];
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    for (const k of [mask, pat]) if (k.width !== W || k.height !== H) { k.width = W; k.height = H; }
    const c = cv.getContext('2d'), port = H > W, intro = mode === 'intro', outro = mode === 'outro', overlay = !!opts.overlay;
    const scen = !intro && !outro, LP = ['think', 'frustrated', 'laugh', 'facepalm'].includes(mode) ? 4 : 0;
    const wq = k => LP ? Math.max(1, Math.round(k * LP / TAU)) * TAU / LP : k;   // loop-safe angular speed
    const sn = (k, ph = 0) => Math.sin(t * wq(k) + ph);

    // ---- per-mode state ----
    let power = 1, eyes = 1, eyeStyle = 'dot', look = [0, 0], world = 0, squeeze = 0, blastT = -1, dark = 0, sphereR = 500, shake = 0, flare = 1, flakeK = 1, hairK = 1, hairDroop = 0, hoverX = 0, swayX = 0, shockS = 0, laughB = 0;
    let R = REST_R(0.8), L = REST_L(0.8), impactAt = -1;
    if (intro) {
      eyes = ease((t - 0.2) / 0.6); power = easeOut((t - 1.0) / 1.0); sphereR = power * 470 + ease((t - 2) / 8) * 50;
      const raise = ease((t - 4.2) / 0.8); R = mixArm(REST_R(power * 0.8), armA(SH_R, 0.62, -1.13), raise); L = REST_L(power * 0.8); R.pose = raise > 0.5 ? (ease((t - 6.4) / 0.45) > 0.3 ? 'fist' : 'cup') : 'relaxed';
      world = easeOut((t - 5.0) / 1.2); squeeze = ease((t - 6.4) / 0.45); impactAt = 6.95; blastT = t >= 6.95 ? t - 6.95 : -1; dark = ease((t - 7.55) / 0.5);
    } else if (outro) {
      eyes = ease((t - 0.1) / 0.6) * (1 - ease((t - 9.15) / 0.45)); power = easeOut((t - 0.6) / 0.9) * (1 - easeIn((t - 8.2) / 1.0)); sphereR = power * 500;
      const up = ease((t - 5.3) / 0.5) * (1 - ease((t - 7.4) / 0.5)), wave = Math.sin((t - 5.8) * TAU * 1.6) * 0.38 * ease((t - 5.8) / 0.2) * (1 - ease((t - 7.2) / 0.2));
      R = mixArm(REST_R(0.8 * power), armA(SH_R, -0.45, -1.45 + wave), up); L = REST_L(0.8 * power); R.pose = up > 0.4 ? 'open' : 'relaxed';
      if (up > 0.5) eyeStyle = 'happy';
    } else if (mode === 'think') {
      const bob = sn(TAU / 4) * 3;
      R = { e: [64, -82 + bob], w: [24, -196 + bob], h: [14, -214 + bob] }; L = { e: [-78, -84], w: [30, -92 + bob * 0.5], h: [56, -90 + bob * 0.5] };
      eyeStyle = 'narrow'; look = [-3.5, -2.5]; flare = 0.7; R.pose = 'fist';
    } else if (mode === 'frustrated') {
      const tr = sn(TAU * 6) * 2.2; R = { e: [100, -76 + tr], w: [108, 24 + tr], h: [109, 44 + tr] }; L = { e: [-100, -76 - tr], w: [-108, 24 - tr], h: [-109, 44 - tr] };
      eyeStyle = 'angry'; shake = 2.6; flare = 1.2; flakeK = 2.2; R.pose = L.pose = 'fist'; hairK = 1.08 + 0.05 * sn(TAU * 3);
    } else if (mode === 'spiritgun') {
      const a = port ? -0.95 : -0.06, aim = ease(t / 0.45), kick = 0.12 * after(t, 1.2, 6), ak = a - kick, dk = [Math.cos(ak), Math.sin(ak)];
      const e = [SH_R[0] + dk[0] * 114, SH_R[1] + dk[1] * 114], w = [e[0] + dk[0] * 102, e[1] + dk[1] * 102], h = [w[0] + dk[0] * 24, w[1] + dk[1] * 24];
      R = mixArm(REST_R(0.8), { e, w, h, pose: 'point' }, aim);
      L = { ...REST_L(0.8), pose: 'relaxed' };
      eyeStyle = t > 0.9 && t < 2.6 ? 'angry' : 'dot'; shake = 3 * after(t, 1.2, 5); impactAt = 1.62; hairK = 1 + 0.25 * easeOut((t - 0.6) / 0.6) * (1 - ease((t - 2.4) / 1.2));
    }
    else if (mode === 'laugh') {
      const b = Math.abs(sn(TAU * 2)); laughB = b;
      R = { e: [100, -98 + b * 3], w: [44, -52 + b * 3], h: [22, -40 + b * 3], pose: 'open' }; L = { ...armA(SH_L, Math.PI - 1.25, Math.PI - 1.15 + 0.1 * b), pose: 'relaxed' };
      eyeStyle = 'happy'; look = [0, -3]; hairK = 1 + 0.06 * b; hoverX = -8 * b;
    } else if (mode === 'shocked') {
      const k = ease((t - 0.3) / 0.12), tr = k * Math.sin(t * 70) * 0.02; shockS = k;
      R = mixArm(REST_R(0.8), { ...armA(SH_R, -0.25 + tr, -1.2 + tr), pose: 'splay' }, k); L = mixArm(REST_L(0.8), { ...armA(SH_L, Math.PI + 0.25 - tr, Math.PI + 1.2 - tr), pose: 'splay' }, k);
      eyeStyle = k > 0.5 ? 'wide' : 'dot'; hairK = 1 + 0.45 * k + 0.04 * k * Math.sin(t * 20); shake = 1.4 * k + 5 * after(t, 0.3, 6); hoverX = -10 * k;
    } else if (mode === 'facepalm') {
      R = { e: [100, -112], w: [30, -228], h: [18, -254], pose: 'open', front: true }; L = { e: [-82, -92], w: [46, -104], h: [70, -106], pose: 'relaxed' };
      swayX = 3 * sn(TAU * 0.5); hairK = 0.8; hairDroop = 0.55; flakeK = 0.6;
    }
    if (scen) power = 1;

    // ---- camera ----
    const sc = port ? W / 760 : H / 1000, ip = impactAt >= 0 ? after(t, impactAt, 4) : 0;
    const z = (intro ? 1 + 0.05 * t / 10 : 1) + 0.07 * ip;
    const S = sc * z, O = [W / 2, port ? H * 0.47 : H * 0.5], C = [0, intro ? -60 : outro ? -20 : port ? -90 : -40];
    const shk = 10 * ip + shake, sx = shk * Math.sin(t * 91), sy = shk * Math.sin(t * 77);
    const T = () => c.setTransform(S, 0, 0, S, O[0] - S * C[0] + sx, O[1] - S * C[1] + sy);
    const hover = -6 * sn(1.3) * power + hoverX;
    const BXh = shake * Math.sin(t * wq(TAU * 7)) + swayX, HC = [0, -262 + hover], SC = [0, -110], sR = port ? sphereR * 0.8 : sphereR;
    const tp = handTip(R), tip = [tp[0], tp[1] + hover];
    const GAL = port ? [[220, -560, 1.0], [80, -680, 0.7]] : [[690, -290, 1.45], [830, -60, 0.95]], HIT = 1.62, FIRE = 1.2;

    // ---- background: space, entities, light sphere, ground ----
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
    if (!overlay) {
      c.fillStyle = '#050506'; c.fillRect(0, 0, W, H); T();
      STARS.forEach(([x, y, r, ph]) => { c.globalAlpha = 0.35 + 0.35 * Math.sin(t * wq(2) + ph * 9); c.fillStyle = '#cfd2dc'; c.fillRect(x, y, r, r); }); c.globalAlpha = 1;
      entities(power * 0.9 + 0.1);
      if (mode === 'spiritgun') galaxies();
      if (sR > 1) {
        let g = c.createRadialGradient(SC[0], SC[1], sR * 0.8, SC[0], SC[1], sR * 1.45); g.addColorStop(0, 'rgba(255,255,250,0.45)'); g.addColorStop(1, 'rgba(255,255,250,0)');
        c.fillStyle = g; c.beginPath(); c.arc(SC[0], SC[1], sR * 1.45, 0, TAU); c.fill();
        g = c.createRadialGradient(SC[0], SC[1] - 40, 0, SC[0], SC[1], sR); g.addColorStop(0, '#ffffff'); g.addColorStop(0.75, '#f1f0ea'); g.addColorStop(1, '#d9d8d2');
        c.fillStyle = g; c.beginPath(); c.arc(SC[0], SC[1], sR, 0, TAU); c.fill();
        c.save(); c.beginPath(); c.rect(-2000, 300, 4000, 1200); c.clip();
        g = c.createRadialGradient(0, 300, 0, 0, 300, sR * 1.5); g.addColorStop(0, `rgba(222,221,214,${power})`); g.addColorStop(0.6, `rgba(150,150,146,${power * 0.8})`); g.addColorStop(1, 'rgba(20,20,22,0)');
        c.fillStyle = g; c.fillRect(-2000, 300, 4000, 1200);
        c.strokeStyle = `rgba(20,20,24,${0.55 * power})`; c.lineWidth = 2.2; CRACKS.forEach(pts => { c.beginPath(); pts.forEach(([x, y], k) => k ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); });
        c.fillStyle = `rgba(10,10,12,${0.35 * power})`; c.beginPath(); c.ellipse(0, 298, 120, 14, 0, 0, TAU); c.fill(); c.restore();
      }
    }
    T();
    // ---- matter & dark matter ----
    const HP = [R.h[0], R.h[1] - 18 + hover];
    const matterPos = m => {
      const u = intro ? easeOut((t - m.ts) / m.dur) : 1; if (u <= 0 && blastT < 0) return null;
      let x = lerp(m.x0, m.x1, u), y = lerp(m.y0, m.y1, u);
      if (!intro) { const a = Math.atan2(m.y1 + 110, m.x1) + t * wq(0.12) * (m.ph > Math.PI ? 1 : -1), r = Math.hypot(m.x1, m.y1 + 110); x = Math.cos(a) * r; y = -110 + Math.sin(a) * r * 0.8; }
      x += Math.sin(t * wq(0.7) + m.ph) * 10 * u; y += Math.cos(t * wq(0.9) + m.ph) * 8 * u;
      if (blastT >= 0) { const dx = x - HP[0], dy = y - HP[1], d = Math.hypot(dx, dy) || 1; x += dx / d * m.speed * blastT; y += dy / d * m.speed * blastT; }
      return [x, y];
    };
    const drawMatter = front => {
      MATTER.forEach(m => { if (m.front !== front) return; if (overlay && Math.hypot(m.x1, m.y1 + 120) > 300) return; const p = matterPos(m); if (!p) return;
        const base = outro ? power : 1; c.globalAlpha = base;
        if (m.dark) { const s = m.size * (front ? 1.4 : 1); for (let k = 3; k >= 1; k--) { c.globalAlpha = base * (0.5 - k * 0.12); spr(c, SPR.dark, p[0] - k * 5 * Math.sin(m.ph), p[1] + k * 6, s * (1 - k * 0.18)); } c.globalAlpha = base; spr(c, SPR.dark, p[0], p[1], s); }
        else { const tw = 0.75 + 0.25 * Math.sin(t * wq(3) + m.ph * 5); spr(c, m.amber ? SPR.amber : SPR.white, p[0], p[1], m.size * 2.2 * tw * (front ? 1.4 : 1)); }
      }); c.globalAlpha = 1;
    };
    drawMatter(false);
    // ---- hair: the original white cloud mane ----
    let hairShape = () => {};
    if (power > 0.01) {
      const hp = easeOut(power) * hairK;
      const strands = STRANDS.map(g => { const pts = []; let x = HC[0] + BXh, y = HC[1] + 6, a = g.a; const n = 14, tgt = g.a < -Math.PI / 2 ? -1.5 * Math.PI : Math.PI / 2;
        for (let k = 0; k < n; k++) { const u = k / (n - 1); a = g.a + g.curl * u + 0.22 * Math.sin(u * 4 - t * wq(1.8) + g.ph) * u + 0.25 * u * Math.sin(t * wq(0.6)); a = lerp(a, tgt, hairDroop * Math.min(1, u * 1.6)); const step = g.len * hp / n; x += Math.cos(a) * step; y += Math.sin(a) * step * 1.1;
          const r = g.r0 * (1 - 0.72 * u) * (0.4 + 0.6 * hp) * g.jit[k][1] * (1 + 0.08 * Math.sin(t * wq(2.2) + k + g.ph)); pts.push([x - Math.sin(a) * r * g.jit[k][0], y + Math.cos(a) * r * g.jit[k][0], r]); }
        return pts; });
      const shape = grow => { for (const [dx, dy, rr] of [[0, -20, 62], [-48, 0, 46], [48, 0, 46], [-30, -50, 50], [30, -50, 50]]) { c.beginPath(); c.arc(HC[0] + BXh + dx * hp, HC[1] + dy * hp, rr * (0.5 + 0.5 * hp) + grow, 0, TAU); c.fill(); } strands.forEach(pts => pts.forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r + grow, 0, TAU); c.fill(); })); };
      hairShape = (col, grow) => { c.fillStyle = col; shape(grow); };
      c.fillStyle = INK; shape(5); c.fillStyle = PAPER; shape(0);
      c.save(); c.globalAlpha = 0.1; c.fillStyle = '#6a6a70'; strands.forEach(pts => pts.forEach(([x, y, r], k) => { if (k % 2) return; c.beginPath(); c.arc(x + r * 0.15, y + r * 0.35, r * 0.62, 0, TAU); c.fill(); })); c.restore();
      c.strokeStyle = 'rgba(30,30,36,0.5)'; c.lineWidth = 2; c.lineCap = 'round';
      strands.forEach(pts => pts.forEach(([x, y, r], k) => { if (k % 3 !== 1) return; c.beginPath(); c.arc(x - r * 0.1, y + r * 0.05, r * 0.5, 0.3 + k, 2.1 + k); c.stroke(); }));
    }
    // ---- body: black silhouette with flowing contour maps ----
    const P = { R, L }, BX = BXh, BY = hover;
    const mc = mask.getContext('2d'); mc.setTransform(1, 0, 0, 1, 0, 0); mc.clearRect(0, 0, W, H); mc.setTransform(S, 0, 0, S, O[0] - S * C[0] + sx + BX * S, O[1] - S * C[1] + sy + BY * S); mc.fillStyle = '#000'; body(mc, P);
    c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(mask, 0, 0);
    const bx0 = Math.max(0, Math.floor(O[0] + S * (-300 - C[0]) + sx)), bx1 = Math.min(W, Math.ceil(O[0] + S * (330 - C[0]) + sx)), by0 = Math.max(0, Math.floor(O[1] + S * (-250 - C[1] + hover) + sy)), by1 = Math.min(H, Math.ceil(O[1] + S * (310 - C[1] + hover) + sy));
    const pw = Math.max(1, (bx1 - bx0) >> 1), ph = Math.max(1, (by1 - by0) >> 1); small.width = pw; small.height = ph;
    const sctx = small.getContext('2d'), img = sctx.createImageData(pw, ph), D = img.data;
    const flow = mode === 'think' ? 1.0 : 0.5, zx = LP ? Math.cos(t / LP * TAU) * flow : 0, zy = LP ? Math.sin(t / LP * TAU) * flow : 0, tz = LP ? 0 : t * 0.12;
    for (let j = 0; j < ph; j++) for (let i = 0; i < pw; i++) {
      const vx = C[0] + (bx0 + i * 2 - O[0] - sx) / S - BX, vy = C[1] + (by0 + j * 2 - O[1] - sy) / S - BY;
      const f = fbm(vx * 0.0105 + 3.1 + zx, vy * 0.0105 + zy, tz), band = Math.abs(frac(f * 13) - 0.5);
      let white = band > 0.36; if (f > 0.6) white = !white || band < 0.12;
      const k = (j * pw + i) * 4, v = white ? 236 : 8; D[k] = v; D[k + 1] = v - 2; D[k + 2] = v - 8; D[k + 3] = 255;
    }
    sctx.putImageData(img, 0, 0);
    const pc = pat.getContext('2d'); pc.setTransform(1, 0, 0, 1, 0, 0); pc.globalCompositeOperation = 'source-over'; pc.clearRect(0, 0, W, H);
    pc.imageSmoothingEnabled = true; pc.drawImage(small, bx0, by0, pw * 2, ph * 2); pc.globalCompositeOperation = 'destination-in'; pc.drawImage(mask, 0, 0);
    c.globalAlpha = lerp(0.15, 1, power); c.drawImage(pat, 0, 0); c.globalAlpha = 1; T();
    c.fillStyle = '#060607'; c.beginPath(); c.ellipse(BX, -252 + hover, 34, 44, 0, 0, TAU); c.fill();
    const drawEyes = () => {
      if (eyes <= 0.001) return; const glow = 0.6 + 0.4 * power + 0.6 * ip;
      for (const s of [-1, 1]) {
        const x0 = BX + s * 12 + look[0], y0 = -252 + hover + look[1];
        c.save(); c.shadowColor = 'rgba(255,255,255,0.95)'; c.shadowBlur = 26 * S * glow; c.fillStyle = '#fff'; c.strokeStyle = '#fff'; c.globalAlpha = eyes;
        if (eyeStyle === 'happy') { c.lineWidth = 3.4; c.lineCap = 'round'; c.beginPath(); c.arc(x0, y0 + 4, 6, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); c.stroke(); }
        else {
          if (eyeStyle === 'angry') { c.beginPath(); c.moveTo(x0 - 9, y0 - 3 + s * 4.5); c.lineTo(x0 + 9, y0 - 3 - s * 4.5); c.lineTo(x0 + 9, y0 + 12); c.lineTo(x0 - 9, y0 + 12); c.closePath(); c.clip(); }
          const wd = eyeStyle === 'wide' ? 1.6 : 1; c.beginPath(); c.ellipse(x0 + (wd > 1 ? s * 2 : 0), y0, 5.4 * wd, 7 * wd * eyes * (eyeStyle === 'narrow' ? 0.42 : 1), 0, 0, TAU); c.fill(); c.fill();
        }
        c.restore();
      }
    };
    drawEyes();
    if (R.front) { // facepalm: the hand covers the face, a sigh drifts out
      c.save(); c.translate(BX, hover); c.fillStyle = '#060607'; capsule(c, R.e, R.w, 24, 15); hand(c, R); c.restore();
      const q = frac(t / 2), sx2 = BX - 30 - 40 * q, sy2 = -214 + hover + 10 * q; c.fillStyle = `rgba(235,235,240,${0.7 * (1 - q) * ease(q * 5)})`; c.strokeStyle = `rgba(11,11,13,${0.6 * (1 - q) * ease(q * 5)})`; c.lineWidth = 2;
      for (const [dx, dy, r] of [[0, 0, 10], [-12, 4, 8], [-22, -2, 6]]) { c.beginPath(); c.arc(sx2 + dx * (1 + q), sy2 + dy, r * (0.6 + q), 0, TAU); c.fill(); c.stroke(); }
    }
    if (mode === 'shocked' && shockS > 0) { c.strokeStyle = INK; c.lineCap = 'round'; c.globalAlpha = shockS; c.lineWidth = 4;
      for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * 0.42, r0 = 74 + 4 * Math.sin(t * 30 + k); c.beginPath(); c.moveTo(BX + Math.cos(a) * r0, -262 + hover + Math.sin(a) * r0 * 1.1); c.lineTo(BX + Math.cos(a) * (r0 + 22), -262 + hover + Math.sin(a) * (r0 + 22) * 1.1); c.stroke(); } c.globalAlpha = 1; }
    if (mode === 'laugh') { c.save(); c.font = '30px BlackOps'; c.textAlign = 'center'; c.fillStyle = TC.main; c.shadowColor = TC.glow; c.shadowBlur = 10 * S;
      for (let k = 0; k < 3; k++) { const q = frac(t / (4 / 3) + k / 3); c.globalAlpha = Math.sin(q * Math.PI); c.fillText('HA', BX + 70 + 34 * Math.sin(k * 2.1 + q * 3), -300 + hover - 110 * q); } c.restore(); }
    // ---- ink flakes peeling off (Mob-style aura) ----
    if (power > 0.05) {
      const segs = [[SH_R, R.e, 33], [R.e, R.w, 24], [SH_L, L.e, 33], [L.e, L.w, 24], [[-50, -150], [-36, -40], 10], [[50, -150], [36, -40], 10], [[-26, 10], [-29, 150], 42], [[26, 10], [29, 150], 42], [[-29, 150], [-27, 286], 25], [[29, 150], [27, 286], 25]];
      c.fillStyle = INK; const N = Math.round(110 * flakeK), per = LP ? 2 : 1.4;
      for (let i = 0; i < N; i++) {
        const life = frac(t / per + i * 0.137), sg = segs[i % segs.length], u = frac(i * 0.618), side = i % 2 ? 1 : -1;
        const ax = lerp(sg[0][0], sg[1][0], u), ay = lerp(sg[0][1], sg[1][1], u), dx = sg[1][0] - sg[0][0], dy = sg[1][1] - sg[0][1], Ln = Math.hypot(dx, dy) || 1;
        const x = BX + ax - dy / Ln * side * sg[2] / 2 + side * 26 * life * flakeK + Math.sin(i + life * 5) * 8, y = ay + dx / Ln * side * sg[2] / 2 - 120 * life * life * flakeK - 10 * life + hover;
        const s = (4 + (i % 4) * 1.6) * (1 - life) * power; c.save(); c.translate(x, y); c.rotate(i + life * 6); c.fillRect(-s / 2, -s / 2, s, s * 0.6); c.restore();
      }
    }
    // ---- mode extras ----
    if (mode === 'think') { // matter orbiting the head + a pulsing ellipsis
      for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + t / 4 * TAU, x = BX + Math.cos(a) * 92, y = -262 + hover + Math.sin(a) * 30; spr(c, k % 3 ? SPR.white : SPR.amber, x, y, 7 + 2 * Math.sin(a * 2)); }
      for (let k = 0; k < 3; k++) { const q = frac(t / 2 - k * 0.15), on = ease(q * 4) * (1 - ease((q - 0.7) * 5)); spr(c, SPR.amber, 70 + k * 26, -330 + hover - k * 14, 9 * on); }
    }
    if (mode === 'frustrated') { // pulsing anger mark
      const pu = 1 + 0.18 * Math.max(0, Math.sin(t * wq(TAU * 2))); c.save(); c.translate(BX + 58, -302 + hover); c.scale(pu, pu); c.strokeStyle = AMBER; c.lineWidth = 5; c.lineCap = 'round';
      for (let k = 0; k < 4; k++) { c.rotate(Math.PI / 2); c.beginPath(); c.moveTo(5, -16); c.quadraticCurveTo(5, -5, 16, -5); c.stroke(); } c.restore();
    }
    // ---- intro creation ----
    if (intro && t > 4.5 && t < 6.96) {
      BITS.forEach(b => { const u = cl((t - 4.6 - b.d) / 1.5); if (u >= 1 || u <= 0) return; const Rr = b.r * Math.pow(1 - u, 1.5), a = b.a + u * 7; spr(c, b.dark ? SPR.dark : SPR.amber, HP[0] + Math.cos(a) * Rr, HP[1] + Math.sin(a) * Rr * 0.7, b.s * (b.dark ? 2 : 2.4)); });
      const wr = 36 * world * (1 - ease((t - 6.82) / 0.13)), sqx = 1 - 0.35 * squeeze, sqy = 1 + 0.15 * squeeze;
      if (wr > 0.5) {
        const g = c.createRadialGradient(HP[0], HP[1], 0, HP[0], HP[1], wr * 3.4); g.addColorStop(0, 'rgba(255,190,70,0.75)'); g.addColorStop(1, 'rgba(255,170,40,0)'); c.fillStyle = g; c.beginPath(); c.arc(HP[0], HP[1], wr * 3.4, 0, TAU); c.fill();
        c.save(); c.translate(HP[0], HP[1]); c.scale(sqx, sqy); c.beginPath(); c.arc(0, 0, wr, 0, TAU); c.fillStyle = AMBER; c.fill(); c.clip();
        c.fillStyle = '#1f4a35'; LAND.forEach(l => { const a = l.a + t * 1.2, x = Math.sin(a) * wr * 0.9, vis = Math.cos(a); if (vis < -0.1) return; c.beginPath(); c.ellipse(x, l.lat * wr * 0.6, l.r * wr * (0.4 + 0.6 * vis), l.r * wr * 0.7, 0, 0, TAU); c.fill(); });
        if (squeeze > 0) { c.strokeStyle = `rgba(255,250,220,${squeeze})`; c.lineWidth = 2; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(0, 0); let x = 0, y = 0; for (let q = 0; q < 4; q++) { x += Math.cos(k * 1.05 + q) * wr * 0.35; y += Math.sin(k * 1.05 + q * 0.7) * wr * 0.35; c.lineTo(x, y); } c.stroke(); } }
        c.restore(); c.strokeStyle = INK; c.lineWidth = 2.6; c.save(); c.translate(HP[0], HP[1]); c.scale(sqx, sqy); c.beginPath(); c.arc(0, 0, wr, 0, TAU); c.restore(); c.stroke();
        c.strokeStyle = `rgba(224,160,32,${0.8 * world})`; c.lineWidth = 1.6; c.beginPath(); c.ellipse(HP[0], HP[1], wr * 1.8, wr * 0.45, -0.3, 0, TAU); c.stroke();
      }
    }
    // ---- spirit gun: charge at the fingertip, beam, galaxies blown apart ----
    if (mode === 'spiritgun') {
      const tgt = GAL[0], ch = ease((t - 0.5) / 0.7) * (1 - ease((t - FIRE) / 0.08));
      if (ch > 0.01) {
        spr(c, SPR.violet, tip[0], tip[1], 34 * ch * (1 + 0.1 * Math.sin(t * 40))); spr(c, SPR.white, tip[0], tip[1], 20 * ch);
        for (let k = 0; k < 14; k++) { const a = k / 14 * TAU + t * 3, r = 60 * (1 - frac(t * 2 + k * 0.07)); spr(c, k % 2 ? SPR.amber : SPR.violet, tip[0] + Math.cos(a) * r, tip[1] + Math.sin(a) * r, 4 * ch); }
      }
      if (t >= FIRE && t < 2.2) {
        const u = cl((t - FIRE) / (HIT - FIRE)), fade = 1 - ease((t - HIT) / 0.5), ex = lerp(tip[0], tgt[0], u), ey = lerp(tip[1], tgt[1], u);
        c.save(); c.lineCap = 'round';
        for (const [w, col] of [[46, 'rgba(138,79,216,0.35)'], [30, 'rgba(224,160,32,0.75)'], [14, 'rgba(255,250,235,1)']]) { c.strokeStyle = col; c.lineWidth = w * fade; c.beginPath(); c.moveTo(tip[0], tip[1]); c.lineTo(ex, ey); c.stroke(); }
        c.restore(); if (u < 1) { spr(c, SPR.amber, ex, ey, 60); spr(c, SPR.white, ex, ey, 30); }
      }
    }
    drawMatter(true);
    // ---- ripples: several shockwaves in quick succession ----
    const RIPC = [INK, AMBER, VIOLET, INK, AMBER];
    const ripples = (cx, cy, t0, sp) => RIPC.forEach((col, k) => { const a = t - (t0 + 0.07 * k); if (a < 0 || a > 1.0) return; c.globalAlpha = 1 - a; c.strokeStyle = col; c.lineWidth = 18 * (1 - a) + 2; c.beginPath(); c.arc(cx, cy, a * sp, 0, TAU); c.stroke(); c.globalAlpha = 1; });
    if (intro) ripples(HP[0], HP[1], 7.08, 1500);
    if (mode === 'spiritgun' && !overlay) ripples(GAL[0][0], GAL[0][1], 1.75, 1300);
    // ---- impact frames: negative, silhouette on white, silhouette on amber ----
    const fi = impactAt >= 0 ? Math.floor((t - impactAt) * 24 + 1e-6) : -1;
    if (fi >= 0 && fi <= 2 && !overlay) {
      const IC = intro ? HP : [GAL[0][0], GAL[0][1]];
      c.setTransform(1, 0, 0, 1, 0, 0);
      if (fi === 0) { c.globalCompositeOperation = 'difference'; c.fillStyle = '#ffffff'; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over'; }
      else { c.fillStyle = fi === 1 ? '#ffffff' : AMBER; c.fillRect(0, 0, W, H); c.drawImage(mask, 0, 0); T(); hairShape(INK, 4); c.beginPath(); c.ellipse(BX, -252 + hover, 34, 44, 0, 0, TAU); c.fill(); drawEyes(); c.setTransform(1, 0, 0, 1, 0, 0); }
      T(); c.strokeStyle = fi === 0 ? '#ffffff' : INK; c.lineCap = 'round';
      SPEED.forEach(([a, r0, w]) => { c.lineWidth = w * 2; c.beginPath(); c.moveTo(IC[0] + Math.cos(a) * r0 * 700, IC[1] + Math.sin(a) * r0 * 700); c.lineTo(IC[0] + Math.cos(a) * 2400, IC[1] + Math.sin(a) * 2400); c.stroke(); });
    }
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (intro && fi > 2) { const fl = after(t, 7.075, 6) * 0.7; if (fl > 0.01) { c.fillStyle = `rgba(255,253,245,${fl})`; c.fillRect(0, 0, W, H); } }
    if (dark > 0) { c.fillStyle = `rgba(5,5,6,${dark})`; c.fillRect(0, 0, W, H); T(); drawEyes(); c.setTransform(1, 0, 0, 1, 0, 0); }
    // ---- titles (Black Ops One) ----
    T(); c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    const fit = (txt, size, maxW, spacing) => { c.letterSpacing = spacing + 'px'; c.font = `${size}px BlackOps`; const w = c.measureText(txt).width; return w > maxW ? size * maxW / w : size; };
    if (intro && t > 7.9) {
      const rv = easeOut((t - 7.95) / 0.65), lines = port ? ['STRANGE', 'BRANCHES'] : ['STRANGE BRANCHES'], maxW = port ? 660 : 1450;
      const fs = Math.min(...lines.map(l => fit(l, port ? 130 : 120, maxW, 4))), y0 = port ? -10 : 40;
      c.letterSpacing = '4px'; c.font = `${fs}px BlackOps`;
      const wmax = Math.max(...lines.map(l => c.measureText(l).width)), x0 = -wmax / 2 - 20;
      c.save(); c.beginPath(); c.rect(x0, y0 - fs * 1.1, (wmax + 40) * rv, fs * lines.length * 1.1 + 30); c.clip();
      lines.forEach((l, i) => { const y = y0 + i * fs * 1.05; c.fillStyle = TC.drop; c.fillText(l, 5, y + 6); c.shadowColor = TC.glow; c.shadowBlur = 18 * S; c.fillStyle = TC.main; c.fillText(l, 0, y); c.shadowBlur = 0; });
      c.restore();
      if (rv < 1) { c.fillStyle = TC.main; c.fillRect(x0 + (wmax + 40) * rv - 3, y0 - fs, 5, fs * lines.length * 1.1); }
      const ty = y0 + (lines.length - 1) * fs * 1.05 + 62, lw = ease((t - 8.4) / 0.5) * (port ? 520 : 640);
      c.fillStyle = TC.line; c.fillRect(-lw / 2, ty - 24, lw, 3);
      c.save(); c.globalAlpha = ease((t - 8.6) / 0.5); const ts = fit('EVOLUTION THAT NEVER HAPPENED', port ? 34 : 30, port ? 640 : 900, 5); c.letterSpacing = '5px'; c.font = `${ts}px BlackOps`;
      c.shadowColor = TC.glow; c.shadowBlur = 14 * S; c.fillStyle = TC.tag; c.fillText('EVOLUTION THAT NEVER HAPPENED', 0, ty + 28); c.restore();
    }
    if (outro) {
      const a = ease((t - 1.2) / 0.6) * (1 - ease((t - 8.4) / 0.6)), y = port ? 470 : 382;
      c.save(); c.globalAlpha = a; const ns = fit('BILL DINGUS', port ? 84 : 74, port ? 680 : 900, 8); c.letterSpacing = '8px'; c.font = `${ns}px BlackOps`;
      c.fillStyle = INK; c.fillText('BILL DINGUS', 4, y + 4); c.shadowColor = TC.glow; c.shadowBlur = 12 * S; c.fillStyle = TC.name; c.fillText('BILL DINGUS', 0, y);
      c.shadowBlur = 0; const ss = fit('NEW BRANCH EVERY SATURDAY', port ? 30 : 24, port ? 660 : 800, 5); c.letterSpacing = '5px'; c.font = `${ss}px BlackOps`; c.fillStyle = INK; c.fillText('NEW BRANCH EVERY SATURDAY', 0, y + (port ? 56 : 46)); c.restore();
    }
    c.letterSpacing = '0px';
    // ---- grain + vignette ----
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (!overlay) {
      if (!grain) { grain = document.createElement('canvas'); grain.width = grain.height = 256; const g = grain.getContext('2d'), im = g.createImageData(256, 256); for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); }
      c.save(); c.globalAlpha = 0.07; c.globalCompositeOperation = 'overlay'; const ox = Math.floor(frac(t * 7.3) * 256), oy = Math.floor(frac(t * 5.1) * 256);
      c.translate(-ox, -oy); c.fillStyle = c.createPattern(grain, 'repeat'); c.fillRect(0, 0, W + 256, H + 256); c.restore();
      const vg = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
    }

    // ---------- background helpers (share this frame's transform and clock) ----------
    function entities(vis) {
      c.save(); c.globalAlpha = 0.85 * vis;
      // dark-purple jellyfish being
      const J = port ? [-250, -600, 0.55] : [-690, -300, 1], jx = J[0] + sn(0.15) * 18, jy = J[1] + sn(0.2, 1) * 14, js = J[2];
      for (let k = 0; k < 9; k++) { c.strokeStyle = 'rgba(120,70,190,0.55)'; let x = jx + (k - 4) * 16 * js, y = jy + 20 * js; c.beginPath(); c.moveTo(x, y); for (let q = 1; q < 14; q++) { x += Math.sin(q * 0.6 + t * wq(1.2) + k) * 6 * js; y += 22 * js; c.lineTo(x, y); } c.lineWidth = 3 * js; c.stroke(); }
      const g = c.createRadialGradient(jx, jy - 20 * js, 5, jx, jy, 110 * js); g.addColorStop(0, '#6c3aa8'); g.addColorStop(1, '#241038');
      c.fillStyle = g; c.beginPath(); c.ellipse(jx, jy, 100 * js, 74 * js, 0, Math.PI, TAU); c.quadraticCurveTo(jx, jy + 40 * js, jx - 100 * js, jy); c.fill(); c.strokeStyle = '#a77ae6'; c.lineWidth = 2.5 * js; c.stroke();
      for (let k = 0; k < 7; k++) spr(c, SPR.white, jx + Math.cos(k * 1.3) * 55 * js, jy - 25 * js + Math.sin(k * 2.1) * 22 * js, 5 * js);
      // greenish star serpent
      const SP = port ? [-360, -690, 0.55] : [380, -470, 0.9]; let hx = 0, hy = 0;
      for (let k = 0; k < 60; k++) { const u = k / 59, x = SP[0] + k * 13 * SP[2] + 30 * sn(0.3), y = SP[1] + Math.sin(k * 0.22 - t * wq(1.1)) * 34 * SP[2] + u * u * 260 * SP[2]; spr(c, k % 7 ? SPR.green : SPR.white, x, y, (11 - u * 6) * SP[2] * 1.8); if (k === 0) { hx = x; hy = y; } }
      spr(c, SPR.green, hx, hy, 26 * SP[2]); c.fillStyle = '#fff'; c.fillRect(hx - 6 * SP[2], hy - 3 * SP[2], 3, 3); c.fillRect(hx + 3 * SP[2], hy - 3 * SP[2], 3, 3);
      // white ring watcher
      const RW = port ? [250, -640, 0.5] : [700, 150, 0.85], rx = RW[0] + sn(0.2, 2) * 12, ry = RW[1] + sn(0.25, 3) * 10, rs = RW[2], tilt = 0.55 + 0.15 * sn(0.4);
      c.strokeStyle = 'rgba(240,240,250,0.8)'; c.lineWidth = 5 * rs; c.beginPath(); c.ellipse(rx, ry, 90 * rs, 90 * rs * tilt, 0.2, 0, TAU); c.stroke();
      for (let k = 0; k < 14; k++) { const a = k / 14 * TAU + t * wq(0.5), ex = Math.cos(a) * 90 * rs, ey = Math.sin(a) * 90 * rs * tilt; spr(c, SPR.white, rx + ex * Math.cos(0.2) - ey * Math.sin(0.2), ry + ex * Math.sin(0.2) + ey * Math.cos(0.2), 6 * rs); }
      c.fillStyle = '#f2f2f6'; c.beginPath(); c.ellipse(rx, ry, 30 * rs, 17 * rs, 0, 0, TAU); c.fill(); c.fillStyle = INK; c.beginPath(); c.ellipse(rx + sn(0.6) * 6 * rs, ry, 4 * rs, 14 * rs, 0, 0, TAU); c.fill();
      c.restore();
    }
    function galaxies() {
      c.save();
      GAL.forEach(([gx, gy, gs], gi) => {
        const boom = t >= HIT + gi * 0.12 ? t - HIT - gi * 0.12 : -1; if (boom > 1.6) return;
        c.globalAlpha = 0.8; if (boom < 0) spr(c, SPR.white, gx, gy, 26 * gs); spr(c, SPR.violet, gx, gy, 60 * gs * (boom < 0 ? 1 : Math.max(0, 1 - boom)));
        GALAXY.forEach(p => { const a = p.u * 4.2 + p.arm * Math.PI + t * 0.4 + p.jit, r = p.u * 110 * gs; let x = gx + Math.cos(a) * r, y = gy + Math.sin(a) * r * 0.45;
          c.globalAlpha = 0.8; if (boom >= 0) { x += p.v[0] * p.sp * boom * gs; y += p.v[1] * p.sp * boom * gs; c.globalAlpha = Math.max(0, 1 - boom / 1.4) * 0.8; }
          spr(c, SPR[p.col], x, y, p.s * gs * 2); });
      });
      c.restore();
    }
  }
  window.NARRATOR = { render };
})();
