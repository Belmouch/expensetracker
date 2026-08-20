package com.ayoub.expensetracker.service;

import com.ayoub.expensetracker.dto.BudgetRequest;
import com.ayoub.expensetracker.dto.BudgetResponse;
import com.ayoub.expensetracker.entity.Budget;
import com.ayoub.expensetracker.entity.Expense;
import com.ayoub.expensetracker.entity.User;
import com.ayoub.expensetracker.repository.BudgetRepository;
import com.ayoub.expensetracker.repository.ExpenseRepository;
import com.ayoub.expensetracker.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;


    // =========================================================
    // GET CURRENT USER BUDGETS BY USERNAME
    // =========================================================

    public List<BudgetResponse> getUserBudgetsByUsername(String username) {

        User user = getUserByUsername(username);

        return budgetRepository.findByUser(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // CREATE BUDGET FOR CURRENT USER
    // =========================================================

    public BudgetResponse createBudgetByUsername(
            String username,
            BudgetRequest request
    ) {

        User user = getUserByUsername(username);

        validateDates(
                request.getStartDate(),
                request.getEndDate()
        );

        Budget budget = Budget.builder()
                .amount(request.getAmount())
                .category(request.getCategory())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .user(user)
                .build();

        Budget savedBudget = budgetRepository.save(budget);

        return mapToResponse(savedBudget);
    }


    // =========================================================
    // GET ALL USER BUDGETS BY ID
    // =========================================================

    public List<BudgetResponse> getUserBudgets(Long userId) {

        User user = getUser(userId);

        return budgetRepository.findByUser(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET BUDGET BY ID
    // =========================================================

    public BudgetResponse getBudgetById(Long id) {

        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Budget not found with id: " + id
                        )
                );

        return mapToResponse(budget);
    }


    // =========================================================
    // CREATE BUDGET BY USER ID
    // =========================================================

    public BudgetResponse createBudget(
            Long userId,
            BudgetRequest request
    ) {

        User user = getUser(userId);

        validateDates(
                request.getStartDate(),
                request.getEndDate()
        );

        Budget budget = Budget.builder()
                .amount(request.getAmount())
                .category(request.getCategory())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .user(user)
                .build();

        Budget savedBudget = budgetRepository.save(budget);

        return mapToResponse(savedBudget);
    }


    // =========================================================
    // UPDATE BUDGET
    // =========================================================

    public BudgetResponse updateBudget(
            Long id,
            BudgetRequest request
    ) {

        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Budget not found with id: " + id
                        )
                );

        validateDates(
                request.getStartDate(),
                request.getEndDate()
        );

        budget.setAmount(request.getAmount());
        budget.setCategory(request.getCategory());
        budget.setStartDate(request.getStartDate());
        budget.setEndDate(request.getEndDate());

        Budget updatedBudget = budgetRepository.save(budget);

        return mapToResponse(updatedBudget);
    }


    // =========================================================
    // DELETE BUDGET
    // =========================================================

    public void deleteBudget(Long id) {

        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Budget not found with id: " + id
                        )
                );

        budgetRepository.delete(budget);
    }


    // =========================================================
    // MAPPING
    // =========================================================

    private BudgetResponse mapToResponse(Budget budget) {

        Double spent = calculateSpent(budget);

        Double remaining =
                budget.getAmount() - spent;

        Double percentage = 0.0;

        if (budget.getAmount() > 0) {

            percentage =
                    (spent / budget.getAmount()) * 100;
        }

        return BudgetResponse.builder()
                .id(budget.getId())
                .amount(budget.getAmount())
                .spent(spent)
                .remaining(remaining)
                .percentage(percentage)
                .category(budget.getCategory())
                .startDate(budget.getStartDate())
                .endDate(budget.getEndDate())
                .userId(budget.getUser().getId())
                .build();
    }


    // =========================================================
    // CALCULATE SPENT
    // =========================================================

    private Double calculateSpent(Budget budget) {

        User user = budget.getUser();

        List<Expense> expenses =
                expenseRepository.findByUser(user);

        return expenses.stream()

                .filter(expense ->
                        expense.getDate() != null
                )

                .filter(expense ->
                        !expense.getDate()
                                .isBefore(budget.getStartDate())
                )

                .filter(expense ->
                        !expense.getDate()
                                .isAfter(budget.getEndDate())
                )

                .filter(expense ->
                        budget.getCategory()
                                .equalsIgnoreCase(
                                        expense.getCategory()
                                )
                )

                .mapToDouble(Expense::getAmount)

                .sum();
    }


    // =========================================================
    // GET USER BY ID
    // =========================================================

    private User getUser(Long userId) {

        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with id: " + userId
                        )
                );
    }


    // =========================================================
    // GET USER BY USERNAME
    // =========================================================

    private User getUserByUsername(String username) {

        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with username: " + username
                        )
                );
    }


    // =========================================================
    // VALIDATE DATES
    // =========================================================

    private void validateDates(
            LocalDate startDate,
            LocalDate endDate
    ) {

        if (endDate.isBefore(startDate)) {

            throw new IllegalArgumentException(
                    "End date cannot be before start date"
            );
        }
    }
}