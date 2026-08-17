package com.ayoub.expensetracker.projection;

public interface MonthlyStatistics {

    Integer getYear();

    Integer getMonth();

    Long getCount();

    Double getTotal();
}