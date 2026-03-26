package com.mlicer.uoc.lavurgerapi.service;

import com.mlicer.uoc.lavurgerapi.dto.RestaurantTableDTO;
import com.mlicer.uoc.lavurgerapi.entity.RestaurantTable;
import com.mlicer.uoc.lavurgerapi.exception.ResourceNotFoundException;
import com.mlicer.uoc.lavurgerapi.mapper.RestaurantTableMapper;
import com.mlicer.uoc.lavurgerapi.repository.RestaurantTableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RestaurantTableService {

    @Autowired
    private RestaurantTableRepository tableRepository;

    @Autowired
    private RestaurantTableMapper tableMapper;

    public RestaurantTableDTO findById(Long id) {
        return tableRepository.findById(id)
                .map(tableMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + id));
    }

    public RestaurantTableDTO createTable(RestaurantTableDTO dto) {
        RestaurantTable entity = tableMapper.toEntity(dto);
        RestaurantTable saved = tableRepository.save(entity);
        return tableMapper.toDTO(saved);
    }

    public List<RestaurantTableDTO> findAll() {
        return tableRepository.findAll().stream()
                .map(tableMapper::toDTO)
                .collect(Collectors.toList());
    }
}