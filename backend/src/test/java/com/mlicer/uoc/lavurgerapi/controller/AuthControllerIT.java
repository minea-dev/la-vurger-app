package com.mlicer.uoc.lavurgerapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mlicer.uoc.lavurgerapi.dto.AuthRequestDTO;
import com.mlicer.uoc.lavurgerapi.dto.CreateUserDTO;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
public class AuthControllerIT {

    @MockitoBean
    private JwtUtils jwtUtils;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        User activeUser = new User();
        activeUser.setName("Active User");
        activeUser.setEmail("active@lavurger.com");
        activeUser.setPassword(passwordEncoder.encode("ValidPass123!"));
        activeUser.setRole(Role.CUSTOMER);
        activeUser.setActive(true);
        userRepository.save(activeUser);

        User inactiveUser = new User();
        inactiveUser.setName("Inactive User");
        inactiveUser.setEmail("inactive@lavurger.com");
        inactiveUser.setPassword(passwordEncoder.encode("ValidPass123!"));
        inactiveUser.setRole(Role.CUSTOMER);
        inactiveUser.setActive(false);
        userRepository.save(inactiveUser);
    }

    @Test
    @DisplayName("Should authenticate user and return token when credentials are valid")
    void shouldLoginSuccessfully() throws Exception {
        AuthRequestDTO request = new AuthRequestDTO("active@lavurger.com", "ValidPass123!");
        when(jwtUtils.generateToken("active@lavurger.com")).thenReturn("mocked-jwt-token");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mocked-jwt-token"))
                .andExpect(jsonPath("$.email").value("active@lavurger.com"))
                .andExpect(jsonPath("$.name").value("Active User"));
    }

    @Test
    @DisplayName("Should return 401 Unauthorized when password does not match")
    void shouldFailLoginWithWrongPassword() throws Exception {
        AuthRequestDTO request = new AuthRequestDTO("active@lavurger.com", "WrongPassword!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should return 401 Unauthorized when user is disabled")
    void shouldFailLoginWhenUserIsInactive() throws Exception {
        AuthRequestDTO request = new AuthRequestDTO("inactive@lavurger.com", "ValidPass123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should return 401 Unauthorized when email is not registered")
    void shouldFailLoginWhenUserNotFound() throws Exception {
        AuthRequestDTO request = new AuthRequestDTO("missing@lavurger.com", "SomePass123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should register customer successfully and default role when empty")
    void shouldRegisterNewUserWithDefaultRole() throws Exception {
        CreateUserDTO request = new CreateUserDTO("Marc", "marc@lavurger.com", "SecurePass1!", null, "600111222");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("marc@lavurger.com"))
                .andExpect(jsonPath("$.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.isActive").value(true));
    }

    @Test
    @DisplayName("Should register user with explicit role mapping")
    void shouldRegisterNewUserWithExplicitRole() throws Exception {
        CreateUserDTO request = new CreateUserDTO("Chef", "kitchen@lavurger.com", "SecurePass1!", "KITCHEN", "600333444");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("KITCHEN"));
    }

    @Test
    @DisplayName("Should return 409 Conflict when duplicate email registration is attempted")
    void shouldFailRegisterWhenEmailExists() throws Exception {
        CreateUserDTO request = new CreateUserDTO("Clone", "active@lavurger.com", "SecurePass1!", "CUSTOMER", "600000000");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Should return 400 Bad Request when role string value is invalid")
    void shouldFailRegisterWithInvalidRoleValue() throws Exception {
        CreateUserDTO request = new CreateUserDTO("Ghost", "ghost@lavurger.com", "SecurePass1!", "GHOST_ROLE", "600000000");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}