#!/usr/bin/env bash
# Rebuilds every deliverable from the public source clip. Run from source_project/:  bash reproduce.sh [workdir]
# Needs: ffmpeg, python3 (numpy, opencv-python-headless, mediapipe>=1.2, matplotlib, pillow), node 22 + playwright,
#        rea-video CLI (pip install -e <rea-video clone>), libegl1/libgles2 for MediaPipe.
set -euo pipefail
SP="$(cd "$(dirname "$0")" && pwd)"
WORK="$(mkdir -p "${1:-$SP/work}" && cd "${1:-$SP/work}" && pwd)"
export ZT_WORK="$WORK"
cd "$WORK"
mkdir -p src_dl analysis/frames_native analysis/frames_2x deliver models renders project/hyperframes/assets
cp "$SP"/project/{rig.js,scene.js,scene.html,render_frames.js,build_hyperframes.py} project/
ln -sfn "$SP/tools" tools

echo "== 1. source clip (public ClipRally clip-video endpoint) =="
[ -s src_dl/clip.mp4 ] || curl -sSL -o src_dl/clip.mp4 "https://api.cliprally.com/api/public/clip-video/ee6d84ef-dbcb-43c1-9f50-c9f41edcb04b.mp4"
python3 tools/motion_energy.py src_dl/clip.mp4 analysis/motion_energy.json | sed -n "1,8p"

echo "== 2. excerpt: source frames 297-386 (9.90-12.90 s), character panel only, no face cam / chat / audio =="
SEL="select='between(n\,297\,386)',setpts=N/30/TB,crop=192:480:1604:180"
ffmpeg -v error -y -i src_dl/clip.mp4 -vf "$SEL,scale=480:1200:flags=lanczos" -r 30 -an -c:v libx264 -crf 14 -preset slow -pix_fmt yuv420p deliver/original_excerpt.mp4
ffmpeg -v error -y -i src_dl/clip.mp4 -vf "$SEL" -r 30 analysis/frames_native/f%03d.png
ffmpeg -v error -y -i deliver/original_excerpt.mp4 analysis/frames_2x/f%03d.png

echo "== 3. REA-Video (survey -> decompose -> agent review -> apply-review); answers recorded in rea_video_answers/ =="
R=rea_out/excerpt
rea-video survey deliver/original_excerpt.mp4 -o $R >/dev/null
cp "$SP/rea_video_answers/overview.answer.json" $R/survey/overview.answer.json
rea-video survey deliver/original_excerpt.mp4 -o $R >/dev/null
cp "$SP/rea_video_answers/shot_002.answer.json" $R/survey/detail/shot_002.answer.json
rea-video survey deliver/original_excerpt.mp4 -o $R | grep -E '"status"'
rea-video decompose deliver/original_excerpt.mp4 -o $R --lang en | tail -3
rea-video review $R | sed -n "1,1p"
python3 "$SP/rea_video_answers/fill_review.py" $R/review_answers.json
rea-video apply-review $R --by claude-agent --lang en | sed -n "1,2p"

echo "== 4. pose + VFX/secondary timing on the source =="
[ -s models/pose_landmarker_heavy.task ] || curl -sSL -o models/pose_landmarker_heavy.task https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task
python3 tools/mp_pose.py analysis/frames_2x models/pose_landmarker_heavy.task analysis/mp_pose_src.json 300 2>/dev/null | grep detected || true
python3 tools/vfx_timing.py analysis/frames_2x analysis/flash_ratio.json analysis/vfx_timing.json
python3 tools/clean_motion.py analysis/mp_pose_src.json analysis/flash_ratio.json analysis/motion_src.json | sed -n "1,2p"
python3 tools/secondary_motion.py analysis/frames_2x analysis/motion_src.json analysis/secondary_src.json >/dev/null
python3 tools/build_motion.py analysis/motion_src.json analysis/secondary_src.json analysis/mp_pose_src.json project/motion.js

echo "== 5. rig renders (motion-transfer pass, full pass, skeleton pass) =="
(cd project && node render_frames.js ../renders/char char 0 all ../analysis/rig_joints.json && node render_frames.js ../renders/full full 0 all && node render_frames.js ../renders/char_skel char 1 all)
ffmpeg -v error -y -framerate 30 -i renders/char/f%03d.png -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p -r 30 deliver/trump_motion_transfer.mp4

echo "== 6. HyperFrames composition: lint, check, render =="
(cd project && python3 build_hyperframes.py)
[ -d hf/node_modules/hyperframes ] || (mkdir -p hf && cd hf && npm init -y >/dev/null && npm install --silent hyperframes@0.9.64)
export HYPERFRAMES_NO_TELEMETRY=1
HS=$(ls -d /root/.cache/hyperframes/chrome/chrome-headless-shell/*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | head -1 || true)
[ -n "$HS" ] || (cd hf && env -u PUPPETEER_EXECUTABLE_PATH npx hyperframes browser ensure --force)
HS=$(ls -d /root/.cache/hyperframes/chrome/chrome-headless-shell/*/chrome-headless-shell-linux64/chrome-headless-shell | head -1)
(cd hf && npx hyperframes lint ../project/hyperframes | tail -1 && npx hyperframes check ../project/hyperframes | tail -3 && \
  HYPERFRAMES_BROWSER_PATH=$HS npx hyperframes render ../project/hyperframes -o ../deliver/hyperframes_reconstruction.mp4 --fps 30 --quality looks 2>../analysis/hf_render.log | grep -E "rendered in")

echo "== 7. frame-by-frame comparison =="
mkdir -p renders/hf_frames renders/char_480
ffmpeg -v error -y -i deliver/hyperframes_reconstruction.mp4 renders/hf_frames/f%03d.png
ffmpeg -v error -y -framerate 30 -i renders/char/f%03d.png -vf scale=480:1200:flags=lanczos renders/char_480/f%03d.png
python3 tools/mp_pose.py renders/char_480 models/pose_landmarker_heavy.task analysis/mp_pose_render.json 300 2>/dev/null | grep detected || true
python3 tools/compare.py all >/dev/null && python3 tools/compare.py clean >/dev/null
python3 tools/curves.py
python3 tools/side_by_side.py
for v in original_excerpt trump_motion_transfer hyperframes_reconstruction side_by_side_comparison; do
  printf '%-28s ' $v; ffprobe -v error -count_frames -show_entries stream=width,height,r_frame_rate,nb_read_frames -of csv=p=0 deliver/$v.mp4
done
echo "done -> $WORK/deliver"
