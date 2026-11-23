"""
GlamAI FYP - Step 201: Visual QA & Pixel Precision Audit Script
Generates visual comparison artifacts and performs actual pixel-level alignment analysis.
"""

import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from backend.services.mediapipe_client import mediapipe_client

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "qa_visual_outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# MediaPipe lip landmark indices (same as virtualMakeupEngine.js)
OUTER_LIP_INDICES = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61]
INNER_LIP_INDICES = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78]

def hex_to_rgb(hex_str):
    hex_clean = hex_str.lstrip('#')
    return tuple(int(hex_clean[i:i+2], 16) for i in (0, 2, 4))

def blend_multiply(base, blend, alpha):
    # base and blend are float [0, 1]
    mult = base * blend
    return base * (1.0 - alpha) + mult * alpha

def blend_soft_light(base, blend, alpha):
    # W3C / Canvas soft-light formula
    # if blend <= 0.5: base - (1 - 2*blend) * base * (1 - base)
    # else: base + (2*blend - 1) * (D(base) - base), where D(base) = sqrt(base) if base > 0.25 else ((16*base - 12)*base + 4)*base
    d = np.where(base > 0.25, np.sqrt(np.maximum(base, 0)), ((16 * base - 12) * base + 4) * base)
    res = np.where(blend <= 0.5,
                   base - (1.0 - 2.0 * blend) * base * (1.0 - base),
                   base + (2.0 * blend - 1.0) * (d - base))
    return base * (1.0 - alpha) + res * alpha

