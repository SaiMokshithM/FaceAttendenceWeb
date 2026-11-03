from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    PORT: int = 8000
    AI_SERVICE_API_KEY: str = "faceattend_internal_ai_secret_key_2026"
    
    # Face quality thresholds
    FACE_SIMILARITY_THRESHOLD: float = 0.45
    AMBIGUOUS_THRESHOLD_DELTA: float = 0.05
    FACE_QUALITY_MIN_SIZE: int = 112
    FACE_QUALITY_MIN_BLUR: float = 80.0
    FACE_QUALITY_MIN_BRIGHTNESS: float = 40.0
    FACE_QUALITY_MAX_BRIGHTNESS: float = 230.0
    
    # Liveness
    LIVENESS_THRESHOLD: float = 0.50
    
    # Model info
    MODEL_NAME: str = "ArcFace-buffalo_l"
    MODEL_VERSION: str = "1.0.0"
    INSIGHTFACE_MODEL: str = "buffalo_l"
    
    # Temp storage for zip extraction
    TEMP_UPLOAD_DIR: str = "/tmp/faceattend_uploads"
    MAX_ZIP_SIZE_MB: int = 200

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Ensure temp dir exists
os.makedirs(settings.TEMP_UPLOAD_DIR, exist_ok=True)
