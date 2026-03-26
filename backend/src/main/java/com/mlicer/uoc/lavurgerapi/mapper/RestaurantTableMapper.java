package com.mlicer.uoc.lavurgerapi.mapper;

import com.mlicer.uoc.lavurgerapi.dto.RestaurantTableDTO;
import com.mlicer.uoc.lavurgerapi.entity.RestaurantTable;
import org.springframework.stereotype.Component;

@Component
public class RestaurantTableMapper {

    public RestaurantTableDTO toDTO(RestaurantTable entity) {
        if (entity == null) return null;
        return new RestaurantTableDTO(
                entity.getId(),
                entity.getTableNumber(),
                entity.getQrCode()
        );
    }

    public RestaurantTable toEntity(RestaurantTableDTO dto) {
        if (dto == null) return null;
        RestaurantTable entity = new RestaurantTable();
        entity.setId(dto.id());
        entity.setTableNumber(dto.tableNumber());
        entity.setQrCode(dto.qrCode());
        return entity;
    }
}