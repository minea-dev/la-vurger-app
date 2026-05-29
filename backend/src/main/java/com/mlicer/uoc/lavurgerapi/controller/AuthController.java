package com.mlicer.uoc.lavurgerapi.controller;

import com.mlicer.uoc.lavurgerapi.dto.AuthRequestDTO;
import com.mlicer.uoc.lavurgerapi.dto.AuthResponseDTO;
import com.mlicer.uoc.lavurgerapi.dto.CreateUserDTO;
import com.mlicer.uoc.lavurgerapi.entity.User;
import com.mlicer.uoc.lavurgerapi.entity.enums.Role;
import com.mlicer.uoc.lavurgerapi.mapper.UserMapper;
import com.mlicer.uoc.lavurgerapi.repository.UserRepository;
import com.mlicer.uoc.lavurgerapi.security.JwtUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user authentication and JWT token generation")
public class AuthController {

    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(JwtUtils jwtUtils, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Operation(summary = "Login", description = "Authenticates a user and returns a JWT token if active.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful authentication"),
            @ApiResponse(responseCode = "401", description = "Invalid credentials or inactive user")
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody AuthRequestDTO authRequestDTO) {
        Optional<User> usuariOpcional = userRepository.findByEmail(authRequestDTO.email());

        if (usuariOpcional.isPresent() && passwordEncoder.matches(authRequestDTO.password(), usuariOpcional.get().getPassword())) {
            User user = usuariOpcional.get();

            if (!user.isActive()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            user.setLastAccess(LocalDateTime.now());
            userRepository.save(user);

            String token = jwtUtils.generateToken(user.getEmail());

            return ResponseEntity.ok(new AuthResponseDTO(token, user.getEmail(), user.getRole().name(), user.getName(), user.getPhone()));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @Operation(summary = "Register new user", description = "Creates a new user in the system (Staff or Customer).")
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody CreateUserDTO dto) {

        if (userRepository.existsByEmail(dto.email())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error: Email already in use.");
        }

        User newUser = new User();
        newUser.setName(dto.name());
        newUser.setEmail(dto.email());
        newUser.setPassword(passwordEncoder.encode(dto.password()));
        newUser.setPhone(dto.phone());

        if (dto.role() == null || dto.role().isBlank()) {
            newUser.setRole(Role.CUSTOMER);
        } else {
            try {
                newUser.setRole(Role.valueOf(dto.role().toUpperCase()));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Error: Invalid role.");
            }
        }

        newUser.setActive(true);
        newUser.setLastAccess(LocalDateTime.now());

        User savedUser = userRepository.save(newUser);

        return ResponseEntity.status(HttpStatus.CREATED).body(UserMapper.toDTO(savedUser));
    }
}