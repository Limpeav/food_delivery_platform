package com.example.fooddelivery.coupon.controller;

import com.example.fooddelivery.common.response.ApiResponse;
import com.example.fooddelivery.coupon.dto.CouponRequest;
import com.example.fooddelivery.coupon.dto.CouponResponse;
import com.example.fooddelivery.coupon.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Coupons", description = "Endpoints for managing and redeeming discount coupons")
public class CouponController {

    private final CouponService couponService;

    @GetMapping("/api/coupons")
    @Operation(summary = "Get available active coupons")
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getActiveCoupons() {
        List<CouponResponse> coupons = couponService.getActiveCoupons();
        return ResponseEntity.ok(ApiResponse.success(coupons));
    }

    @PostMapping("/api/coupons/validate")
    @Operation(summary = "Validate a coupon against a subtotal amount")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateCoupon(
            @RequestParam String code,
            @RequestParam BigDecimal subtotal) {
        BigDecimal discount = couponService.validateAndCalculateDiscount(code, subtotal);
        return ResponseEntity.ok(ApiResponse.success("Coupon is valid", Map.of(
                "code", code.toUpperCase(),
                "discount", discount,
                "valid", true
        )));
    }

    @GetMapping("/api/admin/coupons")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all coupons for admin")
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getAllCoupons() {
        List<CouponResponse> coupons = couponService.getAllCouponsAdmin();
        return ResponseEntity.ok(ApiResponse.success(coupons));
    }

    @PostMapping("/api/admin/coupons")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create coupon (Admin only)")
    public ResponseEntity<ApiResponse<CouponResponse>> createCoupon(@Valid @RequestBody CouponRequest request) {
        CouponResponse response = couponService.createCoupon(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Coupon created successfully", response));
    }

    @DeleteMapping("/api/admin/coupons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete coupon (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon deleted successfully", null));
    }
}
