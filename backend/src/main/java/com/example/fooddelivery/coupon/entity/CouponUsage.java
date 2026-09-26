package com.example.fooddelivery.coupon.entity;

import com.example.fooddelivery.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Tracks each individual coupon redemption per user to prevent duplicate usage.
 */
@Entity
@Table(name = "coupon_usages",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_coupon_user",
                columnNames = {"coupon_id", "user_id"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id", nullable = false)
    private Coupon coupon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "used_at", nullable = false, updatable = false)
    private LocalDateTime usedAt;

    @PrePersist
    protected void onCreate() {
        this.usedAt = LocalDateTime.now();
    }
}
