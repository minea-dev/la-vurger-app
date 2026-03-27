package com.mlicer.uoc.lavurgerapi.controller;

import com.mlicer.uoc.lavurgerapi.dto.AuthRequestDTO;
import com.mlicer.uoc.lavurgerapi.dto.AuthResponseDTO;
import com.mlicer.uoc.lavurgerapi.entity.User;
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

    @Operation(summary = "Login", description = "Authenticates a user using email and password, returning a JWT token.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful authentication"),
            @ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody AuthRequestDTO authRequestDTO) {
        Optional<User> usuariOpcional = userRepository.findByEmail(authRequestDTO.email());

        if (usuariOpcional.isPresent() && passwordEncoder.matches(authRequestDTO.password(), usuariOpcional.get().getPassword())) {
            String token = jwtUtils.generateToken(authRequestDTO.email());
            return ResponseEntity.ok(new AuthResponseDTO(token, authRequestDTO.email()));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}