#!/usr/bin/env bash
# Join the keyed Bill clips into one sequence with 0.4 s crossfades.
# usage: build_sequence.sh <keyed_dir> <out_dir>
# Writes: bill_sequence_alpha.webm (transparent, for CapCut/Premiere overlay)
#         bill_sequence_on_dark.mp4 (preview on the channel's dark violet backdrop)
set -euo pipefail
K="$1"; O="$2"; mkdir -p "$O"
A="$K/looking-at-camera_alpha.webm"; B="$K/points-at-screen_alpha.webm"; C="$K/talking-gestures_alpha.webm"
X=0.4
# offsets: A is 9.96 s, B is 10 s, C is 10 s
ffmpeg -v error -y -c:v libvpx-vp9 -i "$A" -c:v libvpx-vp9 -i "$B" -c:v libvpx-vp9 -i "$C" -filter_complex "
[0:v]format=yuva420p[a];[1:v]format=yuva420p[b];[2:v]format=yuva420p[c];
[a][b]xfade=transition=fade:duration=$X:offset=9.55[ab];
[ab][c]xfade=transition=fade:duration=$X:offset=19.15[v];
[0:a][1:a]acrossfade=d=$X[aa];[aa][2:a]acrossfade=d=$X[aud]" \
  -map "[v]" -map "[aud]" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 20 -auto-alt-ref 0 -c:a libopus "$O/bill_sequence_alpha.webm"
ffmpeg -v error -y -f lavfi -i "color=c=0x14062a:s=1920x1080:r=24:d=29.6" -c:v libvpx-vp9 -i "$O/bill_sequence_alpha.webm" \
  -filter_complex "[1:v]scale=1920:1080[f];[0:v][f]overlay=shortest=1,format=yuv420p[v]" \
  -map "[v]" -map 1:a -c:v libx264 -crf 18 -c:a aac "$O/bill_sequence_on_dark.mp4"
