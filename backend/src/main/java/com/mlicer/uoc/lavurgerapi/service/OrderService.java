package com.mlicer.uoc.lavurgerapi.service;

import com.mlicer.uoc.lavurgerapi.dto.OrderDTO;
import com.mlicer.uoc.lavurgerapi.entity.Order;
import com.mlicer.uoc.lavurgerapi.entity.enums.OrderStatus;
import com.mlicer.uoc.lavurgerapi.exception.ResourceNotFoundException;
import com.mlicer.uoc.lavurgerapi.mapper.OrderMapper;
import com.mlicer.uoc.lavurgerapi.repository.OrderRepository;
import com.mlicer.uoc.lavurgerapi.repository.RestaurantTableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private RestaurantTableRepository tableRepository;

    public OrderDTO createOrder(OrderDTO orderDTO) {
        if (orderDTO.tableId() != null && !tableRepository.existsById(orderDTO.tableId())) {
            throw new ResourceNotFoundException("Table not found with id: " + orderDTO.tableId());
        }

        Order order = orderMapper.toEntity(orderDTO);

        if (orderDTO.status() != null) {
            order.setStatus(OrderStatus.valueOf(orderDTO.status().toUpperCase()));
        } else {
            order.setStatus(OrderStatus.RECEIVED);
        }

        Order savedOrder = orderRepository.save(order);

        return orderMapper.toDTO(savedOrder);
    }

    public List<OrderDTO> getAllOrders(String status) {
        List<Order> orders;

        if (status != null && !status.isEmpty()) {
            try {
                OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase().trim());
                orders = orderRepository.findByStatus(orderStatus);
            } catch (IllegalArgumentException e) {
                return List.of();
            }
        } else {
            orders = orderRepository.findAll();
        }

        return orders.stream()
                .map(orderMapper::toDTO)
                .collect(Collectors.toList());
    }

    public OrderDTO updateOrderStatus(Long id, String newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        try {
            order.setStatus(OrderStatus.valueOf(newStatus.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status value: " + newStatus);
        }

        Order updatedOrder = orderRepository.save(order);
        return orderMapper.toDTO(updatedOrder);
    }
}