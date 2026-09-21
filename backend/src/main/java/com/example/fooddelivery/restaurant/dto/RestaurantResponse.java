package com.example.fooddelivery.restaurant.dto;

import com.example.fooddelivery.restaurant.entity.Restaurant;
import com.example.fooddelivery.restaurant.entity.RestaurantStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantResponse implements Serializable {

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

    public static RestaurantResponse from(Restaurant restaurant) {
        return RestaurantResponse.builder()
                .id(restaurant.getId())
                .ownerId(restaurant.getOwner().getId())
                .ownerName(restaurant.getOwner().getName())
                .categoryId(restaurant.getCategory().getId())
                .categoryName(restaurant.getCategory().getName())
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
                .build();
    }
}
