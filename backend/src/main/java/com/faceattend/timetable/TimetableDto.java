package com.faceattend.timetable;

import lombok.Builder;
import lombok.Data;
import java.time.LocalTime;
import java.util.UUID;

@Data @Builder
public class TimetableDto {
    private UUID id;
    private int dayOfWeek;
    private int periodNumber;
    private String periodName;
    private LocalTime startTime;
    private LocalTime endTime;
    private String subjectCode;
    private String subjectName;
    private String facultyName;
    private LocalTime attendanceOpen;
    private LocalTime attendanceClose;
    private int lateThresholdMinutes;

    public static TimetableDto from(Timetable t) {
        return TimetableDto.builder()
                .id(t.getId())
                .dayOfWeek(t.getDayOfWeek())
                .periodNumber(t.getPeriod().getPeriodNumber())
                .periodName(t.getPeriod().getPeriodName())
                .startTime(t.getPeriod().getStartTime())
                .endTime(t.getPeriod().getEndTime())
                .subjectCode(t.getSubject().getSubjectCode())
                .subjectName(t.getSubject().getSubjectName())
                .facultyName(t.getSubject().getFacultyName())
                .attendanceOpen(t.getAttendanceOpen())
                .attendanceClose(t.getAttendanceClose())
                .lateThresholdMinutes(t.getLateThresholdMinutes())
                .build();
    }
}
