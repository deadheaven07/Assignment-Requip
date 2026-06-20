package com.requip.usermanagement.application.service.impl;

import com.requip.usermanagement.api.dto.UserCreateRequest;
import com.requip.usermanagement.api.dto.UserResponse;
import com.requip.usermanagement.api.dto.UserUpdateRequest;
import com.requip.usermanagement.api.exception.ResourceNotFoundException;
import com.requip.usermanagement.application.service.UserService;
import com.requip.usermanagement.domain.model.User;
import com.requip.usermanagement.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {
    private static final int MAX_PAGE_SIZE = 100;

    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.existsByEmailAndIsActiveTrue(request.email())) {
            throw new IllegalArgumentException("Active user already exists with email: " + request.email());
        }

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .primaryMobile(request.primaryMobile())
                .secondaryMobile(request.secondaryMobile())
                .dateOfBirth(request.dateOfBirth())
                .placeOfBirth(request.placeOfBirth())
                .currentAddress(request.currentAddress())
                .permanentAddress(request.permanentAddress())
                .pan(request.pan())
                .aadhaar(request.aadhaar())
                .isActive(Boolean.TRUE)
                .build();

        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = getActiveUser(id);

        if (request.name() != null) {
            user.setName(request.name());
        }
        if (request.email() != null && !request.email().equals(user.getEmail())) {
            if (userRepository.existsByEmailAndIsActiveTrue(request.email())) {
                throw new IllegalArgumentException("Active user already exists with email: " + request.email());
            }
            user.setEmail(request.email());
        }
        if (request.primaryMobile() != null) {
            user.setPrimaryMobile(request.primaryMobile());
        }
        if (request.secondaryMobile() != null) {
            user.setSecondaryMobile(request.secondaryMobile());
        }
        if (request.dateOfBirth() != null) {
            user.setDateOfBirth(request.dateOfBirth());
        }
        if (request.placeOfBirth() != null) {
            user.setPlaceOfBirth(request.placeOfBirth());
        }
        if (request.currentAddress() != null) {
            user.setCurrentAddress(request.currentAddress());
        }
        if (request.permanentAddress() != null) {
            user.setPermanentAddress(request.permanentAddress());
        }
        if (request.pan() != null) {
            user.setPan(request.pan());
        }
        if (request.aadhaar() != null) {
            user.setAadhaar(request.aadhaar());
        }

        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = getActiveUser(id);
        user.setIsActive(Boolean.FALSE);
        userRepository.save(user);
    }

    @Override
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        Pageable boundedPageable = bounded(pageable);
        return userRepository.findAllActiveOrNull(boundedPageable).map(this::toResponse);
    }

    private User getActiveUser(Long id) {
        return userRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Active user not found with id: " + id));
    }

    private Pageable bounded(Pageable pageable) {
        if (pageable == null || pageable.isUnpaged()) {
            return PageRequest.of(0, MAX_PAGE_SIZE);
        }

        int pageSize = Math.min(pageable.getPageSize(), MAX_PAGE_SIZE);
        return PageRequest.of(pageable.getPageNumber(), pageSize, pageable.getSort());
    }

    private UserResponse toResponse(User user) {
        return UserResponse.of(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPrimaryMobile(),
                user.getSecondaryMobile(),
                user.getDateOfBirth(),
                user.getPlaceOfBirth(),
                user.getCurrentAddress(),
                user.getPermanentAddress(),
                user.getPan(),
                user.getAadhaar(),
                Boolean.TRUE.equals(user.getIsActive()),
                user.getVersion() == null ? 0L : user.getVersion(),
                user.getCreatedAt(),
                user.getUpdatedAt());
    }
}
