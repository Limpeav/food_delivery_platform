package com.example.fooddelivery.restaurantcategory.dto;

import com.example.fooddelivery.restaurantcategory.entity.RestaurantCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantCategoryResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private Boolean active;
    private LocalDateTime createdAt;

    public static RestaurantCategoryResponse from(RestaurantCategory category) {
        return RestaurantCategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .active(category.getActive())
                .createdAt(category.getCreatedAt())
                .build();
    }
}
