-- ====================================================================
-- FaceAttend V5: Seed Subjects & Timetable
-- Branch: CSM | Section: F | Malla Reddy (MR) Deemed University
-- Working Days: Mon(1) to Sat(6)
-- ====================================================================

-- ---------------------------------------------------------------
-- 1. SUBJECTS
-- ---------------------------------------------------------------
INSERT INTO subjects (id, subject_code, subject_name, faculty_name)
VALUES
    ('aaaaaaaa-0001-0000-0000-000000000001', 'TECH001',   'Technical Training',                            'TBD'),
    ('aaaaaaaa-0001-0000-0000-000000000002', '230BT02',   'Mathematical Foundation for Computer Science',  'Dr. K. Vijay Kumar'),
    ('aaaaaaaa-0001-0000-0000-000000000003', '2505T02',   'Python for Scientific Computing',               'P. Liyaz'),
    ('aaaaaaaa-0001-0000-0000-000000000004', '250HT01',   'Language and Professional Skills',              'Dr. Sk Iliyas Ali'),
    ('aaaaaaaa-0001-0000-0000-000000000005', '2505T01',   'Foundations of Web Development',               'Dr. R. Devendra Reddy')
ON CONFLICT (subject_code) DO UPDATE SET
    subject_name = EXCLUDED.subject_name,
    faculty_name = EXCLUDED.faculty_name;

-- ---------------------------------------------------------------
-- 2. TIMETABLE
-- day_of_week: 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
-- attendance_open  = period start_time
-- attendance_close = 10 min after period start
-- ---------------------------------------------------------------

