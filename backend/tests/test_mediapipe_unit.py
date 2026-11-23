"""
Focused unit tests for MediaPipeLandmarkDetector.
Executed inside backend/venv_mediapipe_test:
    backend\\venv_mediapipe_test\\Scripts\\python.exe backend/tests/test_mediapipe_unit.py
"""

import sys
import unittest
from pathlib import Path

# Add backend to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import cv2
import numpy as np
from services.mediapipe_service import MediaPipeLandmarkDetector, FACIAL_REGIONS


class TestMediaPipeLandmarkDetector(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.detector = MediaPipeLandmarkDetector()
        cls.project_root = backend_dir.parent
        cls.valid_image_path = cls.project_root / "frontend" / "public" / "hero-model.png"
        if not cls.valid_image_path.exists():
            cls.valid_image_path = cls.project_root / "frontend" / "src" / "assets" / "hero-model-clean.png"

    def test_01_init_detector(self):
        """Detector initializes and model file exists."""
        self.assertIsNotNone(self.detector._detector)
        self.assertTrue(Path(self.detector.model_path).exists())

    def test_02_valid_face_detection(self):
        """Valid portrait produces 478 landmarks and required semantic regions."""
        with open(self.valid_image_path, "rb") as f:
            img_bytes = f.read()

        result = self.detector.detect(img_bytes)
        self.assertTrue(result["success"])
        self.assertTrue(result["face_detected"])
        self.assertEqual(result["faces_count"], 1)
        self.assertEqual(result["landmarks_count"], 478)

        # Validate bounding box
        bbox = result["bounding_box"]
        self.assertIn("normalized", bbox)
        self.assertIn("pixel", bbox)
        self.assertGreater(bbox["pixel"]["width"], 50)
        self.assertGreater(bbox["pixel"]["height"], 50)

        # Validate image dimensions
        dims = result["image_dimensions"]
        self.assertGreater(dims["width"], 100)
        self.assertGreater(dims["height"], 100)

        # Validate semantic regions
        regions = result["regions"]
        required_regions = ["lips", "eyes", "eyebrows", "cheeks", "face_oval", "nose"]
        for region in required_regions:
            self.assertIn(region, regions, f"Missing required region: {region}")

        # Check landmarks values are normalized [0, 1]
        for lm in result["landmarks"]:
            self.assertGreaterEqual(lm["x"], -0.2)
            self.assertLessEqual(lm["x"], 1.2)
            self.assertGreaterEqual(lm["y"], -0.2)
            self.assertLessEqual(lm["y"], 1.2)

    def test_03_no_face_blank_image(self):
        """Blank image returns graceful no-face response with status 422."""
        blank = np.zeros((300, 300, 3), dtype=np.uint8)
        _, enc = cv2.imencode(".png", blank)
        result = self.detector.detect(enc.tobytes())

        self.assertFalse(result["success"])
        self.assertFalse(result["face_detected"])
        self.assertEqual(result["faces_count"], 0)
        self.assertEqual(result["status_code"], 422)
        self.assertIn("No face detected", result["message"])

    def test_04_corrupted_image_bytes(self):
        """Corrupted/invalid bytes returns status 400 without crashing."""
        invalid_bytes = b"NOT_A_VALID_IMAGE_HEADER_GARBAGE_BYTES_12345"
        result = self.detector.detect(invalid_bytes)

        self.assertFalse(result["success"])
        self.assertFalse(result["face_detected"])
        self.assertEqual(result["status_code"], 400)
        self.assertEqual(result["error_type"], "INVALID_IMAGE")

    def test_05_multi_face_detection(self):
        """Side-by-side composite detects multiple faces and prioritizes primary."""
        img = cv2.imread(str(self.valid_image_path))
        double_img = np.hstack([img, img])
        _, enc = cv2.imencode(".png", double_img)

        result = self.detector.detect(enc.tobytes())
        self.assertTrue(result["success"])
        self.assertTrue(result["face_detected"])
        self.assertEqual(result["faces_count"], 2)
        self.assertTrue(result["multiple_faces_detected"])
        self.assertIn("notice", result)
        self.assertEqual(len(result["additional_faces"]), 1)


if __name__ == "__main__":
    unittest.main(verbosity=2)
