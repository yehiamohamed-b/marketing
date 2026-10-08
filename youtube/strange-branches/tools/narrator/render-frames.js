const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [file, out] = process.argv.slice(2), jobs = JSON.parse(process.argv[4]);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 800, height: 600 } });
  p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => m.type() === 'error' && console.log('CONSOLE', m.text()));
  await p.goto('file://' + file); await p.waitForFunction(() => window.READY); await p.evaluate(() => { window.EXPORTING = true; });
  for (const j of jobs) {
    const dir = `${out}/${j.name}`; fs.mkdirSync(dir, { recursive: true });
    for (const t of j.times) {
      const d = await p.evaluate(([t, m, w, h]) => { const c = document.getElementById('cv'); NARRATOR.render(c, t, m, w, h); return c.toDataURL('image/jpeg', 0.93); }, [t, j.mode, j.w, j.h]);
      fs.writeFileSync(`${dir}/f${String(Math.round(t * 24)).padStart(4, '0')}.jpg`, Buffer.from(d.split(',')[1], 'base64'));
    }
    console.log('done', j.name);
  }
  await b.close();
})();
