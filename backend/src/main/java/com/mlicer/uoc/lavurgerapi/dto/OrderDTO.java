package com.mlicer.uoc.lavurgerapi.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderDTO(
        Long id,

        @NotBlank(message = "Order number is required")
        String orderNumber,

        String status,

        @NotBlank(message = "Order type is required")
        String orderType,

        String paymentMethod,
        String paymentStatus,

        @NotNull(message = "Total amount is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Total amount cannot be negative")
        @Digits(integer = 8, fraction = 2)
        BigDecimal totalAmount,

        String customerComment,
        Long customerId,
        Long tableId,
        List<OrderItemDTO> items,
        LocalDateTime createdAt
) {}