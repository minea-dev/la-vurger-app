package com.mlicer.uoc.lavurgerapi.service;

import com.mlicer.uoc.lavurgerapi.dto.OrderDTO;
import com.mlicer.uoc.lavurgerapi.dto.OrderItemRequestDTO;
import com.mlicer.uoc.lavurgerapi.dto.OrderRequestDTO;
import com.mlicer.uoc.lavurgerapi.entity.Order;
import com.mlicer.uoc.lavurgerapi.entity.OrderItem;
import com.mlicer.uoc.lavurgerapi.entity.Product;
import com.mlicer.uoc.lavurgerapi.entity.RestaurantTable;
import com.mlicer.uoc.lavurgerapi.entity.enums.OrderStatus;
import com.mlicer.uoc.lavurgerapi.entity.enums.OrderType;
import com.mlicer.uoc.lavurgerapi.entity.enums.PaymentMethod;
import com.mlicer.uoc.lavurgerapi.exception.ResourceNotFoundException;
import com.mlicer.uoc.lavurgerapi.mapper.OrderMapper;
import com.mlicer.uoc.lavurgerapi.repository.OrderRepository;
import com.mlicer.uoc.lavurgerapi.repository.ProductRepository;
import com.mlicer.uoc.lavurgerapi.repository.RestaurantTableRepository;
import com.mlicer.uoc.lavurgerapi.repository.UserRepository;
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

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private OrderService orderService;

    @Test
    @DisplayName("Should create order successfully and return DTO")
    void shouldCreateOrderAndReturnDTO() {
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
                "Guest", "guest@test.com", "123456789", null, null, null, null
        );

        when(tableRepository.findById(tableId)).thenReturn(Optional.of(mockTable));
        when(productRepository.findById(productId)).thenReturn(Optional.of(mockProduct));
        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);
        when(orderMapper.toDTO(savedOrder)).thenReturn(expectedResponse);

        OrderDTO result = orderService.createOrder(request);

        assertEquals(expectedResponse, result);

        verify(tableRepository).findById(tableId);
        verify(productRepository).findById(productId);
        verify(orderRepository).save(any(Order.class));
        verify(messagingTemplate).convertAndSend(eq("/topic/orders"), any(OrderDTO.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when table does not exist")
    void shouldThrowExceptionWhenTableDoesNotExist() {
        OrderRequestDTO request = new OrderRequestDTO(99L, OrderType.DINE_IN, PaymentMethod.COUNTER, null, null, null, null, List.of());
        when(tableRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> orderService.createOrder(request));

        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when product does not exist")
    void shouldThrowExceptionWhenProductDoesNotExist() {
        Long tableId = 1L;
        OrderItemRequestDTO itemRequest = new OrderItemRequestDTO(500L, 1, null);

        OrderRequestDTO request = new OrderRequestDTO(tableId, OrderType.DINE_IN, PaymentMethod.COUNTER, null, null, null, null, List.of(itemRequest));

        when(tableRepository.findById(tableId)).thenReturn(Optional.of(new RestaurantTable()));
        when(productRepository.findById(500L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> orderService.createOrder(request));

        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("Should return order by ID successfully")
    void shouldReturnOrderByIdSuccessfully() {
        Long orderId = 1L;
        Order mockOrder = new Order();
        mockOrder.setId(orderId);

        OrderDTO expectedDTO = new OrderDTO(
                orderId, "#VURG-123", "RECEIVED", "DINE_IN", "COUNTER",
                "PENDING", new BigDecimal("15.50"), null, null, null, List.of(), null,
                null, null, null, null, null, null, null
        );

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(mockOrder));
        when(orderMapper.toDTO(mockOrder)).thenReturn(expectedDTO);

        OrderDTO result = orderService.getOrderById(orderId);

        assertNotNull(result);
        assertEquals(expectedDTO, result);
        verify(orderRepository).findById(orderId);
        verify(orderMapper).toDTO(mockOrder);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when order does not exist")
    void shouldThrowExceptionWhenOrderDoesNotExist() {
        Long orderId = 99L;
        when(orderRepository.findById(orderId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> orderService.getOrderById(orderId));

        verify(orderRepository).findById(orderId);
        verifyNoInteractions(orderMapper);
    }

    @Test
    @DisplayName("Should bind authenticated user to order when SecurityContext is present")
    void shouldBindAuthenticatedUserToOrder() {
        // GIVEN
        Long tableId = 1L;
        Long productId = 10L;
        String userEmail = "customer@lavurger.com";

        OrderItemRequestDTO itemRequest = new OrderItemRequestDTO(productId, 1, null);
        OrderRequestDTO request = new OrderRequestDTO(tableId, OrderType.DINE_IN, PaymentMethod.COUNTER, null, null, null, null, List.of(itemRequest));

        // Simulate Spring Security authentication context
        org.springframework.security.core.context.SecurityContext securityContext = mock(org.springframework.security.core.context.SecurityContext.class);
        org.springframework.security.core.Authentication authentication = mock(org.springframework.security.core.Authentication.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn("notAnonymous");
        when(authentication.getName()).thenReturn(userEmail);
        org.springframework.security.core.context.SecurityContextHolder.setContext(securityContext);

        com.mlicer.uoc.lavurgerapi.entity.User mockUser = new com.mlicer.uoc.lavurgerapi.entity.User();
        mockUser.setEmail(userEmail);

        Product mockProduct = new Product();
        mockProduct.setId(productId);
        mockProduct.setPrice(BigDecimal.TEN);
        mockProduct.setAvailable(true);

        when(tableRepository.findById(tableId)).thenReturn(Optional.of(new RestaurantTable()));
        when(productRepository.findById(productId)).thenReturn(Optional.of(mockProduct));
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(mockUser));
        when(orderRepository.save(any(Order.class))).thenReturn(new Order());

        OrderDTO expectedResponse = new OrderDTO(1L, "#VURG-1", "RECEIVED", "DINE_IN", "COUNTER", "PENDING", BigDecimal.TEN, null, null, tableId, List.of(), null, null, null, null, null, null, null, null);
        when(orderMapper.toDTO(any(Order.class))).thenReturn(expectedResponse);

        // WHEN
        OrderDTO result = orderService.createOrder(request);

        // THEN
        assertNotNull(result);
        verify(userRepository).findByEmail(userEmail);
        verify(orderRepository).save(any(Order.class));

        org.springframework.security.core.context.SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when product is currently unavailable")
    void shouldThrowExceptionWhenProductIsUnavailable() {
        // GIVEN
        Long tableId = 1L;
        Long productId = 10L;
        OrderItemRequestDTO itemRequest = new OrderItemRequestDTO(productId, 1, null);
        OrderRequestDTO request = new OrderRequestDTO(tableId, OrderType.DINE_IN, PaymentMethod.COUNTER, null, null, null, null, List.of(itemRequest));

        Product mockUnavailableProduct = new Product();
        mockUnavailableProduct.setId(productId);
        mockUnavailableProduct.setName("Burger Agotada");
        mockUnavailableProduct.setAvailable(false);

        when(tableRepository.findById(tableId)).thenReturn(Optional.of(new RestaurantTable()));
        when(productRepository.findById(productId)).thenReturn(Optional.of(mockUnavailableProduct));

        // WHEN & THEN
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> orderService.createOrder(request));
        assertTrue(exception.getMessage().contains("currently unavailable"));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("Should return empty list when getAllOrders receives an invalid status value")
    void shouldReturnEmptyListWhenStatusStringIsInvalid() {
        // WHEN
        List<OrderDTO> result = orderService.getAllOrders("ESTADO_FANTASMA");

        // THEN
        assertTrue(result.isEmpty());
        verifyNoInteractions(orderRepository);
    }

    @Test
    @DisplayName("Should return customer orders sorted by email context")
    void shouldReturnOrdersByCustomerEmail() {
        // GIVEN
        String email = "test@lavurger.com";
        com.mlicer.uoc.lavurgerapi.entity.User user = new com.mlicer.uoc.lavurgerapi.entity.User();
        user.setId(5L);

        Order mockOrder = new Order();
        mockOrder.setOrderType(OrderType.DINE_IN);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(orderRepository.findByCustomerIdOrderByCreatedAtDesc(5L)).thenReturn(List.of(mockOrder));
        when(orderMapper.toDTO(mockOrder)).thenReturn(new OrderDTO(1L, "#VURG-1", "RECEIVED", "DINE_IN", "COUNTER", "PENDING", BigDecimal.TEN, null, null, null, List.of(), null, null, null, null, null, null, null, null));

        // WHEN
        List<OrderDTO> result = orderService.getOrdersByCustomerEmail(email);

        // THEN
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        verify(orderRepository).findByCustomerIdOrderByCreatedAtDesc(5L);
    }

    @Test
    @DisplayName("Should automatically change status to COMPLETED if order is DINE_IN, PAID and switched to DISPATCHED")
    void shouldSwitchStatusToCompletedAutomatically() {
        // GIVEN
        Long orderId = 1L;
        Order order = new Order();
        order.setId(orderId);
        order.setOrderType(OrderType.DINE_IN);
        order.setPaymentStatus(com.mlicer.uoc.lavurgerapi.entity.enums.PaymentStatus.PAID);
        order.setStatus(OrderStatus.RECEIVED);

        OrderDTO expectedDTO = new OrderDTO(orderId, "#ORD-1", "COMPLETED", "DINE_IN", "APP", "PAID", BigDecimal.TEN, null, null, null, List.of(), null, null, null, null, null, null, null, null);

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(order);
        when(orderMapper.toDTO(order)).thenReturn(expectedDTO);

        // WHEN
        orderService.updateOrderStatus(orderId, "DISPATCHED");

        // THEN
        assertEquals(OrderStatus.COMPLETED, order.getStatus());
        verify(messagingTemplate).convertAndSend(eq("/topic/orders"), eq(expectedDTO));
        verify(messagingTemplate).convertAndSend(eq("/topic/orders/" + orderId), eq(expectedDTO));
    }

    @Test
    @DisplayName("Should clean raw quotes from payload when updating payment status")
    void shouldCleanQuotesAndUpdatePaymentStatusSuccessfully() {
        // GIVEN
        Long orderId = 2L;
        Order order = new Order();
        order.setId(orderId);
        order.setOrderType(OrderType.TAKEAWAY);
        order.setStatus(OrderStatus.PREPARING);

        OrderDTO expectedDTO = new OrderDTO(orderId, "#ORD-2", "PREPARING", "TAKEAWAY", "APP", "PAID", BigDecimal.TEN, null, null, null, List.of(), null, null, null, null, null, null, null, null);

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(order);
        when(orderMapper.toDTO(order)).thenReturn(expectedDTO);

        // WHEN
        orderService.updatePaymentStatus(orderId, "\"PAID\"");

        // THEN
        assertEquals(com.mlicer.uoc.lavurgerapi.entity.enums.PaymentStatus.PAID, order.getPaymentStatus());
    }


    @Test
    @DisplayName("Should calculate ETA minutes correctly for Takeaway based on active queue")
    void shouldCalculateEstimatedTimeInMinutes() {
        // GIVEN
        Product burger = new Product();
        burger.setCategory("BURGERS");
        Product side = new Product();
        side.setCategory("SIDES");

        OrderItem item1 = new OrderItem();
        item1.setProduct(burger);
        item1.setQuantity(1);

        OrderItem item2 = new OrderItem();
        item2.setProduct(side);
        item2.setQuantity(1);

        Order targetOrder = new Order();
        targetOrder.setId(99L);
        targetOrder.setOrderType(OrderType.TAKEAWAY);
        targetOrder.setItems(List.of(item1, item2));

        when(orderRepository.findByStatus(OrderStatus.RECEIVED)).thenReturn(List.of());
        when(orderRepository.findByStatus(OrderStatus.PREPARING)).thenReturn(List.of());

        // WHEN
        int calculatedMinutes = orderService.calculateEstimatedTimeInMinutes(targetOrder);

        // THEN
        assertEquals(16, calculatedMinutes);
    }


    @Test
    @DisplayName("Should query date range when tracking history orders")
    void shouldQueryDateRangeInHistory() {
        // GIVEN
        String startStr = "2026-05-01";
        String endStr = "2026-05-31";

        when(orderRepository.findByCreatedAtBetweenOrderByIdDesc(any(), any())).thenReturn(List.of());

        // WHEN
        orderService.getHistoryOrders(null, startStr, endStr);

        // THEN
        verify(orderRepository).findByCreatedAtBetweenOrderByIdDesc(any(), any());
        verify(orderRepository, never()).findTop150ByOrderByIdDesc();
    }
}