package com.mlicer.uoc.lavurgerapi.dto;

public record UserDTO(
        Long id,
        String name,
        String email,
        String role,
        Boolean isActive
) {}
