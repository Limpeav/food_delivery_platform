package com.example.fooddelivery.delivery.controller;

import com.example.fooddelivery.common.response.ApiResponse;
import com.example.fooddelivery.common.security.UserPrincipal;
import com.example.fooddelivery.delivery.dto.DeliveryResponse;
import com.example.fooddelivery.delivery.entity.Delivery;
import com.example.fooddelivery.delivery.service.DeliveryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/driver/deliveries")
@PreAuthorize("hasRole('DRIVER')")
@RequiredArgsConstructor
@Tag(name = "Driver Delivery", description = "Endpoints for driver order delivery actions")
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping
    @Operation(summary = "Get deliveries history belonging to the authenticated driver")
    public ResponseEntity<ApiResponse<com.example.fooddelivery.common.response.PageResponse<DeliveryResponse>>> getMyDeliveries(
            @AuthenticationPrincipal UserPrincipal principal,
            @org.springframework.data.web.PageableDefault(size = 10, sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC) org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.domain.Page<DeliveryResponse> page = deliveryService.getMyDeliveries(principal.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(com.example.fooddelivery.common.response.PageResponse.from(page)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get specific delivery detail (strictly verifies ownership)")
    public ResponseEntity<ApiResponse<DeliveryResponse>> getDeliveryById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        DeliveryResponse delivery = deliveryService.getMyDeliveryById(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(delivery));
    }

    @GetMapping("/available")
    @Operation(summary = "Get available delivery requests waiting for a driver")
    public ResponseEntity<ApiResponse<List<DeliveryResponse>>> getAvailableDeliveries() {
        List<DeliveryResponse> list = deliveryService.getAvailableDeliveries();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/active")
    @Operation(summary = "Get current active delivery for logged-in driver")
    public ResponseEntity<ApiResponse<DeliveryResponse>> getActiveDelivery(@AuthenticationPrincipal UserPrincipal principal) {
        DeliveryResponse response = deliveryService.getCurrentDriverActiveDelivery(principal.getId())
                .orElse(null);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{id}/accept")
    @Operation(summary = "Accept an available delivery request")
    public ResponseEntity<ApiResponse<DeliveryResponse>> acceptDelivery(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        DeliveryResponse delivery = deliveryService.acceptDelivery(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Delivery accepted", delivery));
    }

    @PostMapping("/{id}/pickup")
    @Operation(summary = "Mark food as picked up from the restaurant")
    public ResponseEntity<ApiResponse<DeliveryResponse>> pickupFood(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        DeliveryResponse delivery = deliveryService.pickupFood(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Food picked up", delivery));
    }

    @PostMapping("/{id}/start-delivering")
    @Operation(summary = "Mark delivery as out for delivery")
    public ResponseEntity<ApiResponse<DeliveryResponse>> startDelivering(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        DeliveryResponse delivery = deliveryService.startDelivering(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Out for delivery", delivery));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Mark delivery as completed (delivered to customer)")
    public ResponseEntity<ApiResponse<DeliveryResponse>> completeDelivery(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        DeliveryResponse delivery = deliveryService.completeDelivery(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Delivery completed successfully", delivery));
    }
}
