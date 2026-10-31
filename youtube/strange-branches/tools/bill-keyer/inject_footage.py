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
sub("const root = new T.Group(); A.group.add(root);", "const root = new T.Group(); window.SB_BILL_ROOT = root; A.group.add(root);")
# 2. video element sits between the 3D canvas and the vignette/scanlines, so the CRT overlays still apply
sub('<canvas id="cv"></canvas>\n', '<canvas id="cv"></canvas>\n    <video id="billVideo" muted loop playsinline preload="auto" aria-hidden="true"></video>\n')
sub("</style>\n\n<div class=\"wrap\">", """#billVideo { position: absolute; left: 50%; bottom: 0; height: 80%; transform: translateX(-50%); display: none; pointer-events: none; object-fit: contain; }
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
  const $ = id => document.getElementById(id), v = $('billVideo'), K = 'assets/bill-dingus/keyed/';
  const CLIPS = { press: 'looking-at-camera_alpha.webm', menu: 'points-at-screen_alpha.webm', talk: 'talking-gestures_alpha.webm' };
  let on = false, cur = '';
  const state = () => $('menu') && !$('menu').hidden ? 'menu' : 'press';
  function play(k) { if (cur === k) return; cur = k; v.src = K + CLIPS[k]; v.play().catch(() => {}); }
  function sync() {
    const root = window.SB_BILL_ROOT; if (root) root.visible = !on;
    document.body.classList.toggle('footage', on);
    $('bVox').setAttribute('aria-pressed', !on); $('bFoot').setAttribute('aria-pressed', on);
    if (on) play(state()); else { v.pause(); cur = ''; }
  }
  $('bVox').onclick = () => { on = false; sync(); };
  $('bFoot').onclick = () => { on = true; sync(); };
  // the clip follows the title-screen state; picking a menu item hands over to the talking clip for a while
  new MutationObserver(() => { if (on) play(state()); }).observe($('menu'), { attributes: true, attributeFilter: ['hidden'] });
  $('menu').addEventListener('click', () => { if (!on) return; play('talk'); clearTimeout(window.__bt); window.__bt = setTimeout(() => on && play(state()), 10000); });
  // format classes for the 9:16 / 4:5 height tweak
  const fm = { f169: '', f916: 'fmt-916', f11: '', f45: 'fmt-45' };
  Object.keys(fm).forEach(id => $(id).addEventListener('click', () => { document.body.classList.remove('fmt-916', 'fmt-45'); if (fm[id]) document.body.classList.add(fm[id]); }));
})();
</script>
"""
sub("</body>", script + "</body>") if s.count("</body>") == 1 else (_ for _ in ()).throw(SystemExit("no </body>"))
open(p, 'w', encoding='utf-8').write(s); print("patched", p)
