// Renders every templates/*.html to exports/<name>.png and .jpg (1280x720, JPG < 2 MB for YouTube).
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const dir = path.join(__dirname, 'templates'), out = path.join(__dirname, 'exports');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  for (const f of fs.readdirSync(dir).filter(f => /^\d.*\.html$/.test(f))) {
    await p.goto('file://' + path.join(dir, f)); await p.waitForTimeout(400);
    const n = f.replace('.html', '');
    await p.screenshot({ path: path.join(out, n + '.png') });
    await p.screenshot({ path: path.join(out, n + '.jpg'), type: 'jpeg', quality: 92 });
    console.log(n);
  }
  await b.close();
})();
