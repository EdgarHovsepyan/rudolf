---
videomd: 1
part: timeline
shots: 3
tokens: 422
---

# Timeline

One shot per line: `#<n> start-end (s) | key value | …`. A key ending in `~` is the tools' inference; keys without it are visible on screen or measured directly.
`story` job in the story and the point · `seen` what is on screen · `act` acting (emotion, strength, face) · `camera` camera move · `overlay` overlays · `made~` how it was made (inferred) · `material~` where the material came from (inferred) · `remake` remake route · `flag` needs a second look
Full detail for a shot is in `video/shots/<n>.md` (e.g. `video/shots/07.md`).

```videomd-timeline
#01 0.0-0.7 | story grab attention, lightning strike announces a mul… | seen Idle pose: character floats centred in a tall narrow panel, … | act calm then charged · stern, neutral | camera smooth move | made~ 2D animation 70% · runner-up 3D render 17% | material~ to confirm | remake AI generation (2D animation) ·… | flag to confirm
#02 0.7-2.6 | story deliver the conclusion, god channels the bolt to… | seen Power pose: out of the flash the character rises with the le… | act triumphant fury (strong) · mouth open, s… | camera static (subject moves) | overlay title, graphic | made~ 2D animation 70% · runner-up 3D render 16% | material~ to confirm | remake AI generation (2D animation) ·… | flag to confirm
#03 2.6-3.0 | story turn, back to idle, ready for next event | seen Return: white flash dissolves back into the idle pose (arms … | act calm (light) · neutral | camera static (subject moves) | overlay title, graphic | made~ 2D animation 70% · runner-up 3D render 17% | material~ to confirm | remake AI generation (2D animation) ·… | flag to confirm
```
