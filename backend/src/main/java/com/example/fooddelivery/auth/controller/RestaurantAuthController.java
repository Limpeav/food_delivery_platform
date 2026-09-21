package com.example.fooddelivery.auth.controller;

import com.example.fooddelivery.auth.dto.AuthResponse;
import com.example.fooddelivery.auth.dto.LoginRequest;
import com.example.fooddelivery.auth.dto.RestaurantOnboardingRequest;
import com.example.fooddelivery.auth.service.AuthService;
import com.example.fooddelivery.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/restaurant")
@RequiredArgsConstructor
@Tag(name = "Restaurant Auth", description = "Endpoints for restaurant partner sign in and onboarding")
public class RestaurantAuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Restaurant portal sign in (strictly checks RESTAURANT_OWNER role and pending status)")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.restaurantLogin(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    @Operation(summary = "Restaurant partner application and onboarding")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RestaurantOnboardingRequest request) {
        AuthResponse response = authService.restaurantRegister(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Restaurant partner application submitted successfully", response));
    }
}
