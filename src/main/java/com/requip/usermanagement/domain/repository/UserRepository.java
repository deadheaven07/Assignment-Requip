package com.requip.usermanagement.domain.repository;

import com.requip.usermanagement.domain.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByIdAndIsActiveTrue(Long id);

    @Query("select u from User u where u.isActive = true or u.isActive is null")
    Page<User> findAllActiveOrNull(Pageable pageable);

    boolean existsByEmailAndIsActiveTrue(String email);
}
