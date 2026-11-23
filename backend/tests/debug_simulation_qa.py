import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import cv2
import json
from services.mediapipe_client import mediapipe_client

img_path = "tests/qa_visual_outputs/login_model_01_original_portrait.png"
img = cv2.imread(img_path)
if img is None:
    print("Could not read image:", img_path)
    exit(1)

h, w = img.shape[:2]
print(f"Image shape: {w}x{h}")

with open(img_path, "rb") as f:
    img_bytes = f.read()

landmarks = mediapipe_client.detect_landmarks(img_bytes)
if not landmarks:
    print("No landmarks detected")
    exit(1)

print(f"Landmarks type: {type(landmarks)}")
if isinstance(landmarks, dict):
    print("Keys in landmarks:", list(landmarks.keys()))
    if "landmarks" in landmarks:
        print(f"Inside 'landmarks': {len(landmarks['landmarks'])}")
        lms = landmarks["landmarks"]
    else:
        lms = landmarks
else:
    print(f"Length of landmarks: {len(landmarks)}")
    lms = landmarks

with open("tests/login_model_landmarks.json", "w") as f:
    json.dump(landmarks, f)
print("Saved landmarks to tests/login_model_landmarks.json")
