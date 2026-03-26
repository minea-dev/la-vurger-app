package com.mlicer.uoc.lavurgerapi.service;

import com.mlicer.uoc.lavurgerapi.dto.OrderDTO;
import com.mlicer.uoc.lavurgerapi.entity.Order;
import com.mlicer.uoc.lavurgerapi.exception.ResourceNotFoundException;
import com.mlicer.uoc.lavurgerapi.mapper.OrderMapper;
import com.mlicer.uoc.lavurgerapi.repository.OrderRepository;
import com.mlicer.uoc.lavurgerapi.repository.RestaurantTableRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderMapper orderMapper;

    @Mock
    private RestaurantTableRepository tableRepository; // Inyectamos el repo que faltaba

    @InjectMocks
    private OrderService orderService;

    @Test
    @DisplayName("Hauria de crear una comanda correctament quan la taula existeix")
    void shouldCreateOrderAndReturnDTO() {
        OrderDTO inputDto = mock(OrderDTO.class);
        Order mockOrder = new Order();
        mockOrder.setId(100L);
        OrderDTO outputDto = mock(OrderDTO.class);

        when(inputDto.tableId()).thenReturn(1L);
        when(tableRepository.existsById(1L)).thenReturn(true);

        when(orderMapper.toEntity(inputDto)).thenReturn(mockOrder);
        when(orderRepository.save(mockOrder)).thenReturn(mockOrder);
        when(orderMapper.toDTO(mockOrder)).thenReturn(outputDto);

        OrderDTO result = orderService.createOrder(inputDto);

        assertNotNull(result, "La comanda no deuria ser nul·la");
        assertEquals(outputDto, result, "El DTO de la comanda no coincideix");

        verify(tableRepository, times(1)).existsById(1L);
        verify(orderRepository, times(1)).save(mockOrder);

        System.out.println("✅ Test superat: La comanda s'ha creat i guardat correctament amb validació de taula.");
    }

    @Test
    @DisplayName("Hauria de llançar ResourceNotFoundException quan la taula NO existeix")
    void shouldThrowExceptionWhenTableDoesNotExist() {
        OrderDTO inputDto = mock(OrderDTO.class);
        when(inputDto.tableId()).thenReturn(99L);

        when(tableRepository.existsById(99L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> {
            orderService.createOrder(inputDto);
        }, "Deuria llançar una excepció si la taula no es troba");

        verify(orderRepository, never()).save(any());

        System.out.println("✅ Test superat: El servei bloqueja correctament comandes en taules inexistents.");
    }
}