package com.ayoub.expensetracker.specification;

import java.time.LocalDate;

import org.springframework.data.jpa.domain.Specification;

import com.ayoub.expensetracker.entity.Expense;
import com.ayoub.expensetracker.entity.User;

public class ExpenseSpecification {

    // =========================
    // CATEGORY
    // =========================

    public static Specification<Expense> hasCategory(String category) {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("category"),
                        category
                );
    }

    // =========================
    // TITLE
    // =========================

    public static Specification<Expense> hasTitle(String title) {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("title"),
                        title
                );
    }

    // =========================
    // MIN AMOUNT
    // =========================

    public static Specification<Expense> hasMinAmount(Double amount) {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.greaterThanOrEqualTo(
                        root.get("amount"),
                        amount
                );
    }

    // =========================
    // MAX AMOUNT
    // =========================

    public static Specification<Expense> hasMaxAmount(Double amount) {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.lessThanOrEqualTo(
                        root.get("amount"),
                        amount
                );
    }

    // =========================
    // EXACT DATE
    // =========================

    public static Specification<Expense> hasDate(LocalDate date) {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("date"),
                        date
                );
    }

    // =========================
    // FROM DATE
    // =========================

    public static Specification<Expense> hasDateFrom(LocalDate date) {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.greaterThanOrEqualTo(
                        root.get("date"),
                        date
                );
    }

    // =========================
    // TO DATE
    // =========================

    public static Specification<Expense> hasDateTo(LocalDate date) {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.lessThanOrEqualTo(
                        root.get("date"),
                        date
                );
    }

    // =========================
    // USER
    // =========================

    public static Specification<Expense> hasUser(User user) {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("user"),
                        user
                );
    }
}