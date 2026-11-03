package com.faceattend.student;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, UUID> {
    Optional<Student> findByRollNumber(String rollNumber);
    Optional<Student> findByUserId(UUID userId);
    boolean existsByRollNumber(String rollNumber);

    @Query("SELECT s FROM Student s ORDER BY s.rollNumber ASC")
    List<Student> findAllOrderByRollNumber();

    List<Student> findByEnrollmentStatus(Student.EnrollmentStatus status);
}
