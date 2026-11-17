---
videomd: 1
part: remake
tokens: 1262
---

## Remake plan

### Step by step

This is a 3D / animation. Do the steps in this order; the detail for each is in the matching subsection below.

1. **Write the content**: write yours in the same 3 steps as the original (narrative line under “Content and structure”)
2. **Collect material**: one reference image per character, the same one in every shot: thunder god mascot
3. **AI shots**: 3 shots (3 s) to make with a video model. Pick the model first: tell the agent which one and it plans the stretches, inputs and prompts for it (`rea-video plan <folder> --model <model>`)
4. **Edit**: follow the order and lengths in the shot list; the original has 3 shots at 1.0s each
5. **Subtitles and styled text**: timing and style under “Packaging layer”
6. **Put it together and compare**: hand the shots you made to the agent; `rea-video remake` places them on the original timeline, keeps the original where yours are missing, and renders a side-by-side comparison with the original

**3 2D animation shots → 1 generation unit, 1 Seedance 2.0 call**

### Generation units

- Grouping: consecutive shots share a call where they fit, ≤15s per call; a long stretch is cut at a scene change first
- Inputs: the source stretch, subtitles erased, is the reference video; the model follows its shots, camera and pacing
- Audio: the model can generate action sound effects and ambience along with the picture
- Packaging: the text label, title on the generated shots is post-production packaging: keep it out of the prompts (erased from source references) and lay it back on from the packaging timeline after generation

| Unit | Shots | Time | Length | Feed | Prompt |
|---|---|---|---|---|---|
| G1 | #1–#3 | 0.0–3.0s | 3.0s | reference video | draft |

**G1 · shots #1–#3 · 3.0s · remix of the source**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | final version in this model's format (remake/prompts.json) |
| reference video | yes | `@视频1` source 0.0–3.0s (subtitles and stickers erased) | the model copies its cuts, camera and action and makes the stretch in one go |
- Acting #1 (key): calm then charged · stern, neutral (voice first, then drive, see “Acting and emotion”)
- Acting #2 (key): triumphant fury (strong) · mouth open, shouting upward (voice first, then drive, see “Acting and emotion”)
- Acting #3: calm (light) · neutral (voice first, then drive, see “Acting and emotion”)

Draft prompt (generic; rewrite it in Seedance 2.0's format into remake/prompts.json before generating):

```text
@视频1 is the source: follow its shots (count, length, size, camera, movement, action and cutting rhythm) and change only what is written below. 480:1200. No subtitles, captions or watermarks in the picture.
Shot 1: Rigged 2D character performs: idle float -> lightning strike flash -> raises bolt overhead with other arm wide -> hold with crackle -> second strike flash -> idle. Acting: Idle float, then a lightning bolt hits and a white flash covers the body
Shot 2: Rigged 2D character performs: idle float -> lightning strike flash -> raises bolt overhead with other arm wide -> hold with crackle -> second strike flash -> idle. Acting (openly expressed, features stay natural): Arm thrust overhead with bolt, other arm wide, head back, hold, second strike
Shot 3: Rigged 2D character performs: idle float -> lightning strike flash -> raises bolt overhead with other arm wide -> hold with crackle -> second strike flash -> idle. Acting (very subtle, barely visible): Flash fades back to the idle pose
```

### Acting and emotion

In a prompt, describe the visible expression and movement rather than words like “happy” or “sad”, and keep it smaller rather than bigger (strong emotion words tend to give mask faces and forced smiles); get the expression right in the first frame; for shots with lines, make the voice with its delivery first and let the picture act to it. For generated shots the Face and Movement below are already in the generation-unit prompts.

| Shot | Who | Emotion (strength) | Face | Movement / change | Delivery | How to get it |
|---|---|---|---|---|---|---|
| #1 | A (game mascot thunder god) | calm then charged ★key | stern, neutral | idle float, arms down; engulfed by strike flash | none (excerpt muted) | voice first, then drive |
| #2 | A (game mascot thunder god) | triumphant fury (strong) ★key | mouth open, shouting upward | one arm overhead with bolt, other arm out, torso arched, legs trailing | none (excerpt muted) | voice first, then drive |
| #3 | A (game mascot thunder god) | calm (light) | neutral | arms down, float | none (excerpt muted) | voice first, then drive |

- **voice first, then drive**: Speaking: make the voice with its delivery first (TTS with tone tags only where the emotion turns, or a real recording), then drive mouth and face from that audio (Kling Avatar, OmniHuman); with a video model that makes sound itself, put the line and its delivery in the prompt together
