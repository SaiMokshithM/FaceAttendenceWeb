"""
ArcFace Embedding Generator
Detects face, runs quality checks, returns normalized 512-dim embedding.
"""
import hashlib
import logging
import cv2
import numpy as np

from app.config import settings
from face_detection.quality import evaluate_face_quality
from face_recognition.models import get_face_app
from schemas.face_schemas import EmbeddingResponse, QualityCheckDetail

logger = logging.getLogger(__name__)


def _sha256_of_embedding(embedding: np.ndarray) -> str:
    return hashlib.sha256(embedding.tobytes()).hexdigest()


def generate_embedding(image: np.ndarray) -> EmbeddingResponse:
    """
    Full pipeline: detect → quality check → ArcFace embedding.
    Returns EmbeddingResponse with embedding or rejection reasons.
    """
    face_app = get_face_app()
    if face_app is None:
        return EmbeddingResponse(
            success=False,
            model_name=settings.MODEL_NAME,
            model_version=settings.MODEL_VERSION,
            quality=QualityCheckDetail(
                is_valid=False,
                face_detected=False,
                face_count=0,
                rejection_reasons=["Face recognition model is not loaded. Contact system administrator."],
            ),
        )

    # Convert to BGR if needed (OpenCV uses BGR)
    if len(image.shape) == 2:
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
    elif image.shape[2] == 4:
        image = cv2.cvtColor(image, cv2.COLOR_BGRA2BGR)

    try:
        faces = face_app.get(image)
    except Exception as exc:
        logger.error("InsightFace detection error: %s", exc)
        return EmbeddingResponse(
            success=False,
            model_name=settings.MODEL_NAME,
            model_version=settings.MODEL_VERSION,
            quality=QualityCheckDetail(
                is_valid=False,
                face_detected=False,
                face_count=0,
                rejection_reasons=[f"Face detection failed: {str(exc)}"],
            ),
        )

    faces_count = len(faces)
    best_face = faces[0] if faces_count >= 1 else None

    quality = evaluate_face_quality(image, best_face, faces_count)

    if not quality.is_valid:
        return EmbeddingResponse(
            success=False,
            model_name=settings.MODEL_NAME,
            model_version=settings.MODEL_VERSION,
            quality=quality,
        )

    # ArcFace embedding is already provided by InsightFace (512-dim)
    raw_embedding: np.ndarray = best_face.embedding

    # L2-normalize
    norm = np.linalg.norm(raw_embedding)
    if norm == 0:
        return EmbeddingResponse(
            success=False,
            model_name=settings.MODEL_NAME,
            model_version=settings.MODEL_VERSION,
            quality=QualityCheckDetail(
                is_valid=False,
                face_detected=True,
                face_count=1,
                rejection_reasons=["Embedding normalization failed (zero vector). Please retry with a clearer photograph."],
            ),
        )

    normalized = raw_embedding / norm
    sha256 = _sha256_of_embedding(normalized)

    return EmbeddingResponse(
        success=True,
        embedding=normalized.tolist(),
        embedding_sha256=sha256,
        model_name=settings.MODEL_NAME,
        model_version=settings.MODEL_VERSION,
        quality=quality,
    )
