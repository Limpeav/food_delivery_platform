package com.example.fooddelivery.food.dto;

import com.example.fooddelivery.food.entity.FoodItem;
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
public class FoodItemResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private Long restaurantId;
    private String restaurantName;
    private Long menuCategoryId;
    private String menuCategoryName;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private Integer preparationTime;
    private Boolean available;
    private Double rating;
    private LocalDateTime createdAt;

    public static FoodItemResponse from(FoodItem item) {
        return FoodItemResponse.builder()
                .id(item.getId())
                .restaurantId(item.getRestaurant().getId())
                .restaurantName(item.getRestaurant().getName())
                .menuCategoryId(item.getMenuCategory().getId())
                .menuCategoryName(item.getMenuCategory().getName())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .imageUrl(item.getImageUrl())
                .preparationTime(item.getPreparationTime())
                .available(item.getAvailable())
                .rating(item.getRating())
                .createdAt(item.getCreatedAt())
                .build();
    }
}
