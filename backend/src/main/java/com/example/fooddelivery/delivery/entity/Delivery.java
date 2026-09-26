package com.example.fooddelivery.delivery.entity;

import com.example.fooddelivery.driver.entity.Driver;
import com.example.fooddelivery.order.entity.Order;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "deliveries", indexes = {
    @Index(name = "idx_deliveries_driver_status", columnList = "driver_id, status"),
    @Index(name = "idx_deliveries_order_id", columnList = "order_id"),
    @Index(name = "idx_deliveries_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Driver driver;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DeliveryStatus status = DeliveryStatus.WAITING_FOR_DRIVER;

    @Column(name = "pickup_time")
    private LocalDateTime pickupTime;

    @Column(name = "picked_up_time")
    private LocalDateTime pickedUpTime;

    @Column(name = "delivered_time")
    private LocalDateTime deliveredTime;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = DeliveryStatus.WAITING_FOR_DRIVER;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
