"""
GlamAI FYP - Step 202: Visual QA & Pixel Alignment Audit for Face-Aware Blush Simulation
Validates bilateral cheek placement, eye/lip/background exclusion, and combined lipstick+blush rendering.
"""

import os
import cv2
import numpy as np
from backend.services.mediapipe_client import mediapipe_client

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "qa_visual_outputs", "step202_blush")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# MediaPipe Indices
LIP_OUTER_INDICES = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61]
LIP_INNER_INDICES = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78]

LEFT_EYE_INDICES = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7]
RIGHT_EYE_INDICES = [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249]

FACE_OVAL_INDICES = [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379,
    378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127,
    162, 21, 54, 103, 67, 109, 10
]

def hex_to_rgb(hex_str):
    clean = hex_str.lstrip('#')
    return tuple(int(clean[i:i+2], 16) for i in (0, 2, 4))

def blend_soft_light(base, blend, alpha):
    # W3C Soft-light formula for float [0, 1]
    d = np.where(base > 0.25, np.sqrt(np.maximum(base, 0)), ((16 * base - 12) * base + 4) * base)
    res = np.where(blend <= 0.5,
                   base - (1.0 - 2.0 * blend) * base * (1.0 - base),
                   base + (2.0 * blend - 1.0) * (d - base))
    return base * (1.0 - alpha) + res * alpha

def blend_multiply(base, blend, alpha):
    mult = base * blend
    return base * (1.0 - alpha) + mult * alpha

def render_face_aware_blush(rgb, landmarks, blush_hex="#D37D64", opacity=0.55, finish="Satin"):
    h, w = rgb.shape[:2]
    def pt(i):
        lm = landmarks[i]
        return np.array([lm["x"] * w, lm["y"] * h], dtype=np.float32)

    p205 = pt(205); p50 = pt(50); p234 = pt(234); p98 = pt(98); p145 = pt(145); p61 = pt(61)
    p425 = pt(425); p280 = pt(280); p454 = pt(454); p327 = pt(327); p374 = pt(374); p291 = pt(291)

    # Left cheek
    span_l = np.linalg.norm(p234 - p98)
    vert_l = np.linalg.norm(p61 - p145)
    angle_l = np.degrees(np.arctan2(p234[1] - p98[1], p234[0] - p98[0]))
    center_l = (p205 * 0.65 + p50 * 0.35)
    rx_l = max(12.0, min(w * 0.20, span_l * 0.38))
    ry_l = max(10.0, min(h * 0.16, vert_l * 0.30))

    # Right cheek
    span_r = np.linalg.norm(p454 - p327)
    vert_r = np.linalg.norm(p291 - p374)
    angle_r = np.degrees(np.arctan2(p454[1] - p327[1], p454[0] - p327[0]))
    center_r = (p425 * 0.65 + p280 * 0.35)
    rx_r = max(12.0, min(w * 0.20, span_r * 0.38))
    ry_r = max(10.0, min(h * 0.16, vert_r * 0.30))

    # Construct anatomical clipping mask: Face Oval - (Left Eye + Right Eye + Lips)
    mask_oval = np.zeros((h, w), dtype=np.uint8)
    oval_pts = np.array([pt(i) for i in FACE_OVAL_INDICES], dtype=np.int32)
    cv2.fillPoly(mask_oval, [oval_pts], 255)

    mask_excl = np.zeros((h, w), dtype=np.uint8)
    eye_l_pts = np.array([pt(i) for i in LEFT_EYE_INDICES], dtype=np.int32)
    eye_r_pts = np.array([pt(i) for i in RIGHT_EYE_INDICES], dtype=np.int32)
    lip_pts = np.array([pt(i) for i in LIP_OUTER_INDICES], dtype=np.int32)

    cv2.fillPoly(mask_excl, [eye_l_pts], 255)
    cv2.fillPoly(mask_excl, [eye_r_pts], 255)
    cv2.fillPoly(mask_excl, [lip_pts], 255)

    valid_skin_mask = cv2.bitwise_and(mask_oval, cv2.bitwise_not(mask_excl))

    # Compute continuous radial gradient field for left and right cheeks
    # Using Gaussian falloff to match Canvas radial gradient cubic stops
    Y, X = np.ogrid[:h, :w]
    
    def cheek_weight(center, rx, ry, deg_angle):
        rad = np.radians(deg_angle)
        cos_a, sin_a = np.cos(rad), np.sin(rad)
        dx = X - center[0]
        dy = Y - center[1]
        x_rot = cos_a * dx + sin_a * dy
        y_rot = -sin_a * dx + cos_a * dy
        norm_dist = np.sqrt((x_rot / rx)**2 + (y_rot / ry)**2)
        # Smooth cubic falloff: (1 - d^2)^2 for d < 1
        w = np.clip(1.0 - norm_dist, 0.0, 1.0)
        return (w ** 2)

    weight_l = cheek_weight(center_l, rx_l, ry_l, angle_l)
    weight_r = cheek_weight(center_r, rx_r, ry_r, angle_r)
    combined_weight = np.maximum(weight_l, weight_r)

    # Restrict strictly to valid skin mask
    combined_weight = combined_weight * (valid_skin_mask > 0).astype(np.float32)

    # Blend
    rgb_float = rgb.astype(np.float32) / 255.0
    r_val, g_val, b_val = hex_to_rgb(blush_hex)
    shade_norm = np.array([r_val, g_val, b_val], dtype=np.float32) / 255.0

    effective_alpha = min(0.85, max(0.15, opacity * 0.72))
    soft_blended = blend_soft_light(rgb_float, shade_norm, alpha=effective_alpha)

    weights_3d = combined_weight[:, :, np.newaxis]
    result_float = rgb_float * (1.0 - weights_3d) + soft_blended * weights_3d

    # Luminous sheen for radiant finishes
    if "luminous" in finish.lower() or "dewy" in finish.lower() or "glow" in finish.lower():
        glow_l = cheek_weight(center_l, rx_l * 0.50, ry_l * 0.50, angle_l)
        glow_r = cheek_weight(center_r, rx_r * 0.50, ry_r * 0.50, angle_r)
        glow_weights = np.maximum(glow_l, glow_r) * (valid_skin_mask > 0).astype(np.float32)
        white_high = np.ones_like(result_float)
        screen_blend = 1.0 - (1.0 - result_float) * (1.0 - white_high * 0.25)
        gw_3d = (glow_weights * 0.35)[:, :, np.newaxis]
        result_float = result_float * (1.0 - gw_3d) + screen_blend * gw_3d

    result_uint8 = np.clip(result_float * 255.0, 0, 255).astype(np.uint8)
    return result_uint8, {
        "center_left": center_l, "rx_left": rx_l, "ry_left": ry_l, "angle_left": angle_l, "span_left": span_l,
        "center_right": center_r, "rx_right": rx_r, "ry_right": ry_r, "angle_right": angle_r, "span_right": span_r,
        "mask_oval": mask_oval, "mask_excl": mask_excl, "valid_skin_mask": valid_skin_mask, "combined_weight": combined_weight
    }

