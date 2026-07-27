package com.ayoub.expensetracker.controller;

import com.ayoub.expensetracker.dto.LoginRequest;
import com.ayoub.expensetracker.dto.RegisterRequest;
import com.ayoub.expensetracker.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/login")
public String login(@Valid @RequestBody LoginRequest request) {

    System.out.println("LOGIN ENDPOINT CALLED");

    return authService.login(request);
}
}