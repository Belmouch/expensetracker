package com.ayoub.expensetracker.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetResponse {

    private Long id;

    private Double amount;

    private Double spent;

    private Double remaining;

    private Double percentage;

    private String category;

    private LocalDate startDate;

    private LocalDate endDate;

    private Long userId;
}