"""
Face Analyzer Service for GlamAI.
Combines MediaPipe landmark-guided facial ROI sampling with CIELAB colorimetry
for high-accuracy, explainable skin tone, undertone, and face shape estimation.

Preserves OpenCV HSV contour detection as a robust fallback when landmarks
are unavailable or severely occluded.
"""

import math
import logging
from typing import Dict, Any, Optional, List, Tuple

import cv2
import numpy as np

# Safe import of the MediaPipe subprocess client bridge
try:
    from services.mediapipe_client import mediapipe_client
except ImportError:
    mediapipe_client = None

logger = logging.getLogger("GlamAI.FaceAnalyzer")

# Canonical landmark indices for safe facial skin sampling polygons
# Selected specifically to avoid eyes, eyebrows, lips, hair, and background
SAMPLING_POLYGONS = {
    # Central forehead: below hairline, above glabella & eyebrows
    "forehead": [67, 109, 10, 338, 297, 337, 151, 108],
    # Left inner cheek: on cheek apple, medial to hair, lateral to nose, below eye
    "left_cheek": [117, 118, 100, 142, 203, 205],
    # Right inner cheek: on cheek apple, medial to hair, lateral to nose, below eye
    "right_cheek": [346, 347, 329, 371, 423, 425],
    # Central chin: below lower lip, above jawline base
    "chin": [199, 200, 18, 175, 152, 377, 400, 176]
}


