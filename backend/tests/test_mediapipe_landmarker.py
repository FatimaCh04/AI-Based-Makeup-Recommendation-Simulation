"""
Reusable test script to verify MediaPipe FaceLandmarker installation and inference.
Run inside the MediaPipe test environment:
    backend\\venv_mediapipe_test\\Scripts\\python.exe backend/tests/test_mediapipe_landmarker.py [optional_image_path]
"""

import sys
import os
from pathlib import Path

# Fix Windows console UTF-8 output if needed
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

def run_verification(image_path=None):
    print("=" * 65)
    print(" GlamAI - MediaPipe FaceLandmarker Runtime Verification")
    print("=" * 65)

    # 1. Environment and Version Checks
    print("\n[1/5] Checking Environment & Package Versions:")
    print(f"  Python:    {sys.version.split()[0]} ({sys.platform})")
    
    try:
        import mediapipe as mp
        print(f"  MediaPipe: {getattr(mp, '__version__', 'unknown')}")
    except ImportError as e:
        print(f"  [FAIL] MediaPipe import failed: {e}")
        return False

    try:
        import numpy as np
        print(f"  NumPy:     {np.__version__}")
    except ImportError as e:
        print(f"  [FAIL] NumPy import failed: {e}")
        return False

    try:
        import cv2
        print(f"  OpenCV:    {cv2.__version__}")
    except ImportError as e:
        print(f"  [FAIL] OpenCV import failed: {e}")
        return False

    try:
        import google.protobuf as pb
        print(f"  Protobuf:  {pb.__version__}")
    except ImportError:
        print("  Protobuf:  Not installed (MediaPipe 1.1+ uses FlatBuffers runtime)")

    # 2. Check Model Asset
    print("\n[2/5] Locating Model Asset:")
    base_dir = Path(__file__).resolve().parent.parent  # backend/
    model_path = base_dir / "models" / "face_landmarker.task"
    if not model_path.exists():
        print(f"  [FAIL] Model file not found at: {model_path}")
        return False
    
    model_size_mb = model_path.stat().st_size / (1024 * 1024)
    print(f"  Model Path: {model_path}")
    print(f"  Model Size: {model_size_mb:.2f} MB")

    # 3. Locate Test Image
    print("\n[3/5] Locating Test Portrait:")
    project_root = base_dir.parent
    if image_path:
        target_img_path = Path(image_path).resolve()
    else:
        # Check standard project image locations
        candidates = [
            project_root / "frontend" / "public" / "hero-model.png",
            project_root / "frontend" / "src" / "assets" / "hero-model-clean.png",
            project_root / "frontend" / "src" / "assets" / "login-model-merged.png",
        ]
        target_img_path = None
        for candidate in candidates:
            if candidate.exists():
                target_img_path = candidate
                break

    if not target_img_path or not target_img_path.exists():
        print(f"  [FAIL] No valid test portrait found at {target_img_path}")
        return False

    print(f"  Image Path: {target_img_path}")
    img_bgr = cv2.imread(str(target_img_path))
    if img_bgr is None:
        print(f"  [FAIL] OpenCV failed to decode image at {target_img_path}")
        return False
    h, w, c = img_bgr.shape
    print(f"  Image Size: {w}x{h} (channels: {c})")

    # 4. Initialize MediaPipe FaceLandmarker
    print("\n[4/5] Initializing FaceLandmarker:")
    try:
        from mediapipe.tasks import python
        from mediapipe.tasks.python import vision

        base_options = python.BaseOptions(model_asset_path=str(model_path))
        options = vision.FaceLandmarkerOptions(
            base_options=base_options,
            output_face_blendshapes=False,
            output_facial_transformation_matrixes=False,
            num_faces=1
        )
        detector = vision.FaceLandmarker.create_from_options(options)
        print("  FaceLandmarker detector initialized successfully.")
    except Exception as e:
        print(f"  [FAIL] Failed to create FaceLandmarker: {e}")
        return False

    # 5. Run Inference
    print("\n[5/5] Running Face Landmark Inference:")
    try:
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
        detection_result = detector.detect(mp_image)

        face_landmarks_list = detection_result.face_landmarks
        if not face_landmarks_list:
            print("  [FAIL] No faces detected in test image.")
            return False

        num_faces = len(face_landmarks_list)
        landmarks = face_landmarks_list[0]
        num_landmarks = len(landmarks)
        print(f"  Faces Detected:   {num_faces}")
        print(f"  Landmarks Count:  {num_landmarks} per face")

        if num_landmarks != 478:
            print(f"  [WARNING] Expected 478 landmarks (with irises), received {num_landmarks}")
        else:
            print("  [SUCCESS] All 478 standard 3D facial mesh landmarks detected.")

        # Key anatomical landmark indices in MediaPipe 478 mesh:
        # 1: Nose tip
        # 10: Forehead top center
        # 152: Chin bottom center
        # 234: Left cheek outer boundary
        # 454: Right cheek outer boundary
        # 468: Left iris center
        # 473: Right iris center
        key_points = {
            "Nose Tip": 1,
            "Forehead Center": 10,
            "Chin Center": 152,
            "Left Cheek Outer": 234,
            "Right Cheek Outer": 454,
            "Left Iris Center": 468,
            "Right Iris Center": 473,
        }

        print("\n  Sample Anatomical Landmarks:")
        for name, idx in key_points.items():
            if idx < len(landmarks):
                lm = landmarks[idx]
                px = int(lm.x * w)
                py = int(lm.y * h)
                print(f"    - {name:<18} (Index {idx:>3}): norm=({lm.x:.4f}, {lm.y:.4f}, {lm.z:.4f}) -> pixel=({px:>4}, {py:>4})")

        print("\n" + "=" * 65)
        print(" VERIFICATION PASSED: MediaPipe runtime is fully operational.")
        print("=" * 65)
        return True

    except Exception as e:
        print(f"  [FAIL] Inference failed with error: {e}")
        return False


if __name__ == "__main__":
    cli_image = sys.argv[1] if len(sys.argv) > 1 else None
    success = run_verification(cli_image)
    sys.exit(0 if success else 1)
