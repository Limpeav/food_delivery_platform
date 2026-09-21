package com.example.fooddelivery.coupon.service;

import com.example.fooddelivery.common.exception.BadRequestException;
import com.example.fooddelivery.common.exception.ResourceNotFoundException;
import com.example.fooddelivery.coupon.dto.CouponRequest;
import com.example.fooddelivery.coupon.dto.CouponResponse;
import com.example.fooddelivery.coupon.entity.Coupon;
import com.example.fooddelivery.coupon.entity.DiscountType;
import com.example.fooddelivery.coupon.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    @Transactional(readOnly = true)
    public List<CouponResponse> getActiveCoupons() {
        return couponRepository.findByActiveTrue().stream()
                .filter(c -> !c.getExpirationDate().isBefore(LocalDate.now()))
                .map(CouponResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CouponResponse> getAllCouponsAdmin() {
        return couponRepository.findAll().stream()
                .map(CouponResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Coupon findCouponByCode(String code) {
        return couponRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new BadRequestException("Coupon not found: " + code));
    }

    /**
     * Validates the coupon and returns the calculated discount amount.
     */
    @Transactional(readOnly = true)
    public BigDecimal validateAndCalculateDiscount(String code, BigDecimal subtotal) {
        if (code == null || code.trim().isEmpty()) {
            return BigDecimal.ZERO;
        }

        Coupon coupon = findCouponByCode(code);
        LocalDate today = LocalDate.now();

        if (!Boolean.TRUE.equals(coupon.getActive())) {
            throw new BadRequestException("Coupon is not active");
        }

        if (today.isBefore(coupon.getStartDate())) {
            throw new BadRequestException("Coupon is not yet valid");
        }

        if (today.isAfter(coupon.getExpirationDate())) {
            throw new BadRequestException("Coupon has expired");
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Coupon usage limit has been reached");
        }

        if (coupon.getMinimumOrderAmount() != null && subtotal.compareTo(coupon.getMinimumOrderAmount()) < 0) {
            throw new BadRequestException(String.format("Minimum order amount for coupon %s is $%.2f",
                    coupon.getCode(), coupon.getMinimumOrderAmount()));
        }

        BigDecimal discount = BigDecimal.ZERO;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = subtotal.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaximumDiscount() != null && discount.compareTo(coupon.getMaximumDiscount()) > 0) {
                discount = coupon.getMaximumDiscount();
            }
        } else if (coupon.getDiscountType() == DiscountType.FIXED_AMOUNT) {
            discount = coupon.getDiscountValue();
        }

        // Discount cannot exceed subtotal
        if (discount.compareTo(subtotal) > 0) {
            discount = subtotal;
        }

        return discount;
    }

    @Transactional
    public void recordUsage(String code) {
        if (code != null && !code.trim().isEmpty()) {
            couponRepository.findByCodeIgnoreCase(code.trim()).ifPresent(coupon -> {
                coupon.setUsedCount(coupon.getUsedCount() + 1);
                couponRepository.save(coupon);
            });
        }
    }

    @Transactional
    public CouponResponse createCoupon(CouponRequest request) {
        if (couponRepository.existsByCodeIgnoreCase(request.getCode().trim())) {
            throw new BadRequestException("Coupon code already exists: " + request.getCode());
        }

        Coupon coupon = Coupon.builder()
                .code(request.getCode().trim().toUpperCase())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minimumOrderAmount(request.getMinimumOrderAmount() != null ? request.getMinimumOrderAmount() : BigDecimal.ZERO)
                .maximumDiscount(request.getMaximumDiscount())
                .usageLimit(request.getUsageLimit() != null ? request.getUsageLimit() : 100)
                .usedCount(0)
                .startDate(request.getStartDate())
                .expirationDate(request.getExpirationDate())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        Coupon saved = couponRepository.save(coupon);
        log.info("Coupon created: {}", saved.getCode());
        return CouponResponse.from(saved);
    }

    @Transactional
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));
        couponRepository.delete(coupon);
        log.info("Coupon deleted: {}", id);
    }
}
