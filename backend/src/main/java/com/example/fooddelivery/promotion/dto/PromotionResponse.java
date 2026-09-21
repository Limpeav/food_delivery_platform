package com.example.fooddelivery.promotion.dto;

import com.example.fooddelivery.coupon.entity.DiscountType;
import com.example.fooddelivery.promotion.entity.Promotion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionResponse {

    private Long id;
    private Long restaurantId;
    private String restaurantName;
    private Long foodItemId;
    private String foodItemName;
    private String title;
    private String description;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean active;

    public static PromotionResponse from(Promotion promo) {
        return PromotionResponse.builder()
                .id(promo.getId())
                .restaurantId(promo.getRestaurant().getId())
                .restaurantName(promo.getRestaurant().getName())
                .foodItemId(promo.getFoodItem() != null ? promo.getFoodItem().getId() : null)
                .foodItemName(promo.getFoodItem() != null ? promo.getFoodItem().getName() : null)
                .title(promo.getTitle())
                .description(promo.getDescription())
                .discountType(promo.getDiscountType())
                .discountValue(promo.getDiscountValue())
                .startDate(promo.getStartDate())
                .endDate(promo.getEndDate())
                .active(promo.getActive())
                .build();
    }
}
