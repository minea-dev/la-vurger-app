package com.mlicer.uoc.lavurgerapi.controller;

import com.mlicer.uoc.lavurgerapi.dto.AuthRequestDTO;
import com.mlicer.uoc.lavurgerapi.dto.AuthResponseDTO;
import com.mlicer.uoc.lavurgerapi.security.JwtUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtUtils jwtUtils;

    public AuthController(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody AuthRequestDTO authRequestDTO) {
        // test
        if ("admin@lavurger.com".equals(authRequestDTO.email()) && "1234".equals(authRequestDTO.password())) {
            String token = jwtUtils.generateToken(authRequestDTO.email());
            return ResponseEntity.ok(new AuthResponseDTO(token, authRequestDTO.email()));
        }

        return ResponseEntity.status(401).build();
    }
}
