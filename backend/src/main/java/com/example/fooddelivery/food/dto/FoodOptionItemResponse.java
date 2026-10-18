package com.example.fooddelivery.food.dto;

import com.example.fooddelivery.food.entity.FoodOptionItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodOptionItemResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String name;
    private BigDecimal additionalPrice;
    private Boolean isDefault;

    public static FoodOptionItemResponse from(FoodOptionItem item) {
        if (item == null) return null;
        return FoodOptionItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .additionalPrice(item.getAdditionalPrice())
                .isDefault(item.getIsDefault())
                .build();
    }
}
