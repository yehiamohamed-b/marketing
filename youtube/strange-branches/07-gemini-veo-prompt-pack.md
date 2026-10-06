# Gemini (Veo) Prompt Pack: 9:16 Shorts Title Screens

Turns the 5 voxel title screens into vertical 9:16 clips for Shorts, Reels and TikTok, using Veo inside Gemini (Pro tier).

## 1. Files you have (and why they won't cause format issues)

| File | What it is | Use it for |
|---|---|---|
| `strange-branches-<theme>-16x9-loop.mp4` | The 12-second seamless loop, 1920×1080 | Long-form intros and b-roll. Also upload it to the Gemini **chat** as a style reference (step 3B) |
| `strange-branches-<theme>-9x16-start.png` | A 1080×1920 starting frame in the same style | **Upload this to Veo** as the starting image for each Short |
| `strange-branches-<theme>-9x16-alt.png` | A second 9:16 frame from the "every eye looks at you" moment | An alternative starting frame |
| `strange-branches-<theme>-16x9-start.png` | The 1920×1080 first frame | For landscape Veo clips if you need them |

Themes: `main` (the Eye), `myth`, `human`, `anime`, `fungi`.

**Format check:** every MP4 is **H.264 (High profile), yuv420p, 24 fps, 1920×1080, 12 s, no audio track, with "fast start" enabled**. That's the most widely supported MP4 profile. Each file is about 20–60 MB, far under Gemini's limits: MP4 is a supported format, and the Gemini web app allows videos up to 2 GB and 5 minutes. The PNGs are well under Veo's 20 MB image limit.

## 2. Veo settings
- **Aspect ratio: 9:16 (vertical).** If the app doesn't show a selector, the prompt text below states "vertical 9:16" and the starting image is already 9:16.
- **Length:** 8 s, the Veo maximum per clip. For a 15–30 s Short, generate 2–3 clips and join them in CapCut (see step 4).
- **Resolution:** 1080p if offered.
- **Audio:** Veo 3 can generate sound. Each prompt describes a soundscape; delete that line if you'd rather add your own music.

Veo's exact options and limits change over time, so go by what the Gemini app shows you.

## 3. How to run it

**A. Image-to-video (recommended):** Gemini → *Video* (Veo) → upload `…-9x16-start.png` → paste the **Prompt A** for that theme → generate. Use **Prompt B** for a second, different 8-second shot.

**B. Use the MP4 as a style reference (optional):** in a normal Gemini chat, upload `…-16x9-loop.mp4` and paste:
> "This is the title-screen loop for my YouTube channel Strange Branches. Describe its visual style precisely (palette, voxel/pixel treatment, dithering, glitch effects, motion, mood) in under 120 words, then rewrite the following Veo prompt so a 9:16 vertical version matches that style exactly: [paste Prompt A]."

Then use the improved prompt in step A.

**Text-only fallback:** if you don't upload an image, prepend the **Style block** below to any prompt.

### Style block (shared by every theme)
> Low-resolution voxel art rendered like a 1990s PlayStation horror game, chunky cube-built 3D models, heavy ordered dithering, limited colour palette with bruised-purple shadows, CRT scanlines, film grain, subtle chromatic aberration, occasional glitch distortion, deep black starfield void, cosmic horror mood, eerie and beautiful, vertical 9:16 composition.

### Negative list (add to every prompt as "Avoid:")
> Avoid: smooth realistic rendering, photorealism, text, logos, watermarks, subtitles, UI, human faces in close-up, gore, sudden camera cuts, fast camera spin, bright daylight.

---

## 4. Prompts per theme

### MAIN: The Eye (general cosmic horror and speculative biology)
**Prompt A, slow reveal:**
> Vertical 9:16. Starting from this image: a colossal voxel eye-entity hangs in a black cosmic void, crowned with bone spikes, ringed by golden wheels studded with blinking eyes, with six wings of bone feathers each tipped with an eye. Distant smaller eye-creatures with dangling tentacles drift in the background, and colossal tentacles rise from the darkness below. The camera slowly drifts upward and pushes in toward the great slit-pupil eye. The iris shifts from ember orange to magenta. All the small eyes blink out of sync, then every eye turns at once to stare directly at the viewer. The screen glitches with chromatic aberration as the entity pulses. Sound: deep sub-bass drone, wet organic creaks, a faint distorted choir, a single heartbeat thump when the eyes lock on. [Style block] [Negative list]

**Prompt B, the struggle:**
> Vertical 9:16. Low angle on a tiny floating island of stone: a wounded armoured knight on one knee, clutching a sword planted in the ground, is dragged backwards by a fleshy tendril coiled around their ankle. The tendril pulses with glowing red bulges, and red veins spread across the ground. High above, filling the top of the frame, the giant many-eyed entity watches. The camera slowly tilts up from the knight to the entity. Embers drift from a dying bonfire. Sound: dragging metal on stone, a strained breath, low drone, the tendril's wet tightening. [Style block] [Negative list]

