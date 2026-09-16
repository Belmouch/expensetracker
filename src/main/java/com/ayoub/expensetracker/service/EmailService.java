package com.ayoub.expensetracker.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public void sendPasswordResetCode(String recipient, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recipient);
        if (mailUsername != null && !mailUsername.isBlank()) {
            message.setFrom(mailUsername);
        }
        message.setSubject("ExpenseTracker password reset code");
        message.setText(
                "Your ExpenseTracker verification code is: " + code + "\n\n"
                        + "This code expires in 10 minutes.\n"
                        + "If you did not request a password reset, you can ignore this email."
        );
        mailSender.send(message);
    }
}
