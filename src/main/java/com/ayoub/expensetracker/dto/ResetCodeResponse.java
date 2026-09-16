package com.ayoub.expensetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ResetCodeResponse {

    private String resetToken;
}
