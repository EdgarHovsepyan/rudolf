---
videomd: 1
part: packaging
tokens: 330
---

## Packaging layer (subtitles / styled text / stickers / sound-effect hits)

- title ×1: "OLYMPUS"
- text label ×3 (1 of them follow an object): "O", "SUPER SCATER", "JUPER"
- Exports: `packaging/overlays.ass`, `packaging/timeline.json` (SRT is the subtitle timeline; ASS carries colour, outline, position and entrance animation, swap in the original font; timeline.json is the full timeline)

| Time | Kind | Text | Style | In / out | SFX |
|---|---|---|---|---|---|
| 0.00–0.20s | text label | O | yellow text, orange outline, purple box, bold, line height 10.9% (about 131px) | hard out | — |
| 0.30–2.60s | title | OLYMPUS | yellow text, yellow outline, keywords highlighted in yellow, line height 7.0% (about 84px) | hard in | — |
| 0.30–1.50s | text label | SUPER SCATER | orange text, red outline, keywords highlighted in yellow, line height 11.3% (about 135px) | hard in | — |
| 1.50–2.60s | text label · follows an object | JUPER | brown text, orange outline, keywords highlighted in grey, line height 8.8% (about 105px) | hard in | — |

Remake: burn subtitles and styled text in with `packaging/overlays.ass` (ffmpeg -vf ass=overlays.ass), or rebuild them from timeline.json in CapCut / Remotion; stickers and GIFs need matching assets (meme / GIF libraries), crops are under packaging/.
