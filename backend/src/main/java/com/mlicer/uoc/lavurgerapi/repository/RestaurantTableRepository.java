package com.mlicer.uoc.lavurgerapi.repository;

import com.mlicer.uoc.lavurgerapi.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {
}