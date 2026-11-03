package com.faceattend.attendance;

import com.faceattend.common.BaseEntity;
import com.faceattend.student.Student;
import com.faceattend.timetable.Timetable;
import com.faceattend.user.UserEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "attendance",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_attendance_student_date_period",
        columnNames = {"student_id", "attendance_date", "timetable_id"}
    ))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Attendance extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timetable_id", nullable = false)
    private Timetable timetable;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private AttendanceStatus status;

    @Column(name = "check_in_time")
    private OffsetDateTime checkInTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private UserEntity verifiedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_method", nullable = false, length = 50)
    private VerificationMethod verificationMethod;

    @Column(length = 500)
    private String remarks;

    public enum AttendanceStatus { PRESENT, LATE, ABSENT, EXCUSED }
    public enum VerificationMethod { FACE, MANUAL, CORRECTION }
}
