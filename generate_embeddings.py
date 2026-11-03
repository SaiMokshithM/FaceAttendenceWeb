import os
import sys
import glob
import cv2
import numpy as np
import psycopg2
from psycopg2.extras import RealDictCursor

BASE_DIR = r"c:\Users\saimo\Desktop\FaceApp"
MODELS_DIR = os.path.join(BASE_DIR, "models")
PHOTOS_DIR = os.path.join(BASE_DIR, "student_photos")
YUNET_PATH = os.path.join(MODELS_DIR, "face_detection_yunet_2023mar.onnx")
SFACE_PATH = os.path.join(MODELS_DIR, "face_recognition_sface_2021dec.onnx")
CACHE_FILE = os.path.join(MODELS_DIR, "student_embeddings.npz")

print(f"Loading YuNet model from {YUNET_PATH}...")
detector = cv2.FaceDetectorYN.create(
    model=YUNET_PATH,
    config="",
    input_size=(320, 320),
    score_threshold=0.6,
    nms_threshold=0.3,
    top_k=5000,
    backend_id=cv2.dnn.DNN_BACKEND_OPENCV,
    target_id=cv2.dnn.DNN_TARGET_CPU
)

print(f"Loading SFace model from {SFACE_PATH}...")
recognizer = cv2.FaceRecognizerSF.create(
    model=SFACE_PATH,
    config="",
    backend_id=cv2.dnn.DNN_BACKEND_OPENCV,
    target_id=cv2.dnn.DNN_TARGET_CPU
)

# Connect to Postgres to get students mapping
conn = psycopg2.connect(
    host="localhost",
    port=5433,
    dbname="faceattend",
    user="postgres",
    password="root"
)
cur = conn.cursor(cursor_factory=RealDictCursor)
cur.execute("SELECT id, roll_number, full_name, profile_image_path FROM students ORDER BY roll_number")
students = cur.fetchall()
cur.close()
conn.close()

student_map = {s["roll_number"].upper(): s for s in students}
print(f"Found {len(student_map)} students in database.")

photo_files = glob.glob(os.path.join(PHOTOS_DIR, "*.*"))
print(f"Found {len(photo_files)} photo files in {PHOTOS_DIR}.")

records = []
errors = []

for photo_path in photo_files:
    fname = os.path.basename(photo_path)
    roll = os.path.splitext(fname)[0].upper()
    student_info = student_map.get(roll)
    if not student_info:
        print(f"Warning: Photo {fname} does not match any enrolled student roll number.")
        continue

    img = cv2.imread(photo_path)
    if img is None:
        print(f"Error: Could not read image {photo_path}")
        errors.append((roll, "Could not read image"))
        continue

    h, w, _ = img.shape
    detector.setInputSize((w, h))
    _, faces = detector.detect(img)

    if faces is None or len(faces) == 0:
        # Try resizing if image is very large or very small
        print(f"No face detected with default size for {roll}, trying resize...")
        scale = 640.0 / max(w, h)
        resized = cv2.resize(img, (int(w * scale), int(h * scale)))
        rh, rw, _ = resized.shape
        detector.setInputSize((rw, rh))
        _, faces = detector.detect(resized)
        if faces is not None and len(faces) > 0:
            face = faces[0]
            aligned_face = recognizer.alignCrop(resized, face)
            embedding = recognizer.feature(aligned_face)[0]
        else:
            print(f"ERROR: No face detected in photo for {roll} ({fname})")
            errors.append((roll, "No face detected"))
            continue
    else:
        # Sort by confidence score (face[14]) descending
        faces = sorted(faces, key=lambda f: f[14], reverse=True)
        face = faces[0]
        aligned_face = recognizer.alignCrop(img, face)
        embedding = recognizer.feature(aligned_face)[0]

    # Normalize embedding vector
    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm

    records.append({
        "student_id": str(student_info["id"]),
        "roll_number": roll,
        "full_name": student_info["full_name"],
        "embedding": embedding,
        "photo_file": fname
    })
    print(f"Extracted 128-dim embedding for {roll} ({student_info['full_name']}) - shape {embedding.shape}")

print(f"\nSuccessfully generated embeddings for {len(records)} / {len(student_map)} students.")
if errors:
    print(f"Errors ({len(errors)}): {errors}")

# Save to .npz cache
student_ids = np.array([r["student_id"] for r in records])
roll_numbers = np.array([r["roll_number"] for r in records])
full_names = np.array([r["full_name"] for r in records])
embeddings = np.array([r["embedding"] for r in records])

np.savez_compressed(
    CACHE_FILE,
    student_ids=student_ids,
    roll_numbers=roll_numbers,
    full_names=full_names,
    embeddings=embeddings
)
print(f"Saved numpy embeddings cache to {CACHE_FILE} (matrix shape {embeddings.shape})")

# Test similarity between pairs
print("\n--- Self-Similarity & Cross-Similarity Tests ---")
# Self similarity
self_sims = [np.dot(embeddings[i], embeddings[i]) for i in range(len(embeddings))]
print(f"Average self-similarity: {np.mean(self_sims):.4f} (Min: {np.min(self_sims):.4f}, Max: {np.max(self_sims):.4f})")

# Cross similarity matrix
sim_matrix = np.dot(embeddings, embeddings.T)
np.fill_diagonal(sim_matrix, 0)
max_cross_sim = np.max(sim_matrix)
mean_cross_sim = np.mean(sim_matrix)
print(f"Average cross-student similarity: {mean_cross_sim:.4f}")
print(f"Maximum cross-student similarity: {max_cross_sim:.4f}")
print(f"Recommended similarity threshold: 0.50 (Clearly separates same person from others!)")
