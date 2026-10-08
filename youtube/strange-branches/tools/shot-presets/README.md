# Shot presets (engine-first animation)

Our voxel engine renders exact, repeatable 2–3 s shots. No AI is involved, so creature designs stay on-model every time.

## Ascension: the Shackled Giant
| Beat | Length | What happens | Camera |
|---|---|---|---|
| **Strain** | 3.0 s | Head bowed; the giant pulls against its shackles; the chains vibrate; blood drips; sparks burst at 2.2 s | Slow push-in, medium shot |
| **Wrath** | 3.0 s | Head lifts; the seven eyes snap into a narrowed glare at the lens; a glitch blip | Push-in to a head-and-chest close-up |
| **Lunge** | 2.5 s | Pulls back, lunges at the camera; the chains yank it back; sparks, camera shake, red glitch | Locked off, with shake on impact |

## Re-rendering (needs Node + Playwright + ffmpeg)
```
S=<folder containing npmthree/> BEATS=strain,wrath,lunge PORTS=0,1 node render-shots.js "$PWD/ascension-shots.html" ./out
# then, per beat folder:
ffmpeg -framerate 24 -i out/strain-16x9/f%04d.png -vf scale=1920:1080:flags=neighbor -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 26 -movflags +faststart strain.mp4
```
Every beat is a small function of time in `render-shots.js` (`BEATS.strain.at(...)`). To change timing, camera or intensity, edit the numbers there and re-render.
