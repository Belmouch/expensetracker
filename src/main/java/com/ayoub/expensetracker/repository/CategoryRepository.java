package com.ayoub.expensetracker.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ayoub.expensetracker.entity.Category;
import com.ayoub.expensetracker.entity.User;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByUserOrderByNameAsc(User user);

    Optional<Category> findByUserAndNameIgnoreCase(User user, String name);
}
