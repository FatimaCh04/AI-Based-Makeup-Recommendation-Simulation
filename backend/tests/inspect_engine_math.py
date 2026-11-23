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

print("Bounding box:", data.get("bounding_box"))
print("Image dimensions from data:", data.get("image_dimensions"))

# 1. Foundation
p9 = get_pt(9)
p10 = get_pt(10)
p152 = get_pt(152)
dxForehead = p10["x"] - p9["x"]
dyForehead = p10["y"] - p9["y"]
hForehead = math.hypot(dxForehead, dyForehead)
ext = hForehead * 0.78
ux = dxForehead / hForehead
uy = dyForehead / hForehead
tCenter = {"x": p10["x"] + ux * ext, "y": p10["y"] + uy * ext}
print(f"Forehead: p9={p9['y']:.1f}, p10={p10['y']:.1f}, tCenter={tCenter['y']:.1f}")
print(f"Chin p152={p152['y']:.1f}")
print(f"Top of image is y=0. tCenter is y={tCenter['y']:.1f}!! That leaves {tCenter['y']:.1f} pixels ({(tCenter['y']/h)*100:.1f}% of image height) completely untreated above forehead!")

# 2. Left Eye (MediaPipe left is viewer's right: 33, 133, etc.)
p33 = get_pt(33)
p133 = get_pt(133)
p159 = get_pt(159) # lashline apex
p27 = get_pt(27)   # crease apex
p52 = get_pt(52)   # brow
print(f"Eye (33->133): medial(33)=({p33['x']:.1f}, {p33['y']:.1f}), lateral(133)=({p133['x']:.1f}, {p133['y']:.1f})")
print(f"Lashline apex 159: ({p159['x']:.1f}, {p159['y']:.1f})")
print(f"Crease apex 27: ({p27['x']:.1f}, {p27['y']:.1f})")
print(f"Lid height (p159.y - p27.y): {p159['y'] - p27['y']:.1f}px")

# Right Eye (MediaPipe right is viewer's left: 362, 263, etc.)
p362 = get_pt(362)
p263 = get_pt(263)
p386 = get_pt(386) # lashline apex
p257 = get_pt(257) # crease apex
p282 = get_pt(282) # brow
print(f"Eye (362->263): medial(362)=({p362['x']:.1f}, {p362['y']:.1f}), lateral(263)=({p263['x']:.1f}, {p263['y']:.1f})")
print(f"Lashline apex 386: ({p386['x']:.1f}, {p386['y']:.1f})")
print(f"Crease apex 257: ({p257['x']:.1f}, {p257['y']:.1f})")
print(f"Lid height (p386.y - p257.y): {p386['y'] - p257['y']:.1f}px")
