"""
MediaPipe Face Landmarker Service for GlamAI.
Operates inside the isolated MediaPipe runtime environment (Python 3.12 + mediapipe==1.1.1).

Provides high-resolution 478-point 3D facial landmark detection and semantic
region partitioning for lips, eyes, eyebrows, cheeks, face oval, and nose.
"""

import os
import sys
import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

import cv2
import numpy as np

# Canonical MediaPipe 478-mesh landmark index definitions
FACIAL_REGIONS = {
    "lips": {
        "outer": [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61],
        "inner": [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78],
        "upper_outer": [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291],
        "lower_outer": [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291],
        "upper_inner": [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308],
        "lower_inner": [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308],
    },
    "eyes": {
        "left_eye": [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7],
        "right_eye": [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249],
        "left_iris": [468, 469, 470, 471, 472],
        "right_iris": [473, 474, 475, 476, 477],
    },
    "eyebrows": {
        "left_eyebrow": [70, 63, 105, 66, 107, 55, 65, 52, 53, 46],
        "right_eyebrow": [336, 296, 334, 293, 300, 285, 295, 282, 283, 276],
    },
    "cheeks": {
        "left_cheek": [234, 93, 132, 58, 172, 136, 150, 149, 176, 148],
        "right_cheek": [454, 323, 361, 288, 397, 365, 379, 378, 400, 377],
        "left_center": 205,
        "right_center": 425,
    },
    "face_oval": [
        10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379,
        378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127,
        162, 21, 54, 103, 67, 109, 10
    ],
    "nose": {
        "bridge": [168, 6, 197, 195, 5],
        "tip": [4, 1, 19, 94, 2],
        "nostrils": [98, 97, 2, 326, 327],
        "all": [168, 6, 197, 195, 5, 4, 1, 19, 94, 2, 98, 97, 326, 327]
    }
}


