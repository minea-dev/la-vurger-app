package com.mlicer.uoc.lavurgerapi.service;

import com.mlicer.uoc.lavurgerapi.dto.ProductDTO;
import com.mlicer.uoc.lavurgerapi.dto.UserDTO;
import com.mlicer.uoc.lavurgerapi.dto.UserRequestDTO;
import com.mlicer.uoc.lavurgerapi.entity.Product;
import com.mlicer.uoc.lavurgerapi.entity.User;
import com.mlicer.uoc.lavurgerapi.entity.enums.Role;
import com.mlicer.uoc.lavurgerapi.mapper.ProductMapper;
import com.mlicer.uoc.lavurgerapi.mapper.UserMapper;
import com.mlicer.uoc.lavurgerapi.repository.ProductRepository;
import com.mlicer.uoc.lavurgerapi.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductMapper productMapper;


    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserMapper::toDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuari no trobat"));
        return UserMapper.toDTO(user);
    }

    public UserDTO createUser(UserRequestDTO dto) {
        User user = new User();
        user.setName(dto.name());
        user.setEmail(dto.email());
        user.setPassword(dto.password());
        user.setRole(Role.valueOf(dto.role().toUpperCase()));
        user.setActive(true);
        return UserMapper.toDTO(userRepository.save(user));
    }

    public UserDTO updateUser(Long id, UserRequestDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuari no trobat"));
        user.setName(dto.name());
        user.setEmail(dto.email());
        user.setRole(Role.valueOf(dto.role().toUpperCase()));
        return UserMapper.toDTO(userRepository.save(user));
    }

    public UserDTO toggleUserStatus(Long id, Boolean isActive) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuari no trobat"));
        user.setActive(isActive);
        return UserMapper.toDTO(userRepository.save(user));
    }

    public List<ProductDTO> getUserFavorites(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuari no trobat"));

        return user.getFavorites().stream()
                .map(productMapper::toDTO)
                .collect(Collectors.toList());
    }

    public void addFavorite(String email, Long productId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuari no trobat"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producte no trobat"));

        user.getFavorites().add(product);
        userRepository.save(user);
    }

    public void removeFavorite(String email, Long productId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuari no trobat"));

        user.getFavorites().removeIf(p -> p.getId().equals(productId));
        userRepository.save(user);
    }
}