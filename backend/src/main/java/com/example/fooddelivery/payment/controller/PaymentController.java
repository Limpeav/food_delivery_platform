package com.example.fooddelivery.payment.controller;

import com.example.fooddelivery.common.response.ApiResponse;
import com.example.fooddelivery.common.security.UserPrincipal;
import com.example.fooddelivery.payment.bakong.BakongService;
import com.example.fooddelivery.payment.bakong.dto.KhqrResponse;
import com.example.fooddelivery.payment.bakong.dto.KhqrVerificationResponse;
import com.example.fooddelivery.payment.dto.PaymentResponse;
import com.example.fooddelivery.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Payment", description = "Endpoints for payment status retrieval, history, and Bakong KHQR online payment")
public class PaymentController {

    private final PaymentService paymentService;
    private final BakongService bakongService;

    @GetMapping("/api/orders/{orderId}/payment")
    @Operation(summary = "Get payment details for a specific order (owner of order only)")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserPrincipal principal) {
        PaymentResponse response = paymentService.getPaymentResponseByOrderId(orderId, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/payments/history")
    @Operation(summary = "Get current user's full payment history")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getMyPaymentHistory(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<PaymentResponse> history = paymentService.getPaymentHistory(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @GetMapping("/api/admin/payments")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all platform payments (Admin only)")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAllPayments() {
        List<PaymentResponse> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(ApiResponse.success(payments));
    }

    @GetMapping("/api/payments/{orderId}/khqr")
    @Operation(summary = "Generate or retrieve Bakong KHQR for online payment")
    public ResponseEntity<ApiResponse<KhqrResponse>> getKhqr(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserPrincipal principal) {
        KhqrResponse response = bakongService.generateKhqr(orderId, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/payments/{orderId}/khqr/verify")
    @Operation(summary = "Verify Bakong KHQR payment via Open API")
    public ResponseEntity<ApiResponse<KhqrVerificationResponse>> verifyKhqr(
            @PathVariable Long orderId,
            @RequestParam(value = "simulate", defaultValue = "false") boolean simulate,
            @AuthenticationPrincipal UserPrincipal principal) {
        KhqrVerificationResponse response = bakongService.verifyPayment(orderId, principal.getId(), simulate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
