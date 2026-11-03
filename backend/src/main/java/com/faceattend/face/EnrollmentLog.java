package com.faceattend.face;

import com.faceattend.common.BaseEntity;
import com.faceattend.student.Student;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "enrollment_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EnrollmentLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id")
    private BulkEnrollmentJob job;

    @Column(name = "enrollment_method", nullable = false, length = 50)
    private String enrollmentMethod;

    @Column(name = "processing_status", nullable = false, length = 50)
    private String processingStatus;

    @Column(name = "failure_reason", length = 1000)
    private String failureReason;
}
