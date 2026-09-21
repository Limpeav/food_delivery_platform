package com.example.fooddelivery.menu.controller;

import com.example.fooddelivery.common.response.ApiResponse;
import com.example.fooddelivery.common.security.UserPrincipal;
import com.example.fooddelivery.menu.dto.MenuCategoryRequest;
import com.example.fooddelivery.menu.dto.MenuCategoryResponse;
import com.example.fooddelivery.menu.service.MenuCategoryService;
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
@Tag(name = "Menu Category", description = "Endpoints for restaurant menu categories")
public class MenuCategoryController {

    private final MenuCategoryService menuCategoryService;

    @GetMapping("/api/restaurants/{restaurantId}/menu-categories")
    @Operation(summary = "Get active menu categories for a restaurant (Public)")
    public ResponseEntity<ApiResponse<List<MenuCategoryResponse>>> getCategoriesByRestaurant(@PathVariable Long restaurantId) {
        List<MenuCategoryResponse> categories = menuCategoryService.getActiveCategoriesByRestaurant(restaurantId);
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/api/restaurant/menu-categories")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    @Operation(summary = "Get all menu categories for logged-in owner's restaurant")
    public ResponseEntity<ApiResponse<List<MenuCategoryResponse>>> getMyMenuCategories(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<MenuCategoryResponse> categories = menuCategoryService.getCategoriesForOwner(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @PostMapping("/api/restaurant/menu-categories")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    @Operation(summary = "Create menu category for logged-in owner's restaurant")
    public ResponseEntity<ApiResponse<MenuCategoryResponse>> createMenuCategory(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody MenuCategoryRequest request) {
        MenuCategoryResponse response = menuCategoryService.createMenuCategory(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Menu category created successfully", response));
    }

    @PutMapping("/api/restaurant/menu-categories/{id}")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    @Operation(summary = "Update menu category")
    public ResponseEntity<ApiResponse<MenuCategoryResponse>> updateMenuCategory(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody MenuCategoryRequest request) {
        MenuCategoryResponse response = menuCategoryService.updateMenuCategory(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Menu category updated successfully", response));
    }

    @DeleteMapping("/api/restaurant/menu-categories/{id}")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    @Operation(summary = "Delete menu category")
    public ResponseEntity<ApiResponse<Void>> deleteMenuCategory(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        menuCategoryService.deleteMenuCategory(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Menu category deleted successfully", null));
    }
}
