package com.mlicer.uoc.lavurgerapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mlicer.uoc.lavurgerapi.dto.ProductAvailabilityDTO;
import com.mlicer.uoc.lavurgerapi.dto.ProductDTO;
import com.mlicer.uoc.lavurgerapi.entity.Product;
import com.mlicer.uoc.lavurgerapi.repository.ProductRepository;
import com.mlicer.uoc.lavurgerapi.security.JwtUtils;
import com.mlicer.uoc.lavurgerapi.service.ImageStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "aws.s3.bucket-name=lavurger-test-bucket",
                "aws.s3.region=eu-west-3",
                "aws.s3.access-key=mock-access-key",
                "aws.s3.secret-key=mock-secret-key"
        }
)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
@WithMockUser(roles = "ADMIN")
public class ProductControllerIT {

    @MockitoBean
    private JwtUtils jwtUtils;

    @MockitoBean
    private ImageStorageService imageStorageService;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    private Long savedProductId;

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();

        Product product = new Product();
        product.setName("Cheese Burger");
        product.setDescription("Classic burger");
        product.setLongDescription("Long desc with ingredients");
        product.setPrice(new BigDecimal("12.50"));
        product.setCategory("BURGERS");
        product.setImageUrl("https://s3.amazonaws.com/bucket/burger.jpg");
        product.setAvailable(true);

        this.savedProductId = productRepository.save(product).getId();
    }

    @Test
    @DisplayName("Should create a product successfully")
    void shouldCreateProduct() throws Exception {
        ProductDTO validProduct = new ProductDTO(
                null, "Bacon Burger", "Tasty bacon burger", "Ingredients info",
                new BigDecimal("14.20"), "BURGERS", "url_image", true
        );

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validProduct)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Bacon Burger"))
                .andExpect(jsonPath("$.price").value(14.20));
    }

    @Test
    @DisplayName("Should return 400 when product name is blank")
    void shouldReturn400WhenNameIsBlank() throws Exception {
        ProductDTO invalidProduct = new ProductDTO(
                null, "", "Description", "Long Desc",
                new BigDecimal("10.00"), "BURGERS", "url", true
        );

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidProduct)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return 400 when price is zero or negative")
    void shouldReturn400WhenPriceIsInvalid() throws Exception {
        ProductDTO cheapProduct = new ProductDTO(
                null, "Cheap Burger", "Error", null,
                new BigDecimal("-1.00"), "BURGERS", "url", true
        );

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cheapProduct)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return all catalog products successfully")
    void shouldGetAllProducts() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Cheese Burger"));
    }

    @Test
    @DisplayName("Should return specific product by valid ID")
    void shouldGetProductById() throws Exception {
        mockMvc.perform(get("/api/products/" + savedProductId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(savedProductId))
                .andExpect(jsonPath("$.name").value("Cheese Burger"));
    }

    @Test
    @DisplayName("Should return 404 when looking for a missing product ID")
    void shouldReturn404WhenProductNotFound() throws Exception {
        mockMvc.perform(get("/api/products/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should return products catalog filtered by category key")
    void shouldGetProductsByCategory() throws Exception {
        mockMvc.perform(get("/api/products/category/BURGERS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].category").value("BURGERS"));
    }

    @Test
    @DisplayName("Should update existing product metadata constraints context")
    void shouldUpdateProductSuccessfully() throws Exception {
        ProductDTO updatePayload = new ProductDTO(
                null, "Updated Cheese Burger", "New desc", "New ingredients list",
                new BigDecimal("13.00"), "BURGERS", "https://s3.amazonaws.com/bucket/burger.jpg", true
        );

        mockMvc.perform(put("/api/products/" + savedProductId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatePayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Cheese Burger"))
                .andExpect(jsonPath("$.price").value(13.00));
    }

    @Test
    @DisplayName("Should delete product context details and return 204 No Content")
    void shouldDeleteProductSuccessfully() throws Exception {
        mockMvc.perform(delete("/api/products/" + savedProductId))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/products/" + savedProductId))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should patch switch product availability schema marker context")
    void shouldToggleProductAvailability() throws Exception {
        ProductAvailabilityDTO availabilityPayload = new ProductAvailabilityDTO(false);

        mockMvc.perform(put("/api/products/" + savedProductId + "/availability")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(availabilityPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isAvailable").value(false));
    }

    @Test
    @DisplayName("Should accept uploaded multipart binary data and map public metadata URL location")
    void shouldUploadProductImageSuccessfully() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "image.png", MediaType.IMAGE_PNG_VALUE, "binary".getBytes());
        when(imageStorageService.uploadImage(any())).thenReturn("https://aws-s3-mock-storage.com/new-image.jpg");

        mockMvc.perform(multipart(HttpMethod.PATCH, "/api/products/" + savedProductId + "/image")
                        .file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imageUrl").value("https://aws-s3-mock-storage.com/new-image.jpg"));
    }

    @Test
    @DisplayName("Should reject streaming updates if request multi-part boundary entity is empty")
    void shouldFailUploadWhenFileIsEmpty() throws Exception {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "", MediaType.IMAGE_PNG_VALUE, new byte[0]);

        mockMvc.perform(multipart(HttpMethod.PATCH, "/api/products/" + savedProductId + "/image")
                        .file(emptyFile))
                .andExpect(status().isBadRequest());
    }
}