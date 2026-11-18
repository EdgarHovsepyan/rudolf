# Thunder-god motion reconstruction

| What | |
|---|---|
| `thunder_hero.mp4` | The animation: the owner's tech-art sheet animated on the reference beats, rendered with HyperFrames (720×1280, 30 fps, 90 frames, 3.0 s) |
| `thunder_hero_vs_reference.mp4` | Side by side with the reference, frame counter burned in |
| `original_excerpt.mp4` | Source excerpt: 3 s of the game character's lightning move (third-party footage, reference only) |
| `rea_video_report/` | REA-Video breakdown of the excerpt (`VIDEO.md`, `report.html`) |
| `sprite_project/` | Everything that builds `thunder_hero.mp4` from the sheet |
| `source_project/` | Motion analysis of the reference: tracked skeleton, strike and flash timing |

## How `thunder_hero.mp4` is made

1. `sprite_project/sheet/sheet.png`: the owner's sheet (idle 8, raise & charge 10, cast 12, recovery 8, effect assets 8).
2. `tools/sheet_extract.py` finds every frame on the green bands. `tools/sheet_frames.py` crops each one, upscales it ×4 with Real-ESRGAN (ONNX, CPU) and keys out the green with despill.
3. `tools/sheet_align.py` removes fragments of neighbouring frames and finds hips and shoulders with MediaPipe. `tools/sprite_timeline.py` scales each row and pins the hips, so the figure does not jump between drawings.
4. `tools/sprite_colormatch.py` evens out colour between drawings, which removes flicker on frame changes.
5. The drawings sit on the reference beats:

   | Frames | What happens |
   |---|---|
   | 0–14 | idle |
   | 15–19 | sky strike |
   | 20–25 | white flash, the pose change is hidden under it |
   | 26–45 | arm raise and orb charge |
   | 46–75 | hold, the orb pulses |
   | 76–84 | lightning cast and second flash |
   | 85–89 | back to idle |

6. `tools/storm_bg.py` renders the storm-sky background. `hyperframes/index.html` composites the background, the hero, the sheet's own effect assets (bolt, orb, ring, flare, gold swirl) and sparks, seeked through `hf-seek`.

The source frames are about 130×150 px, which limits detail. With a higher-resolution sheet, swap `sheet/sheet.png` and rerun the same steps.
