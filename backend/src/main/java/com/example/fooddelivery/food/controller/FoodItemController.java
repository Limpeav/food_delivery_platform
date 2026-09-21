package com.example.fooddelivery.food.controller;

import com.example.fooddelivery.common.response.ApiResponse;
import com.example.fooddelivery.common.response.PageResponse;
import com.example.fooddelivery.common.security.UserPrincipal;
import com.example.fooddelivery.food.dto.FoodItemRequest;
import com.example.fooddelivery.food.dto.FoodItemResponse;
import com.example.fooddelivery.food.service.FoodItemService;
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

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Food Items", description = "Endpoints for browsing and managing food items")
public class FoodItemController {

    private final FoodItemService foodItemService;

    // Public Endpoints
    @GetMapping("/api/foods")
    @Operation(summary = "Search food items with filters and pagination (Public)")
    public ResponseEntity<ApiResponse<PageResponse<FoodItemResponse>>> searchFoods(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long restaurantId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false, defaultValue = "true") Boolean availableOnly,
            @PageableDefault(size = 12, sort = "rating", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<FoodItemResponse> response = foodItemService.searchFoods(
                search, restaurantId, categoryId, minPrice, maxPrice, availableOnly, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/foods/popular")
    @Operation(summary = "Get popular food items (Public, Cached)")
    public ResponseEntity<ApiResponse<List<FoodItemResponse>>> getPopularFoods() {
        List<FoodItemResponse> foods = foodItemService.getPopularFoods();
        return ResponseEntity.ok(ApiResponse.success(foods));
    }

    @GetMapping("/api/foods/{id}")
    @Operation(summary = "Get single food item by ID (Public)")
    public ResponseEntity<ApiResponse<FoodItemResponse>> getFoodById(@PathVariable Long id) {
        FoodItemResponse response = foodItemService.getFoodItemById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/restaurants/{restaurantId}/foods")
    @Operation(summary = "Get all available foods for a specific restaurant (Public)")
    public ResponseEntity<ApiResponse<List<FoodItemResponse>>> getFoodsByRestaurant(@PathVariable Long restaurantId) {
        List<FoodItemResponse> foods = foodItemService.getFoodsByRestaurant(restaurantId);
        return ResponseEntity.ok(ApiResponse.success(foods));
    }

    // Owner Endpoints
    @GetMapping("/api/restaurant/foods")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    @Operation(summary = "Get all foods for logged-in owner's restaurant")
    public ResponseEntity<ApiResponse<PageResponse<FoodItemResponse>>> getOwnerFoods(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<FoodItemResponse> response = foodItemService.getFoodsForOwner(principal.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/restaurant/foods")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    @Operation(summary = "Create food item for logged-in owner's restaurant")
    public ResponseEntity<ApiResponse<FoodItemResponse>> createFoodItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody FoodItemRequest request) {
        FoodItemResponse response = foodItemService.createFoodItem(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Food item created successfully", response));
    }

    @PutMapping("/api/restaurant/foods/{id}")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    @Operation(summary = "Update food item")
    public ResponseEntity<ApiResponse<FoodItemResponse>> updateFoodItem(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody FoodItemRequest request) {
        FoodItemResponse response = foodItemService.updateFoodItem(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Food item updated successfully", response));
    }

    @PatchMapping("/api/restaurant/foods/{id}/toggle-availability")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    @Operation(summary = "Toggle food availability status")
    public ResponseEntity<ApiResponse<FoodItemResponse>> toggleAvailability(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        FoodItemResponse response = foodItemService.toggleAvailability(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Availability updated", response));
    }

    @DeleteMapping("/api/restaurant/foods/{id}")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    @Operation(summary = "Delete food item")
    public ResponseEntity<ApiResponse<Void>> deleteFoodItem(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        foodItemService.deleteFoodItem(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Food item deleted successfully", null));
    }
}
