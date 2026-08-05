package com.ayoub.expensetracker.dto;

public class CategoryStatisticsResponse {

    private String category;
    private Long count;

    public CategoryStatisticsResponse() {
    }

    public CategoryStatisticsResponse(String category, Long count) {
        this.category = category;
        this.count = count;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Long getCount() {
        return count;
    }

    public void setCount(Long count) {
        this.count = count;
    }
}