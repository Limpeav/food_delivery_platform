package com.example.fooddelivery.cart.dto;

import com.example.fooddelivery.cart.entity.Cart;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {

    private Long id;
    private Long restaurantId;
    private String restaurantName;
    private BigDecimal restaurantDeliveryFee;
    private BigDecimal restaurantMinimumOrder;
    private List<CartItemResponse> items;
    private BigDecimal subtotal;
    private BigDecimal deliveryFee;
    private BigDecimal totalAmount;
    private Integer totalItems;

    public static CartResponse from(Cart cart) {
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            return CartResponse.builder()
                    .id(cart != null ? cart.getId() : null)
                    .items(Collections.emptyList())
                    .subtotal(BigDecimal.ZERO)
                    .deliveryFee(BigDecimal.ZERO)
                    .totalAmount(BigDecimal.ZERO)
                    .totalItems(0)
                    .build();
        }

        List<CartItemResponse> itemResponses = cart.getItems().stream()
                .map(CartItemResponse::from)
                .collect(Collectors.toList());

        BigDecimal subtotal = itemResponses.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal deliveryFee = cart.getRestaurant() != null ? cart.getRestaurant().getDeliveryFee() : BigDecimal.ZERO;
        BigDecimal total = subtotal.add(deliveryFee);

        int totalCount = itemResponses.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        return CartResponse.builder()
                .id(cart.getId())
                .restaurantId(cart.getRestaurant() != null ? cart.getRestaurant().getId() : null)
                .restaurantName(cart.getRestaurant() != null ? cart.getRestaurant().getName() : null)
                .restaurantDeliveryFee(deliveryFee)
                .restaurantMinimumOrder(cart.getRestaurant() != null ? cart.getRestaurant().getMinimumOrder() : BigDecimal.ZERO)
                .items(itemResponses)
                .subtotal(subtotal)
                .deliveryFee(deliveryFee)
                .totalAmount(total)
                .totalItems(totalCount)
                .build();
    }
}
