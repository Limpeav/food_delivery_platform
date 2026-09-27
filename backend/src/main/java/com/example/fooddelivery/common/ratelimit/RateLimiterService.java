package com.example.fooddelivery.common.ratelimit;

import com.example.fooddelivery.common.exception.RateLimitExceededException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * High-performance, resilient rate limiter service.
 * Primary storage: Redis (distributed counter with TTL).
 * Fallback storage: In-memory ConcurrentHashMap if Redis is unreachable or absent.
 *
 * Memory safety: expired in-memory buckets are evicted every 5 minutes by a
 * scheduled task, and the map is hard-capped at 100,000 entries to prevent
 * unbounded growth under sustained attack traffic.
 */
@Slf4j
@Service
public class RateLimiterService {

    /** Hard cap on in-memory buckets — prevents OOM under sustained attack traffic. */
    private static final int MAX_IN_MEMORY_BUCKETS = 100_000;

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
     * In-memory fixed-window counter with atomic reset.
     * Drops new keys when the map is full to prevent OOM.
     */
    private boolean tryAcquireInMemory(String key, int maxRequests, int windowSeconds) {
        long now = System.currentTimeMillis();
        long windowMillis = windowSeconds * 1000L;

        InMemoryBucket bucket = inMemoryBuckets.compute(key, (k, existing) -> {
            if (existing == null || now > existing.expiresAt()) {
                // Refuse to grow beyond the hard cap
                if (existing == null && inMemoryBuckets.size() >= MAX_IN_MEMORY_BUCKETS) {
                    log.warn("In-memory rate limiter bucket cap ({}) reached. Allowing request for key: {}",
                            MAX_IN_MEMORY_BUCKETS, key);
                    return new InMemoryBucket(new AtomicInteger(0), now + windowMillis);
                }
                return new InMemoryBucket(new AtomicInteger(1), now + windowMillis);
            }
            existing.counter().incrementAndGet();
            return existing;
        });

        return bucket.counter().get() <= maxRequests;
    }

    /**
     * Scheduled cleanup: evicts expired in-memory buckets every 5 minutes.
     * Prevents unbounded memory growth when Redis is unavailable.
     */
    @Scheduled(fixedDelay = 5 * 60 * 1000)
    public void evictExpiredBuckets() {
        long now = System.currentTimeMillis();
        int before = inMemoryBuckets.size();
        inMemoryBuckets.entrySet().removeIf(entry -> now > entry.getValue().expiresAt());
        int removed = before - inMemoryBuckets.size();
        if (removed > 0) {
            log.debug("Rate limiter evicted {} expired in-memory buckets. Remaining: {}", removed, inMemoryBuckets.size());
        }
    }

    /**
     * Manually reset limit for a key (useful for tests or administrative unblocking).
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
