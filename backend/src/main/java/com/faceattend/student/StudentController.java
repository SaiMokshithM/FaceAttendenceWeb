package com.faceattend.student;

import com.faceattend.common.ApiResponse;
import com.faceattend.common.BusinessException;
import com.faceattend.common.ResourceNotFoundException;
import com.faceattend.user.UserEntity;
import com.faceattend.user.UserRepository;
import com.opencsv.CSVReader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentRepository studentRepo;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    // ── List all students (Admin only) ────────────────────────────────────────
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<StudentDto>>> listAll() {
        List<StudentDto> students = studentRepo.findAllOrderByRollNumber()
                .stream().map(StudentDto::from).toList();
        return ResponseEntity.ok(ApiResponse.ok(students));
    }

    // ── Get my own profile (Student) ──────────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<StudentDto>> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        UserEntity user = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Student student = studentRepo.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        return ResponseEntity.ok(ApiResponse.ok(StudentDto.from(student)));
    }

    // ── Get student by ID (Admin) ─────────────────────────────────────────────
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StudentDto>> getById(@PathVariable UUID id) {
        Student s = studentRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return ResponseEntity.ok(ApiResponse.ok(StudentDto.from(s)));
    }

    // ── Bulk Import via CSV or Excel (Admin) ──────────────────────────────────
    @PostMapping("/import")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ImportResult>> importStudents(
            @RequestParam("file") MultipartFile file) throws Exception {

        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "";
        List<StudentRow> rows;

        if (filename.endsWith(".csv")) {
            rows = parseCsv(file);
        } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
            rows = parseExcel(file);
        } else {
            throw new BusinessException("Unsupported file format. Use .csv or .xlsx");
        }

        int created = 0, skipped = 0, failed = 0;
        List<String> errors = new ArrayList<>();

        // Check duplicates within the file
        Set<String> seenRolls = new HashSet<>();
        for (StudentRow row : rows) {
            if (row.rollNumber() == null || row.rollNumber().isBlank()) {
                errors.add("Row with empty roll number skipped.");
                failed++;
                continue;
            }
            if (seenRolls.contains(row.rollNumber())) {
                errors.add("Duplicate roll number in file: " + row.rollNumber());
                failed++;
                continue;
            }
            seenRolls.add(row.rollNumber());

            if (studentRepo.existsByRollNumber(row.rollNumber())) {
                skipped++;
                continue;
            }

            try {
                // Create user account (default password = roll number)
                UserEntity user = UserEntity.builder()
                        .email(row.rollNumber().toLowerCase() + "@faceattend.local")
                        .passwordHash(passwordEncoder.encode(row.rollNumber()))
                        .role(UserEntity.Role.STUDENT)
                        .active(true)
                        .build();
                userRepo.save(user);

                Student student = Student.builder()
                        .user(user)
                        .rollNumber(row.rollNumber())
                        .fullName(row.fullName())
                        .enrollmentStatus(Student.EnrollmentStatus.PENDING)
                        .build();
                studentRepo.save(student);
                created++;
            } catch (Exception e) {
                log.error("Failed to import student {}: {}", row.rollNumber(), e.getMessage());
                errors.add("Failed to import " + row.rollNumber() + ": " + e.getMessage());
                failed++;
            }
        }

        return ResponseEntity.ok(ApiResponse.ok("Import complete",
                new ImportResult(created, skipped, failed, errors)));
    }

    // ── CSV Parser ────────────────────────────────────────────────────────────
    private List<StudentRow> parseCsv(MultipartFile file) throws Exception {
        List<StudentRow> rows = new ArrayList<>();
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            String[] headers = reader.readNext(); // skip header
            String[] line;
            while ((line = reader.readNext()) != null) {
                if (line.length >= 2) {
                    rows.add(new StudentRow(line[0].trim(), line[1].trim()));
                }
            }
        }
        return rows;
    }

    // ── Excel Parser ──────────────────────────────────────────────────────────
    private List<StudentRow> parseExcel(MultipartFile file) throws Exception {
        List<StudentRow> rows = new ArrayList<>();
        try (Workbook wb = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = wb.getSheetAt(0);
            boolean firstRow = true;
            for (Row row : sheet) {
                if (firstRow) { firstRow = false; continue; } // skip header
                Cell rollCell = row.getCell(0);
                Cell nameCell = row.getCell(1);
                if (rollCell != null && nameCell != null) {
                    String roll = rollCell.getCellType() == CellType.NUMERIC
                            ? String.valueOf((long) rollCell.getNumericCellValue())
                            : rollCell.getStringCellValue().trim();
                    String name = nameCell.getStringCellValue().trim();
                    if (!roll.isBlank() && !name.isBlank()) {
                        rows.add(new StudentRow(roll, name));
                    }
                }
            }
        }
        return rows;
    }

    record StudentRow(String rollNumber, String fullName) {}
    record ImportResult(int created, int skipped, int failed, List<String> errors) {}
}
