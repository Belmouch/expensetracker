package com.ayoub.expensetracker.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ayoub.expensetracker.dto.CreateExpenseRequest;
import com.ayoub.expensetracker.dto.ExpenseResponse;
import com.ayoub.expensetracker.dto.ExpenseStatisticsResponse;
import com.ayoub.expensetracker.service.ExpenseService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping
    public Page<ExpenseResponse> getAllExpenses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        return expenseService.getAllExpenses(page, size, sortBy, direction);
    }

    @GetMapping("/statistics")
    public ExpenseStatisticsResponse getStatistics() {

        return expenseService.getStatistics();

    }

    @GetMapping("/{id}")
    public ExpenseResponse getExpenseById(@PathVariable Long id) {
        return expenseService.getExpenseById(id);
    }

    @PostMapping
    public ExpenseResponse saveExpense(@Valid @RequestBody CreateExpenseRequest request) {
        return expenseService.saveExpense(request);
    }

    @PutMapping("/{id}")
    public ExpenseResponse updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody CreateExpenseRequest request) {

        return expenseService.updateExpense(id, request);
    }

    @DeleteMapping("/{id}")

    public void deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
    }

    @GetMapping("/search")
    public List<ExpenseResponse> searchExpenses(
            @RequestParam(required = false
            ) String category,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount) {

        return expenseService.searchExpenses(
                category,
                title,
                minAmount,
                maxAmount);
    }
}
