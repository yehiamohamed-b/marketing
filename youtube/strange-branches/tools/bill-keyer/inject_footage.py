#!/usr/bin/env python3
"""Add a 'Bill footage' layer to the Bill Dingus main-visual page (idempotent)."""
import sys
p = sys.argv[1]; s = open(p, encoding='utf-8').read()
if 'id="billVideo"' in s: sys.exit("already patched")

def sub(old, new):
    global s
    assert s.count(old) == 1, old[:60]
    s = s.replace(old, new)

# 1. expose the voxel Bill so the footage layer can hide him
sub("const root = new T.Group(); A.group.add(root);", "const root = new T.Group(); A.group.add(root);")
# 2. video element sits between the 3D canvas and the vignette/scanlines, so the CRT overlays still apply
sub('<canvas id="cv"></canvas>\n', '<canvas id="cv"></canvas>\n    <video id="billVideo" muted loop playsinline preload="auto" aria-hidden="true"></video>\n')
sub("</style>\n\n<div class=\"wrap\">", """#billVideo { position: absolute; left: 50%; bottom: 7%; height: 68%; transform: translateX(-50%); display: none; pointer-events: none; object-fit: contain; }
body.footage #billVideo { display: block; }
body.footage.fmt-916 #billVideo, body.footage.fmt-45 #billVideo { height: 62%; }
</style>

<div class="wrap">""")
sub('<button id="sMod" aria-pressed="false">Modern</button></div>',
    '<button id="sMod" aria-pressed="false">Modern</button></div>\n    <div class="grp"><span class="lab">Bill</span>\n      <button id="bVox" aria-pressed="true">Voxel</button>\n      <button id="bFoot" aria-pressed="false">Footage</button></div>')
# 3. behaviour
script = r"""
<script>
/* Bill footage layer: keyed (transparent) WebM clips of the new Bill model drawn over the same void/halo/island scene. */
(() => {
  const $ = id => document.getElementById(id), v = $('billVideo'), K = '../../assets/bill-dingus/keyed/';
  // [file, loop start, loop end]: the camera zooms in during the second half of the other clips, so only their full-body stretches are used
  const CLIPS = { press: ['talking-gestures_alpha.webm', 0, 9.5], menu: ['points-at-screen_alpha.webm', 0, 3.5] };
  let on = false, cur = '';
  const state = () => $('menu') && !$('menu').hidden ? 'menu' : 'press';
  function play(k) { if (cur === k) return; cur = k; v.src = K + CLIPS[k][0]; v.currentTime = CLIPS[k][1]; v.play().catch(() => {}); }
  v.addEventListener('timeupdate', () => { const c = CLIPS[cur]; if (c && v.currentTime >= c[2]) v.currentTime = c[1]; });
  function sync() {
    const body = window.SB_BILL_BODY; if (body) body.visible = !on;  // halo, island and props stay
    document.body.classList.toggle('footage', on);
    $('bVox').setAttribute('aria-pressed', !on); $('bFoot').setAttribute('aria-pressed', on);
    if (on) play(state()); else { v.pause(); cur = ''; }
  }
  $('bVox').onclick = () => { on = false; sync(); };
  $('bFoot').onclick = () => { on = true; sync(); };
  // the clip follows the title-screen state
  new MutationObserver(() => { if (on) play(state()); }).observe($('menu'), { attributes: true, attributeFilter: ['hidden'] });
  // format classes for the 9:16 / 4:5 height tweak
  const fm = { f169: '', f916: 'fmt-916', f11: '', f45: 'fmt-45' };
  Object.keys(fm).forEach(id => $(id).addEventListener('click', () => { document.body.classList.remove('fmt-916', 'fmt-45'); if (fm[id]) document.body.classList.add(fm[id]); }));
})();
</script>
"""
sub("</body>", script + "</body>") if s.count("</body>") == 1 else (_ for _ in ()).throw(SystemExit("no </body>"))
open(p, 'w', encoding='utf-8').write(s); print("patched", p)
