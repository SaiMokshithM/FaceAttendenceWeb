-- ====================================================================
-- FaceAttend V2: Seed Periods
-- Branch: CSM | Section: F | Malla Reddy (MR) Deemed University
-- Timezone: Asia/Kolkata
-- 6 periods per day (Morning Break & Lunch Break excluded)
-- ====================================================================

INSERT INTO periods (period_number, period_name, start_time, end_time)
VALUES
    (1, 'Period 1', '09:20:00', '10:10:00'),
    (2, 'Period 2', '10:10:00', '11:00:00'),
    -- Morning Break: 11:00 AM - 11:30 AM (not a period)
    (3, 'Period 3', '11:30:00', '12:20:00'),
    (4, 'Period 4', '12:20:00', '13:10:00'),
    -- Lunch Break: 13:10 - 14:00 (not a period)
    (5, 'Period 5', '14:00:00', '14:50:00'),
    (6, 'Period 6', '14:50:00', '15:40:00')
ON CONFLICT (period_number) DO UPDATE SET
    period_name = EXCLUDED.period_name,
    start_time  = EXCLUDED.start_time,
    end_time    = EXCLUDED.end_time;
