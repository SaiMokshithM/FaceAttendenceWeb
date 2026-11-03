-- ====================================================================
-- FaceAttend Database Migration V4: Seed Initial Student
-- Roll Number: 26TEU06R508
-- ====================================================================

-- 1. Create User account for student
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    '26teu06r508@faceattend.local',
    '$2a$12$vj/uNVqXO0BJcE4278To/unZr3rupnK/t99alD1PzH39.MTJjBAq6',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- 2. Create Student profile
INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    '26TEU06R508',
    'Student 26TEU06R508',
    'student_photos/26TEU06R508.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R508.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06R525
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    '26teu06r525@faceattend.local',
    '$2a$12$Irn4XFix90h6WZW1z7vlx.g/BYT7AEEK8dMgK6MWkV7dZf5RNbKYC',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'd4e5f6a7-b8c9-0123-def1-234567890123',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    '26TEU06R525',
    'Student 26TEU06R525',
    'student_photos/26TEU06R525.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R525.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06R495
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'e5f6a7b8-c9d0-1234-ef01-234567890124',
    '26teu06r495@faceattend.local',
    '$2a$12$0r90LCQMZbGVF4oGcf0lx.2AVX4ZXT/lVESX2Bk0MkLvlxkNvw2E2',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'f6a7b8c9-d0e1-2345-f012-345678901235',
    'e5f6a7b8-c9d0-1234-ef01-234567890124',
    '26TEU06R495',
    'Student 26TEU06R495',
    'student_photos/26TEU06R495.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R495.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06R528
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'f0e1d2c3-b4a5-6789-0123-456789abcdef',
    '26teu06r528@faceattend.local',
    '$2a$12$w4Yn5oFoTKfsEWENguoIJO/pBKQFDRVMfozt3hobNR8n5EsD4doeC',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    '01f2e3d4-c5b6-7890-1234-56789abcdef0',
    'f0e1d2c3-b4a5-6789-0123-456789abcdef',
    '26TEU06R528',
    'Student 26TEU06R528',
    'student_photos/26TEU06R528.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R528.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06R518
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'a2b3c4d5-e6f7-8901-2345-6789abcdef01',
    '26teu06r518@faceattend.local',
    '$2a$12$xJ4lYwqReOGY9YtqxWhgMe/beaiRYTcaTYEHuLniQl9cWoZ7h0.sy',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'b3c4d5e6-f7a8-9012-3456-789abcdef012',
    'a2b3c4d5-e6f7-8901-2345-6789abcdef01',
    '26TEU06R518',
    'Student 26TEU06R518',
    'student_photos/26TEU06R518.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R518.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06R531
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'b4c5d6e7-f8a9-0123-4567-89abcdef0123',
    '26teu06r531@faceattend.local',
    '$2a$12$p8iSa5mnO5EDT7gYzhtNb.bQ2j2z4dJvl2e0B5MKaG./CfSIHGU6i',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'c5d6e7f8-a9b0-1234-5678-9abcdef01234',
    'b4c5d6e7-f8a9-0123-4567-89abcdef0123',
    '26TEU06R531',
    'Student 26TEU06R531',
    'student_photos/26TEU06R531.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R531.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06R482
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'c5b6a798-d0e1-2345-6789-abcdef012345',
    '26teu06r482@faceattend.local',
    '$2a$12$1wmYSZ56ATNLZFjcm0B8L.XiF4mIX21XUg1ymLgPsDx9lhR9Rn/JC',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'd6c7b8a9-e1f2-3456-7890-bcdef0123456',
    'c5b6a798-d0e1-2345-6789-abcdef012345',
    '26TEU06R482',
    'Student 26TEU06R482',
    'student_photos/26TEU06R482.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R482.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06R499
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'd7c8b9a0-f2e3-4567-8901-cdef01234567',
    '26teu06r499@faceattend.local',
    '$2a$12$vQ7yqesQJtrF9I990I.J3O0tvJ/UuYlMC6X37/8./YAovJ2xfnKLW',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'e8d9c0b1-03f4-5678-9012-def012345678',
    'd7c8b9a0-f2e3-4567-8901-cdef01234567',
    '26TEU06R499',
    'Student 26TEU06R499',
    'student_photos/26TEU06R499.jpg',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R499.jpg',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06R477
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'e9d8c7b6-a5f4-3210-9876-fedcba098765',
    '26teu06r477@faceattend.local',
    '$2a$12$FqyIIRXD7ScHU8R264YbX.vMbUAw5lmpYnotxKV6usF6NgN9Gwe8m',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'f0e9d8c7-b6a5-4321-0987-edcba0987654',
    'e9d8c7b6-a5f4-3210-9876-fedcba098765',
    '26TEU06R477',
    'Student 26TEU06R477',
    'student_photos/26TEU06R477.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R477.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06519
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'f1e2d3c4-b5a6-7890-1234-567890abcdef',
    '26teu06519@faceattend.local',
    '$2a$12$b2FDC9KSQIKvqkx9cEnMueByeJrr6llzCKBldNaaHgt.XwrhKp5bi',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    '02f3e4d5-c6b7-8901-2345-67890abcdef1',
    'f1e2d3c4-b5a6-7890-1234-567890abcdef',
    '26TEU06519',
    'Student 26TEU06519',
    'student_photos/26TEU06519.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06519.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06R513
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'a3b4c5d6-e7f8-9012-3456-7890abcdef12',
    '26teu06r513@faceattend.local',
    '$2a$12$/Wc0dBlltoMQyX7jKMH00.LEqV/hrQloDGX.ujsfQMbZSpHYTzDJS',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'b4c5d6e7-f8a9-0123-4567-890abcdef123',
    'a3b4c5d6-e7f8-9012-3456-7890abcdef12',
    '26TEU06R513',
    'Student 26TEU06R513',
    'student_photos/26TEU06R513.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R513.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06527
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'b5c6d7e8-f9a0-1234-5678-90abcdef1234',
    '26teu06527@faceattend.local',
    '$2a$12$y7FzwxhMX9QbR3q5kz0l9eYzL240lxUclqjBk01ubXM2bOTP/NTkm',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'c6d7e8f9-a0b1-2345-6789-0abcdef12345',
    'b5c6d7e8-f9a0-1234-5678-90abcdef1234',
    '26TEU06527',
    'Student 26TEU06527',
    'student_photos/26TEU06527.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06527.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06R500
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'c6d7e8f9-a0b1-2345-6789-0123456789ab',
    '26teu06r500@faceattend.local',
    '$2a$12$D1ohqABhWniLG6hYWNOlKOu0GDhlH/UXSzp1jK/lfygS83DYufxoW',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'd7e8f9a0-b1c2-3456-7890-123456789abc',
    'c6d7e8f9-a0b1-2345-6789-0123456789ab',
    '26TEU06R500',
    'Student 26TEU06R500',
    'student_photos/26TEU06R500.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R500.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06R492
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'd8e9f0a1-b2c3-4567-8901-23456789abcd',
    '26teu06r492@faceattend.local',
    '$2a$12$tyKaUe2CpwZRcMDRbpovTeBaDphqvL3t8RMPeGPryt4agsbkFBdXy',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'e9f0a1b2-c3d4-5678-9012-3456789abcde',
    'd8e9f0a1-b2c3-4567-8901-23456789abcd',
    '26TEU06R492',
    'Student 26TEU06R492',
    'student_photos/26TEU06R492.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R492.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06R486
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'e0f1a2b3-c4d5-6789-0123-456789abcdef',
    '26teu06r486@faceattend.local',
    '$2a$12$bFdZi2UmP/Ibxwgnu0.73OasyPNp7TTBktMa9TnAOSBYmELPFDwrO',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'f1a2b3c4-d5e6-7890-1234-56789abcdef0',
    'e0f1a2b3-c4d5-6789-0123-456789abcdef',
    '26TEU06R486',
    'Student 26TEU06R486',
    'student_photos/26TEU06R486.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R486.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06R538
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'f2a3b4c5-d6e7-8901-2345-6789abcdef01',
    '26teu06r538@faceattend.local',
    '$2a$12$GbVynva0MybtI93/PyGikOAjYbiYrqyP9oViQrWxu7sSYbLmiPgMm',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    '03b4c5d6-e7f8-9012-3456-789abcdef012',
    'f2a3b4c5-d6e7-8901-2345-6789abcdef01',
    '26TEU06R538',
    'Student 26TEU06R538',
    'student_photos/26TEU06R538.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R538.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06R464
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'a4b5c6d7-e8f9-0123-4567-890123456789',
    '26teu06r464@faceattend.local',
    '$2a$12$bz6/ojAEjAVD2KmU8NivkehMhszfCworNgwcqxRBIN8I58jleNICe',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'b5c6d7e8-f9a0-1234-5678-901234567890',
    'a4b5c6d7-e8f9-0123-4567-890123456789',
    '26TEU06R464',
    'Student 26TEU06R464',
    'student_photos/26TEU06R464.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R464.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06R535
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'b6a7c8d9-e0f1-2345-6789-0123456789ab',
    '26teu06r535@faceattend.local',
    '$2a$12$2JPkldN.xLk6n39WMun3F./ijw5U1crmaswvlmoUNv3kslo20UbyC',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'c7b8d9e0-f1a2-3456-7890-123456789abc',
    'b6a7c8d9-e0f1-2345-6789-0123456789ab',
    '26TEU06R535',
    'Student 26TEU06R535',
    'student_photos/26TEU06R535.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R535.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06R516
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'c7d8e9f0-a1b2-3456-7890-123456789abc',
    '26teu06r516@faceattend.local',
    '$2a$12$hLFcT9zyCI./fmsfR.FZHOYLkiAtwfdshHUJ0APlI81CazMd5alW2',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'd8e9f0a1-b2c3-4567-8901-23456789abcd',
    'c7d8e9f0-a1b2-3456-7890-123456789abc',
    '26TEU06R516',
    'Student 26TEU06R516',
    'student_photos/26TEU06R516.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R516.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06R451
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'd8e9f0a1-b2c3-4567-8901-23456789abc0',
    '26teu06r451@faceattend.local',
    '$2a$12$jXbLxwZmXf3/YkK651fgwu85o7hBXcirNQBOIbPoxFVA.x04CqpbS',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'e9f0a1b2-c3d4-5678-9012-3456789abcde',
    'd8e9f0a1-b2c3-4567-8901-23456789abc0',
    '26TEU06R451',
    'Student 26TEU06R451',
    'student_photos/26TEU06R451.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R451.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06R515
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'e0f1a2b3-c4d5-6789-0123-456789abcdef',
    '26teu06r515@faceattend.local',
    '$2a$12$fr1QIwGgzurn629.63M7euYTVVbOcR3kGhSALvR2GV4bl1o0RdNoq',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'f1a2b3c4-d5e6-7890-1234-56789abcdef0',
    'e0f1a2b3-c4d5-6789-0123-456789abcdef',
    '26TEU06R515',
    'Student 26TEU06R515',
    'student_photos/26TEU06R515.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R515.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06498
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'f1a2b3c4-d5e6-7890-1234-0123456789ab',
    '26teu06498@faceattend.local',
    '$2a$12$2Dq85dxPVTaKvxoJOb23A.oth3pHj5297G1ZxJx1QXiYqk33oyBeG',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'a2b3c4d5-e6f7-8901-2345-123456789abc',
    'f1a2b3c4-d5e6-7890-1234-0123456789ab',
    '26TEU06498',
    'Student 26TEU06498',
    'student_photos/26TEU06498.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06498.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06494
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'a3b4c5d6-e7f8-9012-3456-123456789abc',
    '26teu06494@faceattend.local',
    '$2a$12$QFWt4WI58jx626jAbctuiewxss33WPCB98FmMjG.IUq2259wfylMu',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'b4c5d6e7-f8a9-0123-4567-23456789abcd',
    'a3b4c5d6-e7f8-9012-3456-123456789abc',
    '26TEU06494',
    'Student 26TEU06494',
    'student_photos/26TEU06494.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06494.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06R491
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'b4c5d6e7-f8a9-0123-4567-3456789abcde',
    '26teu06r491@faceattend.local',
    '$2a$12$7dxpNhr13FcXfrL7cSgPwezke6CQLiICizeUKxoUGos/0Z8vXjFmy',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'c5d6e7f8-a9b0-1234-5678-456789abcdef',
    'b4c5d6e7-f8a9-0123-4567-3456789abcde',
    '26TEU06R491',
    'Student 26TEU06R491',
    'student_photos/26TEU06R491.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R491.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06R536
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'c5d6e7f8-a9b0-1234-5678-56789abcdef0',
    '26teu06r536@faceattend.local',
    '$2a$12$KLiNVlk25n4s93gqywqhKuiRAlLio47q60nBBCbZGJtJgUcRggumu',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'd6e7f8a9-b0c1-2345-6789-6789abcdef01',
    'c5d6e7f8-a9b0-1234-5678-56789abcdef0',
    '26TEU06R536',
    'Student 26TEU06R536',
    'student_photos/26TEU06R536.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R536.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06R537
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'd6e7f8a9-b0c1-2345-6789-789abcdef012',
    '26teu06r537@faceattend.local',
    '$2a$12$JqAwXLp7mmrHLfb5nPsB.uqm2Vx7fNuXTerwRbgALZGK1KaR/52pC',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'e7f8a9b0-c1d2-3456-7890-89abcdef0123',
    'd6e7f8a9-b0c1-2345-6789-789abcdef012',
    '26TEU06R537',
    'Student 26TEU06R537',
    'student_photos/26TEU06R537.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R537.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06R460
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'e7f8a9b0-c1d2-3456-7890-9abcdef01234',
    '26teu06r460@faceattend.local',
    '$2a$12$aoO1eC3hPUl1go7l21IgoupUIWE9fd8j41shVguS5gVkyHZ56qBcu',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'f8a9b0c1-d2e3-4567-8901-abcdef012345',
    'e7f8a9b0-c1d2-3456-7890-9abcdef01234',
    '26TEU06R460',
    'Student 26TEU06R460',
    'student_photos/26TEU06R460.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R460.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06R511
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'f8a9b0c1-d2e3-4567-8901-0123456789ab',
    '26teu06r511@faceattend.local',
    '$2a$12$CGa9eF09M31ivJ1wI/EZ6O6SkwAn28/EDzhAGFs6JmcUNUY.PXM.q',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'a9b0c1d2-e3f4-5678-9012-123456789abc',
    'f8a9b0c1-d2e3-4567-8901-0123456789ab',
    '26TEU06R511',
    'Student 26TEU06R511',
    'student_photos/26TEU06R511.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R511.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06R479
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'a9b0c1d2-e3f4-5678-9012-3456789abcde',
    '26teu06r479@faceattend.local',
    '$2a$12$MeyOmrAZZtR0cveWbXRec.BAVpo.o9r3eFifJDjiPSfjkE7Cqlpwa',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'b0c1d2e3-f4a5-6789-0123-456789abcdef',
    'a9b0c1d2-e3f4-5678-9012-3456789abcde',
    '26TEU06R479',
    'Student 26TEU06R479',
    'student_photos/26TEU06R479.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R479.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06R505
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'b0c1d2e3-f4a5-6789-0123-56789abcdef0',
    '26teu06r505@faceattend.local',
    '$2a$12$iTfD7ybG6z3B30B03.oD1..jBRSRb1cMOglYPPi9OYYMi5J5isOI2',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'c1d2e3f4-a5b6-7890-1234-6789abcdef01',
    'b0c1d2e3-f4a5-6789-0123-56789abcdef0',
    '26TEU06R505',
    'Student 26TEU06R505',
    'student_photos/26TEU06R505.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R505.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06R524
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'c1d2e3f4-a5b6-7890-1234-789abcdef012',
    '26teu06r524@faceattend.local',
    '$2a$12$ZnafNKDmrmbg0FVpXHaAaO/Lfsumzp6CXIafbjFudV6YHbUkaTyaO',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'd2e3f4a5-b6c7-8901-2345-89abcdef0123',
    'c1d2e3f4-a5b6-7890-1234-789abcdef012',
    '26TEU06R524',
    'Student 26TEU06R524',
    'student_photos/26TEU06R524.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R524.png',
    updated_at = CURRENT_TIMESTAMP;

-- Student: 26TEU06R472
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES (
    'd2e3f4a5-b6c7-8901-2345-9abcdef01234',
    '26teu06r472@faceattend.local',
    '$2a$12$bufMsmt2lu./ZrfBAKAEgO/cjqjTmdt.boQNYgg.xqymt2vH3WaLO',
    'STUDENT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, full_name, profile_image_path, enrollment_status)
VALUES (
    'e3f4a5b6-c7d8-9012-3456-abcdef012345',
    'd2e3f4a5-b6c7-8901-2345-9abcdef01234',
    '26TEU06R472',
    'Student 26TEU06R472',
    'student_photos/26TEU06R472.png',
    'ENROLLED'
)
ON CONFLICT (roll_number) DO UPDATE SET
    enrollment_status = 'ENROLLED',
    profile_image_path = 'student_photos/26TEU06R472.png',
    updated_at = CURRENT_TIMESTAMP;
