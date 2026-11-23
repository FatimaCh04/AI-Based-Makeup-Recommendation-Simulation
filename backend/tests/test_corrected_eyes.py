import json
import math
import cv2
import numpy as np

img_path = "tests/qa_visual_outputs/login_model_01_original_portrait.png"
base_img = cv2.imread(img_path)
h, w = base_img.shape[:2]

with open("tests/login_model_landmarks.json", "r") as f:
    data = json.load(f)
lms = data["landmarks"]

def get_pt(idx):
    pt = lms[idx]
    x = pt.get("pixel_x", pt.get("x") * w if pt.get("x") <= 1.0 else pt.get("x"))
    y = pt.get("pixel_y", pt.get("y") * h if pt.get("y") <= 1.0 else pt.get("y"))
    return (float(x), float(y))

# Corrected landmark arrays (both medial to lateral):
left_lash = [get_pt(i) for i in [133, 173, 157, 158, 159, 160, 161, 246, 33]]
right_lash = [get_pt(i) for i in [362, 398, 384, 385, 386, 387, 388, 466, 263]]

out_img = base_img.copy()

# Test eyeliner wing on left eye:
# last point is 33 (lateral, temple side: x=183)
# prev point is 246 (x=185)
p_last = left_lash[-1]
p_prev = left_lash[-2]
dx = p_last[0] - p_prev[0]
dy = p_last[1] - p_prev[1]
len_v = math.hypot(dx, dy)
ux, uy = dx / len_v, dy / len_v
wing_len = 12.0
tip_x = p_last[0] + ux * wing_len
tip_y = p_last[1] + uy * wing_len - wing_len * 0.28
print("Left wing: from (183, 165) extending to:", tip_x, tip_y)
# Notice tip_x is LESS than 183 (e.g. ~170), pointing to the LEFT towards the left temple!
assert tip_x < p_last[0], "Left wing must point LEFT towards temple!"

# Test eyeliner wing on right eye:
# last point is 263 (lateral, temple side: x=311)
# prev point is 466 (x=309)
p_last_r = right_lash[-1]
p_prev_r = right_lash[-2]
dx_r = p_last_r[0] - p_prev_r[0]
dy_r = p_last_r[1] - p_prev_r[1]
len_vr = math.hypot(dx_r, dy_r)
ux_r, uy_r = dx_r / len_vr, dy_r / len_vr
tip_xr = p_last_r[0] + ux_r * wing_len
tip_yr = p_last_r[1] + uy_r * wing_len - wing_len * 0.28
print("Right wing: from (311, 196) extending to:", tip_xr, tip_yr)
# Notice tip_xr is GREATER than 311 (e.g. ~323), pointing to the RIGHT towards the right temple!
assert tip_xr > p_last_r[0], "Right wing must point RIGHT towards temple!"

print("SUCCESS: Both eyeliner wings correctly point outward towards the temples!")
