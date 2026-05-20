package com.mlicer.uoc.lavurgerapi.service;

import com.mlicer.uoc.lavurgerapi.dto.OrderDTO;
import com.mlicer.uoc.lavurgerapi.dto.OrderRequestDTO;
import com.mlicer.uoc.lavurgerapi.entity.Order;
import com.mlicer.uoc.lavurgerapi.entity.OrderItem;
import com.mlicer.uoc.lavurgerapi.entity.Product;
import com.mlicer.uoc.lavurgerapi.entity.RestaurantTable;
import com.mlicer.uoc.lavurgerapi.entity.User;
import com.mlicer.uoc.lavurgerapi.entity.enums.OrderStatus;
import com.mlicer.uoc.lavurgerapi.entity.enums.OrderType;
import com.mlicer.uoc.lavurgerapi.entity.enums.PaymentStatus;
import com.mlicer.uoc.lavurgerapi.entity.enums.PaymentMethod;
import com.mlicer.uoc.lavurgerapi.exception.ResourceNotFoundException;
import com.mlicer.uoc.lavurgerapi.mapper.OrderMapper;
import com.mlicer.uoc.lavurgerapi.repository.OrderRepository;
import com.mlicer.uoc.lavurgerapi.repository.ProductRepository;
import com.mlicer.uoc.lavurgerapi.repository.RestaurantTableRepository;
import com.mlicer.uoc.lavurgerapi.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private RestaurantTableRepository tableRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public OrderDTO createOrder(OrderRequestDTO orderRequest) {
        Order order = new Order();

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            String currentEmail = authentication.getName();
            userRepository.findByEmail(currentEmail).ifPresent(user -> {
                order.setCustomer(user);
                order.setCustomerEmail(user.getEmail());
            });
        }

        if (orderRequest.tableId() != null) {
            RestaurantTable table = tableRepository.findById(orderRequest.tableId())
                    .orElseThrow(() -> new ResourceNotFoundException("Table not found with ID: " + orderRequest.tableId()));
            order.setRestaurantTable(table);
        } else {
            order.setRestaurantTable(null);
        }

        order.setOrderType(orderRequest.orderType() != null ? orderRequest.orderType() : OrderType.DINE_IN);
        order.setPaymentMethod(orderRequest.paymentMethod() != null ? orderRequest.paymentMethod() : PaymentMethod.COUNTER);

        order.setCustomerComment(orderRequest.customerComment());

        order.setStatus(OrderStatus.RECEIVED);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        if (order.getPaymentMethod() == PaymentMethod.APP) {
            order.setPaymentStatus(PaymentStatus.PAID);
        } else {
            order.setPaymentStatus(PaymentStatus.PENDING);
        }
        order.setOrderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> items = new ArrayList<>();

        for (var itemReq : orderRequest.items()) {
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + itemReq.productId()));

            if (!product.isAvailable()) {
                throw new IllegalArgumentException("Product '" + product.getName() + "' is currently unavailable.");
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemReq.quantity());

            orderItem.setNotes(itemReq.notes());

            BigDecimal itemPrice = product.getPrice();
            orderItem.setPrice(itemPrice);

            BigDecimal subtotal = itemPrice.multiply(BigDecimal.valueOf(itemReq.quantity()));
            totalAmount = totalAmount.add(subtotal);

            items.add(orderItem);
        }

        order.setItems(items);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);
        OrderDTO orderDTO = orderMapper.toDTO(savedOrder);

        messagingTemplate.convertAndSend("/topic/orders", orderDTO);

        return orderDTO;
    }

    public List<OrderDTO> getAllOrders(String status) {
        List<Order> orders;
        if (status != null && !status.isEmpty()) {
            try {
                OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase().trim());
                orders = orderRepository.findByStatus(orderStatus);
            } catch (IllegalArgumentException e) {
                return List.of();
            }
        } else {
            orders = orderRepository.findAll();
        }
        return orders.stream().map(orderMapper::toDTO).collect(Collectors.toList());
    }

    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        return orderMapper.toDTO(order);
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long id, String newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        try {
            OrderStatus statusEnum = OrderStatus.valueOf(newStatus.toUpperCase().trim());
            order.setStatus(statusEnum);
            order.setUpdatedAt(LocalDateTime.now());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status value: " + newStatus);
        }

        OrderDTO updatedOrderDTO = orderMapper.toDTO(orderRepository.save(order));

        messagingTemplate.convertAndSend("/topic/orders", updatedOrderDTO);
        messagingTemplate.convertAndSend("/topic/orders/" + id, updatedOrderDTO);

        return updatedOrderDTO;
    }

    @Transactional
    public OrderDTO updatePaymentStatus(Long id, String newPaymentStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        try {
            String cleanStatus = newPaymentStatus.replace("\"", "").toUpperCase().trim();
            PaymentStatus statusEnum = PaymentStatus.valueOf(cleanStatus);

            order.setPaymentStatus(statusEnum);
            order.setUpdatedAt(LocalDateTime.now());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid payment status value: " + newPaymentStatus);
        }

        OrderDTO updatedOrderDTO = orderMapper.toDTO(orderRepository.save(order));

        messagingTemplate.convertAndSend("/topic/orders", updatedOrderDTO);
        messagingTemplate.convertAndSend("/topic/orders/" + id, updatedOrderDTO);

        return updatedOrderDTO;
    }

    public List<OrderDTO> getOrdersByCustomerEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(orderMapper::toDTO)
                .collect(Collectors.toList());
    }
}