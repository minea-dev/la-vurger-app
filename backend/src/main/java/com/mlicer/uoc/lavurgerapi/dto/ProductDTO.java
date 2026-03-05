package com.mlicer.uoc.lavurgerapi.dto;

import java.math.BigDecimal;

public record ProductDTO(
        Long id,
        String name,
        String description,
        BigDecimal price,
        String category,
        String imageUrl,
        Boolean isAvailable
) {}
