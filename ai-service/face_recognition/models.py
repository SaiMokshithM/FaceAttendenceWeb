"""
InsightFace / ArcFace model loader.
Singleton pattern — model loaded once on startup, reused for all requests.
Model: buffalo_l  (SCRFD detector + ArcFace R100 recognizer, ONNX, MIT license)
"""
import logging
import threading
import numpy as np

logger = logging.getLogger(__name__)

_lock = threading.Lock()
_face_app = None
_model_loaded = False


def get_face_app():
    """Return the singleton InsightFace FaceAnalysis app, loading it on first call."""
    global _face_app, _model_loaded
    if _model_loaded:
        return _face_app
    with _lock:
        if _model_loaded:
            return _face_app
        try:
            from insightface.app import FaceAnalysis  # type: ignore
            app = FaceAnalysis(
                name="buffalo_l",
                providers=["CPUExecutionProvider"],
            )
            app.prepare(ctx_id=-1, det_size=(640, 640))
            _face_app = app
            _model_loaded = True
            logger.info("InsightFace buffalo_l model loaded successfully.")
        except Exception as exc:
            logger.error("Failed to load InsightFace model: %s", exc)
            _face_app = None
            _model_loaded = False
    return _face_app


def is_model_loaded() -> bool:
    return _model_loaded
