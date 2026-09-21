package com.example.fooddelivery.restaurant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantDashboardStats {

    private long todayOrders;
    private BigDecimal todayRevenue;
    private long pendingOrders;
    private long completedOrders;
    private Double rating;
    private Integer reviewCount;
    private List<Map<String, Object>> topSellingFoods;
}
