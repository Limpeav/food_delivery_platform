package com.example.fooddelivery.order.dto;

import com.example.fooddelivery.payment.entity.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    @NotNull(message = "Delivery address ID is required")
    private Long addressId;

    private String couponCode;

    @NotNull(message = "Payment method is required (CASH_ON_DELIVERY or ONLINE_PAYMENT)")
    private PaymentMethod paymentMethod;

    private String notes;
}
