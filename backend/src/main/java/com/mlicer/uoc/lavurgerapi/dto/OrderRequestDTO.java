package com.mlicer.uoc.lavurgerapi.dto;

import com.mlicer.uoc.lavurgerapi.entity.enums.OrderType;
import com.mlicer.uoc.lavurgerapi.entity.enums.PaymentMethod;
import jakarta.validation.constraints.*;
import java.util.List;

public record OrderRequestDTO(
        Long tableId,

        @NotNull(message = "El tipus de comanda és obligatori")
        OrderType orderType,

        @NotNull(message = "El mètode de pagament és obligatori")
        PaymentMethod paymentMethod,

        @Size(max = 255, message = "El comentari no pot excedir els 255 caràcters")
        String customerComment,

        @Size(max = 50, message = "El nom no pot excedir els 50 caràcters")
        @Pattern(regexp = "^[a-zA-ZÀ-ÿ\\u00f1\\u00d1\\s]*$", message = "El nom només pot contenir lletres")
        String guestName,

        @Email(message = "El format del correu electrònic és invàlid")
        String guestEmail,

        @Pattern(regexp = "^[0-9]{9}$", message = "El telèfon ha de tindre exactament 9 dígits")
        String guestPhone,

        @NotEmpty(message = "The order must contain at least one item")
        List<OrderItemRequestDTO> items
) {}