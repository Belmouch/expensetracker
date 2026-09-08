package com.ayoub.expensetracker.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.ayoub.expensetracker.dto.RecurringExpenseRequest;
import com.ayoub.expensetracker.dto.RecurringExpenseResponse;
import com.ayoub.expensetracker.entity.RecurringExpense;
import com.ayoub.expensetracker.entity.User;
import com.ayoub.expensetracker.repository.RecurringExpenseRepository;
import com.ayoub.expensetracker.repository.UserRepository;

import lombok.RequiredArgsConstructor;

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

        recurring.setNextRunDate(
                startDate
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