package com.ayoub.expensetracker.repository;

import com.ayoub.expensetracker.entity.PasswordResetRequest;
import com.ayoub.expensetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface PasswordResetRequestRepository extends JpaRepository<PasswordResetRequest, Long> {

    List<PasswordResetRequest> findByUserAndCreatedAtAfter(User user, Instant createdAt);

    Optional<PasswordResetRequest> findTopByUserAndUsedFalseOrderByCreatedAtDesc(User user);

    List<PasswordResetRequest> findByUsedFalseAndVerifiedAtIsNotNullOrderByCreatedAtDesc();
}
