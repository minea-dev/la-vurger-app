package com.mlicer.uoc.lavurgerapi.service;

import com.mlicer.uoc.lavurgerapi.dto.UserDTO;
import com.mlicer.uoc.lavurgerapi.dto.UserRequestDTO;
import com.mlicer.uoc.lavurgerapi.entity.User;
import com.mlicer.uoc.lavurgerapi.entity.enums.Role;
import com.mlicer.uoc.lavurgerapi.exception.ResourceNotFoundException;
import com.mlicer.uoc.lavurgerapi.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

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
        @SuppressWarnings("all")
        String userEmail = result.get(0).email();
        assertEquals("test@lavurger.com", userEmail);
        verify(userRepository).findAll();
    }

    @Test
    @DisplayName("Should create user successfully with strong password")
    void shouldCreateUserSuccessfully() {
        UserRequestDTO request = new UserRequestDTO("John Doe", "john@lavurger.com", "600123456", "StrongPass1!", Role.MANAGER);

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
    @DisplayName("Should throw Exception when creating user with existing email")
    void shouldThrowExceptionWhenEmailExists() {
        UserRequestDTO request = new UserRequestDTO("John Doe", "john@lavurger.com", null, "StrongPass1!", Role.MANAGER);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.createUser(request);
        });

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw Exception when password is weak")
    void shouldThrowExceptionWhenPasswordIsWeak() {
        UserRequestDTO request1 = new UserRequestDTO("John", "j1@test.com", null, "NoSpecial123", Role.CASHIER);
        UserRequestDTO request2 = new UserRequestDTO("John", "j2@test.com", null, "nouppercase1!", Role.CASHIER);
        UserRequestDTO request3 = new UserRequestDTO("John", "j3@test.com", null, "Sh0rt!", Role.CASHIER);

        assertThrows(IllegalArgumentException.class, () -> userService.createUser(request1));
        assertThrows(IllegalArgumentException.class, () -> userService.createUser(request2));
        assertThrows(IllegalArgumentException.class, () -> userService.createUser(request3));

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should update user and ignore password if empty")
    void shouldUpdateUserWithoutPasswordChange() {
        Long userId = 1L;
        User existingUser = new User();
        existingUser.setId(userId);
        existingUser.setEmail("old@test.com");
        existingUser.setPassword("old_hash");

        UserRequestDTO request = new UserRequestDTO("New Name", "new@test.com", null, "", Role.KITCHEN);

        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenReturn(existingUser);

        userService.updateUser(userId, request);

        verify(userRepository).save(existingUser);
        assertEquals("New Name", existingUser.getName());
        assertEquals("old_hash", existingUser.getPassword());
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
    @DisplayName("Should throw ResourceNotFoundException when updating non-existent user")
    void shouldThrowResourceNotFoundException() {
        Long invalidId = 99L;
        when(userRepository.findById(invalidId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            userService.toggleUserStatus(invalidId, false);
        });
    }
}