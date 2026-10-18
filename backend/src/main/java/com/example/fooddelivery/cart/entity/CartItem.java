package com.example.fooddelivery.cart.entity;

import com.example.fooddelivery.food.entity.FoodItem;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "cart_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_item_id", nullable = false)
    private FoodItem foodItem;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "unit_price", precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "selected_options")
    private String selectedOptions;

    @Column(name = "special_instructions")
    private String specialInstructions;

    public BigDecimal getSubtotal() {
        BigDecimal effectivePrice = (unitPrice != null) ? unitPrice : (foodItem != null ? foodItem.getPrice() : BigDecimal.ZERO);
        if (effectivePrice == null) {
            return BigDecimal.ZERO;
        }
        return effectivePrice.multiply(BigDecimal.valueOf(quantity));
    }
}
