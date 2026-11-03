"""
Face Quality Evaluator
Checks: face existence, face count, resolution, blur, brightness, pose.
"""
import cv2
import numpy as np
from app.config import settings
from schemas.face_schemas import QualityCheckDetail


def evaluate_face_quality(
    image: np.ndarray,
    face_obj=None,
    faces_count: int = 0,
) -> QualityCheckDetail:
    """
    Evaluate quality of detected face.
    face_obj: single InsightFace face object (or None if no face)
    faces_count: total number of faces detected in the image
    """
    rejection_reasons: list[str] = []

    # ── No face at all ───────────────────────────────────────────────────────
    if faces_count == 0 or face_obj is None:
        return QualityCheckDetail(
            is_valid=False,
            face_detected=False,
            face_count=0,
            rejection_reasons=["No face detected in the photograph."],
        )

    # ── Multiple faces ────────────────────────────────────────────────────────
    if faces_count > 1:
        return QualityCheckDetail(
            is_valid=False,
            face_detected=True,
            face_count=faces_count,
            rejection_reasons=[
                f"Multiple faces detected ({faces_count}). "
                "The photograph must contain exactly one face."
            ],
        )

    # ── Bounding box ─────────────────────────────────────────────────────────
    bbox = face_obj.bbox.astype(int)
    x1, y1, x2, y2 = int(bbox[0]), int(bbox[1]), int(bbox[2]), int(bbox[3])
    w = max(0, x2 - x1)
    h = max(0, y2 - y1)

    if w < settings.FACE_QUALITY_MIN_SIZE or h < settings.FACE_QUALITY_MIN_SIZE:
        rejection_reasons.append(
            f"Face is too small ({w}×{h} px). "
            f"Minimum required: {settings.FACE_QUALITY_MIN_SIZE}×{settings.FACE_QUALITY_MIN_SIZE} px."
        )

    # ── Crop face region ─────────────────────────────────────────────────────
    img_h, img_w = image.shape[:2]
    cx1 = max(0, x1)
    cy1 = max(0, y1)
    cx2 = min(img_w, x2)
    cy2 = min(img_h, y2)
    face_crop = image[cy1:cy2, cx1:cx2]

    blur_score = 0.0
    brightness_score = 0.0

    if face_crop.size > 0:
        gray = (
            cv2.cvtColor(face_crop, cv2.COLOR_BGR2GRAY)
            if len(face_crop.shape) == 3
            else face_crop
        )
        blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        brightness_score = float(np.mean(gray))

        if blur_score < settings.FACE_QUALITY_MIN_BLUR:
            rejection_reasons.append(
                f"Image is too blurry (sharpness={blur_score:.1f}, "
                f"required ≥ {settings.FACE_QUALITY_MIN_BLUR:.1f})."
            )

        if brightness_score < settings.FACE_QUALITY_MIN_BRIGHTNESS:
            rejection_reasons.append(
                f"Image is too dark (brightness={brightness_score:.1f}, "
                f"required ≥ {settings.FACE_QUALITY_MIN_BRIGHTNESS:.1f})."
            )
        elif brightness_score > settings.FACE_QUALITY_MAX_BRIGHTNESS:
            rejection_reasons.append(
                f"Image is overexposed (brightness={brightness_score:.1f}, "
                f"max={settings.FACE_QUALITY_MAX_BRIGHTNESS:.1f})."
            )
    else:
        rejection_reasons.append("Could not crop face region from image.")

    # ── Pose check ───────────────────────────────────────────────────────────
    is_frontal = True
    if hasattr(face_obj, "pose") and face_obj.pose is not None:
        pitch, yaw, roll = float(face_obj.pose[0]), float(face_obj.pose[1]), float(face_obj.pose[2])
        if abs(yaw) > 35.0 or abs(pitch) > 35.0:
            is_frontal = False
            rejection_reasons.append(
                f"Face is not sufficiently frontal "
                f"(yaw={yaw:.1f}°, pitch={pitch:.1f}°). "
                "Ask the student to look directly at the camera."
            )

    return QualityCheckDetail(
        is_valid=len(rejection_reasons) == 0,
        face_detected=True,
        face_count=1,
        face_width=w,
        face_height=h,
        blur_score=round(blur_score, 2),
        brightness_score=round(brightness_score, 2),
        is_frontal=is_frontal,
        rejection_reasons=rejection_reasons,
    )