class MediaPipeLandmarkDetector:
    """
    Encapsulates MediaPipe FaceLandmarker Tasks API with structured output formatting,
    semantic region mapping, bounding box generation, and graceful error handling.
    """

    def __init__(self, model_path: Optional[str] = None, max_faces: int = 4):
        self.max_faces = max_faces
        if model_path is None:
            # Resolve relative to backend/
            base_dir = Path(__file__).resolve().parent.parent
            model_path = str(base_dir / "models" / "face_landmarker.task")

        self.model_path = model_path
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"MediaPipe Face Landmarker model asset not found: {self.model_path}")

        self._detector = None
        self._init_detector()

    def _init_detector(self):
        """Initializes the MediaPipe FaceLandmarker vision task."""
        try:
            import mediapipe as mp
            from mediapipe.tasks import python
            from mediapipe.tasks.python import vision

            self._mp = mp
            base_options = python.BaseOptions(model_asset_path=self.model_path)
            options = vision.FaceLandmarkerOptions(
                base_options=base_options,
                output_face_blendshapes=False,
                output_facial_transformation_matrixes=False,
                num_faces=self.max_faces,
                min_face_detection_confidence=0.5,
                min_face_presence_confidence=0.5,
                min_tracking_confidence=0.5,
            )
            self._detector = vision.FaceLandmarker.create_from_options(options)
        except Exception as exc:
            raise RuntimeError(f"Failed to initialize MediaPipe FaceLandmarker: {exc}") from exc

    def _decode_image(self, image_bytes: bytes) -> Optional[np.ndarray]:
        """Decodes raw image bytes into a BGR NumPy array with error tolerance."""
        if not image_bytes or len(image_bytes) < 16:
            return None
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return img
        except Exception:
            return None

    def _extract_face_data(self, landmarks, img_w: int, img_h: int) -> Dict[str, Any]:
        """Converts raw MediaPipe landmarks into structured landmark list, bounding box, and regions."""
        all_landmarks = []
        xs, ys, zs = [], [], []

        for idx, lm in enumerate(landmarks):
            norm_x = round(float(lm.x), 5)
            norm_y = round(float(lm.y), 5)
            norm_z = round(float(lm.z), 5)
            px_x = int(round(norm_x * img_w))
            px_y = int(round(norm_y * img_h))

            xs.append(norm_x)
            ys.append(norm_y)
            zs.append(norm_z)

            all_landmarks.append({
                "index": idx,
                "x": norm_x,
                "y": norm_y,
                "z": norm_z,
                "pixel_x": px_x,
                "pixel_y": px_y
            })

        # Bounding box
        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)
        box_w = max_x - min_x
        box_h = max_y - min_y

        bounding_box = {
            "normalized": {
                "x_min": round(min_x, 5),
                "y_min": round(min_y, 5),
                "x_max": round(max_x, 5),
                "y_max": round(max_y, 5),
                "width": round(box_w, 5),
                "height": round(box_h, 5)
            },
            "pixel": {
                "x_min": max(0, int(round(min_x * img_w))),
                "y_min": max(0, int(round(min_y * img_h))),
                "x_max": min(img_w, int(round(max_x * img_w))),
                "y_max": min(img_h, int(round(max_y * img_h))),
                "width": int(round(box_w * img_w)),
                "height": int(round(box_h * img_h))
            }
        }

        # Helper to map index list to coordinates
        def map_indices(idx_list: List[int]) -> List[Dict[str, Any]]:
            pts = []
            for i in idx_list:
                if i < len(all_landmarks):
                    pts.append(all_landmarks[i])
            return pts

        # Region definitions with coordinates
        regions = {
            "lips": {
                "indices": FACIAL_REGIONS["lips"],
                "outer": map_indices(FACIAL_REGIONS["lips"]["outer"]),
                "inner": map_indices(FACIAL_REGIONS["lips"]["inner"]),
                "upper_outer": map_indices(FACIAL_REGIONS["lips"]["upper_outer"]),
                "lower_outer": map_indices(FACIAL_REGIONS["lips"]["lower_outer"]),
                "upper_inner": map_indices(FACIAL_REGIONS["lips"]["upper_inner"]),
                "lower_inner": map_indices(FACIAL_REGIONS["lips"]["lower_inner"]),
            },
            "eyes": {
                "left_eye": map_indices(FACIAL_REGIONS["eyes"]["left_eye"]),
                "right_eye": map_indices(FACIAL_REGIONS["eyes"]["right_eye"]),
                "left_iris": map_indices(FACIAL_REGIONS["eyes"]["left_iris"]),
                "right_iris": map_indices(FACIAL_REGIONS["eyes"]["right_iris"]),
                "indices": FACIAL_REGIONS["eyes"],
            },
            "eyebrows": {
                "left_eyebrow": map_indices(FACIAL_REGIONS["eyebrows"]["left_eyebrow"]),
                "right_eyebrow": map_indices(FACIAL_REGIONS["eyebrows"]["right_eyebrow"]),
                "indices": FACIAL_REGIONS["eyebrows"],
            },
            "cheeks": {
                "left_cheek": map_indices(FACIAL_REGIONS["cheeks"]["left_cheek"]),
                "right_cheek": map_indices(FACIAL_REGIONS["cheeks"]["right_cheek"]),
                "left_center": all_landmarks[FACIAL_REGIONS["cheeks"]["left_center"]],
                "right_center": all_landmarks[FACIAL_REGIONS["cheeks"]["right_center"]],
                "indices": FACIAL_REGIONS["cheeks"],
            },
            "face_oval": {
                "points": map_indices(FACIAL_REGIONS["face_oval"]),
                "indices": FACIAL_REGIONS["face_oval"],
            },
            "nose": {
                "bridge": map_indices(FACIAL_REGIONS["nose"]["bridge"]),
                "tip": map_indices(FACIAL_REGIONS["nose"]["tip"]),
                "nostrils": map_indices(FACIAL_REGIONS["nose"]["nostrils"]),
                "all": map_indices(FACIAL_REGIONS["nose"]["all"]),
                "indices": FACIAL_REGIONS["nose"],
            }
        }

        # Approximate face area for multi-face sorting (largest first)
        approx_area = box_w * box_h

        return {
            "landmarks_count": len(all_landmarks),
            "bounding_box": bounding_box,
            "approx_area": approx_area,
            "landmarks": all_landmarks,
            "regions": regions
        }

    def detect(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Executes facial landmark detection on raw image bytes.
        Returns standardized JSON dict with status, dimensions, landmarks, and semantic regions.
        """
        img_bgr = self._decode_image(image_bytes)
        if img_bgr is None:
            return {
                "success": False,
                "face_detected": False,
                "error": "Invalid or corrupted image data. Could not decode image.",
                "error_type": "INVALID_IMAGE",
                "status_code": 400
            }

        h, w, c = img_bgr.shape
        if h < 20 or w < 20:
            return {
                "success": False,
                "face_detected": False,
                "error": f"Image resolution too small ({w}x{h}). Minimum size is 20x20 pixels.",
                "error_type": "RESOLUTION_TOO_LOW",
                "status_code": 400
            }

        try:
            img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
            mp_image = self._mp.Image(image_format=self._mp.ImageFormat.SRGB, data=img_rgb)
            detection_result = self._detector.detect(mp_image)
        except Exception as exc:
            return {
                "success": False,
                "face_detected": False,
                "error": f"Landmark inference engine failed: {str(exc)}",
                "error_type": "INFERENCE_ERROR",
                "status_code": 500
            }

        face_landmarks_list = detection_result.face_landmarks
        if not face_landmarks_list:
            return {
                "success": False,
                "face_detected": False,
                "faces_count": 0,
                "image_dimensions": {"width": w, "height": h, "channels": c},
                "message": "No face detected in the image. Please upload a clear front-facing portrait with good lighting.",
                "error_type": "NO_FACE_DETECTED",
                "status_code": 422
            }

        # Process each detected face
        faces_data = []
        for face_lms in face_landmarks_list:
            face_item = self._extract_face_data(face_lms, w, h)
            faces_data.append(face_item)

        # Sort faces by approximate bounding box area (descending) so primary is first
        faces_data.sort(key=lambda f: f["approx_area"], reverse=True)
        primary_face = faces_data[0]
        faces_count = len(faces_data)

        response = {
            "success": True,
            "face_detected": True,
            "faces_count": faces_count,
            "multiple_faces_detected": faces_count > 1,
            "image_dimensions": {
                "width": w,
                "height": h,
                "channels": c
            },
            "bounding_box": primary_face["bounding_box"],
            "landmarks_count": primary_face["landmarks_count"],
            "landmarks": primary_face["landmarks"],
            "regions": primary_face["regions"]
        }

        if faces_count > 1:
            response["notice"] = (
                f"Multiple faces detected ({faces_count}). Analysis prioritized the most prominent face."
            )
            # Include lightweight summaries for additional faces
            response["additional_faces"] = [
                {
                    "face_index": idx + 1,
                    "bounding_box": face["bounding_box"]
                }
                for idx, face in enumerate(faces_data[1:])
            ]

        return response


# Standalone CLI / stdin runner for process isolation
if __name__ == "__main__":
    try:
        # If image path argument is provided and exists, read from file; else read stdin buffer
        if len(sys.argv) > 1 and sys.argv[1] != "-" and os.path.exists(sys.argv[1]):
            with open(sys.argv[1], "rb") as f:
                input_bytes = f.read()
        else:
            input_bytes = sys.stdin.buffer.read()

        detector = MediaPipeLandmarkDetector()
        res = detector.detect(input_bytes)
        output_json = json.dumps(res, indent=None)
        sys.stdout.write(output_json)
        sys.stdout.flush()
        sys.exit(0 if res.get("success") else (0 if res.get("status_code") == 422 else 1))

    except Exception as e:
        err_dict = {
            "success": False,
            "face_detected": False,
            "error": str(e),
            "error_type": type(e).__name__,
            "status_code": 500
        }
        sys.stdout.write(json.dumps(err_dict))
        sys.stdout.flush()
        sys.exit(1)
