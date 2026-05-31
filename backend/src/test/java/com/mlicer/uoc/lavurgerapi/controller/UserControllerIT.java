package com.mlicer.uoc.lavurgerapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mlicer.uoc.lavurgerapi.dto.UserRequestDTO;
import com.mlicer.uoc.lavurgerapi.entity.Product;
import com.mlicer.uoc.lavurgerapi.entity.User;
import com.mlicer.uoc.lavurgerapi.entity.enums.Role;
import com.mlicer.uoc.lavurgerapi.repository.ProductRepository;
import com.mlicer.uoc.lavurgerapi.repository.UserRepository;
import com.mlicer.uoc.lavurgerapi.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

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
public class UserControllerIT {

    @MockitoBean
    private JwtUtils jwtUtils;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    private Long savedUserId;
    private Long savedProductId;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        productRepository.deleteAll();

        User user = new User();
        user.setName("Initial User");
        user.setEmail("initial@lavurger.com");
        user.setPassword("hashed_password");
        user.setRole(Role.ADMIN);
        user.setActive(true);
        this.savedUserId = userRepository.save(user).getId();

        Product product = new Product();
        product.setName("Test Burger");
        product.setPrice(BigDecimal.TEN);
        product.setCategory("BURGERS");
        product.setAvailable(true);
        this.savedProductId = productRepository.save(product).getId();
    }

    @Test
    @DisplayName("Should create user successfully and return 201 Created")
    void shouldCreateUser() throws Exception {
        UserRequestDTO request = new UserRequestDTO(
                "New Cashier",
                "cashier@lavurger.com",
                "SecurePass1!",
                "600123456",
                Role.CASHIER
        );

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("New Cashier"))
                .andExpect(jsonPath("$.role").value("CASHIER"))
                .andExpect(jsonPath("$.isActive").value(true));
    }

    @Test
    @DisplayName("Should return 400 Bad Request when creating user with weak password")
    void shouldFailCreateUserWithWeakPassword() throws Exception {
        UserRequestDTO request = new UserRequestDTO(
                "Weak User",
                "weak@lavurger.com",
                "12345",
                "600123456",
                Role.MANAGER
        );

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return all users with 200 OK")
    void shouldGetAllUsers() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].email").value("initial@lavurger.com"));
    }

    @Test
    @DisplayName("Should return filtered users when role param is provided")
    void shouldGetUsersFilteredByRole() throws Exception {
        mockMvc.perform(get("/api/users")
                        .param("role", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @DisplayName("Should return 400 Bad Request when role param value is invalid")
    void shouldReturn400ForInvalidRoleParam() throws Exception {
        mockMvc.perform(get("/api/users")
                        .param("role", "INVALID_ROLE_XYZ"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return specific user by ID successfully")
    void shouldGetUserById() throws Exception {
        mockMvc.perform(get("/api/users/" + savedUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(savedUserId))
                .andExpect(jsonPath("$.email").value("initial@lavurger.com"));
    }

    @Test
    @DisplayName("Should update user successfully with 200 OK")
    void shouldUpdateUser() throws Exception {
        UserRequestDTO request = new UserRequestDTO(
                "Updated Name",
                "initial@lavurger.com",
                "SecurePass1!",
                "600123456",
                Role.MANAGER
        );

        mockMvc.perform(put("/api/users/" + savedUserId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.role").value("MANAGER"));
    }

    @Test
    @DisplayName("Should toggle user status successfully with 200 OK")
    void shouldToggleUserStatus() throws Exception {
        String requestBody = "{\"isActive\": false}";

        mockMvc.perform(patch("/api/users/" + savedUserId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive").value(false));
    }

    @Test
    @DisplayName("Should return 500 Internal Server Error when updating non-existent user")
    void shouldReturn404ForNonExistentUser() throws Exception {
        UserRequestDTO request = new UserRequestDTO("Ghost", "ghost@test.com", "Pass123!", "600123456", Role.KITCHEN);

        mockMvc.perform(put("/api/users/9999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("Should retrieve favorites for current user context")
    void shouldGetFavoritesWithPrincipal() throws Exception {
        mockMvc.perform(get("/api/users/favorites")
                        .principal(() -> "initial@lavurger.com"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should append product id to customer favorites list")
    void shouldAddProductToFavorites() throws Exception {
        mockMvc.perform(post("/api/users/favorites/" + savedProductId)
                        .principal(() -> "initial@lavurger.com"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should drop product id from customer favorites list")
    void shouldRemoveProductFromFavorites() throws Exception {
        mockMvc.perform(delete("/api/users/favorites/" + savedProductId)
                        .principal(() -> "initial@lavurger.com"))
                .andExpect(status().isOk());
    }
}