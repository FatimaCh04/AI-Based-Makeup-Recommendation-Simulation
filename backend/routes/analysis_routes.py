"""
Analysis Routes for GlamAI
Handles image upload, facial feature detection, MediaPipe landmark extraction,
and skin analysis using real OpenCV-based image processing and isolated MediaPipe runtime.
"""

import os
import time
from flask import Blueprint, request, jsonify
from services.face_analyzer import FaceAnalyzer
from services.skin_type_predictor import predict_skin_type
from services.mediapipe_client import mediapipe_client

analysis_bp = Blueprint('analysis', __name__)

# Initialize the face analyzer service
face_analyzer = FaceAnalyzer()


@analysis_bp.route('/validate', methods=['POST'])
def validate_face():
    """
    Quick face detection check.
    Accepts multipart/form-data with 'image' file.
    Returns { success, detected, message }
    """
    if 'image' not in request.files:
        return jsonify({
            "success": False,
            "detected": False,
            "message": "No image file provided. Please upload an image."
        }), 400

    image_file = request.files['image']
    if image_file.filename == '':
        return jsonify({
            "success": False,
            "detected": False,
            "message": "Empty filename. Please select a valid image."
        }), 400

    try:
        image_bytes = image_file.read()
        result = face_analyzer.validate_face(image_bytes)

        return jsonify({
            "success": True,
            "detected": result["detected"],
            "message": result["message"]
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "detected": False,
            "message": f"Error processing image: {str(e)}"
        }), 500


@analysis_bp.route('/detect', methods=['POST'])
def detect_facial_features():
    """
    Performs facial feature detection, landmark sampling, and skin analysis on an uploaded image.
    Accepts multipart/form-data with 'image' file.
    Returns real analysis results from OpenCV + MediaPipe + EfficientNetB0 processing.
    """
    if 'image' not in request.files:
        return jsonify({
            "success": False,
            "error": "No image file provided. Please upload an image with the key 'image'."
        }), 400

    image_file = request.files['image']
    if image_file.filename == '':
        return jsonify({
            "success": False,
            "error": "Empty filename. Please select a valid image."
        }), 400

    try:
        image_bytes = image_file.read()
        analysis = face_analyzer.analyze(image_bytes)

        if analysis is None:
            return jsonify({
                "success": False,
                "error": "Could not detect a face in the image. Please upload a clear, front-facing photo with good lighting."
            }), 422

        # AI skin-type prediction via EfficientNetB0
        try:
            ai_result = predict_skin_type(image_bytes)

            analysis["skin_type"] = ai_result["skin_type"]
            analysis["ai_predicted_skin_type"] = ai_result["skin_type"]
            analysis["skin_type_source"] = "EfficientNetB0"
            analysis["skin_type_probabilities"] = ai_result["probabilities"]
            pred_prob_key = ai_result["skin_type"].lower()
            analysis["skin_type_model_score"] = ai_result.get("model_score") or ai_result["probabilities"].get(pred_prob_key)
            analysis["skin_type_requires_confirmation"] = True
            analysis["face_detection_heuristic_confidence"] = analysis.get("confidence")

        except Exception as model_error:
            print(
                "[GlamAI] Skin-type model inference failed:",
                type(model_error).__name__,
                str(model_error)
            )
            analysis["skin_type_source"] = "OpenCV heuristic fallback"
            analysis["ai_predicted_skin_type"] = analysis.get("skin_type", "Normal")
            analysis["skin_type_model_score"] = None
            analysis["skin_type_requires_confirmation"] = True
            analysis["skin_type_model_error"] = True

        response_data = {
            "success": True,
            "timestamp": time.time(),
            "analysis": analysis,
            "disclaimer": "Estimates generated via computer vision skin analysis for makeup recommendation purposes."
        }
        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Error processing image: {str(e)}"
        }), 500


@analysis_bp.route('/landmarks', methods=['POST'])
def detect_landmarks():
    """
    Detects 478 MediaPipe facial landmarks and extracts semantic facial regions
    (lips, eyes, eyebrows, cheeks, face oval, nose) using the isolated MediaPipe runtime.
    Accepts multipart/form-data with 'image' file.
    """
    if 'image' not in request.files:
        return jsonify({
            "success": False,
            "face_detected": False,
            "error": "No image file provided. Please upload an image with the key 'image'."
        }), 400

    image_file = request.files['image']
    if image_file.filename == '':
        return jsonify({
            "success": False,
            "face_detected": False,
            "error": "Empty filename. Please select a valid image."
        }), 400

    # Validate file extension
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.bmp'}
    ext = os.path.splitext(image_file.filename)[1].lower()
    if ext and ext not in allowed_extensions:
        return jsonify({
            "success": False,
            "face_detected": False,
            "error": f"Unsupported image file extension '{ext}'. Allowed extensions: {', '.join(sorted(allowed_extensions))}"
        }), 400

    try:
        image_bytes = image_file.read()
        if not image_bytes or len(image_bytes) < 16:
            return jsonify({
                "success": False,
                "face_detected": False,
                "error": "Image file is empty or corrupted."
            }), 400

        result = mediapipe_client.detect_landmarks(image_bytes)
        status_code = result.get("status_code", 200 if result.get("success") else 500)

        # Include metadata in response
        result["timestamp"] = time.time()
        result["filename"] = image_file.filename

        return jsonify(result), status_code

    except Exception as e:
        return jsonify({
            "success": False,
            "face_detected": False,
            "error": f"Failed to process facial landmarks: {str(e)}"
        }), 500


@analysis_bp.route('/history', methods=['GET'])
def get_analysis_history():
    """Returns list of previous user analyses (mock data for now)"""
    mock_history = [
        {
            "id": "look-001",
            "title": "Night Wedding Glam",
            "occasion": "Wedding",
            "style": "Warm Rose & Gold",
            "date": "18 Aug 2026",
            "before_image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
            "after_image": "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80",
            "shades": {
                "lipstick": {"name": "Velvet Crimson", "hex": "#8B263E"},
                "foundation": {"name": "Warm Honey", "hex": "#D19F78"},
                "eyeshadow": {"name": "Gilded Copper", "hex": "#A46638"},
                "blush": {"name": "Sunlit Terracotta", "hex": "#D37D64"}
            },
            "is_favorite": True
        },
        {
            "id": "look-002",
            "title": "Cocktail Party Luxe",
            "occasion": "Party",
            "style": "Smokey Berry & Rose",
            "date": "15 Aug 2026",
            "before_image": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
            "after_image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
            "shades": {
                "lipstick": {"name": "Berry Plum", "hex": "#722F37"},
                "foundation": {"name": "Golden Beige", "hex": "#DEAB82"},
                "eyeshadow": {"name": "Shimmer Bronze", "hex": "#8F5E43"},
                "blush": {"name": "Rosy Flush", "hex": "#D87080"}
            },
            "is_favorite": False
        },
        {
            "id": "look-003",
            "title": "Natural Office Glow",
            "occasion": "Office",
            "style": "Soft Matte Nude",
            "date": "10 Aug 2026",
            "before_image": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
            "after_image": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80",
            "shades": {
                "lipstick": {"name": "Rose Nude", "hex": "#BC6C7B"},
                "foundation": {"name": "Natural Almond", "hex": "#E0B392"},
                "eyeshadow": {"name": "Soft Taupe", "hex": "#967A6B"},
                "blush": {"name": "Warm Peach", "hex": "#E6917A"}
            },
            "is_favorite": True
        }
    ]
    return jsonify({"success": True, "history": mock_history}), 200
