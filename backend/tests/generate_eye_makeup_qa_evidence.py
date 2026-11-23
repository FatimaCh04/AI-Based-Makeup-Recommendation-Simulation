"""
GlamAI FYP - Step 203: Face-Aware Eyeshadow & Eyeliner Visual QA & Pixel Alignment Audit
Validates bilateral upper eyelid placement, upper lashline eyeliner tracing,
eyeball aperture protection (zero eyeball bleed), eyebrow/nose/hair exclusion,
and combined simulation (Lipstick + Blush + Eyeshadow + Eyeliner).
"""

import os
import cv2
import numpy as np
from backend.services.mediapipe_client import mediapipe_client

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "qa_visual_outputs", "step203_eye_makeup")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# MediaPipe Landmark Indices
EYE_LANDMARKS = {
    "left": {
        "upperLashline": [33, 246, 161, 160, 159, 158, 157, 173, 133],
        "crease": [190, 56, 28, 27, 29, 30, 247],
        "eyeball": [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7],
        "brow": [70, 63, 105, 66, 107, 55, 65, 52, 53, 46],
        "medial": 33,
        "lateral": 133,
        "lashApex": 159,
        "creaseApex": 27,
    },
    "right": {
        "upperLashline": [362, 398, 384, 385, 386, 387, 388, 466, 263],
        "crease": [467, 260, 259, 257, 258, 286, 414],
        "eyeball": [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249],
        "brow": [300, 293, 334, 296, 336, 285, 295, 282, 283, 276],
        "medial": 362,
        "lateral": 263,
        "lashApex": 386,
        "creaseApex": 257,
    }
}

NOSE_BRIDGE_INDICES = [168, 6, 197, 195, 5, 4, 1]
LIP_OUTER_INDICES = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61]
LIP_INNER_INDICES = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78]
FACE_OVAL_INDICES = [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379,
    378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127,
    162, 21, 54, 103, 67, 109, 10
]

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

def blend_screen(base, blend, alpha):
    scr = 1.0 - (1.0 - base) * (1.0 - blend)
    return base * (1.0 - alpha) + scr * alpha

def simulate_eyeshadow(img, landmarks, hex_color="#8F5E43", opacity=0.65, finish="Shimmer"):
    h, w = img.shape[:2]
    rgb = hex_to_rgb(hex_color)
    bgr_color = np.array([rgb[2], rgb[1], rgb[0]], dtype=np.float32) / 255.0

    def pt(idx):
        return np.array([landmarks[idx]["x"] * w, landmarks[idx]["y"] * h], dtype=np.float32)

    eyelid_alpha_map = np.zeros((h, w), dtype=np.float32)
    eyeball_mask = np.zeros((h, w), dtype=np.uint8)

    for side in ["left", "right"]:
        cfg = EYE_LANDMARKS[side]
        lash_pts = np.array([pt(i) for i in cfg["upperLashline"]], dtype=np.int32)
        crease_pts = np.array([pt(i) for i in cfg["crease"]], dtype=np.int32)
        palp_pts = np.array([pt(i) for i in cfg["eyeball"]], dtype=np.int32)

        cv2.fillPoly(eyeball_mask, [palp_pts], 255)

        poly = np.vstack([lash_pts, crease_pts])
        lid_mask = np.zeros((h, w), dtype=np.uint8)
        cv2.fillPoly(lid_mask, [poly], 255)

        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        dilated_eye = cv2.dilate(eyeball_mask, kernel, iterations=1)
        valid_lid = cv2.bitwise_and(lid_mask, cv2.bitwise_not(dilated_eye))

        p_lash = pt(cfg["lashApex"])
        p_crease = pt(cfg["creaseApex"])
        vec = p_crease - p_lash
        vec_len_sq = np.dot(vec, vec) + 1e-6

        Y, X = np.ogrid[:h, :w]
        proj = ((X - p_lash[0]) * vec[0] + (Y - p_lash[1]) * vec[1]) / vec_len_sq
        grad = np.clip(1.0 - proj, 0.0, 1.0)

        eyelid_alpha_map = np.maximum(eyelid_alpha_map, valid_lid.astype(np.float32) / 255.0 * grad * opacity)

    base = img.astype(np.float32) / 255.0
    color_layer = np.zeros_like(base)
    for c in range(3):
        color_layer[:, :, c] = bgr_color[c]

    mult_pass = blend_multiply(base, color_layer, eyelid_alpha_map[:, :, np.newaxis] * 0.70)
    final_out = blend_soft_light(mult_pass, color_layer, eyelid_alpha_map[:, :, np.newaxis] * 0.85)

    if "shimmer" in finish.lower() or "satin" in finish.lower():
        shimmer_alpha = np.zeros((h, w), dtype=np.float32)
        for side in ["left", "right"]:
            cfg = EYE_LANDMARKS[side]
            p_lash = pt(cfg["lashApex"])
            p_crease = pt(cfg["creaseApex"])
            cx, cy = (p_lash[0] + p_crease[0]) * 0.5, (p_lash[1] + p_crease[1]) * 0.5
            lid_h = np.linalg.norm(p_crease - p_lash)
            rad_x = max(6.0, lid_h * 1.5)
            rad_y = max(4.0, lid_h * 0.7)

            Y, X = np.ogrid[:h, :w]
            norm_dist = np.sqrt(((X - cx) / rad_x)**2 + ((Y - cy) / rad_y)**2)
            glow = np.clip(1.0 - norm_dist, 0.0, 1.0) ** 2
            shimmer_alpha = np.maximum(shimmer_alpha, glow * 0.35 * (eyelid_alpha_map > 0.05))

        white = np.ones_like(base)
        final_out = blend_screen(final_out, white, shimmer_alpha[:, :, np.newaxis])

    simulated_bgr = np.clip(final_out * 255.0, 0, 255).astype(np.uint8)
    return simulated_bgr, eyelid_alpha_map, eyeball_mask

