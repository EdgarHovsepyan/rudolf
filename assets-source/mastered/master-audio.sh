#!/usr/bin/env bash
# Mastering chain for Rudolf Ovsepyan live recordings (contest.mp3 / contest2.mp3)
# usage: bash master-audio.sh <in.mp3> <outdir> <basename>
# Produces three variants, each -14 LUFS integrated / <= -1 dBTP, 48 kHz, MP3 256k:
#   <base>-master-stereo.mp3   (A) denoise + HPF + EQ + exciter + glue + synthetic stereo stage   <- recommended
#   <base>-master.mp3          (B) same as A without the stereo stage (stays dual-mono)
#   <base>-loudness-only.mp3   (C) no tonal processing; pure gain + limiter + fades (reference)
# Requires full ffmpeg 8.x (Gyan build) and ir_hall.wav (synthetic decorrelated hall IR) next to this script.
set -euo pipefail
IN="$1"; OUTDIR="$2"; BASE="$3"
HERE="$(cd "$(dirname "$0")" && pwd)"
FF="${FFMPEG_BIN:-$LOCALAPPDATA/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.1-full_build/bin}"
FFMPEG="$FF/ffmpeg.exe"; FFPROBE="$FF/ffprobe.exe"
IR="$HERE/ir_hall.wav"
TARGET_I=-14.0          # LUFS integrated (streaming / web standard)
LIMIT=0.84              # sample-peak ceiling 0.84 = -1.51 dBFS -> true peak lands at about -1.0 dBTP after mp3
FADE_IN=0.6; FADE_OUT=2.5
mkdir -p "$OUTDIR"

# Synthetic stereo "hall" impulse response for the stereo stage (the source is dual-mono):
# two independently seeded white-noise bursts with exp(-7.5 t) decay (RT60 ~0.9 s), band-limited 250-5500 Hz,
# 18 ms pre-delay. Measured L/R correlation ~0.01 (fully decorrelated), mono-compatible (sums to the same decay).
if [ ! -f "$IR" ]; then
  "$FFMPEG" -v error -y -f lavfi -i "anoisesrc=color=white:seed=11:r=48000:d=1.1:a=0.5" -f lavfi -i "anoisesrc=color=white:seed=23:r=48000:d=1.1:a=0.5" \
    -filter_complex "[0:a][1:a]join=inputs=2:channel_layout=stereo,aeval=exprs='val(0)*exp(-t*7.5)|val(1)*exp(-t*7.5)',highpass=f=250:poles=2,lowpass=f=5500:poles=2,adelay=18|18,aformat=sample_fmts=fltp" \
    -c:a pcm_f32le "$IR"
fi

# Stage 1 (tone): what "master" means here. All values conservative: a live hall recording of a baritone.
TONE="highpass=f=40:poles=2"                                   # rumble / handling noise
TONE="$TONE,afftdn=nr=7:nf=-48:tn=1:nt=w"                      # gentle broadband denoise (room hiss), tracks noise floor
TONE="$TONE,equalizer=f=260:t=q:w=1.0:g=-2.0"                  # de-mud: hall/low-mid build-up
TONE="$TONE,equalizer=f=3000:t=q:w=1.2:g=2.0"                  # presence: baritone singer's formant -> clean, forward voice
TONE="$TONE,highshelf=f=9000:g=2.5"                            # air (source rolls off above ~5 kHz)
TONE="$TONE,aexciter=amount=1.2:drive=6:freq=5500:ceil=15000"  # harmonic exciter: synthesises the sparkle the 15.5 kHz band-limit lost
TONE="$TONE,acompressor=threshold=-26dB:ratio=1.5:attack=30:release=400:knee=8:detection=rms"  # glue only, keeps classical dynamics

render() { # $1=variant $2=filter_complex-or-af  $3=outfile  ($4=extra inputs)
  local name="$1" graph="$2" out="$3"
  local pre="$OUTDIR/.pre-$name.wav"
  # pass 1: tone chain -> float wav
  if [ "$name" = "stereo" ]; then
    "$FFMPEG" -v error -y -i "$IN" -i "$IR" -filter_complex "$graph" -c:a pcm_f32le "$pre"
  else
    "$FFMPEG" -v error -y -i "$IN" -af "$graph" -c:a pcm_f32le "$pre"
  fi
  # measure integrated loudness of the tone-processed signal
  local I
  I=$("$FFMPEG" -hide_banner -nostats -i "$pre" -af "ebur128=framelog=quiet" -f null - 2>&1 | awk '/I:/{print $2}' | tail -1)
  local gain
  gain=$(awk -v t="$TARGET_I" -v i="$I" 'BEGIN{printf "%.2f", t - i}')
  local dur
  dur=$("$FFPROBE" -v error -show_entries format=duration -of csv=p=0 "$pre")
  local fo_st
  fo_st=$(awk -v d="$dur" -v f="$FADE_OUT" 'BEGIN{printf "%.3f", d - f}')
  # pass 2: gain -> brick-wall limiter -> loop-safe fades -> mp3 256k
  "$FFMPEG" -v error -y -i "$pre" \
    -af "volume=${gain}dB,alimiter=limit=${LIMIT}:attack=3:release=80:asc=1:level=false,afade=t=in:st=0:d=${FADE_IN},afade=t=out:st=${fo_st}:d=${FADE_OUT},aformat=sample_fmts=s32:sample_rates=48000" \
    -c:a libmp3lame -b:a 256k -ar 48000 -id3v2_version 3 \
    -metadata title="Рудольф Овсепян — запись выступления" -metadata artist="Рудольф Овсепян" -metadata comment="master ${name}: ${gain} dB gain to -14 LUFS" \
    "$out"
  rm -f "$pre"
  echo "[$name] pre-I=${I} LUFS, gain=${gain} dB -> $out"
}

GRAPH_B="aformat=sample_fmts=fltp:sample_rates=48000,$TONE"
# A: same tone chain, then split; wet = convolution with decorrelated hall IR.
#    afir has NO pass-through path (dry scales the input, wet the output) -> dry=1:wet=1; irnorm=2 ("gain to noise") puts the
#    wet ~3 dB under the dry for noise-like material; weight 0.25 then lands the side channel ~16 dB under mid (measured).
GRAPH_A="[0:a]aformat=sample_fmts=fltp:sample_rates=48000,$TONE,asplit=2[dry][send];[1:a]aformat=sample_fmts=fltp:channel_layouts=stereo[ir];[send][ir]afir=dry=1:wet=1:irnorm=2[wet];[dry][wet]amix=inputs=2:weights='1 0.25':normalize=0"
GRAPH_C="aformat=sample_fmts=fltp:sample_rates=48000"

render stereo "$GRAPH_A" "$OUTDIR/$BASE-master-stereo.mp3"
render mono   "$GRAPH_B" "$OUTDIR/$BASE-master.mp3"
render flat   "$GRAPH_C" "$OUTDIR/$BASE-loudness-only.mp3"
