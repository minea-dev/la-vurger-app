package com.mlicer.uoc.lavurgerapi.service;

import com.mlicer.uoc.lavurgerapi.dto.RestaurantTableDTO;
import com.mlicer.uoc.lavurgerapi.entity.RestaurantTable;
import com.mlicer.uoc.lavurgerapi.mapper.RestaurantTableMapper;
import com.mlicer.uoc.lavurgerapi.repository.RestaurantTableRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RestaurantTableServiceTest {

    @Mock
    private RestaurantTableRepository tableRepository;

    @Mock
    private RestaurantTableMapper tableMapper;

    @InjectMocks
    private RestaurantTableService tableService;

    @Test
    @DisplayName("Hauria de crear una taula correctament")
    void shouldCreateTableSuccessfully() {
        RestaurantTableDTO inputDto = new RestaurantTableDTO(null, 1, "QR_01");
        RestaurantTable mockEntity = new RestaurantTable();
        mockEntity.setId(1L);
        RestaurantTableDTO outputDto = new RestaurantTableDTO(1L, 1, "QR_01");

        when(tableMapper.toEntity(any(RestaurantTableDTO.class))).thenReturn(mockEntity);
        when(tableRepository.save(any(RestaurantTable.class))).thenReturn(mockEntity);
        when(tableMapper.toDTO(any(RestaurantTable.class))).thenReturn(outputDto);

        RestaurantTableDTO result = tableService.createTable(inputDto);

        assertNotNull(result);
        assertEquals(1L, result.id());
        verify(tableRepository, times(1)).save(any());
        System.out.println("✅ Test superat: Creació de taula validada.");
    }

    @Test
    @DisplayName("Hauria de retornar totes les taules")
    void shouldReturnAllTables() {
        when(tableRepository.findAll()).thenReturn(List.of(new RestaurantTable(), new RestaurantTable()));

        List<RestaurantTableDTO> result = tableService.findAll();

        assertEquals(2, result.size());
        verify(tableRepository, times(1)).findAll();
        System.out.println("✅ Test superat: Llistat de taules validat.");
    }
}