package com.example.fooddelivery.driver.dto;

import com.example.fooddelivery.delivery.dto.DeliveryResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverDashboardStats {

    private Boolean online;
    private Boolean approved;
    private Double rating;
    private DeliveryResponse activeDelivery;
    private long completedDeliveries;
    private BigDecimal todayEarnings;
    private BigDecimal totalEarnings;
}
