package com.ayoub.expensetracker.controller;

import com.ayoub.expensetracker.dto.BudgetRequest;
import com.ayoub.expensetracker.dto.BudgetResponse;
import com.ayoub.expensetracker.service.BudgetService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    // =========================================================
    // GET CURRENT USER BUDGETS
    // =========================================================

    @GetMapping("/me")
    public ResponseEntity<List<BudgetResponse>> getMyBudgets(
            Authentication authentication
    ) {

        String username = authentication.getName();

        return ResponseEntity.ok(
                budgetService.getUserBudgetsByUsername(username)
        );
    }


    // =========================================================
    // CREATE BUDGET FOR CURRENT USER
    // =========================================================

    @PostMapping("/me")
    public ResponseEntity<BudgetResponse> createMyBudget(
            Authentication authentication,
            @Valid @RequestBody BudgetRequest request
    ) {

        String username = authentication.getName();

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        budgetService.createBudgetByUsername(
                                username,
                                request
                        )
                );
    }


    // =========================================================
    // GET ALL BUDGETS FOR USER
    // =========================================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BudgetResponse>> getUserBudgets(
            @PathVariable Long userId
    ) {

        return ResponseEntity.ok(
                budgetService.getUserBudgets(userId)
        );
    }


    // =========================================================
    // GET BUDGET BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<BudgetResponse> getBudgetById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                budgetService.getBudgetById(id)
        );
    }


    // =========================================================
    // UPDATE BUDGET
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponse> updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequest request
    ) {

        return ResponseEntity.ok(
                budgetService.updateBudget(
                        id,
                        request
                )
        );
    }


    // =========================================================
    // DELETE BUDGET
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(
            @PathVariable Long id
    ) {

        budgetService.deleteBudget(id);

        return ResponseEntity.noContent().build();
    }
}