-- ======== MONDAY ========
-- P1: Technical Training   09:20-10:10
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 1, p.id, s.id, '09:20:00', '09:30:00', 10
FROM periods p, subjects s
WHERE p.period_number = 1 AND s.subject_code = 'TECH001'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- P2: Technical Training   10:10-11:00
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 1, p.id, s.id, '10:10:00', '10:20:00', 10
FROM periods p, subjects s
WHERE p.period_number = 2 AND s.subject_code = 'TECH001'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- P3: LPS   11:30-12:20
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 1, p.id, s.id, '11:30:00', '11:40:00', 10
FROM periods p, subjects s
WHERE p.period_number = 3 AND s.subject_code = '250HT01'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- P4: PSC   12:20-13:10
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 1, p.id, s.id, '12:20:00', '12:30:00', 10
FROM periods p, subjects s
WHERE p.period_number = 4 AND s.subject_code = '2505T02'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- P5: MFCS   14:00-14:50
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 1, p.id, s.id, '14:00:00', '14:10:00', 10
FROM periods p, subjects s
WHERE p.period_number = 5 AND s.subject_code = '230BT02'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- P6: FWD   14:50-15:40
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 1, p.id, s.id, '14:50:00', '15:00:00', 10
FROM periods p, subjects s
WHERE p.period_number = 6 AND s.subject_code = '2505T01'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- ======== TUESDAY ========
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 2, p.id, s.id, '09:20:00', '09:30:00', 10
FROM periods p, subjects s WHERE p.period_number=1 AND s.subject_code='TECH001'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 2, p.id, s.id, '10:10:00', '10:20:00', 10
FROM periods p, subjects s WHERE p.period_number=2 AND s.subject_code='TECH001'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- P3: LPS
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 2, p.id, s.id, '11:30:00', '11:40:00', 10
FROM periods p, subjects s WHERE p.period_number=3 AND s.subject_code='250HT01'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- P4: FWD
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 2, p.id, s.id, '12:20:00', '12:30:00', 10
FROM periods p, subjects s WHERE p.period_number=4 AND s.subject_code='2505T01'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- P5: PSC
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 2, p.id, s.id, '14:00:00', '14:10:00', 10
FROM periods p, subjects s WHERE p.period_number=5 AND s.subject_code='2505T02'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- P6: MFCS
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 2, p.id, s.id, '14:50:00', '15:00:00', 10
FROM periods p, subjects s WHERE p.period_number=6 AND s.subject_code='230BT02'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- ======== WEDNESDAY ========
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 3, p.id, s.id, '09:20:00', '09:30:00', 10
FROM periods p, subjects s WHERE p.period_number=1 AND s.subject_code='TECH001'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 3, p.id, s.id, '10:10:00', '10:20:00', 10
FROM periods p, subjects s WHERE p.period_number=2 AND s.subject_code='TECH001'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- P3: MFCS
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 3, p.id, s.id, '11:30:00', '11:40:00', 10
FROM periods p, subjects s WHERE p.period_number=3 AND s.subject_code='230BT02'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- P4: FWD
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 3, p.id, s.id, '12:20:00', '12:30:00', 10
FROM periods p, subjects s WHERE p.period_number=4 AND s.subject_code='2505T01'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- P5: LPS
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 3, p.id, s.id, '14:00:00', '14:10:00', 10
FROM periods p, subjects s WHERE p.period_number=5 AND s.subject_code='250HT01'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- P6: PSC
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 3, p.id, s.id, '14:50:00', '15:00:00', 10
FROM periods p, subjects s WHERE p.period_number=6 AND s.subject_code='2505T02'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- ======== THURSDAY ========
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 4, p.id, s.id, '09:20:00', '09:30:00', 10
FROM periods p, subjects s WHERE p.period_number=1 AND s.subject_code='TECH001'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 4, p.id, s.id, '10:10:00', '10:20:00', 10
FROM periods p, subjects s WHERE p.period_number=2 AND s.subject_code='TECH001'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- P3: LPS
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 4, p.id, s.id, '11:30:00', '11:40:00', 10
FROM periods p, subjects s WHERE p.period_number=3 AND s.subject_code='250HT01'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- P4: MFCS
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 4, p.id, s.id, '12:20:00', '12:30:00', 10
FROM periods p, subjects s WHERE p.period_number=4 AND s.subject_code='230BT02'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- P5: FWD
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 4, p.id, s.id, '14:00:00', '14:10:00', 10
FROM periods p, subjects s WHERE p.period_number=5 AND s.subject_code='2505T01'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- P6: PSC
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 4, p.id, s.id, '14:50:00', '15:00:00', 10
FROM periods p, subjects s WHERE p.period_number=6 AND s.subject_code='2505T02'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- ======== FRIDAY ========
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 5, p.id, s.id, '09:20:00', '09:30:00', 10
FROM periods p, subjects s WHERE p.period_number=1 AND s.subject_code='TECH001'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 5, p.id, s.id, '10:10:00', '10:20:00', 10
FROM periods p, subjects s WHERE p.period_number=2 AND s.subject_code='TECH001'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- P3: FWD
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 5, p.id, s.id, '11:30:00', '11:40:00', 10
FROM periods p, subjects s WHERE p.period_number=3 AND s.subject_code='2505T01'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- P4: PSC
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 5, p.id, s.id, '12:20:00', '12:30:00', 10
FROM periods p, subjects s WHERE p.period_number=4 AND s.subject_code='2505T02'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- P5: MFCS
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 5, p.id, s.id, '14:00:00', '14:10:00', 10
FROM periods p, subjects s WHERE p.period_number=5 AND s.subject_code='230BT02'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- P6: LPS
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 5, p.id, s.id, '14:50:00', '15:00:00', 10
FROM periods p, subjects s WHERE p.period_number=6 AND s.subject_code='250HT01'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- ======== SATURDAY ========
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 6, p.id, s.id, '09:20:00', '09:30:00', 10
FROM periods p, subjects s WHERE p.period_number=1 AND s.subject_code='TECH001'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 6, p.id, s.id, '10:10:00', '10:20:00', 10
FROM periods p, subjects s WHERE p.period_number=2 AND s.subject_code='TECH001'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- P3: PSC
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 6, p.id, s.id, '11:30:00', '11:40:00', 10
FROM periods p, subjects s WHERE p.period_number=3 AND s.subject_code='2505T02'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- P4: FWD
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 6, p.id, s.id, '12:20:00', '12:30:00', 10
FROM periods p, subjects s WHERE p.period_number=4 AND s.subject_code='2505T01'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- P5: LPS
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 6, p.id, s.id, '14:00:00', '14:10:00', 10
FROM periods p, subjects s WHERE p.period_number=5 AND s.subject_code='250HT01'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;

-- P6: MFCS
INSERT INTO timetable (day_of_week, period_id, subject_id, attendance_open, attendance_close, late_threshold_minutes)
SELECT 6, p.id, s.id, '14:50:00', '15:00:00', 10
FROM periods p, subjects s WHERE p.period_number=6 AND s.subject_code='230BT02'
ON CONFLICT (day_of_week, period_id) DO UPDATE SET subject_id=EXCLUDED.subject_id, attendance_open=EXCLUDED.attendance_open, attendance_close=EXCLUDED.attendance_close;
