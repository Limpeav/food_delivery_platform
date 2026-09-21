package com.example.fooddelivery.auth.service;

import com.example.fooddelivery.auth.dto.AuthResponse;
import com.example.fooddelivery.auth.dto.GoogleLoginRequest;
import com.example.fooddelivery.auth.dto.GoogleUserInfo;
import com.example.fooddelivery.auth.entity.RefreshToken;
import com.example.fooddelivery.auth.repository.PasswordResetTokenRepository;
import com.example.fooddelivery.auth.repository.RefreshTokenRepository;
import com.example.fooddelivery.common.exception.ConflictException;
import com.example.fooddelivery.common.exception.UnauthorizedException;
import com.example.fooddelivery.common.security.JwtTokenProvider;
import com.example.fooddelivery.common.security.UserPrincipal;
import com.example.fooddelivery.driver.repository.DriverRepository;
import com.example.fooddelivery.restaurant.repository.RestaurantRepository;
import com.example.fooddelivery.restaurantcategory.repository.RestaurantCategoryRepository;
import com.example.fooddelivery.user.entity.Role;
import com.example.fooddelivery.user.entity.User;
import com.example.fooddelivery.user.entity.UserStatus;
import com.example.fooddelivery.user.repository.UserRepository;
import com.example.fooddelivery.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.SecurityContextRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerGoogleAuthTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock
    private RestaurantRepository restaurantRepository;
    @Mock
    private RestaurantCategoryRepository restaurantCategoryRepository;
    @Mock
    private DriverRepository driverRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtTokenProvider tokenProvider;
    @Mock
    private SecurityContextRepository securityContextRepository;
    @Mock
    private GoogleAuthService googleAuthService;

    private AuthService authService;
    private UserService userService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                refreshTokenRepository,
                passwordResetTokenRepository,
                restaurantRepository,
                restaurantCategoryRepository,
                driverRepository,
                passwordEncoder,
                authenticationManager,
                tokenProvider,
                securityContextRepository,
                googleAuthService
        );

        userService = new UserService(userRepository, passwordEncoder);

        lenient().when(tokenProvider.generateAccessToken(any(UserPrincipal.class))).thenReturn("mock-access-token");
        lenient().when(tokenProvider.generateRefreshToken(any(UserPrincipal.class))).thenReturn("mock-refresh-token");
        lenient().when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    @DisplayName("New Google Customer should be created with role CUSTOMER and phoneRequired = true")
    void testNewGoogleCustomer() {
        GoogleUserInfo googleInfo = GoogleUserInfo.builder()
                .subject("google-sub-12345")
                .email("newcustomer@gmail.com")
                .name("New Customer")
                .picture("https://lh3.googleusercontent.com/pic")
                .emailVerified(true)
                .build();

        when(googleAuthService.verifyToken("valid-id-token")).thenReturn(googleInfo);
        when(userRepository.findByGoogleSubject("google-sub-12345")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("newcustomer@gmail.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId(99L);
            return u;
        });

        AuthResponse response = authService.customerGoogleLogin(new GoogleLoginRequest("valid-id-token"));

        assertNotNull(response);
        assertEquals("mock-access-token", response.getAccessToken());
        assertEquals("mock-refresh-token", response.getRefreshToken());
        assertEquals(Role.CUSTOMER, response.getUser().getRole());
        assertTrue(response.getPhoneRequired());
        assertNull(response.getUser().getPhoneNumber());
        assertEquals("google-sub-12345", response.getUser().getGoogleSubject());
    }

    @Test
    @DisplayName("Existing Google Customer with phone number should have phoneRequired = false")
    void testExistingCustomerWithPhone() {
        GoogleUserInfo googleInfo = GoogleUserInfo.builder()
                .subject("google-sub-999")
                .email("existing@gmail.com")
                .name("Existing User")
                .picture(null)
                .emailVerified(true)
                .build();

        User existingUser = User.builder()
                .id(10L)
                .name("Existing User")
                .email("existing@gmail.com")
                .googleSubject("google-sub-999")
                .phoneNumber("+85512345678")
                .phoneVerified(true)
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build();

        when(googleAuthService.verifyToken("valid-id-token")).thenReturn(googleInfo);
        when(userRepository.findByGoogleSubject("google-sub-999")).thenReturn(Optional.of(existingUser));

        AuthResponse response = authService.customerGoogleLogin(new GoogleLoginRequest("valid-id-token"));

        assertNotNull(response);
        assertFalse(response.getPhoneRequired());
        assertEquals("+85512345678", response.getUser().getPhoneNumber());
    }

    @Test
    @DisplayName("Google login should fail if account is SUSPENDED")
    void testSuspendedCustomerRejected() {
        GoogleUserInfo googleInfo = GoogleUserInfo.builder()
                .subject("google-sub-bad")
                .email("bad@gmail.com")
                .name("Bad User")
                .emailVerified(true)
                .build();

        User suspendedUser = User.builder()
                .id(11L)
                .email("bad@gmail.com")
                .googleSubject("google-sub-bad")
                .role(Role.CUSTOMER)
                .status(UserStatus.SUSPENDED)
                .build();

        when(googleAuthService.verifyToken("bad-token")).thenReturn(googleInfo);
        when(userRepository.findByGoogleSubject("google-sub-bad")).thenReturn(Optional.of(suspendedUser));

        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () ->
                authService.customerGoogleLogin(new GoogleLoginRequest("bad-token")));

        assertTrue(ex.getMessage().contains("unavailable") || ex.getMessage().contains("contact"));
    }

    @Test
    @DisplayName("Complete phone onboarding should reject duplicate phone with ConflictException")
    void testDuplicatePhoneRejected() {
        Long currentUserId = 5L;
        String rawPhone = "012345678";
        String normalized = "+85512345678";

        User otherUser = User.builder()
                .id(99L)
                .phoneNumber(normalized)
                .build();

        when(userRepository.findByPhoneNumber(normalized)).thenReturn(Optional.of(otherUser));

        ConflictException ex = assertThrows(ConflictException.class, () ->
                userService.completePhoneNumber(currentUserId, rawPhone));

        assertEquals("This phone number is already linked to another account.", ex.getMessage());
    }
}