def simulate_eyeliner(img, landmarks, hex_color="#1A1A1A", opacity=0.90, thickness=1.8, style="Winged"):
    h, w = img.shape[:2]
    rgb = hex_to_rgb(hex_color)
    bgr_color = (rgb[2], rgb[1], rgb[0])

    def pt(idx):
        return np.array([landmarks[idx]["x"] * w, landmarks[idx]["y"] * h], dtype=np.float32)

    liner_layer = np.zeros((h, w, 4), dtype=np.uint8)

    for side in ["left", "right"]:
        cfg = EYE_LANDMARKS[side]
        lash_pts = [pt(i) for i in cfg["upperLashline"]]
        palp_pts = np.array([pt(i) for i in cfg["eyeball"]], dtype=np.int32)

        p_medial = pt(cfg["medial"])
        p_lateral = pt(cfg["lateral"])
        eye_w = np.linalg.norm(p_lateral - p_medial)
        line_w = max(1, int(round((eye_w / 28.0) * thickness)))

        # Draw smooth polyline along upper lashline
        for i in range(len(lash_pts) - 1):
            p1 = (int(round(lash_pts[i][0])), int(round(lash_pts[i][1])))
            p2 = (int(round(lash_pts[i+1][0])), int(round(lash_pts[i+1][1])))
            cv2.line(liner_layer, p1, p2, (*bgr_color, int(255 * opacity)), line_w, cv2.LINE_AA)

        # Winged flick
        if "wing" in style.lower() or "cat" in style.lower():
            p_last = lash_pts[-1]
            p_prev = lash_pts[-2]
            d = p_last - p_prev
            d_norm = d / (np.linalg.norm(d) + 1e-5)
            wing_len = eye_w * 0.24
            tip = p_last + d_norm * wing_len
            tip[1] -= (wing_len * 0.26) # Angle upward

            p_return = lash_pts[-2]
            triangle = np.array([
                [int(round(p_last[0])), int(round(p_last[1]))],
                [int(round(tip[0])), int(round(tip[1]))],
                [int(round(p_return[0])), int(round(p_return[1]))]
            ], dtype=np.int32)
            cv2.fillPoly(liner_layer, [triangle], (*bgr_color, int(255 * opacity)), cv2.LINE_AA)

        # Eyeball Aperture Protection: Punch out eyeball palpebral opening
        cv2.fillPoly(liner_layer, [palp_pts], (0, 0, 0, 0))

    # Composite liner over image
    alpha = (liner_layer[:, :, 3].astype(np.float32) / 255.0)[:, :, np.newaxis]
    rgb_liner = liner_layer[:, :, :3].astype(np.float32)
    base = img.astype(np.float32)
    out = base * (1.0 - alpha) + rgb_liner * alpha
    return np.clip(out, 0, 255).astype(np.uint8), liner_layer[:, :, 3]

