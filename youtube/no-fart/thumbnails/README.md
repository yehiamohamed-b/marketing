# No Fart thumbnail templates (1280x720)

| # | Template | Use for | Bill pose to swap in |
|---|---|---|---|
| 01 | `01-what-if` | "What if" hooks | `bill-point`, `bill-present` |
| 02 | `02-versus` | Versus / who wins | `bill-shrug`, `bill-hands-on-hips` |
| 03 | `03-reaction` | Reactions, "this is wild" | `bill-laugh`, `bill-facepalm`, `bill-flex` |
| 04 | `04-mystery` | Mystery, secrets (dark) | `bill-head-closeup` |
| 05 | `05-top-list` | Rankings, top lists | `bill-present`, `bill-salute` |
| 06 | `06-dark-explainer` | Power moves, breakdowns (dark) | `bill-flex` |

**Edit:** open any `templates/*.html`, change the text, swap the image `src` for another file in `../assets`, change `--accent` (red `#c4122f`, amber `#e0a020`, violet `#8a4fd8`) to colour-code a series.
**Export:** `NODE_PATH=$(npm root -g) node build.js` writes PNG and JPG (under 2 MB) to `exports/`.
**Rules baked in:** max 4 words, 120px+ type, one subject, bottom-right corner kept clear for the timestamp. See `research.md` for sources.
**Gaps:** the six exports are first drafts, checked only as a contact sheet. In 01 Bill overlaps Godzilla, and in 02 Bill is small. Bill has no mouth, so choose the pose for the emotion.
