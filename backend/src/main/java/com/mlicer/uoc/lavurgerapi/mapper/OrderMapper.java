package com.mlicer.uoc.lavurgerapi.mapper;

import com.mlicer.uoc.lavurgerapi.dto.OrderDTO;
import com.mlicer.uoc.lavurgerapi.entity.Order;
import com.mlicer.uoc.lavurgerapi.entity.RestaurantTable;
import com.mlicer.uoc.lavurgerapi.entity.User;
import com.mlicer.uoc.lavurgerapi.entity.enums.OrderStatus;
import com.mlicer.uoc.lavurgerapi.entity.enums.OrderType;
import com.mlicer.uoc.lavurgerapi.entity.enums.PaymentMethod;
import com.mlicer.uoc.lavurgerapi.entity.enums.PaymentStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;

@Component
public class OrderMapper {

    /**
     * Converts an Order entity to an OrderDTO.
     * Used for sending data to the frontend or IntelliJ HTTP Client.
     */
    public OrderDTO toDTO(Order entity) {
        if (entity == null) {
            return null;
        }

        Long customerId = (entity.getCustomer() != null) ? entity.getCustomer().getId() : null;
        Long tableId = (entity.getRestaurantTable() != null) ? entity.getRestaurantTable().getId() : null;

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
                new ArrayList<>(),
                entity.getCreatedAt()
        );
    }

    /**
     * Converts an OrderDTO to an Order entity.
     * Includes safe Enum conversion and handles relationships for Customer and Table.
     */
    public Order toEntity(OrderDTO dto) {
        if (dto == null) return null;

        Order entity = new Order();
        entity.setId(dto.id());
        entity.setOrderNumber(dto.orderNumber());

        try {
            if (dto.status() != null)
                entity.setStatus(OrderStatus.valueOf(dto.status().toUpperCase()));
        } catch (IllegalArgumentException e) {
            System.err.println("Mapping Error: Invalid OrderStatus - " + dto.status());
        }

        try {
            if (dto.orderType() != null)
                entity.setOrderType(OrderType.valueOf(dto.orderType().toUpperCase()));
        } catch (IllegalArgumentException e) {
            System.err.println("Mapping Error: Invalid OrderType - " + dto.orderType());
        }

        try {
            if (dto.paymentMethod() != null)
                entity.setPaymentMethod(PaymentMethod.valueOf(dto.paymentMethod().toUpperCase()));
        } catch (IllegalArgumentException e) {
            System.err.println("Mapping Error: Invalid PaymentMethod - " + dto.paymentMethod());
        }

        try {
            if (dto.paymentStatus() != null)
                entity.setPaymentStatus(PaymentStatus.valueOf(dto.paymentStatus().toUpperCase()));
        } catch (IllegalArgumentException e) {
            System.err.println("Mapping Error: Invalid PaymentStatus - " + dto.paymentStatus());
        }

        entity.setTotalAmount(dto.totalAmount());
        entity.setCustomerComment(dto.customerComment());

        entity.setCreatedAt(dto.createdAt() != null ? dto.createdAt() : LocalDateTime.now());


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