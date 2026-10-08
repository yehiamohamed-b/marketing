// THE NARRATOR: Strange Branches intro / outro (10 s each). Pure canvas 2D, deterministic: render(t, mode, W, H).
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

  // ---------- fixed scene data ----------
  const STARS = Array.from({ length: 160 }, () => [(rnd() - 0.5) * 2400, (rnd() - 0.5) * 1600 - 100, 0.6 + rnd() * 1.6, rnd()]);
  const ROCKS = Array.from({ length: 46 }, (_, i) => {
    const side = rnd() < 0.5 ? -1 : 1, x0 = side * (90 + rnd() * 640);
    const n = 5 + Math.floor(rnd() * 3), verts = Array.from({ length: n }, (_, k) => [k / n * TAU + (rnd() - 0.5) * 0.6, 0.65 + rnd() * 0.45]);
    return { x0, y0: 305 + rnd() * 30, x1: x0 * (0.85 + rnd() * 0.3), y1: -430 + rnd() * 640, size: 8 + Math.pow(rnd(), 2) * 46, verts, rot0: rnd() * TAU, spin: (rnd() - 0.5) * 1.4,
      ts: 2.0 + rnd() * 1.8, dur: 1.4 + rnd() * 1.2, front: rnd() < 0.28, bob: rnd() * TAU, speed: 900 + rnd() * 700 };
  });
  const BITS = Array.from({ length: 34 }, () => ({ a: rnd() * TAU, r: 160 + rnd() * 260, s: 3 + rnd() * 6, d: rnd() * 0.5 }));
  const STRANDS = Array.from({ length: 7 }, (_, i) => ({ a: -Math.PI / 2 + (i / 6 - 0.5) * 3.0 + (rnd() - 0.5) * 0.2, len: 130 + rnd() * 120 - Math.abs(i - 3) * 8, r0: 56 + rnd() * 12, curl: 0.5 + rnd() * 0.5, ph: rnd() * TAU, jit: Array.from({ length: 14 }, () => [(rnd() - 0.5) * 1.1, 0.7 + rnd() * 0.6]) }));
  const CRACKS = Array.from({ length: 14 }, () => { let x = (rnd() - 0.5) * 1300, y = 312 + rnd() * 120; const pts = [[x, y]]; for (let k = 0; k < 5; k++) { x += (rnd() - 0.5) * 120; y += rnd() * 22; pts.push([x, y]); } return pts; });
  const LAND = Array.from({ length: 6 }, () => ({ a: rnd() * TAU, lat: (rnd() - 0.5) * 1.4, r: 0.25 + rnd() * 0.3 }));
  let grain = null;

  // ---------- the figure ----------
  const SH_R = [70, -174], SH_L = [-70, -174];
  function arm(sh, ua, fa, L1 = 114, L2 = 102) { const e = [sh[0] + Math.cos(ua) * L1, sh[1] + Math.sin(ua) * L1], w = [e[0] + Math.cos(fa) * L2, e[1] + Math.sin(fa) * L2]; return { e, w, h: [w[0] + Math.cos(fa) * 26, w[1] + Math.sin(fa) * 26] }; }
  function pose(raise, spread, lift) {
    const R = arm(SH_R, lerp(1.41, 0.62, raise) - 0.1 * spread, lerp(1.51, -1.13, raise));
    const L = arm(SH_L, Math.PI - lerp(1.41, 1.41 - 0.22 * spread, 1), Math.PI - lerp(1.51, 1.35 - 0.25 * spread, 1));
    return { R, L, lift };
  }
  function capsule(c, a, b, wa, wb) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    c.beginPath(); c.moveTo(a[0] + nx * wa / 2, a[1] + ny * wa / 2); c.lineTo(b[0] + nx * wb / 2, b[1] + ny * wb / 2); c.lineTo(b[0] - nx * wb / 2, b[1] - ny * wb / 2); c.lineTo(a[0] - nx * wa / 2, a[1] - ny * wa / 2); c.fill();
    c.beginPath(); c.arc(a[0], a[1], wa / 2, 0, TAU); c.fill(); c.beginPath(); c.arc(b[0], b[1], wb / 2, 0, TAU); c.fill();
  }
  function smoothClosed(c, pts) { c.beginPath(); const n = pts.length; for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; if (i === 0) c.moveTo(m[0], m[1]); else c.quadraticCurveTo(p[0], p[1], m[0], m[1]); } const p = pts[0], q = pts[1]; c.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); c.closePath(); }
  function body(c, P) {
    smoothClosed(c, [[-76, -182], [-66, -140], [-46, -72], [-36, -36], [-50, 8], [-30, 36], [0, 48], [30, 36], [50, 8], [36, -36], [46, -72], [66, -140], [76, -182], [22, -198], [-22, -198]]); c.fill();
    capsule(c, [0, -216], [0, -186], 24, 32);
    for (const s of [-1, 1]) { capsule(c, [s * 26, 10], [s * 29, 150], 42, 25); capsule(c, [s * 29, 150], [s * 27, 286], 25, 14); c.beginPath(); c.ellipse(s * 31, 294, 15, 7, 0, 0, TAU); c.fill(); }
    for (const A of [P.R, P.L]) { const sh = A === P.R ? SH_R : SH_L; capsule(c, sh, A.e, 33, 24); capsule(c, A.e, A.w, 24, 15); capsule(c, A.w, A.h, 17, 11); }
  }
  function edgePoints(P) { // points on the silhouette edge, for peeling ink flakes
    const segs = [[SH_R, P.R.e, 25], [P.R.e, P.R.w, 18], [SH_L, P.L.e, 25], [P.L.e, P.L.w, 18], [[-50, -150], [-36, -40], 10], [[50, -150], [36, -40], 10], [[-26, 10], [-29, 150], 42], [[26, 10], [29, 150], 42], [[-29, 150], [-27, 286], 25], [[29, 150], [27, 286], 25], [[0, -270], [0, -230], 60]];
    return segs;
  }

  // ---------- main render ----------
  const mask = document.createElement('canvas'), pat = document.createElement('canvas'), small = document.createElement('canvas');
  function render(cv, t, mode, W, H) {
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    for (const k of [mask, pat]) if (k.width !== W || k.height !== H) { k.width = W; k.height = H; }
    const c = cv.getContext('2d'), port = H > W, intro = mode === 'intro';
    // ---- timeline ----
    let power, eyes, raise, world, squeeze, blast, flash, dark, sphereR, lit;
    if (intro) {
      eyes = ease((t - 0.2) / 0.6); power = easeOut((t - 1.0) / 1.0); sphereR = power * 470 + ease((t - 2) / 8) * 50;
      raise = ease((t - 4.2) / 0.8); world = easeOut((t - 5.0) / 1.2); squeeze = ease((t - 6.4) / 0.45);
      blast = t >= 6.95 ? t - 6.95 : -1; flash = t < 6.95 ? ease((t - 6.88) / 0.07) : after(t, 6.95, 7); dark = ease((t - 7.55) / 0.5); lit = 1;
    } else {
      eyes = ease((t - 0.1) / 0.6) * (1 - ease((t - 9.15) / 0.45)); power = easeOut((t - 0.6) / 0.9) * (1 - easeIn((t - 8.2) / 1.0)); sphereR = power * 500;
      raise = 0; world = 0; squeeze = 0; blast = -1; flash = 0; dark = 0; lit = 1;
    }
    const spread = power * 0.8, P = pose(raise, spread, 0);
    // ---- camera ----
    const sc = port ? W / 760 : H / 1000, z = 1 + 0.05 * t / 10 + 0.07 * (blast >= 0 ? after(t, 6.95, 4) : 0);
    const S = sc * z, O = [W / 2, port ? H * 0.47 : H * 0.5], C = [0, intro ? -60 : -20];
    const shk = 10 * (blast >= 0 ? after(t, 6.95, 5) : 0), sx = shk * Math.sin(t * 91), sy = shk * Math.sin(t * 77);
    const T = () => c.setTransform(S, 0, 0, S, O[0] - S * C[0] + sx, O[1] - S * C[1] + sy);
    const hover = -6 * Math.sin(t * 1.3) * power;
    // ---- background ----
    c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#050506'; c.fillRect(0, 0, W, H); T();
    STARS.forEach(([x, y, r, ph]) => { c.globalAlpha = 0.35 + 0.35 * Math.sin(t * 2 + ph * 9); c.fillStyle = '#cfd2dc'; c.fillRect(x, y, r, r); }); c.globalAlpha = 1;
    // ---- light sphere ----
    const SC = [0, -110];
    if (sphereR > 1) {
      let g = c.createRadialGradient(SC[0], SC[1], sphereR * 0.8, SC[0], SC[1], sphereR * 1.45); g.addColorStop(0, 'rgba(255,255,250,0.45)'); g.addColorStop(1, 'rgba(255,255,250,0)');
      c.fillStyle = g; c.beginPath(); c.arc(SC[0], SC[1], sphereR * 1.45, 0, TAU); c.fill();
      g = c.createRadialGradient(SC[0], SC[1] - 40, 0, SC[0], SC[1], sphereR); g.addColorStop(0, '#ffffff'); g.addColorStop(0.75, '#f1f0ea'); g.addColorStop(1, '#d9d8d2');
      c.fillStyle = g; c.beginPath(); c.arc(SC[0], SC[1], sphereR, 0, TAU); c.fill();
      // ground plane lit by the sphere
      c.save(); c.beginPath(); c.rect(-2000, 300, 4000, 1200); c.clip();
      g = c.createRadialGradient(0, 300, 0, 0, 300, sphereR * 1.5); g.addColorStop(0, `rgba(222,221,214,${power})`); g.addColorStop(0.6, `rgba(150,150,146,${power * 0.8})`); g.addColorStop(1, 'rgba(20,20,22,0)');
      c.fillStyle = g; c.fillRect(-2000, 300, 4000, 1200);
      c.strokeStyle = `rgba(20,20,24,${0.55 * power})`; c.lineWidth = 2.2; CRACKS.forEach(pts => { c.beginPath(); pts.forEach(([x, y], k) => k ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); });
      c.fillStyle = `rgba(10,10,12,${0.35 * power})`; c.beginPath(); c.ellipse(0, 298, 120, 14, 0, 0, TAU); c.fill(); c.restore();
    }
    // ---- rocks ----
    const hand = P.R.h, HP = [hand[0], hand[1] - 18 + hover];
    function rock(r) {
      let u = intro ? easeOut((t - r.ts) / r.dur) : 1; if (u <= 0 && blast < 0) return;
      let x = lerp(r.x0, r.x1, u), y = lerp(r.y0, r.y1, u) + Math.sin(t * 1.1 + r.bob) * 8 * u, rot = r.rot0 + r.spin * t;
      if (!intro) { const a = Math.atan2(r.y1 + 110, r.x1) + t * 0.05 * Math.sign(r.spin); const R = Math.hypot(r.x1, r.y1 + 110); x = Math.cos(a) * R; y = -110 + Math.sin(a) * R * 0.8; }
      if (blast >= 0) { const dx = x - HP[0], dy = y - HP[1], d = Math.hypot(dx, dy) || 1; x += dx / d * r.speed * blast; y += dy / d * r.speed * blast; rot += r.spin * 12 * blast; }
      const s = r.size * (r.front ? 1.5 : 1); c.globalAlpha = intro ? 1 : power;
      c.save(); c.translate(x, y); c.rotate(rot);
      c.beginPath(); r.verts.forEach(([a, k], i) => { const px = Math.cos(a) * k * s, py = Math.sin(a) * k * s; i ? c.lineTo(px, py) : c.moveTo(px, py); }); c.closePath();
      c.fillStyle = '#86888a'; c.fill(); c.lineWidth = r.front ? 3.4 : 2.4; c.strokeStyle = '#0b0b0d'; c.stroke();
      c.beginPath(); r.verts.forEach(([a, k], i) => { const px = Math.cos(a) * k * s * 0.55 - s * 0.18, py = Math.sin(a) * k * s * 0.55 - s * 0.2; i ? c.lineTo(px, py) : c.moveTo(px, py); }); c.closePath();
      c.fillStyle = '#c9cac6'; c.fill(); c.lineWidth = 1.2; c.stroke(); c.restore(); c.globalAlpha = 1;
    }
    ROCKS.filter(r => !r.front).forEach(rock);
    // ---- hair: a white cloud mane that erupts upward with the power ----
    const HC = [0, -262 + hover];
    if (power > 0.01) {
      const hp = easeOut(power);
      // each strand: a chain of puffs flowing up and to the side, waving like slow fire
      const strands = STRANDS.map(g => { const pts = []; let x = HC[0], y = HC[1] + 6, a = g.a; const n = 14;
        for (let k = 0; k < n; k++) { const u = k / (n - 1); a = g.a + g.curl * u + 0.22 * Math.sin(u * 4 - t * 1.8 + g.ph) * u + 0.25 * u * Math.sin(t * 0.6); const step = g.len * hp / n; x += Math.cos(a) * step; y += Math.sin(a) * step * 1.1;
          const r = g.r0 * (1 - 0.72 * u) * (0.4 + 0.6 * hp) * g.jit[k][1] * (1 + 0.08 * Math.sin(t * 2.2 + k + g.ph)); pts.push([x - Math.sin(a) * r * g.jit[k][0], y + Math.cos(a) * r * g.jit[k][0], r]); }
        return pts; });
      const shape = grow => { for (const [dx, dy, rr] of [[0, -20, 62], [-48, 0, 46], [48, 0, 46], [-30, -50, 50], [30, -50, 50]]) { c.beginPath(); c.arc(HC[0] + dx * hp, HC[1] + dy * hp, rr * (0.5 + 0.5 * hp) + grow, 0, TAU); c.fill(); } strands.forEach(pts => pts.forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r + grow, 0, TAU); c.fill(); })); };
      c.fillStyle = '#0b0b0d'; shape(5); c.fillStyle = '#f6f5ef'; shape(0);
      // soft grey shading on the lower side of each puff, then ink flow lines along the strands
      c.save(); c.globalAlpha = 0.1; c.fillStyle = '#6a6a70'; strands.forEach(pts => pts.forEach(([x, y, r], k) => { if (k % 2) return; c.beginPath(); c.arc(x + r * 0.15, y + r * 0.35, r * 0.62, 0, TAU); c.fill(); })); c.restore();
      c.strokeStyle = 'rgba(30,30,36,0.5)'; c.lineWidth = 2; c.lineCap = 'round'; // little cloud curls
      strands.forEach(pts => pts.forEach(([x, y, r], k) => { if (k % 3 !== 1) return; c.beginPath(); c.arc(x - r * 0.1, y + r * 0.05, r * 0.5, 0.3 + k, 2.1 + k); c.stroke(); }));
    }
    // ---- body: black silhouette carrying flowing contour maps ----
    c.save(); c.translate(0, hover);
    const mc = mask.getContext('2d'); mc.setTransform(1, 0, 0, 1, 0, 0); mc.clearRect(0, 0, W, H); mc.setTransform(S, 0, 0, S, O[0] - S * C[0] + sx, O[1] - S * C[1] + sy + hover * S); mc.fillStyle = '#000'; body(mc, P);
    c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(mask, 0, 0); T(); c.translate(0, hover);
    // pattern over the body bbox at half resolution
    const bx0 = Math.max(0, Math.floor(O[0] + S * (-240 - C[0]) + sx)), bx1 = Math.min(W, Math.ceil(O[0] + S * (260 - C[0]) + sx)), by0 = Math.max(0, Math.floor(O[1] + S * (-230 - C[1] + hover) + sy)), by1 = Math.min(H, Math.ceil(O[1] + S * (310 - C[1] + hover) + sy));
    const pw = Math.max(1, (bx1 - bx0) >> 1), ph = Math.max(1, (by1 - by0) >> 1); small.width = pw; small.height = ph;
    const sctx = small.getContext('2d'), img = sctx.createImageData(pw, ph), D = img.data, tz = t * 0.12;
    for (let j = 0; j < ph; j++) for (let i = 0; i < pw; i++) {
      const vx = C[0] + (bx0 + i * 2 - O[0] - sx) / S, vy = C[1] + (by0 + j * 2 - O[1] - sy) / S - hover;
      const f = fbm(vx * 0.0105 + 3.1, vy * 0.0105, tz), band = Math.abs(frac(f * 13) - 0.5);
      let white = band > 0.36; if (f > 0.6) white = !white || band < 0.12;
      const k = (j * pw + i) * 4, v = white ? 236 : 8; D[k] = v; D[k + 1] = v - 2; D[k + 2] = v - 8; D[k + 3] = 255;
    }
    sctx.putImageData(img, 0, 0);
    const pc = pat.getContext('2d'); pc.setTransform(1, 0, 0, 1, 0, 0); pc.globalCompositeOperation = 'source-over'; pc.clearRect(0, 0, W, H);
    pc.imageSmoothingEnabled = true; pc.drawImage(small, bx0, by0, pw * 2, ph * 2); pc.globalCompositeOperation = 'destination-in'; pc.drawImage(mask, 0, 0);
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = lerp(0.15, 1, power); c.drawImage(pat, 0, 0); c.globalAlpha = 1; T(); c.translate(0, hover);
    // head: pure black void with the two eyes
    c.fillStyle = '#060607'; c.beginPath(); c.ellipse(0, -252, 34, 44, 0, 0, TAU); c.fill();
    c.restore(); T();
    const drawEyes = () => {
      if (eyes <= 0.001) return; const glow = 0.6 + 0.4 * power + 0.6 * (blast >= 0 ? after(t, 6.95, 2) : 0);
      for (const s of [-1, 1]) { c.save(); c.shadowColor = 'rgba(255,255,255,0.95)'; c.shadowBlur = 26 * S * glow; c.fillStyle = '#ffffff'; c.globalAlpha = eyes; c.beginPath(); c.ellipse(s * 12, -252 + hover, 5.2, 6.8 * eyes, 0, 0, TAU); c.fill(); c.fill(); c.restore(); }
    };
    drawEyes();
    // ---- ink flakes peeling off the silhouette (Mob-style aura) ----
    if (power > 0.05) {
      const segs = edgePoints(P); c.fillStyle = '#0a0a0c';
      for (let i = 0; i < 110; i++) {
        const life = frac(t / 1.4 + i * 0.137), sg = segs[i % segs.length], u = frac(i * 0.618), side = i % 2 ? 1 : -1;
        const ax = lerp(sg[0][0], sg[1][0], u), ay = lerp(sg[0][1], sg[1][1], u), dx = sg[1][0] - sg[0][0], dy = sg[1][1] - sg[0][1], L = Math.hypot(dx, dy) || 1;
        const x = ax - dy / L * side * sg[2] / 2 + side * 26 * life + Math.sin(i + life * 5) * 8, y = ay + dx / L * side * sg[2] / 2 - 120 * life * life - 10 * life + hover;
        const s = (4 + (i % 4) * 1.6) * (1 - life) * power; c.save(); c.translate(x, y); c.rotate(i + life * 6); c.fillRect(-s / 2, -s / 2, s, s * 0.6); c.restore();
      }
    }
    // ---- creation: bits spiral into the palm, an amber world forms, he crushes it ----
    if (intro && t > 4.5 && t < 6.96) {
      BITS.forEach(b => { const u = cl((t - 4.6 - b.d) / 1.5); if (u >= 1 || u <= 0) return; const R = b.r * Math.pow(1 - u, 1.5), a = b.a + u * 7; c.fillStyle = '#9a9b98'; c.strokeStyle = '#0b0b0d'; c.lineWidth = 1.5; c.beginPath(); c.rect(HP[0] + Math.cos(a) * R - b.s / 2, HP[1] + Math.sin(a) * R * 0.7 - b.s / 2, b.s, b.s); c.fill(); c.stroke(); });
      const wr = 36 * world * (1 - ease((t - 6.82) / 0.13)), sqx = 1 - 0.35 * squeeze, sqy = 1 + 0.15 * squeeze;
      if (wr > 0.5) {
        const g = c.createRadialGradient(HP[0], HP[1], 0, HP[0], HP[1], wr * 3.4); g.addColorStop(0, `rgba(255,190,70,${0.75})`); g.addColorStop(1, 'rgba(255,170,40,0)'); c.fillStyle = g; c.beginPath(); c.arc(HP[0], HP[1], wr * 3.4, 0, TAU); c.fill();
        c.save(); c.translate(HP[0], HP[1]); c.scale(sqx, sqy); c.beginPath(); c.arc(0, 0, wr, 0, TAU); c.fillStyle = '#e0a020'; c.fill(); c.clip();
        c.fillStyle = '#1f4a35'; LAND.forEach(l => { const a = l.a + t * 1.2, x = Math.sin(a) * wr * 0.9, vis = Math.cos(a); if (vis < -0.1) return; c.beginPath(); c.ellipse(x, l.lat * wr * 0.6, l.r * wr * (0.4 + 0.6 * vis), l.r * wr * 0.7, 0, 0, TAU); c.fill(); });
        if (squeeze > 0) { c.strokeStyle = `rgba(255,250,220,${squeeze})`; c.lineWidth = 2; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(0, 0); let x = 0, y = 0; for (let q = 0; q < 4; q++) { x += Math.cos(k * 1.05 + q) * wr * 0.35; y += Math.sin(k * 1.05 + q * 0.7) * wr * 0.35; c.lineTo(x, y); } c.stroke(); } }
        c.restore(); c.strokeStyle = '#0b0b0d'; c.lineWidth = 2.6; c.save(); c.translate(HP[0], HP[1]); c.scale(sqx, sqy); c.beginPath(); c.arc(0, 0, wr, 0, TAU); c.restore(); c.stroke();
        c.strokeStyle = `rgba(224,160,32,${0.8 * world})`; c.lineWidth = 1.6; c.beginPath(); c.ellipse(HP[0], HP[1], wr * 1.8, wr * 0.45, -0.3, 0, TAU); c.stroke();
      }
    }
    ROCKS.filter(r => r.front).forEach(rock);
    // ---- shockwave + flash ----
    if (blast >= 0 && blast < 1.2) { const R = blast * 1700; c.strokeStyle = `rgba(10,10,12,${1 - blast / 1.2})`; c.lineWidth = 24 * (1 - blast / 1.2) + 2; c.beginPath(); c.arc(HP[0], HP[1], R, 0, TAU); c.stroke(); c.strokeStyle = `rgba(224,160,32,${0.8 * (1 - blast / 1.2)})`; c.lineWidth = 6; c.beginPath(); c.arc(HP[0], HP[1], R * 0.82, 0, TAU); c.stroke(); }
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (flash > 0) { c.fillStyle = `rgba(255,253,245,${flash})`; c.fillRect(0, 0, W, H); }
    if (dark > 0) { c.fillStyle = `rgba(5,5,6,${dark})`; c.fillRect(0, 0, W, H); T(); drawEyes(); c.setTransform(1, 0, 0, 1, 0, 0); }
    // ---- titles ----
    T();
    if (intro && t > 7.9) {
      const rv = easeOut((t - 7.95) / 0.65), lines = port ? ['STRANGE', 'BRANCHES'] : ['STRANGE BRANCHES'], fs = port ? 170 : 150, y0 = port ? -10 : 40;
      c.font = `${fs}px Bebas`; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
      const wmax = Math.max(...lines.map(l => c.measureText(l).width)), x0 = -wmax / 2 - 20;
      c.save(); c.beginPath(); c.rect(x0, y0 - fs, (wmax + 40) * rv, fs * lines.length * 1.05 + 20); c.clip();
      lines.forEach((l, i) => { const y = y0 + i * fs * 0.92; c.fillStyle = '#e0a020'; c.globalAlpha = 0.9; c.fillText(l, 4, y + 5); c.globalAlpha = 1; c.fillStyle = '#efe6cf'; c.fillText(l, 0, y); });
      c.restore();
      if (rv < 1) { c.fillStyle = '#efe6cf'; c.fillRect(x0 + (wmax + 40) * rv - 3, y0 - fs * 0.9, 5, fs * lines.length); }
      const ty = y0 + (lines.length - 1) * fs * 0.92 + 70, lw = ease((t - 8.4) / 0.5) * (port ? 420 : 520);
      c.fillStyle = '#e0a020'; c.fillRect(-lw / 2, ty - 26, lw, 3);
      c.globalAlpha = ease((t - 8.6) / 0.5); c.font = `${port ? 44 : 40}px Apple`; c.fillStyle = '#e0a020'; c.fillText('Evolution that never happened', 0, ty + 34); c.globalAlpha = 1;
    }
    if (!intro) {
      const a = ease((t - 1.2) / 0.6) * (1 - ease((t - 8.4) / 0.6)), y = port ? 480 : 392;
      c.globalAlpha = a; c.textAlign = 'center'; c.font = `${port ? 78 : 64}px Bebas`; c.fillStyle = '#e0a020'; c.fillText('NEW BRANCH EVERY SATURDAY', 3, y + 3); c.fillStyle = '#0b0b0d'; c.fillText('NEW BRANCH EVERY SATURDAY', 0, y);
      c.font = `${port ? 34 : 28}px Apple`; c.fillStyle = '#3a2a10'; c.fillText('the narrator will be waiting', 0, y + (port ? 62 : 50)); c.globalAlpha = 1;
    }
    // ---- grain + vignette ----
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (!grain) { grain = document.createElement('canvas'); grain.width = grain.height = 256; const g = grain.getContext('2d'), im = g.createImageData(256, 256); for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); }
    c.save(); c.globalAlpha = 0.07; c.globalCompositeOperation = 'overlay'; const ox = Math.floor(frac(t * 7.3) * 256), oy = Math.floor(frac(t * 5.1) * 256);
    c.translate(-ox, -oy); c.fillStyle = c.createPattern(grain, 'repeat'); c.fillRect(0, 0, W + 256, H + 256); c.restore();
    const vg = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
  }
  window.NARRATOR = { render, DUR: 10 };
})();
