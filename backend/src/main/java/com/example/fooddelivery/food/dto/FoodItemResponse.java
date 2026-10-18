package com.example.fooddelivery.food.dto;

import com.example.fooddelivery.food.entity.FoodItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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
    @Builder.Default
    private List<FoodOptionGroupResponse> optionGroups = new ArrayList<>();
    private LocalDateTime createdAt;

    public static FoodItemResponse from(FoodItem item) {
        if (item == null) return null;
        return FoodItemResponse.builder()
                .id(item.getId())
                .restaurantId(item.getRestaurant() != null ? item.getRestaurant().getId() : null)
                .restaurantName(item.getRestaurant() != null ? item.getRestaurant().getName() : null)
                .menuCategoryId(item.getMenuCategory() != null ? item.getMenuCategory().getId() : null)
                .menuCategoryName(item.getMenuCategory() != null ? item.getMenuCategory().getName() : null)
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .imageUrl(item.getImageUrl())
                .preparationTime(item.getPreparationTime())
                .available(item.getAvailable())
                .rating(item.getRating())
                .optionGroups(item.getOptionGroups() != null
                        ? item.getOptionGroups().stream().map(FoodOptionGroupResponse::from).collect(Collectors.toList())
                        : new ArrayList<>())
                .createdAt(item.getCreatedAt())
                .build();
    }
}
