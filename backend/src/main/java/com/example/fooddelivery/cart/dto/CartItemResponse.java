package com.example.fooddelivery.cart.dto;

import com.example.fooddelivery.cart.entity.CartItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {

    private Long id;
    private Long foodItemId;
    private String foodName;
    private String foodImageUrl;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal subtotal;
    private String selectedOptions;
    private String specialInstructions;

    public static CartItemResponse from(CartItem item) {
        return CartItemResponse.builder()
                .id(item.getId())
                .foodItemId(item.getFoodItem().getId())
                .foodName(item.getFoodItem().getName())
                .foodImageUrl(item.getFoodItem().getImageUrl())
                .unitPrice(item.getFoodItem().getPrice())
                .quantity(item.getQuantity())
                .subtotal(item.getSubtotal())
                .selectedOptions(item.getSelectedOptions())
                .specialInstructions(item.getSpecialInstructions())
                .build();
    }
}
