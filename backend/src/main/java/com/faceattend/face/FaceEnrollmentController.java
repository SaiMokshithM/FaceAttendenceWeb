package com.faceattend.face;

import com.faceattend.common.ApiResponse;
import com.faceattend.common.BusinessException;
import com.faceattend.common.ResourceNotFoundException;
import com.faceattend.student.Student;
import com.faceattend.student.StudentRepository;
import com.faceattend.user.UserEntity;
import com.faceattend.user.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@RestController
@RequiredArgsConstructor
public class FaceEnrollmentController {

    private final StudentRepository studentRepo;
    private final UserRepository userRepo;
    private final FaceEmbeddingRepository embeddingRepo;
    private final BulkEnrollmentJobRepository jobRepo;
    private final EmbeddingEncryptor encryptor;
    private final ObjectMapper objectMapper;

    @Value("${ai-service.url}")
    private String aiServiceUrl;

    @Value("${ai-service.api-key}")
    private String aiApiKey;

    @Value("${app.face-similarity-threshold:0.45}")
    private double similarityThreshold;

    // SSE emitters for live progress (jobId → emitter)
    private final Map<UUID, SseEmitter> jobEmitters = new ConcurrentHashMap<>();

    // ── Admin overview ────────────────────────────────────────────────────────
    @GetMapping("/api/admin/face-enrollment/overview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EnrollmentOverview>> overview() {
        long total = studentRepo.count();
        long enrolled = studentRepo.findByEnrollmentStatus(Student.EnrollmentStatus.ENROLLED).size();
        long pending = studentRepo.findByEnrollmentStatus(Student.EnrollmentStatus.PENDING).size();
        long failed = studentRepo.findByEnrollmentStatus(Student.EnrollmentStatus.FAILED).size();
        double pct = total == 0 ? 0 : Math.round((enrolled * 100.0 / total) * 10) / 10.0;

        return ResponseEntity.ok(ApiResponse.ok(new EnrollmentOverview(
                total, enrolled, pending, failed,
                total - enrolled - pending - failed, pct)));
    }

    // ── STEP 1: Upload ZIP + roster, start job ────────────────────────────────
    @PostMapping("/api/face-enrollment/bulk/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BulkUploadResponse>> bulkUpload(
            @RequestParam("zip") MultipartFile zipFile,
            @RequestParam("roster") MultipartFile rosterFile,
            @AuthenticationPrincipal UserDetails userDetails) throws Exception {

        // Validate files
        String zipName = zipFile.getOriginalFilename() != null ? zipFile.getOriginalFilename() : "";
        if (!zipName.endsWith(".zip")) throw new BusinessException("ZIP file required.");

        String rosterName = rosterFile.getOriginalFilename() != null ? rosterFile.getOriginalFilename() : "";
        if (!rosterName.endsWith(".csv") && !rosterName.endsWith(".xlsx"))
            throw new BusinessException("Roster must be .csv or .xlsx");

        // Parse roster to get mappings
        List<RosterEntry> roster = parseRoster(rosterFile, rosterName);
        if (roster.isEmpty()) throw new BusinessException("Roster file is empty or could not be parsed.");

        // Get admin user
        UserEntity admin = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        // Create job
        BulkEnrollmentJob job = BulkEnrollmentJob.builder()
                .initiatedBy(admin)
                .status(BulkEnrollmentJob.JobStatus.PENDING)
                .totalImages(roster.size())
                .build();
        job = jobRepo.save(job);

        // Store zip bytes for async processing
        byte[] zipBytes = zipFile.getBytes();
        processJobAsync(job.getId(), zipBytes, roster);

        return ResponseEntity.ok(ApiResponse.ok("Bulk enrollment job started",
                new BulkUploadResponse(job.getId(), roster.size())));
    }

    // ── Job status ────────────────────────────────────────────────────────────
    @GetMapping("/api/face-enrollment/bulk/status/{jobId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<JobStatusDto>> jobStatus(@PathVariable UUID jobId) {
        BulkEnrollmentJob job = jobRepo.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        return ResponseEntity.ok(ApiResponse.ok(JobStatusDto.from(job)));
    }

    // ── SSE progress stream ───────────────────────────────────────────────────
    @GetMapping(value = "/api/face-enrollment/bulk/progress/{jobId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public SseEmitter progressStream(@PathVariable UUID jobId) {
        SseEmitter emitter = new SseEmitter(300_000L); // 5 min timeout
        jobEmitters.put(jobId, emitter);
        emitter.onCompletion(() -> jobEmitters.remove(jobId));
        emitter.onTimeout(() -> jobEmitters.remove(jobId));
        return emitter;
    }

