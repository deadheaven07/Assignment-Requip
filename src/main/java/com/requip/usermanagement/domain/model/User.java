package com.requip.usermanagement.domain.model;

import com.requip.usermanagement.infrastructure.persistence.CryptoConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users", uniqueConstraints = {
                @UniqueConstraint(name = "uk_users_email_active", columnNames = { "email", "is_active" }),
                @UniqueConstraint(name = "uk_users_primary_mobile_active", columnNames = { "primary_mobile",
                                "is_active" }),
                @UniqueConstraint(name = "uk_users_aadhaar", columnNames = "aadhaar"),
                @UniqueConstraint(name = "uk_users_pan", columnNames = "pan")
}, indexes = {
                @Index(name = "idx_users_email", columnList = "email")
})
public class User {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "id", nullable = false, updatable = false)
        private Long id;

        @Column(name = "name", nullable = false, length = 100)
        private String name;

        @Column(name = "email", nullable = false, length = 254)
        private String email;

        @Column(name = "primary_mobile", length = 15)
        private String primaryMobile;

        @Column(name = "secondary_mobile", length = 15)
        private String secondaryMobile;

        @Column(name = "date_of_birth")
        private LocalDate dateOfBirth;

        @Column(name = "place_of_birth", length = 120)
        private String placeOfBirth;

        @Column(name = "current_address", length = 500)
        private String currentAddress;

        @Column(name = "permanent_address", length = 500)
        private String permanentAddress;

        @Convert(converter = CryptoConverter.class)
        @Column(name = "aadhaar", length = 255)
        private String aadhaar;

        @Convert(converter = CryptoConverter.class)
        @Column(name = "pan", length = 255)
        private String pan;

        @Version
        @Column(name = "version")
        private Long version;

        @Builder.Default
        @Column(name = "is_active")
        private Boolean isActive = Boolean.TRUE;

        @CreationTimestamp
        @Column(name = "created_at", updatable = false)
        private Instant createdAt;

        @UpdateTimestamp
        @Column(name = "updated_at")
        private Instant updatedAt;
}
