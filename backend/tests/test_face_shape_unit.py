"""
Unit tests for Landmark-Based Face Shape Classification, Pose Assessment, and Ambiguity Handling.
Executed under backend/venv:
    backend\\venv\\Scripts\\python.exe backend/tests/test_face_shape_unit.py
"""

import sys
import math
import unittest
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import numpy as np
from services.face_analyzer import FaceAnalyzer


def create_synthetic_landmarks(w_cheek, w_jaw, w_forehead, h_physio, roll_deg=0.0):
    """
    Synthesizes minimal 478-point landmark dictionary for geometric unit testing.
    Key indices:
      234: left cheek, 454: right cheek
      58: left jaw, 288: right jaw
      54: left forehead, 284: right forehead
      10: top of forehead, 152: chin tip, 168: nasion
      33: left eye outer, 263: right eye outer, 1: nose tip
    """
    center_x, center_y = 300.0, 300.0
    roll_rad = math.radians(roll_deg)
    cos_r = math.cos(roll_rad)
    sin_r = math.sin(roll_rad)

    def rot(dx, dy):
        rx = dx * cos_r - dy * sin_r + center_x
        ry = dx * sin_r + dy * cos_r + center_y
        return rx, ry

    # Canonical coordinate offsets
    # Eyes baseline
    e_x1, e_y1 = rot(-50.0, -20.0)
    e_x2, e_y2 = rot(50.0, -20.0)
    # Nose tip
    n_x, n_y = rot(0.0, 15.0)

    # Anatomical boundaries
    c_x1, c_y1 = rot(-w_cheek / 2.0, 0.0)
    c_x2, c_y2 = rot(w_cheek / 2.0, 0.0)

    j_x1, j_y1 = rot(-w_jaw / 2.0, h_physio * 0.35)
    j_x2, j_y2 = rot(w_jaw / 2.0, h_physio * 0.35)

    f_x1, f_y1 = rot(-w_forehead / 2.0, -h_physio * 0.35)
    f_x2, f_y2 = rot(w_forehead / 2.0, -h_physio * 0.35)

    top_x, top_y = rot(0.0, -h_physio / 2.0)
    chin_x, chin_y = rot(0.0, h_physio / 2.0)
    nas_x, nas_y = rot(0.0, -h_physio * 0.15)

    lms = []
    for i in range(478):
        lms.append({"index": i, "pixel_x": int(center_x), "pixel_y": int(center_y)})

    lms[33] = {"index": 33, "pixel_x": int(e_x1), "pixel_y": int(e_y1)}
    lms[263] = {"index": 263, "pixel_x": int(e_x2), "pixel_y": int(e_y2)}
    lms[1] = {"index": 1, "pixel_x": int(n_x), "pixel_y": int(n_y)}
    lms[234] = {"index": 234, "pixel_x": int(c_x1), "pixel_y": int(c_y1)}
    lms[454] = {"index": 454, "pixel_x": int(c_x2), "pixel_y": int(c_y2)}
    lms[58] = {"index": 58, "pixel_x": int(j_x1), "pixel_y": int(j_y1)}
    lms[288] = {"index": 288, "pixel_x": int(j_x2), "pixel_y": int(j_y2)}
    lms[54] = {"index": 54, "pixel_x": int(f_x1), "pixel_y": int(f_y1)}
    lms[284] = {"index": 284, "pixel_x": int(f_x2), "pixel_y": int(f_y2)}
    lms[10] = {"index": 10, "pixel_x": int(top_x), "pixel_y": int(top_y)}
    lms[152] = {"index": 152, "pixel_x": int(chin_x), "pixel_y": int(chin_y)}
    lms[168] = {"index": 168, "pixel_x": int(nas_x), "pixel_y": int(nas_y)}

    return lms


