package com.example.fooddelivery.menu.dto;

import com.example.fooddelivery.menu.entity.MenuCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuCategoryResponse {

    private Long id;
    private Long restaurantId;
    private String name;
    private String description;
    private Integer displayOrder;
    private Boolean active;

    public static MenuCategoryResponse from(MenuCategory category) {
        return MenuCategoryResponse.builder()
                .id(category.getId())
                .restaurantId(category.getRestaurant().getId())
                .name(category.getName())
                .description(category.getDescription())
                .displayOrder(category.getDisplayOrder())
                .active(category.getActive())
                .build();
    }
}
