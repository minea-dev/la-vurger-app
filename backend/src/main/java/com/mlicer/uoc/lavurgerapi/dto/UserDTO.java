package com.mlicer.uoc.lavurgerapi.dto;

import java.time.LocalDateTime;

public record UserDTO(
        Long id,
        String name,
        String email,
        String phone,
        String role,
        Boolean isActive,
        LocalDateTime lastAccess
) {}
