package com.example.fooddelivery.payment.bakong.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KhqrVerificationResponse {
    private Long orderId;
    private boolean verified;
    private String paymentStatus;
    private String transactionHash;
    private String md5;
    private BigDecimal amount;
    private String currency;
    private String message;
    private LocalDateTime verifiedAt;
}
