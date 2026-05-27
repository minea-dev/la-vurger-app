package com.mlicer.uoc.lavurgerapi;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mlicer.uoc.lavurgerapi.dto.OrderDTO;
import com.mlicer.uoc.lavurgerapi.dto.OrderItemRequestDTO;
import com.mlicer.uoc.lavurgerapi.dto.OrderRequestDTO;
import com.mlicer.uoc.lavurgerapi.entity.Product;
import com.mlicer.uoc.lavurgerapi.entity.RestaurantTable;
import com.mlicer.uoc.lavurgerapi.entity.User;
import com.mlicer.uoc.lavurgerapi.entity.enums.OrderType;
import com.mlicer.uoc.lavurgerapi.entity.enums.PaymentMethod;
import com.mlicer.uoc.lavurgerapi.entity.enums.Role;
import com.mlicer.uoc.lavurgerapi.repository.OrderRepository;
import com.mlicer.uoc.lavurgerapi.repository.OrderItemRepository;
import com.mlicer.uoc.lavurgerapi.repository.ProductRepository;
import com.mlicer.uoc.lavurgerapi.repository.RestaurantTableRepository;
import com.mlicer.uoc.lavurgerapi.repository.UserRepository;
import com.mlicer.uoc.lavurgerapi.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
public class OrderControllerIT {

    @MockitoBean
    private JwtUtils jwtUtils;

    @MockitoBean
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RestaurantTableRepository tableRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    private Long savedTableId;
    private Long savedUserId;
    private Long savedProductId;

    @BeforeEach
    void setUp() {
        orderItemRepository.deleteAll();
        orderRepository.deleteAll();
        tableRepository.deleteAll();
        userRepository.deleteAll();
        productRepository.deleteAll();

        RestaurantTable table = new RestaurantTable();
        table.setTableNumber(1);
        table.setQrCode("QR_1");
        this.savedTableId = tableRepository.save(table).getId();

        User user = new User();
        user.setName("Test User");
        user.setEmail("test@lavurger.com");
        user.setPassword("password");
        user.setRole(Role.valueOf("CASHIER"));
        user.setActive(true);
        this.savedUserId = userRepository.save(user).getId();

        Product product = new Product();
        product.setName("Classic Burger");
        product.setPrice(new BigDecimal("12.75"));
        product.setCategory("Burgers");
        product.setAvailable(true);
        this.savedProductId = productRepository.save(product).getId();
    }

    @Test
    @DisplayName("Should create order successfully with 201 Created")
    void shouldCreateOrderSuccessfully() throws Exception {

        OrderItemRequestDTO mockItem = new OrderItemRequestDTO(this.savedProductId, 2, "No onions");

        OrderRequestDTO validOrder = new OrderRequestDTO(
                this.savedTableId,
                OrderType.DINE_IN,
                PaymentMethod.COUNTER,
                "No onions",
                null,
                null,
                null,
                List.of(mockItem)
        );

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validOrder)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderNumber").isNotEmpty());
    }

    @Test
    @DisplayName("Should filter orders by status RECEIVED")
    void shouldFilterOrdersByStatus() throws Exception {

        OrderItemRequestDTO mockItem = new OrderItemRequestDTO(this.savedProductId, 1, null);

        OrderRequestDTO newOrder = new OrderRequestDTO(
                this.savedTableId,
                OrderType.DINE_IN,
                PaymentMethod.COUNTER,
                null,
                null,
                null,
                null,
                List.of(mockItem)
        );

        String responseBody = mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newOrder)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        OrderDTO savedOrder = objectMapper.readValue(responseBody, OrderDTO.class);
        String generatedOrderNumber = savedOrder.orderNumber();

        mockMvc.perform(get("/api/orders")
                        .param("status", "RECEIVED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].orderNumber").value(generatedOrderNumber));
    }

    @Test
    @DisplayName("Should return 400 when order items list is empty")
    void shouldReturn400WhenItemsListIsEmpty() throws Exception {

        OrderRequestDTO badOrder = new OrderRequestDTO(
                this.savedTableId,
                OrderType.DINE_IN,
                PaymentMethod.COUNTER,
                "Empty Items Test",
                null,
                null,
                null,
                List.of()
        );

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badOrder)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return 404 when order ID does not exist")
    void shouldReturn404WhenOrderNotFound() throws Exception {
        mockMvc.perform(get("/api/orders/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should return empty list when filtering by non-existent status in DB")
    void shouldReturnEmptyListForOtherStatus() throws Exception {
        mockMvc.perform(get("/api/orders")
                        .param("status", "CANCELLED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("Should return 400 when order is created with missing mandatory fields")
    void shouldReturn400WhenMissingMandatoryFields() throws Exception {
        String emptyOrder = "{\"orderType\": \"DINE_IN\"}";

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(emptyOrder))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return order by ID successfully with 200 OK")
    void shouldReturnOrderByIdSuccessfully() throws Exception {

        OrderItemRequestDTO mockItem = new OrderItemRequestDTO(this.savedProductId, 2, null);

        OrderRequestDTO newOrder = new OrderRequestDTO(
                this.savedTableId,
                OrderType.DINE_IN,
                PaymentMethod.COUNTER,
                null,
                null,
                null,
                null,
                List.of(mockItem)
        );

        String responseBody = mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newOrder)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        OrderDTO savedOrder = objectMapper.readValue(responseBody, OrderDTO.class);
        Long createdId = savedOrder.id();
        String generatedOrderNumber = savedOrder.orderNumber();

        mockMvc.perform(get("/api/orders/" + createdId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(createdId.intValue()))
                .andExpect(jsonPath("$.orderNumber").value(generatedOrderNumber));
    }
}