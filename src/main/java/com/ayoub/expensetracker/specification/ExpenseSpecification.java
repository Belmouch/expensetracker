package com.ayoub.expensetracker.specification;

import com.ayoub.expensetracker.entity.Expense;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class ExpenseSpecification {

    // Search by Category
    public static Specification<Expense> hasCategory(String category) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("category"), category);
    }

    // Search by Title
    public static Specification<Expense> hasTitle(String title) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("title"), title);
    }

    // Search by Minimum Amount
    public static Specification<Expense> hasMinAmount(Double amount) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.greaterThanOrEqualTo(
                        root.get("amount"),
                        amount
                );
    }

    // Search by Maximum Amount
    public static Specification<Expense> hasMaxAmount(Double amount) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.lessThanOrEqualTo(
                        root.get("amount"),
                        amount
                );
    }

    // Search by Date
    public static Specification<Expense> hasDate(LocalDate date) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("date"), date);
    }
}