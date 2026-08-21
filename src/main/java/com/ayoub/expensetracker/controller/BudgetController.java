package com.ayoub.expensetracker.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ayoub.expensetracker.dto.BudgetRequest;
import com.ayoub.expensetracker.dto.BudgetResponse;
import com.ayoub.expensetracker.service.BudgetService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;


    // =========================================================
    // GET CURRENT USER BUDGETS
    // GET /budgets/me
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
    // POST /budgets/me
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
    // GET /budgets/user/{userId}
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
    // GET /budgets/{id}
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
    // PUT /budgets/{id}
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
    // DELETE /budgets/{id}
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(
            @PathVariable Long id
    ) {

        budgetService.deleteBudget(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}