package com.ayoub.expensetracker.controller;

import com.ayoub.expensetracker.dto.RecurringExpenseRequest;
import com.ayoub.expensetracker.dto.RecurringExpenseResponse;
import com.ayoub.expensetracker.service.RecurringExpenseService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recurring-expenses")
@RequiredArgsConstructor
public class RecurringExpenseController {

    private final RecurringExpenseService recurringExpenseService;

    @GetMapping
    public List<RecurringExpenseResponse> getAll() {

        return recurringExpenseService.getAll();
    }

    @PostMapping
    public RecurringExpenseResponse create(
            @Valid @RequestBody RecurringExpenseRequest request
    ) {

        return recurringExpenseService.create(request);
    }

    @PutMapping("/{id}/toggle")
    public RecurringExpenseResponse toggle(
            @PathVariable Long id
    ) {

        return recurringExpenseService.toggle(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {

        recurringExpenseService.delete(id);

        return ResponseEntity.noContent().build();
    }
}