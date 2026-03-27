package com.mlicer.uoc.lavurgerapi;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mlicer.uoc.lavurgerapi.dto.OrderDTO;
import com.mlicer.uoc.lavurgerapi.entity.RestaurantTable;
import com.mlicer.uoc.lavurgerapi.entity.User;
import com.mlicer.uoc.lavurgerapi.entity.enums.Role;
import com.mlicer.uoc.lavurgerapi.repository.OrderRepository;
import com.mlicer.uoc.lavurgerapi.repository.OrderItemRepository;
import com.mlicer.uoc.lavurgerapi.repository.RestaurantTableRepository;
import com.mlicer.uoc.lavurgerapi.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
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

    private Long savedTableId;
    private Long savedUserId;

    @BeforeEach
    void setUp() {
        orderItemRepository.deleteAll();
        orderRepository.deleteAll();
        tableRepository.deleteAll();
        userRepository.deleteAll();

        RestaurantTable table = new RestaurantTable();
        table.setTableNumber(1);
        table.setQrCode("QR_1");
        this.savedTableId = tableRepository.save(table).getId();

        User user = new User();
        user.setName("Test User");
        user.setEmail("test@lavurger.com");
        user.setPassword("password");
        user.setRole(Role.valueOf("CUSTOMER"));
        user.setActive(true);
        this.savedUserId = userRepository.save(user).getId();
    }

    @Test
    @DisplayName("Should create order successfully with 201 Created")
    void shouldCreateOrderSuccessfully() throws Exception {
        OrderDTO validOrder = new OrderDTO(
                null, "#VURG-OK-01", "RECEIVED", "DINE_IN",
                "COUNTER", "PENDING", new BigDecimal("25.50"),
                "No onions", this.savedUserId, this.savedTableId, List.of(), null
        );

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validOrder)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderNumber").value("#VURG-OK-01"));
    }

    @Test
    @DisplayName("Should filter orders by status RECEIVED")
    void shouldFilterOrdersByStatus() throws Exception {
        OrderDTO newOrder = new OrderDTO(
                null, "#FILT-01", "RECEIVED", "DINE_IN",
                "COUNTER", "PAID", new BigDecimal("15.00"),
                null, this.savedUserId, this.savedTableId, List.of(), null
        );

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newOrder)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/orders")
                        .param("status", "RECEIVED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("RECEIVED"))
                .andExpect(jsonPath("$[0].orderNumber").value("#FILT-01"));
    }

    @Test
    @DisplayName("Should return 400 when amount is negative")
    void shouldReturn400WhenAmountIsNegative() throws Exception {
        OrderDTO badOrder = new OrderDTO(
                null, "#TEST-ERR", "RECEIVED", "DINE_IN",
                "COUNTER", "PENDING", new BigDecimal("-10.00"),
                "Negative amount test", this.savedUserId, this.savedTableId, List.of(), null
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
}