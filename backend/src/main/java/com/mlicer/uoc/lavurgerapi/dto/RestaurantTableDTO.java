package com.mlicer.uoc.lavurgerapi.dto;

public record RestaurantTableDTO(
        Long id,
        Integer tableNumber,
        String qrCode
) {}
