"""
GlamAI FYP - Step 204: Face-Aware Foundation Simulation Visual QA & Pixel Alignment Audit
Validates facial skin region delineation, exclusion of eyes, eyebrows, lips, nostrils, and background,
coverage levels (light/sheer, medium, full), and combined multi-layer simulation
(Foundation + Blush + Eyeshadow + Eyeliner + Lipstick).
"""

import os
import sys
sys.path.insert(0, os.path.abspath("."))
import cv2
import numpy as np
from backend.services.mediapipe_client import mediapipe_client

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "qa_visual_outputs", "step204_foundation")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# MediaPipe Landmark Definitions
FACE_OVAL_INDICES = [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379,
    378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127,
    162, 21, 54, 103, 67, 109, 10
]

EXCLUSIONS = {
    "left_eye": [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7],
    "right_eye": [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249],
    "left_eyebrow": [70, 63, 105, 66, 107, 55, 65, 52, 53, 46],
    "right_eyebrow": [336, 296, 334, 293, 300, 276, 283, 282, 295, 285],
    "lips": [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61],
    "left_nostril": [98, 97, 2, 94, 242, 60],
    "right_nostril": [327, 326, 2, 94, 462, 290]
}

def hex_to_rgb(hex_str):
    clean = hex_str.lstrip('#')
    return tuple(int(clean[i:i+2], 16) for i in (0, 2, 4))

def blend_soft_light(base, blend, alpha):
    d = np.where(base > 0.25, np.sqrt(np.maximum(base, 0)), ((16 * base - 12) * base + 4) * base)
    res = np.where(blend <= 0.5,
                   base - (1.0 - 2.0 * blend) * base * (1.0 - base),
                   base + (2.0 * blend - 1.0) * (d - base))
    return base * (1.0 - alpha) + res * alpha

def blend_multiply(base, blend, alpha):
    mult = base * blend
    return base * (1.0 - alpha) + mult * alpha

def simulate_foundation_pass(img, landmarks, hex_color="#D8A782", coverage="medium", opacity=0.48, finish="Satin"):
    h, w = img.shape[:2]
    rgb = hex_to_rgb(hex_color)
    bgr_color = np.array([rgb[2], rgb[1], rgb[0]], dtype=np.float32) / 255.0

    def pt(idx):
        return np.array([landmarks[idx]["x"] * w, landmarks[idx]["y"] * h], dtype=np.int32)

    # 1. Face oval mask
    face_mask = np.zeros((h, w), dtype=np.uint8)
    oval_pts = np.array([pt(i) for i in FACE_OVAL_INDICES], dtype=np.int32)
    cv2.fillPoly(face_mask, [oval_pts], 255)

    # Hairline/jawline soft erosion and slight blur for natural boundary
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    eroded_face = cv2.erode(face_mask, kernel, iterations=1)
    blurred_face = cv2.GaussianBlur(eroded_face.astype(np.float32) / 255.0, (7, 7), 2.0)

    # 2. Exclusions mask (eyeballs, eyebrows, lips, nostrils)
    excl_mask = np.zeros((h, w), dtype=np.uint8)
    for k, idxs in EXCLUSIONS.items():
        pts = np.array([pt(i) for i in idxs], dtype=np.int32)
        cv2.fillPoly(excl_mask, [pts], 255)

    dilated_excl = cv2.dilate(excl_mask, kernel, iterations=1)

    # Destination-out punchout: zero out all pixels in exclusions or outside face oval
    alpha_map = blurred_face
    alpha_map[dilated_excl > 0] = 0.0
    alpha_map[face_mask == 0] = 0.0

    # Coverage scaling
    cov = coverage.lower()
    if "light" in cov or "sheer" in cov or "tint" in cov:
        coverage_mult = 0.68
    elif "full" in cov or "shield" in cov:
        coverage_mult = 1.32
    else: # medium
        coverage_mult = 1.0

    effective_opacity = np.clip(opacity * coverage_mult, 0.15, 0.72)
    final_alpha = alpha_map * effective_opacity

    # Blend
    base = img.astype(np.float32) / 255.0
    color_layer = np.zeros_like(base)
    for c in range(3):
        color_layer[:, :, c] = bgr_color[c]

    soft_pass = blend_soft_light(base, color_layer, final_alpha[:, :, np.newaxis] * 0.88)
    mult_pass = blend_multiply(soft_pass, color_layer, final_alpha[:, :, np.newaxis] * 0.20)

    out = np.clip(mult_pass * 255.0, 0, 255).astype(np.uint8)
    return out, final_alpha, excl_mask

def simulate_blush_pass(img, landmarks, hex_color="#D37D64", opacity=0.55):
    from backend.tests.generate_eye_makeup_qa_evidence import simulate_blush_pass as bp
    return bp(img, landmarks, hex_color=hex_color, opacity=opacity)

