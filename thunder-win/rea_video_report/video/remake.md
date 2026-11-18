---
videomd: 1
part: remake
tokens: 753
---

## Remake plan

### Step by step

This is a short AI clip (pets / spectacle / single scene). Do the steps in this order; the detail for each is in the matching subsection below.

1. **Write the content**: write yours in the same 1 steps as the original (narrative line under “Content and structure”)
2. **AI shots**: 1 shots (2 s) to make with a video model. Pick the model first: tell the agent which one and it plans the stretches, inputs and prompts for it (`rea-video plan <folder> --model <model>`)
3. **Edit**: follow the order and lengths in the shot list; the original is a single 2 s take
4. **Subtitles and styled text**: timing and style under “Packaging layer”
5. **Put it together and compare**: hand the shots you made to the agent; `rea-video remake` places them on the original timeline, keeps the original where yours are missing, and renders a side-by-side comparison with the original

**1 AI video shot → 1 generation unit, 1 Seedance 2.0 call**

### Generation units

- Grouping: consecutive shots share a call where they fit, ≤15s per call; a long stretch is cut at a scene change first
- Inputs: the source stretch, subtitles erased, is the reference video; the model follows its shots, camera and pacing
- Audio: the model can generate action sound effects and ambience along with the picture
- Packaging: the title, text label, counter, styled text on the generated shots is post-production packaging: keep it out of the prompts (erased from source references) and lay it back on from the packaging timeline after generation

| Unit | Shots | Time | Length | Feed | Prompt |
|---|---|---|---|---|---|
| G1 | #1 | 0.0–2.5s | 2.5s | reference video | draft |

**G1 · shots #1 · 2.5s · remix of the source**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | final version in this model's format (remake/prompts.json) |
| reference video | yes | `@视频1` source 0.0–2.5s (subtitles and stickers erased) | the model copies its cuts, camera and action and makes the stretch in one go |

Draft prompt (generic; rewrite it in Seedance 2.0's format into remake/prompts.json before generating):

```text
@视频1 is the source: follow its shots (count, length, size, camera, movement, action and cutting rhythm) and change only what is written below. 1568:1000; coloured ambient light (RGB lights / neon), hard light (sharp shadow edge), warm (about 3000–4000K), background slightly soft. No subtitles, captions or watermarks in the picture.
Win celebration over a dimmed slot board: coins fly in (0.2-0.45 s); a plaque rises from the bottom (0.47-0.53 s); a vertical lightning bolt strikes it from the top with a flash (0.53-0.63 s); the win amount counts up inside the plaque while the background floods with red light (0.63-0.93 s); a large title slams in from oversized to final scale (0.97-1.1 s); hold with crawling electric arcs (1.1-1.5 s); the whole group drops out downward (1.53-1.73 s) and the board returns.
```
