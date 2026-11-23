import json
import math
import cv2
import numpy as np

# Load test image
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

# 1. Test Foundation Mask with Extended Hairline & Feathering
p9 = get_pt(9)
p10 = get_pt(10)
p152 = get_pt(152)

dx = p10[0] - p9[0]
dy = p10[1] - p9[1]
hForehead = math.hypot(dx, dy)
ux = dx / hForehead
uy = dy / hForehead
px = -uy
py = ux

ext = max(hForehead * 1.65, (p152[1] - p10[1]) * 0.38)

tCenter = (p10[0] + ux * ext, p10[1] + uy * ext)
tRight = (get_pt(338)[0] + ux * (ext * 0.90) + px * (ext * 0.15), get_pt(338)[1] + uy * (ext * 0.90) + py * (ext * 0.15))
tRightOuter = (get_pt(297)[0] + ux * (ext * 0.60) + px * (ext * 0.10), get_pt(297)[1] + uy * (ext * 0.60) + py * (ext * 0.10))
tRightTemple = (get_pt(332)[0] + ux * (ext * 0.30) + px * (ext * 0.05), get_pt(332)[1] + uy * (ext * 0.30) + py * (ext * 0.05))

tLeft = (get_pt(109)[0] + ux * (ext * 0.90) - px * (ext * 0.15), get_pt(109)[1] + uy * (ext * 0.90) - py * (ext * 0.15))
tLeftOuter = (get_pt(67)[0] + ux * (ext * 0.60) - px * (ext * 0.10), get_pt(67)[1] + uy * (ext * 0.60) - py * (ext * 0.10))
tLeftTemple = (get_pt(103)[0] + ux * (ext * 0.30) - px * (ext * 0.05), get_pt(103)[1] + uy * (ext * 0.30) - py * (ext * 0.05))

jawAndCheekRight = [284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152]
jawAndCheekLeft = [148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54]

contour = [
    tCenter, tRight, tRightOuter, tRightTemple,
    *[get_pt(i) for i in jawAndCheekRight],
    *[get_pt(i) for i in jawAndCheekLeft],
    tLeftTemple, tLeftOuter, tLeft
]

mask = np.zeros((h, w), dtype=np.uint8)
pts_np = np.array([[int(round(p[0])), int(round(p[1]))] for p in contour], dtype=np.int32)
cv2.fillPoly(mask, [pts_np], 255)

# Feather the outer boundary with Gaussian Blur
feathered_mask = cv2.GaussianBlur(mask, (31, 31), 11)

# Now punch out exclusions from the feathered mask
exclusions = [
    [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7], # left eye
    [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249], # right eye
    [70, 63, 105, 66, 107, 55, 65, 52, 53, 46], # left brow
    [300, 293, 334, 296, 336, 285, 295, 282, 283, 276], # right brow
    [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146], # lips
    [102, 64, 48, 131], # left nostril
    [331, 294, 278, 360] # right nostril
]

for excl in exclusions:
    e_pts = np.array([[int(round(get_pt(i)[0])), int(round(get_pt(i)[1]))] for i in excl], dtype=np.int32)
    cv2.fillPoly(feathered_mask, [e_pts], 0)

# Save mask visualization
cv2.imwrite("tests/qa_visual_outputs/test_feathered_foundation_mask.png", feathered_mask)
print("Saved feathered foundation mask to tests/qa_visual_outputs/test_feathered_foundation_mask.png")
print("tCenter Y:", tCenter[1], "Top of image: 0")
