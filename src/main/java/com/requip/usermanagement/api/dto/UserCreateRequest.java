package com.requip.usermanagement.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UserCreateRequest(
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 120, message = "Name must be between 2 and 120 characters")
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be well-formed")
        @Size(max = 254, message = "Email must not exceed 254 characters")
        String email,

        @NotBlank(message = "Primary mobile is required")
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Primary mobile must be a valid 10-digit Indian mobile number")
        String primaryMobile,

        @NotNull(message = "Date of birth is required")
        @Past(message = "Date of birth must be in the past")
        LocalDate dateOfBirth,

        @NotBlank(message = "PAN is required")
        @Pattern(regexp = "^[A-Z]{5}[0-9]{4}[A-Z]{1}$", message = "PAN must match the required format")
        String pan,

        @NotBlank(message = "Aadhaar is required")
        @Pattern(regexp = "^\\d{12}$", message = "Aadhaar must be exactly 12 digits")
        String aadhaar
) {
}
