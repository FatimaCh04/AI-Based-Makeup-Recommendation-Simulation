import sys, os
sys.path.insert(0, os.path.abspath('.'))
import cv2
from backend.services.mediapipe_client import mediapipe_client

with open('frontend/src/assets/hero-model.png', 'rb') as f:
    res = mediapipe_client.detect_landmarks(f.read())
lms = res['landmarks']
h, w = 512, 512

def print_eye(name, indices):
    print(f"=== {name} ===")
    for i in indices:
        pt = lms[i]
        px, py = pt['x'] * w, pt['y'] * h
        print(f"  {i}: x={px:.1f}, y={py:.1f}")

print_eye("IMAGE LEFT EYE (33 to 133)", [33, 246, 161, 160, 159, 158, 157, 173, 133])
print_eye("IMAGE LEFT CREASE", [190, 56, 28, 27, 29, 30, 247])
print_eye("IMAGE LEFT BROW", [70, 63, 105, 66, 107, 55, 65, 52, 53, 46])

print_eye("IMAGE RIGHT EYE (362 to 263)", [362, 398, 384, 385, 386, 387, 388, 466, 263])
print_eye("IMAGE RIGHT CREASE", [467, 260, 259, 257, 258, 286, 414])
print_eye("IMAGE RIGHT BROW", [336, 296, 334, 293, 300, 276, 283, 282, 295, 285])
