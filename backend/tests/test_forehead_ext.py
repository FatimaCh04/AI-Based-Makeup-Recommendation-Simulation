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
    return {"x": round(x, 1), "y": round(y, 1)}

# Check all face oval and forehead points
print("p10 (mid-forehead):", get_pt(10))
print("p9 (glabella):", get_pt(9))
print("p152 (chin):", get_pt(152))
print("p234 (left zygion):", get_pt(234))
print("p454 (right zygion):", get_pt(454))
print("p109 (left forehead):", get_pt(109))
print("p338 (right forehead):", get_pt(338))
print("p67 (left temple):", get_pt(67))
print("p297 (right temple):", get_pt(297))
print("p103 (left ear/temple):", get_pt(103))
print("p332 (right ear/temple):", get_pt(332))

face_height = get_pt(152)["y"] - get_pt(10)["y"]
print("Face height (10 to 152):", face_height)
# Forehead height from glabella 9 to 10
forehead_h = get_pt(9)["y"] - get_pt(10)["y"]
print("Forehead height (9 to 10):", forehead_h)
# Full anatomical forehead is approximately equal to 9->10 extended by 1.6x
cranial_ext = forehead_h * 1.6
print("Cranial ext (1.6x):", cranial_ext)
print("Apex y with 1.6x:", get_pt(10)["y"] - cranial_ext)
