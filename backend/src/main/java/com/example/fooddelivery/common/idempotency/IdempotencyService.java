package com.example.fooddelivery.common.idempotency;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Enterprise idempotency service to prevent duplicate charges and orders
 * caused by client retries or rapid double-taps.
 */
@Slf4j
@Service
public class IdempotencyService {

    private static final String KEY_PREFIX = "idempotency:";
    private static final String PROCESSING_STATUS = "__PROCESSING__";
    private static final long DEFAULT_TTL_SECONDS = 300; // 5 minutes

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<String, String> inMemoryStore = new ConcurrentHashMap<>();

    public IdempotencyService(
            @Autowired(required = false) StringRedisTemplate redisTemplate,
            ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Attempts to acquire an idempotency lock for the given key and user.
     * Returns true if lock was acquired, false if already processing or completed.
     */
    public boolean acquire(String idempotencyKey, Long userId) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return true;
        }
        String fullKey = KEY_PREFIX + userId + ":" + idempotencyKey.trim();
        if (redisTemplate != null) {
            try {
                Boolean set = redisTemplate.opsForValue().setIfAbsent(fullKey, PROCESSING_STATUS, DEFAULT_TTL_SECONDS, TimeUnit.SECONDS);
                return Boolean.TRUE.equals(set);
            } catch (Exception e) {
                log.warn("Redis idempotency acquire failed for key {}: {}. Using in-memory fallback.", fullKey, e.getMessage());
            }
        }
        return inMemoryStore.putIfAbsent(fullKey, PROCESSING_STATUS) == null;
    }

    /**
     * Checks if a cached response exists for this idempotency key.
     */
    public <T> T getCachedResponse(String idempotencyKey, Long userId, Class<T> responseClass) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return null;
        }
        String fullKey = KEY_PREFIX + userId + ":" + idempotencyKey.trim();
        String cachedJson = null;
        if (redisTemplate != null) {
            try {
                cachedJson = redisTemplate.opsForValue().get(fullKey);
            } catch (Exception e) {
                log.warn("Redis idempotency get failed: {}", e.getMessage());
            }
        }
        if (cachedJson == null) {
            cachedJson = inMemoryStore.get(fullKey);
        }

        if (cachedJson != null && !PROCESSING_STATUS.equals(cachedJson)) {
            try {
                return objectMapper.readValue(cachedJson, responseClass);
            } catch (JsonProcessingException e) {
                log.error("Failed to deserialize idempotency cached response: {}", e.getMessage());
            }
        }
        return null;
    }

    /**
     * Saves the final response against the idempotency key upon successful execution.
     */
    public void complete(String idempotencyKey, Long userId, Object response) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return;
        }
        String fullKey = KEY_PREFIX + userId + ":" + idempotencyKey.trim();
        try {
            String json = objectMapper.writeValueAsString(response);
            if (redisTemplate != null) {
                try {
                    redisTemplate.opsForValue().set(fullKey, json, DEFAULT_TTL_SECONDS, TimeUnit.SECONDS);
                    return;
                } catch (Exception e) {
                    log.warn("Redis idempotency complete failed: {}", e.getMessage());
                }
            }
            inMemoryStore.put(fullKey, json);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize response for idempotency: {}", e.getMessage());
        }
    }

    /**
     * Releases the idempotency key in case of an application error so the user can retry immediately.
     */
    public void release(String idempotencyKey, Long userId) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return;
        }
        String fullKey = KEY_PREFIX + userId + ":" + idempotencyKey.trim();
        if (redisTemplate != null) {
            try {
                redisTemplate.delete(fullKey);
            } catch (Exception e) {
                log.warn("Redis idempotency delete failed: {}", e.getMessage());
            }
        }
        inMemoryStore.remove(fullKey);
    }
}
