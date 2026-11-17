"""Run MediaPipe PoseLandmarker (VIDEO mode) over a frame folder; write per-frame keypoints in frame pixel coords."""
import sys, glob, json, cv2, numpy as np, mediapipe as mp
from mediapipe.tasks import python as mpt
from mediapipe.tasks.python import vision
frames_dir, model, out_json = sys.argv[1], sys.argv[2], sys.argv[3]
pad = int(sys.argv[4]) if len(sys.argv) > 4 else 200
opts = vision.PoseLandmarkerOptions(base_options=mpt.BaseOptions(model_asset_path=model),
    running_mode=vision.RunningMode.VIDEO, num_poses=1,
    min_pose_detection_confidence=0.2, min_pose_presence_confidence=0.2, min_tracking_confidence=0.2)
lm = vision.PoseLandmarker.create_from_options(opts)
NAMES = {0:'nose',2:'l_eye',5:'r_eye',7:'l_ear',8:'r_ear',11:'l_shoulder',12:'r_shoulder',13:'l_elbow',14:'r_elbow',
         15:'l_wrist',16:'r_wrist',19:'l_index',20:'r_index',23:'l_hip',24:'r_hip',25:'l_knee',26:'r_knee',27:'l_ankle',28:'r_ankle'}
res = []
files = sorted(glob.glob(frames_dir + '/*.png'))
for i, f in enumerate(files):
    img = cv2.imread(f); h, w = img.shape[:2]
    big = cv2.copyMakeBorder(img, pad//2, pad//2, pad, pad, cv2.BORDER_REPLICATE)
    H, W = big.shape[:2]
    rgb = cv2.cvtColor(big, cv2.COLOR_BGR2RGB)
    r = lm.detect_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb), int(i * 1000 / 30))
    kp = {}
    if r.pose_landmarks:
        for idx, name in NAMES.items():
            p = r.pose_landmarks[0][idx]
            kp[name] = [p.x * W - pad, p.y * H - pad//2, float(p.visibility)]
    res.append({'frame': i, 'kp': kp})
json.dump({'w': w, 'h': h, 'frames': res}, open(out_json, 'w'))
print('detected', sum(1 for r in res if r['kp']), 'of', len(res))
