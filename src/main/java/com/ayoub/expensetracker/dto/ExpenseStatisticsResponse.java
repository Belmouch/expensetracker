package com.ayoub.expensetracker.dto;

import java.util.List;

public class ExpenseStatisticsResponse {

    private Long totalExpenses;
    private Double totalAmount;
    private List<CategoryStatisticsResponse> categories;

    public ExpenseStatisticsResponse() {
    }

    public ExpenseStatisticsResponse(Long totalExpenses,
                                     Double totalAmount,
                                     List<CategoryStatisticsResponse> categories) {
        this.totalExpenses = totalExpenses;
        this.totalAmount = totalAmount;
        this.categories = categories;
    }

    public Long getTotalExpenses() {
        return totalExpenses;
    }

    public void setTotalExpenses(Long totalExpenses) {
        this.totalExpenses = totalExpenses;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public List<CategoryStatisticsResponse> getCategories() {
        return categories;
    }

    public void setCategories(List<CategoryStatisticsResponse> categories) {
        this.categories = categories;
    }
}