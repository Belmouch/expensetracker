package com.ayoub.expensetracker.service;

import java.util.List;
import java.util.Locale;
import java.util.stream.Stream;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.ayoub.expensetracker.dto.CategoryResponse;
import com.ayoub.expensetracker.dto.CreateCategoryRequest;
import com.ayoub.expensetracker.entity.Category;
import com.ayoub.expensetracker.entity.User;
import com.ayoub.expensetracker.repository.CategoryRepository;
import com.ayoub.expensetracker.repository.UserRepository;

@Service
public class CategoryService {

    private static final List<String> DEFAULT_CATEGORIES = List.of(
            "Food",
            "Shopping",
            "Coffee",
            "Bills",
            "Water",
            "Entertainment",
            "Study",
            "Outils",
            "Dar",
            "Transport",
            "Health"
    );

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public CategoryService(
            CategoryRepository categoryRepository,
            UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    public List<CategoryResponse> getCategories() {
        User user = getCurrentUser();
        Stream<CategoryResponse> defaults = DEFAULT_CATEGORIES.stream()
                .map(name -> new CategoryResponse(null, name));
        Stream<CategoryResponse> custom = categoryRepository.findByUserOrderByNameAsc(user)
                .stream()
                .map(category -> new CategoryResponse(category.getId(), category.getName()));

        return Stream.concat(defaults, custom).toList();
    }

    public CategoryResponse createCategory(CreateCategoryRequest request) {
        User user = getCurrentUser();
        String name = request.getName().trim();
        String normalizedName = name.toLowerCase(Locale.ROOT);

                if (normalizedName.equals("other")) {
                        throw new IllegalArgumentException("Other is a UI-only category option");
                }

        boolean alreadyExists = Stream.concat(
                        DEFAULT_CATEGORIES.stream(),
                        categoryRepository.findByUserOrderByNameAsc(user)
                                .stream()
                                .map(Category::getName))
                .anyMatch(category -> category.trim().toLowerCase(Locale.ROOT).equals(normalizedName));

        if (alreadyExists) {
            return getCategories().stream()
                    .filter(category -> category.getName().equalsIgnoreCase(name))
                    .findFirst()
                    .orElseThrow();
        }

        Category saved = categoryRepository.save(Category.builder()
                .name(name)
                .user(user)
                .build());

        return new CategoryResponse(saved.getId(), saved.getName());
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
