# Thunder Win: 4K slot celebration

An original big-win celebration for a thunder-god slot, made for dropping straight into a game. The beat timing comes from a reference celebration, broken down with REA-Video. The design is new: gold medallion with a storm-glass core and a lightning emblem, "THUNDER WIN!" title, coin fountain, lightning strike, shockwave, crawling arcs. It is built in HyperFrames as vectors, so 4K is native, not upscaled.

| File | What |
|---|---|
| `thunder_win_4k.mp4` | On a storm-sky backdrop. H.264, 3840×2160, 30 fps, 75 frames, 2.5 s |
| `thunder_win_alpha_4k.webm` | Transparent background for overlaying the game board. VP9 with alpha, 3840×2160. Fully transparent at the start and end; in the middle the board is dimmed |
| `thunder_win_vs_reference.mp4` | Side by side with the reference celebration (third-party footage, timing check only) |
| `rea_video_report/` | REA-Video breakdown of the reference (`VIDEO.md`, `report.html`) |
| `project/` | `template.html` and the two HyperFrames projects (`project_board`, `project_alpha`) |

## Beats (frames at 30 fps, matched to the reference)

| Frames | What happens |
|---|---|
| 4–14 | board dims |
| 13–19 | medallion rises from below with overshoot |
| 15–20 | lightning strike, flash, shockwave, spark burst |
| 19–28 | amount counts up to 46.35 |
| 29–33 | title slams in from 2.6× with motion blur, light camera shake |
| 34–45 | hold: arcs crawl over the ring and title, shine sweeps the title, coins fly out from behind the medallion |
| 46–53 | the group drops out |
| 50–60 | dim fades out |

## Render

```bash
npx hyperframes render project/project_board -o thunder_win_4k.mp4 --fps 30 --quality delivery --resolution landscape-4k
npx hyperframes render project/project_alpha -o thunder_win_alpha_4k.webm --format webm --fps 30 --quality delivery --resolution landscape-4k
```

To change the amount, edit `46.35` in `renderAt`. To change the title, edit the three `THUNDER WIN!` strings in `template.html` and rebuild the two projects from it.
