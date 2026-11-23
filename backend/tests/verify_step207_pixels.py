import sys
import os
import cv2
import numpy as np

def run_checks():
    out_dir = "backend/tests/qa_visual_outputs/step207_eyeshadow_mascara_redesign"
    orig = cv2.imread(os.path.join(out_dir, "01_original_face.png"))
    shadow = cv2.imread(os.path.join(out_dir, "04_both_eyes_eyeshadow.png"))
    mascara = cv2.imread(os.path.join(out_dir, "07_both_eyes_mascara.png"))
    combined = cv2.imread(os.path.join(out_dir, "08_combined_eyeshadow_and_mascara.png"))

    assert orig is not None and shadow is not None and mascara is not None and combined is not None, "Missing images"

    # 1. Verify that eyeshadow modifies the eyelid
    diff_shadow = cv2.absdiff(orig, shadow)
    max_diff_shadow = np.max(diff_shadow)
    changed_pixels_shadow = np.count_nonzero(diff_shadow > 5)
    print(f"Eyeshadow changed pixels: {changed_pixels_shadow}, max delta: {max_diff_shadow}")
    assert changed_pixels_shadow > 500, "Eyeshadow must cover visible area"

    # 2. Verify that mascara modifies the lash area
    diff_mascara = cv2.absdiff(orig, mascara)
    max_diff_mascara = np.max(diff_mascara)
    changed_pixels_mascara = np.count_nonzero(diff_mascara > 5)
    print(f"Mascara changed pixels: {changed_pixels_mascara}, max delta: {max_diff_mascara}")
    assert changed_pixels_mascara > 200, "Mascara must produce visible lashes"

    # 3. Verify separation: Mascara must NOT be a continuous solid rectangle/polygon
    # Check vertical profile along mascara strokes
    masc_mask = (diff_mascara[:, :, 0] > 10) | (diff_mascara[:, :, 1] > 10) | (diff_mascara[:, :, 2] > 10)
    # Count connected components in mascara difference: individual lashes should create distinct slender components
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(masc_mask.astype(np.uint8))
    print(f"Mascara connected components: {num_labels} (indicates separated lash strokes)")
    assert num_labels > 10, "Mascara must exhibit multiple separate stroke regions"

    # 4. Verify combined image has both effects
    diff_combined = cv2.absdiff(orig, combined)
    changed_combined = np.count_nonzero(diff_combined > 5)
    print(f"Combined changed pixels: {changed_combined}")
    assert changed_combined > changed_pixels_shadow, "Combined must contain both eyeshadow and mascara enhancements"

    print("ALL PIXEL-LEVEL STEP 207 CHECKS PASSED!")

if __name__ == "__main__":
    run_checks()