def simulate_eyeshadow_pass(img, landmarks, hex_color="#8F5E43", opacity=0.65, finish="Shimmer"):
    from backend.tests.generate_eye_makeup_qa_evidence import simulate_eyeshadow
    out, _, _ = simulate_eyeshadow(img, landmarks, hex_color=hex_color, opacity=opacity, finish=finish)
    return out

def simulate_eyeliner_pass(img, landmarks, hex_color="#1A1A1A", opacity=0.90, thickness=1.8, style="Winged"):
    from backend.tests.generate_eye_makeup_qa_evidence import simulate_eyeliner
    out, _ = simulate_eyeliner(img, landmarks, hex_color=hex_color, opacity=opacity, thickness=thickness, style=style)
    return out

def simulate_lipstick_pass(img, landmarks, hex_color="#B92F60", opacity=0.62):
    from backend.tests.generate_eye_makeup_qa_evidence import simulate_lipstick_pass as lp
    return lp(img, landmarks, hex_color=hex_color, opacity=opacity)

def process_foundation_qa(img_rel_path, model_name):
    print(f"\n[STEP 204 FOUNDATION QA] Processing portrait: {img_rel_path} ({model_name})...")
    img_path = os.path.join(os.path.dirname(__file__), "..", "..", img_rel_path)
    img = cv2.imread(img_path)
    assert img is not None, f"Could not read {img_path}"
    h, w = img.shape[:2]

    with open(img_path, "rb") as f:
        img_bytes = f.read()
    res = mediapipe_client.detect_landmarks(img_bytes)
    assert res.get("face_detected"), "Face detection failed"
    landmarks = res["landmarks"]

    def pt(idx):
        return (int(landmarks[idx]["x"] * w), int(landmarks[idx]["y"] * h))

    # 1. Original Portrait
    out_orig = os.path.join(OUTPUT_DIR, f"{model_name}_01_original_portrait.png")
    cv2.imwrite(out_orig, img)

    # 2. Mask and Exclusions Overlay Visualization
    vis_mask = img.copy()
    cv2.polylines(vis_mask, [np.array([pt(i) for i in FACE_OVAL_INDICES], dtype=np.int32)], True, (0, 255, 0), 2)
    for k, idxs in EXCLUSIONS.items():
        col = (255, 0, 0) if "eye" in k else ((0, 255, 255) if "brow" in k else ((0, 0, 255) if "lip" in k else (255, 255, 0)))
        cv2.polylines(vis_mask, [np.array([pt(i) for i in idxs], dtype=np.int32)], True, col, 2)
    out_mask_vis = os.path.join(OUTPUT_DIR, f"{model_name}_02_foundation_facial_mask_and_exclusions.png")
    cv2.imwrite(out_mask_vis, vis_mask)

    # 3. Foundation Light / Sheer Coverage
    found_light, alpha_light, _ = simulate_foundation_pass(img, landmarks, hex_color="#D8A782", coverage="light", opacity=0.48)
    out_light = os.path.join(OUTPUT_DIR, f"{model_name}_03_foundation_light_sheer_coverage.png")
    cv2.imwrite(out_light, found_light)

    # 4. Foundation Medium Coverage
    found_med, alpha_med, excl_mask = simulate_foundation_pass(img, landmarks, hex_color="#D8A782", coverage="medium", opacity=0.48)
    out_med = os.path.join(OUTPUT_DIR, f"{model_name}_04_foundation_medium_coverage.png")
    cv2.imwrite(out_med, found_med)

    # 5. Foundation Full Coverage
    found_full, alpha_full, _ = simulate_foundation_pass(img, landmarks, hex_color="#D8A782", coverage="full", opacity=0.48)
    out_full = os.path.join(OUTPUT_DIR, f"{model_name}_05_foundation_full_coverage.png")
    cv2.imwrite(out_full, found_full)

    # 6. Full Combined Look: Foundation -> Blush -> Eyeshadow -> Eyeliner -> Lipstick
    blush_layer = simulate_blush_pass(found_med, landmarks, hex_color="#D37D64", opacity=0.55)
    shadow_layer = simulate_eyeshadow_pass(blush_layer, landmarks, hex_color="#8F5E43", opacity=0.65, finish="Shimmer")
    liner_layer = simulate_eyeliner_pass(shadow_layer, landmarks, hex_color="#1A1A1A", opacity=0.90, thickness=1.8, style="Winged")
    full_combo = simulate_lipstick_pass(liner_layer, landmarks, hex_color="#B92F60", opacity=0.62)
    out_combo = os.path.join(OUTPUT_DIR, f"{model_name}_06_full_face_simulation.png")
    cv2.imwrite(out_combo, full_combo)

    # 7. Before / After Comparison
    comparison = np.hstack([img, full_combo])
    cv2.putText(comparison, "BEFORE (Original Portrait)", (25, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.85, (255, 255, 255), 2, cv2.LINE_AA)
    cv2.putText(comparison, "AFTER (Full Face Look with Foundation)", (w + 25, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.85, (255, 255, 255), 2, cv2.LINE_AA)
    out_comparison = os.path.join(OUTPUT_DIR, f"{model_name}_07_before_after_comparison.png")
    cv2.imwrite(out_comparison, comparison)

    # 8. Pixel Difference Heatmap for Foundation Layer
    diff = cv2.absdiff(img, found_med)
    diff_gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
    heatmap = cv2.applyColorMap(cv2.normalize(diff_gray, None, 0, 255, cv2.NORM_MINMAX), cv2.COLORMAP_JET)
    out_heatmap = os.path.join(OUTPUT_DIR, f"{model_name}_08_pixel_difference_heatmap.png")
    cv2.imwrite(out_heatmap, heatmap)

    # --- PIXEL AUDIT ---
    mod_pixels = np.sum(diff_gray > 2)

    # Exclusions masks
    left_eye_mask = np.zeros((h, w), dtype=np.uint8)
    right_eye_mask = np.zeros((h, w), dtype=np.uint8)
    cv2.fillPoly(left_eye_mask, [np.array([pt(i) for i in EXCLUSIONS["left_eye"]], dtype=np.int32)], 255)
    cv2.fillPoly(right_eye_mask, [np.array([pt(i) for i in EXCLUSIONS["right_eye"]], dtype=np.int32)], 255)

    left_brow_mask = np.zeros((h, w), dtype=np.uint8)
    right_brow_mask = np.zeros((h, w), dtype=np.uint8)
    cv2.fillPoly(left_brow_mask, [np.array([pt(i) for i in EXCLUSIONS["left_eyebrow"]], dtype=np.int32)], 255)
    cv2.fillPoly(right_brow_mask, [np.array([pt(i) for i in EXCLUSIONS["right_eyebrow"]], dtype=np.int32)], 255)

    lip_mask = np.zeros((h, w), dtype=np.uint8)
    cv2.fillPoly(lip_mask, [np.array([pt(i) for i in EXCLUSIONS["lips"]], dtype=np.int32)], 255)

    nostril_mask = np.zeros((h, w), dtype=np.uint8)
    cv2.fillPoly(nostril_mask, [np.array([pt(i) for i in EXCLUSIONS["left_nostril"]], dtype=np.int32)], 255)
    cv2.fillPoly(nostril_mask, [np.array([pt(i) for i in EXCLUSIONS["right_nostril"]], dtype=np.int32)], 255)

    face_oval_mask = np.zeros((h, w), dtype=np.uint8)
    cv2.fillPoly(face_oval_mask, [np.array([pt(i) for i in FACE_OVAL_INDICES], dtype=np.int32)], 255)

    eye_spill = np.sum((diff_gray > 2) & ((left_eye_mask > 0) | (right_eye_mask > 0)))
    brow_spill = np.sum((diff_gray > 2) & ((left_brow_mask > 0) | (right_brow_mask > 0)))
    lip_spill = np.sum((diff_gray > 2) & (lip_mask > 0))
    nostril_spill = np.sum((diff_gray > 2) & (nostril_mask > 0))
    bg_spill = np.sum((diff_gray > 2) & (face_oval_mask == 0))

    print("=" * 65)
    print(f"STEP 204 FOUNDATION AUDIT: {model_name.upper()}")
    print("=" * 65)
    print(f"Canvas Resolution:           {w} x {h} ({w*h:,} px)")
    print(f"Foundation Modified Pixels:  {mod_pixels:,} px")
    print(f"Eyeball Aperture Spill:      {eye_spill} PIXELS (100% PROTECTED)")
    print(f"Eyebrow Contour Spill:       {brow_spill} PIXELS (100% PROTECTED)")
    print(f"Vermilion Lip Spill:         {lip_spill} PIXELS (100% PROTECTED)")
    print(f"Nostril Opening Spill:       {nostril_spill} PIXELS (100% PROTECTED)")
    print(f"Hair / Background Spill:     {bg_spill} PIXELS (100% PROTECTED)")
    print("=" * 65)

    assert mod_pixels > 10000, f"Foundation failed to render sufficient skin coverage ({mod_pixels} px)"
    assert eye_spill == 0, f"Foundation leaked into eyes ({eye_spill} px)"
    assert brow_spill == 0, f"Foundation leaked into eyebrows ({brow_spill} px)"
    assert lip_spill == 0, f"Foundation leaked into lips ({lip_spill} px)"
    assert nostril_spill == 0, f"Foundation leaked into nostrils ({nostril_spill} px)"
    assert bg_spill == 0, f"Foundation leaked outside facial oval ({bg_spill} px)"

if __name__ == "__main__":
    process_foundation_qa("frontend/public/hero-model.png", "hero_model")
    process_foundation_qa("frontend/src/assets/login-model-merged.png", "login_model")
    print("\n[STEP 204 FOUNDATION QA] ALL MULTI-PORTRAIT FOUNDATION AUDITS PASSED!\n")
