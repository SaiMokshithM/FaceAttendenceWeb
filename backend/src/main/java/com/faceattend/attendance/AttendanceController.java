package com.faceattend.attendance;

import com.faceattend.common.ApiResponse;
import com.faceattend.common.BusinessException;
import com.faceattend.common.ResourceNotFoundException;
import com.faceattend.student.Student;
import com.faceattend.student.StudentRepository;
import com.faceattend.timetable.Timetable;
import com.faceattend.timetable.TimetableRepository;
import com.faceattend.user.UserEntity;
import com.faceattend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.*;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceRepository attendanceRepo;
    private final StudentRepository studentRepo;
    private final UserRepository userRepo;
    private final TimetableRepository timetableRepo;

    // ── Get my attendance (Student) ───────────────────────────────────────────
    @GetMapping("/student/me")
    public ResponseEntity<ApiResponse<AttendanceSummaryDto>> getMyAttendance(
            @AuthenticationPrincipal UserDetails userDetails) {

        UserEntity user = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Student student = studentRepo.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        List<Attendance> records = attendanceRepo.findByStudentIdOrderByAttendanceDateDesc(student.getId());
        long present = records.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT).count();
        long late    = records.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.LATE).count();
        long absent  = records.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.ABSENT).count();
        long total   = records.size();
        double pct   = total == 0 ? 0 : Math.round(((present + late) * 100.0 / total) * 10) / 10.0;

        return ResponseEntity.ok(ApiResponse.ok(new AttendanceSummaryDto(
                student.getId(), student.getRollNumber(), student.getFullName(),
                total, present, late, absent, pct,
                records.stream().map(AttendanceRecordDto::from).toList()
        )));
    }

    // ── Get student attendance by ID (Admin) ──────────────────────────────────
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceSummaryDto>> getStudentAttendance(
            @PathVariable UUID studentId) {

        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        List<Attendance> records = attendanceRepo.findByStudentIdOrderByAttendanceDateDesc(studentId);
        long present = records.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT).count();
        long late    = records.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.LATE).count();
        long absent  = records.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.ABSENT).count();
        long total   = records.size();
        double pct   = total == 0 ? 0 : Math.round(((present + late) * 100.0 / total) * 10) / 10.0;

        return ResponseEntity.ok(ApiResponse.ok(new AttendanceSummaryDto(
                student.getId(), student.getRollNumber(), student.getFullName(),
                total, present, late, absent, pct,
                records.stream().map(AttendanceRecordDto::from).toList()
        )));
    }

    // ── Mark attendance (Student — after face verification) ───────────────────
    @PostMapping("/mark")
    public ResponseEntity<ApiResponse<AttendanceMarkResult>> markAttendance(
            @RequestBody MarkAttendanceRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {

        // 1. Identify student from JWT — never trust client-supplied ID
        UserEntity user = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Student student = studentRepo.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        // 2. Get current day/period from server time
        ZoneId zone = ZoneId.of("Asia/Kolkata"); // Institution timezone
        LocalDate today = LocalDate.now(zone);
        LocalTime now = LocalTime.now(zone);
        int dayOfWeek = today.getDayOfWeek().getValue(); // 1=MON … 6=SAT

        if (dayOfWeek > 6) {
            throw new BusinessException("No classes on Sunday.");
        }

        // 3. Find matching timetable entry
        Timetable timetable = timetableRepo.findByDayOfWeekOrderByPeriodPeriodNumber(dayOfWeek)
                .stream()
                .filter(t -> !now.isBefore(t.getAttendanceOpen()) && !now.isAfter(t.getAttendanceClose()))
                .findFirst()
                .orElseThrow(() -> new BusinessException("No attendance window is open at this time."));

        // 4. Duplicate check
        if (attendanceRepo.existsByStudentIdAndAttendanceDateAndTimetableId(
                student.getId(), today, timetable.getId())) {
            throw new BusinessException("Attendance already marked for this period.");
        }

        // 5. Determine PRESENT or LATE
        Attendance.AttendanceStatus status = now.isAfter(
                timetable.getAttendanceOpen().plusMinutes(timetable.getLateThresholdMinutes()))
                ? Attendance.AttendanceStatus.LATE
                : Attendance.AttendanceStatus.PRESENT;

        // 6. Save attendance
        Attendance attendance = Attendance.builder()
                .student(student)
                .timetable(timetable)
                .attendanceDate(today)
                .status(status)
                .checkInTime(OffsetDateTime.now(zone))
                .verificationMethod(Attendance.VerificationMethod.FACE)
                .build();
        attendanceRepo.save(attendance);

        log.info("Attendance marked: student={} period={} status={}", 
                student.getRollNumber(), timetable.getPeriod().getPeriodNumber(), status);

        return ResponseEntity.ok(ApiResponse.ok("Attendance recorded",
                new AttendanceMarkResult(attendance.getId(), student.getRollNumber(),
                        status.name(), timetable.getSubject().getSubjectName(),
                        timetable.getPeriod().getPeriodNumber())));
    }

    // ── Admin correction ──────────────────────────────────────────────────────
    @PostMapping("/admin/correction")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> correctAttendance(
            @RequestBody AttendanceCorrectionRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {

        Attendance attendance = attendanceRepo.findById(req.attendanceId())
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found"));

        UserEntity admin = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        attendance.setStatus(Attendance.AttendanceStatus.valueOf(req.newStatus()));
        attendance.setVerificationMethod(Attendance.VerificationMethod.CORRECTION);
        attendance.setVerifiedBy(admin);
        attendance.setRemarks(req.reason());
        attendanceRepo.save(attendance);

        return ResponseEntity.ok(ApiResponse.ok("Attendance corrected", null));
    }

    // ── DTOs and Records ──────────────────────────────────────────────────────
    record MarkAttendanceRequest(String qrToken, String faceVerificationId) {}
    record AttendanceCorrectionRequest(UUID attendanceId, String newStatus, String reason) {}
    record AttendanceMarkResult(UUID attendanceId, String rollNumber, String status,
                                String subject, int periodNumber) {}

    record AttendanceSummaryDto(UUID studentId, String rollNumber, String fullName,
                                long total, long present, long late, long absent, double pct,
                                List<AttendanceRecordDto> records) {}

    record AttendanceRecordDto(UUID id, String date, String status, String subject,
                               int periodNumber, String checkInTime, String verificationMethod) {
        static AttendanceRecordDto from(Attendance a) {
            return new AttendanceRecordDto(
                    a.getId(),
                    a.getAttendanceDate().toString(),
                    a.getStatus().name(),
                    a.getTimetable().getSubject().getSubjectName(),
                    a.getTimetable().getPeriod().getPeriodNumber(),
                    a.getCheckInTime() != null ? a.getCheckInTime().toString() : null,
                    a.getVerificationMethod().name()
            );
        }
    }
}
