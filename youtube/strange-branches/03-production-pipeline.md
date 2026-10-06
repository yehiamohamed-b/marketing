# Production Pipeline & Automation

Target: one finished 12–15 min video in **~6–8 hours of human time**, falling to ~4 hours once templates mature.

## 1. Pipeline overview

```
IDEA BANK ──► RESEARCH ──► SCRIPT ──► VOICE ──► VISUALS ──► EDIT ──► PACKAGE ──► PUBLISH ──► REPURPOSE
(Sheet)       (Claude/     (Claude +  (Eleven-  (Magnific/  (CapCut)  (Canva +    (YouTube    (Shorts,
               vidIQ)       human      Labs or   Midjourney                vidIQ)      Studio)     specimen
                            edit)      vidIQ)    + Kling/Runway)                                    cards)
```

## 2. Step-by-step SOP

| Step | Tool | Input → Output | Time |
|---|---|---|---|
| 1. Pick topic | Idea Sheet + vidIQ outliers/keywords | Topic, keyword, title shortlist | 20 min |
| 2. Research brief | Claude (prompt P1) | 1-page science brief with real-world anchors and sources | 30 min |
| 3. Script | Claude (prompt P2) → human edit | 1,800–2,400-word script, with shot list and creature names | 90 min |
| 4. Voiceover | ElevenLabs (fixed "Archivist" voice) or vidIQ voiceover | WAV per section | 20 min |
| 5. Creature/world art | Midjourney / Magnific (prompt P3), consistent style ref | 60–100 stills | 90 min |
| 6. Upscale + animate | Magnific upscaler → Kling / Runway / Veo image-to-video (P4) | 20–40 animated clips (5–10s) | 60 min |
| 7. Edit | CapCut: VO → visuals → time-jump overlays → score + SFX | 1080p/4K master | 90 min |
| 8. Package | Canva thumbnail template + vidIQ title score (P5) | 3 thumbnails, 2 titles, description | 30 min |
| 9. Publish | YouTube Studio | Scheduled video + end screens | 15 min |
| 10. Repurpose | CapCut templates | 3–5 Shorts + 1 community post (specimen card) | 45 min |

## 3. Google Drive folder structure
```
Strange Branches/
├── 00_Brand/            logo, fonts, palette, thumbnail templates, voice settings
├── 01_Idea_Bank.gsheet  topic | pillar | keyword | volume | status | publish date | views 7d/28d
├── 02_Episodes/
│   └── EP01_Dinosaurs_Never_Died/
│       ├── script.gdoc
│       ├── vo/
│       ├── images/
│       ├── clips/
│       ├── thumbnails/
│       └── shorts/
└── 99_Analytics/        monthly reviews
```

## 4. Automation roadmap

**Phase 1 (now, manual + templates):** run the prompts below by hand; track everything in the Idea Sheet.

**Phase 2 (month 2), semi-automated with Make.com or n8n:**
1. Trigger: Idea Sheet row status → `Approved`
2. Claude API: research brief → script draft → save to Google Doc in the episode folder
3. Claude API: extract the shot list → generate image prompts → send to the image API (Midjourney via a proxy, or Magnific / Flux API) → save to `images/`
4. ElevenLabs API: script → VO files → `vo/`
5. Notify (email/Slack): "EP ready for edit"

The human stays in charge of script editing, visual curation, final edit and packaging. This keeps the channel *authored* (see the policy section in the channel bible).

**Phase 3 (month 3+):** CapCut templates for Shorts; auto-generate specimen cards from a creature database (Sheet → Canva bulk create).

## 5. Tool stack and indicative monthly cost
| Tool | Use | Approx. cost |
|---|---|---|
| Claude / ChatGPT | Research and scripts | Existing plan |
| ElevenLabs (Creator) | Narrator voice | ~$22/mo |
| Midjourney (Standard) or Magnific | Stills + upscale | ~$30–40/mo |
| Kling or Runway | Image-to-video | ~$10–35/mo |
| CapCut Pro | Editing | ~$8–10/mo |
| Canva Pro | Thumbnails, cards | ~$13/mo |
| vidIQ | Keywords, titles, outliers | Current plan |

Prices change, so check each vendor before subscribing. You can start lean: ElevenLabs, Midjourney, CapCut free tier and Canva.

## 6. KPIs and review rhythm
| Metric | Week-1 target per video | Month-3 goal |
|---|---|---|
| CTR | ≥ 5% | ≥ 7% |
| Average view duration | ≥ 40% | ≥ 50% |
| First 30-sec retention | ≥ 70% | ≥ 75% |
| Subs | — | 1,000 subs + 4,000 watch hours by month 4–6 |

Every 4 weeks: pull the top 3 and bottom 3 videos, compare titles, thumbnails and the retention graph, and update this plan.
