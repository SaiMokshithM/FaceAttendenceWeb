"""
FastAPI Application — FaceAttend AI Service
Handles: face detection, quality, embedding, matching, liveness, bulk enrollment.
All endpoints require X-API-Key header (internal service auth).
"""
import base64
import hashlib
import io
import logging
import os
import shutil
import uuid
import zipfile
from typing import List

import cv2
import numpy as np
from fastapi import FastAPI, File, Form, Header, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image

from app.config import settings
from face_detection.quality import evaluate_face_quality
from face_recognition.embedder import generate_embedding
from face_recognition.matcher import match_embedding
from face_recognition.models import get_face_app, is_model_loaded
from liveness.detector import check_liveness, extract_face_crop
from schemas.face_schemas import (
    BulkEnrollmentResponse,
    DetectionResponse,
    EmbeddingResponse,
    EnrolledTemplate,
    EnrollmentItemResult,
    HealthResponse,
    ImageValidationResponse,
    LivenessResponse,
    MatchRequest,
    MatchResponse,
    QualityCheckDetail,
    VerificationResult,
    VerifyRequest,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── App ─────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="FaceAttend AI Service",
    description="ArcFace facial recognition microservice for FaceAttend platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Auth dependency ─────────────────────────────────────────────────────────

def verify_api_key(x_api_key: str = Header(alias="X-API-Key")):
    if x_api_key != settings.AI_SERVICE_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key. This service is for internal use only.",
        )

# ─── Startup ─────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    logger.info("Loading InsightFace model on startup...")
    get_face_app()
    logger.info("AI Service ready. model_loaded=%s", is_model_loaded())

# ─── Helpers ─────────────────────────────────────────────────────────────────

