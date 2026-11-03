package com.faceattend.face;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * AES-256-GCM encryption for face embeddings at rest.
 * Key is loaded from BIOMETRIC_ENCRYPTION_KEY env variable (hex string).
 * IV is randomly generated per encryption and prepended to ciphertext.
 */
@Slf4j
@Component
public class EmbeddingEncryptor {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;

    private final SecretKey secretKey;

    public EmbeddingEncryptor(@Value("${biometric.encryption-key}") String hexKey) {
        byte[] keyBytes = hexToBytes(hexKey);
        if (keyBytes.length != 32) {
            throw new IllegalStateException("BIOMETRIC_ENCRYPTION_KEY must be a 64-character hex string (256-bit key).");
        }
        this.secretKey = new SecretKeySpec(keyBytes, "AES");
    }

    public byte[] encrypt(float[] embedding) {
        try {
            byte[] plaintext = floatsToBytes(embedding);
            byte[] iv = new byte[GCM_IV_LENGTH];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, new GCMParameterSpec(GCM_TAG_LENGTH, iv));
            byte[] ciphertext = cipher.doFinal(plaintext);

            ByteBuffer buf = ByteBuffer.allocate(GCM_IV_LENGTH + ciphertext.length);
            buf.put(iv);
            buf.put(ciphertext);
            return buf.array();
        } catch (Exception e) {
            throw new RuntimeException("Embedding encryption failed", e);
        }
    }

    public float[] decrypt(byte[] encryptedData) {
        try {
            ByteBuffer buf = ByteBuffer.wrap(encryptedData);
            byte[] iv = new byte[GCM_IV_LENGTH];
            buf.get(iv);
            byte[] ciphertext = new byte[buf.remaining()];
            buf.get(ciphertext);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, new GCMParameterSpec(GCM_TAG_LENGTH, iv));
            byte[] plaintext = cipher.doFinal(ciphertext);
            return bytesToFloats(plaintext);
        } catch (Exception e) {
            throw new RuntimeException("Embedding decryption failed", e);
        }
    }

    private static byte[] floatsToBytes(float[] floats) {
        ByteBuffer buf = ByteBuffer.allocate(floats.length * Float.BYTES);
        for (float f : floats) buf.putFloat(f);
        return buf.array();
    }

    private static float[] bytesToFloats(byte[] bytes) {
        ByteBuffer buf = ByteBuffer.wrap(bytes);
        float[] floats = new float[bytes.length / Float.BYTES];
        for (int i = 0; i < floats.length; i++) floats[i] = buf.getFloat();
        return floats;
    }

    private static byte[] hexToBytes(String hex) {
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                    + Character.digit(hex.charAt(i + 1), 16));
        }
        return data;
    }
}
