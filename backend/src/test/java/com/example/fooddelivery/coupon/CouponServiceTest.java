package com.example.fooddelivery.coupon;

import com.example.fooddelivery.common.exception.BadRequestException;
import com.example.fooddelivery.coupon.entity.Coupon;
import com.example.fooddelivery.coupon.entity.DiscountType;
import com.example.fooddelivery.coupon.repository.CouponRepository;
import com.example.fooddelivery.coupon.service.CouponService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    @Mock
    private CouponRepository couponRepository;

    @InjectMocks
    private CouponService couponService;

    @Test
    void validateAndCalculateDiscount_PercentageWithMaxCap() {
        Coupon coupon = Coupon.builder()
                .code("SAVE20")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal("20.00")) // 20%
                .minimumOrderAmount(new BigDecimal("10.00"))
                .maximumDiscount(new BigDecimal("5.00")) // capped at $5
                .startDate(LocalDate.now().minusDays(1))
                .expirationDate(LocalDate.now().plusDays(10))
                .active(true)
                .usageLimit(100)
                .usedCount(0)
                .build();

        when(couponRepository.findByCodeIgnoreCase("SAVE20")).thenReturn(Optional.of(coupon));

        // Subtotal $50 -> 20% is $10 -> capped at $5
        BigDecimal discount = couponService.validateAndCalculateDiscount("SAVE20", new BigDecimal("50.00"));
        assertEquals(new BigDecimal("5.00"), discount);

        // Subtotal $20 -> 20% is $4 -> within cap
        BigDecimal discount2 = couponService.validateAndCalculateDiscount("SAVE20", new BigDecimal("20.00"));
        assertEquals(new BigDecimal("4.00"), discount2);
    }

    @Test
    void validateAndCalculateDiscount_FixedAmount() {
        Coupon coupon = Coupon.builder()
                .code("FIXED3")
                .discountType(DiscountType.FIXED_AMOUNT)
                .discountValue(new BigDecimal("3.00"))
                .minimumOrderAmount(new BigDecimal("15.00"))
                .startDate(LocalDate.now().minusDays(1))
                .expirationDate(LocalDate.now().plusDays(10))
                .active(true)
                .usageLimit(100)
                .usedCount(0)
                .build();

        when(couponRepository.findByCodeIgnoreCase("FIXED3")).thenReturn(Optional.of(coupon));

        BigDecimal discount = couponService.validateAndCalculateDiscount("FIXED3", new BigDecimal("25.00"));
        assertEquals(new BigDecimal("3.00"), discount);
    }

    @Test
    void validateAndCalculateDiscount_Expired_ThrowsBadRequest() {
        Coupon coupon = Coupon.builder()
                .code("EXPIRED")
                .discountType(DiscountType.FIXED_AMOUNT)
                .discountValue(new BigDecimal("5.00"))
                .startDate(LocalDate.now().minusDays(10))
                .expirationDate(LocalDate.now().minusDays(1)) // Expired yesterday
                .active(true)
                .build();

        when(couponRepository.findByCodeIgnoreCase("EXPIRED")).thenReturn(Optional.of(coupon));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                couponService.validateAndCalculateDiscount("EXPIRED", new BigDecimal("30.00")));
        assertTrue(ex.getMessage().contains("expired"));
    }

    @Test
    void validateAndCalculateDiscount_MinOrderNotMet_ThrowsBadRequest() {
        Coupon coupon = Coupon.builder()
                .code("BIGORDER")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal("10.00"))
                .minimumOrderAmount(new BigDecimal("50.00"))
                .startDate(LocalDate.now().minusDays(1))
                .expirationDate(LocalDate.now().plusDays(10))
                .active(true)
                .build();

        when(couponRepository.findByCodeIgnoreCase("BIGORDER")).thenReturn(Optional.of(coupon));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                couponService.validateAndCalculateDiscount("BIGORDER", new BigDecimal("25.00")));
        assertTrue(ex.getMessage().contains("Minimum order amount"));
    }
}
