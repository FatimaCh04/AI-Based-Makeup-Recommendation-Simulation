"""
Integration and regression test suite for MediaPipe facial landmark API and existing endpoints.
Executed inside production environment (backend/venv):
    backend\\venv\\Scripts\\python.exe backend/tests/test_mediapipe_api.py
"""

import io
import sys
import unittest
from pathlib import Path

# Add backend to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import cv2
import numpy as np
from app import app
from services.mediapipe_client import mediapipe_client


class TestMediaPipeAPIAndRegression(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app.config["TESTING"] = True
        cls.client = app.test_client()
        cls.project_root = backend_dir.parent
        cls.portrait_path = cls.project_root / "frontend" / "public" / "hero-model.png"
        if not cls.portrait_path.exists():
            cls.portrait_path = cls.project_root / "frontend" / "src" / "assets" / "hero-model-clean.png"

        with open(cls.portrait_path, "rb") as f:
            cls.portrait_bytes = f.read()

    # -------------------------------------------------------------
    # 1. MediaPipe Subprocess Client Bridge Tests
    # -------------------------------------------------------------
    def test_01_client_availability(self):
        """Verifies that the isolated runner environment is reachable."""
        self.assertTrue(
            mediapipe_client.is_available(),
            f"MediaPipe runner unavailable at {mediapipe_client.python_exe}"
        )

    def test_02_client_detect_valid(self):
        """Client detects landmarks across subprocess boundary."""
        res = mediapipe_client.detect_landmarks(self.portrait_bytes)
        self.assertTrue(res.get("success"))
        self.assertTrue(res.get("face_detected"))
        self.assertEqual(res.get("landmarks_count"), 478)
        self.assertIn("regions", res)

    def test_03_client_detect_corrupt(self):
        """Client handles corrupted bytes gracefully."""
        res = mediapipe_client.detect_landmarks(b"CORRUPTED_BYTES_NOT_AN_IMAGE")
        self.assertFalse(res.get("success"))
        self.assertEqual(res.get("status_code"), 400)

    # -------------------------------------------------------------
    # 2. Flask POST /api/analysis/landmarks Endpoint Tests
    # -------------------------------------------------------------
    def test_04_landmarks_endpoint_missing_file(self):
        """POST /api/analysis/landmarks without 'image' key returns 400."""
        response = self.client.post("/api/analysis/landmarks", data={})
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertFalse(data["success"])
        self.assertIn("No image file provided", data["error"])

    def test_05_landmarks_endpoint_empty_filename(self):
        """POST /api/analysis/landmarks with empty filename returns 400."""
        data = {"image": (io.BytesIO(b"abc"), "")}
        response = self.client.post(
            "/api/analysis/landmarks",
            data=data,
            content_type="multipart/form-data"
        )
        self.assertEqual(response.status_code, 400)
        resp_data = response.get_json()
        self.assertFalse(resp_data["success"])
        self.assertIn("Empty filename", resp_data["error"])

    def test_06_landmarks_endpoint_unsupported_extension(self):
        """POST /api/analysis/landmarks with .txt file returns 400."""
        data = {"image": (io.BytesIO(b"hello text"), "test.txt")}
        response = self.client.post(
            "/api/analysis/landmarks",
            data=data,
            content_type="multipart/form-data"
        )
        self.assertEqual(response.status_code, 400)
        resp_data = response.get_json()
        self.assertFalse(resp_data["success"])
        self.assertIn("Unsupported image file extension", resp_data["error"])

    def test_07_landmarks_endpoint_corrupted_file(self):
        """POST /api/analysis/landmarks with corrupted bytes returns 400."""
        data = {"image": (io.BytesIO(b"not a valid png or jpeg"), "corrupt.png")}
        response = self.client.post(
            "/api/analysis/landmarks",
            data=data,
            content_type="multipart/form-data"
        )
        self.assertEqual(response.status_code, 400)
        resp_data = response.get_json()
        self.assertFalse(resp_data["success"])

    def test_08_landmarks_endpoint_no_face(self):
        """POST /api/analysis/landmarks with blank image returns 422."""
        blank = np.zeros((300, 300, 3), dtype=np.uint8)
        _, enc = cv2.imencode(".png", blank)
        data = {"image": (io.BytesIO(enc.tobytes()), "blank.png")}
        response = self.client.post(
            "/api/analysis/landmarks",
            data=data,
            content_type="multipart/form-data"
        )
        self.assertEqual(response.status_code, 422)
        resp_data = response.get_json()
        self.assertFalse(resp_data["success"])
        self.assertFalse(resp_data["face_detected"])
        self.assertEqual(resp_data["faces_count"], 0)

    def test_09_landmarks_endpoint_success(self):
        """POST /api/analysis/landmarks with valid portrait returns 200, 478 points, and regions."""
        data = {"image": (io.BytesIO(self.portrait_bytes), "portrait.png")}
        response = self.client.post(
            "/api/analysis/landmarks",
            data=data,
            content_type="multipart/form-data"
        )
        self.assertEqual(response.status_code, 200)
        resp_data = response.get_json()

        self.assertTrue(resp_data["success"])
        self.assertTrue(resp_data["face_detected"])
        self.assertEqual(resp_data["faces_count"], 1)
        self.assertEqual(resp_data["landmarks_count"], 478)
        self.assertIn("timestamp", resp_data)
        self.assertEqual(resp_data["filename"], "portrait.png")

        # Check required regions
        regions = resp_data["regions"]
        for key in ["lips", "eyes", "eyebrows", "cheeks", "face_oval", "nose"]:
            self.assertIn(key, regions)

    # -------------------------------------------------------------
    # 3. Regression Tests on Existing Production Endpoints
    # -------------------------------------------------------------
    def test_10_health_check_regression(self):
        """GET /api/health returns healthy and 200."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["status"], "healthy")

    def test_11_validate_face_regression(self):
        """POST /api/analysis/validate returns detected: True for portrait."""
        data = {"image": (io.BytesIO(self.portrait_bytes), "portrait.png")}
        response = self.client.post(
            "/api/analysis/validate",
            data=data,
            content_type="multipart/form-data"
        )
        self.assertEqual(response.status_code, 200)
        resp_data = response.get_json()
        self.assertTrue(resp_data["detected"])

    def test_12_detect_analysis_regression(self):
        """POST /api/analysis/detect returns complete analysis with EfficientNetB0 score."""
        data = {"image": (io.BytesIO(self.portrait_bytes), "portrait.png")}
        response = self.client.post(
            "/api/analysis/detect",
            data=data,
            content_type="multipart/form-data"
        )
        self.assertEqual(response.status_code, 200)
        resp_data = response.get_json()
        self.assertTrue(resp_data["success"])
        analysis = resp_data["analysis"]
        self.assertIn("skin_type", analysis)
        self.assertIn("skin_tone", analysis)
        self.assertIn("undertone", analysis)
        self.assertIn("face_shape", analysis)
        self.assertIn("skin_type_model_score", analysis)
        self.assertEqual(analysis["skin_type_source"], "EfficientNetB0")


if __name__ == "__main__":
    unittest.main(verbosity=2)
