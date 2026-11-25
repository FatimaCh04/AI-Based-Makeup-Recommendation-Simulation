"""
EfficientNetB0 skin-type inference service for GlamAI using ONNX Runtime.
Executes lightweight, high-performance CPU inference on Vercel Serverless.
Experimental prediction; user confirmation required.
"""

import io
import json
import logging
from pathlib import Path
from typing import Dict, Any, Tuple, Optional

import numpy as np
from PIL import Image, ImageOps

logger = logging.getLogger("GlamAI.SkinTypePredictor")

BACKEND_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BACKEND_DIR / "models"
CONFIG_PATH = MODEL_DIR / "skin_type_config.json"
ONNX_MODEL_PATH = MODEL_DIR / "skin_type_efficientnetb0.onnx"

_session = None
_config = None
_input_name = None
_output_name = None


def load_skin_type_model() -> Tuple[Any, Dict[str, Any]]:
    """
    Initializes and caches the ONNX Runtime inference session for EfficientNetB0.
    Reuses the session across serverless function warm invocations.
    """
    global _session, _config, _input_name, _output_name

    if _session is not None and _config is not None:
        return _session, _config

    if not CONFIG_PATH.is_file():
        raise FileNotFoundError(f"Skin-type configuration not found at: {CONFIG_PATH}")

    with CONFIG_PATH.open("r", encoding="utf-8") as f:
        config = json.load(f)

    if config.get("class_names") != ["dry", "normal", "oily"]:
        raise ValueError("Unexpected skin-type class mapping in configuration.")

    if config.get("external_normalization") is not False:
        raise ValueError("Unexpected preprocessing configuration: external_normalization must be False.")

    # Determine ONNX model path
    onnx_file = config.get("onnx_model_file", "skin_type_efficientnetb0.onnx")
    model_path = MODEL_DIR / onnx_file
    if not model_path.is_file():
        # Fall back to standard filename in models directory
        model_path = ONNX_MODEL_PATH

    if not model_path.is_file():
        raise FileNotFoundError(
            f"EfficientNetB0 ONNX model not found at: {model_path}. "
            "Please ensure skin_type_efficientnetb0.onnx is bundled."
        )

    import onnxruntime as ort

    # Configure session options for fast CPU serverless execution
    opts = ort.SessionOptions()
    opts.inter_op_num_threads = 1
    opts.intra_op_num_threads = 2
    opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL

    session = ort.InferenceSession(
        str(model_path),
        sess_options=opts,
        providers=["CPUExecutionProvider"]
    )

    inputs = session.get_inputs()
    if not inputs:
        raise ValueError("ONNX model has no input tensors.")
    input_name = inputs[0].name

    outputs = session.get_outputs()
    if not outputs:
        raise ValueError("ONNX model has no output tensors.")
    output_name = outputs[0].name

    _session = session
    _config = config
    _input_name = input_name
    _output_name = output_name

    logger.info("EfficientNetB0 ONNX model loaded successfully (input: %s, output: %s)", input_name, output_name)
    return _session, _config


def predict_skin_type(image_bytes: bytes) -> Dict[str, Any]:
    """
    Predicts facial skin type (Dry, Normal, Oily) using EfficientNetB0 via ONNX Runtime.

    Preprocessing:
    - EXIF orientation correction
    - RGB conversion
    - 224x224 bilinear resizing
    - float32 NumPy array with pixel values in [0, 255] (no manual 255 division;
      EfficientNetB0 performs internal normalization)
    - Batch dimension expansion to (1, 224, 224, 3)

    Returns standardized dictionary with:
    - skin_type: str ("Dry", "Normal", "Oily")
    - model_score: float (rounded to 4 decimals)
    - probabilities: Dict[str, float] (per-class probabilities rounded to 4 decimals)
    - model: "EfficientNetB0"
    - requires_user_confirmation: True
    - is_medical_diagnosis: False
    """
    if not image_bytes or len(image_bytes) < 16:
        raise ValueError("Invalid image_bytes: empty or too short.")

    session, config = load_skin_type_model()

    with Image.open(io.BytesIO(image_bytes)) as img:
        img = ImageOps.exif_transpose(img)
        img = img.convert("RGB")
        img = img.resize((224, 224), Image.Resampling.BILINEAR)
        image_array = np.asarray(img, dtype=np.float32)

    # Validate shape
    if image_array.shape != (224, 224, 3):
        raise ValueError(f"Unexpected image array shape: {image_array.shape}, expected (224, 224, 3)")

    # EfficientNetB0 handles preprocessing internally. Do not divide pixels by 255.
    batch = np.expand_dims(image_array, axis=0)

    # Run inference
    global _input_name, _output_name
    if _input_name is None or _output_name is None:
        _input_name = session.get_inputs()[0].name
        _output_name = session.get_outputs()[0].name

    outputs = session.run([_output_name], {_input_name: batch})
    probabilities = outputs[0][0]

    # Validate finite values
    if not np.all(np.isfinite(probabilities)):
        raise RuntimeError("Model returned non-finite probability values.")

    class_names = config["class_names"]
    predicted_index = int(np.argmax(probabilities))

    return {
        "skin_type": class_names[predicted_index].capitalize(),
        "model_score": round(float(probabilities[predicted_index]), 4),
        "probabilities": {
            name: round(float(probabilities[i]), 4)
            for i, name in enumerate(class_names)
        },
        "model": "EfficientNetB0",
        "requires_user_confirmation": True,
        "is_medical_diagnosis": False
    }
