package com.ayoub.expensetracker.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class ExpenseResponse {

    private Long id;
    private String title;
    private Double amount;
    private String category;
    private LocalDate date;
}