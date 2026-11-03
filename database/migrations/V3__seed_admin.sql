-- ====================================================================
-- FaceAttend Database Migration V3: Seed Initial Admin Account
-- Default Credentials:
-- Email: admin@faceattend.com
-- Password: AdminPassword@2026
-- ====================================================================

-- BCrypt hash for 'AdminPassword@2026' (strength 12)
INSERT INTO users (email, password_hash, role, is_active)
VALUES (
    'admin@faceattend.com',
    '$2a$12$Yd.X.kQp2N6XfJ3H5kR1re7Oq0yL7Q1.12pP7o3aR1lDkC1N0/Q0W',
    'ADMIN',
    TRUE
)
ON CONFLICT (email) DO NOTHING;
