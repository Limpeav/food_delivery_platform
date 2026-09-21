package com.example.fooddelivery.order.dto;

import com.example.fooddelivery.delivery.entity.Delivery;
import com.example.fooddelivery.delivery.entity.DeliveryStatus;
import com.example.fooddelivery.driver.entity.Driver;
import com.example.fooddelivery.driver.entity.DriverLocation;
import com.example.fooddelivery.order.entity.Order;
import com.example.fooddelivery.order.entity.OrderStatus;
import com.example.fooddelivery.payment.entity.Payment;
import com.example.fooddelivery.payment.entity.PaymentMethod;
import com.example.fooddelivery.payment.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private Long id;
    private Long customerId;
    private String customerName;
    private String customerPhone;

    // Restaurant details
    private Long restaurantId;
    private String restaurantName;
    private String restaurantPhone;
    private String restaurantAddress;
    private Double restaurantLatitude;
    private Double restaurantLongitude;

    // Delivery Address
    private String deliveryAddress;
    private Double deliveryLatitude;
    private Double deliveryLongitude;

    // Financials
    private BigDecimal subtotal;
    private BigDecimal deliveryFee;
    private BigDecimal discount;
    private BigDecimal totalAmount;

    // Order state
    private OrderStatus status;
    private String couponCode;
    private String notes;
    private List<OrderItemResponse> items;

    // Payment details
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private String transactionReference;

    // Delivery & Driver details
    private Long deliveryId;
    private DeliveryStatus deliveryStatus;
    private Long driverId;
    private String driverName;
    private String driverPhone;
    private String vehicleType;
    private String vehicleNumber;
    private Double driverLatitude;
    private Double driverLongitude;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static OrderResponse from(Order order, Payment payment, Delivery delivery, DriverLocation driverLocation) {
        List<OrderItemResponse> itemResponses = order.getItems() != null
                ? order.getItems().stream().map(OrderItemResponse::from).collect(Collectors.toList())
                : Collections.emptyList();

        Driver driver = delivery != null ? delivery.getDriver() : null;

        return OrderResponse.builder()
                .id(order.getId())
                .customerId(order.getCustomer().getId())
                .customerName(order.getCustomer().getName())
                .customerPhone(order.getCustomer().getPhoneNumber())
                .restaurantId(order.getRestaurant().getId())
                .restaurantName(order.getRestaurant().getName())
                .restaurantPhone(order.getRestaurant().getPhone())
                .restaurantAddress(order.getRestaurant().getAddress())
                .restaurantLatitude(order.getRestaurant().getLatitude())
                .restaurantLongitude(order.getRestaurant().getLongitude())
                .deliveryAddress(order.getDeliveryAddress())
                .deliveryLatitude(order.getDeliveryLatitude())
                .deliveryLongitude(order.getDeliveryLongitude())
                .subtotal(order.getSubtotal())
                .deliveryFee(order.getDeliveryFee())
                .discount(order.getDiscount())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .couponCode(order.getCouponCode())
                .notes(order.getNotes())
                .items(itemResponses)
                .paymentMethod(payment != null ? payment.getPaymentMethod() : null)
                .paymentStatus(payment != null ? payment.getStatus() : null)
                .transactionReference(payment != null ? payment.getTransactionReference() : null)
                .deliveryId(delivery != null ? delivery.getId() : null)
                .deliveryStatus(delivery != null ? delivery.getStatus() : null)
                .driverId(driver != null ? driver.getId() : null)
                .driverName(driver != null ? driver.getUser().getName() : null)
                .driverPhone(driver != null ? driver.getUser().getPhoneNumber() : null)
                .vehicleType(driver != null ? driver.getVehicleType() : null)
                .vehicleNumber(driver != null ? driver.getVehicleNumber() : null)
                .driverLatitude(driverLocation != null ? driverLocation.getLatitude() : null)
                .driverLongitude(driverLocation != null ? driverLocation.getLongitude() : null)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
