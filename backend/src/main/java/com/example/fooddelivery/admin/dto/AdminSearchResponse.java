package com.example.fooddelivery.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminSearchResponse {

    private List<RestaurantResult> restaurants;
    private List<UserResult> users;
    private List<OrderResult> orders;
    private List<DriverResult> drivers;
    private long totalMatches;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RestaurantResult {
        private Long id;
        private String name;
        private String status;
        private String address;
        private String phone;
        private String logoUrl;
        private Double rating;
        private String ownerName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserResult {
        private Long id;
        private String name;
        private String email;
        private String phoneNumber;
        private String role;
        private String status;
        private String profileImageUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderResult {
        private Long id;
        private String orderNumber;
        private String status;
        private BigDecimal totalAmount;
        private String customerName;
        private String customerEmail;
        private String restaurantName;
        private String deliveryAddress;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DriverResult {
        private Long id;
        private Long userId;
        private String name;
        private String email;
        private String phoneNumber;
        private String vehicleType;
        private String vehicleNumber;
        private Boolean approved;
        private Boolean online;
        private Double rating;
    }
}
