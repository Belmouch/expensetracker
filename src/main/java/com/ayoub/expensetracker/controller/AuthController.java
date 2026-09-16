package com.ayoub.expensetracker.controller;

import com.ayoub.expensetracker.dto.LoginRequest;
import com.ayoub.expensetracker.dto.ChangePasswordRequest;
import com.ayoub.expensetracker.dto.RegisterRequest;
import com.ayoub.expensetracker.dto.ForgotPasswordRequest;
import com.ayoub.expensetracker.dto.ResetPasswordRequest;
import com.ayoub.expensetracker.dto.VerifyResetCodeRequest;
import com.ayoub.expensetracker.dto.ResetCodeResponse;
import com.ayoub.expensetracker.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
    }

    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.requestPasswordReset(request);
        return Map.of("message", "If the email exists, a verification code has been sent.");
    }

    @PostMapping("/verify-reset-code")
    public ResetCodeResponse verifyResetCode(@Valid @RequestBody VerifyResetCodeRequest request) {
        return new ResetCodeResponse(authService.verifyResetCodeAndCreateToken(request));
    }

    @PostMapping("/reset-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
    }

    @PostMapping("/login")
public String login(@Valid @RequestBody LoginRequest request) {

    System.out.println("LOGIN ENDPOINT CALLED");

    return authService.login(request);
}

    @PutMapping("/change-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        authService.changePassword(authentication.getName(), request);
    }
}