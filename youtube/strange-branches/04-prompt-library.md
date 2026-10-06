# Prompt Library — Strange Branches

Paste `00-channel-bible.md` into the chat (or Project knowledge) before using these prompts.

---

## P1 — Research brief
```
You are the research lead for "Strange Branches", a speculative-biology documentary channel.
Topic: {TOPIC}
Produce a 1-page research brief:
1. The core "what if" and the exact divergence point (when/what changes).
2. The world rules: physics, climate, atmosphere and ecology constraints that follow.
3. 6–8 REAL-WORLD ANCHORS: real organisms, fossils or phenomena that justify each speculative step (name + one-line fact + source).
4. A deep-time timeline with 4–5 jumps (e.g. +1K, +1M, +10M, +50M years), each with the key evolutionary pressure.
5. 5–7 candidate creatures: niche, ancestor, key adaptation, why it is plausible.
6. Common misconceptions to avoid.
7. Three possible philosophical closing thoughts.
Flag anything that is uncertain or debated. Do not invent sources.
```

## P2 — Script writer
```
Write a {LENGTH}-minute narration script (~150 words/min) for Strange Branches.
Topic: {TOPIC}. Use this research brief: {BRIEF}.
Narrator: "The Archivist" — calm, awed, slightly ominous naturalist (Attenborough reading a forbidden field journal).
Structure:
- COLD OPEN (≤30s): a concrete, cinematic image. No "Have you ever wondered".
- PREMISE (≤60s): the divergence + the stakes + a promise of what we'll see.
- 4–5 TIME JUMPS: each opens with an on-screen time stamp [+N YEARS], introduces 1–2 named creatures (binomial + common name), and anchors each to a real organism.
- A "pattern interrupt" or reveal every ~90 seconds.
- CLIMAX: the strangest branch.
- CLOSE: philosophical turn, then a hook into {NEXT_EPISODE}, then the sign-off "Every branch is real somewhere. This has been Strange Branches."
Format as a two-column style: [VISUAL] cue line, then narration paragraph.
Write short, spoken sentences. No lists in narration. No clichés ("in a world", "buckle up").
```

## P3 — Creature / world image prompt (Midjourney / Magnific / Flux)
```
{CREATURE DESCRIPTION}, speculative evolution creature, scientifically plausible anatomy,
painterly realistic natural-history illustration, cinematic nature documentary still,
{HABITAT}, dramatic rim lighting, deep teal and bioluminescent cyan palette with amber accents,
dark moody background, high detail skin/feather texture, shallow depth of field, 16:9
--ar 16:9 --style raw --sref {STYLE_REF_URL} --s 250
```
Variants:
- **Specimen card:** `…isolated on aged parchment field-journal page, side profile, labeled scale bar, museum illustration style`
- **Establishing world shot:** `…vast alien/alternate landscape, epic wide shot, atmospheric haze, tiny creatures for scale`
- **Gods & Concepts:** `…ancient idol / deity rendered as a living organism, branching antlers of light, ritual cave setting, mythic yet biological`

Keep ONE `--sref` style reference for the entire channel, which keeps the look consistent.

## P4 — Image-to-video motion prompt (Kling / Runway / Veo)
```
Slow cinematic push-in, subtle natural movement: {breathing / blinking / feathers ruffling / mist drifting},
nature-documentary camera, stable, no morphing, realistic motion, 5 seconds
```

## P5 — Packaging (titles, thumbnail, description)
```
For the Strange Branches video "{TOPIC}" (primary keyword: {KEYWORD}):
1. 10 title options, ≤60 characters, using these proven patterns: "What If…?", "+N Million Years Later", "What Will Evolve After…", second-person "…Isn't Done With You". Mark your top 2.
2. 3 thumbnail concepts: ONE subject, ≤4 words of text, emotion/eye contact, dark background with cyan or amber accent.
3. A description: first 2 lines = hook + keyword; then a 3-sentence summary; chapters placeholder; "Sources" section; 5 hashtags.
4. 15 tags.
```
Then score the top titles with vidIQ (`score title`) and keep the best 2 for A/B testing.

## P6 — Shorts cutter
```
From this script: {SCRIPT}
Give me 4 YouTube Shorts (≤55s each): Specimen Card, Time-Jump, Hook Clip, and one "Could this really exist?".
For each: on-screen text hook (≤6 words), narration, visual list, and a closing line that points to the full video.
```
