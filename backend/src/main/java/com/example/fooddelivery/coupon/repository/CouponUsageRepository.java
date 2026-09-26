package com.example.fooddelivery.coupon.repository;

import com.example.fooddelivery.coupon.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {

    boolean existsByCouponIdAndUserId(Long couponId, Long userId);
}
