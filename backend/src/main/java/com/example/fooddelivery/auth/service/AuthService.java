package com.example.fooddelivery.auth.service;

import com.example.fooddelivery.auth.dto.*;
import com.example.fooddelivery.auth.entity.PasswordResetToken;
import com.example.fooddelivery.auth.entity.RefreshToken;
import com.example.fooddelivery.auth.repository.PasswordResetTokenRepository;
import com.example.fooddelivery.auth.repository.RefreshTokenRepository;
import com.example.fooddelivery.common.exception.BadRequestException;
import com.example.fooddelivery.common.exception.ResourceNotFoundException;
import com.example.fooddelivery.common.exception.UnauthorizedException;
import com.example.fooddelivery.common.security.JwtTokenProvider;
import com.example.fooddelivery.common.security.UserPrincipal;
import com.example.fooddelivery.driver.entity.Driver;
import com.example.fooddelivery.driver.repository.DriverRepository;
import com.example.fooddelivery.restaurant.entity.Restaurant;
import com.example.fooddelivery.restaurant.entity.RestaurantStatus;
import com.example.fooddelivery.restaurant.repository.RestaurantRepository;
import com.example.fooddelivery.restaurantcategory.entity.RestaurantCategory;
import com.example.fooddelivery.restaurantcategory.repository.RestaurantCategoryRepository;
import com.example.fooddelivery.user.dto.UserResponse;
import com.example.fooddelivery.user.entity.Role;
import com.example.fooddelivery.user.entity.User;
import com.example.fooddelivery.user.entity.UserStatus;
import com.example.fooddelivery.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RestaurantRepository restaurantRepository;
    private final RestaurantCategoryRepository restaurantCategoryRepository;
    private final DriverRepository driverRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final SecurityContextRepository securityContextRepository;
    private final GoogleAuthService googleAuthService;

    @Value("${jwt.access-expiration:604800000}")
    private long accessExpiration;

    @Value("${jwt.refresh-expiration:2592000000}")
    private long refreshExpiration;

    /**
     * Shared underlying login method.
     * Validates credentials, checks account status, enforces portal expected role,
     * checks business profile approval, issues JWT tokens, and records revocable refresh token.
     */
    @Transactional
    public AuthResponse login(LoginRequest request, Role expectedRole) {
        String email = request.getEmail().toLowerCase().trim();

        // 1. Authenticate credentials
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (BadCredentialsException e) {
            throw new UnauthorizedException("Invalid email or password");
        } catch (DisabledException e) {
            throw new UnauthorizedException("Your account is disabled. Please contact support.");
        } catch (LockedException e) {
            throw new UnauthorizedException("Your account has been suspended. Please contact support.");
        }

        // 2. Fetch user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        // 3. Verify account status
        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new UnauthorizedException("Your account has been suspended. Please contact support.");
        }
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new UnauthorizedException("Your account is " + user.getStatus().name().toLowerCase() + ". Please contact support.");
        }

        // 4. Enforce expected portal role (Wrong Portal Protection)
        if (expectedRole != null && user.getRole() != expectedRole) {
            switch (expectedRole) {
                case CUSTOMER:
                    throw new UnauthorizedException("This account is not registered as a customer account. Please use the appropriate portal.");
                case RESTAURANT_OWNER:
                    throw new UnauthorizedException("This account is not registered as a restaurant account");
                case DRIVER:
                    throw new UnauthorizedException("This account is not registered as a driver account");
                case ADMIN:
                    throw new UnauthorizedException("This account does not have administrative privileges");
            }
        }

        // 5. Inspect partner onboarding / approval status
        String businessStatus = null;
        String statusMessage = null;

        if (user.getRole() == Role.RESTAURANT_OWNER) {
            Optional<Restaurant> restOpt = restaurantRepository.findFirstByOwnerIdOrderByIdAsc(user.getId());
            if (restOpt.isPresent()) {
                Restaurant restaurant = restOpt.get();
                businessStatus = restaurant.getStatus().name();
                if (restaurant.getStatus() == RestaurantStatus.PENDING) {
                    statusMessage = "Your restaurant application is currently under review.";
                }
            } else {
                businessStatus = "PENDING";
                statusMessage = "Your restaurant application is currently under review.";
            }
        } else if (user.getRole() == Role.DRIVER) {
            Optional<Driver> driverOpt = driverRepository.findByUserId(user.getId());
            if (driverOpt.isPresent()) {
                Driver driver = driverOpt.get();
                boolean isApproved = Boolean.TRUE.equals(driver.getApproved());
                businessStatus = isApproved ? "APPROVED" : "PENDING";
                if (!isApproved) {
                    statusMessage = "Your driver application is still under review.";
                }
            } else {
                businessStatus = "PENDING";
                statusMessage = "Your driver application is still under review.";
            }
        }

        // 6. Generate access & refresh tokens
        UserPrincipal principal = UserPrincipal.create(user);
        String accessToken = tokenProvider.generateAccessToken(principal);
        String refreshToken = tokenProvider.generateRefreshToken(principal);

        // 7. Store revocable refresh token in database
        refreshTokenRepository.revokeAllByUserId(user.getId());
        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .token(refreshToken)
                .expiryDate(Instant.now().plusMillis(refreshExpiration))
                .revoked(false)
                .build();
        refreshTokenRepository.save(rt);

        // 8. Establish HTTP session for session-based authentication
        establishSession(authentication);

        log.info("User {} logged in successfully via portal (role: {})", user.getEmail(), user.getRole());

        boolean phoneRequired = (user.getRole() == Role.CUSTOMER && (user.getPhoneNumber() == null || user.getPhoneNumber().trim().isEmpty()));

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(accessExpiration)
                .user(UserResponse.from(user))
                .businessStatus(businessStatus)
                .statusMessage(statusMessage)
                .phoneRequired(phoneRequired)
                .build();
    }

    // Portal-specific login methods
    @Transactional
    public AuthResponse customerLogin(LoginRequest request) {
        return login(request, Role.CUSTOMER);
    }

    /**
     * Google Sign-In / Sign-Up for Customers.
     * Verifies Google credentials, finds or provisions a CUSTOMER user,
     * assigns role CUSTOMER, issues tokens, and flags phoneRequired.
     */
    @Transactional
    public AuthResponse customerGoogleLogin(GoogleLoginRequest request) {
        GoogleUserInfo googleInfo = googleAuthService.verifyToken(request.getIdToken());
        String email = googleInfo.getEmail().toLowerCase().trim();

        // 1. Locate user by Google Subject ID or Email
        Optional<User> existingUserOpt = userRepository.findByGoogleSubject(googleInfo.getSubject());
        User user;

        if (existingUserOpt.isPresent()) {
            user = existingUserOpt.get();
        } else {
            // Check if user already exists by email
            Optional<User> emailUserOpt = userRepository.findByEmail(email);
            if (emailUserOpt.isPresent()) {
                user = emailUserOpt.get();
                // Enforce role: only CUSTOMER accounts can authenticate via Customer portal
                if (user.getRole() != Role.CUSTOMER) {
                    throw new UnauthorizedException("This email is registered under a " + user.getRole().name().toLowerCase() + " account. Please use the appropriate portal.");
                }
                // Link existing customer account to Google
                user.setGoogleSubject(googleInfo.getSubject());
                if (user.getProfileImageUrl() == null && googleInfo.getPicture() != null) {
                    user.setProfileImageUrl(googleInfo.getPicture());
                }
                user = userRepository.save(user);
                log.info("Linked existing customer email {} with Google Subject {}", email, googleInfo.getSubject());
            } else {
                // Provision new CUSTOMER user
                user = User.builder()
                        .name(googleInfo.getName())
                        .email(email)
                        .password(null)
                        .role(Role.CUSTOMER)
                        .status(UserStatus.ACTIVE)
                        .googleSubject(googleInfo.getSubject())
                        .profileImageUrl(googleInfo.getPicture())
                        .phoneVerified(false)
                        .build();
                user = userRepository.save(user);
                log.info("Provisioned new customer account via Google sign-in: id={}, email={}", user.getId(), email);
            }
        }

        // 2. Status verification
        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new UnauthorizedException("Your account is currently unavailable. Please contact Cravery Support.");
        }
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new UnauthorizedException("Your account is " + user.getStatus().name().toLowerCase() + ". Please contact support.");
        }

        // 3. Check role
        if (user.getRole() != Role.CUSTOMER) {
            throw new UnauthorizedException("This account is not registered as a customer account. Please use the appropriate portal.");
        }

        // 4. Determine if phone number is required
        boolean phoneRequired = (user.getPhoneNumber() == null || user.getPhoneNumber().trim().isEmpty());

        // 5. Generate tokens
        UserPrincipal principal = UserPrincipal.create(user);
        String accessToken = tokenProvider.generateAccessToken(principal);
        String refreshToken = tokenProvider.generateRefreshToken(principal);

        refreshTokenRepository.revokeAllByUserId(user.getId());
        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .token(refreshToken)
                .expiryDate(Instant.now().plusMillis(refreshExpiration))
                .revoked(false)
                .build();
        refreshTokenRepository.save(rt);

        Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        establishSession(auth);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(accessExpiration)
                .user(UserResponse.from(user))
                .businessStatus("ACTIVE")
                .phoneRequired(phoneRequired)
                .build();
    }

    @Transactional
    public AuthResponse restaurantLogin(LoginRequest request) {
        return login(request, Role.RESTAURANT_OWNER);
    }

    @Transactional
    public AuthResponse driverLogin(LoginRequest request) {
        return login(request, Role.DRIVER);
    }

    @Transactional
    public AuthResponse adminLogin(LoginRequest request) {
        return login(request, Role.ADMIN);
    }

    // Backwards-compatible generic login (role detected automatically from DB)
    @Transactional
    public AuthResponse login(LoginRequest request) {
        return login(request, null);
    }

    /**
     * Customer Public Registration. Automatically assigns CUSTOMER role.
     */
    @Transactional
    public AuthResponse customerRegister(CustomerRegisterRequest request) {
        if (request.getConfirmPassword() != null && !request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null)
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);
        log.info("Customer registered successfully with id: {}", savedUser.getId());

        UserPrincipal principal = UserPrincipal.create(savedUser);
        String accessToken = tokenProvider.generateAccessToken(principal);
        String refreshToken = tokenProvider.generateRefreshToken(principal);

        RefreshToken rt = RefreshToken.builder()
                .user(savedUser)
                .token(refreshToken)
                .expiryDate(Instant.now().plusMillis(refreshExpiration))
                .revoked(false)
                .build();
        refreshTokenRepository.save(rt);

        // Establish HTTP session for session-based authentication
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        establishSession(auth);

        boolean phoneRequired = (savedUser.getPhoneNumber() == null || savedUser.getPhoneNumber().trim().isEmpty());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(accessExpiration)
                .user(UserResponse.from(savedUser))
                .businessStatus("ACTIVE")
                .phoneRequired(phoneRequired)
                .build();
    }

    /**
     * Restaurant Partner Onboarding Application.
     * Creates User (RESTAURANT_OWNER) and Restaurant (PENDING status).
     */
    @Transactional
    public AuthResponse restaurantRegister(RestaurantOnboardingRequest request) {
        if (request.getConfirmPassword() != null && !request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered");
        }

        RestaurantCategory category = restaurantCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant category not found with id: " + request.getCategoryId()));

        // 1. Create User
        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhone().trim())
                .role(Role.RESTAURANT_OWNER)
                .status(UserStatus.ACTIVE)
                .build();
        User savedUser = userRepository.save(user);

        // 2. Create Restaurant
        Restaurant restaurant = Restaurant.builder()
                .owner(savedUser)
                .category(category)
                .name(request.getRestaurantName().trim())
                .description(request.getDescription())
                .phone(request.getRestaurantPhone() != null ? request.getRestaurantPhone().trim() : request.getPhone().trim())
                .address(request.getAddress().trim())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .openingTime(request.getOpeningTime().trim())
                .closingTime(request.getClosingTime().trim())
                .status(RestaurantStatus.PENDING)
                .build();
        restaurantRepository.save(restaurant);

        log.info("Restaurant onboarding application submitted for user id: {}, restaurant: {}", savedUser.getId(), restaurant.getName());

        UserPrincipal principal = UserPrincipal.create(savedUser);
        String accessToken = tokenProvider.generateAccessToken(principal);
        String refreshToken = tokenProvider.generateRefreshToken(principal);

        RefreshToken rt = RefreshToken.builder()
                .user(savedUser)
                .token(refreshToken)
                .expiryDate(Instant.now().plusMillis(refreshExpiration))
                .revoked(false)
                .build();
        refreshTokenRepository.save(rt);

        // Establish HTTP session for session-based authentication
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        establishSession(auth);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(accessExpiration)
                .user(UserResponse.from(savedUser))
                .businessStatus("PENDING")
                .statusMessage("Your restaurant application is currently under review.")
                .build();
    }

    /**
     * Driver Partner Onboarding Application.
     * Creates User (DRIVER) and Driver profile (PENDING approval).
     */
    @Transactional
    public AuthResponse driverRegister(DriverOnboardingRequest request) {
        if (request.getConfirmPassword() != null && !request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered");
        }

        // 1. Create User
        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhone().trim())
                .role(Role.DRIVER)
                .status(UserStatus.ACTIVE)
                .build();
        User savedUser = userRepository.save(user);

        // 2. Create Driver Profile
        Driver driver = Driver.builder()
                .user(savedUser)
                .vehicleType(request.getVehicleType().trim())
                .vehicleNumber(request.getVehicleNumber().trim())
                .licenseNumber(request.getLicenseNumber().trim())
                .online(false)
                .approved(false)
                .build();
        driverRepository.save(driver);

        log.info("Driver onboarding application submitted for user id: {}", savedUser.getId());

        UserPrincipal principal = UserPrincipal.create(savedUser);
        String accessToken = tokenProvider.generateAccessToken(principal);
        String refreshToken = tokenProvider.generateRefreshToken(principal);

        RefreshToken rt = RefreshToken.builder()
                .user(savedUser)
                .token(refreshToken)
                .expiryDate(Instant.now().plusMillis(refreshExpiration))
                .revoked(false)
                .build();
        refreshTokenRepository.save(rt);

        // Establish HTTP session for session-based authentication
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        establishSession(auth);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(accessExpiration)
                .user(UserResponse.from(savedUser))
                .businessStatus("PENDING")
                .statusMessage("Your driver application is still under review.")
                .build();
    }

    /**
     * Refresh access token using revocable database refresh token.
     */
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String tokenStr = request.getRefreshToken();
        if (tokenStr == null || !tokenProvider.validateToken(tokenStr)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        // Check database for token existence and revocation
        RefreshToken dbToken = refreshTokenRepository.findByToken(tokenStr)
                .orElseThrow(() -> new UnauthorizedException("Refresh token not found or revoked"));

        if (dbToken.isRevoked() || dbToken.getExpiryDate().isBefore(Instant.now())) {
            throw new UnauthorizedException("Refresh token is expired or revoked");
        }

        User user = dbToken.getUser();
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new UnauthorizedException("User account is inactive or suspended");
        }

        UserPrincipal principal = UserPrincipal.create(user);
        String newAccessToken = tokenProvider.generateAccessToken(principal);
        String newRefreshToken = tokenProvider.generateRefreshToken(principal);

        // Rotate refresh token
        dbToken.setRevoked(true);
        refreshTokenRepository.save(dbToken);

        RefreshToken nextToken = RefreshToken.builder()
                .user(user)
                .token(newRefreshToken)
                .expiryDate(Instant.now().plusMillis(refreshExpiration))
                .revoked(false)
                .build();
        refreshTokenRepository.save(nextToken);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(accessExpiration)
                .user(UserResponse.from(user))
                .build();
    }

    /**
     * Revoke refresh tokens on logout and invalidate HTTP session.
     */
    @Transactional
    public void logout(String refreshToken, Long userId) {
        if (refreshToken != null && !refreshToken.trim().isEmpty()) {
            refreshTokenRepository.revokeByToken(refreshToken.trim());
        }
        if (userId != null) {
            refreshTokenRepository.revokeAllByUserId(userId);
        }

        // Invalidate HTTP session and clear security context
        SecurityContextHolder.clearContext();
        try {
            RequestAttributes attrs = RequestContextHolder.getRequestAttributes();
            if (attrs instanceof ServletRequestAttributes servletAttrs) {
                HttpServletRequest request = servletAttrs.getRequest();
                HttpServletResponse response = servletAttrs.getResponse();
                if (request != null) {
                    HttpSession session = request.getSession(false);
                    if (session != null) {
                        session.invalidate();
                    }
                    if (securityContextRepository != null && response != null) {
                        securityContextRepository.saveContext(SecurityContextHolder.createEmptyContext(), request, response);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Error invalidating HTTP session during logout: {}", e.getMessage());
        }
    }

    private void establishSession(Authentication authentication) {
        try {
            RequestAttributes attrs = RequestContextHolder.getRequestAttributes();
            if (attrs instanceof ServletRequestAttributes servletAttrs) {
                HttpServletRequest request = servletAttrs.getRequest();
                HttpServletResponse response = servletAttrs.getResponse();
                if (request != null) {
                    SecurityContext context = SecurityContextHolder.createEmptyContext();
                    context.setAuthentication(authentication);
                    SecurityContextHolder.setContext(context);
                    if (securityContextRepository != null && response != null) {
                        securityContextRepository.saveContext(context, request, response);
                    }
                    HttpSession session = request.getSession(true);
                    session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);
                }
            }
        } catch (Exception e) {
            log.warn("Could not establish HTTP session authentication: {}", e.getMessage());
        }
    }

    /**
     * Forgot password: generates secure reset token without exposing account existence.
     */
    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            passwordResetTokenRepository.deleteByUser(user);

            String token = UUID.randomUUID().toString();
            PasswordResetToken prt = PasswordResetToken.builder()
                    .user(user)
                    .token(token)
                    .expiryDate(LocalDateTime.now().plusHours(1))
                    .used(false)
                    .build();
            passwordResetTokenRepository.save(prt);

            log.info("Password reset token generated for user: {} (Token: {})", email, token);
            return token;
        } else {
            log.info("Password reset requested for non-existent email: {}", email);
            return null;
        }
    }

    /**
     * Reset password using token.
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (request.getConfirmPassword() != null && !request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken().trim())
                .orElseThrow(() -> new BadRequestException("Invalid or expired password reset token"));

        if (resetToken.isUsed()) {
            throw new BadRequestException("This password reset token has already been used");
        }

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This password reset token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        // Revoke all refresh tokens for security
        refreshTokenRepository.revokeAllByUserId(user.getId());
        log.info("Password reset successfully for user: {}", user.getEmail());
    }

    // Legacy register method for backward compatibility
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.getRole() == Role.ADMIN) {
            throw new BadRequestException("Registration as ADMIN is not permitted");
        }
        CustomerRegisterRequest custReq = CustomerRegisterRequest.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(request.getPassword())
                .phoneNumber(request.getPhoneNumber())
                .build();
        return customerRegister(custReq);
    }
}
