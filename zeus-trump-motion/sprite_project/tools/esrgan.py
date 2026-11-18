"""Real-ESRGAN general x4v3 (ONNX, CPU) with overlapping 128px tiles."""
import sys, glob, numpy as np, onnxruntime as ort, cv2
MODEL = glob.glob('/tmp/claude-0/-home-user-rudolf/72604a1f-a30f-524d-a35b-759994d6c323/scratchpad/models/esrgan_zip/x/**/*.onnx', recursive=True)[0]
_s = None
def upscale(bgr, tile=128, pad=12):
    global _s
    if _s is None:
        so = ort.SessionOptions(); so.intra_op_num_threads = 4
        _s = ort.InferenceSession(MODEL, so, providers=['CPUExecutionProvider'])
    h, w = bgr.shape[:2]
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
    P = np.pad(rgb, ((pad, pad + tile), (pad, pad + tile), (0, 0)), mode='reflect')
    out = np.zeros(((h + tile) * 4, (w + tile) * 4, 3), np.float32)
    step = tile - 2 * pad
    for y in range(0, h, step):
        for x in range(0, w, step):
            t = P[y:y + tile, x:x + tile].transpose(2, 0, 1)[None]
            o = _s.run(None, {'image': t})[0][0].transpose(1, 2, 0)
            o = o[pad * 4:(tile - pad) * 4, pad * 4:(tile - pad) * 4]
            out[y * 4:y * 4 + o.shape[0], x * 4:x * 4 + o.shape[1]] = o
    out = np.clip(out[:h * 4, :w * 4], 0, 1)
    return cv2.cvtColor((out * 255 + 0.5).astype(np.uint8), cv2.COLOR_RGB2BGR)
if __name__ == '__main__':
    im = cv2.imread(sys.argv[1]); cv2.imwrite(sys.argv[2], upscale(im))
