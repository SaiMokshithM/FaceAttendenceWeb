package com.faceattend.timetable;

import com.faceattend.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

@Entity
@Table(name = "periods")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Period extends BaseEntity {

    @Column(name = "period_number", nullable = false, unique = true)
    private int periodNumber;

    @Column(name = "period_name", nullable = false, length = 50)
    private String periodName;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;
}