    // ── Individual enrollment ─────────────────────────────────────────────────
    @PostMapping("/api/face-enrollment/individual")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<IndividualEnrollResult>> individualEnroll(
            @RequestParam("studentId") UUID studentId,
            @RequestParam("photo") MultipartFile photo,
            @AuthenticationPrincipal UserDetails userDetails) throws Exception {

        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        // Check if already enrolled (re-enroll flow)
        boolean isReEnroll = student.getEnrollmentStatus() == Student.EnrollmentStatus.ENROLLED;

        // Call AI service to generate embedding
        EmbedResult embedResult = callAiEmbed(photo.getBytes(), photo.getOriginalFilename());

        if (!embedResult.success()) {
            student.setEnrollmentStatus(Student.EnrollmentStatus.FAILED);
            studentRepo.save(student);
            return ResponseEntity.ok(ApiResponse.ok(
                    new IndividualEnrollResult(false, studentId, embedResult.failureReason(), null)));
        }

        // Supersede previous active embeddings (re-enrollment)
        embeddingRepo.supersedePreviousEmbeddings(studentId);

        // Encrypt and store
        float[] floatEmbedding = toFloatArray(embedResult.embedding());
        byte[] encrypted = encryptor.encrypt(floatEmbedding);

        FaceEmbedding fe = FaceEmbedding.builder()
                .student(student)
                .encryptedEmbedding(encrypted)
                .embeddingSha256(embedResult.sha256())
                .modelName("ArcFace-buffalo_l")
                .modelVersion("1.0.0")
                .status(FaceEmbedding.EmbeddingStatus.ACTIVE)
                .build();
        embeddingRepo.save(fe);

        student.setEnrollmentStatus(Student.EnrollmentStatus.ENROLLED);
        studentRepo.save(student);

        return ResponseEntity.ok(ApiResponse.ok(
                new IndividualEnrollResult(true, studentId, null, fe.getId())));
    }

    // ── Re-enroll ─────────────────────────────────────────────────────────────
    @PutMapping("/api/face-enrollment/{studentId}/reenroll")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<IndividualEnrollResult>> reEnroll(
            @PathVariable UUID studentId,
            @RequestParam("photo") MultipartFile photo,
            @AuthenticationPrincipal UserDetails userDetails) throws Exception {

        // Same flow as individual enrollment — supersedes existing template
        return individualEnroll(studentId, photo, userDetails);
    }

