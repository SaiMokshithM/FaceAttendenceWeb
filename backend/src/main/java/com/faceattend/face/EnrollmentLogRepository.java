package com.faceattend.face;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface EnrollmentLogRepository extends JpaRepository<EnrollmentLog, UUID> {}
