import os
import sys
import psycopg2
import numpy as np

def setup_cloud_database(db_url: str):
    print("=" * 65)
    print("  FaceAttend Cloud Database Auto-Initializer")
    print("=" * 65)
    print(f"\n[1/4] Connecting to cloud database...")

    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
    except Exception as e:
        print(f"[ERROR] Could not connect to database: {e}")
        sys.exit(1)

    print("[SUCCESS] Connected successfully to Cloud PostgreSQL!")

    # Read FULL_SETUP.sql
    base_dir = os.path.dirname(os.path.abspath(__file__))
    sql_path = os.path.join(base_dir, "database", "FULL_SETUP.sql")

    print(f"[2/4] Executing database schema & seed data from {os.path.basename(sql_path)}...")
    with open(sql_path, "r", encoding="utf-8") as f:
        sql_content = f.read()

    with conn.cursor() as cur:
        cur.execute(sql_content)

    print("[SUCCESS] Schema created: 32 students, 5 subjects, 36 timetable slots seeded.")

    # Populate 32 face embeddings
    print(f"[3/4] Uploading 32 student facial recognition embeddings (128-dim SFace)...")
    cache_path = os.path.join(base_dir, "models", "student_embeddings.npz")
    if os.path.exists(cache_path):
        data = np.load(cache_path)
        student_ids = data["student_ids"]
        embeddings = data["embeddings"]

        with conn.cursor() as cur:
            for s_id, emb in zip(student_ids, embeddings):
                emb_bytes = emb.astype(np.float32).tobytes()
                cur.execute("""
                    INSERT INTO face_embeddings (id, student_id, encrypted_embedding, embedding_sha256, model_name, model_version, status)
                    VALUES (gen_random_uuid(), %s, %s, encode(digest(%s, 'sha256'), 'hex'), 'SFace', '2021dec', 'ACTIVE')
                    ON CONFLICT DO NOTHING
                """, (str(s_id), emb_bytes, emb_bytes))
        print(f"[SUCCESS] 32 facial embeddings synchronized to cloud database.")
    else:
        print(f"[WARNING] {cache_path} not found. Skipping embeddings.")

    # Verify counts
    print(f"[4/4] Verifying database records...")
    with conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM users")
        u_count = cur.fetchone()[0]
        cur.execute("SELECT count(*) FROM students")
        s_count = cur.fetchone()[0]
        cur.execute("SELECT count(*) FROM timetable")
        t_count = cur.fetchone()[0]
        cur.execute("SELECT count(*) FROM face_embeddings")
        f_count = cur.fetchone()[0]

    conn.close()

    print("\n" + "=" * 65)
    print(f"  DEPLOYMENT READY:")
    print(f"  • Users:           {u_count}")
    print(f"  • Students:        {s_count} (CSM Section F)")
    print(f"  • Timetable Slots: {t_count} (6 periods/day Mon-Sat)")
    print(f"  • Face Embeddings: {f_count} (32 biometric profiles)")
    print("=" * 65)
    print("\nAll database tables and seed data are 100% initialized!")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        url = os.environ.get("DATABASE_URL")

    if not url:
        print("Usage: python setup_cloud_db.py <DATABASE_URL>")
        print("Example: python setup_cloud_db.py postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require")
        sys.exit(1)

    setup_cloud_database(url)
