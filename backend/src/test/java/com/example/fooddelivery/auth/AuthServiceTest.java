package com.example.fooddelivery.auth;

import com.example.fooddelivery.auth.dto.AuthResponse;
import com.example.fooddelivery.auth.dto.LoginRequest;
import com.example.fooddelivery.auth.dto.RegisterRequest;
import com.example.fooddelivery.auth.service.AuthService;
import com.example.fooddelivery.common.exception.BadRequestException;
import com.example.fooddelivery.common.security.JwtTokenProvider;
import com.example.fooddelivery.common.security.UserPrincipal;
import com.example.fooddelivery.user.entity.Role;
import com.example.fooddelivery.user.entity.User;
import com.example.fooddelivery.user.entity.UserStatus;
import com.example.fooddelivery.user.repository.UserRepository;
import com.example.fooddelivery.auth.repository.PasswordResetTokenRepository;
import com.example.fooddelivery.auth.repository.RefreshTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "accessExpiration", 3600000L);
        ReflectionTestUtils.setField(authService, "refreshExpiration", 604800000L);
    }

    @Test
    void register_Success() {
        RegisterRequest request = RegisterRequest.builder()
                .name("John Doe")
                .email("john@gmail.com")
                .password("password123")
                .phoneNumber("123456789")
                .role(Role.CUSTOMER)
                .build();

        when(userRepository.existsByEmail("john@gmail.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");

        User savedUser = User.builder()
                .id(1L)
                .name("John Doe")
                .email("john@gmail.com")
                .password("encodedPassword")
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build();

        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(tokenProvider.generateAccessToken(any(UserPrincipal.class))).thenReturn("access_token_123");
        when(tokenProvider.generateRefreshToken(any(UserPrincipal.class))).thenReturn("refresh_token_123");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("access_token_123", response.getAccessToken());
        assertEquals("refresh_token_123", response.getRefreshToken());
        assertEquals("john@gmail.com", response.getUser().getEmail());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void register_DuplicateEmail_ThrowsBadRequestException() {
        RegisterRequest request = RegisterRequest.builder()
                .name("John Doe")
                .email("existing@gmail.com")
                .password("password123")
                .build();

        when(userRepository.existsByEmail("existing@gmail.com")).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.register(request));
        assertTrue(ex.getMessage().contains("already registered"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_AdminRole_ThrowsBadRequestException() {
        RegisterRequest request = RegisterRequest.builder()
                .name("Hacker")
                .email("hacker@gmail.com")
                .password("password123")
                .role(Role.ADMIN)
                .build();

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.register(request));
        assertTrue(ex.getMessage().contains("Registration as ADMIN is not permitted"));
    }

    @Test
    void login_Success() {
        LoginRequest request = LoginRequest.builder()
                .email("john@gmail.com")
                .password("password123")
                .build();

        User user = User.builder()
                .id(1L)
                .name("John Doe")
                .email("john@gmail.com")
                .password("encodedPassword")
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build();

        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(userRepository.findByEmail("john@gmail.com")).thenReturn(Optional.of(user));
        when(tokenProvider.generateAccessToken(any(UserPrincipal.class))).thenReturn("access_token");
        when(tokenProvider.generateRefreshToken(any(UserPrincipal.class))).thenReturn("refresh_token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("access_token", response.getAccessToken());
        assertEquals("john@gmail.com", response.getUser().getEmail());
    }
}
