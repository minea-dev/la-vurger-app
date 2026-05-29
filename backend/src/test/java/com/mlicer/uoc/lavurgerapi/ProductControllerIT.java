package com.mlicer.uoc.lavurgerapi;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mlicer.uoc.lavurgerapi.dto.ProductDTO;
import com.mlicer.uoc.lavurgerapi.repository.ProductRepository;
import com.mlicer.uoc.lavurgerapi.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
public class ProductControllerIT {

    @MockitoBean
    private JwtUtils jwtUtils;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();
    }

    @Test
    @DisplayName("Should create a product successfully")
    void shouldCreateProduct() throws Exception {
        // GIVEN: Valid product
        ProductDTO validProduct = new ProductDTO(
                null, "Cheese Burger", "Classic burger", "Long desc with ingredients",
                new BigDecimal("12.50"), "BURGERS", "url_image", true
        );

        // WHEN & THEN
        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validProduct)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Cheese Burger"))
                .andExpect(jsonPath("$.price").value(12.50));
    }

    @Test
    @DisplayName("Should return 400 when product name is blank")
    void shouldReturn400WhenNameIsBlank() throws Exception {
        // GIVEN: Empty name
        ProductDTO invalidProduct = new ProductDTO(
                null, "", "Description", "Long Desc",
                new BigDecimal("10.00"), "BURGERS", "url", true
        );

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidProduct)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.name").value("Product name is required"));
    }

    @Test
    @DisplayName("Should return 400 when price is zero or negative")
    void shouldReturn400WhenPriceIsInvalid() throws Exception {
        // GIVEN: Negative price
        ProductDTO cheapProduct = new ProductDTO(
                null, "Cheap Burger", "Error", null,
                new BigDecimal("-1.00"), "BURGERS", "url", true
        );

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cheapProduct)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.price").value("Price must be greater than zero"));
    }
}