package com.example.fooddelivery.common.exception;

public class InvalidOrderStatusException extends BusinessException {
    public InvalidOrderStatusException(String message) {
        super(message);
    }
}
