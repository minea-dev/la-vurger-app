package com.mlicer.uoc.lavurgerapi.mapper;

import com.mlicer.uoc.lavurgerapi.dto.OrderDTO;
import com.mlicer.uoc.lavurgerapi.dto.OrderItemDTO;
import com.mlicer.uoc.lavurgerapi.entity.Order;
import com.mlicer.uoc.lavurgerapi.entity.RestaurantTable;
import com.mlicer.uoc.lavurgerapi.entity.User;
import com.mlicer.uoc.lavurgerapi.entity.enums.OrderStatus;
import com.mlicer.uoc.lavurgerapi.entity.enums.OrderType;
import com.mlicer.uoc.lavurgerapi.entity.enums.PaymentMethod;
import com.mlicer.uoc.lavurgerapi.entity.enums.PaymentStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper {

    private final ProductMapper productMapper;

    public OrderMapper(ProductMapper productMapper) {
        this.productMapper = productMapper;
    }

    public OrderDTO toDTO(Order entity) {
        if (entity == null) {
            return null;
        }

        Long customerId = null;
        String customerName = null;
        String customerEmail = null;
        String customerPhone = null;

        if (entity.getCustomer() != null) {
            customerId = entity.getCustomer().getId();
            customerName = entity.getCustomer().getName();
            customerEmail = entity.getCustomer().getEmail();
            customerPhone = entity.getCustomer().getPhone();
        }

        Long tableId = (entity.getRestaurantTable() != null) ? entity.getRestaurantTable().getId() : null;

        List<OrderItemDTO> itemsDTO = entity.getItems() != null ?
                entity.getItems().stream().map(item -> new OrderItemDTO(
                        item.getId(),
                        item.getProduct().getId(),
                        productMapper.toDTO(item.getProduct()),
                        item.getQuantity(),
                        item.getPrice(),
                        item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())),
                        item.getNotes()
                )).collect(Collectors.toList()) : new ArrayList<>();

        return new OrderDTO(
                entity.getId(),
                entity.getOrderNumber(),
                entity.getStatus() != null ? entity.getStatus().name() : null,
                entity.getOrderType() != null ? entity.getOrderType().name() : null,
                entity.getPaymentMethod() != null ? entity.getPaymentMethod().name() : null,
                entity.getPaymentStatus() != null ? entity.getPaymentStatus().name() : null,
                entity.getTotalAmount(),
                entity.getCustomerComment(),
                customerId,
                tableId,
                itemsDTO,
                entity.getCreatedAt(),

                entity.getGuestName(),
                entity.getGuestEmail(),
                entity.getGuestPhone(),

                customerName,
                customerEmail,
                customerPhone,

                entity.getEstimatedTime()
        );
    }

    public Order toEntity(OrderDTO dto) {
        if (dto == null) return null;

        Order entity = new Order();
        entity.setId(dto.id());
        entity.setOrderNumber(dto.orderNumber());

        try {
            if (dto.status() != null)
                entity.setStatus(OrderStatus.valueOf(dto.status().toUpperCase()));
            if (dto.orderType() != null)
                entity.setOrderType(OrderType.valueOf(dto.orderType().toUpperCase()));
            if (dto.paymentMethod() != null)
                entity.setPaymentMethod(PaymentMethod.valueOf(dto.paymentMethod().toUpperCase()));
            if (dto.paymentStatus() != null)
                entity.setPaymentStatus(PaymentStatus.valueOf(dto.paymentStatus().toUpperCase()));
        } catch (IllegalArgumentException e) {
            System.err.println("Mapping Error");
        }

        entity.setTotalAmount(dto.totalAmount());
        entity.setCustomerComment(dto.customerComment());
        entity.setCreatedAt(dto.createdAt() != null ? dto.createdAt() : LocalDateTime.now());

        entity.setGuestName(dto.guestName());
        entity.setGuestEmail(dto.guestEmail());
        entity.setGuestPhone(dto.guestPhone());

        if (dto.customerId() != null) {
            User customer = new User();
            customer.setId(dto.customerId());
            entity.setCustomer(customer);
        }

        if (dto.tableId() != null) {
            RestaurantTable table = new RestaurantTable();
            table.setId(dto.tableId());
            entity.setRestaurantTable(table);
        }

        return entity;
    }
}