# YouTube Resource Library

Tools, sites, fonts and repos pulled from 9 Instagram reels (vibe-coding / web-design / AI-tools niche) in Nov 2026.

**Verification status (read first):** the cloud session's network policy blocked every site below, so **nothing here is confirmed live, and no pricing is confirmed.** Names and URLs were read from on-screen text by vidIQ's video analysis, so spelling may be off. "Said in reel" means the creator claimed it, not that I checked. Only the GitHub repo was confirmed (see section 1). To finish the check, add these hosts under Allowed domains in the environment's network settings, or open each link yourself.

Status key: ✅ confirmed · ❓ not verified

## 1. Research agent (priority)
| Resource | Link | Status | Notes |
|---|---|---|---|
| **Agent-Reach** | https://github.com/Panniantong/Agent-Reach | ✅ repo live, MIT licence, ~108k stars | One CLI that lets an AI agent read and search Twitter/X, Reddit, YouTube, GitHub, Bilibili, XiaoHongShu and the web. Zero API fees. Needs Python 3.10+. Some channels need a login (Reddit, X, Instagram, LinkedIn search). YouTube speech-to-text needs a Groq or OpenAI key. |
| autocli-skill (alternative) | https://github.com/nashsu/autocli-skill | ❓ | 55+ platforms via your Chrome login session, no API keys. |

**Install (official method, from the repo's install guide).** Run these yourself, or approve the permission prompt so I can:
```bash
uv tool install https://github.com/Panniantong/Agent-Reach/releases/latest/download/agent-reach.zip
agent-reach setup
agent-reach channels
```
Do **not** `pip install agent-reach`: the PyPI package with that name is a different project. After setup, use e.g. `agent-reach youtube search "<niche keyword>"` or `agent-reach read <url>`.

## 2. Vibe-coding and UI component libraries
| Resource | URL | Status | Said in reel |
|---|---|---|---|
| Watermelon UI | ui.watermelon.sh | ❓ | Hundreds of ready-to-use components |
| Cult UI | cult-ui.com | ❓ | shadcn extras with personality |
| Skipper UI | skipper-ui.com | ❓ | Niche animations |
| Componentry | componentry.dev | ❓ | Animated React UI, Tailwind + TypeScript + Framer Motion preinstalled |
| Motion | motion.dev | ❓ | Hover, drag and layout transitions |

## 3. AI builders and tools
| Resource | Where | Status | Said in reel |
|---|---|---|---|
| Manus | manus.im | ❓ | Builds apps/sites/slides with backend, analytics and SEO. Creator offers free credits. Seen in 2 reels. |
| ChatCut | ChatGPT plugin (no URL shown; search "ChatCut ChatGPT") | ❓ | Video editor inside ChatGPT |
| Claude Code CLI | terminal | ❓ | Used to run the internet-access agent |
| Paper Animation AI | paperanimation.ai | ❓ | Paper / newspaper-cutout animations from a prompt |
| Canva "Map video" | Canva → Apps → Map video | ❓ | Animated flight-route maps |

## 4. Free templates and learning
| Resource | Where | Status | Said in reel |
|---|---|---|---|
| Framer templates | framer.com → Resources → Templates → "Use for Free" | ❓ | Examples: Fuel X, Miles, Homy |
| MIT OpenCourseWare | ocw.mit.edu | ❓ | Free courses (Biology, AI, Literature) |

## 5. Website inspiration (all ❓)
**Experimental sites:** twomuch.studio · unbelievablycrap.com · haoqi.design · incredibles.dev · experience2026.funtech.inc · shopify.com/editions/winter2026 · howtotalktowhitekidsaboutracism.com

**Portfolios:** danilodemarco.com · niccolomiranda.com · ollivere.webflow.io · thibaut.cool · 2xa.studio · bleibtgleich.dev

## 6. Fonts
Impact (bold vertical titles) · Snell Roundhand (luxury script) · Rocktown (brush script). Tip from the reel: pair a bold sans with a script.

## 7. Effect and look names (search terms for overlays/presets)
CRT scanlines · receipt/thermal paper · depth map · blob tracking · datamosh · 1-bit dither · night-vision HUD.

## 8. Claude effect prompt pack (names only)
/pov-carousel-spin · /liquid-glass-graph · /match-cut · /screen-push-digital · /apple-ui-toggles · /over-the-shoulder-zoom · /stack ("Effect of the Day", 20 effects). The prompts themselves are gated behind a comment keyword on that reel, so they are not captured here.

## 9. Gated lists
Creators in these reels hand out lists only for a comment keyword: WEB, PORTFOLIO, Wow, STACK, Manus.

## Source reels
DeSbT_lEZGL · DezKlo6OXak · DdEjvN9OvjX · DezeMvbTjl4 · DdTaFrPxL7S · DcBwAjvoEqI · Dd08uX3ocwk · DbvcXf3heFx · DeCDNPzJkfN (instagram.com/reel/<id>)
