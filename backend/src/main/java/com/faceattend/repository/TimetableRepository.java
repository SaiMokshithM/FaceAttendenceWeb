package com.faceattend.repository;

import com.faceattend.model.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, UUID> {

    /**
     * Find the timetable entry whose period window contains the given time.
     * Excludes breaks by relying on the periods table (which has no break rows).
     */
    @Query("""
        SELECT t FROM Timetable t
        JOIN FETCH t.period p
        JOIN FETCH t.subject s
        WHERE t.dayOfWeek = :day
          AND p.startTime <= :time
          AND p.endTime   >  :time
        """)
    Optional<Timetable> findByDayOfWeekAndTime(
            @Param("day")  int day,
            @Param("time") LocalTime time);

    /** All entries for a given day, ordered by period number */
    @Query("""
        SELECT t FROM Timetable t
        JOIN FETCH t.period p
        JOIN FETCH t.subject s
        WHERE t.dayOfWeek = :day
        ORDER BY p.periodNumber ASC
        """)
    List<Timetable> findByDayOfWeekOrderByPeriodNumber(@Param("day") int day);

    /** Full weekly timetable */
    @Query("""
        SELECT t FROM Timetable t
        JOIN FETCH t.period p
        JOIN FETCH t.subject s
        ORDER BY t.dayOfWeek ASC, p.periodNumber ASC
        """)
    List<Timetable> findAllByOrderByDayOfWeekAscPeriodNumberAsc();
}
