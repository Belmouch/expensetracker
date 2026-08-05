package com.ayoub.expensetracker.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ayoub.expensetracker.entity.Expense;
import com.ayoub.expensetracker.entity.User;
import com.ayoub.expensetracker.projection.CategoryStatistics;

public interface ExpenseRepository extends JpaRepository<Expense, Long>,
        JpaSpecificationExecutor<Expense> {

    List<Expense> findByUser(User user);

    Page<Expense> findByUser(User user, Pageable pageable);

    @Query("""
    SELECT COALESCE(SUM(e.amount), 0)
    FROM Expense e
    WHERE e.user = :user
""")
    Double getTotalAmountByUser(@Param("user") User user);

    @Query("""
    SELECT e.category as category,
           COUNT(e) as count
    FROM Expense e
    WHERE e.user = :user
    GROUP BY e.category
    ORDER BY COUNT(e) DESC
""")
    List<CategoryStatistics> getCategoryStatistics(@Param("user") User user);

}