    // ── Student's own enrollment status ──────────────────────────────────────
    @GetMapping("/api/face-enrollment/student/{studentId}")
    public ResponseEntity<ApiResponse<StudentEnrollStatus>> studentEnrollStatus(
            @PathVariable UUID studentId,
            @AuthenticationPrincipal UserDetails userDetails) {

        UserEntity user = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        // Students can only see their own status
        if (user.getRole() != UserEntity.Role.ADMIN) {
            Student myStudent = studentRepo.findByUserId(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
            if (!myStudent.getId().equals(studentId)) {
                return ResponseEntity.status(403).body(ApiResponse.error("Access denied."));
            }
        }

        boolean hasEmbedding = embeddingRepo.existsByStudentIdAndStatus(studentId, FaceEmbedding.EmbeddingStatus.ACTIVE);
        return ResponseEntity.ok(ApiResponse.ok(new StudentEnrollStatus(
                studentId, student.getEnrollmentStatus().name(), hasEmbedding)));
    }

    // ── Face recognition verify (called by Spring Boot itself for attendance) ─
    @PostMapping("/api/face-recognition/verify")
    public ResponseEntity<ApiResponse<VerificationResult>> verifyFace(
            @RequestParam("photo") MultipartFile photo,
            @AuthenticationPrincipal UserDetails userDetails) throws Exception {

        UserEntity user = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Derive student from authenticated user — never trust client-submitted ID
        Student student = studentRepo.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No student profile linked to this account"));

        FaceEmbedding embedding = embeddingRepo.findByStudentIdAndStatus(student.getId(), FaceEmbedding.EmbeddingStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException("Student is not enrolled for face verification. Please contact admin."));

        float[] decrypted = encryptor.decrypt(embedding.getEncryptedEmbedding());

        // Build multipart request to AI service
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.set("X-API-Key", aiApiKey);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(photo.getBytes()) {
            @Override public String getFilename() { return "verify.jpg"; }
        });
        body.add("student_id", student.getId().toString());
        body.add("roll_number", student.getRollNumber());
        body.add("enrolled_embedding_json", objectMapper.writeValueAsString(toDoubleList(decrypted)));
        body.add("require_liveness", "true");

        RestTemplate rt = new RestTemplate();
        HttpEntity<MultiValueMap<String, Object>> req = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> resp = rt.postForEntity(aiServiceUrl + "/verify", req, Map.class);
            Map<?, ?> result = resp.getBody();

            boolean matched = Boolean.TRUE.equals(result.get("matched"));
            String status = (String) result.get("verification_status");
            double similarity = result.get("similarity") instanceof Number n ? n.doubleValue() : 0.0;
            boolean liveness = Boolean.TRUE.equals(result.get("liveness_passed"));

            return ResponseEntity.ok(ApiResponse.ok(new VerificationResult(
                    matched, student.getId(), student.getRollNumber(),
                    similarity, liveness, status)));
        } catch (Exception e) {
            log.error("AI service verification failed: {}", e.getMessage());
            return ResponseEntity.status(503).body(ApiResponse.error("Face verification service unavailable."));
        }
    }

    // ── Async job processor ───────────────────────────────────────────────────
    @Async
    public void processJobAsync(UUID jobId, byte[] zipBytes, List<RosterEntry> roster) {
        BulkEnrollmentJob job = jobRepo.findById(jobId).orElse(null);
        if (job == null) return;

        job.setStatus(BulkEnrollmentJob.JobStatus.PROCESSING);
        jobRepo.save(job);

        int processed = 0, successful = 0, failed = 0;

        // Process in batches of 10
        int batchSize = 10;
        for (int i = 0; i < roster.size(); i += batchSize) {
            List<RosterEntry> batch = roster.subList(i, Math.min(i + batchSize, roster.size()));

            for (RosterEntry entry : batch) {
                try {
                    Student student = studentRepo.findByRollNumber(entry.rollNumber()).orElse(null);
                    if (student == null) {
                        log.warn("Student not found for roll number: {}", entry.rollNumber());
                        failed++;
                        processed++;
                        continue;
                    }

                    // Extract image from zip
                    byte[] imgBytes = extractFromZip(zipBytes, entry.filename());
                    if (imgBytes == null) {
                        student.setEnrollmentStatus(Student.EnrollmentStatus.FAILED);
                        studentRepo.save(student);
                        failed++;
                        processed++;
                        continue;
                    }

                    // Call AI service
                    EmbedResult result = callAiEmbedRaw(imgBytes, entry.filename());
                    if (result.success()) {
                        embeddingRepo.supersedePreviousEmbeddings(student.getId());
                        float[] floats = toFloatArray(result.embedding());
                        byte[] encrypted = encryptor.encrypt(floats);

                        FaceEmbedding fe = FaceEmbedding.builder()
                                .student(student)
                                .encryptedEmbedding(encrypted)
                                .embeddingSha256(result.sha256())
                                .modelName("ArcFace-buffalo_l")
                                .modelVersion("1.0.0")
                                .status(FaceEmbedding.EmbeddingStatus.ACTIVE)
                                .build();
                        embeddingRepo.save(fe);

                        student.setEnrollmentStatus(Student.EnrollmentStatus.ENROLLED);
                        studentRepo.save(student);
                        successful++;
                    } else {
                        student.setEnrollmentStatus(Student.EnrollmentStatus.FAILED);
                        studentRepo.save(student);
                        failed++;
                    }
                    processed++;

                } catch (Exception e) {
                    log.error("Error processing {}: {}", entry.rollNumber(), e.getMessage());
                    failed++;
                    processed++;
                }
            }

            // Update job progress
            job.setProcessed(processed);
            job.setSuccessful(successful);
            job.setFailed(failed);
            jobRepo.save(job);

            // Emit SSE progress
            sendSseProgress(jobId, job);
        }

        job.setStatus(successful > 0 ? BulkEnrollmentJob.JobStatus.COMPLETED : BulkEnrollmentJob.JobStatus.FAILED);
        jobRepo.save(job);
        sendSseProgress(jobId, job);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void sendSseProgress(UUID jobId, BulkEnrollmentJob job) {
        SseEmitter emitter = jobEmitters.get(jobId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name("progress")
                        .data(Map.of(
                                "total", job.getTotalImages(),
                                "processed", job.getProcessed(),
                                "successful", job.getSuccessful(),
                                "failed", job.getFailed(),
                                "status", job.getStatus().name()
                        )));
                if (job.getStatus() == BulkEnrollmentJob.JobStatus.COMPLETED ||
                        job.getStatus() == BulkEnrollmentJob.JobStatus.FAILED) {
                    emitter.complete();
                }
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        }
    }

    private EmbedResult callAiEmbed(byte[] imgBytes, String filename) {
        return callAiEmbedRaw(imgBytes, filename);
    }

    private EmbedResult callAiEmbedRaw(byte[] imgBytes, String filename) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.set("X-API-Key", aiApiKey);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(imgBytes) {
                @Override public String getFilename() { return filename != null ? filename : "photo.jpg"; }
            });

            RestTemplate rt = new RestTemplate();
            HttpEntity<MultiValueMap<String, Object>> req = new HttpEntity<>(body, headers);
            ResponseEntity<Map> resp = rt.postForEntity(aiServiceUrl + "/embed", req, Map.class);
            Map<?, ?> result = resp.getBody();

            boolean success = Boolean.TRUE.equals(result.get("success"));
            if (success) {
                List<Double> embedding = (List<Double>) result.get("embedding");
                String sha256 = (String) result.get("embedding_sha256");
                return new EmbedResult(true, embedding, sha256, null);
            } else {
                Map<?, ?> quality = (Map<?, ?>) result.get("quality");
                List<String> reasons = quality != null ? (List<String>) quality.get("rejection_reasons") : List.of("Unknown error");
                return new EmbedResult(false, null, null, String.join("; ", reasons));
            }
        } catch (Exception e) {
            log.error("AI embed call failed: {}", e.getMessage());
            return new EmbedResult(false, null, null, "AI service unavailable: " + e.getMessage());
        }
    }

    private byte[] extractFromZip(byte[] zipBytes, String targetFilename) {
        try (java.util.zip.ZipInputStream zis = new java.util.zip.ZipInputStream(
                new java.io.ByteArrayInputStream(zipBytes))) {
            java.util.zip.ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                String name = java.nio.file.Paths.get(entry.getName()).getFileName().toString();
                if (name.equals(targetFilename)) {
                    return zis.readAllBytes();
                }
            }
        } catch (Exception e) {
            log.error("ZIP extraction failed: {}", e.getMessage());
        }
        return null;
    }

    private List<RosterEntry> parseRoster(MultipartFile file, String filename) throws Exception {
        List<RosterEntry> entries = new ArrayList<>();
        if (filename.endsWith(".csv")) {
            try (com.opencsv.CSVReader reader = new com.opencsv.CSVReader(
                    new java.io.InputStreamReader(file.getInputStream()))) {
                reader.readNext(); // skip header
                String[] line;
                while ((line = reader.readNext()) != null) {
                    if (line.length >= 2) {
                        String roll = line[0].trim();
                        String name = line[1].trim();
                        String fn = line.length >= 3 ? line[2].trim() : roll + ".jpg";
                        entries.add(new RosterEntry(roll, name, fn));
                    }
                }
            }
        } else {
            try (org.apache.poi.ss.usermodel.Workbook wb =
                    new org.apache.poi.xssf.usermodel.XSSFWorkbook(file.getInputStream())) {
                org.apache.poi.ss.usermodel.Sheet sheet = wb.getSheetAt(0);
                boolean first = true;
                for (org.apache.poi.ss.usermodel.Row row : sheet) {
                    if (first) { first = false; continue; }
                    org.apache.poi.ss.usermodel.Cell rollCell = row.getCell(0);
                    org.apache.poi.ss.usermodel.Cell nameCell = row.getCell(1);
                    if (rollCell != null && nameCell != null) {
                        String roll = rollCell.getCellType() == org.apache.poi.ss.usermodel.CellType.NUMERIC
                                ? String.valueOf((long) rollCell.getNumericCellValue())
                                : rollCell.getStringCellValue().trim();
                        String name = nameCell.getStringCellValue().trim();
                        String fn = row.getCell(2) != null ? row.getCell(2).getStringCellValue().trim() : roll + ".jpg";
                        entries.add(new RosterEntry(roll, name, fn));
                    }
                }
            }
        }
        return entries;
    }

    private float[] toFloatArray(List<Double> doubles) {
        float[] arr = new float[doubles.size()];
        for (int i = 0; i < doubles.size(); i++) arr[i] = doubles.get(i).floatValue();
        return arr;
    }

    private List<Double> toDoubleList(float[] floats) {
        List<Double> list = new ArrayList<>(floats.length);
        for (float f : floats) list.add((double) f);
        return list;
    }

    // ── Records ───────────────────────────────────────────────────────────────
    record RosterEntry(String rollNumber, String studentName, String filename) {}
    record EmbedResult(boolean success, List<Double> embedding, String sha256, String failureReason) {}
    record BulkUploadResponse(UUID jobId, int totalStudents) {}
    record JobStatusDto(UUID id, String status, int total, int processed, int successful, int failed) {
        static JobStatusDto from(BulkEnrollmentJob j) {
            return new JobStatusDto(j.getId(), j.getStatus().name(),
                    j.getTotalImages(), j.getProcessed(), j.getSuccessful(), j.getFailed());
        }
    }
    record EnrollmentOverview(long total, long enrolled, long pending, long failed, long other, double completionPct) {}
    record IndividualEnrollResult(boolean success, UUID studentId, String failureReason, UUID embeddingId) {}
    record StudentEnrollStatus(UUID studentId, String enrollmentStatus, boolean hasActiveEmbedding) {}
    record VerificationResult(boolean matched, UUID studentId, String rollNumber,
                               double similarity, boolean livenessPass, String verificationStatus) {}
}