def render_face_aware_lipstick(rgb, landmarks, lip_hex="#B92F60", opacity=0.65, finish="Satin"):
    h, w = rgb.shape[:2]
    def pt(i): return np.array([landmarks[i]["x"] * w, landmarks[i]["y"] * h], dtype=np.float32)
    outer_pts = np.array([pt(i) for i in LIP_OUTER_INDICES], dtype=np.int32)
    inner_pts = np.array([pt(i) for i in LIP_INNER_INDICES], dtype=np.int32)

    mask_outer = np.zeros((h, w), dtype=np.uint8)
    cv2.fillPoly(mask_outer, [outer_pts], 255)
    mask_inner = np.zeros((h, w), dtype=np.uint8)
    cv2.fillPoly(mask_inner, [inner_pts], 255)

    lip_skin_mask = cv2.bitwise_xor(mask_outer, mask_inner)

    r, g, b = hex_to_rgb(lip_hex)
    shade_norm = np.array([r, g, b], dtype=np.float32) / 255.0
    img_float = rgb.astype(np.float32) / 255.0

    mult_blended = blend_multiply(img_float, shade_norm, alpha=0.55)
    soft_blended = blend_soft_light(mult_blended, shade_norm, alpha=0.45)

    mask_weights = (lip_skin_mask > 0).astype(np.float32)[:, :, np.newaxis]
    res_float = img_float * (1.0 - mask_weights) + soft_blended * mask_weights

    # Feathered border excluding mouth cavity
    border_mask = np.zeros((h, w), dtype=np.uint8)
    cv2.polylines(border_mask, [outer_pts], isClosed=True, color=255, thickness=2)
    border_mask = cv2.bitwise_and(border_mask, cv2.bitwise_not(mask_inner))
    border_weights = (border_mask > 0).astype(np.float32)[:, :, np.newaxis] * 0.25
    border_blended = blend_soft_light(res_float, shade_norm, alpha=0.25)
    res_float = res_float * (1.0 - border_weights) + border_blended * border_weights

    return np.clip(res_float * 255.0, 0, 255).astype(np.uint8)

