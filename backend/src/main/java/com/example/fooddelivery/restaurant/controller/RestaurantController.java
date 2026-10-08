package com.example.fooddelivery.restaurant.controller;

import com.example.fooddelivery.common.response.ApiResponse;
import com.example.fooddelivery.common.response.PageResponse;
import com.example.fooddelivery.common.security.UserPrincipal;
import com.example.fooddelivery.restaurant.dto.RestaurantRequest;
import com.example.fooddelivery.restaurant.dto.RestaurantResponse;
import com.example.fooddelivery.restaurant.dto.RestaurantStatusUpdateRequest;
import com.example.fooddelivery.restaurant.entity.RestaurantStatus;
import com.example.fooddelivery.restaurant.service.RestaurantService;
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
@Tag(name = "Restaurant", description = "Endpoints for public browsing and owner/admin restaurant management")
public class RestaurantController {

    private final RestaurantService restaurantService;

    // Public Endpoints
    @GetMapping("/api/restaurants")
    @Operation(summary = "Search and filter approved restaurants (Public)")
    public ResponseEntity<ApiResponse<PageResponse<RestaurantResponse>>> searchRestaurants(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @PageableDefault(size = 10, sort = "rating", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<RestaurantResponse> response = restaurantService.searchRestaurants(search, categoryId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/restaurants/{id}")
    @Operation(summary = "Get restaurant details by ID (Public)")
    public ResponseEntity<ApiResponse<RestaurantResponse>> getRestaurantById(@PathVariable Long id) {
        RestaurantResponse response = restaurantService.getRestaurantById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // Owner Endpoints
    @GetMapping("/api/restaurant/dashboard")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    @Operation(summary = "Get dashboard KPIs for logged-in owner's restaurant")
    public ResponseEntity<ApiResponse<com.example.fooddelivery.restaurant.dto.RestaurantDashboardStats>> getRestaurantDashboard(
            @AuthenticationPrincipal UserPrincipal principal) {
        com.example.fooddelivery.restaurant.dto.RestaurantDashboardStats stats = restaurantService.getRestaurantDashboardStats(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @PostMapping("/api/restaurant")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    @Operation(summary = "Register restaurant profile for logged-in owner")
    public ResponseEntity<ApiResponse<RestaurantResponse>> createRestaurant(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RestaurantRequest request) {
        RestaurantResponse response = restaurantService.createRestaurant(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Restaurant submitted for approval", response));
    }

    @GetMapping("/api/restaurant/me")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    @Operation(summary = "Get current owner's restaurant profile")
    public ResponseEntity<ApiResponse<RestaurantResponse>> getMyRestaurant(
            @AuthenticationPrincipal UserPrincipal principal) {
        RestaurantResponse response = restaurantService.getMyRestaurant(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/restaurant/restaurants")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    @Operation(summary = "Get all restaurants owned by the current logged-in partner")
    public ResponseEntity<ApiResponse<java.util.List<RestaurantResponse>>> getMyRestaurants(
            @AuthenticationPrincipal UserPrincipal principal) {
        java.util.List<RestaurantResponse> list = restaurantService.getMyRestaurants(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PutMapping("/api/restaurant/me")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    @Operation(summary = "Update current owner's restaurant profile")
    public ResponseEntity<ApiResponse<RestaurantResponse>> updateRestaurant(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RestaurantRequest request) {
        RestaurantResponse response = restaurantService.updateRestaurant(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Restaurant updated successfully", response));
    }

    @PutMapping("/api/restaurant/restaurants/{id}")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    @Operation(summary = "Update restaurant profile by ID with strict ownership verification")
    public ResponseEntity<ApiResponse<RestaurantResponse>> updateRestaurantById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RestaurantRequest request) {
        RestaurantResponse response = restaurantService.updateRestaurantById(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Restaurant updated successfully", response));
    }

    // Admin Endpoints
    @GetMapping("/api/admin/restaurants")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all restaurants with optional status filter (Admin only)")
    public ResponseEntity<ApiResponse<PageResponse<RestaurantResponse>>> getAllRestaurantsForAdmin(
            @RequestParam(required = false) RestaurantStatus status,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<RestaurantResponse> response = restaurantService.getAllRestaurantsForAdmin(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/api/admin/restaurants/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve, reject, or suspend a restaurant (Admin only)")
    public ResponseEntity<ApiResponse<RestaurantResponse>> updateRestaurantStatus(
            @PathVariable Long id,
            @Valid @RequestBody RestaurantStatusUpdateRequest request) {
        RestaurantResponse response = restaurantService.updateRestaurantStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Restaurant status updated", response));
    }
}
