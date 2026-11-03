import pytest
import numpy as np
import cv2
import json
import io
import zipfile
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.config import settings

client = TestClient(app)
API_KEY = settings.AI_SERVICE_API_KEY
HEADERS = {"X-API-Key": API_KEY}


def make_face_image(w=300, h=300) -> bytes:
    """Generate a solid-color test image (no real face)."""
    img = np.ones((h, w, 3), dtype=np.uint8) * 180
    _, buf = cv2.imencode(".jpg", img)
    return buf.tobytes()


def make_zip_with_image(filename="24A001.jpg", img_bytes=None) -> bytes:
    if img_bytes is None:
        img_bytes = make_face_image()
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr(filename, img_bytes)
    return buf.getvalue()


# ── Health ───────────────────────────────────────────────────────────────────

def test_health_endpoint():
    r = client.get("/health", headers=HEADERS)
    assert r.status_code == 200
    data = r.json()
    assert "status" in data
    assert "model_loaded" in data


# ── Auth ─────────────────────────────────────────────────────────────────────

def test_invalid_api_key_rejected():
    r = client.get("/health", headers={"X-API-Key": "wrong-key"})
    assert r.status_code == 401


# ── Image Validation ─────────────────────────────────────────────────────────

def test_validate_invalid_file_type():
    """Non-image bytes should fail decode."""
    r = client.post(
        "/validate",
        headers=HEADERS,
        files={"file": ("test.txt", b"not an image", "text/plain")},
    )
    assert r.status_code == 400


def test_validate_solid_color_image_no_face():
    """Solid-color image has no face — should return face_detected=False."""
    with patch("app.main.get_face_app") as mock_app:
        mock_fa = MagicMock()
        mock_fa.get.return_value = []
        mock_app.return_value = mock_fa
        r = client.post(
            "/validate",
            headers=HEADERS,
            files={"file": ("photo.jpg", make_face_image(), "image/jpeg")},
        )
    assert r.status_code == 200
    data = r.json()
    assert data["quality"]["face_detected"] is False
    assert data["success"] is False


# ── Embedding ────────────────────────────────────────────────────────────────

def test_embed_no_face_returns_failure():
    with patch("app.main.get_face_app") as mock_app:
        mock_fa = MagicMock()
        mock_fa.get.return_value = []
        mock_app.return_value = mock_fa
        r = client.post(
            "/embed",
            headers=HEADERS,
            files={"file": ("photo.jpg", make_face_image(), "image/jpeg")},
        )
    assert r.status_code == 200
    assert r.json()["success"] is False


def test_embed_multiple_faces_rejected():
    face1 = MagicMock()
    face1.bbox = np.array([10, 10, 150, 150], dtype=np.float32)
    face1.embedding = np.random.rand(512).astype(np.float32)
    face1.pose = np.array([0, 0, 0], dtype=np.float32)

    face2 = MagicMock()
    face2.bbox = np.array([160, 10, 290, 150], dtype=np.float32)
    face2.embedding = np.random.rand(512).astype(np.float32)
    face2.pose = np.array([0, 0, 0], dtype=np.float32)

    with patch("face_recognition.embedder.get_face_app") as mock_app:
        mock_fa = MagicMock()
        mock_fa.get.return_value = [face1, face2]
        mock_app.return_value = mock_fa
        r = client.post(
            "/embed",
            headers=HEADERS,
            files={"file": ("photo.jpg", make_face_image(), "image/jpeg")},
        )
    assert r.status_code == 200
    data = r.json()
    assert data["success"] is False
    assert "Multiple faces" in data["quality"]["rejection_reasons"][0]


