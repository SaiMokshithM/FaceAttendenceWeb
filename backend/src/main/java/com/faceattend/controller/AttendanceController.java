package com.faceattend.controller;

import com.faceattend.model.Timetable;
import com.faceattend.service.AttendanceService;
import com.faceattend.service.TimetableService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * AttendanceController — period-aware attendance endpoints.
 *
 * Key endpoints:
 *  GET  /api/attendance/current-period   → what subject/period is running right now
 *  GET  /api/attendance/today            → today's full schedule (6 periods)
 *  GET  /api/attendance/weekly           → full Mon–Sat timetable
 *  POST /api/attendance/mark             → mark a student present for current period
 *  GET  /api/attendance/student/{id}     → student's own records (STUDENT role)
 *  GET  /api/attendance/admin/summary    → admin summary for all students
 */
@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");

    private final TimetableService   timetableService;
    private final AttendanceService  attendanceService;

    // ---------------------------------------------------------------
    // Timetable / Period resolution
    // ---------------------------------------------------------------

    /** Returns the currently active period + subject in IST, or 404 if break / outside hours */
    @GetMapping("/current-period")
    public ResponseEntity<?> getCurrentPeriod() {
        Optional<Timetable> entry = timetableService.getCurrentPeriod();
        if (entry.isEmpty()) {
            ZonedDateTime now = ZonedDateTime.now(IST);
            return ResponseEntity.ok(Map.of(
                "active",  false,
                "message", "No active period right now",
                "serverTime", now.toString()
            ));
        }
        Timetable t = entry.get();
        return ResponseEntity.ok(Map.of(
            "active",        true,
            "dayOfWeek",     t.getDayOfWeek(),
            "periodNumber",  t.getPeriod().getPeriodNumber(),
            "periodName",    t.getPeriod().getPeriodName(),
            "startTime",     t.getPeriod().getStartTime().toString(),
            "endTime",       t.getPeriod().getEndTime().toString(),
            "subjectCode",   t.getSubject().getSubjectCode(),
            "subjectName",   t.getSubject().getSubjectName(),
            "faculty",       t.getSubject().getFacultyName(),
            "timetableId",   t.getId().toString(),
            "attendanceOpen",  t.getAttendanceOpen().toString(),
            "attendanceClose", t.getAttendanceClose().toString(),
            "serverTime",    ZonedDateTime.now(IST).toString()
        ));
    }

    /** Today's full 6-period schedule */
    @GetMapping("/today")
    public ResponseEntity<List<Timetable>> getTodaySchedule() {
        return ResponseEntity.ok(timetableService.getTodaySchedule());
    }

    /** Full Mon–Sat weekly timetable */
    @GetMapping("/weekly")
    public ResponseEntity<List<Timetable>> getWeeklyTimetable() {
        return ResponseEntity.ok(timetableService.getWeeklyTimetable());
    }

    // ---------------------------------------------------------------
    // Attendance marking
    // ---------------------------------------------------------------

    /**
     * Mark a student PRESENT for the current active period.
     * Body: { "studentId": "uuid", "verificationMethod": "FACE" }
     */
    @PostMapping("/mark")
    @PreAuthorize("hasAnyRole('ADMIN','STUDENT')")
    public ResponseEntity<?> markAttendance(@RequestBody Map<String, String> body) {
        Optional<Timetable> current = timetableService.getCurrentPeriod();
        if (current.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "No active period. Attendance cannot be marked during breaks or outside college hours."
            ));
        }
        String studentId          = body.get("studentId");
        String verificationMethod = body.getOrDefault("verificationMethod", "FACE");
        LocalDate today           = LocalDate.now(IST);

        return ResponseEntity.ok(
            attendanceService.markPresent(studentId, current.get(), today, verificationMethod)
        );
    }

    // ---------------------------------------------------------------
    // Student — own records only
    // ---------------------------------------------------------------

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('STUDENT') and #studentId == authentication.principal.studentId or hasRole('ADMIN')")
    public ResponseEntity<?> getStudentAttendance(
            @PathVariable String studentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(attendanceService.getStudentAttendance(studentId, from, to));
    }

    // ---------------------------------------------------------------
    // Admin — all students
    // ---------------------------------------------------------------

    @GetMapping("/admin/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String subjectCode) {
        LocalDate target = (date != null) ? date : LocalDate.now(IST);
        return ResponseEntity.ok(attendanceService.getDailySummary(target, subjectCode));
    }

    @GetMapping("/admin/student/{studentId}/report")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getStudentReport(
            @PathVariable String studentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(attendanceService.getStudentAttendance(studentId, from, to));
    }

    /** Admin manual correction */
    @PutMapping("/admin/correct/{attendanceId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> correctAttendance(
            @PathVariable String attendanceId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
            attendanceService.correctAttendance(attendanceId, body.get("status"), body.get("remarks"))
        );
    }
}
