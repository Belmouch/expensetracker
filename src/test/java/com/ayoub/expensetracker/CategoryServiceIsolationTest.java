package com.ayoub.expensetracker;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.ayoub.expensetracker.dto.CategoryResponse;
import com.ayoub.expensetracker.dto.CreateCategoryRequest;
import com.ayoub.expensetracker.entity.Category;
import com.ayoub.expensetracker.entity.User;
import com.ayoub.expensetracker.repository.CategoryRepository;
import com.ayoub.expensetracker.repository.UserRepository;
import com.ayoub.expensetracker.service.CategoryService;

class CategoryServiceIsolationTest {

    private final CategoryRepository categoryRepository = mock(CategoryRepository.class);
    private final UserRepository userRepository = mock(UserRepository.class);
    private final CategoryService categoryService = new CategoryService(
            categoryRepository,
            userRepository
    );

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void returnsOnlyCustomCategoriesOwnedByAuthenticatedUser() {
        User userOne = User.builder().id(1L).username("user-one").build();
        User userTwo = User.builder().id(2L).username("user-two").build();
        Category gym = Category.builder().id(10L).name("Gym").user(userOne).build();
        Category car = Category.builder().id(11L).name("Car").user(userTwo).build();

        when(userRepository.findByUsername("user-one")).thenReturn(Optional.of(userOne));
        when(userRepository.findByUsername("user-two")).thenReturn(Optional.of(userTwo));
        when(categoryRepository.findByUserOrderByNameAsc(userOne)).thenReturn(List.of(gym));
        when(categoryRepository.findByUserOrderByNameAsc(userTwo)).thenReturn(List.of(car));

        authenticateAs("user-one");
        List<String> userOneCategories = names(categoryService.getCategories());

        authenticateAs("user-two");
        List<String> userTwoCategories = names(categoryService.getCategories());

        assertTrue(userOneCategories.contains("Food"));
        assertTrue(userOneCategories.contains("Gym"));
        assertFalse(userOneCategories.contains("Car"));
        assertTrue(userTwoCategories.contains("Food"));
        assertTrue(userTwoCategories.contains("Car"));
        assertFalse(userTwoCategories.contains("Gym"));
    }

    @Test
    void createsCategoryWithAuthenticatedUserAsOwner() {
        User userOne = User.builder().id(1L).username("user-one").build();
        when(userRepository.findByUsername("user-one")).thenReturn(Optional.of(userOne));
        when(categoryRepository.findByUserOrderByNameAsc(userOne)).thenReturn(List.of());
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));

        authenticateAs("user-one");
        CreateCategoryRequest request = new CreateCategoryRequest();
        request.setName(" Gym ");

        CategoryResponse response = categoryService.createCategory(request);

        assertTrue(response.getName().equals("Gym"));
        verify(categoryRepository).save(org.mockito.ArgumentMatchers.argThat(category ->
                category.getUser() == userOne && category.getName().equals("Gym")
        ));
    }

    private void authenticateAs(String username) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(username, null, List.of())
        );
    }

    private List<String> names(List<CategoryResponse> categories) {
        return categories.stream().map(CategoryResponse::getName).toList();
    }
}
