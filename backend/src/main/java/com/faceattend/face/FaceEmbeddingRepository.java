package com.faceattend.face;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FaceEmbeddingRepository extends JpaRepository<FaceEmbedding, UUID> {

    Optional<FaceEmbedding> findByStudentIdAndStatus(UUID studentId, FaceEmbedding.EmbeddingStatus status);

    List<FaceEmbedding> findAllByStatus(FaceEmbedding.EmbeddingStatus status);

    @Modifying
    @Transactional
    @Query("UPDATE FaceEmbedding e SET e.status = 'SUPERSEDED' WHERE e.student.id = :studentId AND e.status = 'ACTIVE'")
    void supersedePreviousEmbeddings(UUID studentId);

    boolean existsByStudentIdAndStatus(UUID studentId, FaceEmbedding.EmbeddingStatus status);
}
