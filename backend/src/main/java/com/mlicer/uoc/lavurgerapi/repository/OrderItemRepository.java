package com.mlicer.uoc.lavurgerapi.repository;

import com.mlicer.uoc.lavurgerapi.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
