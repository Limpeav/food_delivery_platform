package com.example.fooddelivery.admin.controller;

import com.example.fooddelivery.admin.dto.AdminDashboardStats;
import com.example.fooddelivery.admin.service.AdminService;
import com.example.fooddelivery.common.response.ApiResponse;
import com.example.fooddelivery.common.response.PageResponse;
import com.example.fooddelivery.review.dto.ReviewResponse;
import com.example.fooddelivery.review.service.ReviewService;
import com.example.fooddelivery.user.dto.UserResponse;
import com.example.fooddelivery.user.entity.Role;
import com.example.fooddelivery.user.entity.UserStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Endpoints for platform administration and analytics")
public class AdminController {

    private final AdminService adminService;
    private final ReviewService reviewService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get platform-wide dashboard metrics and statistics")
    public ResponseEntity<ApiResponse<AdminDashboardStats>> getDashboardStats() {
        AdminDashboardStats stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/users")
    @Operation(summary = "Get registered users with optional role filtering")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getUsers(
            @RequestParam(required = false) Role role,
            @PageableDefault(size = 15, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<UserResponse> response = adminService.getUsers(role, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Update user status (ACTIVE, INACTIVE, SUSPENDED)")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable Long id,
            @RequestParam UserStatus status) {
        UserResponse response = adminService.updateUserStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("User status updated", response));
    }

    @GetMapping("/reviews")
    @Operation(summary = "Get all platform reviews for moderation")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getAllReviews(
            @PageableDefault(size = 15, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<ReviewResponse> response = reviewService.getAllReviews(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/reviews/{id}")
    @Operation(summary = "Delete an inappropriate or flagged review")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully", null));
    }
}
