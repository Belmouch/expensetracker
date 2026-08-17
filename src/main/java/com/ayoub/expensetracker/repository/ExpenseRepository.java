package com.ayoub.expensetracker.repository;

import java.time.LocalDate;
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
import com.ayoub.expensetracker.projection.MonthlyStatistics;

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
    List<CategoryStatistics> getCategoryStatistics(
            @Param("user") User user
    );

    // =========================
    // MONTHLY STATISTICS
    // =========================
    @Query(value = """
        SELECT
            EXTRACT(YEAR FROM e.date) AS year,
            EXTRACT(MONTH FROM e.date) AS month,
            COUNT(e.id) AS count,
            COALESCE(SUM(e.amount), 0) AS total
        FROM expense e
        WHERE e.user_id = :userId
        GROUP BY
            EXTRACT(YEAR FROM e.date),
            EXTRACT(MONTH FROM e.date)
        ORDER BY
            EXTRACT(YEAR FROM e.date) DESC,
            EXTRACT(MONTH FROM e.date) DESC
        """,
            nativeQuery = true)
    List<MonthlyStatistics> getMonthlyStatistics(
            @Param("userId") Long userId
    );
    // =========================
// EXPENSES BY MONTH
// =========================

    List<Expense> findByUserAndDateGreaterThanEqualAndDateLessThanOrderByDateDesc(
            User user,
            LocalDate startDate,
            LocalDate endDate
    );

}
