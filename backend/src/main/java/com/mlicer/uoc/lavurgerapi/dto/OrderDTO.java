package com.mlicer.uoc.lavurgerapi.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderDTO(
        Long id,
        String orderNumber,
        String status,
        String orderType,
        String paymentMethod,
        String paymentStatus,
        BigDecimal totalAmount,
        String customerComment,
        Long customerId,
        Long tableId,
        List<OrderItemDTO> items,
        LocalDateTime createdAt
) {}
