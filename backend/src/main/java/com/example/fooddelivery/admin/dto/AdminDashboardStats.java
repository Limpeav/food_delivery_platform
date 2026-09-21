package com.example.fooddelivery.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStats {

    private long totalCustomers;
    private long totalRestaurants;
    private long totalDrivers;
    private long totalOrders;
    private long todayOrders;
    private BigDecimal todayRevenue;
    private BigDecimal monthlyRevenue;
    private BigDecimal totalRevenue;
    private long pendingRestaurants;
    private long pendingDrivers;
    private Map<String, Long> orderStatusDistribution;
}
