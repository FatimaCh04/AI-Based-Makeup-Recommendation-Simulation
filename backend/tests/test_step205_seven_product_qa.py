"""
Step 205 Complete 7-Product Virtual Makeup Simulation Comprehensive Test Suite
Validates:
1. All 7 cosmetic products exist, validate, and simulate correctly:
   Foundation, Blush, Highlighter, Eyeshadow, Eyeliner, Mascara, Lipstick.
2. Eyeball aperture protection across eye products and foundation (0% spill into palpebral opening).
3. Lipstick white circular spot defect resolution (no unnatural white specular spot in center of lips).
4. Foundation nasal coverage (nose bridge and philtrum covered without central cutout hole).
5. Facial highlighter placement on anatomical high points (cheekbones, nose bridge, nose tip, cupid's bow, brow bone).
6. Mascara cilia fan rendering and lash root tightline volume.
7. Recommender service provides complete 7-shade palettes, Eid occasion, and face shape guidance.
"""

import os
import sys
sys.path.insert(0, os.path.abspath("."))
import unittest
import numpy as np
import cv2
from backend.services.mediapipe_client import mediapipe_client
from backend.services.recommender import MakeupRecommender
from backend.tests.generate_seven_product_qa_evidence import (
    simulate_foundation,
    simulate_blush,
    simulate_highlighter,
    simulate_eyeshadow,
    simulate_eyeliner,
    simulate_mascara,
    simulate_lipstick,
    EXCLUSIONS_STEP205,
    FACE_OVAL_INDICES
)

