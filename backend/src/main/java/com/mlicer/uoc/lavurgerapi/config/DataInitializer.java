package com.mlicer.uoc.lavurgerapi.config;

import com.mlicer.uoc.lavurgerapi.entity.User;
import com.mlicer.uoc.lavurgerapi.entity.enums.Role;
import com.mlicer.uoc.lavurgerapi.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByEmail("admin@lavurger.com").isEmpty()) {

                User admin = new User();
                admin.setName("Administrador Principal");
                admin.setEmail("admin@lavurger.com");
                admin.setPassword(passwordEncoder.encode("1234"));
                admin.setRole(Role.ADMIN);
                admin.setActive(true);

                userRepository.save(admin);
                System.out.println("✅ Usuari Admin creat per defecte a la base de dades de La Vurger.");
            }
        };
    }
}