### MYTH: The World-Tree (myths and mythological creatures)
**Prompt A:**
> Vertical 9:16. Starting from this image: a voxel World-Tree floats in a starry void, its golden-green canopy shimmering and its roots hanging into darkness below. A single enormous eye is set into the trunk (Odin's sacrificed eye), and a green-and-gold world-serpent coils slowly around it. Five hydra heads rise from the canopy, jaws opening. Constellations shaped like a wolf, a stag and a scorpion glitter in the sky, and giant stone colossus heads drift past with their eyes shut, until they all open at once. Golden leaves fall. The camera rises slowly from the roots to the canopy. Sound: wind through enormous leaves, distant temple bells, a low serpent hiss, a deep horn note when the stone eyes open. [Style block] [Negative list]

**Prompt B:**
> Vertical 9:16. On a floating island of broken marble columns, a fallen bronze-armoured hoplite with a red-crested helmet clutches a spear in the ground while a scaled serpent body drags them by the ankle toward the World-Tree. Golden cracks of light spread through the stone. A round shield lies dropped beside them. Slow push-in, then the hydra heads above all snap their gaze to the viewer. Sound: scraping bronze, hissing, a choir holding one note. [Style block] [Negative list]

### HUMAN: The Next Human (human evolution and human-based videos)
**Prompt A:**
> Vertical 9:16. Starting from this image: an enormous voxel fetal head floats inside a shimmering amber amniotic membrane, pale skin with faint blue veins, one huge eye closed in sleep. Umbilical cords hang from it down to a small stone island far below, tethered to the backs of early humans. Giant red-and-blue DNA double helices rotate slowly on both sides, and ancient hominid skulls drift like moons. The camera pushes in slowly; the membrane ripples; the giant eye opens and looks straight at the viewer, and the skulls' eye sockets light up red. Sound: muffled womb heartbeat, amniotic whooshing, low choir, a sharp inhale when the eye opens. [Style block] [Negative list]

**Prompt B:**
> Vertical 9:16. A small early human in fur on one knee inside a ring of standing stones, gripping a torch, as a thick umbilical cord attached to their back pulls them upward and backward. Two other humans stand frozen, also tethered. On a ridge behind, a silhouette "march of progress" goes from hunched ape to upright human to a tall, elongated future form. Slow tilt up from the struggling human to the giant fetal eye above. Sound: crackling torch, a straining cord, distant heartbeat. [Style block] [Negative list]

### ANIME: The Celestial Titan (anime characters and anime universes)
**Prompt A:**
> Vertical 9:16. Starting from this image: a colossal white-and-red armoured titan hangs in the void with its arms flung wide, a single glowing cyan visor eye, a segmented golden halo rotating behind its head, and six crystalline wings cycling between cyan and magenta. Behind it a huge blood-red moon; red torii gates drift through the sky; cherry blossom petals fall. The camera slowly rises and pushes in as the visor eye opens and locks onto the viewer, and speed-line glitches pulse across the frame. Sound: deep resonant choir, mechanical hum, wind chimes, a bass impact when the eye locks on. [Style block, plus "anime-inspired palette of magenta, cyan and blood red"] [Negative list]

**Prompt B:**
> Vertical 9:16. A small swordsman in a white haori with a red scarf whipping in the wind, on one knee on a shrine island beside a torii gate and glowing stone lanterns, clutching a broken katana planted in the ground. A glowing cyan seal-chain coiled around their ankle drags them backward toward the titan above. A giant katana is stuck in the void behind them. Petals swirl. Slow tilt up from the swordsman to the titan's halo. Sound: chain rattling, the hum of a sealing spell, falling petals, a heartbeat. [Style block] [Negative list]

### FUNGI: The Mother Bloom (parasites, zombies, fungi, Last of Us-type creatures)
**Prompt A:**
> Vertical 9:16. Starting from this image: a colossal voxel fungus with a wrinkled brain-like cap and glowing yellow-green gills grows out of the ribcage of a gigantic buried corpse. Dozens of thin cordyceps stalks sway from its cap, each ending in a bulb that slowly opens into a yellow eye. Clouds of glowing spores rise and drift. An overgrown, dark city skyline sits on the horizon. The camera slowly pushes in and up the stalk to the cap as the gills pulse and every bulb-eye opens toward the viewer. Sound: wet clicking, spore puffs, creaking wood, distorted breathing, a low organ drone. [Style block, plus "sickly yellow-green and rust palette"] [Negative list]

**Prompt B:**
> Vertical 9:16. A survivor in a gas mask with glowing teal lenses and a backpack, on one knee holding a lantern, as pale mycelium threads wrap their legs and pull them toward the giant fungus. Green infection veins glow up their arm. Infected humans stand frozen nearby with fungal stalks sprouting from their heads. Spores drift through the lantern light. Slow push-in toward the survivor, then a tilt up to the cap. Sound: muffled breathing through the mask, clicking, threads tightening. [Style block] [Negative list]

---

## 5. Assembling a 15–30 s Short in CapCut
1. Import 2–3 Veo clips for the same theme (e.g. Prompt A + Prompt B + a second take of A).
2. Order them: **struggle (B) → reveal (A) → eyes lock on (end of A)**. Cut on the yank/glitch moments so each cut looks intentional.
3. Add the channel title as text in the top 15% of the frame and a hook line in the middle (e.g. *"What if the Bible's angels were real biology?"*). Keep the bottom 20% clear, because Shorts UI covers it.
4. Export at 1080×1920, 30 fps, H.264.
5. To make it loop, end on a frame close to your first frame (a slow push-in ending on the eye works well).
