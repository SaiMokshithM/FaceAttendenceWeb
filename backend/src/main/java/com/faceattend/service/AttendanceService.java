package com.faceattend.service;

import com.faceattend.model.Attendance;
import com.faceattend.model.Timetable;
import com.faceattend.repository.AttendanceRepository;
import com.faceattend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * AttendanceService — business logic for marking & querying attendance.
 *
 * Rules enforced:
 *  - One record per (student, date, timetable_id) — DB unique constraint + service check.
 *  - Attendance window: timetable.attendance_open → timetable.attendance_close.
 *  - After window closes, student is auto-marked ABSENT by a scheduled job (separate).
 *  - Students may only query their own records.
 *  - Admins may query/correct any record.
 */
@Service
@RequiredArgsConstructor
public class AttendanceService {

    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository    studentRepository;

    // ---------------------------------------------------------------
    // Mark Present
    // ---------------------------------------------------------------

    @Transactional
    public Attendance markPresent(String studentId,
                                  Timetable timetable,
                                  LocalDate date,
                                  String verificationMethod) {

        UUID sid = UUID.fromString(studentId);
        UUID tid = timetable.getId();

        // Duplicate guard
        Optional<Attendance> existing = attendanceRepository
                .findByStudentIdAndAttendanceDateAndTimetableId(sid, date, tid);
        if (existing.isPresent()) {
            return existing.get(); // idempotent — return existing record
        }

        // Check within attendance window
        ZonedDateTime now    = ZonedDateTime.now(IST);
        var nowTime = now.toLocalTime();
        String status;
        if (nowTime.isBefore(timetable.getAttendanceOpen())) {
            throw new IllegalStateException("Attendance window has not opened yet.");
        }
        if (!nowTime.isBefore(timetable.getAttendanceClose())) {
            // Arrived after window — mark LATE (admin can correct to ABSENT later)
            status = "LATE";
        } else {
            status = "PRESENT";
        }

        Attendance record = new Attendance();
        record.setId(UUID.randomUUID());
        record.setStudent(studentRepository.getReferenceById(sid));
        record.setTimetable(timetable);
        record.setAttendanceDate(date);
        record.setStatus(status);
        record.setCheckInTime(now);
        record.setVerificationMethod(verificationMethod.toUpperCase());

        return attendanceRepository.save(record);
    }

    // ---------------------------------------------------------------
    // Query
    // ---------------------------------------------------------------

    public List<Attendance> getStudentAttendance(String studentId, LocalDate from, LocalDate to) {
        UUID sid = UUID.fromString(studentId);
        if (from != null && to != null) {
            return attendanceRepository.findByStudentIdAndDateRange(sid, from, to);
        }
        return attendanceRepository.findByStudentIdOrderByDateDesc(sid);
    }

    public Map<String, Object> getDailySummary(LocalDate date, String subjectCode) {
        long total   = attendanceRepository.countByDate(date, subjectCode);
        long present = attendanceRepository.countByDateAndStatus(date, subjectCode, "PRESENT");
        long late    = attendanceRepository.countByDateAndStatus(date, subjectCode, "LATE");
        long absent  = total - present - late;

        return Map.of(
            "date",        date.toString(),
            "subjectCode", subjectCode != null ? subjectCode : "ALL",
            "total",       total,
            "present",     present,
            "late",        late,
            "absent",      absent
        );
    }

    // ---------------------------------------------------------------
    // Admin correction
    // ---------------------------------------------------------------

    @Transactional
    public Attendance correctAttendance(String attendanceId, String newStatus, String remarks) {
        UUID aid = UUID.fromString(attendanceId);
        Attendance record = attendanceRepository.findById(aid)
                .orElseThrow(() -> new IllegalArgumentException("Attendance record not found: " + attendanceId));
        record.setStatus(newStatus.toUpperCase());
        record.setRemarks(remarks);
        record.setVerificationMethod("CORRECTION");
        return attendanceRepository.save(record);
    }
}
