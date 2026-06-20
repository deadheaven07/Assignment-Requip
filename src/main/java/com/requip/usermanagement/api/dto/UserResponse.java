package com.requip.usermanagement.api.dto;

import java.time.Instant;
import java.time.LocalDate;

public record UserResponse(
        Long id,
        String name,
        String email,
        String primaryMobile,
        String secondaryMobile,
        LocalDate dateOfBirth,
        String placeOfBirth,
        String currentAddress,
        String permanentAddress,
        String pan,
        String aadhaar,
        boolean active,
        long version,
        Instant createdAt,
        Instant updatedAt
) {
    public static UserResponse of(
            Long id,
            String name,
            String email,
            String primaryMobile,
            String secondaryMobile,
            LocalDate dateOfBirth,
            String placeOfBirth,
            String currentAddress,
            String permanentAddress,
            String pan,
            String aadhaar,
            boolean active,
            long version,
            Instant createdAt,
            Instant updatedAt
    ) {
        return new UserResponse(
                id,
                name,
                email,
                primaryMobile,
                secondaryMobile,
                dateOfBirth,
                placeOfBirth,
                currentAddress,
                permanentAddress,
                maskPan(pan),
                maskAadhaar(aadhaar),
                active,
                version,
                createdAt,
                updatedAt
        );
    }

    private static String maskPan(String pan) {
        if (pan == null || pan.length() < 4) {
            return null;
        }

        return "XXXXXX" + pan.substring(pan.length() - 4);
    }

    private static String maskAadhaar(String aadhaar) {
        if (aadhaar == null || aadhaar.length() < 4) {
            return null;
        }

        return "XXXXXXXX" + aadhaar.substring(aadhaar.length() - 4);
    }
}
