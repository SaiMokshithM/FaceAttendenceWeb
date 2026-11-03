package com.faceattend.face;

import com.faceattend.common.BaseEntity;
import com.faceattend.student.Student;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "face_verification_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FaceVerificationLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "verification_status", nullable = false, length = 50)
    private String verificationStatus;

    @Column(name = "similarity_score", nullable = false)
    private double similarityScore;

    @Column(name = "model_version", nullable = false, length = 50)
    private String modelVersion;

    @Column(name = "liveness_passed", nullable = false)
    private boolean livenessPassed;

    @Column(name = "qr_token_used", length = 255)
    private String qrTokenUsed;
}
