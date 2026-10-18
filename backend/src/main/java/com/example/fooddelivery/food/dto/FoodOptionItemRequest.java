package com.example.fooddelivery.food.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodOptionItemRequest {

    @NotBlank(message = "Option name is required")
    private String name;

    @DecimalMin(value = "0.00", message = "Additional price cannot be negative")
    private BigDecimal additionalPrice;

    private Boolean isDefault;
}
