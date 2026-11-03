package com.faceattend.repository;

import com.faceattend.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {

    /** Duplicate guard */
    Optional<Attendance> findByStudentIdAndAttendanceDateAndTimetableId(
            UUID studentId, LocalDate attendanceDate, UUID timetableId);

    /** Student's own records (most recent first) */
    @Query("SELECT a FROM Attendance a JOIN FETCH a.timetable t JOIN FETCH t.subject s " +
           "WHERE a.student.id = :sid ORDER BY a.attendanceDate DESC, t.period.periodNumber ASC")
    List<Attendance> findByStudentIdOrderByDateDesc(@Param("sid") UUID studentId);

    /** Student records within a date range */
    @Query("SELECT a FROM Attendance a JOIN FETCH a.timetable t JOIN FETCH t.subject s " +
           "WHERE a.student.id = :sid AND a.attendanceDate BETWEEN :from AND :to " +
           "ORDER BY a.attendanceDate ASC, t.period.periodNumber ASC")
    List<Attendance> findByStudentIdAndDateRange(
            @Param("sid") UUID studentId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    /** Count all records for a given date (optionally filtered by subject code) */
    @Query("SELECT COUNT(a) FROM Attendance a " +
           "JOIN a.timetable t JOIN t.subject s " +
           "WHERE a.attendanceDate = :date " +
           "AND (:subjectCode IS NULL OR s.subjectCode = :subjectCode)")
    long countByDate(@Param("date") LocalDate date, @Param("subjectCode") String subjectCode);

    /** Count by date + status */
    @Query("SELECT COUNT(a) FROM Attendance a " +
           "JOIN a.timetable t JOIN t.subject s " +
           "WHERE a.attendanceDate = :date AND a.status = :status " +
           "AND (:subjectCode IS NULL OR s.subjectCode = :subjectCode)")
    long countByDateAndStatus(
            @Param("date") LocalDate date,
            @Param("subjectCode") String subjectCode,
            @Param("status") String status);
}