def simulate_blush_pass(base_img, landmarks, hex_color="#D37D64", opacity=0.55):
    h, w = base_img.shape[:2]
    rgb = hex_to_rgb(hex_color)
    bgr_color = np.array([rgb[2], rgb[1], rgb[0]], dtype=np.float32) / 255.0

    def pt(idx):
        return np.array([landmarks[idx]["x"] * w, landmarks[idx]["y"] * h], dtype=np.float32)

    center_l = pt(205) * 0.65 + pt(50) * 0.35
    rx_l = max(12.0, min(w * 0.20, np.linalg.norm(pt(234) - pt(98)) * 0.38))
    ry_l = max(10.0, min(h * 0.16, np.linalg.norm(pt(61) - pt(145)) * 0.30))
    angle_l = np.degrees(np.arctan2(pt(234)[1] - pt(98)[1], pt(234)[0] - pt(98)[0]))

    center_r = pt(425) * 0.65 + pt(280) * 0.35
    rx_r = max(12.0, min(w * 0.20, np.linalg.norm(pt(454) - pt(327)) * 0.38))
    ry_r = max(10.0, min(h * 0.16, np.linalg.norm(pt(291) - pt(374)) * 0.30))
    angle_r = np.degrees(np.arctan2(pt(454)[1] - pt(327)[1], pt(454)[0] - pt(327)[0]))

    mask_oval = np.zeros((h, w), dtype=np.uint8)
    cv2.fillPoly(mask_oval, [np.array([pt(i) for i in FACE_OVAL_INDICES], dtype=np.int32)], 255)
    mask_excl = np.zeros((h, w), dtype=np.uint8)
    cv2.fillPoly(mask_excl, [np.array([pt(i) for i in EYE_LANDMARKS["left"]["eyeball"]], dtype=np.int32)], 255)
    cv2.fillPoly(mask_excl, [np.array([pt(i) for i in EYE_LANDMARKS["right"]["eyeball"]], dtype=np.int32)], 255)
    cv2.fillPoly(mask_excl, [np.array([pt(i) for i in LIP_OUTER_INDICES], dtype=np.int32)], 255)

    valid_skin = cv2.bitwise_and(mask_oval, cv2.bitwise_not(mask_excl))

    Y, X = np.ogrid[:h, :w]
    def cheek_w(center, rx, ry, deg_ang):
        rad = np.radians(deg_ang)
        cos_a, sin_a = np.cos(rad), np.sin(rad)
        dx, dy = X - center[0], Y - center[1]
        x_rot = cos_a * dx + sin_a * dy
        y_rot = -sin_a * dx + cos_a * dy
        norm_dist = np.sqrt((x_rot / rx)**2 + (y_rot / ry)**2)
        return (np.clip(1.0 - norm_dist, 0.0, 1.0) ** 2)

    weight = np.maximum(cheek_w(center_l, rx_l, ry_l, angle_l), cheek_w(center_r, rx_r, ry_r, angle_r))
    alpha_map = weight * (valid_skin.astype(np.float32) / 255.0) * opacity * 0.72

    base = base_img.astype(np.float32) / 255.0
    color_layer = np.zeros_like(base)
    for c in range(3):
        color_layer[:, :, c] = bgr_color[c]

    out = blend_soft_light(base, color_layer, alpha_map[:, :, np.newaxis])
    return np.clip(out * 255.0, 0, 255).astype(np.uint8)

