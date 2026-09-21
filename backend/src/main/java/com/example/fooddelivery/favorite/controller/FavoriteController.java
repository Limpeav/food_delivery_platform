package com.example.fooddelivery.favorite.controller;

import com.example.fooddelivery.common.response.ApiResponse;
import com.example.fooddelivery.common.security.UserPrincipal;
import com.example.fooddelivery.favorite.service.FavoriteService;
import com.example.fooddelivery.food.dto.FoodItemResponse;
import com.example.fooddelivery.restaurant.dto.RestaurantResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@Tag(name = "Favorites", description = "Endpoints for customer favorite restaurants and foods")
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping("/restaurants")
    @Operation(summary = "Get list of favorite restaurants")
    public ResponseEntity<ApiResponse<List<RestaurantResponse>>> getFavoriteRestaurants(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<RestaurantResponse> list = favoriteService.getFavoriteRestaurants(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/restaurants/{id}")
    @Operation(summary = "Add restaurant to favorites")
    public ResponseEntity<ApiResponse<Void>> addFavoriteRestaurant(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        favoriteService.addFavoriteRestaurant(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Added to favorites", null));
    }

    @DeleteMapping("/restaurants/{id}")
    @Operation(summary = "Remove restaurant from favorites")
    public ResponseEntity<ApiResponse<Void>> removeFavoriteRestaurant(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        favoriteService.removeFavoriteRestaurant(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Removed from favorites", null));
    }

    @GetMapping("/restaurants/{id}/check")
    @Operation(summary = "Check if restaurant is favorite")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkRestaurantFavorite(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isFav = favoriteService.isRestaurantFavorite(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(Map.of("isFavorite", isFav)));
    }

    @GetMapping("/foods")
    @Operation(summary = "Get list of favorite foods")
    public ResponseEntity<ApiResponse<List<FoodItemResponse>>> getFavoriteFoods(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<FoodItemResponse> list = favoriteService.getFavoriteFoods(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/foods/{id}")
    @Operation(summary = "Add food item to favorites")
    public ResponseEntity<ApiResponse<Void>> addFavoriteFood(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        favoriteService.addFavoriteFood(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Added to favorites", null));
    }

    @DeleteMapping("/foods/{id}")
    @Operation(summary = "Remove food item from favorites")
    public ResponseEntity<ApiResponse<Void>> removeFavoriteFood(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        favoriteService.removeFavoriteFood(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Removed from favorites", null));
    }

    @GetMapping("/foods/{id}/check")
    @Operation(summary = "Check if food item is favorite")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkFoodFavorite(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isFav = favoriteService.isFoodFavorite(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(Map.of("isFavorite", isFav)));
    }
}
