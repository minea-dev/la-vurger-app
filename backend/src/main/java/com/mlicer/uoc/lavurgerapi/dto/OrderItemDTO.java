package com.mlicer.uoc.lavurgerapi.dto;

import java.math.BigDecimal;

public record OrderItemDTO(
        Long id,
        Long productId,
        ProductDTO product,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal,
        String notes
) {}