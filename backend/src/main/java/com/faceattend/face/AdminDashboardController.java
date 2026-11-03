package com.faceattend.face;

import com.faceattend.common.ApiResponse;
import com.faceattend.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final StudentRepository studentRepo;
    private final FaceEmbeddingRepository embeddingRepo;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> dashboard() {
        long total    = studentRepo.count();
        long enrolled = studentRepo.findByEnrollmentStatus(
            com.faceattend.student.Student.EnrollmentStatus.ENROLLED).size();
        long pending  = studentRepo.findByEnrollmentStatus(
            com.faceattend.student.Student.EnrollmentStatus.PENDING).size();
        long failed   = studentRepo.findByEnrollmentStatus(
            com.faceattend.student.Student.EnrollmentStatus.FAILED).size();

        return ResponseEntity.ok(ApiResponse.ok(Map.of(
            "totalStudents",    total,
            "enrolled",         enrolled,
            "pending",          pending,
            "failed",           failed,
            "completionPct",    total == 0 ? 0 : Math.round((enrolled * 100.0 / total) * 10) / 10.0
        )));
    }

    @GetMapping("/live-attendance")
    public ResponseEntity<ApiResponse<Object>> liveAttendance() {
        // Returns today's live attendance — in production this is SSE-driven
        return ResponseEntity.ok(ApiResponse.ok("Live attendance stream available via SSE"));
    }
}
