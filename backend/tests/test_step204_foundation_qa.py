"""
Step 204 Face-Aware Foundation Simulation Comprehensive Unit & Integration Test Suite.
Verifies:
1. Facial skin mask coverage non-zero (> 10,000 pixels modified).
2. Eyeball aperture protection (0% spill into left/right palpebral openings).
3. Eyebrow protection (0% spill into left/right eyebrow contours).
4. Vermilion lip and mouth cavity protection (0% spill into lips/mouth).
5. Nostril openings protection (0% spill into alar nostril holes).
6. Background & hair protection (0% spill outside face oval silhouette).
7. Coverage levels monotonic progression (light < medium < full opacity).
8. Multi-layer preservation (blush, eyeshadow, eyeliner, lipstick all layer on top of foundation).
9. Robustness across different face shapes and angles (hero_model, login_model).
"""

import os
import sys
sys.path.insert(0, os.path.abspath("."))
import unittest
import numpy as np
import cv2
from backend.services.mediapipe_client import mediapipe_client
from backend.tests.generate_foundation_qa_evidence import (
    simulate_foundation_pass,
    simulate_blush_pass,
    simulate_eyeshadow_pass,
    simulate_eyeliner_pass,
    simulate_lipstick_pass,
    EXCLUSIONS,
    FACE_OVAL_INDICES
)

