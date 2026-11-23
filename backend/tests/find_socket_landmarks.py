import sys, os
sys.path.insert(0, os.path.abspath('.'))
from backend.services.mediapipe_client import mediapipe_client

with open('frontend/src/assets/hero-model.png', 'rb') as f:
    res = mediapipe_client.detect_landmarks(f.read())
lms = res['landmarks']
h, w = 512, 512

print("Landmarks between crease (y~160) and brow (y~145) for LEFT eye (x: 125-160):")
for i, pt in enumerate(lms):
    x, y = pt['x']*w, pt['y']*h
    if 125 <= x <= 162 and 150 <= y <= 167:
        print(f"  idx {i}: x={x:.1f}, y={y:.1f}")

print("\nLandmarks between crease (y~180) and brow (y~165) for RIGHT eye (x: 185-235):")
for i, pt in enumerate(lms):
    x, y = pt['x']*w, pt['y']*h
    if 185 <= x <= 235 and 170 <= y <= 186:
        print(f"  idx {i}: x={x:.1f}, y={y:.1f}")
