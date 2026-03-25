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

import java.util.ArrayList;

@Component
public class OrderMapper {

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

    public Order toEntity(OrderDTO dto) {
        if (dto == null) {
            return null;
        }

        Order entity = new Order();
        entity.setId(dto.id());
        entity.setOrderNumber(dto.orderNumber());

        if (dto.status() != null) entity.setStatus(OrderStatus.valueOf(dto.status()));
        if (dto.orderType() != null) entity.setOrderType(OrderType.valueOf(dto.orderType()));
        if (dto.paymentMethod() != null) entity.setPaymentMethod(PaymentMethod.valueOf(dto.paymentMethod()));
        if (dto.paymentStatus() != null) entity.setPaymentStatus(PaymentStatus.valueOf(dto.paymentStatus()));

        entity.setTotalAmount(dto.totalAmount());
        entity.setCustomerComment(dto.customerComment());
        entity.setCreatedAt(dto.createdAt());

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