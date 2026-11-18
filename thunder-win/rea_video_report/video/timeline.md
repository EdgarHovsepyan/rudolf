---
videomd: 1
part: timeline
shots: 1
tokens: 232
---

# Timeline

One shot per line: `#<n> start-end (s) | key value | …`. A key ending in `~` is the tools' inference; keys without it are visible on screen or measured directly.
`story` job in the story and the point · `seen` what is on screen · `act` acting (emotion, strength, face) · `camera` camera move · `overlay` overlays · `made~` how it was made (inferred) · `material~` where the material came from (inferred) · `remake` remake route · `flag` needs a second look
Full detail for a shot is in `video/shots/<n>.md` (e.g. `video/shots/07.md`).

```videomd-timeline
#01 0.0-2.5 | story deliver the conclusion, announce a big win | seen Win celebration over a dimmed slot board: coins fly in (0.2-… | camera static (subject moves) | overlay subtitle, styled text | made~ AI-generated video 48% · runner-up live action 40% | material~ AI-generated | remake AI generation · G1 | flag low confidence
```
