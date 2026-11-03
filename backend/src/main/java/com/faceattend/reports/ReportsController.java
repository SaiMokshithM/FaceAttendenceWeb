package com.faceattend.reports;

import com.faceattend.attendance.AttendanceRepository;
import com.faceattend.common.ApiResponse;
import com.faceattend.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ReportsController {

    private final AttendanceRepository attendanceRepo;
    private final StudentRepository studentRepo;

    @GetMapping("/daily")
    public ResponseEntity<ApiResponse<DailyReport>> daily(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        var records = attendanceRepo.findByDate(date);
        long present = records.stream().filter(a -> a.getStatus().name().equals("PRESENT")).count();
        long late    = records.stream().filter(a -> a.getStatus().name().equals("LATE")).count();
        long absent  = records.stream().filter(a -> a.getStatus().name().equals("ABSENT")).count();

        return ResponseEntity.ok(ApiResponse.ok(new DailyReport(
                date.toString(), records.size(), present, late, absent)));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<SummaryReport>> summary() {
        long totalStudents = studentRepo.count();
        return ResponseEntity.ok(ApiResponse.ok(new SummaryReport(totalStudents)));
    }

    record DailyReport(String date, long total, long present, long late, long absent) {}
    record SummaryReport(long totalStudents) {}
}
