package com.example.fooddelivery.restaurantcategory.controller;

import com.example.fooddelivery.common.response.ApiResponse;
import com.example.fooddelivery.restaurantcategory.dto.RestaurantCategoryRequest;
import com.example.fooddelivery.restaurantcategory.dto.RestaurantCategoryResponse;
import com.example.fooddelivery.restaurantcategory.service.RestaurantCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurant-categories")
@RequiredArgsConstructor
@Tag(name = "Restaurant Categories", description = "Endpoints for browsing and managing restaurant cuisine categories")
public class RestaurantCategoryController {

    private final RestaurantCategoryService categoryService;

    @GetMapping
    @Operation(summary = "Get all active restaurant categories (Public)")
    public ResponseEntity<ApiResponse<List<RestaurantCategoryResponse>>> getActiveCategories() {
        List<RestaurantCategoryResponse> categories = categoryService.getAllActiveCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID (Public)")
    public ResponseEntity<ApiResponse<RestaurantCategoryResponse>> getCategory(@PathVariable Long id) {
        RestaurantCategoryResponse category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create restaurant category (Admin only)")
    public ResponseEntity<ApiResponse<RestaurantCategoryResponse>> createCategory(
            @Valid @RequestBody RestaurantCategoryRequest request) {
        RestaurantCategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update restaurant category (Admin only)")
    public ResponseEntity<ApiResponse<RestaurantCategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody RestaurantCategoryRequest request) {
        RestaurantCategoryResponse response = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete restaurant category (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
    }
}
