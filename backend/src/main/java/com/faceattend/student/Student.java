package com.faceattend.student;

import com.faceattend.common.BaseEntity;
import com.faceattend.user.UserEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "students")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Student extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Column(name = "roll_number", nullable = false, unique = true, length = 50)
    private String rollNumber;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(name = "profile_image_path")
    private String profileImagePath;

    @Enumerated(EnumType.STRING)
    @Column(name = "enrollment_status", nullable = false, length = 50)
    private EnrollmentStatus enrollmentStatus = EnrollmentStatus.PENDING;

    public enum EnrollmentStatus { PENDING, ENROLLED, FAILED, RE_ENROLLMENT }
}
