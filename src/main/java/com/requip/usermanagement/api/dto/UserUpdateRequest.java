package com.requip.usermanagement.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UserUpdateRequest(
        @Pattern(regexp = "^(?!\\s*$).+", message = "Name must not be blank")
        @Size(min = 2, max = 120, message = "Name must be between 2 and 120 characters")
        String name,

        @Pattern(regexp = "^(?!\\s*$).+", message = "Email must not be blank")
        @Email(message = "Email must be well-formed")
        @Size(max = 254, message = "Email must not exceed 254 characters")
        String email,

        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Primary mobile must be a valid 10-digit Indian mobile number")
        String primaryMobile,

        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Secondary mobile must be a valid 10-digit Indian mobile number")
        String secondaryMobile,

        @Past(message = "Date of birth must be in the past")
        LocalDate dateOfBirth,

        @Size(max = 120, message = "Place of birth must not exceed 120 characters")
        String placeOfBirth,

        @Size(max = 500, message = "Current address must not exceed 500 characters")
        String currentAddress,

        @Size(max = 500, message = "Permanent address must not exceed 500 characters")
        String permanentAddress,

        @Pattern(regexp = "^[A-Z]{5}[0-9]{4}[A-Z]{1}$", message = "PAN must match the required format")
        String pan,

        @Pattern(regexp = "^\\d{12}$", message = "Aadhaar must be exactly 12 digits")
        String aadhaar
) {
}