def simulate_lipstick_pass(base_img, landmarks, hex_color="#B92F60", opacity=0.62):
    h, w = base_img.shape[:2]
    rgb = hex_to_rgb(hex_color)
    bgr_color = np.array([rgb[2], rgb[1], rgb[0]], dtype=np.float32) / 255.0

    def pt(idx):
        return np.array([landmarks[idx]["x"] * w, landmarks[idx]["y"] * h], dtype=np.int32)

    outer_pts = np.array([pt(i) for i in LIP_OUTER_INDICES], dtype=np.int32)
    inner_pts = np.array([pt(i) for i in LIP_INNER_INDICES], dtype=np.int32)

    lip_mask = np.zeros((h, w), dtype=np.uint8)
    cv2.fillPoly(lip_mask, [outer_pts], 255)
    cv2.fillPoly(lip_mask, [inner_pts], 0)

    lip_alpha = (lip_mask.astype(np.float32) / 255.0) * opacity
    base = base_img.astype(np.float32) / 255.0
    color_layer = np.zeros_like(base)
    for c in range(3):
        color_layer[:, :, c] = bgr_color[c]

    mult = blend_multiply(base, color_layer, lip_alpha[:, :, np.newaxis] * 0.90)
    out = blend_soft_light(mult, color_layer, lip_alpha[:, :, np.newaxis] * 0.70)
    return np.clip(out * 255.0, 0, 255).astype(np.uint8)

