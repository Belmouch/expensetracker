package com.ayoub.expensetracker.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ayoub.expensetracker.entity.Budget;
import com.ayoub.expensetracker.entity.User;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUser(User user);
}