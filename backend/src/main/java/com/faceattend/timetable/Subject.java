package com.faceattend.timetable;

import com.faceattend.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subjects")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Subject extends BaseEntity {

    @Column(name = "subject_code", nullable = false, unique = true, length = 50)
    private String subjectCode;

    @Column(name = "subject_name", nullable = false, length = 255)
    private String subjectName;

    @Column(name = "faculty_name", length = 255)
    private String facultyName;
}
