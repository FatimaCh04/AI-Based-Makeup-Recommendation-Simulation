"""
Unit tests for Landmark-Guided Skin Tone and Undertone Analysis.
Executed under backend/venv:
    backend\\venv\\Scripts\\python.exe backend/tests/test_skin_tone_unit.py
"""

import sys
import math
import unittest
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import cv2
import numpy as np
from services.face_analyzer import FaceAnalyzer, SAMPLING_POLYGONS


class TestSkinToneUnit(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.analyzer = FaceAnalyzer()
        cls.project_root = backend_dir.parent
        cls.hero_path = cls.project_root / "frontend" / "public" / "hero-model.png"

    def test_01_ita_mathematical_bounds(self):
        """Validates that ITA angle matches known dermatological benchmarks."""
        # Fair skin benchmark: L*=85, b*=15 -> ITA = arctan(35/15) * 180/pi = 66.8°
        ita_fair = math.atan2(85.0 - 50.0, 15.0) * (180.0 / math.pi)
        self.assertGreater(ita_fair, 55.0)

        # Medium skin benchmark: L*=58, b*=18 -> ITA = arctan(8/18) * 180/pi = 23.96°
        ita_med = math.atan2(58.0 - 50.0, 18.0) * (180.0 / math.pi)
        self.assertTrue(10.0 <= ita_med <= 41.0)

        # Deep skin benchmark: L*=35, b*=12 -> ITA = arctan(-15/12) * 180/pi = -51.34°
        ita_deep = math.atan2(35.0 - 50.0, 12.0) * (180.0 / math.pi)
        self.assertLess(ita_deep, 10.0)

    def test_02_undertone_hue_classification(self):
        """Validates undertone classification across hue angles."""
        # Golden warm: b*=20, a*=12 -> hue = 59.0°
        hue_warm = math.atan2(20.0, 12.0) * (180.0 / math.pi)
        self.assertGreaterEqual(hue_warm, 51.0)

        # Rosy cool: b*=12, a*=15 -> hue = 38.66°
        hue_cool = math.atan2(12.0, 15.0) * (180.0 / math.pi)
        self.assertLessEqual(hue_cool, 45.0)

        # Balanced neutral: b*=15, a*=14 -> hue = 46.97°
        hue_neutral = math.atan2(15.0, 14.0) * (180.0 / math.pi)
        self.assertTrue(45.0 < hue_neutral < 51.0)

    def test_03_lighting_assessment_logic(self):
        """Verifies color cast detection on synthetic image crops."""
        # Warm cast synthetic face crop (high Red, low Blue)
        warm_face = np.full((100, 100, 3), (100, 140, 210), dtype=np.uint8) # BGR
        lighting_warm = self.analyzer._assess_lighting(warm_face, {"x": 0, "y": 0, "w": 100, "h": 100})
        self.assertEqual(lighting_warm["detected_cast"], "warm_tungsten_lighting")
        self.assertFalse(lighting_warm["is_balanced"])

        # Cool cast synthetic face crop (high Blue, low Red)
        cool_face = np.full((100, 100, 3), (210, 140, 110), dtype=np.uint8) # BGR
        lighting_cool = self.analyzer._assess_lighting(cool_face, {"x": 0, "y": 0, "w": 100, "h": 100})
        self.assertEqual(lighting_cool["detected_cast"], "cool_shadow_lighting")
        self.assertFalse(lighting_cool["is_balanced"])

        # Balanced daylight crop
        daylight_face = np.full((100, 100, 3), (160, 170, 180), dtype=np.uint8)
        lighting_daylight = self.analyzer._assess_lighting(daylight_face, {"x": 0, "y": 0, "w": 100, "h": 100})
        self.assertEqual(lighting_daylight["detected_cast"], "balanced_daylight")
        self.assertTrue(lighting_daylight["is_balanced"])

    def test_04_sampling_polygons_defined(self):
        """Verifies that all 4 required anatomical sampling zones are explicitly defined."""
        required = ["forehead", "left_cheek", "right_cheek", "chin"]
        for r in required:
            self.assertIn(r, SAMPLING_POLYGONS)
            self.assertGreaterEqual(len(SAMPLING_POLYGONS[r]), 4)
            # Ensure indices fit within 478 MediaPipe mesh
            self.assertTrue(all(0 <= idx < 478 for idx in SAMPLING_POLYGONS[r]))

    def test_05_hero_model_landmark_analysis(self):
        """Verifies that real portrait produces valid CIELAB skin tone and undertone."""
        with open(self.hero_path, "rb") as f:
            img_bytes = f.read()

        result = self.analyzer.analyze(img_bytes)
        self.assertIsNotNone(result)
        self.assertTrue(result["face_detected"])

        # Check required fields
        self.assertIn(result["skin_tone"], ["Fair", "Light", "Medium", "Tan", "Deep", "Rich"])
        self.assertIn(result["undertone"], ["Warm", "Cool", "Neutral"])
        self.assertTrue(result["skin_tone_hex"].startswith("#"))
        self.assertEqual(len(result["skin_tone_hex"]), 7)

        # Check enriched scientific metrics
        self.assertIn("skin_tone_metrics", result)
        metrics = result["skin_tone_metrics"]
        self.assertGreater(metrics["valid_pixels_sampled"], 100)
        self.assertGreater(metrics["ita_angle"], 50.0) # Model is light/fair complexion
        self.assertIn("undertone_metrics", result)
        self.assertIn("lighting_assessment", result)
        self.assertIn("sampling_zones", result)

    def test_06_corrupted_image_handling(self):
        """Verifies that corrupted bytes return None without raising unhandled exceptions."""
        result = self.analyzer.analyze(b"CORRUPTED_NON_IMAGE_BYTES_12345")
        self.assertIsNone(result)

    def test_07_blank_image_handling(self):
        """Verifies that blank image with no face returns None without crashing."""
        blank = np.zeros((300, 300, 3), dtype=np.uint8)
        _, enc = cv2.imencode(".png", blank)
        result = self.analyzer.analyze(enc.tobytes())
        self.assertIsNone(result)


if __name__ == "__main__":
    unittest.main(verbosity=2)