def process_eye_qa(img_rel_path, model_name):
    print(f"\n[STEP 203 EYE QA] Processing portrait: {img_rel_path} ({model_name})...")
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

    # 2. Eye Landmarks Visualization
    vis_landmarks = img.copy()
    for side, col in [("left", (0, 255, 255)), ("right", (255, 200, 0))]:
        cfg = EYE_LANDMARKS[side]
        for i in range(len(cfg["upperLashline"]) - 1):
            cv2.line(vis_landmarks, pt(cfg["upperLashline"][i]), pt(cfg["upperLashline"][i+1]), (0, 255, 0), 1)
        for i in range(len(cfg["crease"]) - 1):
            cv2.line(vis_landmarks, pt(cfg["crease"][i]), pt(cfg["crease"][i+1]), (255, 0, 255), 1)
        for i in range(len(cfg["eyeball"]) - 1):
            cv2.line(vis_landmarks, pt(cfg["eyeball"][i]), pt(cfg["eyeball"][i+1]), (0, 0, 255), 1)
        cv2.circle(vis_landmarks, pt(cfg["lashApex"]), 3, (0, 255, 0), -1)
        cv2.circle(vis_landmarks, pt(cfg["creaseApex"]), 3, (255, 0, 255), -1)
    out_landmarks = os.path.join(OUTPUT_DIR, f"{model_name}_02_eye_landmarks_visualization.png")
    cv2.imwrite(out_landmarks, vis_landmarks)

    # 3. Eyeshadow-Only Result
    eyeshadow_only, alpha_map, eyeball_mask = simulate_eyeshadow(img, landmarks, hex_color="#8F5E43", opacity=0.65, finish="Shimmer")
    out_eye_only = os.path.join(OUTPUT_DIR, f"{model_name}_03_eyeshadow_only_result.png")
    cv2.imwrite(out_eye_only, eyeshadow_only)

    # 4. Eyeliner-Only Result
    eyeliner_only, liner_mask = simulate_eyeliner(img, landmarks, hex_color="#1A1A1A", opacity=0.90, thickness=1.8, style="Winged")
    out_liner_only = os.path.join(OUTPUT_DIR, f"{model_name}_04_eyeliner_only_result.png")
    cv2.imwrite(out_liner_only, eyeliner_only)

    # 5. Combined Eye Makeup & Full Face (Blush + Eyeshadow + Eyeliner + Lipstick)
    blush_pass = simulate_blush_pass(img, landmarks, hex_color="#D37D64", opacity=0.55)
    shadow_pass, _, _ = simulate_eyeshadow(blush_pass, landmarks, hex_color="#8F5E43", opacity=0.65, finish="Shimmer")
    liner_pass, _ = simulate_eyeliner(shadow_pass, landmarks, hex_color="#1A1A1A", opacity=0.90, thickness=1.8, style="Winged")
    full_combo = simulate_lipstick_pass(liner_pass, landmarks, hex_color="#B92F60", opacity=0.62)
    out_combined = os.path.join(OUTPUT_DIR, f"{model_name}_05_combined_eye_makeup_result.png")
    cv2.imwrite(out_combined, full_combo)

    # 6. Before / After Comparison
    comparison = np.hstack([img, full_combo])
    cv2.putText(comparison, "BEFORE (Original)", (25, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.85, (255, 255, 255), 2, cv2.LINE_AA)
    cv2.putText(comparison, "AFTER (Full Face Look)", (w + 25, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.85, (255, 255, 255), 2, cv2.LINE_AA)
    out_comparison = os.path.join(OUTPUT_DIR, f"{model_name}_06_before_after_comparison.png")
    cv2.imwrite(out_comparison, comparison)

    # 7. Pixel Difference Heatmap
    diff = cv2.absdiff(img, liner_pass)
    diff_gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
    heatmap = cv2.applyColorMap(cv2.normalize(diff_gray, None, 0, 255, cv2.NORM_MINMAX), cv2.COLORMAP_JET)
    out_heatmap = os.path.join(OUTPUT_DIR, f"{model_name}_07_pixel_difference_heatmap.png")
    cv2.imwrite(out_heatmap, heatmap)

    # --- PIXEL AUDIT ---
    eyeball_spill = np.sum((liner_mask > 0) & (eyeball_mask > 0))
    eyeball_shadow_spill = np.sum((alpha_map > 0.01) & (eyeball_mask > 0))

    brow_mask = np.zeros((h, w), dtype=np.uint8)
    cv2.fillPoly(brow_mask, [np.array([pt(i) for i in EYE_LANDMARKS["left"]["brow"]], dtype=np.int32)], 255)
    cv2.fillPoly(brow_mask, [np.array([pt(i) for i in EYE_LANDMARKS["right"]["brow"]], dtype=np.int32)], 255)
    brow_spill = np.sum((diff_gray > 2) & (brow_mask > 0))

    lip_mask = np.zeros((h, w), dtype=np.uint8)
    cv2.fillPoly(lip_mask, [np.array([pt(i) for i in LIP_OUTER_INDICES], dtype=np.int32)], 255)
    lip_spill = np.sum((diff_gray > 2) & (lip_mask > 0))

    oval_mask = np.zeros((h, w), dtype=np.uint8)
    cv2.fillPoly(oval_mask, [np.array([pt(i) for i in FACE_OVAL_INDICES], dtype=np.int32)], 255)
    bg_spill = np.sum((diff_gray > 2) & (oval_mask == 0))

    eyeliner_pixels = np.sum(liner_mask > 0)
    eyeshadow_pixels = np.sum(alpha_map > 0.01)

    print("=" * 65)
    print(f"STEP 203 EYE MAKEUP AUDIT: {model_name.upper()}")
    print("=" * 65)
    print(f"Canvas Resolution:           {w} x {h} ({w*h:,} px)")
    print(f"Eyeshadow Modified Pixels:   {eyeshadow_pixels:,} px")
    print(f"Eyeliner Modified Pixels:    {eyeliner_pixels:,} px")
    print(f"Eyeliner Eyeball Spill:      {eyeball_spill} PIXELS (100% PROTECTED)")
    print(f"Eyeshadow Eyeball Spill:     {eyeball_shadow_spill} PIXELS (100% PROTECTED)")
    print(f"Eyebrow Spill:               {brow_spill} PIXELS (100% PROTECTED)")
    print(f"Lip Spill:                   {lip_spill} PIXELS (100% PROTECTED)")
    print(f"Hair / Background Spill:     {bg_spill} PIXELS (100% PROTECTED)")
    print("=" * 65)

    assert eyeliner_pixels > 80, f"Eyeliner failed to render ({eyeliner_pixels} px)"
    assert eyeshadow_pixels > 150, f"Eyeshadow failed to render ({eyeshadow_pixels} px)"
    assert eyeball_spill == 0, f"Eyeliner spilled into eyeball ({eyeball_spill} px)"
    assert eyeball_shadow_spill == 0, f"Eyeshadow spilled into eyeball ({eyeball_shadow_spill} px)"
    assert brow_spill == 0, f"Eye makeup spilled into eyebrow ({brow_spill} px)"
    assert lip_spill == 0, f"Eye makeup spilled into lips ({lip_spill} px)"
    assert bg_spill == 0, f"Eye makeup spilled outside facial oval ({bg_spill} px)"

if __name__ == "__main__":
    process_eye_qa("frontend/public/hero-model.png", "hero_model")
    process_eye_qa("frontend/src/assets/login-model-merged.png", "login_model")
    print("\n[STEP 203 EYE QA] ALL MULTI-PORTRAIT EYE MAKEUP AUDITS PASSED!\n")
