"""
Liveness / Anti-Spoofing Detector

Uses texture analysis (LBP variance + frequency analysis) as a
lightweight passive liveness check. This is a heuristic approach —
it is NOT a trained anti-spoofing model.

DOCUMENTED LIMITATIONS:
  - Cannot reliably distinguish a high-quality printed photo from a live face.
  - May pass on high-resolution screen replay.
  - Professional 3D masks are not detected.
  - Designed to catch basic printed-photo and low-quality replay attacks only.
  - For high-security deployments, use a dedicated trained anti-spoofing model
    (e.g. Silent-Face-Anti-Spoofing / MiniFASNet).

Verification statuses returned:
  LIVE       — liveness check passed
  SPOOF      — likely spoof detected
  UNCERTAIN  — insufficient signal, recommend retry
"""
import logging
import cv2
import numpy as np

from app.config import settings
from schemas.face_schemas import LivenessResponse

logger = logging.getLogger(__name__)


def _lbp_variance(gray_face: np.ndarray) -> float:
    """Local Binary Pattern variance — real faces have richer texture."""
    radius = 1
    n_points = 8
    h, w = gray_face.shape
    lbp = np.zeros((h, w), dtype=np.uint8)
    for i in range(radius, h - radius):
        for j in range(radius, w - radius):
            center = gray_face[i, j]
            code = 0
            offsets = [
                (-radius, 0), (-radius, radius), (0, radius),
                (radius, radius), (radius, 0), (radius, -radius),
                (0, -radius), (-radius, -radius),
            ]
            for bit, (dy, dx) in enumerate(offsets):
                if gray_face[i + dy, j + dx] >= center:
                    code |= 1 << bit
            lbp[i, j] = code
    return float(np.var(lbp))


def _high_freq_energy(gray_face: np.ndarray) -> float:
    """DFT-based high-frequency energy — printed photos have less HF content."""
    f = np.fft.fft2(gray_face.astype(np.float32))
    fshift = np.fft.fftshift(f)
    magnitude = np.abs(fshift)
    h, w = magnitude.shape
    cy, cx = h // 2, w // 2
    mask_size = min(h, w) // 4
    # Zero out center (low frequencies)
    magnitude[cy - mask_size:cy + mask_size, cx - mask_size:cx + mask_size] = 0
    return float(np.mean(magnitude))


def check_liveness(face_crop: np.ndarray) -> LivenessResponse:
    """
    Run heuristic liveness analysis on a cropped face image (BGR or gray).
    Returns LivenessResponse with score in [0,1].
    """
    try:
        if face_crop is None or face_crop.size == 0:
            return LivenessResponse(liveness_passed=False, score=0.0, status="UNCERTAIN")

        # Resize for consistent analysis
        face_resized = cv2.resize(face_crop, (128, 128))
        gray = (
            cv2.cvtColor(face_resized, cv2.COLOR_BGR2GRAY)
            if len(face_resized.shape) == 3
            else face_resized
        )

        lbp_var = _lbp_variance(gray)
        hf_energy = _high_freq_energy(gray)

        # Normalize to rough [0,1] — calibrated empirically
        # Real faces typically: lbp_var > 800, hf_energy > 3000
        lbp_score = min(lbp_var / 1500.0, 1.0)
        hf_score = min(hf_energy / 5000.0, 1.0)

        combined = 0.5 * lbp_score + 0.5 * hf_score

        threshold = settings.LIVENESS_THRESHOLD

        if combined >= threshold:
            status = "LIVE"
            passed = True
        elif combined >= threshold * 0.7:
            status = "UNCERTAIN"
            passed = False
        else:
            status = "SPOOF"
            passed = False

        logger.debug(
            "Liveness: lbp_var=%.1f hf_energy=%.1f score=%.3f status=%s",
            lbp_var, hf_energy, combined, status,
        )

        return LivenessResponse(
            liveness_passed=passed,
            score=round(combined, 4),
            status=status,
        )

    except Exception as exc:
        logger.error("Liveness check error: %s", exc)
        return LivenessResponse(liveness_passed=False, score=0.0, status="UNCERTAIN")


def extract_face_crop(image: np.ndarray, face_obj) -> np.ndarray:
    """Extract the face bounding-box crop from the full image."""
    bbox = face_obj.bbox.astype(int)
    x1, y1, x2, y2 = bbox[0], bbox[1], bbox[2], bbox[3]
    h, w = image.shape[:2]
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w, x2), min(h, y2)
    return image[y1:y2, x1:x2]
