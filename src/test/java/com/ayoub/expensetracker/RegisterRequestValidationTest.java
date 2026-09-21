package com.ayoub.expensetracker;

import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.AfterAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import com.ayoub.expensetracker.dto.RegisterRequest;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

class RegisterRequestValidationTest {

    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @AfterAll
    static void closeValidator() {
        validatorFactory.close();
    }

    @Test
    void acceptsPasswordMeetingAllRequirements() {
        RegisterRequest request = requestWithPassword("Secure1!");

        assertTrue(validator.validate(request).isEmpty());
    }

    @Test
    void rejectsPasswordMissingEachRequirement() {
        RegisterRequest request = requestWithPassword("pass");

        Set<String> messages = validator.validate(request).stream()
                .map(error -> error.getMessage())
                .collect(Collectors.toSet());

        assertEquals(4, messages.size());
        assertTrue(messages.contains("Password must be at least 8 characters."));
        assertTrue(messages.contains("Password must contain at least one uppercase letter."));
        assertTrue(messages.contains("Password must contain at least one number."));
        assertTrue(messages.contains("Password must contain at least one special character."));
    }

    private RegisterRequest requestWithPassword(String password) {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("test-user");
        request.setEmail("test@example.com");
        request.setPassword(password);
        return request;
    }
}