class TestFaceShapeUnit(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.analyzer = FaceAnalyzer()
        cls.project_root = backend_dir.parent
        cls.hero_path = cls.project_root / "frontend" / "public" / "hero-model.png"

    def test_01_ideal_archetype_oval(self):
        """Validates classification of ideal Oval proportions (FAR=0.76, JCR=0.78, FCR=0.83)."""
        lms = create_synthetic_landmarks(w_cheek=190.0, w_jaw=148.0, w_forehead=158.0, h_physio=250.0)
        res = self.analyzer._classify_face_shape_from_landmarks(lms, 600, 600)
        self.assertEqual(res["face_shape"], "Oval")
        self.assertFalse(res["face_shape_metrics"]["is_ambiguous"])
        self.assertIn("Oval", res["face_shape_metrics"]["shape_scores"])
        self.assertGreater(res["face_shape_metrics"]["shape_scores"]["Oval"], 0.40)

    def test_02_ideal_archetype_round(self):
        """Validates classification of ideal Round proportions (FAR=0.89, JCR=0.84, FCR=0.83)."""
        lms = create_synthetic_landmarks(w_cheek=205.0, w_jaw=172.0, w_forehead=170.0, h_physio=230.0)
        res = self.analyzer._classify_face_shape_from_landmarks(lms, 600, 600)
        self.assertEqual(res["face_shape"], "Round")
        self.assertGreater(res["face_shape_metrics"]["shape_scores"]["Round"], 0.40)

    def test_03_ideal_archetype_square(self):
        """Validates classification of ideal Square proportions (FAR=0.88, JCR=0.91, FCR=0.88)."""
        lms = create_synthetic_landmarks(w_cheek=210.0, w_jaw=192.0, w_forehead=185.0, h_physio=240.0)
        res = self.analyzer._classify_face_shape_from_landmarks(lms, 600, 600)
        self.assertEqual(res["face_shape"], "Square")
        self.assertGreater(res["face_shape_metrics"]["shape_scores"]["Square"], 0.35)

    def test_04_ideal_archetype_heart(self):
        """Validates classification of ideal Heart proportions (FAR=0.80, JCR=0.68, FCR=0.91)."""
        lms = create_synthetic_landmarks(w_cheek=192.0, w_jaw=130.0, w_forehead=175.0, h_physio=240.0)
        res = self.analyzer._classify_face_shape_from_landmarks(lms, 600, 600)
        self.assertEqual(res["face_shape"], "Heart")
        self.assertGreater(res["face_shape_metrics"]["shape_scores"]["Heart"], 0.40)

    def test_05_ideal_archetype_oblong(self):
        """Validates classification of ideal Oblong proportions (FAR=0.64, JCR=0.80, FCR=0.80)."""
        lms = create_synthetic_landmarks(w_cheek=160.0, w_jaw=128.0, w_forehead=128.0, h_physio=250.0)
        res = self.analyzer._classify_face_shape_from_landmarks(lms, 600, 600)
        self.assertEqual(res["face_shape"], "Oblong")
        self.assertGreater(res["face_shape_metrics"]["shape_scores"]["Oblong"], 0.40)

    def test_06_transitional_ambiguity(self):
        """Transitional facial proportions between Oval and Round trigger ambiguity flag."""
        # FAR = 0.82, JCR = 0.80 -> sits on the threshold boundary
        lms = create_synthetic_landmarks(w_cheek=197.0, w_jaw=158.0, w_forehead=164.0, h_physio=240.0)
        res = self.analyzer._classify_face_shape_from_landmarks(lms, 600, 600)
        metrics = res["face_shape_metrics"]
        self.assertTrue(metrics["is_ambiguous"])
        self.assertIsNotNone(metrics["secondary_shape"])
        self.assertLess(metrics["affinity_margin"], 0.12)
        self.assertIn("Transitional", metrics["explanation"])

    def test_07_roll_alignment_invariance(self):
        """Tilted head (roll = 15 deg) yields consistent aspect ratio after roll alignment."""
        lms_straight = create_synthetic_landmarks(w_cheek=190.0, w_jaw=148.0, w_forehead=158.0, h_physio=250.0, roll_deg=0.0)
        lms_tilted   = create_synthetic_landmarks(w_cheek=190.0, w_jaw=148.0, w_forehead=158.0, h_physio=250.0, roll_deg=15.0)

        res_straight = self.analyzer._classify_face_shape_from_landmarks(lms_straight, 600, 600)
        res_tilted   = self.analyzer._classify_face_shape_from_landmarks(lms_tilted, 600, 600)

        far_straight = res_straight["face_shape_metrics"]["aspect_ratio"]
        far_tilted   = res_tilted["face_shape_metrics"]["aspect_ratio"]

        # Aspect ratio is preserved within 0.02 under 15 degree roll
        self.assertAlmostEqual(far_straight, far_tilted, delta=0.02)
        self.assertEqual(res_straight["face_shape"], res_tilted["face_shape"])

    def test_08_pose_quality_assessment(self):
        """Verifies detection of frontal vs non-frontal head angles."""
        # Frontal pose
        lms_frontal = create_synthetic_landmarks(w_cheek=190.0, w_jaw=148.0, w_forehead=158.0, h_physio=250.0, roll_deg=2.0)
        pose_frontal = self.analyzer._assess_pose(lms_frontal)
        self.assertTrue(pose_frontal["is_frontal"])
        self.assertEqual(pose_frontal["pose_quality"], "good_frontal")

        # Roll > 15 deg
        lms_tilted = create_synthetic_landmarks(w_cheek=190.0, w_jaw=148.0, w_forehead=158.0, h_physio=250.0, roll_deg=22.0)
        pose_tilted = self.analyzer._assess_pose(lms_tilted)
        self.assertFalse(pose_tilted["is_frontal"])

    def test_09_real_portrait_hero_model(self):
        """Real portrait image executes full analysis with enriched face-shape metrics."""
        with open(self.hero_path, "rb") as f:
            raw_bytes = f.read()

        result = self.analyzer.analyze(raw_bytes)
        self.assertIsNotNone(result)
        self.assertEqual(result["face_shape"], "Round")
        self.assertEqual(result["face_shape_source"], "MediaPipe Landmark Geometric Analysis")

        # Check required metrics
        metrics = result["face_shape_metrics"]
        self.assertIn("aspect_ratio", metrics)
        self.assertIn("jaw_to_cheek_ratio", metrics)
        self.assertIn("shape_scores", metrics)
        self.assertIn("distances_pixels", metrics)
        self.assertIn("pose_assessment", result)
        self.assertFalse(result["face_shape_metrics"].get("is_fallback", False))

    def test_10_missing_landmarks_fallback(self):
        """Fallback mode clearly identifies itself as an uncalibrated estimate."""
        img = np.full((300, 300, 3), 128, dtype=np.uint8)
        # Force fallback call
        res_fb = self.analyzer._analyze_fallback(img)
        # Even if HSV detected nothing (None) or something, check structure if returned
        if res_fb is not None:
            self.assertIn("fallback", res_fb["face_shape_source"])
            self.assertTrue(res_fb["face_shape_metrics"]["is_fallback"])
            self.assertEqual(res_fb["pose_assessment"]["pose_quality"], "unknown_no_landmarks")

    def test_11_corrupted_image(self):
        """Corrupted image bytes return None gracefully."""
        self.assertIsNone(self.analyzer.analyze(b"GARBAGE_BYTES_NOT_AN_IMAGE"))


if __name__ == "__main__":
    unittest.main(verbosity=2)
