import json, sys
p = sys.argv[1]
d = json.load(open(p))
d["by"] = "claude-agent"
common_ev = [
  "Painted 2D character with clean, stable silhouette lines; no texture boiling or limb morphing between frames",
  "Body parts move as rigid layers (forearm, upper arm, head, cape panels) - typical Spine/skeletal 2D rig, not frame-by-frame redraw",
  "Frame is a crop of a live-stream capture (slot game rendered in browser, then re-encoded by the stream/clip platform); photographic-looking noise comes from stream compression, not a camera",
]
anim = {"anim_2d": 0.85, "cg_3d": 0.1, "ai_video": 0.05}
perf_base = {"who": "A (game mascot thunder god)", "voice": "none (excerpt muted)", "movers": 1, "full_body": True, "backdrop": "painted stormy sky panel, static"}
shots = {
 "shot_001": dict(
   description="Idle pose: character floats centred in a tall narrow panel, arms hanging, slight bob; at 0.20 s a vertical lightning bolt strikes the figure from above and a white bloom flash fills the body by 0.40-0.66 s (pose swap hidden under the flash).",
   narrative={"role": "抓注意", "point": "lightning strike announces a multiplier event"},
   performance=dict(perf_base, emotion="calm then charged", intensity="low->high", face="stern, neutral", body="idle float, arms down; engulfed by strike flash", arc=["idle", "strike", "white flash"], key=True, move="idle float -> struck by lightning", en="Idle float, then a lightning bolt hits and a white flash covers the body")),
 "shot_002": dict(
   description="Power pose: out of the flash the character rises with the left arm (screen right) thrust straight up gripping a crackling lightning bolt, right arm (screen left) flung out to the side with open clawed hand, head tilted back looking up, beard and cape swinging; arm settles into a held overhead pose from ~1.3 s; electric arcs flicker along the bolt; at ~2.5 s a second vertical bolt strikes and a flash begins.",
   narrative={"role": "给结论", "point": "god channels the bolt to charge the multiplier"},
   performance=dict(perf_base, emotion="triumphant fury", intensity="high", face="mouth open, shouting upward", body="one arm overhead with bolt, other arm out, torso arched, legs trailing", arc=["emerge from flash", "arm thrust up", "hold with crackle", "second strike"], key=True, move="arm raise and hold, torso arch", en="Arm thrust overhead with bolt, other arm wide, head back, hold, second strike")),
 "shot_003": dict(
   description="Return: white flash dissolves back into the idle pose (arms down, facing camera) at ~2.7-3.0 s.",
   narrative={"role": "转折", "point": "back to idle, ready for next event"},
   performance=dict(perf_base, emotion="calm", intensity="low", face="neutral", body="arms down, float", arc=["flash", "idle"], key=False, move="flash back to idle", en="Flash fades back to the idle pose")),
}
for s in d["shots"]:
    v = shots[s["id"]]
    s["label_probs"] = anim
    s["image_source"] = "graphic"
    s["evidence"] = common_ev
    s["description"] = v["description"]
    s["narrative"] = v["narrative"]
    s["embedded_assets"] = [{"kind": "logo", "what": "game title logo at top of panel (cropped)", "is_real_material": False}]
    s["performance"] = v["performance"]
    s["replication"] = {
      "image_prompt": "Original stylized 2D game-art thunder-god caricature character (new design, not the reference mascot), full body, floating, stormy sky",
      "video_prompt": "Rigged 2D character performs: idle float -> lightning strike flash -> raises bolt overhead with other arm wide -> hold with crackle -> second strike flash -> idle",
      "video_prompt_en": "Rigged 2D character performs: idle float -> lightning strike flash -> raises bolt overhead with other arm wide -> hold with crackle -> second strike flash -> idle"}
    if "aspects" in s:
        s["aspects"] = {"framing": {"shot_size": "full body", "camera_angle": "eye level, slightly low", "composition": "centred vertical panel"},
                        "camera": {"camera_support": "locked-off (game UI)", "lens": "n/a (2D)", "speed": "real-time"},
                        "lighting": {"location": "painted sky", "key_light": "cool top light / lightning flashes", "light_quality": "stylized", "fill_light": "purple ambient", "rim_light": "cyan rim during strikes", "catchlight": "", "practicals": "lightning bolt", "color_temp": "cool", "lighting_setup": "stylized game art"},
                        "grade": {"color_grade": "saturated purple/gold"}}
d["aspects"] = {"camera": {"setups": "1 locked-off framing (crop of a slot-game side panel)", "gear_guess": "browser game captured by OBS stream"},
                "lighting": {"lighting_overall": "stylized painted lighting with additive lightning VFX and white bloom flashes"},
                "grade": {"grade_overall": "saturated purple sky, gold accents"},
                "editing": {"editing": "no edits: continuous in-game animation; the two detected 'cuts' are white VFX flashes that hide animation-state swaps (idle <-> power pose)"},
                "format": {"format": "game character animation (Spine-style 2D skeletal rig + particle VFX)"}}
d["story"] = {"summary": "A floating thunder-god mascot is struck by lightning, rises with a bolt held overhead, holds the pose while it crackles, is struck again and returns to idle.",
              "hook": "Vertical lightning strike and full-body white flash in the first 0.3 s",
              "highlights": ["Flash at 0.2-0.6 s masks the idle->power-pose swap so the change feels instantaneous", "Overhead arm thrust settles with overshoot ~1.0-1.4 s, then a long readable hold", "Second strike at ~2.5 s mirrors the first to bookend the loop"]}
d["cast"] = {"style": "high-detail painted 2D game art with skeletal animation and additive lightning VFX",
             "characters": [{"id": "A", "name": "thunder god mascot", "kind": "2D rigged game character", "look": "reference mascot (not reproduced in the remake; replaced by an original caricature design)", "role": "lead", "voice": "none", "shots": [1, 2, 3]}],
             "scenes": [{"id": "S1", "where": "tall side panel of a slot game", "when": "n/a", "look": "stormy purple sky with clouds", "shots": [1, 2, 3]}],
             "props": [{"name": "lightning bolt", "note": "held overhead in shot 2, crackles", "shots": [2]}]}
for t in d["packaging"]["text"]:
    t["kind"] = "logo"
json.dump(d, open(p, "w"), ensure_ascii=False, indent=1)
print("ok")
