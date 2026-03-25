package com.mlicer.uoc.lavurgerapi.service;

import com.mlicer.uoc.lavurgerapi.dto.OrderDTO;
import com.mlicer.uoc.lavurgerapi.entity.Order;
import com.mlicer.uoc.lavurgerapi.mapper.OrderMapper;
import com.mlicer.uoc.lavurgerapi.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderMapper orderMapper;

    public OrderDTO createOrder(OrderDTO orderDTO) {
        // 1. Convert DTO to Entity
        Order order = orderMapper.toEntity(orderDTO);

        // 2. Save Entity to database
        Order savedOrder = orderRepository.save(order);

        // 3. Convert saved Entity back to DTO and return
        return orderMapper.toDTO(savedOrder);
    }
}