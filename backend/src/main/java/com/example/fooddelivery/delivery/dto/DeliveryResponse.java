package com.example.fooddelivery.delivery.dto;

import com.example.fooddelivery.delivery.entity.Delivery;
import com.example.fooddelivery.delivery.entity.DeliveryStatus;
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
public class DeliveryResponse {

    private Long id;
    private Long orderId;
    private Long driverId;
    private String driverName;
    private String driverPhone;
    private DeliveryStatus status;
    private String restaurantName;
    private String restaurantAddress;
    private String restaurantPhone;
    private Double restaurantLatitude;
    private Double restaurantLongitude;
    private String customerName;
    private String customerPhone;
    private String deliveryAddress;
    private Double deliveryLatitude;
    private Double deliveryLongitude;
    private BigDecimal totalAmount;
    private BigDecimal deliveryFee;
    private LocalDateTime pickupTime;
    private LocalDateTime pickedUpTime;
    private LocalDateTime deliveredTime;
    private LocalDateTime createdAt;

    public static DeliveryResponse from(Delivery delivery) {
        if (delivery == null) {
            return null;
        }
        com.example.fooddelivery.order.entity.Order order = delivery.getOrder();
        com.example.fooddelivery.driver.entity.Driver driver = delivery.getDriver();
        com.example.fooddelivery.user.entity.User driverUser = (driver != null) ? driver.getUser() : null;
        com.example.fooddelivery.restaurant.entity.Restaurant restaurant = (order != null) ? order.getRestaurant() : null;
        com.example.fooddelivery.user.entity.User customer = (order != null) ? order.getCustomer() : null;

        return DeliveryResponse.builder()
                .id(delivery.getId())
                .orderId(order != null ? order.getId() : null)
                .driverId(driver != null ? driver.getId() : null)
                .driverName(driverUser != null ? driverUser.getName() : null)
                .driverPhone(driverUser != null ? driverUser.getPhoneNumber() : null)
                .status(delivery.getStatus())
                .restaurantName(restaurant != null ? restaurant.getName() : null)
                .restaurantAddress(restaurant != null ? restaurant.getAddress() : null)
                .restaurantPhone(restaurant != null ? restaurant.getPhone() : null)
                .restaurantLatitude(restaurant != null ? restaurant.getLatitude() : null)
                .restaurantLongitude(restaurant != null ? restaurant.getLongitude() : null)
                .customerName(customer != null ? customer.getName() : null)
                .customerPhone(customer != null ? customer.getPhoneNumber() : null)
                .deliveryAddress(order != null ? order.getDeliveryAddress() : null)
                .deliveryLatitude(order != null ? order.getDeliveryLatitude() : null)
                .deliveryLongitude(order != null ? order.getDeliveryLongitude() : null)
                .totalAmount(order != null ? order.getTotalAmount() : null)
                .deliveryFee(order != null ? order.getDeliveryFee() : null)
                .pickupTime(delivery.getPickupTime())
                .pickedUpTime(delivery.getPickedUpTime())
                .deliveredTime(delivery.getDeliveredTime())
                .createdAt(delivery.getCreatedAt())
                .build();
    }
}
