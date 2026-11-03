package com.faceattend.student;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class StudentDto {
    private UUID id;
    private String rollNumber;
    private String fullName;
    private String profileImagePath;
    private String enrollmentStatus;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static StudentDto from(Student s) {
        return StudentDto.builder()
                .id(s.getId())
                .rollNumber(s.getRollNumber())
                .fullName(s.getFullName())
                .profileImagePath(s.getProfileImagePath())
                .enrollmentStatus(s.getEnrollmentStatus().name())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
