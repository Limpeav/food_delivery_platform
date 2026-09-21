package com.example.fooddelivery.restaurant.dto;

import com.example.fooddelivery.restaurant.entity.RestaurantStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private RestaurantStatus status;
}
