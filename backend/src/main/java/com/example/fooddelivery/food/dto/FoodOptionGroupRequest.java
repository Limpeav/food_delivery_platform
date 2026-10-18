package com.example.fooddelivery.food.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodOptionGroupRequest {

    @NotBlank(message = "Option group name is required")
    private String name;

    private Boolean required;

    private Integer minSelect;

    private Integer maxSelect;

    @Valid
    @Builder.Default
    private List<FoodOptionItemRequest> options = new ArrayList<>();
}
