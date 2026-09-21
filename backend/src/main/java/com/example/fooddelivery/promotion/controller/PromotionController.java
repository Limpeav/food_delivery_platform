package com.example.fooddelivery.promotion.controller;

import com.example.fooddelivery.common.response.ApiResponse;
import com.example.fooddelivery.common.security.UserPrincipal;
import com.example.fooddelivery.promotion.dto.PromotionRequest;
import com.example.fooddelivery.promotion.dto.PromotionResponse;
import com.example.fooddelivery.promotion.service.PromotionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Promotions", description = "Endpoints for deals and promotions")
public class PromotionController {

    private final PromotionService promotionService;

    @GetMapping("/api/promotions")
    @Operation(summary = "Get all active platform promotions (Public)")
    public ResponseEntity<ApiResponse<List<PromotionResponse>>> getActivePromotions() {
        List<PromotionResponse> promotions = promotionService.getActivePromotions();
        return ResponseEntity.ok(ApiResponse.success(promotions));
    }

    @GetMapping("/api/restaurants/{id}/promotions")
    @Operation(summary = "Get active promotions for a specific restaurant (Public)")
    public ResponseEntity<ApiResponse<List<PromotionResponse>>> getPromotionsByRestaurant(@PathVariable Long id) {
        List<PromotionResponse> promotions = promotionService.getPromotionsByRestaurant(id);
        return ResponseEntity.ok(ApiResponse.success(promotions));
    }

    @GetMapping("/api/restaurant/promotions")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    @Operation(summary = "Get promotions for logged-in owner's restaurant")
    public ResponseEntity<ApiResponse<List<PromotionResponse>>> getMyPromotions(@AuthenticationPrincipal UserPrincipal principal) {
        List<PromotionResponse> promotions = promotionService.getOwnerPromotions(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(promotions));
    }

    @PostMapping("/api/restaurant/promotions")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    @Operation(summary = "Create promotion for logged-in owner's restaurant")
    public ResponseEntity<ApiResponse<PromotionResponse>> createPromotion(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PromotionRequest request) {
        PromotionResponse response = promotionService.createPromotion(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Promotion created successfully", response));
    }

    @DeleteMapping("/api/restaurant/promotions/{id}")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    @Operation(summary = "Delete promotion")
    public ResponseEntity<ApiResponse<Void>> deletePromotion(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        promotionService.deletePromotion(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Promotion deleted successfully", null));
    }
}