class FaceAnalyzer:
    def __init__(self):
        """Initialize the FaceAnalyzer with skin detection and colorimetry parameters."""
        # HSV skin color range (fallback)
        self.lower_skin1 = np.array([0, 20, 70], dtype=np.uint8)
        self.upper_skin1 = np.array([20, 255, 255], dtype=np.uint8)
        self.lower_skin2 = np.array([170, 20, 70], dtype=np.uint8)
        self.upper_skin2 = np.array([180, 255, 255], dtype=np.uint8)

        # Minimum skin ratio for HSV fallback face detection
        self.min_skin_ratio = 0.05
        self.min_contour_ratio = 0.01

        logger.info("[GlamAI] FaceAnalyzer initialized with MediaPipe CIELAB & HSV fallback")

    def _decode_image(self, image_bytes: bytes) -> Optional[np.ndarray]:
        """Decode image bytes to a BGR numpy array."""
        if not image_bytes or len(image_bytes) < 16:
            return None
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return img
        except Exception:
            return None

    def _get_skin_mask(self, img: np.ndarray) -> np.ndarray:
        """Generate a binary skin mask from a BGR image using HSV thresholds (fallback)."""
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        mask1 = cv2.inRange(hsv, self.lower_skin1, self.upper_skin1)
        mask2 = cv2.inRange(hsv, self.lower_skin2, self.upper_skin2)
        mask = cv2.bitwise_or(mask1, mask2)

        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
        return mask

    def validate_face(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Check if a face is detected in the image.
        Uses MediaPipe if available, falling back to HSV skin detection.
        Returns dict: { detected: bool, message: str }
        """
        if mediapipe_client and mediapipe_client.is_available():
            try:
                mp_res = mediapipe_client.detect_landmarks(image_bytes)
                if mp_res.get("face_detected"):
                    return {
                        "detected": True,
                        "message": "Face detected successfully"
                    }
            except Exception as e:
                logger.warning("MediaPipe validation check fallback: %s", e)

        # Fallback to HSV skin mask check
        img = self._decode_image(image_bytes)
        if img is None:
            return {
                "detected": False,
                "message": "Could not read the image. Please upload a valid image file."
            }

        mask = self._get_skin_mask(img)
        skin_ratio = np.sum(mask > 0) / mask.size

        if skin_ratio < self.min_skin_ratio:
            return {
                "detected": False,
                "message": "We couldn't detect a clear face. Please upload a front-facing photo with good lighting."
            }

        return {
            "detected": True,
            "message": "Face detected successfully"
        }

    def _assess_lighting(self, img: np.ndarray, face_bounds: Dict[str, int]) -> Dict[str, Any]:
        """
        Assesses ambient lighting, exposure, and color cast from face ROI.
        Helps quantify photographic uncertainty in undertone estimation.
        """
        x = max(0, face_bounds["x"])
        y = max(0, face_bounds["y"])
        w = min(img.shape[1] - x, face_bounds["w"])
        h = min(img.shape[0] - y, face_bounds["h"])

        face_crop = img[y:y+h, x:x+w] if (w > 10 and h > 10) else img
        b_mean = float(np.mean(face_crop[:, :, 0]))
        g_mean = float(np.mean(face_crop[:, :, 1]))
        r_mean = float(np.mean(face_crop[:, :, 2]))

        overall_brightness = (r_mean + g_mean + b_mean) / 3.0

        # Illuminant color cast estimation
        r_to_b = r_mean / (b_mean + 1e-5)
        b_to_r = b_mean / (r_mean + 1e-5)

        if r_to_b > 1.30:
            detected_cast = "warm_tungsten_lighting"
            cast_label = "Warm Light Cast"
            is_balanced = False
        elif b_to_r > 1.18:
            detected_cast = "cool_shadow_lighting"
            cast_label = "Cool Light Cast"
            is_balanced = False
        else:
            detected_cast = "balanced_daylight"
            cast_label = "Balanced Daylight"
            is_balanced = True

        # Exposure assessment
        if overall_brightness < 45:
            quality = "underexposed"
            quality_label = "Low Light (Dark)"
        elif overall_brightness > 220:
            quality = "overexposed"
            quality_label = "Overexposed (Harsh Highlights)"
        else:
            quality = "good_illumination"
            quality_label = "Well-Illuminated"

        return {
            "detected_cast": detected_cast,
            "cast_label": cast_label,
            "is_balanced": is_balanced,
            "lighting_quality": quality,
            "quality_label": quality_label,
            "channel_means": {
                "r": round(r_mean, 1),
                "g": round(g_mean, 1),
                "b": round(b_mean, 1)
            },
            "brightness_level": round(overall_brightness, 1)
        }

    def _assess_pose(self, landmarks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Estimates head pose (Roll, Yaw, Pitch) from MediaPipe landmarks.
        Roll is calculated from outer eye corners (33 and 263).
        Yaw and Pitch are approximate estimates from nose and facial symmetry.
        """
        try:
            # 1. Roll: Angle of inter-ocular line (landmarks 33 and 263)
            p33 = np.array([landmarks[33]["pixel_x"], landmarks[33]["pixel_y"]], dtype=float)
            p263 = np.array([landmarks[263]["pixel_x"], landmarks[263]["pixel_y"]], dtype=float)
            delta = p263 - p33
            roll_rad = math.atan2(delta[1], delta[0])
            roll_deg = math.degrees(roll_rad)
            mid_eye = (p33 + p263) / 2.0

            # 2. Yaw (approximate): Horizontal offset of nose tip (1) from mid-eye center
            p1 = np.array([landmarks[1]["pixel_x"], landmarks[1]["pixel_y"]], dtype=float)
            p234 = np.array([landmarks[234]["pixel_x"], landmarks[234]["pixel_y"]], dtype=float)
            p454 = np.array([landmarks[454]["pixel_x"], landmarks[454]["pixel_y"]], dtype=float)
            w_cheek = np.linalg.norm(p454 - p234)

            yaw_ratio = (p1[0] - mid_eye[0]) / (0.5 * w_cheek + 1e-5)
            yaw_deg = math.degrees(math.asin(float(np.clip(yaw_ratio, -0.85, 0.85))))

            # 3. Pitch (approximate): Ratio of upper face height (10->168) to lower face (168->152)
            p10 = np.array([landmarks[10]["pixel_x"], landmarks[10]["pixel_y"]], dtype=float)
            p168 = np.array([landmarks[168]["pixel_x"], landmarks[168]["pixel_y"]], dtype=float)
            p152 = np.array([landmarks[152]["pixel_x"], landmarks[152]["pixel_y"]], dtype=float)
            h_up = abs(p168[1] - p10[1])
            h_low = abs(p152[1] - p168[1])
            pitch_ratio = h_up / (h_low + 1e-5)
            # Baseline frontal ratio is ~0.55; upward tilt compresses upper face, downward tilt compresses lower
            pitch_deg = float((pitch_ratio - 0.55) * 50.0)

            # Categorize pose quality
            is_frontal = abs(yaw_deg) <= 12.0 and abs(pitch_deg) <= 12.0 and abs(roll_deg) <= 15.0
            if is_frontal:
                quality = "good_frontal"
                warning = None
                conf_factor = 1.0
            elif abs(yaw_deg) <= 22.0 and abs(pitch_deg) <= 20.0:
                quality = "moderate_angle"
                warning = "Moderate head rotation or tilt detected. Proportions are approximate."
                conf_factor = 0.82
            else:
                quality = "extreme_angle"
                warning = "Significant head turn or tilt detected. Face shape estimation may be distorted."
                conf_factor = 0.55

            return {
                "roll_degrees": round(float(roll_deg), 1),
                "yaw_approx_degrees": round(float(yaw_deg), 1),
                "pitch_approx_degrees": round(float(pitch_deg), 1),
                "is_frontal": is_frontal,
                "pose_quality": quality,
                "warning": warning,
                "roll_rad": roll_rad,
                "mid_eye": mid_eye,
                "confidence_factor": conf_factor
            }
        except Exception as e:
            logger.warning("Pose assessment failed: %s", e)
            return {
                "roll_degrees": 0.0,
                "yaw_approx_degrees": 0.0,
                "pitch_approx_degrees": 0.0,
                "is_frontal": True,
                "pose_quality": "unverified",
                "warning": None,
                "roll_rad": 0.0,
                "mid_eye": np.array([0.0, 0.0]),
                "confidence_factor": 0.70
            }

    def _classify_face_shape_from_landmarks(
        self,
        landmarks: List[Dict[str, Any]],
        img_w: int,
        img_h: int
    ) -> Dict[str, Any]:
        """
        Calculates geometric facial ratios from roll-aligned anatomical landmarks
        and computes explainable continuous shape-affinity scores for:
        Oval, Round, Square, Heart, and Oblong.
        """
        try:
            # 1. Pose assessment & roll alignment
            pose = self._assess_pose(landmarks)
            roll_rad = pose.get("roll_rad", 0.0)
            mid_eye = pose.get("mid_eye", np.array([0.0, 0.0]))
            cos_r = math.cos(-roll_rad)
            sin_r = math.sin(-roll_rad)

            def align_pt(idx: int) -> np.ndarray:
                p = np.array([landmarks[idx]["pixel_x"], landmarks[idx]["pixel_y"]], dtype=float) - mid_eye
                return np.array([p[0] * cos_r - p[1] * sin_r, p[0] * sin_r + p[1] * cos_r]) + mid_eye

            ap234 = align_pt(234)  # Left zygion (cheekbone)
            ap454 = align_pt(454)  # Right zygion (cheekbone)
            ap58  = align_pt(58)   # Left gonion (jaw corner)
            ap288 = align_pt(288)  # Right gonion (jaw corner)
            ap54  = align_pt(54)   # Left frontotemporale (forehead)
            ap284 = align_pt(284)  # Right frontotemporale (forehead)
            ap10  = align_pt(10)   # Trichion (top of forehead)
            ap152 = align_pt(152)  # Gnathion (chin tip)
            ap168 = align_pt(168)  # Nasion (nose bridge)

            # Anatomical widths and heights in aligned coordinate frame
            w_cheek = float(np.linalg.norm(ap454 - ap234))
            w_jaw = float(np.linalg.norm(ap288 - ap58))
            w_forehead = float(np.linalg.norm(ap284 - ap54))
            h_physio = float(abs(ap152[1] - ap10[1]))
            h_morpho = float(abs(ap152[1] - ap168[1]))

            if h_physio <= 10 or w_cheek <= 10:
                raise ValueError("Degenerate facial dimensions in landmark mesh")

            # Key dimensionless anthropometric ratios
            far = w_cheek / h_physio               # Face Aspect Ratio (Width / Height)
            jcr = w_jaw / (w_cheek + 1e-5)         # Jaw-to-Cheek Ratio
            fcr = w_forehead / (w_cheek + 1e-5)    # Forehead-to-Cheek Ratio

            # Jawline angle at chin tip (152) formed by vectors 152->58 and 152->288
            v1 = ap58 - ap152
            v2 = ap288 - ap152
            cos_jaw = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-5)
            jaw_angle_deg = float(math.degrees(math.acos(float(np.clip(cos_jaw, -1.0, 1.0)))))

            # 2. Continuous multi-factor shape affinity scoring (Gaussian membership functions)
            def g(val, mu, sigma):
                return math.exp(-((val - mu) ** 2) / (2 * (sigma ** 2)))

            # Round: high aspect ratio (0.88), moderate jaw (0.84), smooth jaw angle
            s_round = g(far, 0.88, 0.06) * g(jcr, 0.84, 0.06) * (1.1 if jcr < 0.88 else 0.9)

            # Oval: balanced aspect ratio (0.77), tapering jaw (0.78), harmonious forehead
            s_oval = g(far, 0.77, 0.05) * g(jcr, 0.78, 0.06) * g(fcr, 0.83, 0.06)

            # Square: high aspect ratio (0.88), wide angular jaw (jcr >= 0.88), wide forehead
            s_square = g(far, 0.88, 0.06) * g(jcr, 0.91, 0.05) * g(fcr, 0.87, 0.06)

            # Heart: inverted triangle, forehead noticeably wider than jaw, narrow tapering chin
            heart_taper = max(0.01, fcr - jcr)
            s_heart = g(far, 0.80, 0.07) * g(jcr, 0.70, 0.06) * g(fcr, 0.90, 0.06) * (1.2 if heart_taper > 0.12 else 0.7)

            # Oblong: elongated face height (low aspect ratio, ~0.65)
            s_oblong = g(far, 0.65, 0.05) * g(jcr, 0.80, 0.07)

            raw_scores = {
                "Oval": s_oval,
                "Round": s_round,
                "Square": s_square,
                "Heart": s_heart,
                "Oblong": s_oblong
            }
            total = sum(raw_scores.values()) + 1e-7
            shape_scores = {k: round(v / total, 3) for k, v in raw_scores.items()}
            sorted_shapes = sorted(shape_scores.items(), key=lambda x: x[1], reverse=True)

            primary_shape, top_score = sorted_shapes[0]
            secondary_shape, second_score = sorted_shapes[1]
            margin = round(top_score - second_score, 3)

            # Ambiguity threshold: if top two shapes are within 0.12 affinity margin
            is_ambiguous = margin < 0.12
            sec_shape_val = secondary_shape if is_ambiguous else None

            # Calibrated confidence (margin-based, scaled by pose stability)
            conf_factor = pose.get("confidence_factor", 1.0)
            calibrated_confidence = round(float(np.clip(0.50 + margin * 0.9, 0.40, 0.95)) * conf_factor, 2)

            # Explainable textual rationale
            if is_ambiguous:
                explanation = (
                    f"Transitional facial structure displaying characteristics of {primary_shape} (score {top_score:.3f}) "
                    f"and {secondary_shape} (score {second_score:.3f}). Aspect ratio is {far:.2f} with jaw/cheek ratio {jcr:.2f}."
                )
            else:
                explanation = (
                    f"Facial proportions align distinctly with {primary_shape} (score {top_score:.3f}, margin {margin:.3f}). "
                    f"Aspect ratio is {far:.2f} with jaw-to-cheek ratio {jcr:.2f} and forehead-to-cheek ratio {fcr:.2f}."
                )

            return {
                "face_shape": primary_shape,
                "face_shape_source": "MediaPipe Landmark Geometric Analysis",
                "face_shape_confidence": calibrated_confidence,
                "face_shape_metrics": {
                    "aspect_ratio": round(far, 3),
                    "jaw_to_cheek_ratio": round(jcr, 3),
                    "forehead_to_cheek_ratio": round(fcr, 3),
                    "jaw_angle_degrees": round(jaw_angle_deg, 1),
                    "distances_pixels": {
                        "cheekbone_width": round(w_cheek, 1),
                        "jaw_width": round(w_jaw, 1),
                        "forehead_width": round(w_forehead, 1),
                        "facial_height": round(h_physio, 1),
                        "morphological_height": round(h_morpho, 1)
                    },
                    "shape_scores": shape_scores,
                    "affinity_margin": margin,
                    "is_ambiguous": is_ambiguous,
                    "secondary_shape": sec_shape_val,
                    "explanation": explanation
                },
                "pose_assessment": {
                    "roll_degrees": pose["roll_degrees"],
                    "yaw_approx_degrees": pose["yaw_approx_degrees"],
                    "pitch_approx_degrees": pose["pitch_approx_degrees"],
                    "is_frontal": pose["is_frontal"],
                    "pose_quality": pose["pose_quality"],
                    "warning": pose["warning"]
                }
            }

        except Exception as e:
            logger.warning("Landmark face-shape classification failed: %s; falling back to Oval", e)
            return {
                "face_shape": "Oval",
                "face_shape_source": "Fallback due to measurement error",
                "face_shape_confidence": 0.40,
                "face_shape_metrics": {
                    "aspect_ratio": 0.77,
                    "jaw_to_cheek_ratio": 0.78,
                    "forehead_to_cheek_ratio": 0.83,
                    "jaw_angle_degrees": 95.0,
                    "distances_pixels": {},
                    "shape_scores": {"Oval": 1.0, "Round": 0.0, "Square": 0.0, "Heart": 0.0, "Oblong": 0.0},
                    "affinity_margin": 1.0,
                    "is_ambiguous": False,
                    "secondary_shape": None,
                    "explanation": "Defaulted to Oval due to numerical exception in geometric landmark extraction."
                },
                "pose_assessment": {
                    "roll_degrees": 0.0,
                    "yaw_approx_degrees": 0.0,
                    "pitch_approx_degrees": 0.0,
                    "is_frontal": True,
                    "pose_quality": "unverified",
                    "warning": "Could not verify pose from landmarks."
                }
            }

    def _analyze_landmarks_skin_tone(
        self,
        img: np.ndarray,
        mp_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Samples valid facial pixels within 4 landmark polygons (forehead, both cheeks, chin),
        applies CIELAB color conversion, filters outliers, and computes explainable
        skin tone depth (ITA°), undertone (hue angle), and face shape proportions.
        """
        h, w, _ = img.shape
        landmarks = mp_data.get("landmarks", [])
        if len(landmarks) < 468:
            return None

        # Build sampling polygon coordinates in pixel space
        def poly_pts(indices: List[int]) -> np.ndarray:
            return np.array(
                [[landmarks[idx]["pixel_x"], landmarks[idx]["pixel_y"]] for idx in indices],
                dtype=np.int32
            )

        zones = {
            "forehead": poly_pts(SAMPLING_POLYGONS["forehead"]),
            "left_cheek": poly_pts(SAMPLING_POLYGONS["left_cheek"]),
            "right_cheek": poly_pts(SAMPLING_POLYGONS["right_cheek"]),
            "chin": poly_pts(SAMPLING_POLYGONS["chin"])
        }

        # Create combined raster mask for the 4 zones
        combined_mask = np.zeros((h, w), dtype=np.uint8)
        zone_pixel_counts = {}

        for zone_name, pts in zones.items():
            z_mask = np.zeros((h, w), dtype=np.uint8)
            cv2.fillPoly(z_mask, [pts], 255)
            cv2.fillPoly(combined_mask, [pts], 255)
            zone_pixel_counts[zone_name] = int(np.sum(z_mask > 0))

        sampled_bgr = img[combined_mask > 0]
        if len(sampled_bgr) < 50:
            logger.warning("Fewer than 50 pixels sampled in facial landmark zones")
            return None

        # Convert sampled pixels to CIELAB
        # Note: cv2 converts BGR to LAB where L in [0, 255], a in [0, 255], b in [0, 255]
        bgr_grid = sampled_bgr.reshape(-1, 1, 3)
        lab_grid = cv2.cvtColor(bgr_grid, cv2.COLOR_BGR2LAB)
        lab_pixels = lab_grid.reshape(-1, 3).astype(np.float32)

        # Scale to standard CIELAB units: L* in [0, 100], a* in [-128, 127], b* in [-128, 127]
        L_star = lab_pixels[:, 0] * (100.0 / 255.0)
        a_star = lab_pixels[:, 1] - 128.0
        b_star = lab_pixels[:, 2] - 128.0

        # Outlier rejection:
        # 1. Reject blown highlights (specular reflection) and deep shadows
        # 2. Reject chromatic outliers using Interquartile Range (IQR) on L*
        q25, q75 = np.percentile(L_star, [25, 75])
        iqr = q75 - q25
        valid_mask = (
            (L_star >= max(15.0, q25 - 1.5 * iqr)) &
            (L_star <= min(98.0, q75 + 1.5 * iqr))
        )

        valid_count = int(np.sum(valid_mask))
        if valid_count < 30:
            # Fall back to un-narrowed mask if IQR was too aggressive
            valid_mask = (L_star > 15.0) & (L_star < 98.0)
            valid_count = int(np.sum(valid_mask))

        if valid_count < 30:
            return None

        filtered_L = L_star[valid_mask]
        filtered_a = a_star[valid_mask]
        filtered_b = b_star[valid_mask]
        filtered_bgr = sampled_bgr[valid_mask]

        # Robust central tendency (median reduces influence of residual makeup or blemishes)
        med_L = float(np.median(filtered_L))
        med_a = float(np.median(filtered_a))
        med_b = float(np.median(filtered_b))
        med_bgr = np.median(filtered_bgr, axis=0).astype(int)

        # Individual Typology Angle (ITA°):
        # ITA = arctan((L* - 50) / b*) * (180 / pi)
        # Higher ITA = lighter, more porcelain/fair skin; Lower ITA = darker, deeper skin
        ita_angle = math.atan2(med_L - 50.0, max(0.5, med_b)) * (180.0 / math.pi)

        # Standard Cosmetic & Dermatological Scale alignment:
        if ita_angle > 55.0 or med_L >= 75.0:
            skin_tone = "Fair"
        elif ita_angle > 41.0 or med_L >= 65.0:
            skin_tone = "Light"
        elif ita_angle > 28.0 or med_L >= 54.0:
            skin_tone = "Medium"
        elif ita_angle > 10.0 or med_L >= 42.0:
            skin_tone = "Tan"
        elif ita_angle > -30.0 or med_L >= 30.0:
            skin_tone = "Deep"
        else:
            skin_tone = "Rich"

        # Representative hex code
        skin_hex = f"#{int(med_bgr[2]):02x}{int(med_bgr[1]):02x}{int(med_bgr[0]):02x}"

        # Bounding box & lighting assessment
        bbox_pixel = mp_data.get("bounding_box", {}).get("pixel", {
            "x_min": 0, "y_min": 0, "width": w, "height": h
        })
        face_bounds = {
            "x": int(bbox_pixel.get("x_min", 0)),
            "y": int(bbox_pixel.get("y_min", 0)),
            "w": int(bbox_pixel.get("width", w)),
            "h": int(bbox_pixel.get("height", h))
        }
        lighting = self._assess_lighting(img, face_bounds)

        # Explainable Undertone Estimation:
        hue_angle = math.atan2(med_b, max(0.1, med_a)) * (180.0 / math.pi)
        b_a_ratio = med_b / (med_a + 1e-5)

        # White balance compensation on hue threshold:
        hue_offset = 0.0
        if lighting["detected_cast"] == "warm_tungsten_lighting":
            hue_offset = -3.0
        elif lighting["detected_cast"] == "cool_shadow_lighting":
            hue_offset = 3.0

        effective_hue = hue_angle + hue_offset

        if effective_hue >= 51.0 or (b_a_ratio >= 1.15 and effective_hue > 47.0):
            undertone = "Warm"
            explanation = (
                f"Golden/yellow pigmentation (b*={med_b:.1f}) is prominent relative to rosy tone (a*={med_a:.1f}) "
                f"with hue angle {hue_angle:.1f}°. Evaluated with {lighting['cast_label']} compensation."
            )
        elif effective_hue <= 45.0 or (b_a_ratio <= 0.95 and effective_hue < 48.0):
            undertone = "Cool"
            explanation = (
                f"Rosy/pink pigmentation (a*={med_a:.1f}) balances or exceeds golden tone (b*={med_b:.1f}) "
                f"with hue angle {hue_angle:.1f}°. Evaluated with {lighting['cast_label']} compensation."
            )
        else:
            undertone = "Neutral"
            explanation = (
                f"Balanced equilibrium between pink (a*={med_a:.1f}) and golden (b*={med_b:.1f}) tones "
                f"with neutral hue angle {hue_angle:.1f}°. Evaluated with {lighting['cast_label']} compensation."
            )

        dist_from_border = min(abs(effective_hue - 45.0), abs(effective_hue - 51.0))
        base_conf = min(0.95, 0.65 + (dist_from_border / 15.0) * 0.25)
        if not lighting["is_balanced"]:
            base_conf *= 0.88
        if lighting["lighting_quality"] != "good_illumination":
            base_conf *= 0.82
        undertone_confidence = round(max(0.40, min(0.95, base_conf)), 2)

        # 3. Geometric face shape classification & pose assessment
        shape_eval = self._classify_face_shape_from_landmarks(landmarks, w, h)
        face_shape = shape_eval["face_shape"]
        face_shape_metrics = shape_eval["face_shape_metrics"]
        face_shape_source = shape_eval["face_shape_source"]
        pose_assessment = shape_eval["pose_assessment"]

        # Fallback skin type estimation from cheek variance (retained for backward compatibility;
        # normally overwritten by EfficientNetB0 in analysis_routes)
        variance = float(np.var(filtered_L))
        if variance > 90:
            skin_type = "Combination"
        elif variance > 50:
            skin_type = "Oily"
        elif med_L > 78:
            skin_type = "Dry"
        else:
            skin_type = "Normal"

        overall_confidence = min(0.98, round(0.78 + (valid_count / len(sampled_bgr)) * 0.15, 2))

        return {
            "face_detected": True,
            "skin_tone": skin_tone,
            "skin_tone_hex": skin_hex,
            "undertone": undertone,
            "face_shape": face_shape,
            "face_shape_source": face_shape_source,
            "face_shape_metrics": face_shape_metrics,
            "pose_assessment": pose_assessment,
            "skin_type": skin_type,
            "confidence": overall_confidence,
            "face_detection_heuristic_confidence": overall_confidence,
            "face_bounds": face_bounds,
            "image_size": {
                "width": w,
                "height": h
            },
            "landmarks": landmarks,
            # Scientific colorimetry and sampling metadata
            "skin_tone_source": "MediaPipe Landmark Sampling (CIELAB/ITA)",
            "skin_tone_metrics": {
                "ita_angle": round(ita_angle, 2),
                "L_star": round(med_L, 2),
                "a_star": round(med_a, 2),
                "b_star": round(med_b, 2),
                "valid_pixels_sampled": valid_count,
                "total_pixels_in_zones": len(sampled_bgr),
                "sampling_efficiency_ratio": round(valid_count / len(sampled_bgr), 3),
                "sampling_zones_count": len(zones)
            },
            "undertone_metrics": {
                "hue_angle_degrees": round(hue_angle, 2),
                "effective_hue_degrees": round(effective_hue, 2),
                "b_to_a_ratio": round(b_a_ratio, 2),
                "undertone_confidence": undertone_confidence,
                "explanation": explanation,
                "is_ground_truth": False,
                "disclaimer": "Photographic undertone is an estimate influenced by ambient lighting and camera white balance."
            },
            "lighting_assessment": lighting,
            "sampling_zones": {
                "zones_pixel_counts": zone_pixel_counts,
                "zones_active": ["forehead", "left_cheek", "right_cheek", "chin"]
            }
        }

    def _analyze_fallback(self, img: np.ndarray) -> Optional[Dict[str, Any]]:
        """
        Original OpenCV HSV skin detection heuristic.
        Preserved as a safety net when facial landmarks cannot be established.
        Explicitly identifies itself as an uncalibrated fallback estimate.
        """
        mask = self._get_skin_mask(img)
        skin_ratio = np.sum(mask > 0) / mask.size

        if skin_ratio < self.min_skin_ratio:
            return None

        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            return None

        largest = max(contours, key=cv2.contourArea)
        min_area = img.shape[0] * img.shape[1] * self.min_contour_ratio
        if cv2.contourArea(largest) < min_area:
            return None

        x, y, w, h = cv2.boundingRect(largest)
        face_roi = img[y:y+h, x:x+w]
        face_mask_roi = mask[y:y+h, x:x+w]
        skin_pixels = face_roi[face_mask_roi > 0]

        if len(skin_pixels) == 0:
            return None

        avg_color = skin_pixels.mean(axis=0)  # BGR
        b, g, r = int(avg_color[0]), int(avg_color[1]), int(avg_color[2])
        skin_hex = f"#{r:02x}{g:02x}{b:02x}"

        brightness = (r + g + b) / 3
        if brightness > 200:
            skin_tone = "Fair"
        elif brightness > 170:
            skin_tone = "Light"
        elif brightness > 140:
            skin_tone = "Medium"
        elif brightness > 110:
            skin_tone = "Tan"
        elif brightness > 80:
            skin_tone = "Deep"
        else:
            skin_tone = "Rich"

        if r > g and r > b:
            undertone = "Warm"
        elif b > r:
            undertone = "Cool"
        else:
            undertone = "Neutral"

        ratio = w / h if h > 0 else 1
        if ratio > 0.85:
            face_shape = "Round"
        elif ratio > 0.75:
            face_shape = "Square"
        elif ratio > 0.65:
            face_shape = "Oval"
        elif ratio > 0.55:
            face_shape = "Heart"
        else:
            face_shape = "Oblong"

        brightness_vals = np.mean(skin_pixels.astype(np.float64), axis=1)
        variance = float(np.var(brightness_vals))
        if variance > 1000:
            skin_type = "Combination"
        elif variance > 500:
            skin_type = "Oily"
        elif brightness > 160:
            skin_type = "Dry"
        else:
            skin_type = "Normal"

        contour_fill = cv2.contourArea(largest) / (img.shape[0] * img.shape[1])
        confidence = min(0.60, round(0.40 + contour_fill * 0.2 + skin_ratio * 0.1, 2))

        return {
            "face_detected": True,
            "skin_tone": skin_tone,
            "skin_tone_hex": skin_hex,
            "undertone": undertone,
            "face_shape": face_shape,
            "face_shape_source": "OpenCV bounding-box fallback (uncalibrated - landmarks unavailable)",
            "face_shape_metrics": {
                "aspect_ratio": round(ratio, 3),
                "jaw_to_cheek_ratio": None,
                "forehead_to_cheek_ratio": None,
                "shape_scores": None,
                "is_ambiguous": True,
                "secondary_shape": None,
                "is_fallback": True,
                "explanation": "Uncalibrated 2D bounding-box estimate derived from HSV skin contour. MediaPipe landmarks were unavailable."
            },
            "pose_assessment": {
                "roll_degrees": 0.0,
                "yaw_approx_degrees": 0.0,
                "pitch_approx_degrees": 0.0,
                "is_frontal": None,
                "pose_quality": "unknown_no_landmarks",
                "warning": "Landmarks unavailable. Head pose and facial proportions could not be verified."
            },
            "skin_type": skin_type,
            "confidence": confidence,
            "face_detection_heuristic_confidence": confidence,
            "face_bounds": {
                "x": int(x),
                "y": int(y),
                "w": int(w),
                "h": int(h)
            },
            "image_size": {
                "width": img.shape[1],
                "height": img.shape[0]
            },
            "skin_tone_source": "OpenCV heuristic fallback (landmark unavailable)"
        }

    def analyze(self, image_bytes: bytes) -> Optional[Dict[str, Any]]:
        """
        Performs full facial analysis:
        1. Tries MediaPipe landmark-guided CIELAB sampling across forehead, cheeks, and chin.
        2. Falls back safely to OpenCV HSV skin contour analysis if landmarks are unavailable.
        Returns complete analysis dictionary or None if no face could be found.
        """
        img = self._decode_image(image_bytes)
        if img is None:
            return None

        # 1. Primary path: MediaPipe Landmark-Guided Analysis
        if mediapipe_client and mediapipe_client.is_available():
            try:
                mp_res = mediapipe_client.detect_landmarks(image_bytes)
                if mp_res.get("face_detected") and mp_res.get("landmarks"):
                    result = self._analyze_landmarks_skin_tone(img, mp_res)
                    if result is not None:
                        # Carry over multiple faces notification if applicable
                        if mp_res.get("multiple_faces_detected"):
                            result["multiple_faces_detected"] = True
                            result["faces_count"] = mp_res.get("faces_count", 1)
                            result["notice"] = mp_res.get("notice")
                        return result
            except Exception as e:
                logger.warning("[GlamAI] MediaPipe landmark analysis failed; using HSV fallback: %s", e)

        # 2. Fallback path: OpenCV HSV heuristic
        logger.info("[GlamAI] Executing OpenCV HSV fallback analysis")
        return self._analyze_fallback(img)
