package com.example.fooddelivery.common.ratelimit;

import com.example.fooddelivery.common.exception.RateLimitExceededException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
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
    @DisplayName("Should allow requests within the limit")
    void tryAcquire_WithinLimit_ReturnsTrue() {
        String key = "test:user:1";
        assertTrue(rateLimiterService.tryAcquire(key, 3, 60));
        assertTrue(rateLimiterService.tryAcquire(key, 3, 60));
        assertTrue(rateLimiterService.tryAcquire(key, 3, 60));
    }

    @Test
    @DisplayName("Should block the request that exceeds the limit")
    void tryAcquire_ExceedsLimit_ReturnsFalse() {
        String key = "test:user:2";
        assertTrue(rateLimiterService.tryAcquire(key, 2, 60));
        assertTrue(rateLimiterService.tryAcquire(key, 2, 60));
        assertFalse(rateLimiterService.tryAcquire(key, 2, 60));
    }

    @Test
    @DisplayName("checkLimit should throw RateLimitExceededException when limit is exceeded")
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
    @DisplayName("reset() should allow acquiring again after being blocked")
    void reset_AllowsAcquiringAgain() {
        String key = "test:user:4";
        rateLimiterService.tryAcquire(key, 1, 60);
        assertFalse(rateLimiterService.tryAcquire(key, 1, 60));

        rateLimiterService.reset(key);
        assertTrue(rateLimiterService.tryAcquire(key, 1, 60));
    }

    @Test
    @DisplayName("checkLimit should use default message when null is passed")
    void checkLimit_NullMessage_UsesDefaultMessage() {
        String key = "test:user:5";
        rateLimiterService.tryAcquire(key, 1, 60);

        RateLimitExceededException ex = assertThrows(
                RateLimitExceededException.class,
                () -> rateLimiterService.checkLimit(key, 1, 60, null)
        );
        assertTrue(ex.getMessage().contains("Rate limit exceeded"));
    }

    @Test
    @DisplayName("evictExpiredBuckets should remove entries whose window has passed")
    void evictExpiredBuckets_RemovesExpiredEntries() {
        // Window of 0 seconds — expires immediately
        String key = "test:evict:1";
        rateLimiterService.tryAcquire(key, 5, 0); // expires at ~now

        // Evict — bucket should be gone
        rateLimiterService.evictExpiredBuckets();

        // After eviction the key is fresh — should be allowed again
        assertTrue(rateLimiterService.tryAcquire(key, 5, 60),
                "After eviction, counter should reset and allow new requests");
    }

    @Test
    @DisplayName("Independent keys should not interfere with each other")
    void differentKeys_DoNotInterfere() {
        String key1 = "test:isolation:a";
        String key2 = "test:isolation:b";

        // Exhaust key1
        rateLimiterService.tryAcquire(key1, 1, 60);
        assertFalse(rateLimiterService.tryAcquire(key1, 1, 60), "key1 should be blocked");

        // key2 should be unaffected
        assertTrue(rateLimiterService.tryAcquire(key2, 1, 60), "key2 should still be allowed");
    }
}

