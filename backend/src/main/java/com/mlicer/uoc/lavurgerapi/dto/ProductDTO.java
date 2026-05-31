package com.mlicer.uoc.lavurgerapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record ProductDTO(
        Long id,

        @NotBlank(message = "Product name is required")
        String name,

        String description,

        String longDescription,

        @NotNull(message = "Price is required")
        @Positive(message = "Price must be greater than zero")
        BigDecimal price,

        @NotBlank(message = "Category is required")
        String category,

        String imageUrl,

        @NotNull(message = "Availability status is required")
        Boolean isAvailable
) {}