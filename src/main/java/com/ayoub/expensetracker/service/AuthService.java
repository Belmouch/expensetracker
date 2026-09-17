package com.ayoub.expensetracker.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ayoub.expensetracker.dto.ChangePasswordRequest;
import com.ayoub.expensetracker.dto.ForgotPasswordRequest;
import com.ayoub.expensetracker.dto.LoginRequest;
import com.ayoub.expensetracker.dto.RegisterRequest;
import com.ayoub.expensetracker.dto.ResetPasswordRequest;
import com.ayoub.expensetracker.dto.VerifyResetCodeRequest;
import com.ayoub.expensetracker.entity.PasswordResetRequest;
import com.ayoub.expensetracker.entity.Role;
import com.ayoub.expensetracker.entity.User;
import com.ayoub.expensetracker.repository.PasswordResetRequestRepository;
import com.ayoub.expensetracker.repository.RoleRepository;
import com.ayoub.expensetracker.repository.UserRepository;
import com.ayoub.expensetracker.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger logger =
            LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordResetRequestRepository passwordResetRequestRepository;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public void register(RegisterRequest request) {

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        Role role = roleRepository.findByName("USER")
                .orElseThrow(() -> new RuntimeException("Role USER not found"));

        User user = User.builder()
                .username(request.getUsername())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);
    }

    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            Instant oneMinuteAgo = Instant.now().minus(1, ChronoUnit.MINUTES);
            if (!passwordResetRequestRepository
                    .findByUserAndCreatedAtAfter(user, oneMinuteAgo).isEmpty()) {
                return;
            }

            String code = String.format("%06d", secureRandom.nextInt(1_000_000));
            String resetToken = UUID.randomUUID().toString();

            PasswordResetRequest resetRequest = PasswordResetRequest.builder()
                    .user(user)
                    .codeHash(passwordEncoder.encode(code))
                    .resetTokenHash(passwordEncoder.encode(resetToken))
                    .expiresAt(Instant.now().plus(10, ChronoUnit.MINUTES))
                    .used(false)
                    .build();

            passwordResetRequestRepository.save(resetRequest);

            try {
                emailService.sendPasswordResetCode(user.getEmail(), code);
                logger.info(
                    "Password reset email delivery succeeded for userId={}",
                    user.getId()
                );
            } catch (RuntimeException exception) {
                passwordResetRequestRepository.delete(resetRequest);

                logger.error(
                        "Password reset email delivery failed for userId={}. "
                                + "The reset request was invalidated.",
                        user.getId(),
                        exception
                );

                throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to send password reset email"
                );
            }
        });
    }

    @Transactional
    public String verifyResetCodeAndCreateToken(VerifyResetCodeRequest request) {
        User user = findUserByEmail(request.getEmail());
        PasswordResetRequest resetRequest = findActiveResetRequest(user);

        if (resetRequest.getCodeHash() == null
                || !passwordEncoder.matches(request.getCode(), resetRequest.getCodeHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification code");
        }

        String resetToken = UUID.randomUUID().toString();
        resetRequest.setCodeHash(null);
        resetRequest.setResetTokenHash(passwordEncoder.encode(resetToken));
        resetRequest.setVerifiedAt(Instant.now());
        passwordResetRequestRepository.save(resetRequest);

        return resetToken;
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password and confirmation do not match");
        }

        PasswordResetRequest resetRequest = passwordResetRequestRepository
            .findByUsedFalseAndVerifiedAtIsNotNullOrderByCreatedAtDesc()
                .stream()
                .filter(candidate -> candidate.getExpiresAt().isAfter(Instant.now()))
                .filter(candidate -> passwordEncoder.matches(request.getResetToken(), candidate.getResetTokenHash()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset token"));

        resetRequest.getUser().setPassword(passwordEncoder.encode(request.getNewPassword()));
        resetRequest.setUsed(true);
        passwordResetRequestRepository.save(resetRequest);
        userRepository.save(resetRequest.getUser());
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email.trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification code"));
    }

    private PasswordResetRequest findActiveResetRequest(User user) {
        return passwordResetRequestRepository.findTopByUserAndUsedFalseOrderByCreatedAtDesc(user)
                .filter(request -> request.getExpiresAt().isAfter(Instant.now()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification code is invalid or expired"));
    }

    public String login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        return jwtService.generateToken(request.getUsername());
    }

    public void changePassword(String username, ChangePasswordRequest request) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "New password and confirmation do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}