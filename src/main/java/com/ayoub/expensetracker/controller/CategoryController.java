package com.ayoub.expensetracker.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ayoub.expensetracker.dto.CategoryResponse;
import com.ayoub.expensetracker.dto.CreateCategoryRequest;
import com.ayoub.expensetracker.service.CategoryService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<CategoryResponse> getCategories() {
        return categoryService.getCategories();
    }

    @PostMapping
    public CategoryResponse createCategory(
            @Valid @RequestBody CreateCategoryRequest request) {
        return categoryService.createCategory(request);
    }
}
