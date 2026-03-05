package com.mlicer.uoc.lavurgerapi.dto;

public record OrderItemDTO(
        Long productId,
        String productName,
        Integer quantity,
        String notes
) {}