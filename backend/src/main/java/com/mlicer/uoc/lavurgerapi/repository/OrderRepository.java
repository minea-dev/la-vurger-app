package com.mlicer.uoc.lavurgerapi.repository;

import com.mlicer.uoc.lavurgerapi.entity.Order;
import com.mlicer.uoc.lavurgerapi.entity.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Order> findByStatusAndCreatedAtAfterOrderByIdDesc(OrderStatus status, LocalDateTime date);
    List<Order> findTop150ByOrderByIdDesc();
    List<Order> findByCreatedAtBetweenOrderByIdDesc(LocalDateTime start, LocalDateTime end);
}
