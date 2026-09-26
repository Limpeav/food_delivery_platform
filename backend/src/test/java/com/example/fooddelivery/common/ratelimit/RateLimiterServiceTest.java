package com.example.fooddelivery.common.ratelimit;

import com.example.fooddelivery.common.exception.RateLimitExceededException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class RateLimiterServiceTest {

    private RateLimiterService rateLimiterService;

    @BeforeEach
    void setUp() {
        // Test in-memory fallback by passing null StringRedisTemplate
        rateLimiterService = new RateLimiterService(null);
    }

    @Test
    void tryAcquire_WithinLimit_ReturnsTrue() {
        String key = "test:user:1";
        assertTrue(rateLimiterService.tryAcquire(key, 3, 60));
        assertTrue(rateLimiterService.tryAcquire(key, 3, 60));
        assertTrue(rateLimiterService.tryAcquire(key, 3, 60));
    }

    @Test
    void tryAcquire_ExceedsLimit_ReturnsFalse() {
        String key = "test:user:2";
        assertTrue(rateLimiterService.tryAcquire(key, 2, 60));
        assertTrue(rateLimiterService.tryAcquire(key, 2, 60));
        assertFalse(rateLimiterService.tryAcquire(key, 2, 60));
    }

    @Test
    void checkLimit_ExceedsLimit_ThrowsRateLimitExceededException() {
        String key = "test:user:3";
        rateLimiterService.tryAcquire(key, 1, 60);

        RateLimitExceededException ex = assertThrows(
                RateLimitExceededException.class,
                () -> rateLimiterService.checkLimit(key, 1, 60, "Limit exceeded")
        );
        assertEquals("Limit exceeded", ex.getMessage());
    }

    @Test
    void reset_AllowsAcquiringAgain() {
        String key = "test:user:4";
        rateLimiterService.tryAcquire(key, 1, 60);
        assertFalse(rateLimiterService.tryAcquire(key, 1, 60));

        rateLimiterService.reset(key);
        assertTrue(rateLimiterService.tryAcquire(key, 1, 60));
    }
}
