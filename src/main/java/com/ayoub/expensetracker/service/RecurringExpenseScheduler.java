package com.ayoub.expensetracker.service;

import java.time.LocalDate;
import java.time.ZoneId;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ayoub.expensetracker.entity.Expense;
import com.ayoub.expensetracker.entity.RecurrenceFrequency;
import com.ayoub.expensetracker.entity.RecurringExpense;
import com.ayoub.expensetracker.repository.ExpenseRepository;
import com.ayoub.expensetracker.repository.RecurringExpenseRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecurringExpenseScheduler {

    private final RecurringExpenseRepository recurringExpenseRepository;
    private final ExpenseRepository expenseRepository;

    /**
     * Check recurring expenses every minute.
     *
     * This makes recurring expenses dynamic even when
     * the user creates one during the day.
     */
    @Scheduled(
            cron = "0 * * * * *",
            zone = "Africa/Casablanca"
    )
    @Transactional
    public void processRecurringExpenses() {

        LocalDate today =
                LocalDate.now(
                        ZoneId.of("Africa/Casablanca")
                );

        var recurringExpenses =
                recurringExpenseRepository
                        .findByActiveTrueAndNextRunDateLessThanEqual(today);

        for (RecurringExpense recurring : recurringExpenses) {

            while (
                    recurring.isActive()
                    && recurring.getNextRunDate() != null
                    && !recurring.getNextRunDate().isAfter(today)
            ) {

                LocalDate currentRunDate =
                        recurring.getNextRunDate();

                // --------------------------------------
                // END DATE CHECK
                // --------------------------------------

                if (
                        recurring.getEndDate() != null
                        && currentRunDate.isAfter(
                                recurring.getEndDate()
                        )
                ) {

                    recurring.setActive(false);
                    break;
                }

                // --------------------------------------
                // CREATE NORMAL EXPENSE
                // --------------------------------------

                Expense expense = new Expense();

                expense.setTitle(
                        recurring.getTitle()
                );

                expense.setAmount(
                        recurring.getAmount()
                );

                expense.setCategory(
                        recurring.getCategory()
                );

                expense.setDate(
                        currentRunDate
                );

                expense.setUser(
                        recurring.getUser()
                );

                expenseRepository.save(expense);

                // --------------------------------------
                // CALCULATE NEXT RUN DATE
                // --------------------------------------

                LocalDate nextRunDate =
                        calculateNextDate(
                                currentRunDate,
                                recurring.getFrequency()
                        );

                recurring.setNextRunDate(nextRunDate);

                // --------------------------------------
                // END DATE CHECK AFTER GENERATION
                // --------------------------------------

                if (
                        recurring.getEndDate() != null
                        && nextRunDate.isAfter(
                                recurring.getEndDate()
                        )
                ) {

                    recurring.setActive(false);
                }
            }

            recurringExpenseRepository.save(recurring);
        }
    }

    // ==========================================
    // CALCULATE NEXT DATE
    // ==========================================

    private LocalDate calculateNextDate(
            LocalDate currentDate,
            RecurrenceFrequency frequency
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