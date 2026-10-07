package com.example.fooddelivery.restaurant.dto;

import com.example.fooddelivery.food.dto.FoodItemResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NearbyRecommendationResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    private Double userLatitude;
    private Double userLongitude;
    private Double radiusKm;
    private Integer totalFound;

    @Builder.Default
    private List<NearbyRestaurantResponse> restaurants = new ArrayList<>();

    @Builder.Default
    private List<FoodItemResponse> topRecommendedFoods = new ArrayList<>();
}