class TestStep204FoundationQA(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.hero_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "public", "hero-model.png")
        cls.login_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "src", "assets", "login-model-merged.png")

        with open(cls.hero_path, "rb") as f:
            res_hero = mediapipe_client.detect_landmarks(f.read())
        cls.hero_landmarks = res_hero.get("landmarks")

        with open(cls.login_path, "rb") as f:
            res_login = mediapipe_client.detect_landmarks(f.read())
        cls.login_landmarks = res_login.get("landmarks")

    def _get_pt(self, landmarks, idx, w, h):
        return (int(landmarks[idx]["x"] * w), int(landmarks[idx]["y"] * h))

    def test_01_hero_model_foundation_coverage_and_safety(self):
        """Verifies foundation coverage on hero_model with 0% spill into all exclusions."""
        img = cv2.imread(self.hero_path)
        h, w = img.shape[:2]
        sim, alpha, _ = simulate_foundation_pass(img, self.hero_landmarks, hex_color="#D8A782", coverage="medium", opacity=0.48)

        diff = cv2.absdiff(img, sim)
        diff_gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
        mod_pixels = np.sum(diff_gray > 2)

        self.assertGreater(mod_pixels, 10000, "Foundation must modify significant facial skin pixels")

        # Eyeball check
        eye_mask = np.zeros((h, w), dtype=np.uint8)
        cv2.fillPoly(eye_mask, [np.array([self._get_pt(self.hero_landmarks, i, w, h) for i in EXCLUSIONS["left_eye"]], dtype=np.int32)], 255)
        cv2.fillPoly(eye_mask, [np.array([self._get_pt(self.hero_landmarks, i, w, h) for i in EXCLUSIONS["right_eye"]], dtype=np.int32)], 255)
        eye_spill = np.sum((diff_gray > 2) & (eye_mask > 0))
        self.assertEqual(eye_spill, 0, "Foundation must not bleed into eyeball apertures")

        # Eyebrow check
        brow_mask = np.zeros((h, w), dtype=np.uint8)
        cv2.fillPoly(brow_mask, [np.array([self._get_pt(self.hero_landmarks, i, w, h) for i in EXCLUSIONS["left_eyebrow"]], dtype=np.int32)], 255)
        cv2.fillPoly(brow_mask, [np.array([self._get_pt(self.hero_landmarks, i, w, h) for i in EXCLUSIONS["right_eyebrow"]], dtype=np.int32)], 255)
        brow_spill = np.sum((diff_gray > 2) & (brow_mask > 0))
        self.assertEqual(brow_spill, 0, "Foundation must not bleed into eyebrows")

        # Lip check
        lip_mask = np.zeros((h, w), dtype=np.uint8)
        cv2.fillPoly(lip_mask, [np.array([self._get_pt(self.hero_landmarks, i, w, h) for i in EXCLUSIONS["lips"]], dtype=np.int32)], 255)
        lip_spill = np.sum((diff_gray > 2) & (lip_mask > 0))
        self.assertEqual(lip_spill, 0, "Foundation must not bleed into vermilion lips")

        # Nostril check
        nostril_mask = np.zeros((h, w), dtype=np.uint8)
        cv2.fillPoly(nostril_mask, [np.array([self._get_pt(self.hero_landmarks, i, w, h) for i in EXCLUSIONS["left_nostril"]], dtype=np.int32)], 255)
        cv2.fillPoly(nostril_mask, [np.array([self._get_pt(self.hero_landmarks, i, w, h) for i in EXCLUSIONS["right_nostril"]], dtype=np.int32)], 255)
        nostril_spill = np.sum((diff_gray > 2) & (nostril_mask > 0))
        self.assertEqual(nostril_spill, 0, "Foundation must not bleed into nostril openings")

        # Background check
        oval_mask = np.zeros((h, w), dtype=np.uint8)
        cv2.fillPoly(oval_mask, [np.array([self._get_pt(self.hero_landmarks, i, w, h) for i in FACE_OVAL_INDICES], dtype=np.int32)], 255)
        bg_spill = np.sum((diff_gray > 2) & (oval_mask == 0))
        self.assertEqual(bg_spill, 0, "Foundation must not bleed outside face oval into background or hair")

    def test_02_login_model_foundation_coverage_and_safety(self):
        """Verifies foundation coverage on login_model with 0% spill into all exclusions."""
        img = cv2.imread(self.login_path)
        h, w = img.shape[:2]
        sim, alpha, _ = simulate_foundation_pass(img, self.login_landmarks, hex_color="#CE9B72", coverage="medium", opacity=0.48)

        diff = cv2.absdiff(img, sim)
        diff_gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
        mod_pixels = np.sum(diff_gray > 2)

        self.assertGreater(mod_pixels, 10000, "Foundation must modify significant facial skin pixels")

        # Eyeball check
        eye_mask = np.zeros((h, w), dtype=np.uint8)
        cv2.fillPoly(eye_mask, [np.array([self._get_pt(self.login_landmarks, i, w, h) for i in EXCLUSIONS["left_eye"]], dtype=np.int32)], 255)
        cv2.fillPoly(eye_mask, [np.array([self._get_pt(self.login_landmarks, i, w, h) for i in EXCLUSIONS["right_eye"]], dtype=np.int32)], 255)
        self.assertEqual(np.sum((diff_gray > 2) & (eye_mask > 0)), 0, "Foundation must not bleed into eyes")

        # Eyebrow check
        brow_mask = np.zeros((h, w), dtype=np.uint8)
        cv2.fillPoly(brow_mask, [np.array([self._get_pt(self.login_landmarks, i, w, h) for i in EXCLUSIONS["left_eyebrow"]], dtype=np.int32)], 255)
        cv2.fillPoly(brow_mask, [np.array([self._get_pt(self.login_landmarks, i, w, h) for i in EXCLUSIONS["right_eyebrow"]], dtype=np.int32)], 255)
        self.assertEqual(np.sum((diff_gray > 2) & (brow_mask > 0)), 0, "Foundation must not bleed into eyebrows")

        # Lip check
        lip_mask = np.zeros((h, w), dtype=np.uint8)
        cv2.fillPoly(lip_mask, [np.array([self._get_pt(self.login_landmarks, i, w, h) for i in EXCLUSIONS["lips"]], dtype=np.int32)], 255)
        self.assertEqual(np.sum((diff_gray > 2) & (lip_mask > 0)), 0, "Foundation must not bleed into lips")

        # Nostril check
        nostril_mask = np.zeros((h, w), dtype=np.uint8)
        cv2.fillPoly(nostril_mask, [np.array([self._get_pt(self.login_landmarks, i, w, h) for i in EXCLUSIONS["left_nostril"]], dtype=np.int32)], 255)
        cv2.fillPoly(nostril_mask, [np.array([self._get_pt(self.login_landmarks, i, w, h) for i in EXCLUSIONS["right_nostril"]], dtype=np.int32)], 255)
        self.assertEqual(np.sum((diff_gray > 2) & (nostril_mask > 0)), 0, "Foundation must not bleed into nostrils")

        # Background check
        oval_mask = np.zeros((h, w), dtype=np.uint8)
        cv2.fillPoly(oval_mask, [np.array([self._get_pt(self.login_landmarks, i, w, h) for i in FACE_OVAL_INDICES], dtype=np.int32)], 255)
        self.assertEqual(np.sum((diff_gray > 2) & (oval_mask == 0)), 0, "Foundation must not bleed outside face oval")

    def test_03_coverage_levels_monotonic_scaling(self):
        """Verifies that light, medium, and full coverage scale opacity monotonically."""
        img = cv2.imread(self.hero_path)
        _, alpha_light, _ = simulate_foundation_pass(img, self.hero_landmarks, coverage="light", opacity=0.48)
        _, alpha_med, _ = simulate_foundation_pass(img, self.hero_landmarks, coverage="medium", opacity=0.48)
        _, alpha_full, _ = simulate_foundation_pass(img, self.hero_landmarks, coverage="full", opacity=0.48)

        mean_l = np.mean(alpha_light[alpha_light > 0.01])
        mean_m = np.mean(alpha_med[alpha_med > 0.01])
        mean_f = np.mean(alpha_full[alpha_full > 0.01])

        self.assertLess(mean_l, mean_m, "Light coverage opacity must be less than medium")
        self.assertLess(mean_m, mean_f, "Medium coverage opacity must be less than full")

    def test_04_full_face_pipeline_non_destructive_layering(self):
        """Verifies that foundation layers smoothly with blush, eyeshadow, eyeliner, and lipstick."""
        img = cv2.imread(self.hero_path)
        found = simulate_foundation_pass(img, self.hero_landmarks, hex_color="#D8A782", coverage="medium", opacity=0.48)[0]
        blush = simulate_blush_pass(found, self.hero_landmarks, hex_color="#D37D64", opacity=0.55)
        shadow = simulate_eyeshadow_pass(blush, self.hero_landmarks, hex_color="#8F5E43", opacity=0.65, finish="Shimmer")
        liner = simulate_eyeliner_pass(shadow, self.hero_landmarks, hex_color="#1A1A1A", opacity=0.90, thickness=1.8, style="Winged")
        full_combo = simulate_lipstick_pass(liner, self.hero_landmarks, hex_color="#B92F60", opacity=0.62)

        diff = cv2.absdiff(img, full_combo)
        diff_gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
        total_mod = np.sum(diff_gray > 2)

        self.assertGreater(total_mod, 22000, "Full face combo must produce comprehensive makeup coverage")

if __name__ == "__main__":
    unittest.main()
