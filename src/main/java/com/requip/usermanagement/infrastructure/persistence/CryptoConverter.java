package com.requip.usermanagement.infrastructure.persistence;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;

@Converter
public class CryptoConverter implements AttributeConverter<String, String> {
    private static final String KEY_ENVIRONMENT_VARIABLE = "USER_DATA_ENCRYPTION_KEY";
    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH_BITS = 128;
    private static final int IV_LENGTH_BYTES = 12;
    private static final byte[] DEVELOPMENT_FALLBACK_KEY = "requip-local-dev-key-1234567890!".getBytes(StandardCharsets.UTF_8);

    private final SecureRandom secureRandom = new SecureRandom();
    // lazy-initialized key
    private volatile SecretKeySpec secretKey;

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null) {
            return null;
        }

        try {
            byte[] iv = new byte[IV_LENGTH_BYTES];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, getSecretKey(), new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));

            byte[] cipherText = cipher.doFinal(attribute.getBytes(StandardCharsets.UTF_8));
            byte[] payload = ByteBuffer.allocate(iv.length + cipherText.length)
                    .put(iv)
                    .put(cipherText)
                    .array();

            return Base64.getEncoder().encodeToString(payload);
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Unable to encrypt sensitive user data", exception);
        }
    }

    @Override
    public String convertToEntityAttribute(String databaseValue) {
        if (databaseValue == null) {
            return null;
        }

        try {
            byte[] payload = Base64.getDecoder().decode(databaseValue);
            if (payload.length <= IV_LENGTH_BYTES) {
                return databaseValue;
            }

            ByteBuffer buffer = ByteBuffer.wrap(payload);

            byte[] iv = new byte[IV_LENGTH_BYTES];
            buffer.get(iv);

            byte[] cipherText = new byte[buffer.remaining()];
            buffer.get(cipherText);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, getSecretKey(), new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));

            return new String(cipher.doFinal(cipherText), StandardCharsets.UTF_8);
        } catch (RuntimeException | GeneralSecurityException exception) {
            return databaseValue;
        }
    }

    private SecretKeySpec getSecretKey() {
        SecretKeySpec key = secretKey;
        if (key == null) {
            synchronized (this) {
                key = secretKey;
                if (key == null) {
                    key = new SecretKeySpec(resolveKey(), ALGORITHM);
                    secretKey = key;
                }
            }
        }
        return key;
    }

    private byte[] resolveKey() {
        String encodedKey = System.getenv(KEY_ENVIRONMENT_VARIABLE);

        if (encodedKey == null || encodedKey.isBlank()) {
            return DEVELOPMENT_FALLBACK_KEY;
        }

        byte[] key = Base64.getDecoder().decode(encodedKey);

        if (key.length != 16 && key.length != 24 && key.length != 32) {
            throw new IllegalStateException(
                    KEY_ENVIRONMENT_VARIABLE + " must decode to a 128, 192, or 256-bit AES key");
        }

        return key;
    }
}
