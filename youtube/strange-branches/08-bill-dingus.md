# BILL DINGUS: channel avatar

Bill Dingus is the power source of every world Strange Branches creates or dissects. He is god-like, not monstrous: calm and absolute, able to build a world in his palm and crush it on a whim. On screen his name is only ever **BILL DINGUS**.

## Design (original character; draws on two reference traits)
| Element | Look | Inspired by |
|---|---|---|
| Silhouette | Tall, slender, pure black humanoid | Mob at 100% (Mob Psycho 100) |
| Hair | Spiky **black flame mane** rising off his head, with white highlight streaks and a white glow rim | Mob's hair at 100% |
| Eyes | Two glowing white dots, no mouth. Expressions: dots (neutral), slits (thinking), cut-off brows (angry), arcs ^ ^ (happy/waving) | Mob at 100% |
| Skin | Black-and-white maze bands that slowly flow. **Lore:** they are living contour maps of the worlds he has made | God's markings (Versus) |
| Power | A white light sphere behind him, with **matter** (glowing white and amber specks) and **dark matter** (black orbs with violet rims) orbiting him; ink flakes peel off his body | Mob at 100% |
| Accent | **Amber `#e0a020`**: the colour of creation | Channel logo |

**Background beings** (far away, slow): a dark-purple jellyfish, a greenish star serpent, a white ring watcher with one slit eye.

**Type:** Audiowide for every title (STRANGE BRANCHES, the tagline, BILL DINGUS).
**Palette:** ink `#0b0b0d`, paper `#f6f5ef`, cream `#efe6cf`, amber `#e0a020`, violet `#8a4fd8`, star green `#5fe0a0`, logo green `#1f4a35`.

## Intro (10 s)
| Time | Beat |
|---|---|
| 0–1 s | Darkness. Only two eyes open. |
| 1–2 s | The light sphere erupts behind him; the flame mane flares up. |
| 2–4.5 s | Matter and dark matter rise and begin orbiting him. |
| 4.5–6.4 s | He raises a hand; matter spirals in and forms a small amber world. |
| 6.4–6.95 s | He crushes it. |
| 6.95–7.07 s | **Impact frames** (one frame each): a colour-inverted negative with speed lines, his silhouette on white, his silhouette on amber. |
| 7.08–7.4 s | **Five shockwave rings** in quick succession (ink, amber, violet, ink, amber); matter blasts outward. |
| 7.5–10 s | Fade to black; his eyes remain above **STRANGE BRANCHES** / EVOLUTION THAT NEVER HAPPENED. |

## Outro (10 s)
He stands in the light with matter orbiting him, above **BILL DINGUS** and "NEW BRANCH EVERY SATURDAY". At about 5.5 s he **waves goodbye** with happy ^ ^ eyes. At 8.2 s the light collapses into him and his eyes close last. The left and right thirds stay clear for YouTube end screens.

## Scenario clips (4 s each)
| Clip | Behaviour | Use it when… |
|---|---|---|
| **Thinking** (seamless loop) | Hand on chin, narrowed eyes looking up; his markings swirl faster; matter orbits his head; an amber "…" pulses | Posing a what-if, or a "but then…" pause |
| **Frustrated** (seamless loop) | Fists clenched and trembling, angry eyes, flames flaring, ink bursting off him, a pulsing anger mark | A theory falls apart, or a fan favourite gets dunked on |
| **Spirit Gun** (one-shot) | Points his index finger; it charges violet and amber; a beam fires; impact frames; two galaxies are blown apart with ripples | Destroying a bad idea, or a dramatic "nope" |

Each clip comes in four versions: **16:9 and 9:16**, each as a **full scene** and as an **overlay**. The overlay is a green-screen MP4 (use CapCut's Chroma key) plus a transparent WebM.

## Files
- `tools/narrator/narrator.html`: live preview with every mode, both aspect ratios and an overlay toggle.
- `tools/narrator/narrator.js`: the renderer, `render(canvas, t, mode, W, H, { overlay })`.
- `tools/narrator/render-frames.js`: frame exporter (Playwright). Encode at 24 fps.

## Sound brief (CapCut)
- **Intro:**
  - 0 s: a sub-bass hum.
  - 1 s: a reversed cymbal into a choir swell.
  - 5 s: a crystalline shimmer.
  - 6.9 s: a crunch, silence over the impact frames, then a massive boom plus five rapid thuds for the ripples.
  - 8 s: one low synth note.
- **Spirit Gun:** a rising charge whine, then a "pew" crack at 1.2 s, then a boom at 1.62 s.
- **Thinking:** a soft hum.
- **Frustrated:** a low growl with a heartbeat.
