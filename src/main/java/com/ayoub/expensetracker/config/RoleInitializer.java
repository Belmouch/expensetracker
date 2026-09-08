package com.ayoub.expensetracker.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.ayoub.expensetracker.entity.Role;
import com.ayoub.expensetracker.repository.RoleRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RoleInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        createRoleIfMissing("USER");
    }

    private void createRoleIfMissing(String roleName) {
        if (roleRepository.findByName(roleName).isEmpty()) {
            roleRepository.save(Role.builder().name(roleName).build());
        }
    }
}
