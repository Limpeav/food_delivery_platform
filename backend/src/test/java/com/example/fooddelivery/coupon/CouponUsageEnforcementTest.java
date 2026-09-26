package com.example.fooddelivery.coupon;

import com.example.fooddelivery.common.exception.BadRequestException;
import com.example.fooddelivery.coupon.entity.Coupon;
import com.example.fooddelivery.coupon.entity.CouponUsage;
import com.example.fooddelivery.coupon.entity.DiscountType;
import com.example.fooddelivery.coupon.repository.CouponRepository;
import com.example.fooddelivery.coupon.repository.CouponUsageRepository;
import com.example.fooddelivery.coupon.service.CouponService;
import com.example.fooddelivery.user.entity.User;
import com.example.fooddelivery.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CouponUsageEnforcementTest {

    @Mock private CouponRepository couponRepository;
    @Mock private CouponUsageRepository couponUsageRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private CouponService couponService;

    private Coupon validCoupon() {
        return Coupon.builder()
                .id(1L)
                .code("SAVE10")
                .discountType(DiscountType.FIXED_AMOUNT)
                .discountValue(new BigDecimal("10.00"))
                .minimumOrderAmount(new BigDecimal("20.00"))
                .startDate(LocalDate.now().minusDays(1))
                .expirationDate(LocalDate.now().plusDays(30))
                .active(true)
                .usageLimit(100)
                .usedCount(0)
                .build();
    }

    @Test
    void validateAndCalculateDiscountForUser_FirstUse_ReturnsDiscount() {
        Coupon coupon = validCoupon();
        when(couponRepository.findByCodeIgnoreCase("SAVE10")).thenReturn(Optional.of(coupon));
        when(couponUsageRepository.existsByCouponIdAndUserId(1L, 42L)).thenReturn(false);

        BigDecimal discount = couponService.validateAndCalculateDiscountForUser("SAVE10", new BigDecimal("50.00"), 42L);

        assertEquals(new BigDecimal("10.00"), discount);
    }

    @Test
    void validateAndCalculateDiscountForUser_AlreadyUsed_ThrowsBadRequest() {
        Coupon coupon = validCoupon();
        when(couponRepository.findByCodeIgnoreCase("SAVE10")).thenReturn(Optional.of(coupon));
        when(couponUsageRepository.existsByCouponIdAndUserId(1L, 42L)).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> couponService.validateAndCalculateDiscountForUser("SAVE10", new BigDecimal("50.00"), 42L));
        assertTrue(ex.getMessage().contains("already used"));
    }

    @Test
    void recordUsageForUser_PersistsUsageAndIncrementsCount() {
        Coupon coupon = validCoupon();
        User user = User.builder().id(42L).build();

        when(couponRepository.findByCodeIgnoreCase("save10")).thenReturn(Optional.of(coupon));
        when(userRepository.findById(42L)).thenReturn(Optional.of(user));
        when(couponUsageRepository.save(any(CouponUsage.class))).thenAnswer(inv -> inv.getArgument(0));
        when(couponRepository.save(any(Coupon.class))).thenReturn(coupon);

        couponService.recordUsageForUser("save10", 42L);

        verify(couponUsageRepository).save(any(CouponUsage.class));
        assertEquals(1, coupon.getUsedCount());
    }

    @Test
    void validateAndCalculateDiscountForUser_NullCode_ReturnsZero() {
        BigDecimal discount = couponService.validateAndCalculateDiscountForUser(null, new BigDecimal("50.00"), 1L);
        assertEquals(BigDecimal.ZERO, discount);
    }
}
