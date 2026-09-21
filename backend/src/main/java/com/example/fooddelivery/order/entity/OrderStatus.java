package com.example.fooddelivery.order.entity;

import com.example.fooddelivery.common.exception.InvalidOrderStatusException;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

public enum OrderStatus {
    PENDING,
    CONFIRMED,
    PREPARING,
    READY_FOR_PICKUP,
    DRIVER_ASSIGNED,
    PICKED_UP,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED,
    REJECTED;

    private static final Map<OrderStatus, Set<OrderStatus>> VALID_TRANSITIONS = Map.of(
            PENDING, EnumSet.of(CONFIRMED, REJECTED, CANCELLED),
            CONFIRMED, EnumSet.of(PREPARING, CANCELLED),
            PREPARING, EnumSet.of(READY_FOR_PICKUP),
            READY_FOR_PICKUP, EnumSet.of(DRIVER_ASSIGNED, CANCELLED),
            DRIVER_ASSIGNED, EnumSet.of(PICKED_UP, OUT_FOR_DELIVERY, CANCELLED),
            PICKED_UP, EnumSet.of(OUT_FOR_DELIVERY),
            OUT_FOR_DELIVERY, EnumSet.of(DELIVERED),
            DELIVERED, EnumSet.noneOf(OrderStatus.class),
            CANCELLED, EnumSet.noneOf(OrderStatus.class),
            REJECTED, EnumSet.noneOf(OrderStatus.class)
    );

    public boolean canTransitionTo(OrderStatus next) {
        Set<OrderStatus> allowed = VALID_TRANSITIONS.get(this);
        return allowed != null && allowed.contains(next);
    }

    public void validateTransitionTo(OrderStatus next) {
        if (!canTransitionTo(next)) {
            throw new InvalidOrderStatusException(
                    String.format("Invalid order status transition from %s to %s", this.name(), next.name())
            );
        }
    }
}
