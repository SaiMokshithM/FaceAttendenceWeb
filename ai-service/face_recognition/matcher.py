"""
ArcFace Matcher
Cosine similarity comparison against enrolled templates.
"""
import numpy as np
from app.config import settings
from schemas.face_schemas import EnrolledTemplate, MatchRequest, MatchResponse


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-10))


def match_embedding(request: MatchRequest) -> MatchResponse:
    """
    Compare query embedding against all enrolled templates.
    Returns best match above threshold or NO_MATCH/AMBIGUOUS.
    """
    threshold = request.threshold or settings.FACE_SIMILARITY_THRESHOLD
    ambiguous_lower = threshold - settings.AMBIGUOUS_THRESHOLD_DELTA

    query = np.array(request.query_embedding, dtype=np.float32)

    best_score = -1.0
    best_template: EnrolledTemplate | None = None
    second_score = -1.0

    for template in request.enrolled_templates:
        enrolled_vec = np.array(template.embedding, dtype=np.float32)
        score = cosine_similarity(query, enrolled_vec)
        if score > best_score:
            second_score = best_score
            best_score = score
            best_template = template
        elif score > second_score:
            second_score = score

    if best_score >= threshold:
        return MatchResponse(
            matched=True,
            student_id=best_template.student_id,
            roll_number=best_template.roll_number,
            similarity=round(best_score, 4),
            verification_status="VERIFIED",
            model_version=settings.MODEL_VERSION,
        )
    elif best_score >= ambiguous_lower:
        return MatchResponse(
            matched=False,
            similarity=round(best_score, 4),
            verification_status="AMBIGUOUS",
            model_version=settings.MODEL_VERSION,
        )
    else:
        return MatchResponse(
            matched=False,
            similarity=round(best_score, 4),
            verification_status="NO_MATCH",
            model_version=settings.MODEL_VERSION,
        )
