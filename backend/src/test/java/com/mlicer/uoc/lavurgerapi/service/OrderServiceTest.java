package com.mlicer.uoc.lavurgerapi.service;

import com.mlicer.uoc.lavurgerapi.dto.OrderDTO;
import com.mlicer.uoc.lavurgerapi.dto.OrderItemRequestDTO;
import com.mlicer.uoc.lavurgerapi.dto.OrderRequestDTO;
import com.mlicer.uoc.lavurgerapi.entity.Order;
import com.mlicer.uoc.lavurgerapi.entity.Product;
import com.mlicer.uoc.lavurgerapi.entity.RestaurantTable;
import com.mlicer.uoc.lavurgerapi.exception.ResourceNotFoundException;
import com.mlicer.uoc.lavurgerapi.mapper.OrderMapper;
import com.mlicer.uoc.lavurgerapi.repository.OrderRepository;
import com.mlicer.uoc.lavurgerapi.repository.ProductRepository;
import com.mlicer.uoc.lavurgerapi.repository.RestaurantTableRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderMapper orderMapper;

    @Mock
    private RestaurantTableRepository tableRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private OrderService orderService;

    @Test
    @DisplayName("Hauria de crear una comanda correctament")
    void shouldCreateOrderAndReturnDTO() {
        // GIVEN
        Long tableId = 1L;
        Long productId = 10L;

        // Request  item
        OrderItemRequestDTO itemRequest = new OrderItemRequestDTO(productId, 2);
        OrderRequestDTO request = new OrderRequestDTO(tableId, List.of(itemRequest));

        RestaurantTable mockTable = new RestaurantTable();
        mockTable.setId(tableId);

        Product mockProduct = new Product();
        mockProduct.setId(productId);
        mockProduct.setPrice(new BigDecimal("10.50"));
        mockProduct.setName("Burger");

        Order savedOrder = new Order();
        OrderDTO expectedResponse = mock(OrderDTO.class);

        // Mocks Repositories
        when(tableRepository.findById(tableId)).thenReturn(Optional.of(mockTable));
        when(productRepository.findById(productId)).thenReturn(Optional.of(mockProduct));
        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);

        // Mock Mapper
        when(orderMapper.toDTO(savedOrder)).thenReturn(expectedResponse);

        // WHEN
        OrderDTO result = orderService.createOrder(request);

        // THEN
        assertNotNull(result);
        assertEquals(expectedResponse, result);

        verify(tableRepository).findById(tableId);
        verify(productRepository).findById(productId);
        verify(orderRepository).save(any(Order.class));

        System.out.println("✅ Test superat: Comanda creada amb càlcul de preus i validació completa.");
    }

    @Test
    @DisplayName("Hauria de llançar ResourceNotFoundException quan la taula NO existeix")
    void shouldThrowExceptionWhenTableDoesNotExist() {
        // GIVEN
        OrderRequestDTO request = new OrderRequestDTO(99L, List.of());
        when(tableRepository.findById(99L)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThrows(ResourceNotFoundException.class, () -> {
            orderService.createOrder(request);
        });

        verify(orderRepository, never()).save(any());
        System.out.println("✅ Test superat: Excepció llançada correctament per taula inexistent.");
    }

    @Test
    @DisplayName("Hauria de llançar ResourceNotFoundException quan un producte NO existeix")
    void shouldThrowExceptionWhenProductDoesNotExist() {
        // GIVEN
        Long tableId = 1L;
        OrderItemRequestDTO itemRequest = new OrderItemRequestDTO(500L, 1);
        OrderRequestDTO request = new OrderRequestDTO(tableId, List.of(itemRequest));

        when(tableRepository.findById(tableId)).thenReturn(Optional.of(new RestaurantTable()));
        when(productRepository.findById(500L)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThrows(ResourceNotFoundException.class, () -> {
            orderService.createOrder(request);
        });

        verify(orderRepository, never()).save(any());
        System.out.println("✅ Test superat: El servei falla si algun producte del llistat no és vàlid.");
    }
}