package com.example.fooddelivery.auth.controller;

import com.example.fooddelivery.auth.dto.AuthResponse;
import com.example.fooddelivery.auth.dto.DriverOnboardingRequest;
import com.example.fooddelivery.auth.dto.LoginRequest;
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
@RequestMapping("/api/auth/driver")
@RequiredArgsConstructor
@Tag(name = "Driver Auth", description = "Endpoints for driver partner sign in and onboarding")
public class DriverAuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Driver portal sign in (strictly checks DRIVER role and approval status)")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.driverLogin(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    @Operation(summary = "Driver partner application and onboarding")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody DriverOnboardingRequest request) {
        AuthResponse response = authService.driverRegister(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Driver partner application submitted successfully", response));
    }
}
