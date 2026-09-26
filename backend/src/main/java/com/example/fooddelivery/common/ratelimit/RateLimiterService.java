package com.example.fooddelivery.common.ratelimit;

import com.example.fooddelivery.common.exception.RateLimitExceededException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * High-performance, resilient rate limiter service.
 * Primary storage: Redis (distributed token/counter bucket with TTL).
 * Fallback storage: In-memory ConcurrentHashMap if Redis is unreachable or absent.
 */
@Slf4j
@Service
public class RateLimiterService {

    private final StringRedisTemplate redisTemplate;
    private final ConcurrentHashMap<String, InMemoryBucket> inMemoryBuckets = new ConcurrentHashMap<>();

    public RateLimiterService(@Autowired(required = false) StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Checks rate limit and throws RateLimitExceededException if exceeded.
     */
    public void checkLimit(String key, int maxRequests, int windowSeconds, String message) {
        if (!tryAcquire(key, maxRequests, windowSeconds)) {
            throw new RateLimitExceededException(message != null ? message : "Rate limit exceeded. Please try again later.");
        }
    }

    /**
     * Tries to acquire a permit. Returns true if permitted, false if limit exceeded.
     */
    public boolean tryAcquire(String key, int maxRequests, int windowSeconds) {
        if (redisTemplate != null) {
            try {
                String redisKey = "ratelimit:" + key;
                Long count = redisTemplate.opsForValue().increment(redisKey);
                if (count != null && count == 1L) {
                    redisTemplate.expire(redisKey, windowSeconds, TimeUnit.SECONDS);
                }
                return count != null && count <= maxRequests;
            } catch (Exception e) {
                log.warn("Redis rate limiter failed for key '{}': {}. Falling back to in-memory limiter.", key, e.getMessage());
            }
        }
        return tryAcquireInMemory(key, maxRequests, windowSeconds);
    }

    /**
     * In-memory sliding window / fixed-window counter with atomic reset.
     */
    private boolean tryAcquireInMemory(String key, int maxRequests, int windowSeconds) {
        long now = System.currentTimeMillis();
        long windowMillis = windowSeconds * 1000L;

        InMemoryBucket bucket = inMemoryBuckets.compute(key, (k, existing) -> {
            if (existing == null || now > existing.expiresAt) {
                return new InMemoryBucket(new AtomicInteger(1), now + windowMillis);
            }
            existing.counter.incrementAndGet();
            return existing;
        });

        return bucket.counter.get() <= maxRequests;
    }

    /**
     * Manually reset limit for a key (useful for tests or unblocking).
     */
    public void reset(String key) {
        if (redisTemplate != null) {
            try {
                redisTemplate.delete("ratelimit:" + key);
            } catch (Exception ignored) {
            }
        }
        inMemoryBuckets.remove(key);
    }

    private record InMemoryBucket(AtomicInteger counter, long expiresAt) {}
}
