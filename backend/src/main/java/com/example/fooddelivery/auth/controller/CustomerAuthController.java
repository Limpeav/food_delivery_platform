package com.example.fooddelivery.auth.controller;

import com.example.fooddelivery.auth.dto.AuthResponse;
import com.example.fooddelivery.auth.dto.CustomerRegisterRequest;
import com.example.fooddelivery.auth.dto.LoginRequest;
import com.example.fooddelivery.auth.dto.GoogleLoginRequest;
import com.example.fooddelivery.auth.service.AuthService;
import com.example.fooddelivery.common.response.ApiResponse;
import com.example.fooddelivery.common.security.UserPrincipal;
import com.example.fooddelivery.user.dto.CompletePhoneRequest;
import com.example.fooddelivery.user.dto.UserResponse;
import com.example.fooddelivery.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/customer")
@RequiredArgsConstructor
@Tag(name = "Customer Auth", description = "Endpoints for customer authentication and registration")
public class CustomerAuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/google")
    @Operation(summary = "Customer Google Sign-In / Sign-Up with credential verification")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        AuthResponse response = authService.customerGoogleLogin(request);
        return ResponseEntity.ok(ApiResponse.success("Authentication successful", response));
    }

    @PatchMapping("/complete-profile")
    @Operation(summary = "Customer onboarding: complete Cambodian phone number")
    public ResponseEntity<ApiResponse<UserResponse>> completeProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CompletePhoneRequest request) {
        UserResponse response = userService.completePhoneNumber(principal.getId(), request.getPhoneNumber());
        return ResponseEntity.ok(ApiResponse.success("Profile completed successfully", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Customer portal sign in (strictly checks CUSTOMER role)")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.customerLogin(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    @Operation(summary = "Customer public registration")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody CustomerRegisterRequest request) {
        AuthResponse response = authService.customerRegister(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created successfully", response));
    }
}
