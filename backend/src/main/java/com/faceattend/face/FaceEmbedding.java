package com.faceattend.face;

import com.faceattend.common.BaseEntity;
import com.faceattend.student.Student;
import com.faceattend.user.UserEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "face_embeddings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FaceEmbedding extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "encrypted_embedding", nullable = false)
    private byte[] encryptedEmbedding;

    @Column(name = "embedding_sha256", nullable = false, length = 64)
    private String embeddingSha256;

    @Column(name = "model_name", nullable = false, length = 100)
    private String modelName;

    @Column(name = "model_version", nullable = false, length = 50)
    private String modelVersion;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private EmbeddingStatus status = EmbeddingStatus.ACTIVE;

    public enum EmbeddingStatus { ACTIVE, SUPERSEDED, DELETED }
}
