package com.mlicer.uoc.lavurgerapi.dto;

import com.mlicer.uoc.lavurgerapi.entity.enums.OrderType;
import com.mlicer.uoc.lavurgerapi.entity.enums.PaymentMethod;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record OrderRequestDTO(
        Long tableId,
        OrderType orderType,
        PaymentMethod paymentMethod,
        String customerComment,

        @NotEmpty(message = "The order must contain at least one item")
        List<OrderItemRequestDTO> items
) {}