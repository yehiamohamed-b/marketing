// Strange Branches evolution sim: pure logic, no DOM. Used by index.html and by node tests.
(function (root) {
  'use strict';

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const W = 1600, H = 900, CELL = 80;
  const LIM = { s: [0.4, 3], v: [0.3, 3], r: [0.3, 3] };
  const MEAT_MIN = 0.15;      // diet needed before a blob will hunt at all
  const MAX_AGE = 7000;
  const FOOD_CAP = 420;

  // Every world is the same rules with different starting conditions. `why` is the question it tests.
  const BASE = { food: 0.6, start: 70, diet0: 0.08, floor: 0, mut: 0.08, seasons: 0, cold: 0 };
  const PRESETS = {
    earth:    { label: 'Earth as usual', why: 'The baseline. Plenty of plants, almost everyone starts as a grazer. Watch whether hunting appears on its own.' },
    predator: { label: 'All-predator world', diet0: 0.75, floor: 0.6, why: 'Every creature is forced to eat meat. Can an ecosystem of hunters feed itself? (The Curious Archive question.)' },
    hunters:  { label: 'Grazers vs hunters', food: 0.8, start: 80, hunters: 0.15, why: 'A few big hunters among grazers. Look for boom-and-bust waves in the population chart: prey rise, hunters follow, prey crash.' },
    famine:   { label: 'Famine', food: 0.25, diet0: 0.15, why: 'Plants grow back slowly. Big bodies are expensive to run, so expect creatures to shrink and slow down.' },
    bounty:   { label: 'Bounty', food: 1.3, start: 40, why: 'Food everywhere. Populations explode, and size and speed stop mattering much because nobody has to compete.' },
    seasons:  { label: 'Seasons', food: 0.7, seasons: 0.9, why: 'Food swings between feast and famine. Survivors must carry reserves through the lean months.' },
    oases:    { label: 'Oases', food: 0.6, patches: 4, why: 'Food grows only in a few patches. Sharp senses and speed pay off for reaching them; hunters can camp at the edges.' },
    iceage:   { label: 'Ice age', food: 0.5, cold: 1, why: 'Small bodies lose heat faster. Watch average size climb, like Bergmann\'s rule in real mammals.' },
    giants:   { label: 'Land of giants', s0: 2.2, v0: 0.8, food: 0.7, why: 'Everyone starts huge, like a dinosaur world. Does evolution keep them big, or do smaller, cheaper bodies take over?' },
    island:   { label: 'Island dwarfing', s0: 1.8, food: 0.3, start: 40, why: 'Big creatures stranded with little food. Island elephants and hippos shrank in real life. Do these?' },
    invasion: { label: 'Apex invasion', food: 0.8, start: 90, hunters: 0.04, hunterSize: 2.6, why: 'A handful of giant hunters land in a peaceful world. Do grazers evolve to escape, or get eaten out?' },
    arms:     { label: 'Arms race', food: 0.9, start: 90, hunters: 0.3, meatEff: 1.3, why: 'Lots of hunters and rich prey. Speed and senses should ratchet up on both sides.' },
    mutant:   { label: 'Radiation world', mut: 0.22, why: 'Mutation is cranked up. Change is fast but many children are misfits. Compare the trait charts with Earth as usual.' },
    asteroid: { label: 'Asteroid impact', food: 0.7, start: 90, strikeAt: 2500, why: 'A normal world until tick 2,500, when an asteroid hits. It wipes out the blast zone and its radiation spikes mutation for a while.' },
  };
  for (const k in PRESETS) PRESETS[k] = Object.assign({}, BASE, PRESETS[k]);

  const clamp = (x, a, b) => x < a ? a : x > b ? b : x;

  function World(cfg) {
    this.cfg = Object.assign({ seed: 1, s0: 1, v0: 1, r0: 1, seasons: 0, period: 2400, patches: 0, meatEff: 1, sizeEdge: 1.2, cold: 0, hunterSize: 1.6, strikeAt: 0 }, PRESETS.earth, cfg || {});
    this.rand = mulberry32(this.cfg.seed >>> 0);
    this.t = 0; this.nextId = 1;
    this.blobs = []; this.foods = []; this.history = [];
    this.births = 0; this.kills = 0;
    this.foodAcc = 0; this.radBoost = 0; this.events = [];
    this.patches = [];
    for (let i = 0; i < (this.cfg.patches || 0); i++) this.patches.push({ x: 200 + this.rand() * (W - 400), y: 150 + this.rand() * (H - 300) });
    for (let i = 0; i < 160; i++) this.foods.push(this.foodPoint());
    for (let i = 0; i < this.cfg.start; i++) {
      const p = this.randPoint();
      const hunter = i < Math.round((this.cfg.hunters || 0) * this.cfg.start);
      this.blobs.push(this.makeBlob(p.x, p.y, {
        s: (hunter ? this.cfg.hunterSize : this.cfg.s0) + this.gauss() * 0.12, v: this.cfg.v0 + this.gauss() * 0.12, r: (hunter ? 1.3 : this.cfg.r0) + this.gauss() * 0.12,
        d: (hunter ? 0.85 : this.cfg.diet0) + this.gauss() * 0.08,
      }, 0));
    }
    this.sample();
  }

  World.W = W; World.H = H; World.PRESETS = PRESETS; World.MEAT_MIN = MEAT_MIN;

  World.prototype.gauss = function () {
    let u = 0, v = 0;
    while (u === 0) u = this.rand();
    while (v === 0) v = this.rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  World.prototype.randPoint = function () {
    return { x: 20 + this.rand() * (W - 40), y: 20 + this.rand() * (H - 40) };
  };

  // Plants grow anywhere, or only around a few oases when `patches` is set.
  World.prototype.foodPoint = function () {
    if (!this.patches.length) return this.randPoint();
    const p = this.patches[Math.floor(this.rand() * this.patches.length)];
    return { x: clamp(p.x + this.gauss() * 70, 20, W - 20), y: clamp(p.y + this.gauss() * 70, 20, H - 20) };
  };
  // Seasonal swing on plant growth: 1 ± seasons, over `period` ticks.
  World.prototype.foodRate = function () {
    return Math.max(0, this.cfg.food * (1 + this.cfg.seasons * Math.sin(2 * Math.PI * this.t / this.cfg.period)));
  };
  // Asteroid: everything inside R dies, plants burn, and radiation raises mutation for a while.
  World.prototype.strike = function (x, y, R) {
    R = R || 220;
    let dead = 0;
    for (const b of this.blobs) if (b.alive && (b.x - x) ** 2 + (b.y - y) ** 2 < R * R) { b.alive = false; b.killedBy = 'asteroid'; dead++; }
    this.blobs = this.blobs.filter(b => b.alive);
    this.foods = this.foods.filter(f => (f.x - x) ** 2 + (f.y - y) ** 2 >= R * R);
    this.radBoost = 0.15;
    this.events.push({ t: this.t, x, y, R, dead });
    return dead;
  };

  World.prototype.makeBlob = function (x, y, g, gen) {
    const b = {
      id: this.nextId++, x, y, heading: this.rand() * Math.PI * 2,
      s: clamp(g.s, LIM.s[0], LIM.s[1]),
      v: clamp(g.v, LIM.v[0], LIM.v[1]),
      r: clamp(g.r, LIM.r[0], LIM.r[1]),
      d: clamp(g.d, this.cfg.floor, 1),
      age: 0, gen, alive: true, mode: 'wander',
    };
    b.E = birthCost(b);
    return b;
  };

  const radius = b => 7 * b.s;
  const speed = b => 1.25 * b.v;
  const senseR = b => 45 * b.r + radius(b);
  const birthCost = b => 1.0 * Math.pow(b.s, 1.5);
  // Primer-style upkeep: big and fast is expensive, senses cost a little.
  // f = fraction of top speed actually used this tick, so idling ambushers save energy.
  // `cold` adds heat loss that hits small bodies hardest (surface area vs volume).
  const upkeep = (b, f, cold) => 0.0016 * (b.s * b.s * b.s * b.v * b.v) * (0.25 + 0.75 * f * f) + 0.0007 * b.r + 0.0006 + cold * 0.0012 / b.s;
  const plantGain = b => 1.0 * (1 - b.d);
  const meatGain = (a, prey, eff) => a.d * 2.4 * eff * (birthCost(prey) + prey.E * 0.8);
  const canEat = (a, b, edge) => a.d >= MEAT_MIN && a.s >= edge * b.s;

  World.radius = radius; World.senseR = senseR;

  World.prototype.buildGrid = function () {
    const cols = Math.ceil(W / CELL), rows = Math.ceil(H / CELL);
    const bg = new Array(cols * rows), fg = new Array(cols * rows);
    for (let i = 0; i < bg.length; i++) { bg[i] = []; fg[i] = []; }
    const idx = (x, y) => clamp(Math.floor(y / CELL), 0, rows - 1) * cols + clamp(Math.floor(x / CELL), 0, cols - 1);
    for (const b of this.blobs) bg[idx(b.x, b.y)].push(b);
    for (const f of this.foods) fg[idx(f.x, f.y)].push(f);
    this.grid = { cols, rows, bg, fg };
  };

  World.prototype.near = function (x, y, R, kind, fn) {
    const g = this.grid, k = kind === 'b' ? g.bg : g.fg;
    const c0 = clamp(Math.floor((x - R) / CELL), 0, g.cols - 1), c1 = clamp(Math.floor((x + R) / CELL), 0, g.cols - 1);
    const r0 = clamp(Math.floor((y - R) / CELL), 0, g.rows - 1), r1 = clamp(Math.floor((y + R) / CELL), 0, g.rows - 1);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      const cell = k[r * g.cols + c];
      for (let i = 0; i < cell.length; i++) fn(cell[i]);
    }
  };

  World.prototype.step = function () {
    const cfg = this.cfg;
    this.t++;
    if (cfg.strikeAt && this.t === cfg.strikeAt) this.strike(W * (0.3 + this.rand() * 0.4), H * (0.3 + this.rand() * 0.4));
    this.radBoost *= 0.9992;
    this.foodAcc += this.foodRate();
    while (this.foodAcc >= 1) {
      this.foodAcc -= 1;
      if (this.foods.length < FOOD_CAP) this.foods.push(this.foodPoint());
    }
    const edge = cfg.sizeEdge, eff = cfg.meatEff;
    this.buildGrid();
    const born = [];
    for (const b of this.blobs) {
      if (!b.alive) continue;
      const R = senseR(b), rb = radius(b);
      let threat = null, td = Infinity, prey = null, pv = 0, food = null, fv = 0;
      this.near(b.x, b.y, R, 'b', o => {
        if (o === b || !o.alive) return;
        const dx = o.x - b.x, dy = o.y - b.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > R) return;
        // Creeping or freshly-pouncing hunters are only spotted at half range.
        if (canEat(o, b, edge) && dist < td && dist <= (o.stealth ? R * 0.5 : R)) { threat = o; td = dist; }
        if (canEat(b, o, edge)) {
          const val = meatGain(b, o, eff) / (dist + 25);
          if (val > pv) { pv = val; prey = o; }
        }
      });
      if (b.d < 0.98) {
        const pg = plantGain(b);
        this.near(b.x, b.y, R, 'f', f => {
          if (f.eaten) return;
          const dx = f.x - b.x, dy = f.y - b.y, dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > R) return;
          const val = pg / (dist + 25);
          if (val > fv) { fv = val; food = f; }
        });
      }

      let want = null;
      if (threat) { want = Math.atan2(b.y - threat.y, b.x - threat.x); b.mode = 'flee'; }
      else if (prey && pv >= fv) { want = Math.atan2(prey.y - b.y, prey.x - b.x); b.mode = 'hunt'; }
      else if (food) { want = Math.atan2(food.y - b.y, food.x - b.x); b.mode = 'graze'; }
      else { b.heading += this.gauss() * 0.18; b.mode = 'wander'; }
      if (want !== null) {
        let diff = want - b.heading;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        b.heading += clamp(diff, -0.35, 0.35);
      }
      // Chases are sprints: hunters burst faster than fleeing prey, and pay for it.
      // Hunters with nothing in sight creep (ambush); anyone else idles at a stroll.
      const burst = b.mode === 'hunt' ? 1.35 : b.mode === 'flee' ? 1.1 : b.mode === 'wander' ? (b.d > 0.5 ? 0.3 : 0.7) : 1;
      const sp = speed(b) * burst;
      b.stealth = b.d > 0.5 && (burst <= 0.3 || (b.mode === 'hunt' && b.stealth));
      b.x += Math.cos(b.heading) * sp; b.y += Math.sin(b.heading) * sp;
      if (b.x < rb) { b.x = rb; b.heading = Math.PI - b.heading; }
      if (b.x > W - rb) { b.x = W - rb; b.heading = Math.PI - b.heading; }
      if (b.y < rb) { b.y = rb; b.heading = -b.heading; }
      if (b.y > H - rb) { b.y = H - rb; b.heading = -b.heading; }

      if (food && !food.eaten) {
        const dx = food.x - b.x, dy = food.y - b.y;
        if (dx * dx + dy * dy < (rb + 4) * (rb + 4)) { food.eaten = true; b.E += plantGain(b); }
      }
      if (prey && prey.alive) {
        const dx = prey.x - b.x, dy = prey.y - b.y, reach = rb + radius(prey) * 0.5;
        if (dx * dx + dy * dy < reach * reach) {
          b.E += meatGain(b, prey, eff); prey.alive = false; prey.killedBy = b.id; this.kills++;
        }
      }

      b.E -= upkeep(b, burst, cfg.cold); b.age++;
      if (b.E <= 0 || b.age > MAX_AGE) { b.alive = false; continue; }
      const B = birthCost(b);
      if (b.E >= 2.0 * B) {
        const m = cfg.mut + this.radBoost;
        const child = this.makeBlob(b.x + this.gauss() * 6, b.y + this.gauss() * 6, {
          s: b.s * (1 + this.gauss() * m), v: b.v * (1 + this.gauss() * m),
          r: b.r * (1 + this.gauss() * m), d: b.d + this.gauss() * m * 0.6,
        }, b.gen + 1);
        b.E -= B * 1.2;
        born.push(child); this.births++;
      }
    }
    this.foods = this.foods.filter(f => !f.eaten);
    this.blobs = this.blobs.filter(b => b.alive).concat(born);
    if (this.t % 30 === 0) this.sample();
  };

  World.prototype.stats = function () {
    const n = this.blobs.length;
    const s = { t: this.t, pop: n, herb: 0, omni: 0, carn: 0, food: this.foods.length, ms: 0, mv: 0, mr: 0, md: 0, gen: 0, maxGen: 0 };
    for (const b of this.blobs) {
      if (b.d < 0.33) s.herb++; else if (b.d < 0.66) s.omni++; else s.carn++;
      s.ms += b.s; s.mv += b.v; s.mr += b.r; s.md += b.d; s.gen += b.gen;
      if (b.gen > s.maxGen) s.maxGen = b.gen;
    }
    if (n) { s.ms /= n; s.mv /= n; s.mr /= n; s.md /= n; s.gen /= n; }
    return s;
  };

  World.prototype.sample = function () {
    this.history.push(this.stats());
    if (this.history.length > 1600) this.history = this.history.filter((_, i) => i % 2 === 0);
  };

  root.SBWorld = World;
  if (typeof module !== 'undefined') module.exports = World;
})(typeof window !== 'undefined' ? window : globalThis);
