---
videomd: 1
part: packaging
tokens: 1227
---

## Packaging layer (subtitles / styled text / stickers / sound-effect hits)

- styled text ×3 (large size, yellow fill, multi-colour / gradient, blue fill, thick outline): "46.35", "SENSATIONAL!", "80"
- title ×5: "TUMBLEWIN", "TOAL", "TOTAL MULTIPLI", "OLYMPUS SUPERS", "45x"
- text label ×12: "46.35", "FREE SPINS LEF", "11A", "0.18", "WINCA$58.53", "CREDIT CA$760." …
- counter ×13: "0.40 0.30", "80", "100 0.10", "0.10 0.05", "7", "0.30" …
- Exports: `packaging/overlays.ass`, `packaging/timeline.json` (SRT is the subtitle timeline; ASS carries colour, outline, position and entrance animation, swap in the original font; timeline.json is the full timeline)

**text timeline (33 rows)**

| Time | Kind | Text | Style | In / out | SFX |
|---|---|---|---|---|---|
| 0.00–1.90s | title | TUMBLEWIN | yellow text, keywords highlighted in purple, line height 3.2% (about 32px) | hard out | — |
| 0.00–1.60s | text label | 46.35 | yellow text, line height 4.8% (about 48px) | hard out | — |
| 0.00–1.60s | title | TOAL | yellow text, keywords highlighted in yellow, line height 3.7% (about 37px) | — | — |
| 0.00–2.50s | title | TOTAL ⏎ MULTIPLIER | yellow text, line height 3.2% (about 32px) | — | — |
| 0.00–2.50s | title | OLYMPUS ⏎ SUPERSCATTER | yellow text, red outline, keywords highlighted in black, line height 5.1% (about 51px) | — | — |
| 0.00–2.50s | text label | FREE SPINS ⏎ LEFT | yellow text, line height 3.3% (about 33px) | — | — |
| 0.00–1.10s | counter | 0.40 ⏎ 0.30 | orange text, line height 3.2% (about 32px) | — | — |
| 0.00–1.10s | counter | 80 | black text, line height 4.3% (about 43px) | shrink out | — |
| 0.00–1.10s | counter | 100 ⏎ 0.10 | brown text, keywords highlighted in black, line height 4.0% (about 40px) | hard out | — |
| 0.00–0.60s | counter | 0.10 ⏎ 0.05 | yellow text, line height 3.5% (about 35px) | — | — |
| 0.00–0.60s | text label | 11A | green text, keywords highlighted in black, line height 4.1% (about 41px) | hard out | — |
| 0.00–1.60s | text label | 0.18 | brown text, line height 3.5% (about 36px) | slide out | — |
| 0.00–2.50s | text label | WINCA$58.53 | white text, line height 6.9% (about 69px) | — | — |
| 0.00–2.10s | text label | CREDIT CA$760.64 | white text, black outline, keywords highlighted in orange, line height 3.5% (about 36px) | shrink out | — |
| 0.00–2.50s | text label | AUTOPLAY | grey text, black outline, line height 3.1% (about 31px) | — | — |
| 0.00–2.50s | text label | PRAGMATICPLAY·#134997004711027 | grey text, line height 2.5% (about 24px) | — | — |
| 0.00–2.50s | title | 45x | black text, gradient, line height 6.9% (about 69px) | — | — |
| 0.50–1.10s | styled text | 46.35 | yellow text, keywords highlighted in red, line height 8.2% (about 82px) | fade in / hard out | — |
| 0.50–1.60s | counter | 7 | white text, line height 5.5% (about 55px) | — | — |
| 0.50–2.10s | text label | BET CA$0.20 | grey text, grey outline, keywords highlighted in yellow, line height 3.5% (about 36px) | hard out | — |
| 0.60–1.40s | counter | 90 ⏎ 0.05 ⏎ 0.18 | yellow text, line height 3.1% (about 31px) | hard in / hard out | — |
| 0.60–1.40s | styled text | 80 | blue text, grey outline, line height 3.2% (about 32px) | hard in / hard out | — |
| 1.00–1.10s | styled text | SENSATIONAL! | yellow text, orange outline, keywords highlighted in black, line height 31.4% (about 314px) | hard in / hard out | — |
| 1.00–1.60s | counter | 0.30 | brown text, line height 3.4% (about 34px) | hard out | — |
| 1.00–1.60s | text label | 11A | black text, keywords highlighted in green, line height 4.0% (about 40px) | hard in | — |
| 1.30–1.90s | counter | 0.10 | orange text, keywords highlighted in black, line height 3.7% (about 37px) | hard in / slide out | — |
| 1.40–2.00s | counter | 0.40 | orange text, line height 3.5% (about 36px) | slide out | — |
| 1.40–1.80s | counter | 0.05 | yellow text, line height 3.5% (about 36px) | hard in | — |
| 1.50–1.60s | counter | 8 | orange text, line height 2.5% (about 24px) | hard in / hard out | — |
| 1.50–1.60s | counter | 10 | red text, bold, line height 3.8% (about 38px) | hard in / hard out | — |
| 1.80–2.50s | counter | 6 | blue text, line height 4.7% (about 47px) | hard in | — |
| 1.90–2.50s | text label | HIT | yellow text, yellow outline, line height 5.5% (about 55px) | — | — |
| 1.90–2.30s | text label | TO MULTIPLY TUMBLE WIN | yellow text, black outline, keywords highlighted in purple, line height 4.7% (about 47px) | shrink out | — |

Remake: burn subtitles and styled text in with `packaging/overlays.ass` (ffmpeg -vf ass=overlays.ass), or rebuild them from timeline.json in CapCut / Remotion; stickers and GIFs need matching assets (meme / GIF libraries), crops are under packaging/.
