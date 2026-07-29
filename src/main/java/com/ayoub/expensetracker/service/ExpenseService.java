package com.ayoub.expensetracker.service;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.ayoub.expensetracker.dto.CreateExpenseRequest;
import com.ayoub.expensetracker.dto.ExpenseResponse;
import com.ayoub.expensetracker.entity.Expense;
import com.ayoub.expensetracker.entity.User;
import com.ayoub.expensetracker.exception.ExpenseNotFoundException;
import com.ayoub.expensetracker.repository.ExpenseRepository;
import com.ayoub.expensetracker.repository.UserRepository;
import com.ayoub.expensetracker.specification.ExpenseSpecification;

@Service
public class ExpenseService {

     private final ExpenseRepository expenseRepository;
     private final UserRepository userRepository;

     public ExpenseService(ExpenseRepository expenseRepository,
                      UserRepository userRepository) {
    this.expenseRepository = expenseRepository;
    this.userRepository = userRepository;
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

    User currentUser = getCurrentUser();

Page<Expense> expensePage =
        expenseRepository.findByUser(currentUser, pageable);

    return expensePage.map(this::mapToResponse);
}

   
    // POST
public ExpenseResponse saveExpense(CreateExpenseRequest request) {

    Expense expense = mapToEntity(request);

    // Get the authenticated user
    User currentUser = getCurrentUser();

    // Associate the expense with the current user
    expense.setUser(currentUser);

    // Save the expense
    Expense savedExpense = expenseRepository.save(expense);

    return mapToResponse(savedExpense);
}
    

    // GET BY ID
    public ExpenseResponse getExpenseById(Long id) {

    Expense expense = expenseRepository.findById(id)
            .orElseThrow(ExpenseNotFoundException::new);

    if (!expense.getUser().getId().equals(getCurrentUser().getId())) {
        throw new RuntimeException("Access denied");
    }

    return mapToResponse(expense);
} 

    // UPDATE
    public ExpenseResponse updateExpense(Long id, CreateExpenseRequest request) {

    Expense expense = expenseRepository.findById(id)
            .orElseThrow(ExpenseNotFoundException::new);

    if (!expense.getUser().getId().equals(getCurrentUser().getId())) {
        throw new RuntimeException("Access denied");
    }

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

    if (!expense.getUser().getId().equals(getCurrentUser().getId())) {
        throw new RuntimeException("Access denied");
    }

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
private User getCurrentUser() {

    Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    return userRepository.findByUsername(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
}
private Expense mapToEntity(CreateExpenseRequest request) {

    Expense expense = new Expense();

    expense.setTitle(request.getTitle());
    expense.setAmount(request.getAmount());
    expense.setCategory(request.getCategory());
    expense.setDate(request.getDate());

    return expense;
}
}