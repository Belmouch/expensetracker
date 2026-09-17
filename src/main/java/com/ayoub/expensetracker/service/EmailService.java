package com.ayoub.expensetracker.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger logger =
        LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${spring.mail.port:587}")
    private int mailPort;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    public void sendPasswordResetCode(String recipient, String code) {
    logger.info(
        "Starting password reset email delivery: recipient={}, smtpHost={}, "
            + "smtpPort={}, usernameConfigured={}, passwordConfigured={}",
        maskEmail(recipient),
        mailHost,
        mailPort,
        isConfigured(mailUsername),
        isConfigured(mailPassword)
    );

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

        logger.info(
                "Password reset email accepted by JavaMailSender: recipient={}",
                maskEmail(recipient)
        );
    }

    private boolean isConfigured(String value) {
        return value != null && !value.isBlank();
    }

    private String maskEmail(String email) {
        if (email == null || email.isBlank()) {
            return "<empty>";
        }

        int atIndex = email.indexOf('@');
        if (atIndex <= 1 || atIndex == email.length() - 1) {
            return "<masked>";
        }

        return email.charAt(0) + "***" + email.substring(atIndex);
    }
}
