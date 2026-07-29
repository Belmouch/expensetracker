package com.ayoub.expensetracker.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.ayoub.expensetracker.entity.Expense;
import com.ayoub.expensetracker.entity.User;

public interface ExpenseRepository extends JpaRepository<Expense, Long>,
        JpaSpecificationExecutor<Expense> {
                List<Expense> findByUser(User user);
                Page<Expense> findByUser(User user, Pageable pageable);


}