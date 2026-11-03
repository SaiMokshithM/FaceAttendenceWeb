package com.faceattend.timetable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TimetableRepository extends JpaRepository<Timetable, UUID> {

    List<Timetable> findByDayOfWeekOrderByPeriodPeriodNumber(int dayOfWeek);

    Optional<Timetable> findByDayOfWeekAndPeriodId(int dayOfWeek, UUID periodId);

    @Query("SELECT t FROM Timetable t ORDER BY t.dayOfWeek ASC, t.period.periodNumber ASC")
    List<Timetable> findAllOrdered();
}
