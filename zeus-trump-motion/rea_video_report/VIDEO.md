---
videomd: 1
name: original-excerpt
description: 'Made with (inferred): 2D animation 100%'
source:
  file: original_excerpt.mp4
  sha256: 1235d15504481d4825248854cab61cc19165e070993df9438659a9d2e8e76a81
  duration: 3.0
  size: 480x1200
  fps: 30.0
  aspect: 480:1200
shots: 3
lang: en
made_mix:
  anim_2d: 1.0
confidence: 0.7
readers:
- tools
- agent
open_questions: 3
generator:
  name: rea-video
  version: 0.1.0
---

# original_excerpt.mp4

**Verdict** (inferred): Mixed production: 2D animation 100% (100% of the duration lacks evidence for live action vs AI, to confirm); overlays: static graphics, title (composited in code / an editor); packaging: title ×1, text labels ×3
**Narrative**: #01 grab attention → #02 deliver the conclusion → #03 turn
**Made with** (inferred, by duration): 2D animation 100%
**Remake**: 3 2D animation shots → 1 generation unit, 1 Seedance 2.0 call

## Next steps

- Remake: `rea-video remake <this dir>` does what can be done automatically and keeps the original elsewhere; `remake/status.md` says per shot what is left. Add incoming clips to `remake/mine.json` and run it again
- AI shots: prompts are in the generation units of `video/remake.md`; for automatic generation run `rea-video remake-plan` + `remake-run --dry-run` (paid: ask the user first)

## Open questions

- Shot #1 (0.0–0.7s): 2D animation rests on a single image reader (the tools cannot measure this class): 2D animation is easily confused with code-driven motion g…
- Shot #2 (0.7–2.6s): 2D animation rests on a single image reader (the tools cannot measure this class): 2D animation is easily confused with code-driven motion g…
- Shot #3 (2.6–3.0s): 2D animation rests on a single image reader (the tools cannot measure this class): 2D animation is easily confused with code-driven motion g…

## Map

Read this page first; for detail, open only the file you need. Each line is `path | ~tokens | what is in it · when to read it`; paths are relative to this directory.

```videomd-map
video/timeline.md | 436 | Timeline: one line per shot · what a stretch says, which shots need review, how a shot was made
video/content.md | 178 | Content and structure · what it says, the narrative line, structure, the script
video/cast.md | 142 | Cast, scenes and props · reference images for characters, first-frame prompts
video/sound.md | 18 | Sound · voice, music, sound effects, beats and sources
video/rhythm.md | 130 | Rhythm and key frames · when cuts and transitions happen, shot lengths, the change curve, key frames of each shot
video/look.md | 164 | Camera, lighting and editing · for filmed shots: framing, camera, lighting, kit
video/packaging.md | 343 | Packaging · subtitles, styled text, stickers, picture-in-picture: timing and style
video/remake.md | 1274 | Remake plan · generation units, shoots, code builds, real material to collect, acting and emotion
video/shots/*.md | 697 | Per-shot detail, tokens per file on average · checking one shot: what is seen, the inference and its basis, prompts, frames
breakdown.json | 13919 | Full raw data · for programs; a model rarely needs it
shots/ | - | contact sheet, first and last frame of each shot · checking by eye
storyboard.jpg | - | storyboard of the whole video · the whole video at a glance
packaging/ | - | subtitle files, packaging timeline, sticker frames · remaking subtitles and packaging
```

## How to read

- One shot per line: `#<n> start-end (s) | key value | …`. A key ending in `~` is the tools' inference; keys without it are visible on screen or measured directly.
- `story` job in the story and the point · `seen` what is on screen · `act` acting (emotion, strength, face) · `camera` camera move · `overlay` overlays · `made~` how it was made (inferred) · `material~` where the material came from (inferred) · `remake` remake route · `flag` needs a second look
- Full detail for a shot is in `video/shots/<n>.md` (e.g. `video/shots/07.md`).
- What is “seen” can be checked against the frames; what is “inferred” is the tools' and image readers' judgement, with the basis in each shot file. When they disagree, trust the frames.