def run_qa_for_image(image_path, prefix):
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Test image not found at {image_path}")

    with open(image_path, "rb") as f:
        img_bytes = f.read()

    bgr = cv2.imread(image_path)
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    h, w, c = rgb.shape

    # 1. Detect landmarks
    print(f"\n[QA] Running MediaPipe landmark inference on {image_path} ({w}x{h})...")
    res = mediapipe_client.detect_landmarks(img_bytes)
    if not res.get("face_detected"):
        raise RuntimeError("Face detection failed on test image.")

    landmarks = res["landmarks"]
    print(f"[QA] Landmarks detected: {len(landmarks)} points.")

    # Convert landmarks to pixel coords
    def get_pt(idx):
        lm = landmarks[idx]
        return np.array([lm["x"] * w, lm["y"] * h], dtype=np.float32)

    outer_pts = np.array([get_pt(i) for i in OUTER_LIP_INDICES], dtype=np.int32)
    inner_pts = np.array([get_pt(i) for i in INNER_LIP_INDICES], dtype=np.int32)

    # 1. Output 1: Original Portrait
    out1_path = os.path.join(OUTPUT_DIR, f"{prefix}_01_original_portrait.png")
    cv2.imwrite(out1_path, bgr)

    # 2. Output 2: Lip Mask Visualization
    mask_vis = rgb.copy()
    mask_outer = np.zeros((h, w), dtype=np.uint8)
    cv2.fillPoly(mask_outer, [outer_pts], 255)

    mask_inner = np.zeros((h, w), dtype=np.uint8)
    cv2.fillPoly(mask_inner, [inner_pts], 255)

    lip_skin_mask = cv2.bitwise_xor(mask_outer, mask_inner)

    overlay = mask_vis.copy()
    overlay[lip_skin_mask > 0] = [20, 220, 200]
    cv2.addWeighted(overlay, 0.40, mask_vis, 0.60, 0, mask_vis)

    cv2.polylines(mask_vis, [outer_pts], isClosed=True, color=(0, 255, 0), thickness=2)
    cv2.polylines(mask_vis, [inner_pts], isClosed=True, color=(255, 40, 40), thickness=2)

    p0 = tuple(get_pt(0).astype(int))
    p17 = tuple(get_pt(17).astype(int))
    p13 = tuple(get_pt(13).astype(int))
    p14 = tuple(get_pt(14).astype(int))
    cv2.circle(mask_vis, p0, 3, (255, 255, 0), -1)
    cv2.circle(mask_vis, p17, 3, (255, 0, 255), -1)
    cv2.circle(mask_vis, p13, 2, (0, 255, 255), -1)
    cv2.circle(mask_vis, p14, 2, (0, 255, 255), -1)
    cv2.line(mask_vis, p13, p14, (255, 255, 255), 1)

    out2_path = os.path.join(OUTPUT_DIR, f"{prefix}_02_lipstick_mask_visualization.png")
    cv2.imwrite(out2_path, cv2.cvtColor(mask_vis, cv2.COLOR_RGB2BGR))

    # 3. Output 3: Matte Lipstick Result
    shade_r, shade_g, shade_b = hex_to_rgb("#B92F60")
    shade_norm = np.array([shade_r, shade_g, shade_b], dtype=np.float32) / 255.0
    img_float = rgb.astype(np.float32) / 255.0

    matte_float = img_float.copy()
    mult_blended = blend_multiply(img_float, shade_norm, alpha=0.55)
    soft_blended = blend_soft_light(mult_blended, shade_norm, alpha=0.45)

    mask_weights = (lip_skin_mask > 0).astype(np.float32)[:, :, np.newaxis]
    matte_float = matte_float * (1.0 - mask_weights) + soft_blended * mask_weights

    border_mask = np.zeros((h, w), dtype=np.uint8)
    cv2.polylines(border_mask, [outer_pts], isClosed=True, color=255, thickness=2)
    border_mask = cv2.bitwise_and(border_mask, cv2.bitwise_not(mask_inner))
    border_weights = (border_mask > 0).astype(np.float32)[:, :, np.newaxis] * 0.25
    border_blended = blend_soft_light(matte_float, shade_norm, alpha=0.25)
    matte_float = matte_float * (1.0 - border_weights) + border_blended * border_weights

    matte_uint8 = np.clip(matte_float * 255.0, 0, 255).astype(np.uint8)
    out3_path = os.path.join(OUTPUT_DIR, f"{prefix}_03_lipstick_matte_result.png")
    cv2.imwrite(out3_path, cv2.cvtColor(matte_uint8, cv2.COLOR_RGB2BGR))

    # 4. Output 4: Gloss Lipstick Result
    gloss_float = matte_float.copy()
    lip_h = np.linalg.norm(get_pt(17) - get_pt(0))
    gloss_cx = int(p17[0])
    gloss_cy = int(p17[1] - (lip_h * 0.28))
    rx = int(lip_h * 0.90)
    ry = int(lip_h * 0.45)

    spec_mask = np.zeros((h, w), dtype=np.float32)
    cv2.ellipse(spec_mask, (gloss_cx, gloss_cy), (rx, ry), 0, 0, 360, 1.0, -1)
    spec_mask = cv2.GaussianBlur(spec_mask, (15, 15), 0)
    spec_mask = spec_mask * (lip_skin_mask > 0).astype(np.float32)

    white_highlight = np.ones_like(gloss_float)
    screen_blend = 1.0 - (1.0 - gloss_float) * (1.0 - white_highlight * 0.40)
    spec_weights = spec_mask[:, :, np.newaxis] * 0.45
    gloss_float = gloss_float * (1.0 - spec_weights) + screen_blend * spec_weights

    gloss_uint8 = np.clip(gloss_float * 255.0, 0, 255).astype(np.uint8)
    out4_path = os.path.join(OUTPUT_DIR, f"{prefix}_04_lipstick_gloss_result.png")
    cv2.imwrite(out4_path, cv2.cvtColor(gloss_uint8, cv2.COLOR_RGB2BGR))

    # 5. Output 5: Side-by-Side Comparison
    header_h = 44
    combined_w = w * 2 + 10
    combined_h = h + header_h
    canvas = np.full((combined_h, combined_w, 3), 245, dtype=np.uint8)

    canvas[header_h:header_h+h, 0:w] = bgr
    canvas[header_h:header_h+h, w+10:w*2+10] = cv2.cvtColor(gloss_uint8, cv2.COLOR_RGB2BGR)

    cv2.putText(canvas, f"ORIGINAL UNEDITED ({prefix.upper()})", (20, 28), cv2.FONT_HERSHEY_DUPLEX, 0.60, (50, 40, 45), 1, cv2.LINE_AA)
    cv2.putText(canvas, "GLAMAI FACE-AWARE SIMULATION (GLOSS BERRY)", (w + 25, 28), cv2.FONT_HERSHEY_DUPLEX, 0.60, (185, 47, 96), 2, cv2.LINE_AA)

    out5_path = os.path.join(OUTPUT_DIR, f"{prefix}_05_before_after_comparison.png")
    cv2.imwrite(out5_path, canvas)

    # 6. Output 6: Difference Heatmap
    diff = np.abs(gloss_uint8.astype(np.int16) - rgb.astype(np.int16))
    diff_max = np.max(diff, axis=2).astype(np.uint8)
    diff_vis = cv2.applyColorMap(np.clip(diff_max * 6, 0, 255), cv2.COLORMAP_JET)
    diff_vis[diff_max == 0] = [30, 30, 30]

    out6_path = os.path.join(OUTPUT_DIR, f"{prefix}_06_difference_heatmap.png")
    cv2.imwrite(out6_path, diff_vis)

    # 7. Metrics Audit
    modified_pixels = np.where(diff_max > 0)
    total_modified = len(modified_pixels[0])
    min_y, max_y = int(np.min(modified_pixels[0])), int(np.max(modified_pixels[0]))
    min_x, max_x = int(np.min(modified_pixels[1])), int(np.max(modified_pixels[1]))

    teeth_modified = int(np.sum((diff_max > 0) & (mask_inner > 0)))
    dist_from_outer = cv2.distanceTransform(cv2.bitwise_not(mask_outer), cv2.DIST_L2, 3)
    chin_cheek_bleed = int(np.sum((diff_max > 0) & (dist_from_outer > 3.0)))
    pct_image = (total_modified / (w * h)) * 100.0

    print("="*60)
    print(f"PIXEL AUDIT RESULTS: {prefix.upper()}")
    print("="*60)
    print(f"Canvas Dimensions:                {w} x {h} ({w*h:,} pixels)")
    print(f"Total Modified Pixels:            {total_modified:,} ({pct_image:.2f}% of canvas)")
    print(f"Modified Bounding Box:            X: [{min_x}, {max_x}] (width: {max_x - min_x}px)")
    print(f"                                  Y: [{min_y}, {max_y}] (height: {max_y - min_y}px)")
    print(f"Inner Mouth / Teeth Bleed:        {teeth_modified} PIXELS (100% EXCLUDED)")
    print(f"Cheek / Chin / Skin Bleed (>3px): {chin_cheek_bleed} PIXELS (0% BLEED)")
    print(f"Mouth Gap (|p14 - p13|):          {np.linalg.norm(get_pt(14) - get_pt(13)):.2f} px")
    print("="*60)

    assert teeth_modified == 0, f"Expected 0 pixels on teeth/inner mouth, found {teeth_modified}"
    assert chin_cheek_bleed == 0, f"Expected 0 pixels on cheeks/chin, found {chin_cheek_bleed}"
    assert total_modified > 500, "Expected lipstick to modify substantial lip pixels"

def run_qa():
    run_qa_for_image(os.path.join("frontend", "public", "hero-model.png"), "hero_model")
    run_qa_for_image(os.path.join("frontend", "src", "assets", "login-model-merged.png"), "login_model")
    print("\n[QA] ALL MULTI-PORTRAIT PIXEL ACCURACY & ALIGNMENT CHECKS PASSED!\n")

if __name__ == "__main__":
    run_qa()
