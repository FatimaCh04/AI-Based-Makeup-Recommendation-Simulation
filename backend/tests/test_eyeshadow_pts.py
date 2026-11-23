import json
import math

with open("tests/login_model_landmarks.json", "r") as f:
    data = json.load(f)

lms = data["landmarks"]
w, h = 709, 546

def get_pt(idx):
    pt = lms[idx]
    x = pt.get("pixel_x", pt.get("x") * w if pt.get("x") <= 1.0 else pt.get("x"))
    y = pt.get("pixel_y", pt.get("y") * h if pt.get("y") <= 1.0 else pt.get("y"))
    return {"x": x, "y": y}

def eval_spline(pts, u):
    n = len(pts) - 1
    t = max(0.0, min(1.0, u)) * n
    i0 = math.floor(t)
    frac = t - i0
    if i0 >= n:
        return pts[n]
    pA = pts[i0]
    pB = pts[i0 + 1]
    return {
        "x": pA["x"] + (pB["x"] - pA["x"]) * frac,
        "y": pA["y"] + (pB["y"] - pA["y"]) * frac
    }

left_lash_indices = [33, 246, 161, 160, 159, 158, 157, 173, 133]
left_crease_indices = [247, 30, 29, 27, 28, 56, 190]
left_brow_indices = [46, 53, 52, 65, 55]

lash_pts = [get_pt(i) for i in left_lash_indices]
crease_pts = [get_pt(i) for i in left_crease_indices]
brow_pts = [get_pt(i) for i in left_brow_indices]

print("=== LEFT EYE LANDMARKS ===")
for i in range(len(lash_pts)):
    print(f"Lash {i} ({left_lash_indices[i]}): x={lash_pts[i]['x']:.1f}, y={lash_pts[i]['y']:.1f}")
for i in range(len(crease_pts)):
    print(f"Crease {i} ({left_crease_indices[i]}): x={crease_pts[i]['x']:.1f}, y={crease_pts[i]['y']:.1f}")

num_samples = 28
eyeW = math.hypot(lash_pts[-1]["x"] - lash_pts[0]["x"], lash_pts[-1]["y"] - lash_pts[0]["y"])
print("eyeW:", eyeW)

for i in [0, 5, 14, 20, 27]:
    u = i / (num_samples - 1)
    pL = eval_spline(lash_pts, u)
    pC = eval_spline(crease_pts, u)
    pB = eval_spline(brow_pts, u)
    dx = pC["x"] - pL["x"]
    dy = pC["y"] - pL["y"]
    lidH = math.hypot(dx, dy)
    outerBias = u
    arch = math.sin(u * math.pi) * 0.70 + outerBias * 0.35
    socketLift = max(6.0, min(eyeW * 0.35, lidH * 0.75)) * max(0.40, arch)
    upX, upY = dx / lidH if lidH > 1e-3 else 0, dy / lidH if lidH > 1e-3 else -1
    candX = pC["x"] + upX * socketLift
    candY = pC["y"] + upY * socketLift
    print(f"Sample {i} (u={u:.2f}): pL=({pL['x']:.1f}, {pL['y']:.1f}), pC=({pC['x']:.1f}, {pC['y']:.1f}), up=({upX:.2f}, {upY:.2f}), socketLift={socketLift:.1f}, cand=({candX:.1f}, {candY:.1f})")

# Right Eye
right_lash_indices = [362, 398, 384, 385, 386, 387, 388, 466, 263]
right_crease_indices = [414, 286, 258, 257, 259, 260, 467]
right_lash = [get_pt(i) for i in right_lash_indices]
right_crease = [get_pt(i) for i in right_crease_indices]

print("\n=== RIGHT EYE LANDMARKS ===")
for i in [0, 5, 14, 20, 27]:
    u = i / (num_samples - 1)
    pL = eval_spline(right_lash, u)
    pC = eval_spline(right_crease, u)
    dx = pC["x"] - pL["x"]
    dy = pC["y"] - pL["y"]
    lidH = math.hypot(dx, dy)
    print(f"Right Sample {i} (u={u:.2f}): pL=({pL['x']:.1f}, {pL['y']:.1f}), pC=({pC['x']:.1f}, {pC['y']:.1f}), dx={dx:.1f}, dy={dy:.1f}, lidH={lidH:.1f}")
