package com.mlicer.uoc.lavurgerapi.service;

import com.mlicer.uoc.lavurgerapi.dto.RestaurantTableDTO;
import com.mlicer.uoc.lavurgerapi.entity.RestaurantTable;
import com.mlicer.uoc.lavurgerapi.exception.ResourceNotFoundException;
import com.mlicer.uoc.lavurgerapi.mapper.RestaurantTableMapper;
import com.mlicer.uoc.lavurgerapi.repository.RestaurantTableRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

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
    @DisplayName("Should create a table successfully")
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
    }

    @Test
    @DisplayName("Should return all tables")
    void shouldReturnAllTables() {
        RestaurantTable table1 = new RestaurantTable();
        RestaurantTable table2 = new RestaurantTable();
        RestaurantTableDTO dto = new RestaurantTableDTO(1L, 1, "QR_01");

        when(tableRepository.findAll()).thenReturn(List.of(table1, table2));
        when(tableMapper.toDTO(any(RestaurantTable.class))).thenReturn(dto);

        List<RestaurantTableDTO> result = tableService.findAll();

        assertEquals(2, result.size());
        verify(tableRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should return table by ID successfully")
    void shouldFindTableByIdSuccessfully() {
        Long id = 1L;
        RestaurantTable table = new RestaurantTable();
        RestaurantTableDTO dto = new RestaurantTableDTO(id, 3, "QR_3");

        when(tableRepository.findById(id)).thenReturn(Optional.of(table));
        when(tableMapper.toDTO(table)).thenReturn(dto);

        RestaurantTableDTO result = tableService.findById(id);

        assertNotNull(result);
        assertEquals(3, result.tableNumber());
        verify(tableRepository).findById(id);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when table does not exist")
    void shouldThrowExceptionWhenTableNotFound() {
        Long id = 99L;
        when(tableRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> tableService.findById(id));
        verify(tableRepository).findById(id);
        verifyNoInteractions(tableMapper);
    }
}