from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# ─── Quality ────────────────────────────────────────────────────────────────

class QualityCheckDetail(BaseModel):
    is_valid: bool
    face_detected: bool
    face_count: int
    face_width: int = 0
    face_height: int = 0
    blur_score: float = 0.0
    brightness_score: float = 0.0
    is_frontal: bool = True
    rejection_reasons: List[str] = Field(default_factory=list)

# ─── Detection ──────────────────────────────────────────────────────────────

class DetectionResponse(BaseModel):
    success: bool
    faces_detected: int
    bounding_boxes: List[List[int]] = Field(default_factory=list)
    quality: QualityCheckDetail

# ─── Embedding ──────────────────────────────────────────────────────────────

class EmbeddingResponse(BaseModel):
    success: bool
    embedding: Optional[List[float]] = None
    embedding_sha256: Optional[str] = None
    model_name: str
    model_version: str
    quality: QualityCheckDetail

# ─── Validation ─────────────────────────────────────────────────────────────

class ImageValidationResponse(BaseModel):
    success: bool
    quality: QualityCheckDetail
    preview_base64: Optional[str] = None   # cropped face preview for admin UI

# ─── Matching ───────────────────────────────────────────────────────────────

class EnrolledTemplate(BaseModel):
    student_id: str
    roll_number: str
    embedding: List[float]

class MatchRequest(BaseModel):
    query_embedding: List[float]
    enrolled_templates: List[EnrolledTemplate]
    threshold: Optional[float] = None

class MatchResponse(BaseModel):
    matched: bool
    student_id: Optional[str] = None
    roll_number: Optional[str] = None
    similarity: float = 0.0
    verification_status: str   # VERIFIED | NO_MATCH | AMBIGUOUS
    model_version: str

# ─── Full verification pipeline ─────────────────────────────────────────────

class VerifyRequest(BaseModel):
    student_id: str
    roll_number: str
    enrolled_embedding: List[float]
    require_liveness: bool = True
    threshold: Optional[float] = None

class VerificationResult(BaseModel):
    matched: bool
    student_id: Optional[str] = None
    roll_number: Optional[str] = None
    similarity: float = 0.0
    liveness_passed: bool = False
    liveness_score: float = 0.0
    verification_status: str   # VERIFIED | NO_MATCH | AMBIGUOUS | FAILED_LIVENESS | FAILED_QUALITY | NO_FACE | MULTI_FACE
    rejection_reasons: List[str] = Field(default_factory=list)
    model_name: str
    model_version: str

# ─── Liveness ───────────────────────────────────────────────────────────────

class LivenessResponse(BaseModel):
    liveness_passed: bool
    score: float
    status: str   # LIVE | SPOOF | UNCERTAIN

# ─── Bulk enrollment item result ────────────────────────────────────────────

class EnrollmentItemResult(BaseModel):
    roll_number: str
    student_name: str
    filename: str
    success: bool
    embedding_sha256: Optional[str] = None
    quality: Optional[QualityCheckDetail] = None
    failure_reason: Optional[str] = None
    is_duplicate_file: bool = False
    duplicate_similarity: Optional[float] = None
    duplicate_of_roll: Optional[str] = None

class BulkEnrollmentResponse(BaseModel):
    job_id: str
    total: int
    successful: int
    failed: int
    results: List[EnrollmentItemResult]

# ─── Health ─────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_name: str
    model_version: str
    liveness_model_loaded: bool
