package com.faceattend.service;

import com.faceattend.model.Timetable;
import com.faceattend.repository.TimetableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

/**
 * TimetableService — resolves "what subject / period is active right now?"
 *
 * Timezone:  Asia/Kolkata (IST, UTC+5:30)
 * Period schedule (no gaps for breaks):
 *   P1  09:20–10:10
 *   P2  10:10–11:00
 *   --- Morning break 11:00–11:30 (ignored) ---
 *   P3  11:30–12:20
 *   P4  12:20–13:10
 *   --- Lunch break  13:10–14:00 (ignored) ---
 *   P5  14:00–14:50
 *   P6  14:50–15:40
 *
 * Working days: Monday(1) – Saturday(6). Sunday is never a college day.
 */
@Service
@RequiredArgsConstructor
public class TimetableService {

    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");

    /** College operating window */
    private static final LocalTime COLLEGE_START = LocalTime.of(9, 20);
    private static final LocalTime COLLEGE_END   = LocalTime.of(15, 40);

    /** Break windows — attendance must NOT be opened during these */
    private static final LocalTime MORNING_BREAK_START = LocalTime.of(11, 0);
    private static final LocalTime MORNING_BREAK_END   = LocalTime.of(11, 30);
    private static final LocalTime LUNCH_BREAK_START   = LocalTime.of(13, 10);
    private static final LocalTime LUNCH_BREAK_END     = LocalTime.of(14, 0);

    private final TimetableRepository timetableRepository;

    // ----------------------------------------------------------------
    // Public API
    // ----------------------------------------------------------------

    /**
     * Returns the timetable entry for the *current* IST day and clock time,
     * or empty if we are outside college hours, on a Sunday, or in a break.
     */
    public Optional<Timetable> getCurrentPeriod() {
        ZonedDateTime now = ZonedDateTime.now(IST);
        int  dayOfWeek = now.getDayOfWeek().getValue(); // 1=Mon … 7=Sun
        LocalTime time = now.toLocalTime();
        return resolve(dayOfWeek, time);
    }

    /**
     * Returns the timetable entry for a *specific* date + clock time (IST).
     * Useful for historical queries, testing and admin overrides.
     */
    public Optional<Timetable> getPeriodAt(LocalDate date, LocalTime time) {
        int dayOfWeek = date.getDayOfWeek().getValue();
        return resolve(dayOfWeek, time);
    }

    /**
     * Returns all timetable entries for today's day-of-week, ordered by period.
     */
    public List<Timetable> getTodaySchedule() {
        ZonedDateTime now = ZonedDateTime.now(IST);
        int dayOfWeek = now.getDayOfWeek().getValue();
        return timetableRepository.findByDayOfWeekOrderByPeriodNumber(dayOfWeek);
    }

    /**
     * Returns the full weekly timetable (all 6 days × 6 periods).
     */
    public List<Timetable> getWeeklyTimetable() {
        return timetableRepository.findAllByOrderByDayOfWeekAscPeriodNumberAsc();
    }

    // ----------------------------------------------------------------
    // Internals
    // ----------------------------------------------------------------

    private Optional<Timetable> resolve(int dayOfWeek, LocalTime time) {
        // Sunday (7) is never a working day
        if (dayOfWeek == 7) return Optional.empty();
        // Outside college hours
        if (time.isBefore(COLLEGE_START) || !time.isBefore(COLLEGE_END)) return Optional.empty();
        // During breaks
        if (isDuringBreak(time)) return Optional.empty();

        return timetableRepository.findByDayOfWeekAndTime(dayOfWeek, time);
    }

    private boolean isDuringBreak(LocalTime t) {
        return (t.equals(MORNING_BREAK_START) || (t.isAfter(MORNING_BREAK_START) && t.isBefore(MORNING_BREAK_END)))
            || (t.equals(LUNCH_BREAK_START)   || (t.isAfter(LUNCH_BREAK_START)   && t.isBefore(LUNCH_BREAK_END)));
    }
}
