package com.mlicer.uoc.lavurgerapi.service;

import com.mlicer.uoc.lavurgerapi.dto.OrderDTO;
import com.mlicer.uoc.lavurgerapi.entity.Order;
import com.mlicer.uoc.lavurgerapi.mapper.OrderMapper;
import com.mlicer.uoc.lavurgerapi.repository.OrderRepository;
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

    @InjectMocks
    private OrderService orderService;

    @Test
    void shouldCreateOrderAndReturnDTO() {

        OrderDTO inputDto = mock(OrderDTO.class);
        Order mockOrder = new Order();
        mockOrder.setId(100L);
        OrderDTO outputDto = mock(OrderDTO.class);

        when(orderMapper.toEntity(inputDto)).thenReturn(mockOrder);
        when(orderRepository.save(mockOrder)).thenReturn(mockOrder);
        when(orderMapper.toDTO(mockOrder)).thenReturn(outputDto);

        OrderDTO result = orderService.createOrder(inputDto);

        assertNotNull(result, "La comanda no deuria ser nul·la");
        assertEquals(outputDto, result, "El DTO de la comanda no coincideix");

        verify(orderMapper, times(1)).toEntity(inputDto);
        verify(orderRepository, times(1)).save(mockOrder);
        verify(orderMapper, times(1)).toDTO(mockOrder);

        System.out.println("✅ Test superat: La comanda s'ha creat i guardat correctament.");
    }
}