package com.mlicer.uoc.lavurgerapi.service;

import com.mlicer.uoc.lavurgerapi.dto.OrderDTO;
import com.mlicer.uoc.lavurgerapi.dto.OrderItemRequestDTO;
import com.mlicer.uoc.lavurgerapi.dto.OrderRequestDTO;
import com.mlicer.uoc.lavurgerapi.entity.Order;
import com.mlicer.uoc.lavurgerapi.entity.Product;
import com.mlicer.uoc.lavurgerapi.entity.RestaurantTable;
import com.mlicer.uoc.lavurgerapi.entity.enums.OrderType;
import com.mlicer.uoc.lavurgerapi.entity.enums.PaymentMethod;
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
import org.springframework.messaging.simp.SimpMessagingTemplate;

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

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private OrderService orderService;

    @Test
    @DisplayName("Should create order successfully and return DTO")
    void shouldCreateOrderAndReturnDTO() {
        // GIVEN
        Long tableId = 1L;
        Long productId = 10L;

        OrderItemRequestDTO itemRequest = new OrderItemRequestDTO(productId, 2, "Sense ceba");

        OrderRequestDTO request = new OrderRequestDTO(
                tableId,
                OrderType.DINE_IN,
                PaymentMethod.COUNTER,
                "Test comment",
                "Guest",
                "guest@test.com",
                "123456789",
                List.of(itemRequest)
        );

        RestaurantTable mockTable = new RestaurantTable();
        mockTable.setId(tableId);

        Product mockProduct = new Product();
        mockProduct.setId(productId);
        mockProduct.setPrice(new BigDecimal("10.50"));
        mockProduct.setName("Burger");
        mockProduct.setAvailable(true);

        Order savedOrder = new Order();

        OrderDTO expectedResponse = new OrderDTO(
                1L, "#VURG-TEST", "RECEIVED", "DINE_IN", "COUNTER",
                "PENDING", new BigDecimal("21.00"), "Test comment", null, tableId, List.of(), null,
                "Guest", "guest@test.com", "123456789", null, null
        );

        when(tableRepository.findById(tableId)).thenReturn(Optional.of(mockTable));
        when(productRepository.findById(productId)).thenReturn(Optional.of(mockProduct));
        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);
        when(orderMapper.toDTO(savedOrder)).thenReturn(expectedResponse);

        // WHEN
        OrderDTO result = orderService.createOrder(request);

        // THEN
        assertEquals(expectedResponse, result);

        verify(tableRepository).findById(tableId);
        verify(productRepository).findById(productId);
        verify(orderRepository).save(any(Order.class));
        verify(messagingTemplate).convertAndSend(eq("/topic/orders"), any(OrderDTO.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when table does not exist")
    void shouldThrowExceptionWhenTableDoesNotExist() {
        // GIVEN
        OrderRequestDTO request = new OrderRequestDTO(99L, OrderType.DINE_IN, PaymentMethod.COUNTER, null, null, null, null, List.of());
        when(tableRepository.findById(99L)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThrows(ResourceNotFoundException.class, () -> orderService.createOrder(request));

        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when product does not exist")
    void shouldThrowExceptionWhenProductDoesNotExist() {
        // GIVEN
        Long tableId = 1L;
        OrderItemRequestDTO itemRequest = new OrderItemRequestDTO(500L, 1, null);

        OrderRequestDTO request = new OrderRequestDTO(tableId, OrderType.DINE_IN, PaymentMethod.COUNTER, null, null, null, null, List.of(itemRequest));

        when(tableRepository.findById(tableId)).thenReturn(Optional.of(new RestaurantTable()));
        when(productRepository.findById(500L)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThrows(ResourceNotFoundException.class, () -> orderService.createOrder(request));

        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("Should return order by ID successfully")
    void shouldReturnOrderByIdSuccessfully() {
        // GIVEN
        Long orderId = 1L;
        Order mockOrder = new Order();
        mockOrder.setId(orderId);

        OrderDTO expectedDTO = new OrderDTO(
                orderId, "#VURG-123", "RECEIVED", "DINE_IN", "COUNTER",
                "PENDING", new BigDecimal("15.50"), null, null, null, List.of(), null,
                null, null, null, null, null
        );

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(mockOrder));
        when(orderMapper.toDTO(mockOrder)).thenReturn(expectedDTO);

        // WHEN
        OrderDTO result = orderService.getOrderById(orderId);

        // THEN
        assertNotNull(result);
        assertEquals(expectedDTO, result);
        verify(orderRepository).findById(orderId);
        verify(orderMapper).toDTO(mockOrder);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when order does not exist")
    void shouldThrowExceptionWhenOrderDoesNotExist() {
        // GIVEN
        Long orderId = 99L;
        when(orderRepository.findById(orderId)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThrows(ResourceNotFoundException.class, () -> orderService.getOrderById(orderId));

        verify(orderRepository).findById(orderId);
        verifyNoInteractions(orderMapper);
    }
}