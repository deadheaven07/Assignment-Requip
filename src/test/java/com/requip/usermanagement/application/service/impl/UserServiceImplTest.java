package com.requip.usermanagement.application.service.impl;

import com.requip.usermanagement.api.dto.UserCreateRequest;
import com.requip.usermanagement.api.dto.UserResponse;
import com.requip.usermanagement.api.dto.UserUpdateRequest;
import com.requip.usermanagement.api.exception.ResourceNotFoundException;
import com.requip.usermanagement.domain.model.User;
import com.requip.usermanagement.domain.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {
    private static final Long USER_ID = 1L;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void createUser_Success() {
        // Given
        UserCreateRequest request = new UserCreateRequest(
                "Aarav Sharma",
                "aarav.sharma@example.com",
                "9876543210",
                "9876543211",
                LocalDate.of(1992, 4, 12),
                "Pune",
                "Current address line",
                "Permanent address line",
                "ABCDE1234F",
                "123456789012"
        );
        User savedUser = createMockUser();

        when(userRepository.existsByEmailAndIsActiveTrue(request.email())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // When
        UserResponse response = userService.createUser(request);

        // Then
        assertThat(response.id()).isEqualTo(savedUser.getId());
        assertThat(response.name()).isEqualTo(savedUser.getName());
        assertThat(response.email()).isEqualTo(savedUser.getEmail());
        assertThat(response.secondaryMobile()).isEqualTo(savedUser.getSecondaryMobile());
        assertThat(response.placeOfBirth()).isEqualTo(savedUser.getPlaceOfBirth());
        assertThat(response.currentAddress()).isEqualTo(savedUser.getCurrentAddress());
        assertThat(response.permanentAddress()).isEqualTo(savedUser.getPermanentAddress());
        assertThat(response.pan()).isNotEqualTo(savedUser.getPan());
        assertThat(response.aadhaar()).isNotEqualTo(savedUser.getAadhaar());
        assertThat(response.pan()).isEqualTo("XXXXXX234F");
        assertThat(response.aadhaar()).isEqualTo("XXXXXXXX9012");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void updateUser_Success_PartialUpdate() {
        // Given
        User existingUser = createMockUser();
        UserUpdateRequest request = new UserUpdateRequest(
                "Aarav S. Sharma",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );

        when(userRepository.findByIdAndIsActiveTrue(USER_ID)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        UserResponse response = userService.updateUser(USER_ID, request);

        // Then
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getName()).isEqualTo("Aarav S. Sharma");
        assertThat(savedUser.getEmail()).isEqualTo("aarav.sharma@example.com");
        assertThat(savedUser.getPrimaryMobile()).isEqualTo("9876543210");
        assertThat(response.name()).isEqualTo("Aarav S. Sharma");
    }

    @Test
    void deleteUser_Success() {
        // Given
        User existingUser = createMockUser();

        when(userRepository.findByIdAndIsActiveTrue(USER_ID)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        userService.deleteUser(USER_ID);

        // Then
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        assertThat(userCaptor.getValue().getIsActive()).isFalse();
    }

    @Test
    void updateUser_ThrowsResourceNotFound() {
        // Given
        UserUpdateRequest request = new UserUpdateRequest(
                "Missing User",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );

        when(userRepository.findByIdAndIsActiveTrue(USER_ID)).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> userService.updateUser(USER_ID, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Active user not found with id: " + USER_ID);

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void getAllUsers_EnforcesMaxPageSize() {
        // Given
        PageRequest oversizedPageRequest = PageRequest.of(
                0,
                500,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );
        Page<User> userPage = new PageImpl<>(List.of(createMockUser()), PageRequest.of(0, 100, oversizedPageRequest.getSort()), 1);

        when(userRepository.findAllActiveOrNull(any(Pageable.class))).thenReturn(userPage);

        // When
        Page<UserResponse> response = userService.getAllUsers(oversizedPageRequest);

        // Then
        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(userRepository).findAllActiveOrNull(pageableCaptor.capture());

        Pageable boundedPageable = pageableCaptor.getValue();
        assertThat(boundedPageable.getPageNumber()).isZero();
        assertThat(boundedPageable.getPageSize()).isEqualTo(100);
        assertThat(boundedPageable.getSort()).isEqualTo(oversizedPageRequest.getSort());
        assertThat(response.getContent()).hasSize(1);
    }

    private User createMockUser() {
        return User.builder()
                .id(USER_ID)
                .name("Aarav Sharma")
                .email("aarav.sharma@example.com")
                .primaryMobile("9876543210")
                .secondaryMobile("9876543211")
                .dateOfBirth(LocalDate.of(1992, 4, 12))
                .placeOfBirth("Pune")
                .currentAddress("Current address line")
                .permanentAddress("Permanent address line")
                .pan("ABCDE1234F")
                .aadhaar("123456789012")
                .isActive(Boolean.TRUE)
                .version(3L)
                .createdAt(Instant.parse("2026-01-10T08:30:00Z"))
                .updatedAt(Instant.parse("2026-02-15T09:45:00Z"))
                .build();
    }
}
