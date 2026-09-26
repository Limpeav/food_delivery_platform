package com.example.fooddelivery.payment.bakong.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KhqrResponse {
    private Long orderId;
    private String qrCode;
    private String qrImage;
    private String md5;
    private BigDecimal amount;
    private String currency;
    private String merchantName;
    private String merchantAccountId;
    private String paymentStatus;
    private boolean simulated;
}
