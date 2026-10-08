package com.example.fooddelivery.user;

import com.example.fooddelivery.common.exception.BadRequestException;
import com.example.fooddelivery.common.exception.ResourceNotFoundException;
import com.example.fooddelivery.user.dto.UpdateProfileRequest;
import com.example.fooddelivery.user.dto.UserResponse;
import com.example.fooddelivery.user.entity.Role;
import com.example.fooddelivery.user.entity.User;
import com.example.fooddelivery.user.entity.UserStatus;
import com.example.fooddelivery.user.repository.UserRepository;
import com.example.fooddelivery.user.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
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
    @DisplayName("Should successfully update user profile with new phone number")
    void updateProfile_Success() {
        Long userId = 1L;
        User user = User.builder()
                .id(userId)
                .name("Old Name")
                .email("user@gmail.com")
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build();

        UpdateProfileRequest request = UpdateProfileRequest.builder()
                .name("New Name")
                .phoneNumber("012345678")
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.findByPhoneNumber("+85512345678")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = userService.updateProfile(userId, request);

        assertNotNull(response);
        assertEquals("New Name", response.getName());
        assertEquals("+85512345678", response.getPhoneNumber());
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("Should reject profile update if phone is already taken by another user")
    void updateProfile_DuplicatePhone_ThrowsBadRequestException() {
        Long currentUserId = 1L;
        Long otherUserId = 2L;

        User currentUser = User.builder()
                .id(currentUserId)
                .name("Current User")
                .email("current@gmail.com")
                .build();

        User otherUser = User.builder()
                .id(otherUserId)
                .name("Other User")
                .email("other@gmail.com")
                .phoneNumber("+85512345678")
                .build();

        UpdateProfileRequest request = UpdateProfileRequest.builder()
                .name("Current User")
                .phoneNumber("012345678")
                .build();

        when(userRepository.findById(currentUserId)).thenReturn(Optional.of(currentUser));
        when(userRepository.findByPhoneNumber("+85512345678")).thenReturn(Optional.of(otherUser));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                userService.updateProfile(currentUserId, request));

        assertTrue(ex.getMessage().contains("already registered"));
        verify(userRepository, never()).save(currentUser);
    }

    @Test
    @DisplayName("Should allow user to keep their own existing phone number when updating profile")
    void updateProfile_SameUserPhone_Success() {
        Long userId = 1L;
        User user = User.builder()
                .id(userId)
                .name("Old Name")
                .email("user@gmail.com")
                .phoneNumber("+85512345678")
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build();

        UpdateProfileRequest request = UpdateProfileRequest.builder()
                .name("Updated Name")
                .phoneNumber("+85512345678")
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.findByPhoneNumber("+85512345678")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = userService.updateProfile(userId, request);

        assertNotNull(response);
        assertEquals("Updated Name", response.getName());
        assertEquals("+85512345678", response.getPhoneNumber());
        verify(userRepository).save(user);
    }
}
