package com.ayoub.expensetracker.service;

import com.ayoub.expensetracker.dto.CreateExpenseRequest;
import com.ayoub.expensetracker.dto.ExpenseResponse;
import com.ayoub.expensetracker.entity.Expense;
import com.ayoub.expensetracker.exception.ExpenseNotFoundException;
import com.ayoub.expensetracker.repository.ExpenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import com.ayoub.expensetracker.specification.ExpenseSpecification;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    // GET ALL
   public Page<ExpenseResponse> getAllExpenses(
        int page,
        int size,
        String sortBy,
        String direction) {

    Sort sort = direction.equalsIgnoreCase("desc")
            ? Sort.by(sortBy).descending()
            : Sort.by(sortBy).ascending();

    Pageable pageable = PageRequest.of(page, size, sort);

    Page<Expense> expensePage = expenseRepository.findAll(pageable);

    return expensePage.map(this::mapToResponse);
}

    // POST
    public ExpenseResponse saveExpense(CreateExpenseRequest request) {

    Expense expense = mapToEntity(request);

    Expense savedExpense = expenseRepository.save(expense);

    return mapToResponse(savedExpense);
}
    

    // GET BY ID
    public ExpenseResponse getExpenseById(Long id) {

    Expense expense = expenseRepository.findById(id)
            .orElseThrow(ExpenseNotFoundException::new);

    return mapToResponse(expense);
}

    // UPDATE
    public ExpenseResponse updateExpense(Long id, CreateExpenseRequest request) {

    Expense expense = expenseRepository.findById(id)
            .orElseThrow(ExpenseNotFoundException::new);

    expense.setTitle(request.getTitle());
    expense.setAmount(request.getAmount());
    expense.setCategory(request.getCategory());
    expense.setDate(request.getDate());

    Expense updatedExpense = expenseRepository.save(expense);

    return mapToResponse(updatedExpense);
}

    // DELETE
    public void deleteExpense(Long id) {

        Expense expense = expenseRepository.findById(id)
                .orElseThrow(ExpenseNotFoundException::new);

        expenseRepository.delete(expense);
    }
 private ExpenseResponse mapToResponse(Expense expense) {

    ExpenseResponse response = new ExpenseResponse();

    response.setId(expense.getId());
    response.setTitle(expense.getTitle());
    response.setAmount(expense.getAmount());
    response.setCategory(expense.getCategory());
    response.setDate(expense.getDate());

    return response;
}

private Expense mapToEntity(CreateExpenseRequest request) {

    Expense expense = new Expense();

    expense.setTitle(request.getTitle());
    expense.setAmount(request.getAmount());
    expense.setCategory(request.getCategory());
    expense.setDate(request.getDate());

    return expense;
}
public List<ExpenseResponse> searchExpenses(
        String category,
        String title,
        Double minAmount,
        Double maxAmount) {

    Specification<Expense> specification = null;

    if (category != null && !category.isBlank()) {
        specification = ExpenseSpecification.hasCategory(category);
    }

    if (title != null && !title.isBlank()) {
        specification = (specification == null)
                ? ExpenseSpecification.hasTitle(title)
                : specification.and(ExpenseSpecification.hasTitle(title));
    }

    if (minAmount != null) {
        specification = (specification == null)
                ? ExpenseSpecification.hasMinAmount(minAmount)
                : specification.and(ExpenseSpecification.hasMinAmount(minAmount));
    }

    if (maxAmount != null) {
        specification = (specification == null)
                ? ExpenseSpecification.hasMaxAmount(maxAmount)
                : specification.and(ExpenseSpecification.hasMaxAmount(maxAmount));
    }

    List<Expense> expenses;

    if (specification == null) {
        expenses = expenseRepository.findAll();
    } else {
        expenses = expenseRepository.findAll(specification);
    }

    List<ExpenseResponse> responses = new ArrayList<>();

    for (Expense expense : expenses) {
        responses.add(mapToResponse(expense));
    }

    return responses;
}
}