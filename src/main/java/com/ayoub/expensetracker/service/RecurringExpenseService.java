package com.ayoub.expensetracker.service;

import com.ayoub.expensetracker.dto.RecurringExpenseRequest;
import com.ayoub.expensetracker.dto.RecurringExpenseResponse;
import com.ayoub.expensetracker.entity.RecurringExpense;
import com.ayoub.expensetracker.entity.RecurrenceFrequency;
import com.ayoub.expensetracker.entity.User;
import com.ayoub.expensetracker.repository.RecurringExpenseRepository;
import com.ayoub.expensetracker.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecurringExpenseService {

    private final RecurringExpenseRepository recurringExpenseRepository;
    private final UserRepository userRepository;


    // ==========================================
    // GET ALL
    // ==========================================

    public List<RecurringExpenseResponse> getAll() {

        User user = getCurrentUser();

        return recurringExpenseRepository
                .findByUserOrderByNextRunDateAsc(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // ==========================================
    // CREATE
    // ==========================================

    public RecurringExpenseResponse create(
            RecurringExpenseRequest request
    ) {

        User user = getCurrentUser();

        RecurringExpense recurring =
                new RecurringExpense();

        recurring.setTitle(
                request.getTitle()
        );

        recurring.setAmount(
                request.getAmount()
        );

        recurring.setCategory(
                request.getCategory()
        );

        recurring.setFrequency(
                request.getFrequency()
        );

        // --------------------------------------
        // START DATE
        // --------------------------------------

        LocalDate startDate =
                request.getStartDate();

        recurring.setStartDate(startDate);


        // --------------------------------------
        // NEXT RUN DATE
        // --------------------------------------

        LocalDate nextRunDate =
                calculateNextRunDate(
                        startDate,
                        request.getFrequency()
                );

        recurring.setNextRunDate(
                nextRunDate
        );


        // --------------------------------------
        // END DATE
        // --------------------------------------

        recurring.setEndDate(
                request.getEndDate()
        );


        // --------------------------------------
        // OTHER DATA
        // --------------------------------------

        recurring.setActive(true);

        recurring.setUser(user);


        // --------------------------------------
        // SAVE
        // --------------------------------------

        return mapToResponse(
                recurringExpenseRepository.save(
                        recurring
                )
        );
    }


    // ==========================================
    // CALCULATE NEXT RUN DATE
    // ==========================================

    private LocalDate calculateNextRunDate(
            LocalDate startDate,
            RecurrenceFrequency frequency
    ) {

        return switch (frequency) {

            case DAILY ->
                    startDate.plusDays(1);

            case WEEKLY ->
                    startDate.plusWeeks(1);

            case MONTHLY ->
                    startDate.plusMonths(1);

            case YEARLY ->
                    startDate.plusYears(1);
        };
    }


    // ==========================================
    // TOGGLE
    // ==========================================

    public RecurringExpenseResponse toggle(Long id) {

        RecurringExpense recurring =
                recurringExpenseRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Recurring expense not found"
                                )
                        );

        User user = getCurrentUser();

        if (!recurring.getUser().getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "Access denied"
            );
        }

        recurring.setActive(
                !recurring.isActive()
        );

        return mapToResponse(
                recurringExpenseRepository.save(
                        recurring
                )
        );
    }


    // ==========================================
    // DELETE
    // ==========================================

    public void delete(Long id) {

        RecurringExpense recurring =
                recurringExpenseRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Recurring expense not found"
                                )
                        );

        User user = getCurrentUser();

        if (!recurring.getUser().getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "Access denied"
            );
        }

        recurringExpenseRepository.delete(
                recurring
        );
    }


    // ==========================================
    // MAP TO RESPONSE
    // ==========================================

    private RecurringExpenseResponse mapToResponse(
            RecurringExpense recurring
    ) {

        RecurringExpenseResponse response =
                new RecurringExpenseResponse();

        response.setId(
                recurring.getId()
        );

        response.setTitle(
                recurring.getTitle()
        );

        response.setAmount(
                recurring.getAmount()
        );

        response.setCategory(
                recurring.getCategory()
        );

        response.setFrequency(
                recurring.getFrequency()
        );

        response.setStartDate(
                recurring.getStartDate()
        );

        response.setNextRunDate(
                recurring.getNextRunDate()
        );

        response.setEndDate(
                recurring.getEndDate()
        );

        response.setActive(
                recurring.isActive()
        );

        return response;
    }


    // ==========================================
    // GET CURRENT USER
    // ==========================================

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        return userRepository
                .findByUsername(
                        authentication.getName()
                )
                .orElseThrow(
                        () -> new RuntimeException(
                                "User not found"
                        )
                );
    }
}