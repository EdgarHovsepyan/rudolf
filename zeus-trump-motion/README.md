# Thunder-god motion reconstruction

Work in progress. The final shot will be an AI render in a big-budget 3D animated-film look. Nothing here is the final art yet.

| What | |
|---|---|
| `original_excerpt.mp4` | Source excerpt: 3 s of the game character's lightning move (third-party footage, reference only) |
| `rea_video_report/` | REA-Video breakdown of the excerpt (`VIDEO.md`, `report.html`) |
| `source_project/` | Motion analysis: tracked skeleton, timing of strikes and flashes, and the rig that turns them into a motion-reference video for the AI render |

The earlier flat-vector renders were removed at the owner's request. The rig in `source_project/` is kept only as an invisible motion source: the AI model takes the pose from it and draws the character from scratch.
