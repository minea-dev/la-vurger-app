package com.mlicer.uoc.lavurgerapi.dto;

import com.mlicer.uoc.lavurgerapi.entity.enums.Role;
import jakarta.validation.constraints.*;

public record UserRequestDTO(
        @NotBlank(message = "Name is required")
        @Size(min = 3, max = 50, message = "Name must be between 3 and 50 characters")
        @Pattern(regexp = "^[a-zA-ZÀ-ÿ\\u00f1\\u00d1\\s]*$", message = "Name can only contain letters")
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,}$",
                message = "Password must be at least 8 characters long and contain both letters and numbers")
        String password,

        @Pattern(regexp = "^$|^[0-9]{9}$", message = "Phone number must be exactly 9 digits or empty")
        String phone,

        @NotNull(message = "Role is required")
        Role role
) {}