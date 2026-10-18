package com.example.fooddelivery.food.dto;

import com.example.fooddelivery.food.entity.FoodOptionGroup;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodOptionGroupResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String name;
    private Boolean required;
    private Integer minSelect;
    private Integer maxSelect;
    @Builder.Default
    private List<FoodOptionItemResponse> options = new ArrayList<>();

    public static FoodOptionGroupResponse from(FoodOptionGroup group) {
        if (group == null) return null;
        return FoodOptionGroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .required(group.getRequired())
                .minSelect(group.getMinSelect())
                .maxSelect(group.getMaxSelect())
                .options(group.getOptions() != null
                        ? group.getOptions().stream().map(FoodOptionItemResponse::from).collect(Collectors.toList())
                        : new ArrayList<>())
                .build();
    }
}