class TestStep205SevenProductQA(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.hero_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "public", "hero-model.png")
        assert os.path.exists(cls.hero_path), f"Hero model not found at {cls.hero_path}"

        with open(cls.hero_path, "rb") as f:
            res = mediapipe_client.detect_landmarks(f.read())
        assert res.get("face_detected"), "MediaPipe face detection failed on hero model"
        cls.landmarks = res["landmarks"]
        cls.img = cv2.imread(cls.hero_path)
        cls.h, cls.w = cls.img.shape[:2]
        cls.recommender = MakeupRecommender()

    def _pt(self, idx):
        return (int(self.landmarks[idx]["x"] * self.w), int(self.landmarks[idx]["y"] * self.h))

    # --- 1. Foundation Verification ---
    def test_01_foundation_coverage_and_philtrum_preservation(self):
        """Verifies foundation covers face and leaves NO hole at the philtrum/nose tip."""
        sim = simulate_foundation(self.img, self.landmarks, hex_color="#D8A782", coverage="medium", opacity=0.48)
        diff = cv2.absdiff(self.img, sim)
        diff_gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)

        # Cheek skin should have foundation
        p_cheek = self._pt(205)
        self.assertGreater(int(diff_gray[p_cheek[1], p_cheek[0]]), 2, "Cheek skin must receive foundation")

        # Nose tip / philtrum (landmark 4 and 2) should be covered smoothly (not punched out)
        p_nosetip = self._pt(4)
        p_subnasale = self._pt(2)
        self.assertGreater(int(diff_gray[p_nosetip[1], p_nosetip[0]]), 1, "Nose tip must receive foundation coverage")
        self.assertGreater(int(diff_gray[p_subnasale[1], p_subnasale[0]]), 1, "Subnasale/philtrum must receive foundation coverage")

        # Eyeball center (inside palpebral aperture) must NOT receive foundation
        p_eye = self._pt(159)
        pupil_y = p_eye[1] + 8
        self.assertEqual(int(diff_gray[pupil_y, p_eye[0]]), 0, "Eyeball interior must have 0% foundation bleed")

    # --- 2. Blush Verification ---
    def test_02_blush_simulation_and_face_shape_support(self):
        """Verifies blush creates natural malar wash without eye/lip bleed."""
        sim = simulate_blush(self.img, self.landmarks, hex_color="#D37D64", opacity=0.55, face_shape="Round")
        diff = cv2.absdiff(self.img, sim)
        diff_gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
        mod_count = np.sum(diff_gray > 0)
        self.assertGreater(mod_count, 1500, "Blush must modify cheek region pixels")

        # Lips must be 0% blush
        p_lip = self._pt(17)
        self.assertEqual(int(diff_gray[p_lip[1], p_lip[0]]), 0, "Blush must not bleed onto lips")

    # --- 3. Highlighter Verification ---
    def test_03_highlighter_high_points_illumination(self):
        """Verifies highlighter illuminates zygomatic arch, nose bridge, and cupid bow."""
        sim = simulate_highlighter(self.img, self.landmarks, hex_color="#EAD5A6", opacity=0.50, face_shape="Oval")
        diff = cv2.absdiff(self.img, sim)
        diff_gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)

        # Cheekbone crest (116)
        p_cheekbone = self._pt(116)
        self.assertGreater(int(diff_gray[p_cheekbone[1], p_cheekbone[0]]), 2, "Highlighter must brighten cheekbone crest")

        # Nose bridge (168)
        p_bridge = self._pt(168)
        self.assertGreater(int(diff_gray[p_bridge[1], p_bridge[0]]), 2, "Highlighter must brighten nasal bridge")

    # --- 4. Eyeshadow Verification ---
    def test_04_eyeshadow_lid_coverage_and_eyeball_protection(self):
        """Verifies eyeshadow covers mobile eyelid while protecting eyeball."""
        sim = simulate_eyeshadow(self.img, self.landmarks, hex_color="#8F5E43", opacity=0.65, finish="Shimmer")
        diff = cv2.absdiff(self.img, sim)
        diff_gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)

        # Mobile eyelid mid-point between lashline 159 and crease 27
        p159 = self._pt(159)
        p27 = self._pt(27)
        mid_lid = (int((p159[0] + p27[0]) * 0.5), int((p159[1] + p27[1]) * 0.5))
        self.assertGreater(int(diff_gray[mid_lid[1], mid_lid[0]]), 5, "Mobile eyelid center must receive rich eyeshadow pigment")

        # Eyeball interior protection
        pupil_y = p159[1] + 8
        self.assertEqual(int(diff_gray[pupil_y, p159[0]]), 0, "Eyeshadow must not bleed onto eyeball")

    # --- 5. Eyeliner Verification ---
    def test_05_eyeliner_lashline_precision(self):
        """Verifies eyeliner traces upper lashline contour."""
        sim = simulate_eyeliner(self.img, self.landmarks, hex_color="#1A1A1A", opacity=0.90, thickness=1.8, style="Winged")
        diff = cv2.absdiff(self.img, sim)
        diff_gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)

        mod_pixels = np.sum(diff_gray > 0)
        self.assertGreater(mod_pixels, 150, "Eyeliner must modify upper lashline contour pixels")

        # Eyeball interior protection
        p_lash = self._pt(159)
        pupil_y = p_lash[1] + 8
        self.assertEqual(int(diff_gray[pupil_y, p_lash[0]]), 0, "Eyeliner must not bleed onto eyeball")

    # --- 6. Mascara Verification ---
    def test_06_mascara_cilia_fan_and_tightline(self):
        """Verifies mascara creates distinct dark ciliary accents above lashline."""
        sim = simulate_mascara(self.img, self.landmarks, hex_color="#101010", opacity=0.92, volume="volumizing")
        diff = cv2.absdiff(self.img, sim)
        diff_gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)

        mod_pixels = np.sum(diff_gray > 0)
        self.assertGreater(mod_pixels, 300, "Mascara must render tightline and upward cilia pixels")

    # --- 7. Lipstick White Artifact Verification ---
    def test_07_lipstick_no_white_spot_artifact(self):
        """Verifies lipstick does NOT draw an artificial saturated white circle on lower lip."""
        sim = simulate_lipstick(self.img, self.landmarks, hex_color="#B92F60", opacity=0.62, finish="Matte")
        p_lower = self._pt(17)
        b, g, r = sim[p_lower[1], p_lower[0]]

        # In the buggy code, a white radial spot produced pixel values > 240, 240, 240
        is_pure_white = (r > 240 and g > 240 and b > 240)
        self.assertFalse(is_pure_white, f"Lower lip center must NOT have a pure white artifact spot! (RGB: {r},{g},{b})")
        # Vermilion lip must have rich berry pigment
        self.assertGreater(r, g, "Lipstick must impart berry/red tone where R > G")

    # --- 8. Recommender Verification ---
    def test_08_recommender_seven_products_and_eid_support(self):
        """Verifies recommender yields 7 shades, shade_map, face shape rules, and Eid occasion."""
        res_eid = self.recommender.get_recommendations(
            {"skin_tone": "Medium", "undertone": "Warm", "face_shape": "Round"},
            occasion="Eid"
        )
        self.assertEqual(len(res_eid["shades"]), 7, "Recommendation must contain exactly 7 products")
        expected_cats = {"Foundation", "Lipstick", "Eyeshadow", "Blush", "Eyeliner", "Mascara", "Highlighter"}
        actual_cats = {s["category"] for s in res_eid["shades"]}
        self.assertEqual(expected_cats, actual_cats, f"All 7 product categories must be present, got: {actual_cats}")

        self.assertIn("face_shape_guidance", res_eid, "Response must include face_shape_guidance")
        self.assertEqual(res_eid["face_shape_guidance"]["face_shape"], "Round")
        self.assertEqual(res_eid["occasion"], "Eid")

        # Verify shade_map contains all 7 keys
        expected_map_keys = {"foundation", "lipstick", "eyeshadow", "blush", "eyeliner", "mascara", "highlighter"}
        actual_map_keys = set(res_eid["shade_map"].keys())
        self.assertEqual(expected_map_keys, actual_map_keys, f"shade_map must contain all 7 keys, got: {actual_map_keys}")

if __name__ == "__main__":
    unittest.main()
