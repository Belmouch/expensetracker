package com.ayoub.expensetracker.dto;

import java.time.LocalDate;

import com.ayoub.expensetracker.entity.RecurrenceFrequency;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RecurringExpenseResponse {

    private Long id;

    private String title;

    private Double amount;

    private String category;

    private RecurrenceFrequency frequency;

    private LocalDate startDate;

    private LocalDate nextRunDate;

    private LocalDate endDate;

    private boolean active;
}