import json

with open("tests/login_model_landmarks.json", "r") as f:
    data = json.load(f)

lms = data["landmarks"]
w, h = 709, 546

def get_pt(idx):
    pt = lms[idx]
    x = pt.get("pixel_x", pt.get("x") * w if pt.get("x") <= 1.0 else pt.get("x"))
    y = pt.get("pixel_y", pt.get("y") * h if pt.get("y") <= 1.0 else pt.get("y"))
    return {"x": round(x, 1), "y": round(y, 1)}

print("Nose tip 4:", get_pt(4))
print("Nose bridge 168:", get_pt(168))

print("\n--- MediaPipe 'Left Eye' (viewer's left) ---")
print("pt 33:", get_pt(33))
print("pt 133:", get_pt(133))
print("upper lashline [33, 246, 161, 160, 159, 158, 157, 173, 133]:")
for idx in [33, 246, 161, 160, 159, 158, 157, 173, 133]:
    print(f"  {idx}: {get_pt(idx)}")

print("\n--- MediaPipe 'Right Eye' (viewer's right) ---")
print("pt 362:", get_pt(362))
print("pt 263:", get_pt(263))
print("upper lashline [362, 398, 384, 385, 386, 387, 388, 466, 263]:")
for idx in [362, 398, 384, 385, 386, 387, 388, 466, 263]:
    print(f"  {idx}: {get_pt(idx)}")
