#!/usr/bin/env python3
"""Remove the background from a Bill Dingus clip and write a transparent WebM (VP9 + alpha) and a PNG sequence.

usage: key_clip.py <in.mp4> <out_dir> [name]
Needs: ffmpeg, pip install rembg onnxruntime pillow numpy
Frames are matted with the isnet-general-use model, then the alpha is blended 25% with the previous frame to stop edge flicker.
"""
import os, subprocess, sys, tempfile, glob
import numpy as np
from PIL import Image
from rembg import remove, new_session

src, out_dir = sys.argv[1], sys.argv[2]
name = sys.argv[3] if len(sys.argv) > 3 else os.path.splitext(os.path.basename(src))[0]
os.makedirs(out_dir, exist_ok=True)
tmp = tempfile.mkdtemp(prefix="billkey_")
raw, png = os.path.join(tmp, "raw"), os.path.join(out_dir, name + "_png")
os.makedirs(raw); os.makedirs(png, exist_ok=True)

subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, os.path.join(raw, "%05d.png")], check=True)
fps = subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                               "stream=r_frame_rate", "-of", "csv=p=0", src]).decode().strip()

session = new_session("isnet-general-use")
prev = None
for f in sorted(glob.glob(os.path.join(raw, "*.png"))):
    done = os.path.join(png, os.path.basename(f))
    if os.path.exists(done):  # resume after an interrupted run
        prev = np.asarray(Image.open(done))[..., 3].astype(np.float32)
        continue
    out = remove(Image.open(f).convert("RGB"), session=session)
    a = np.asarray(out)[..., 3].astype(np.float32)
    if prev is not None:
        a = 0.75 * a + 0.25 * prev
    prev = a
    arr = np.asarray(out).copy(); arr[..., 3] = a.astype(np.uint8)
    Image.fromarray(arr, "RGBA").save(os.path.join(png, os.path.basename(f)))
    print(os.path.basename(f), flush=True)

webm = os.path.join(out_dir, name + "_alpha.webm")
cmd = ["ffmpeg", "-v", "error", "-y", "-framerate", fps, "-i", os.path.join(png, "%05d.png"), "-i", src,
       "-map", "0:v", "-map", "1:a?", "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "20",
       "-auto-alt-ref", "0", "-c:a", "libopus", "-shortest", webm]
subprocess.run(cmd, check=True)
print("wrote", webm)
