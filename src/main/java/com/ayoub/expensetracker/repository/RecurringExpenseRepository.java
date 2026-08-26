package com.ayoub.expensetracker.repository;

import com.ayoub.expensetracker.entity.RecurringExpense;
import com.ayoub.expensetracker.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface RecurringExpenseRepository
        extends JpaRepository<RecurringExpense, Long> {

    List<RecurringExpense> findByUserOrderByNextRunDateAsc(
            User user
    );

    List<RecurringExpense> findByActiveTrueAndNextRunDateLessThanEqual(
            LocalDate date
    );
}