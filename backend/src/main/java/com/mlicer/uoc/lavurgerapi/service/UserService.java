package com.mlicer.uoc.lavurgerapi.service;

import com.mlicer.uoc.lavurgerapi.dto.UserDTO;
import com.mlicer.uoc.lavurgerapi.dto.UserRequestDTO;
import com.mlicer.uoc.lavurgerapi.entity.User;
import com.mlicer.uoc.lavurgerapi.entity.enums.Role;
import com.mlicer.uoc.lavurgerapi.exception.ResourceNotFoundException;
import com.mlicer.uoc.lavurgerapi.mapper.UserMapper;
import com.mlicer.uoc.lavurgerapi.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserMapper::toDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserMapper.toDTO(user);
    }

    public UserDTO createUser(UserRequestDTO request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("Email is already in use");
        }

        if (request.password() == null || request.password().trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required for new users");
        }

        validatePasswordStrength(request.password());

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setRole(Role.valueOf(request.role().toUpperCase()));
        user.setActive(true);
        user.setPassword(passwordEncoder.encode(request.password()));

        return UserMapper.toDTO(userRepository.save(user));
    }

    public UserDTO updateUser(Long id, UserRequestDTO request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (!user.getEmail().equals(request.email()) && userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("Email is already in use");
        }

        user.setName(request.name());
        user.setEmail(request.email());
        user.setRole(Role.valueOf(request.role().toUpperCase()));

        if (request.password() != null && !request.password().trim().isEmpty()) {
            validatePasswordStrength(request.password());
            user.setPassword(passwordEncoder.encode(request.password()));
        }

        return UserMapper.toDTO(userRepository.save(user));
    }

    public UserDTO toggleUserStatus(Long id, boolean isActive) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setActive(isActive);
        return UserMapper.toDTO(userRepository.save(user));
    }

    private void validatePasswordStrength(String password) {
        if (password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long");
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new IllegalArgumentException("Password must contain at least one uppercase letter");
        }
        if (!password.matches(".*[a-z].*")) {
            throw new IllegalArgumentException("Password must contain at least one lowercase letter");
        }
        if (!password.matches(".*\\d.*")) {
            throw new IllegalArgumentException("Password must contain at least one number");
        }
        if (!password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*")) {
            throw new IllegalArgumentException("Password must contain at least one special character");
        }
    }
}