def decode_upload(file_bytes: bytes) -> np.ndarray:
    """Decode uploaded image bytes to BGR numpy array."""
    arr = np.frombuffer(file_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(
            status_code=400,
            detail="Cannot decode image. Supported formats: JPEG, PNG, WEBP.",
        )
    return img

def face_crop_to_base64(image: np.ndarray, face_obj) -> str | None:
    try:
        crop = extract_face_crop(image, face_obj)
        if crop.size == 0:
            return None
        crop_resized = cv2.resize(crop, (200, 200))
        _, buf = cv2.imencode(".jpg", crop_resized)
        return base64.b64encode(buf).decode("utf-8")
    except Exception:
        return None

# ─── Health ──────────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health():
    return HealthResponse(
        status="ok" if is_model_loaded() else "degraded",
        model_loaded=is_model_loaded(),
        model_name=settings.MODEL_NAME,
        model_version=settings.MODEL_VERSION,
        liveness_model_loaded=True,   # heuristic liveness always available
    )

# ─── Image Validation ────────────────────────────────────────────────────────

@app.post("/validate", response_model=ImageValidationResponse, tags=["Face Detection"])
async def validate_image(
    file: UploadFile = File(...),
    x_api_key: str = Header(alias="X-API-Key"),
):
    verify_api_key(x_api_key)
    data = await file.read()
    image = decode_upload(data)

    face_app = get_face_app()
    faces = face_app.get(image) if face_app else []
    count = len(faces)
    best_face = faces[0] if count >= 1 else None

    quality = evaluate_face_quality(image, best_face, count)
    preview = face_crop_to_base64(image, best_face) if best_face else None

    return ImageValidationResponse(success=quality.is_valid, quality=quality, preview_base64=preview)

# ─── Embedding Generation ────────────────────────────────────────────────────

@app.post("/embed", response_model=EmbeddingResponse, tags=["Face Recognition"])
async def embed_face(
    file: UploadFile = File(...),
    x_api_key: str = Header(alias="X-API-Key"),
):
    verify_api_key(x_api_key)
    data = await file.read()
    image = decode_upload(data)
    return generate_embedding(image)

# ─── Face Matching ───────────────────────────────────────────────────────────

@app.post("/match", response_model=MatchResponse, tags=["Face Recognition"])
async def match_face(request: MatchRequest, x_api_key: str = Header(alias="X-API-Key")):
    verify_api_key(x_api_key)
    if not request.enrolled_templates:
        raise HTTPException(status_code=400, detail="No enrolled templates provided.")
    return match_embedding(request)

# ─── Full Verification Pipeline ──────────────────────────────────────────────

@app.post("/verify", response_model=VerificationResult, tags=["Face Recognition"])
async def verify_face(
    file: UploadFile = File(...),
    student_id: str = Form(...),
    roll_number: str = Form(...),
    enrolled_embedding_json: str = Form(...),
    require_liveness: bool = Form(default=True),
    threshold: float = Form(default=None),
    x_api_key: str = Header(alias="X-API-Key"),
):
    """
    Full pipeline for attendance verification:
    1. Decode image
    2. Detect face + quality check
    3. Liveness check (if required)
    4. Generate embedding
    5. Match against single enrolled template
    Returns minimum data needed by Spring Boot.
    """
    verify_api_key(x_api_key)

    import json
    enrolled_embedding = json.loads(enrolled_embedding_json)

    data = await file.read()
    image = decode_upload(data)

    face_app = get_face_app()
    if not face_app:
        return VerificationResult(
            matched=False,
            verification_status="FAILED_QUALITY",
            rejection_reasons=["AI model unavailable"],
            model_name=settings.MODEL_NAME,
            model_version=settings.MODEL_VERSION,
        )

    faces = face_app.get(image)
    count = len(faces)
    best_face = faces[0] if count >= 1 else None

    # Quality check
    quality = evaluate_face_quality(image, best_face, count)
    if not quality.is_valid:
        status_code = "NO_FACE" if not quality.face_detected else "MULTI_FACE" if quality.face_count > 1 else "FAILED_QUALITY"
        return VerificationResult(
            matched=False,
            verification_status=status_code,
            rejection_reasons=quality.rejection_reasons,
            model_name=settings.MODEL_NAME,
            model_version=settings.MODEL_VERSION,
        )

    # Liveness check
    liveness_passed = False
    liveness_score = 0.0
    if require_liveness:
        face_crop = extract_face_crop(image, best_face)
        liveness_result = check_liveness(face_crop)
        liveness_passed = liveness_result.liveness_passed
        liveness_score = liveness_result.score
        if not liveness_passed:
            return VerificationResult(
                matched=False,
                liveness_passed=False,
                liveness_score=liveness_score,
                verification_status="FAILED_LIVENESS",
                rejection_reasons=["Liveness check failed. Please ensure you are using a live camera feed."],
                model_name=settings.MODEL_NAME,
                model_version=settings.MODEL_VERSION,
            )
    else:
        liveness_passed = True
        liveness_score = 1.0

    # Generate embedding
    embed_result = generate_embedding(image)
    if not embed_result.success or not embed_result.embedding:
        return VerificationResult(
            matched=False,
            liveness_passed=liveness_passed,
            liveness_score=liveness_score,
            verification_status="FAILED_QUALITY",
            rejection_reasons=embed_result.quality.rejection_reasons,
            model_name=settings.MODEL_NAME,
            model_version=settings.MODEL_VERSION,
        )

    # Match
    thr = threshold or settings.FACE_SIMILARITY_THRESHOLD
    query = np.array(embed_result.embedding, dtype=np.float32)
    enrolled = np.array(enrolled_embedding, dtype=np.float32)
    similarity = float(np.dot(query, enrolled) / (np.linalg.norm(query) * np.linalg.norm(enrolled) + 1e-10))

    ambiguous_lower = thr - settings.AMBIGUOUS_THRESHOLD_DELTA

    if similarity >= thr:
        return VerificationResult(
            matched=True,
            student_id=student_id,
            roll_number=roll_number,
            similarity=round(similarity, 4),
            liveness_passed=liveness_passed,
            liveness_score=liveness_score,
            verification_status="VERIFIED",
            model_name=settings.MODEL_NAME,
            model_version=settings.MODEL_VERSION,
        )
    elif similarity >= ambiguous_lower:
        return VerificationResult(
            matched=False,
            similarity=round(similarity, 4),
            liveness_passed=liveness_passed,
            liveness_score=liveness_score,
            verification_status="AMBIGUOUS",
            rejection_reasons=["Match is ambiguous. Please retry in better lighting."],
            model_name=settings.MODEL_NAME,
            model_version=settings.MODEL_VERSION,
        )
    else:
        return VerificationResult(
            matched=False,
            similarity=round(similarity, 4),
            liveness_passed=liveness_passed,
            liveness_score=liveness_score,
            verification_status="NO_MATCH",
            rejection_reasons=["Face does not match enrolled student."],
            model_name=settings.MODEL_NAME,
            model_version=settings.MODEL_VERSION,
        )

# ─── Liveness Standalone ─────────────────────────────────────────────────────

@app.post("/liveness", response_model=LivenessResponse, tags=["Liveness"])
async def liveness_check(
    file: UploadFile = File(...),
    x_api_key: str = Header(alias="X-API-Key"),
):
    verify_api_key(x_api_key)
    data = await file.read()
    image = decode_upload(data)
    face_app = get_face_app()
    faces = face_app.get(image) if face_app else []
    if not faces:
        return LivenessResponse(liveness_passed=False, score=0.0, status="UNCERTAIN")
    crop = extract_face_crop(image, faces[0])
    return check_liveness(crop)

# ─── Bulk Enrollment ─────────────────────────────────────────────────────────

@app.post("/bulk-embed", response_model=BulkEnrollmentResponse, tags=["Bulk Enrollment"])
async def bulk_embed(
    zip_file: UploadFile = File(..., description="ZIP of student photos named by roll number"),
    roster_json: str = Form(..., description='JSON: [{"roll_number":"24A001","student_name":"Name","filename":"24A001.jpg"}]'),
    job_id: str = Form(default_factory=lambda: str(uuid.uuid4())),
    x_api_key: str = Header(alias="X-API-Key"),
):
    """
    Process a ZIP of student photos and return embeddings for each.
    Expects roster_json mapping roll_number → filename.
    Processes in-memory; no permanent files written here.
    """
    verify_api_key(x_api_key)

    import json
    roster = json.loads(roster_json)

    # Validate ZIP size
    zip_bytes = await zip_file.read()
    if len(zip_bytes) > settings.MAX_ZIP_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"ZIP exceeds {settings.MAX_ZIP_SIZE_MB} MB limit.")

    # Extract ZIP to memory map: filename → bytes
    image_map: dict[str, bytes] = {}
    try:
        with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
            for member in zf.infolist():
                # ZIP path traversal prevention
                if ".." in member.filename or member.filename.startswith("/"):
                    continue
                basename = os.path.basename(member.filename)
                if not basename:
                    continue
                ext = os.path.splitext(basename)[1].lower()
                if ext not in {".jpg", ".jpeg", ".png", ".webp"}:
                    continue
                if member.file_size > 20 * 1024 * 1024:  # 20 MB per image max
                    continue
                image_map[basename] = zf.read(member.filename)
    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Invalid or corrupted ZIP file.")

    results: list[EnrollmentItemResult] = []
    seen_hashes: set[str] = set()

    face_app = get_face_app()

    for item in roster:
        roll = item.get("roll_number", "")
        name = item.get("student_name", "")
        filename = item.get("filename", "")

        if filename not in image_map:
            results.append(EnrollmentItemResult(
                roll_number=roll,
                student_name=name,
                filename=filename,
                success=False,
                failure_reason=f"Photograph '{filename}' not found in uploaded ZIP.",
            ))
            continue

        raw = image_map[filename]

        # File-level duplicate check
        file_hash = hashlib.sha256(raw).hexdigest()
        if file_hash in seen_hashes:
            results.append(EnrollmentItemResult(
                roll_number=roll,
                student_name=name,
                filename=filename,
                success=False,
                is_duplicate_file=True,
                failure_reason="Duplicate photograph detected (identical file hash).",
            ))
            continue
        seen_hashes.add(file_hash)

        # Decode image
        arr = np.frombuffer(raw, dtype=np.uint8)
        image = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if image is None:
            results.append(EnrollmentItemResult(
                roll_number=roll,
                student_name=name,
                filename=filename,
                success=False,
                failure_reason="Image file is corrupted or unsupported format.",
            ))
            continue

        # Generate embedding
        embed_result = generate_embedding(image)

        if embed_result.success:
            results.append(EnrollmentItemResult(
                roll_number=roll,
                student_name=name,
                filename=filename,
                success=True,
                embedding_sha256=embed_result.embedding_sha256,
                quality=embed_result.quality,
            ))
        else:
            results.append(EnrollmentItemResult(
                roll_number=roll,
                student_name=name,
                filename=filename,
                success=False,
                quality=embed_result.quality,
                failure_reason="; ".join(embed_result.quality.rejection_reasons),
            ))

    successful = sum(1 for r in results if r.success)
    failed = len(results) - successful

    return BulkEnrollmentResponse(
        job_id=job_id,
        total=len(results),
        successful=successful,
        failed=failed,
        results=results,
    )
