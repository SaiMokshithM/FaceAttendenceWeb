package com.faceattend.attendance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {

    boolean existsByStudentIdAndAttendanceDateAndTimetableId(
            UUID studentId, LocalDate date, UUID timetableId);

    List<Attendance> findByStudentIdOrderByAttendanceDateDesc(UUID studentId);

    List<Attendance> findByAttendanceDateAndTimetableId(LocalDate date, UUID timetableId);

    @Query("SELECT a FROM Attendance a WHERE a.attendanceDate = :date ORDER BY a.student.rollNumber ASC")
    List<Attendance> findByDate(LocalDate date);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.status = 'PRESENT'")
    long countPresentByStudentId(UUID studentId);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.status = 'ABSENT'")
    long countAbsentByStudentId(UUID studentId);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.status = 'LATE'")
    long countLateByStudentId(UUID studentId);
}
