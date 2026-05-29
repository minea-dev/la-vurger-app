package com.mlicer.uoc.lavurgerapi.mapper;

import com.mlicer.uoc.lavurgerapi.dto.ProductDTO;
import com.mlicer.uoc.lavurgerapi.entity.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public ProductDTO toDTO(Product entity) {
        if (entity == null) {
            return null;
        }

        return new ProductDTO(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getLongDescription(),
                entity.getPrice(),
                entity.getCategory(),
                entity.getImageUrl(),
                entity.isAvailable()
        );
    }

    public Product toEntity(ProductDTO dto) {
        if (dto == null) {
            return null;
        }

        Product entity = new Product();
        entity.setId(dto.id());
        entity.setName(dto.name());
        entity.setDescription(dto.description());
        entity.setLongDescription(dto.longDescription());
        entity.setPrice(dto.price());
        entity.setCategory(dto.category());
        entity.setImageUrl(dto.imageUrl());

        entity.setAvailable(dto.isAvailable() != null ? dto.isAvailable() : true);

        return entity;
    }
}