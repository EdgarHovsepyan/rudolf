"""side_by_side_comparison.mp4: reference | motion-transfer pass | HyperFrames reconstruction | pose overlay (same pose model on both)."""
import json, glob, os, subprocess, cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont
B = os.environ.get('ZT_WORK', os.getcwd())
src = json.load(open(f'{B}/analysis/mp_pose_src.json'))['frames']; ren = json.load(open(f'{B}/analysis/mp_pose_render.json'))['frames']
mot = json.load(open(f'{B}/analysis/motion_src.json')); bad = set(mot['flash_frames'])
glitch = set(json.load(open(f'{B}/analysis/comparison_metrics_clean.json'))['glitch_frames'])
ser = json.load(open(f'{B}/analysis/comparison_metrics_all.json'))['series']
PW, PH, HEAD, FOOT = 360, 900, 64, 92
W, H = PW * 4 + 5 * 6, PH + HEAD + FOOT
F = lambda s, b=False: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans' + ('-Bold' if b else '') + '.ttf', s)
def phase(f):
    if f < 15: return 'idle float'
    if f <= 19: return 'strike 1 (vertical bolt)'
    if f <= 25: return 'bloom 1 - pose swap hidden'
    if f <= 45: return 'raise: bent elbow -> full extension'
    if f <= 75: return 'hold overhead, bolt crackles'
    if f <= 80: return 'strike 2'
    if f <= 84: return 'bloom 2 - return hidden'
    return 'idle float'
E = [('l_shoulder','r_shoulder'),('l_shoulder','l_elbow'),('l_elbow','l_wrist'),('r_shoulder','r_elbow'),('r_elbow','r_wrist'),
     ('l_shoulder','l_hip'),('r_shoulder','r_hip'),('l_hip','r_hip'),('l_hip','l_knee'),('r_hip','r_knee'),('l_knee','l_ankle'),('r_knee','r_ankle')]
def skel(img, kp, col, w, sx, sy):
    if not kp: return
    for a, b in E:
        if a in kp and b in kp:
            cv2.line(img, (int(kp[a][0]*sx), int(kp[a][1]*sy)), (int(kp[b][0]*sx), int(kp[b][1]*sy)), col, w, cv2.LINE_AA)
    if 'nose' in kp and 'l_shoulder' in kp:
        n = kp['nose']; s = ((kp['l_shoulder'][0]+kp['r_shoulder'][0])/2, (kp['l_shoulder'][1]+kp['r_shoulder'][1])/2)
        cv2.line(img, (int(s[0]*sx), int(s[1]*sy)), (int(n[0]*sx), int(n[1]*sy)), col, w, cv2.LINE_AA)
        cv2.circle(img, (int(n[0]*sx), int(n[1]*sy)), w + 3, col, -1, cv2.LINE_AA)
os.makedirs(f'{B}/renders/sbs', exist_ok=True)
for f in range(90):
    ref = cv2.resize(cv2.imread(f'{B}/analysis/frames_2x/f{f+1:03d}.png'), (PW, PH), interpolation=cv2.INTER_AREA)
    mt = cv2.resize(cv2.imread(f'{B}/renders/char/f{f+1:03d}.png'), (PW, PH), interpolation=cv2.INTER_AREA)
    hf = cv2.resize(cv2.imread(f'{B}/renders/hf_frames/f{f+1:03d}.png'), (PW, PH), interpolation=cv2.INTER_AREA)
    ov = np.full((PH, PW, 3), (34, 26, 22), np.uint8)
    for y in range(0, PH, 75): cv2.line(ov, (0, y), (PW, y), (48, 40, 36), 1)
    sx, sy = PW / 480, PH / 1200
    skel(ov, src[f]['kp'], (235, 235, 235), 7, sx, sy)
    skel(ov, ren[f]['kp'], (255, 170, 60), 3, sx, sy)
    canvas = Image.new('RGB', (W, H), (12, 14, 20)); d = ImageDraw.Draw(canvas)
    labels = ['Reference excerpt', 'Motion transfer (rig)', 'HyperFrames rebuild', 'Pose overlay']
    subs = ['source, 2.5x crop', 'retargeted, no VFX', 'full composition', 'white = source, blue = render']
    for k, im in enumerate([ref, mt, hf, ov]):
        x = 6 + k * (PW + 6)
        canvas.paste(Image.fromarray(cv2.cvtColor(im, cv2.COLOR_BGR2RGB)), (x, HEAD))
        d.text((x + 4, 8), labels[k], font=F(21, True), fill=(240, 240, 240))
        d.text((x + 4, 36), subs[k], font=F(15), fill=(160, 170, 190))
    if f in bad:
        x = 6 + 3 * (PW + 6); d.rectangle([x, HEAD + PH - 36, x + PW, HEAD + PH], fill=(90, 60, 10))
        d.text((x + 8, HEAD + PH - 30), 'source pose hidden by VFX (excluded)', font=F(15, True), fill=(255, 220, 140))
    elif f in glitch:
        x = 6 + 3 * (PW + 6); d.rectangle([x, HEAD + PH - 36, x + PW, HEAD + PH], fill=(70, 30, 30))
        d.text((x + 8, HEAD + PH - 30), 'source detector glitch frame', font=F(15, True), fill=(255, 180, 180))
    y0 = HEAD + PH + 8
    d.text((10, y0), f'frame {f+1:02d}/90   t = {f/30:0.3f} s   (source frames {297+f} @30fps)', font=F(19, True), fill=(240, 240, 240))
    d.text((10, y0 + 30), f'phase: {phase(f)}', font=F(18), fill=(255, 210, 120))
    errs = []
    for k in ['L upper arm', 'L forearm', 'R upper arm', 'R forearm']:
        a, b = ser[k]['source'][f], ser[k]['render'][f]
        errs.append(f"{k} {abs((b - a + 180) % 360 - 180):5.1f}deg" if f not in bad else f"{k}   n/a")
    d.text((10, y0 + 58), 'angle error (same pose model on both):  ' + '   '.join(errs), font=F(15), fill=(170, 200, 255))
    # timeline bar
    bx0, bx1, by = 760, W - 14, y0 + 12
    d.rectangle([bx0, by, bx1, by + 14], fill=(40, 44, 56))
    for i in bad: d.rectangle([bx0 + (bx1 - bx0) * i / 90, by, bx0 + (bx1 - bx0) * (i + 1) / 90, by + 14], fill=(110, 80, 20))
    d.rectangle([bx0 + (bx1 - bx0) * f / 90, by - 4, bx0 + (bx1 - bx0) * (f + 1) / 90, by + 18], fill=(255, 255, 255))
    canvas.save(f'{B}/renders/sbs/f{f+1:03d}.png')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', f'{B}/renders/sbs/f%03d.png', '-c:v', 'libx264', '-crf', '17', '-preset', 'slow',
                '-pix_fmt', 'yuv420p', '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2', f'{B}/deliver/side_by_side_comparison.mp4'], check=True)
print('ok', W, H)