def test_embed_valid_face_returns_embedding():
    mock_face = MagicMock()
    mock_face.bbox = np.array([10, 10, 200, 200], dtype=np.float32)
    raw_embed = np.random.rand(512).astype(np.float32)
    mock_face.embedding = raw_embed
    mock_face.pose = np.array([0, 0, 0], dtype=np.float32)

    with patch("face_recognition.embedder.get_face_app") as mock_app:
        mock_fa = MagicMock()
        mock_fa.get.return_value = [mock_face]
        mock_app.return_value = mock_fa
        r = client.post(
            "/embed",
            headers=HEADERS,
            files={"file": ("photo.jpg", make_face_image(400, 400), "image/jpeg")},
        )
    assert r.status_code == 200
    data = r.json()
    assert data["success"] is True
    assert len(data["embedding"]) == 512
    assert data["embedding_sha256"] is not None


# ── Matching ─────────────────────────────────────────────────────────────────

def _make_embedding() -> list:
    v = np.random.rand(512).astype(np.float32)
    return (v / np.linalg.norm(v)).tolist()


def test_match_verified():
    emb = _make_embedding()
    payload = {
        "query_embedding": emb,
        "enrolled_templates": [
            {"student_id": "uuid-001", "roll_number": "24A001", "embedding": emb}
        ],
        "threshold": 0.45,
    }
    r = client.post("/match", headers=HEADERS, json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["matched"] is True
    assert data["verification_status"] == "VERIFIED"


def test_match_no_match():
    emb1 = _make_embedding()
    emb2 = _make_embedding()
    payload = {
        "query_embedding": emb1,
        "enrolled_templates": [
            {"student_id": "uuid-001", "roll_number": "24A001", "embedding": emb2}
        ],
        "threshold": 0.90,  # intentionally very high
    }
    r = client.post("/match", headers=HEADERS, json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["matched"] is False
    assert data["verification_status"] in ("NO_MATCH", "AMBIGUOUS")


def test_match_empty_templates_rejected():
    payload = {"query_embedding": _make_embedding(), "enrolled_templates": []}
    r = client.post("/match", headers=HEADERS, json=payload)
    assert r.status_code == 400


# ── Bulk Enrollment ──────────────────────────────────────────────────────────

def test_bulk_missing_photo():
    roster = json.dumps([
        {"roll_number": "24A001", "student_name": "Test Student", "filename": "24A001.jpg"}
    ])
    zip_bytes = make_zip_with_image("24A002.jpg")  # different filename in zip
    r = client.post(
        "/bulk-embed",
        headers=HEADERS,
        files={"zip_file": ("photos.zip", zip_bytes, "application/zip")},
        data={"roster_json": roster, "job_id": "test-job-1"},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["total"] == 1
    assert data["successful"] == 0
    assert "not found" in data["results"][0]["failure_reason"]


def test_bulk_duplicate_file_detected():
    img = make_face_image()
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("24A001.jpg", img)
        zf.writestr("24A002.jpg", img)  # same bytes = duplicate
    zip_bytes = buf.getvalue()

    roster = json.dumps([
        {"roll_number": "24A001", "student_name": "Student One", "filename": "24A001.jpg"},
        {"roll_number": "24A002", "student_name": "Student Two", "filename": "24A002.jpg"},
    ])

    with patch("app.main.generate_embedding") as mock_emb:
        mock_emb.return_value = MagicMock(
            success=False,
            quality=MagicMock(rejection_reasons=["No face detected"], is_valid=False),
            embedding_sha256=None,
        )
        r = client.post(
            "/bulk-embed",
            headers=HEADERS,
            files={"zip_file": ("photos.zip", zip_bytes, "application/zip")},
            data={"roster_json": roster, "job_id": "test-job-2"},
        )
    assert r.status_code == 200
    data = r.json()
    dup = [x for x in data["results"] if x["is_duplicate_file"]]
    assert len(dup) == 1


def test_bulk_invalid_zip():
    r = client.post(
        "/bulk-embed",
        headers=HEADERS,
        files={"zip_file": ("bad.zip", b"not a zip", "application/zip")},
        data={"roster_json": "[]", "job_id": "test-job-3"},
    )
    assert r.status_code == 400
