package com.mlicer.uoc.lavurgerapi.controller;

import com.mlicer.uoc.lavurgerapi.dto.ProductDTO;
import com.mlicer.uoc.lavurgerapi.dto.UserDTO;
import com.mlicer.uoc.lavurgerapi.dto.UserRequestDTO;
import com.mlicer.uoc.lavurgerapi.entity.enums.Role;
import com.mlicer.uoc.lavurgerapi.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "Endpoints for user management")
public class UserController {

    @Autowired
    private UserService userService;

    @Operation(summary = "Get all users with optional role filtering")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<UserDTO>> getAllUsers(@RequestParam(required = false) String role) {
        if (role != null && !role.isBlank()) {
            try {
                Role roleEnum = Role.valueOf(role.toUpperCase().trim());
                return ResponseEntity.ok(userService.getUsersByRole(roleEnum));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @Operation(summary = "Get user by ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @Operation(summary = "Create a new user")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody UserRequestDTO userRequest) {
        UserDTO createdUser = userService.createUser(userRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @Operation(summary = "Update an existing user's contact details")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @Valid @RequestBody UserRequestDTO userRequest) {
        return ResponseEntity.ok(userService.updateUser(id, userRequest));
    }

    @Operation(summary = "Toggle user active status (Block/Unblock)")
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<UserDTO> toggleUserStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        Boolean isActive = body.get("isActive");
        if (isActive == null) {
            throw new IllegalArgumentException("Field 'isActive' is required");
        }
        return ResponseEntity.ok(userService.toggleUserStatus(id, isActive));
    }

    @Operation(summary = "Get favorites of the currently logged in user")
    @GetMapping("/favorites")
    public ResponseEntity<List<ProductDTO>> getMyFavorites(Principal principal) {
        return ResponseEntity.ok(userService.getUserFavorites(principal.getName()));
    }

    @Operation(summary = "Add a product to user favorites")
    @PostMapping("/favorites/{productId}")
    public ResponseEntity<Void> addFavorite(@PathVariable("productId") Long productId, Principal principal) {
        userService.addFavorite(principal.getName(), productId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Remove a product from user favorites")
    @DeleteMapping("/favorites/{productId}")
    public ResponseEntity<Void> removeFavorite(@PathVariable("productId") Long productId, Principal principal) {
        userService.removeFavorite(principal.getName(), productId);
        return ResponseEntity.ok().build();
    }
}