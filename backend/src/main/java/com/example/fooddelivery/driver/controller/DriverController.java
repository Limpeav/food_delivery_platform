package com.example.fooddelivery.driver.controller;

import com.example.fooddelivery.common.response.ApiResponse;
import com.example.fooddelivery.common.response.PageResponse;
import com.example.fooddelivery.common.security.UserPrincipal;
import com.example.fooddelivery.driver.dto.DriverLocationUpdateRequest;
import com.example.fooddelivery.driver.dto.DriverRegisterRequest;
import com.example.fooddelivery.driver.dto.DriverResponse;
import com.example.fooddelivery.driver.service.DriverService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Driver", description = "Endpoints for driver onboarding, GPS tracking, and admin approvals")
public class DriverController {

    private final DriverService driverService;

    @GetMapping("/api/driver/dashboard")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Get driver dashboard metrics and active delivery")
    public ResponseEntity<ApiResponse<com.example.fooddelivery.driver.dto.DriverDashboardStats>> getDriverDashboard(
            @AuthenticationPrincipal UserPrincipal principal) {
        com.example.fooddelivery.driver.dto.DriverDashboardStats stats = driverService.getDriverDashboardStats(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @PostMapping("/api/driver/register")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Submit driver vehicle and license information")
    public ResponseEntity<ApiResponse<DriverResponse>> registerDriver(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DriverRegisterRequest request) {
        DriverResponse response = driverService.registerDriver(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Driver application submitted for review", response));
    }

    @GetMapping("/api/driver/me")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Get current driver profile")
    public ResponseEntity<ApiResponse<DriverResponse>> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        DriverResponse response = driverService.getMyProfile(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/api/driver/toggle-online")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Toggle driver online / offline status")
    public ResponseEntity<ApiResponse<DriverResponse>> toggleOnline(@AuthenticationPrincipal UserPrincipal principal) {
        DriverResponse response = driverService.toggleOnline(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Online status toggled", response));
    }

    @PostMapping("/api/driver/location")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Update driver GPS location and broadcast via WebSocket")
    public ResponseEntity<ApiResponse<DriverResponse>> updateLocation(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DriverLocationUpdateRequest request) {
        DriverResponse response = driverService.updateLocation(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Location updated", response));
    }

    @GetMapping("/api/admin/drivers")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all drivers for admin approval")
    public ResponseEntity<ApiResponse<PageResponse<DriverResponse>>> getAllDrivers(
            @RequestParam(required = false) Boolean approved,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<DriverResponse> response = driverService.getAllDriversAdmin(approved, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/api/admin/drivers/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve or reject a driver application (Admin only)")
    public ResponseEntity<ApiResponse<DriverResponse>> approveDriver(
            @PathVariable Long id,
            @RequestParam boolean approve) {
        DriverResponse response = driverService.approveDriver(id, approve);
        return ResponseEntity.ok(ApiResponse.success("Driver approval status updated", response));
    }

    @GetMapping("/api/driver/earnings/history")
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Get paginated earnings history (completed deliveries) for the logged-in driver")
    public ResponseEntity<ApiResponse<com.example.fooddelivery.common.response.PageResponse<com.example.fooddelivery.delivery.dto.DeliveryResponse>>> getEarningsHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @org.springframework.data.web.PageableDefault(size = 20, sort = "deliveredTime", direction = org.springframework.data.domain.Sort.Direction.DESC)
            org.springframework.data.domain.Pageable pageable) {
        com.example.fooddelivery.common.response.PageResponse<com.example.fooddelivery.delivery.dto.DeliveryResponse> history =
                driverService.getEarningsHistory(principal.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}

