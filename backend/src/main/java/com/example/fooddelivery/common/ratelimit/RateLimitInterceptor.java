package com.example.fooddelivery.common.ratelimit;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimiterService rateLimiterService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String method = request.getMethod();
        String uri = request.getRequestURI();

        if ("POST".equalsIgnoreCase(method)) {
            String clientIp = extractClientIp(request);

            if (uri.endsWith("/api/auth/login")) {
                rateLimiterService.checkLimit(
                        "auth:login:" + clientIp,
                        10,
                        60,
                        "Too many login attempts from your IP. Please try again after 1 minute."
                );
            } else if (uri.endsWith("/api/auth/forgot-password")) {
                rateLimiterService.checkLimit(
                        "auth:forgot-password:" + clientIp,
                        3,
                        300,
                        "Too many password reset attempts from your IP. Please try again after 5 minutes."
                );
            }
        }

        return true;
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown";
    }
}
