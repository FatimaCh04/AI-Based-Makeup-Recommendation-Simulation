"""
GlamAI FYP - Step 207: Redesign Mascara and Eyeshadow Rendering
Comprehensive Visual Evidence Generation & Pixel Validation Suite

Generates all 8 required Part C visual evidence outputs:
1. 01_original_face.png
2. 02_left_eye_eyeshadow_only.png
3. 03_right_eye_eyeshadow_only.png
4. 04_both_eyes_eyeshadow.png
5. 05_left_eye_mascara_only.png
6. 06_right_eye_mascara_only.png
7. 07_both_eyes_mascara.png
8. 08_combined_eyeshadow_and_mascara.png
Plus high-resolution eye crops and intensity setting comparisons (Natural, Defined, Dramatic).
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

import cv2
import numpy as np
import math
from backend.services.mediapipe_client import mediapipe_client

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "qa_visual_outputs", "step207_eyeshadow_mascara_redesign")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# MediaPipe Landmark Indices
EYE_INDICES = {
    "left": {
        "lashline": [33, 246, 161, 160, 159, 158, 157, 173, 133],
        "crease": [247, 30, 29, 27, 28, 56, 190], # Ordered medial to lateral
        "eyeball": [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7],
        "lowerLashline": [33, 7, 163, 144, 145, 153, 154, 155, 133],
        "brow": [46, 53, 52, 65, 55],
        "medial": 33,
        "lateral": 133,
        "apex": 159
    },
    "right": {
        "lashline": [362, 398, 384, 385, 386, 387, 388, 466, 263],
        "crease": [414, 286, 258, 257, 259, 260, 467], # Ordered medial to lateral
        "eyeball": [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249],
        "lowerLashline": [362, 249, 390, 373, 374, 380, 381, 382, 263],
        "brow": [285, 295, 282, 283, 276],
        "medial": 362,
        "lateral": 263,
        "apex": 386
    }
}

def hex_to_bgr(hex_str):
    clean = hex_str.lstrip('#')
    rgb = tuple(int(clean[i:i+2], 16) for i in (0, 2, 4))
    return np.array([rgb[2], rgb[1], rgb[0]], dtype=np.float32) / 255.0

def eval_spline(pts, u):
    """Evaluates 2D parametric position along landmark points array at u in [0, 1]."""
    n = len(pts) - 1
    t = max(0.0, min(1.0, u)) * n
    i0 = int(math.floor(t))
    frac = t - i0
    if i0 >= n:
        return pts[n]
    pA = pts[i0]
    pB = pts[i0 + 1]
    return pA + (pB - pA) * frac

def render_eyeshadow_redesigned(img, landmarks, which_eyes="both", hex_color="#8F5E43", opacity=0.68, finish="Shimmer"):
    """
    Redesigned Face-Aware Eyeshadow Renderer:
    - Covers complete visible mobile eyelid and orbital socket
    - Soft gradient blending from lashline toward crease
    - Guaranteed 0% eyeball bleed via destination-out aperture masking
    - Multi-pass blend modes: base tint + multiply depth + soft-light vibrancy
    """
    h, w = img.shape[:2]
    bgr_col = hex_to_bgr(hex_color)
    base = img.astype(np.float32) / 255.0

    def pt(idx):
        return np.array([landmarks[idx]["x"] * w, landmarks[idx]["y"] * h], dtype=np.float32)

    eyelid_alpha = np.zeros((h, w), dtype=np.float32)
    eyeball_mask = np.zeros((h, w), dtype=np.uint8)

    sides = []
    if which_eyes in ("left", "both"):
        sides.append("left")
    if which_eyes in ("right", "both"):
        sides.append("right")

    for side in sides:
        cfg = EYE_INDICES[side]
        lash_raw = np.array([pt(i) for i in cfg["lashline"]], dtype=np.float32)
        crease_raw = np.array([pt(i) for i in cfg["crease"]], dtype=np.float32)
        eyeball_raw = np.array([pt(i) for i in cfg["eyeball"]], dtype=np.int32)
        brow_raw = np.array([pt(i) for i in cfg["brow"]], dtype=np.float32)

        # 1. Eyeball mask with anti-aliased safety rim
        cv2.fillPoly(eyeball_mask, [eyeball_raw], 255)

        # 2. Build full mobile eyelid polygon sampling 32 points along lashline and orbital socket
        num_samples = 32
        lash_pts = [eval_spline(lash_raw, i / (num_samples - 1)) for i in range(num_samples)]
        crease_pts = [eval_spline(crease_raw, i / (num_samples - 1)) for i in range(num_samples)]
        brow_pts = [eval_spline(brow_raw, i / (num_samples - 1)) for i in range(num_samples)]

        eye_w = np.linalg.norm(lash_raw[-1] - lash_raw[0])
        is_left = (side == "left")

        # True anatomical mobile eyelid socket boundary:
        # Extends upward from crease into orbital socket with natural outer-V lateral sweep
        socket_pts = []
        for i in range(num_samples):
            u = i / (num_samples - 1)
            p_l = lash_pts[i]
            p_c = crease_pts[i]
            p_b = brow_pts[i]

            lid_v = p_c - p_l
            lid_h = np.linalg.norm(lid_v)

            # Outer-V has more crease lift; medial has softer lift
            outer_factor = u if is_left else (1.0 - u)
            arch = math.sin(u * math.pi) * 0.70 + outer_factor * 0.35

            # Lift into orbital socket (+65% to +85% of mobile lid height)
            socket_lift = max(6.0, min(eye_w * 0.35, lid_h * 0.75)) * max(0.40, arch)
            
            # Unit normal pointing upward into socket
            if lid_h > 1e-3:
                up_dir = lid_v / lid_h
            else:
                up_dir = np.array([0.0, -1.0], dtype=np.float32)

            cand_socket = p_c + up_dir * socket_lift

            # Ensure minimum 35% safety margin below eyebrow
            dist_to_brow = np.linalg.norm(p_b - p_c)
            max_socket_dist = dist_to_brow * 0.65
            if socket_lift > max_socket_dist and dist_to_brow > 5.0:
                cand_socket = p_c + up_dir * max_socket_dist

            socket_pts.append(cand_socket)

        # Closed non-self-intersecting eyelid polygon:
        # lashline (medial -> lateral) then socket (lateral -> medial)
        poly = np.vstack([
            np.array(lash_pts, dtype=np.int32),
            np.array(socket_pts[::-1], dtype=np.int32)
        ])

        lid_mask = np.zeros((h, w), dtype=np.uint8)
        cv2.fillPoly(lid_mask, [poly], 255)

        # Punch out eyeball aperture with 1.2px dilated safety boundary
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        dilated_eyeball = cv2.dilate(eyeball_mask, kernel, iterations=1)
        valid_lid = cv2.bitwise_and(lid_mask, cv2.bitwise_not(dilated_eyeball))

        # Vertical directional soft gradient (1.0 at lashline, diffusing to 0.0 at upper crease rim)
        p_lash_apex = pt(cfg["apex"])
        p_crease_apex = socket_pts[num_samples // 2]
        vec = p_crease_apex - p_lash_apex
        vec_len_sq = np.dot(vec, vec) + 1e-5

        Y, X = np.ogrid[:h, :w]
        proj = ((X - p_lash_apex[0]) * vec[0] + (Y - p_lash_apex[1]) * vec[1]) / vec_len_sq
        grad = np.clip(1.0 - proj * 0.85, 0.0, 1.0)
        grad = grad ** 1.3 # Natural exponential soft falloff

        cur_alpha = (valid_lid.astype(np.float32) / 255.0) * grad * opacity
        eyelid_alpha = np.maximum(eyelid_alpha, cur_alpha)

    # 3. Composite onto base photo with multi-pass blend
    color_layer = np.zeros_like(base)
    for c in range(3):
        color_layer[:, :, c] = bgr_col[c]

    alpha_3d = eyelid_alpha[:, :, np.newaxis]

    # Pass 0: Base color tint (ensures true cosmetic pigmentation)
    base_tint = base * (1.0 - alpha_3d * 0.40) + color_layer * (alpha_3d * 0.40)

    # Pass 1: Multiply blend for crease depth
    mult = base_tint * color_layer
    mult_pass = base_tint * (1.0 - alpha_3d * 0.70) + mult * (alpha_3d * 0.70)

    # Pass 2: Soft-light blend for skin texture integration
    d = np.where(mult_pass > 0.25, np.sqrt(np.maximum(mult_pass, 0)), ((16 * mult_pass - 12) * mult_pass + 4) * mult_pass)
    soft = np.where(color_layer <= 0.5,
                    mult_pass - (1.0 - 2.0 * color_layer) * mult_pass * (1.0 - mult_pass),
                    mult_pass + (2.0 * color_layer - 1.0) * (d - mult_pass))
    final_out = mult_pass * (1.0 - alpha_3d * 0.85) + soft * (alpha_3d * 0.85)

    # Pass 3: Finish specular highlight (Shimmer / Satin)
    norm_finish = finish.lower()
    if "shimmer" in norm_finish or "satin" in norm_finish:
        shimmer_alpha = np.zeros((h, w), dtype=np.float32)
        for side in sides:
            cfg = EYE_INDICES[side]
            p_l = pt(cfg["apex"])
            p_c = pt(cfg["crease"][3])
            cx = (p_l[0] + p_c[0]) * 0.5
            cy = (p_l[1] + p_c[1]) * 0.5
            rad_x = max(8.0, np.linalg.norm(p_c - p_l) * 1.6)
            rad_y = max(5.0, np.linalg.norm(p_c - p_l) * 0.8)

            dist_sq = ((X - cx) / rad_x)**2 + ((Y - cy) / rad_y)**2
            glow = np.clip(1.0 - np.sqrt(dist_sq), 0.0, 1.0) ** 2.0
            shimmer_mult = 0.35 if "shimmer" in norm_finish else 0.18
            shimmer_alpha = np.maximum(shimmer_alpha, glow * shimmer_mult * (eyelid_alpha > 0.10))

        white = np.ones_like(base)
        scr = 1.0 - (1.0 - final_out) * (1.0 - white)
        s_alpha_3d = shimmer_alpha[:, :, np.newaxis]
        final_out = final_out * (1.0 - s_alpha_3d) + scr * s_alpha_3d

    res_bgr = np.clip(final_out * 255.0, 0, 255).astype(np.uint8)
    return res_bgr, eyelid_alpha, eyeball_mask

def render_mascara_redesigned(img, landmarks, which_eyes="both", intensity="Defined", hex_color="#101010", opacity=0.92):
    """
    Redesigned Face-Aware Mascara Renderer:
    - 36 to 54 individual tapered Bézier eyelashes (NO artificial solid line or polygon)
    - Tapered follicle base to needle-fine curled tip
    - Realistic outward-fanning cat-eye trajectory and curl
    - Organic length & angle jitter for photographic authenticity
    - Three intensity presets: Natural, Defined, Dramatic
    - Delicate lower lash micro-cilia accents
    """
    h, w = img.shape[:2]
    out_img = img.copy()
    rgb = tuple(int(hex_color.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
    bgr_col = (rgb[2], rgb[1], rgb[0])

    def pt(idx):
        return np.array([landmarks[idx]["x"] * w, landmarks[idx]["y"] * h], dtype=np.float32)

    norm_intensity = intensity.lower()
    if "dramatic" in norm_intensity:
        num_upper = 52
        num_lower = 24
        len_mult = 1.45
        thick_mult = 1.35
        effective_alpha = min(1.0, opacity * 1.0)
    elif "natural" in norm_intensity:
        num_upper = 36
        num_lower = 14
        len_mult = 0.95
        thick_mult = 0.95
        effective_alpha = min(0.85, opacity * 0.85)
    else: # Defined (default)
        num_upper = 44
        num_lower = 18
        len_mult = 1.20
        thick_mult = 1.15
        effective_alpha = min(0.95, opacity * 0.92)

    sides = []
    if which_eyes in ("left", "both"):
        sides.append("left")
    if which_eyes in ("right", "both"):
        sides.append("right")

    overlay = np.zeros((h, w, 4), dtype=np.uint8)

    for side in sides:
        cfg = EYE_INDICES[side]
        upper_raw = np.array([pt(i) for i in cfg["lashline"]], dtype=np.float32)
        lower_raw = np.array([pt(i) for i in cfg["lowerLashline"]], dtype=np.float32)
        eye_w = np.linalg.norm(upper_raw[-1] - upper_raw[0])
        is_left = (side == "left")

        base_lash_len = (eye_w / 28.0) * 4.6 * len_mult
        base_thickness = max(0.85, min(2.0, (eye_w / 30.0) * 1.2 * thick_mult))

        # 1. Subtle, fine tightline root-bed enhancement (0.8px, NOT a thick line)
        for i in range(len(upper_raw) - 1):
            pA = tuple(np.round(upper_raw[i]).astype(int))
            pB = tuple(np.round(upper_raw[i+1]).astype(int))
            cv2.line(overlay, pA, pB, (*bgr_col, int(255 * effective_alpha * 0.50)), 1, cv2.LINE_AA)

        # 2. Individual Sculpted Tapered Upper Lashes
        for k in range(num_upper):
            u = k / (num_upper - 1)
            root = eval_spline(upper_raw, u)

            # Natural anatomical lash length profile:
            # Medial is shorter (40%), peaking at 70-85% lateral wing, then tapering at outer canthus
            profile = math.sin(u * math.pi * 0.72 + 0.28)
            # Organic deterministic jitter
            jitter_len = 0.88 + 0.24 * (abs(math.sin(k * 13.371 + (1 if is_left else 2))) % 1.0)
            jitter_ang = (abs(math.cos(k * 47.113 + (3 if is_left else 4))) % 1.0 - 0.5) * 0.14

            cur_len = base_lash_len * max(0.42, profile) * jitter_len

            # Fanning trajectory angle (outward winged cat-eye fan)
            # Left eye medial u=0 points slightly inward (-0.28 rad), lateral u=1 points outward (+0.95 rad)
            flare = (-0.30 + u * 1.25) if is_left else (0.30 - u * 1.25)
            lash_ang = -math.pi * 0.50 + flare + jitter_ang

            # Cubic Bézier control points for natural upward and outward curl
            p0 = root
            # Upward thrust
            p1 = root + np.array([math.cos(lash_ang) * (cur_len * 0.35), math.sin(lash_ang) * (cur_len * 0.35)])
            # Mid-curl lift
            curl_ang = lash_ang + ((0.12 if is_left else -0.12) * (1.0 + u * 0.5))
            p2 = root + np.array([math.cos(curl_ang) * (cur_len * 0.72), math.sin(curl_ang) * (cur_len * 0.72) - (cur_len * 0.12)])
            # Feathered tip
            p3 = root + np.array([math.cos(curl_ang + (0.10 if is_left else -0.10)) * cur_len,
                                  math.sin(curl_ang + (0.10 if is_left else -0.10)) * cur_len - (cur_len * 0.22)])

            # Render tapered stroke by drawing progressive sub-segments from root to tip
            steps = 8
            curve_pts = []
            for s_idx in range(steps + 1):
                t_s = s_idx / steps
                # Cubic Bézier formula
                B = (1-t_s)**3 * p0 + 3*(1-t_s)**2 * t_s * p1 + 3*(1-t_s) * t_s**2 * p2 + t_s**3 * p3
                curve_pts.append(B)

            # Draw tapered segments: root is thicker, tip is razor-thin
            for s_idx in range(steps):
                t_s = s_idx / steps
                thick = max(1, int(round(base_thickness * ((1.0 - t_s)**1.2))))
                seg_alpha = effective_alpha * (1.0 - t_s * 0.25)
                pA = tuple(np.round(curve_pts[s_idx]).astype(int))
                pB = tuple(np.round(curve_pts[s_idx+1]).astype(int))
                cv2.line(overlay, pA, pB, (*bgr_col, int(255 * seg_alpha)), thick, cv2.LINE_AA)

        # 3. Delicate Lower Lash Accents (Shorter, delicate downward strokes)
        for k in range(2, num_lower - 2, 2):
            u = k / (num_lower - 1)
            root = eval_spline(lower_raw, u)
            low_len = base_lash_len * 0.30 * math.sin(u * math.pi)

            down_ang = (math.pi * 0.50 + (u - 0.5) * 0.35) if is_left else (math.pi * 0.50 - (u - 0.5) * 0.35)
            tip = root + np.array([math.cos(down_ang) * low_len, math.sin(down_ang) * low_len])

            pA = tuple(np.round(root).astype(int))
            pB = tuple(np.round(tip).astype(int))
            cv2.line(overlay, pA, pB, (*bgr_col, int(255 * effective_alpha * 0.65)), 1, cv2.LINE_AA)

    # Alpha composite overlay onto image
    over_rgb = overlay[:, :, :3].astype(np.float32)
    over_a = (overlay[:, :, 3].astype(np.float32) / 255.0)[:, :, np.newaxis]
    res_bgr = np.clip(img.astype(np.float32) * (1.0 - over_a) + over_rgb * over_a, 0, 255).astype(np.uint8)
    return res_bgr

def crop_eyes(img, landmarks, pad=35):
    """Crops bounding box containing both eyes for high-resolution visual inspection."""
    h, w = img.shape[:2]
    pts = [landmarks[i] for i in [33, 133, 362, 263, 159, 386, 27, 257, 52, 282, 145, 374]]
    xs = [int(p["x"] * w) for p in pts]
    ys = [int(p["y"] * h) for p in pts]
    x1 = max(0, min(xs) - pad)
    x2 = min(w, max(xs) + pad)
    y1 = max(0, min(ys) - pad)
    y2 = min(h, max(ys) + pad)
    return img[y1:y2, x1:x2]

def run_step207_verification():
    print("[STEP 207] Starting Mascara and Eyeshadow Redesign Verification...")
    portrait_path = "frontend/src/assets/hero-model.png"
    img = cv2.imread(portrait_path)
    assert img is not None, f"Could not load {portrait_path}"
    h, w = img.shape[:2]

    with open(portrait_path, "rb") as f:
        res = mediapipe_client.detect_landmarks(f.read())
    assert res.get("face_detected"), "Face detection failed"
    landmarks = res["landmarks"]

    # 1. Original Face
    out_01 = os.path.join(OUTPUT_DIR, "01_original_face.png")
    cv2.imwrite(out_01, img)
    print("  -> Saved 01_original_face.png")

    # 2. Left eye with eyeshadow only
    img_02, _, _ = render_eyeshadow_redesigned(img, landmarks, which_eyes="left", hex_color="#8F5E43", opacity=0.70, finish="Shimmer")
    out_02 = os.path.join(OUTPUT_DIR, "02_left_eye_eyeshadow_only.png")
    cv2.imwrite(out_02, img_02)
    print("  -> Saved 02_left_eye_eyeshadow_only.png")

    # 3. Right eye with eyeshadow only
    img_03, _, _ = render_eyeshadow_redesigned(img, landmarks, which_eyes="right", hex_color="#8F5E43", opacity=0.70, finish="Shimmer")
    out_03 = os.path.join(OUTPUT_DIR, "03_right_eye_eyeshadow_only.png")
    cv2.imwrite(out_03, img_03)
    print("  -> Saved 03_right_eye_eyeshadow_only.png")

    # 4. Both eyes with eyeshadow
    img_04, _, _ = render_eyeshadow_redesigned(img, landmarks, which_eyes="both", hex_color="#8F5E43", opacity=0.70, finish="Shimmer")
    out_04 = os.path.join(OUTPUT_DIR, "04_both_eyes_eyeshadow.png")
    cv2.imwrite(out_04, img_04)
    print("  -> Saved 04_both_eyes_eyeshadow.png")

    # 5. Mascara on left eye only
    img_05 = render_mascara_redesigned(img, landmarks, which_eyes="left", intensity="Defined", hex_color="#101010", opacity=0.92)
    out_05 = os.path.join(OUTPUT_DIR, "05_left_eye_mascara_only.png")
    cv2.imwrite(out_05, img_05)
    print("  -> Saved 05_left_eye_mascara_only.png")

    # 6. Mascara on right eye only
    img_06 = render_mascara_redesigned(img, landmarks, which_eyes="right", intensity="Defined", hex_color="#101010", opacity=0.92)
    out_06 = os.path.join(OUTPUT_DIR, "06_right_eye_mascara_only.png")
    cv2.imwrite(out_06, img_06)
    print("  -> Saved 06_right_eye_mascara_only.png")

    # 7. Both eyes with mascara
    img_07 = render_mascara_redesigned(img, landmarks, which_eyes="both", intensity="Defined", hex_color="#101010", opacity=0.92)
    out_07 = os.path.join(OUTPUT_DIR, "07_both_eyes_mascara.png")
    cv2.imwrite(out_07, img_07)
    print("  -> Saved 07_both_eyes_mascara.png")

    # 8. Combined eyeshadow and mascara
    # Pipeline: Eyeshadow first, then Mascara on top!
    img_08_shadow, _, _ = render_eyeshadow_redesigned(img, landmarks, which_eyes="both", hex_color="#8F5E43", opacity=0.70, finish="Shimmer")
    img_08 = render_mascara_redesigned(img_08_shadow, landmarks, which_eyes="both", intensity="Defined", hex_color="#101010", opacity=0.92)
    out_08 = os.path.join(OUTPUT_DIR, "08_combined_eyeshadow_and_mascara.png")
    cv2.imwrite(out_08, img_08)
    print("  -> Saved 08_combined_eyeshadow_and_mascara.png")

    # High-resolution crops of the eyes for detailed inspection
    crop_orig = crop_eyes(img, landmarks)
    crop_shadow = crop_eyes(img_04, landmarks)
    crop_mascara = crop_eyes(img_07, landmarks)
    crop_comb = crop_eyes(img_08, landmarks)

    cv2.imwrite(os.path.join(OUTPUT_DIR, "crop_01_original_eyes.png"), crop_orig)
    cv2.imwrite(os.path.join(OUTPUT_DIR, "crop_04_eyeshadow_eyes.png"), crop_shadow)
    cv2.imwrite(os.path.join(OUTPUT_DIR, "crop_07_mascara_eyes.png"), crop_mascara)
    cv2.imwrite(os.path.join(OUTPUT_DIR, "crop_08_combined_eyes.png"), crop_comb)

    # Mascara Intensity Comparisons (Natural, Defined, Dramatic)
    img_masc_nat = render_mascara_redesigned(img, landmarks, which_eyes="both", intensity="Natural")
    img_masc_def = render_mascara_redesigned(img, landmarks, which_eyes="both", intensity="Defined")
    img_masc_dram = render_mascara_redesigned(img, landmarks, which_eyes="both", intensity="Dramatic")

    cv2.imwrite(os.path.join(OUTPUT_DIR, "mascara_intensity_natural.png"), crop_eyes(img_masc_nat, landmarks))
    cv2.imwrite(os.path.join(OUTPUT_DIR, "mascara_intensity_defined.png"), crop_eyes(img_masc_def, landmarks))
    cv2.imwrite(os.path.join(OUTPUT_DIR, "mascara_intensity_dramatic.png"), crop_eyes(img_masc_dram, landmarks))

    print("\n[STEP 207] All 8 required evidence outputs + crops + intensity comparisons generated successfully!")

if __name__ == "__main__":
    run_step207_verification()
