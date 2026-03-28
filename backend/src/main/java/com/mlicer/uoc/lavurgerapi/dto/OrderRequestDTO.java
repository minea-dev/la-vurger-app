package com.mlicer.uoc.lavurgerapi.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record OrderRequestDTO(
        @NotNull(message = "Table ID is required")
        Long tableId,

        @NotEmpty(message = "The order must contain at least one item")
        List<OrderItemRequestDTO> items
) {}