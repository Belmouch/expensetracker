package com.ayoub.expensetracker.service;

import com.ayoub.expensetracker.entity.Expense;
import com.ayoub.expensetracker.entity.RecurringExpense;
import com.ayoub.expensetracker.repository.ExpenseRepository;
import com.ayoub.expensetracker.repository.RecurringExpenseRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

@Service
@RequiredArgsConstructor
public class RecurringExpenseScheduler {

    private final RecurringExpenseRepository recurringExpenseRepository;
    private final ExpenseRepository expenseRepository;

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void processRecurringExpenses() {

        LocalDate today = LocalDate.now();

        var recurringExpenses =
                recurringExpenseRepository
                        .findByActiveTrueAndNextRunDateLessThanEqual(today);

        for (RecurringExpense recurring : recurringExpenses) {

            while (
                    recurring.isActive()
                    && !recurring.getNextRunDate().isAfter(today)
            ) {

                if (
                        recurring.getEndDate() != null
                        && recurring.getNextRunDate()
                            .isAfter(recurring.getEndDate())
                ) {

                    recurring.setActive(false);
                    break;
                }

                Expense expense = new Expense();

                expense.setTitle(recurring.getTitle());
                expense.setAmount(recurring.getAmount());
                expense.setCategory(recurring.getCategory());
                expense.setDate(recurring.getNextRunDate());
                expense.setUser(recurring.getUser());

                expenseRepository.save(expense);

                recurring.setNextRunDate(
                        calculateNextDate(
                                recurring.getNextRunDate(),
                                recurring.getFrequency()
                        )
                );

                if (
                        recurring.getEndDate() != null
                        && recurring.getNextRunDate()
                            .isAfter(recurring.getEndDate())
                ) {

                    recurring.setActive(false);
                }
            }

            recurringExpenseRepository.save(recurring);
        }
    }

    private LocalDate calculateNextDate(
            LocalDate currentDate,
            com.ayoub.expensetracker.entity.RecurrenceFrequency frequency
    ) {

        return switch (frequency) {

            case DAILY ->
                    currentDate.plusDays(1);

            case WEEKLY ->
                    currentDate.plusWeeks(1);

            case MONTHLY ->
                    currentDate.plusMonths(1);

            case YEARLY ->
                    currentDate.plusYears(1);
        };
    }
}