def run_qa_for_image(image_path, prefix):
    print(f"\n[STEP 202 QA] Processing portrait: {image_path} ({prefix})...")
    with open(image_path, "rb") as f:
        img_bytes = f.read()

    bgr = cv2.imread(image_path)
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    h, w = rgb.shape[:2]

    res = mediapipe_client.detect_landmarks(img_bytes)
    assert res.get("face_detected"), "Face detection failed"
    landmarks = res["landmarks"]

    # 1. Output 1: Original Portrait
    out1_path = os.path.join(OUTPUT_DIR, f"{prefix}_01_original_portrait.png")
    cv2.imwrite(out1_path, bgr)

    # 2. Render Blush Simulation
    blush_rgb, blush_meta = render_face_aware_blush(rgb, landmarks, blush_hex="#D37D64", opacity=0.55, finish="Satin")

    # 3. Output 2: Cheek Placement & Anatomical Safety Visualization
    vis = rgb.copy()
    def pt(i): return tuple(np.array([landmarks[i]["x"] * w, landmarks[i]["y"] * h], dtype=np.int32))

    # Draw Face Oval (green)
    oval_pts = np.array([pt(i) for i in FACE_OVAL_INDICES], dtype=np.int32)
    cv2.polylines(vis, [oval_pts], isClosed=True, color=(50, 220, 50), thickness=2)

    # Draw Eye and Lip exclusions (red)
    eye_l_pts = np.array([pt(i) for i in LEFT_EYE_INDICES], dtype=np.int32)
    eye_r_pts = np.array([pt(i) for i in RIGHT_EYE_INDICES], dtype=np.int32)
    lip_pts = np.array([pt(i) for i in LIP_OUTER_INDICES], dtype=np.int32)
    cv2.polylines(vis, [eye_l_pts], isClosed=True, color=(255, 30, 30), thickness=2)
    cv2.polylines(vis, [eye_r_pts], isClosed=True, color=(255, 30, 30), thickness=2)
    cv2.polylines(vis, [lip_pts], isClosed=True, color=(255, 30, 30), thickness=2)

    # Draw Cheek Centers (205 left, 425 right) (yellow)
    c_l = tuple(blush_meta["center_left"].astype(int))
    c_r = tuple(blush_meta["center_right"].astype(int))
    cv2.circle(vis, c_l, 4, (255, 255, 0), -1)
    cv2.circle(vis, c_r, 4, (255, 255, 0), -1)

    # Draw Zygomatic Sweep Axes (cyan)
    p234 = pt(234); p98 = pt(98); p454 = pt(454); p327 = pt(327)
    cv2.line(vis, p98, p234, (0, 240, 255), 2)
    cv2.line(vis, p327, p454, (0, 240, 255), 2)

    # Draw oriented cheek blush ellipses (magenta)
    cv2.ellipse(vis, c_l, (int(blush_meta["rx_left"]), int(blush_meta["ry_left"])),
                int(blush_meta["angle_left"]), 0, 360, (255, 0, 255), 2)
    cv2.ellipse(vis, c_r, (int(blush_meta["rx_right"]), int(blush_meta["ry_right"])),
                int(blush_meta["angle_right"]), 0, 360, (255, 0, 255), 2)

    out2_path = os.path.join(OUTPUT_DIR, f"{prefix}_02_cheek_placement_visualization.png")
    cv2.imwrite(out2_path, cv2.cvtColor(vis, cv2.COLOR_RGB2BGR))

    # 4. Output 3: Blush-Only Simulation
    out3_path = os.path.join(OUTPUT_DIR, f"{prefix}_03_blush_only_simulation.png")
    cv2.imwrite(out3_path, cv2.cvtColor(blush_rgb, cv2.COLOR_RGB2BGR))

    # 5. Output 4: Lipstick + Blush Combined Simulation
    # Coexistence check: apply blush first, then apply lipstick on the blushed image
    combined_rgb = render_face_aware_lipstick(blush_rgb, landmarks, lip_hex="#B92F60", opacity=0.65, finish="Satin")
    out4_path = os.path.join(OUTPUT_DIR, f"{prefix}_04_lipstick_and_blush_simulation.png")
    cv2.imwrite(out4_path, cv2.cvtColor(combined_rgb, cv2.COLOR_RGB2BGR))

    # 6. Output 5: Before / After Side-by-Side Comparison
    header_h = 44
    comp_w = w * 2 + 10
    comp_h = h + header_h
    comp = np.full((comp_h, comp_w, 3), 245, dtype=np.uint8)
    comp[header_h:header_h+h, 0:w] = bgr
    comp[header_h:header_h+h, w+10:w*2+10] = cv2.cvtColor(combined_rgb, cv2.COLOR_RGB2BGR)

    cv2.putText(comp, f"ORIGINAL UNEDITED ({prefix.upper()})", (20, 28), cv2.FONT_HERSHEY_DUPLEX, 0.60, (50, 40, 45), 1, cv2.LINE_AA)
    cv2.putText(comp, "FACE-AWARE BLUSH + LIPSTICK SIMULATION", (w + 25, 28), cv2.FONT_HERSHEY_DUPLEX, 0.60, (185, 47, 96), 2, cv2.LINE_AA)
    out5_path = os.path.join(OUTPUT_DIR, f"{prefix}_05_before_after_comparison.png")
    cv2.imwrite(out5_path, comp)

    # 7. Output 6: Difference Heatmap for Blush
    diff_blush = np.max(np.abs(blush_rgb.astype(np.int16) - rgb.astype(np.int16)), axis=2).astype(np.uint8)
    diff_vis = cv2.applyColorMap(np.clip(diff_blush * 8, 0, 255), cv2.COLORMAP_JET)
    diff_vis[diff_blush == 0] = [30, 30, 30]
    out6_path = os.path.join(OUTPUT_DIR, f"{prefix}_06_blush_difference_heatmap.png")
    cv2.imwrite(out6_path, diff_vis)

    # 8. Quantitative Pixel-Level Alignment & Containment Audit
    modified_mask = (diff_blush > 0)
    total_modified = int(np.sum(modified_mask))

    # Check spill on Eye regions:
    eye_spill = int(np.sum(modified_mask & (blush_meta["mask_excl"] > 0) & (cv2.bitwise_or(
        cv2.fillPoly(np.zeros((h, w), dtype=np.uint8), [eye_l_pts], 255),
        cv2.fillPoly(np.zeros((h, w), dtype=np.uint8), [eye_r_pts], 255)
    ) > 0)))

    # Check spill on Lips region:
    lip_spill = int(np.sum(modified_mask & (cv2.fillPoly(np.zeros((h, w), dtype=np.uint8), [lip_pts], 255) > 0)))

    # Check spill outside Face Oval (hair/background):
    bg_spill = int(np.sum(modified_mask & (blush_meta["mask_oval"] == 0)))

    # Bilateral check: verify both left cheek and right cheek were modified
    mid_x = (blush_meta["center_left"][0] + blush_meta["center_right"][0]) / 2.0
    left_modified = int(np.sum(modified_mask[:, :int(mid_x)]))
    right_modified = int(np.sum(modified_mask[:, int(mid_x):]))

    pct_canvas = (total_modified / (w * h)) * 100.0

    print("="*60)
    print(f"STEP 202 PIXEL AUDIT RESULTS: {prefix.upper()}")
    print("="*60)
    print(f"Canvas Resolution:                {w} x {h} ({w*h:,} px)")
    print(f"Total Blush Pixels Modified:      {total_modified:,} ({pct_canvas:.2f}% of canvas)")
    print(f"Left Cheek Modified Pixels:       {left_modified:,} (Radius Rx={blush_meta['rx_left']:.1f}px)")
    print(f"Right Cheek Modified Pixels:      {right_modified:,} (Radius Rx={blush_meta['rx_right']:.1f}px)")
    print(f"Perspective Compression Ratio:    {blush_meta['span_left'] / blush_meta['span_right']:.2f}x (Left vs Right)")
    print(f"Eye Spill:                        {eye_spill} PIXELS (100% EXCLUDED)")
    print(f"Lip Spill:                        {lip_spill} PIXELS (100% EXCLUDED)")
    print(f"Hair / Background Spill:          {bg_spill} PIXELS (100% EXCLUDED)")
    print("="*60)

    assert eye_spill == 0, f"Expected 0 pixels in eyes, found {eye_spill}"
    assert lip_spill == 0, f"Expected 0 pixels in lips, found {lip_spill}"
    assert bg_spill == 0, f"Expected 0 pixels in background/hair, found {bg_spill}"
    assert left_modified > 200, "Left cheek must receive blush"
    assert right_modified > 200, "Right cheek must receive blush"

def run_suite():
    run_qa_for_image("frontend/public/hero-model.png", "hero_model")
    run_qa_for_image("frontend/src/assets/login-model-merged.png", "login_model")
    print("\n[STEP 202 QA] ALL MULTI-PORTRAIT BLUSH AUDIT CHECKS PASSED!\n")

if __name__ == "__main__":
    run_suite()
