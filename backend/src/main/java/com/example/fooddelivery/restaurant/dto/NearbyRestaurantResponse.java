package com.example.fooddelivery.restaurant.dto;

import com.example.fooddelivery.food.dto.FoodItemResponse;
import com.example.fooddelivery.restaurant.entity.Restaurant;
import com.example.fooddelivery.restaurant.entity.RestaurantStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NearbyRestaurantResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private Long ownerId;
    private String ownerName;
    private Long categoryId;
    private String categoryName;
    private String name;
    private String description;
    private String logoUrl;
    private String coverImageUrl;
    private String phone;
    private String address;
    private Double latitude;
    private Double longitude;
    private String openingTime;
    private String closingTime;
    private BigDecimal deliveryFee;
    private BigDecimal minimumOrder;
    private Double rating;
    private Integer reviewCount;
    private RestaurantStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Location & Recommendation metrics
    private Double distanceKm;
    private Integer estimatedDeliveryMinutes;
    private Boolean isOpen;
    private Double recommendationScore;

    @Builder.Default
    private List<FoodItemResponse> recommendedFoods = new ArrayList<>();

    public static NearbyRestaurantResponse from(Restaurant restaurant,
                                                  double distanceKm,
                                                  int estimatedDeliveryMinutes,
                                                  boolean isOpen,
                                                  double recommendationScore,
                                                  List<FoodItemResponse> recommendedFoods) {
        return NearbyRestaurantResponse.builder()
                .id(restaurant.getId())
                .ownerId(restaurant.getOwner() != null ? restaurant.getOwner().getId() : null)
                .ownerName(restaurant.getOwner() != null ? restaurant.getOwner().getName() : null)
                .categoryId(restaurant.getCategory() != null ? restaurant.getCategory().getId() : null)
                .categoryName(restaurant.getCategory() != null ? restaurant.getCategory().getName() : null)
                .name(restaurant.getName())
                .description(restaurant.getDescription())
                .logoUrl(restaurant.getLogoUrl())
                .coverImageUrl(restaurant.getCoverImageUrl())
                .phone(restaurant.getPhone())
                .address(restaurant.getAddress())
                .latitude(restaurant.getLatitude())
                .longitude(restaurant.getLongitude())
                .openingTime(restaurant.getOpeningTime())
                .closingTime(restaurant.getClosingTime())
                .deliveryFee(restaurant.getDeliveryFee())
                .minimumOrder(restaurant.getMinimumOrder())
                .rating(restaurant.getRating())
                .reviewCount(restaurant.getReviewCount())
                .status(restaurant.getStatus())
                .createdAt(restaurant.getCreatedAt())
                .updatedAt(restaurant.getUpdatedAt())
                .distanceKm(distanceKm)
                .estimatedDeliveryMinutes(estimatedDeliveryMinutes)
                .isOpen(isOpen)
                .recommendationScore(recommendationScore)
                .recommendedFoods(recommendedFoods != null ? recommendedFoods : new ArrayList<>())
                .build();
    }
}
