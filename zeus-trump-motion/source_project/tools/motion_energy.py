import sys, cv2, numpy as np, json
path = sys.argv[1]
x0,y0,x1,y1 = 1630,230,1800,690
cap = cv2.VideoCapture(path)
prev=None; out=[]
i=0
while True:
    ok, f = cap.read()
    if not ok: break
    roi = cv2.cvtColor(f[y0:y1,x0:x1], cv2.COLOR_BGR2GRAY).astype(np.float32)
    if prev is not None:
        d = np.abs(roi-prev)
        out.append((i, float(d.mean()), float((d>25).mean())))
    prev=roi; i+=1
e = np.array([o[1] for o in out])
# 2.5s window (75 frames) sum
w=75
cs = np.convolve(e, np.ones(w), 'valid')
order = np.argsort(cs)[::-1]
print("frames", i)
picked=[]
for k in order:
    if all(abs(k-p)>60 for p in picked):
        picked.append(k)
    if len(picked)>=6: break
for p in picked:
    print(f"window start frame {p+1} t={ (p+1)/30:.2f}s  energy={cs[p]:.1f}")
# per-second profile
for s in range(30):
    seg=e[s*30:(s+1)*30]
    print(s, round(float(seg.mean()),2), '#'*int(seg.mean()*4))
json.dump(out, open(sys.argv[2],'w'))
