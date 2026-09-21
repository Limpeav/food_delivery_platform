package com.example.fooddelivery.order;

import com.example.fooddelivery.common.exception.InvalidOrderStatusException;
import com.example.fooddelivery.order.entity.OrderStatus;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class OrderStatusTest {

    @Test
    void validTransitions_DoNotThrow() {
        assertDoesNotThrow(() -> OrderStatus.PENDING.validateTransitionTo(OrderStatus.CONFIRMED));
        assertDoesNotThrow(() -> OrderStatus.CONFIRMED.validateTransitionTo(OrderStatus.PREPARING));
        assertDoesNotThrow(() -> OrderStatus.PREPARING.validateTransitionTo(OrderStatus.READY_FOR_PICKUP));
        assertDoesNotThrow(() -> OrderStatus.READY_FOR_PICKUP.validateTransitionTo(OrderStatus.DRIVER_ASSIGNED));
        assertDoesNotThrow(() -> OrderStatus.DRIVER_ASSIGNED.validateTransitionTo(OrderStatus.PICKED_UP));
        assertDoesNotThrow(() -> OrderStatus.PICKED_UP.validateTransitionTo(OrderStatus.OUT_FOR_DELIVERY));
        assertDoesNotThrow(() -> OrderStatus.OUT_FOR_DELIVERY.validateTransitionTo(OrderStatus.DELIVERED));
    }

    @Test
    void invalidTransitions_ThrowInvalidOrderStatusException() {
        assertThrows(InvalidOrderStatusException.class,
                () -> OrderStatus.DELIVERED.validateTransitionTo(OrderStatus.PREPARING));

        assertThrows(InvalidOrderStatusException.class,
                () -> OrderStatus.CANCELLED.validateTransitionTo(OrderStatus.CONFIRMED));

        assertThrows(InvalidOrderStatusException.class,
                () -> OrderStatus.PENDING.validateTransitionTo(OrderStatus.DELIVERED));

        assertThrows(InvalidOrderStatusException.class,
                () -> OrderStatus.REJECTED.validateTransitionTo(OrderStatus.READY_FOR_PICKUP));
    }
}
