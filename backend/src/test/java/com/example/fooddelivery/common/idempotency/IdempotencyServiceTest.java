package com.example.fooddelivery.common.idempotency;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class IdempotencyServiceTest {

    private IdempotencyService idempotencyService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        idempotencyService = new IdempotencyService(null, objectMapper);
    }

    @Test
    void acquire_FirstTime_ReturnsTrue() {
        String key = "test-key-1";
        Long userId = 10L;

        boolean acquired = idempotencyService.acquire(key, userId);

        assertTrue(acquired);
    }

    @Test
    void acquire_SecondTime_ReturnsFalse() {
        String key = "test-key-2";
        Long userId = 10L;

        assertTrue(idempotencyService.acquire(key, userId));
        assertFalse(idempotencyService.acquire(key, userId));
    }

    @Test
    void complete_StoresAndReturnsCachedResponse() {
        String key = "test-key-3";
        Long userId = 10L;

        idempotencyService.acquire(key, userId);
        Map<String, String> response = Map.of("status", "SUCCESS", "orderId", "123");
        idempotencyService.complete(key, userId, response);

        @SuppressWarnings("unchecked")
        Map<String, String> cached = idempotencyService.getCachedResponse(key, userId, Map.class);

        assertNotNull(cached);
        assertEquals("SUCCESS", cached.get("status"));
        assertEquals("123", cached.get("orderId"));
    }

    @Test
    void release_AllowsReAcquire() {
        String key = "test-key-4";
        Long userId = 10L;

        assertTrue(idempotencyService.acquire(key, userId));
        assertFalse(idempotencyService.acquire(key, userId));

        idempotencyService.release(key, userId);

        assertTrue(idempotencyService.acquire(key, userId));
    }

    @Test
    void acquire_NullOrBlankKey_ReturnsTrue() {
        assertTrue(idempotencyService.acquire(null, 1L));
        assertTrue(idempotencyService.acquire("", 1L));
        assertTrue(idempotencyService.acquire("   ", 1L));
    }
}
