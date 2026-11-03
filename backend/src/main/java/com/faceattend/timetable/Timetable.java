package com.faceattend.timetable;

import com.faceattend.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

@Entity
@Table(name = "timetable",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_timetable_day_period",
        columnNames = {"day_of_week", "period_id"}
    ))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Timetable extends BaseEntity {

    @Column(name = "day_of_week", nullable = false)
    private int dayOfWeek; // 1=Monday … 6=Saturday

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "period_id", nullable = false)
    private Period period;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(name = "attendance_open", nullable = false)
    private LocalTime attendanceOpen;

    @Column(name = "attendance_close", nullable = false)
    private LocalTime attendanceClose;

    @Column(name = "late_threshold_minutes", nullable = false)
    private int lateThresholdMinutes = 10;
}
