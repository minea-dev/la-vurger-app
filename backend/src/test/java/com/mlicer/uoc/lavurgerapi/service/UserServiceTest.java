package com.mlicer.uoc.lavurgerapi.service;

import com.mlicer.uoc.lavurgerapi.dto.ProductDTO;
import com.mlicer.uoc.lavurgerapi.dto.UserDTO;
import com.mlicer.uoc.lavurgerapi.dto.UserRequestDTO;
import com.mlicer.uoc.lavurgerapi.entity.Product;
import com.mlicer.uoc.lavurgerapi.entity.User;
import com.mlicer.uoc.lavurgerapi.entity.enums.Role;
import com.mlicer.uoc.lavurgerapi.mapper.ProductMapper;
import com.mlicer.uoc.lavurgerapi.repository.ProductRepository;
import com.mlicer.uoc.lavurgerapi.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private UserService userService;

    @Test
    @DisplayName("Should return all users")
    void shouldReturnAllUsers() {
        User user = new User();
        user.setId(1L);
        user.setName("Test User");
        user.setEmail("test@lavurger.com");
        user.setRole(Role.ADMIN);
        user.setActive(true);

        when(userRepository.findAll()).thenReturn(List.of(user));

        List<UserDTO> result = userService.getAllUsers();

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals("test@lavurger.com", result.get(0).email());
        verify(userRepository).findAll();
    }

    @Test
    @DisplayName("Should return users filtered by role")
    void shouldReturnUsersByRole() {
        User user = new User();
        user.setRole(Role.CASHIER);
        when(userRepository.findByRole(Role.CASHIER)).thenReturn(List.of(user));

        List<UserDTO> result = userService.getUsersByRole(Role.CASHIER);

        assertFalse(result.isEmpty());
        assertEquals(Role.CASHIER.name(), result.get(0).role());
        verify(userRepository).findByRole(Role.CASHIER);
    }

    @Test
    @DisplayName("Should return user by ID successfully")
    void shouldReturnUserById() {
        Long userId = 1L;
        User user = new User();
        user.setId(userId);
        user.setName("John");
        user.setRole(Role.CASHIER);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        UserDTO result = userService.getUserById(userId);

        assertNotNull(result);
        assertEquals("John", result.name());
        verify(userRepository).findById(userId);
    }

    @Test
    @DisplayName("Should throw RuntimeException when user not found by ID")
    void shouldThrowExceptionWhenUserNotFoundById() {
        Long userId = 99L;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> userService.getUserById(userId));
        assertEquals("Usuari no trobat", exception.getMessage());
    }

    @Test
    @DisplayName("Should create user successfully")
    void shouldCreateUserSuccessfully() {
        UserRequestDTO request = new UserRequestDTO("John Doe", "john@lavurger.com", "password123", "600123456", Role.MANAGER);

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setName("John Doe");
        savedUser.setEmail("john@lavurger.com");
        savedUser.setPhone("600123456");
        savedUser.setRole(Role.MANAGER);
        savedUser.setActive(true);

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserDTO result = userService.createUser(request);

        assertNotNull(result);
        assertEquals("John Doe", result.name());
        assertEquals(Role.MANAGER.name(), result.role());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should update user successfully")
    void shouldUpdateUserSuccessfully() {
        Long userId = 1L;
        User existingUser = new User();
        existingUser.setId(userId);
        existingUser.setName("Old Name");
        existingUser.setPhone("111111111");
        existingUser.setRole(Role.KITCHEN);

        UserRequestDTO request = new UserRequestDTO("New Name", "new@test.com", "pass", "222222222", Role.MANAGER);

        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenReturn(existingUser);

        UserDTO result = userService.updateUser(userId, request);

        assertNotNull(result);
        assertEquals("New Name", existingUser.getName());
        assertEquals("222222222", existingUser.getPhone());
        assertEquals(Role.MANAGER, existingUser.getRole());
        verify(userRepository).save(existingUser);
    }

    @Test
    @DisplayName("Should toggle user status")
    void shouldToggleUserStatus() {
        Long userId = 1L;
        User existingUser = new User();
        existingUser.setId(userId);
        existingUser.setActive(true);
        existingUser.setRole(Role.CASHIER);

        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenReturn(existingUser);

        UserDTO result = userService.toggleUserStatus(userId, false);

        assertFalse(result.isActive());
        verify(userRepository).save(existingUser);
    }

    @Test
    @DisplayName("Should throw RuntimeException when toggling status of non-existent user")
    void shouldThrowRuntimeExceptionWhenUserNotFoundForToggle() {
        Long invalidId = 99L;
        when(userRepository.findById(invalidId)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> userService.toggleUserStatus(invalidId, false));
        assertEquals("Usuari no trobat", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should return user favorite products")
    void shouldReturnUserFavorites() {
        String email = "customer@test.com";
        User user = new User();
        Product product = new Product();
        user.setFavorites(Set.of(product));
        user.setRole(Role.CUSTOMER);

        ProductDTO productDTO = new ProductDTO(1L, "Burger", "Desc", "Long Desc", BigDecimal.TEN, "MAIN", "", true);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(productMapper.toDTO(product)).thenReturn(productDTO);

        List<ProductDTO> result = userService.getUserFavorites(email);

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        verify(userRepository).findByEmail(email);
    }

    @Test
    @DisplayName("Should add product to favorites successfully")
    void shouldAddProductToFavorites() {
        String email = "customer@test.com";
        Long productId = 10L;

        User user = new User();
        user.setFavorites(new HashSet<>());
        Product product = new Product();
        product.setId(productId);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));

        userService.addFavorite(email, productId);

        assertTrue(user.getFavorites().contains(product));
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("Should remove product from favorites successfully")
    void shouldRemoveProductFromFavorites() {
        String email = "customer@test.com";
        Long productId = 10L;

        User user = new User();
        Product product = new Product();
        product.setId(productId);
        user.setFavorites(new HashSet<>(Set.of(product)));

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        userService.removeFavorite(email, productId);

        assertFalse(user.getFavorites().contains(product));
        verify(userRepository).save(user);
    }
}