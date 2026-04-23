package com.mlicer.uoc.lavurgerapi.dto;

public record CreateUserDTO(
        String name,
        String email,
        String password,
        String role // ADMIN, KITCHEN, MANAGER, CASHIER, CUSTOMER
) {}