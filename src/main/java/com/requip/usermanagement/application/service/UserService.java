package com.requip.usermanagement.application.service;

import com.requip.usermanagement.api.dto.UserCreateRequest;
import com.requip.usermanagement.api.dto.UserResponse;
import com.requip.usermanagement.api.dto.UserUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    UserResponse createUser(UserCreateRequest request);

    UserResponse updateUser(Long id, UserUpdateRequest request);

    void deleteUser(Long id);

    Page<UserResponse> getAllUsers(Pageable pageable);
}
