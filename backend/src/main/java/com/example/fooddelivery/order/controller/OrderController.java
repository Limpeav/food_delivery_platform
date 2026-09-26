package com.example.fooddelivery.order.controller;

import com.example.fooddelivery.common.response.ApiResponse;
import com.example.fooddelivery.common.response.PageResponse;
import com.example.fooddelivery.common.security.UserPrincipal;
import com.example.fooddelivery.order.dto.CreateOrderRequest;
import com.example.fooddelivery.order.dto.OrderResponse;
import com.example.fooddelivery.order.dto.OrderStatusUpdateRequest;
import com.example.fooddelivery.order.entity.OrderStatus;
import com.example.fooddelivery.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Endpoints for placing, tracking, and managing customer and restaurant orders")
public class OrderController {

    private final OrderService orderService;

    // Customer Endpoints
    @PostMapping("/api/orders")
    @Operation(summary = "Create order from current shopping cart (Customer)")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateOrderRequest request) {
        OrderResponse response = orderService.createOrder(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order created successfully", response));
    }

    @GetMapping("/api/orders")
    @Operation(summary = "Get order history for current customer")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<OrderResponse> response = orderService.getCustomerOrders(principal.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/orders/{id}")
    @Operation(summary = "Get detailed order information and delivery tracking")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderDetails(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        OrderResponse response = orderService.getOrderDetails(id, principal.getId(), principal.getRole());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/api/orders/{id}/cancel")
    @Operation(summary = "Cancel order if still pending or confirmed")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        OrderResponse response = orderService.cancelOrder(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", response));
    }

    // Restaurant Owner Endpoints
    @GetMapping("/api/restaurant/orders")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    @Operation(summary = "Get orders for logged-in owner's restaurant with optional status filter")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getRestaurantOrders(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) OrderStatus status,
            @PageableDefault(size = 15, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<OrderResponse> response = orderService.getRestaurantOrders(principal.getId(), status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/api/restaurant/orders/{id}/status")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    @Operation(summary = "Update order status by restaurant (CONFIRMED, PREPARING, READY_FOR_PICKUP, REJECTED)")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody OrderStatusUpdateRequest request) {
        OrderResponse response = orderService.updateOrderStatusByRestaurant(principal.getId(), id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Order status updated", response));
    }

    // Admin Endpoints
    @GetMapping("/api/admin/orders")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all platform orders (Admin)")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getAllOrdersAdmin(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<OrderResponse> response = orderService.getAllOrdersAdmin(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/orders/{id}/reorder")
    @Operation(summary = "Re-order: clears cart and pre-fills it with items from a previous order")
    public ResponseEntity<ApiResponse<OrderResponse>> reorder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        OrderResponse response = orderService.reorder(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Cart pre-filled with previous order items. Proceed to checkout.", response));
    }

    @GetMapping("/api/orders/{id}/eta")
    @Operation(summary = "Get estimated delivery time (ETA) for an active order based on driver GPS")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getDeliveryEta(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        java.util.Map<String, Object> eta = orderService.getDeliveryEta(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(eta));
    }
}

