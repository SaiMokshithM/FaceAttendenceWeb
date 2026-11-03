package com.faceattend.face;

import com.faceattend.common.BaseEntity;
import com.faceattend.student.Student;
import com.faceattend.user.UserEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bulk_enrollment_jobs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BulkEnrollmentJob extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "initiated_by")
    private UserEntity initiatedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private JobStatus status = JobStatus.PENDING;

    @Column(name = "total_images")
    private int totalImages;

    @Column
    private int processed;

    @Column
    private int successful;

    @Column
    private int failed;

    @Column(name = "error_summary", columnDefinition = "jsonb")
    private String errorSummary;

    public enum JobStatus { PENDING, PROCESSING, COMPLETED, FAILED }
}
