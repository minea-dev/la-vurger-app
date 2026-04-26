package com.mlicer.uoc.lavurgerapi;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mlicer.uoc.lavurgerapi.dto.UserDTO;
import com.mlicer.uoc.lavurgerapi.dto.UserRequestDTO;
import com.mlicer.uoc.lavurgerapi.entity.User;
import com.mlicer.uoc.lavurgerapi.entity.enums.Role;
import com.mlicer.uoc.lavurgerapi.repository.UserRepository;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
public class UserControllerIT {

    @MockitoBean
    private JwtUtils jwtUtils;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    private Long savedUserId;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        User user = new User();
        user.setName("Initial User");
        user.setEmail("initial@lavurger.com");
        user.setPassword("hashed_password");
        user.setRole(Role.ADMIN);
        user.setActive(true);
        this.savedUserId = userRepository.save(user).getId();
    }

    @Test
    @DisplayName("Should create user successfully and return 201 Created")
    void shouldCreateUser() throws Exception {
        UserRequestDTO request = new UserRequestDTO(
                "New Cashier",
                "cashier@lavurger.com",
                "SecurePass1!",
                "CASHIER"
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
    @DisplayName("Should return 500/400 when creating user with weak password")
    void shouldFailCreateUserWithWeakPassword() throws Exception {
        UserRequestDTO request = new UserRequestDTO(
                "Weak User",
                "weak@lavurger.com",
                "12345",
                "MANAGER"
        );

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().is5xxServerError());
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
    @DisplayName("Should update user successfully with 200 OK")
    void shouldUpdateUser() throws Exception {
        UserRequestDTO request = new UserRequestDTO(
                "Updated Name",
                "initial@lavurger.com",
                "",
                "MANAGER"
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
    @DisplayName("Should return 404 when updating non-existent user")
    void shouldReturn404ForNonExistentUser() throws Exception {
        UserRequestDTO request = new UserRequestDTO("Ghost", "ghost@test.com", "Pass123!", "KITCHEN");

        mockMvc.perform(put("/api/users/9999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }
}