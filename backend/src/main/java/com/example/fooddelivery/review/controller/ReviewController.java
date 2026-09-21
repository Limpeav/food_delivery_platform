package com.example.fooddelivery.review.controller;

import com.example.fooddelivery.common.response.ApiResponse;
import com.example.fooddelivery.common.response.PageResponse;
import com.example.fooddelivery.common.security.UserPrincipal;
import com.example.fooddelivery.review.dto.ReviewRequest;
import com.example.fooddelivery.review.dto.ReviewResponse;
import com.example.fooddelivery.review.service.ReviewService;
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
@Tag(name = "Reviews", description = "Endpoints for customer ratings and reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/api/reviews")
    @Operation(summary = "Submit a review for a delivered order or food item")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ReviewRequest request) {
        ReviewResponse response = reviewService.createReview(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review submitted successfully", response));
    }

    @GetMapping("/api/restaurants/{id}/reviews")
    @Operation(summary = "Get reviews for a restaurant (Public)")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getRestaurantReviews(
            @PathVariable Long id,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<ReviewResponse> response = reviewService.getRestaurantReviews(id, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/foods/{id}/reviews")
    @Operation(summary = "Get reviews for a food item (Public)")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getFoodReviews(
            @PathVariable Long id,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<ReviewResponse> response = reviewService.getFoodReviews(id, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
