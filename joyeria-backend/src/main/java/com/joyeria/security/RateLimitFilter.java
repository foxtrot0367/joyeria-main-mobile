package com.joyeria.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.joyeria.dto.ApiResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final long DEFAULT_LIMIT = 120;
    private static final long DEFAULT_WINDOW_SECONDS = 60;

    private static final Map<String, Rule> SPECIFIC_RULES = Map.of(
            "POST|/api/auth/login", new Rule(5, 60),
            "POST|/api/auth/register", new Rule(5, 60),
            "POST|/api/auth/forgot-password", new Rule(3, 600),
            "POST|/api/auth/reset-password", new Rule(5, 3600),
            "GET|/api/coupons/validate", new Rule(20, 60),
            "POST|/api/orders", new Rule(10, 60)
    );

    private final Map<String, Window> windows = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        if (!path.startsWith("/api/")) {
            filterChain.doFilter(request, response);
            return;
        }

        long now = System.currentTimeMillis();
        cleanupIfNeeded(now);

        String routeKey = request.getMethod() + "|" + path;
        Rule rule = SPECIFIC_RULES.getOrDefault(routeKey, new Rule(DEFAULT_LIMIT, DEFAULT_WINDOW_SECONDS));
        String ip = resolveClientIp(request);
        String bucketKey = ip + "|" + routeKey;

        long windowMillis = rule.seconds() * 1000L;
        Window window = windows.compute(bucketKey, (key, existing) -> {
            if (existing == null || now > existing.end()) {
                return new Window(1, now + windowMillis);
            }
            return new Window(existing.count() + 1, existing.end());
        });

        long retryAfterSeconds = Math.max(0, (window.end() - now) / 1000 + 1);
        long remaining = Math.max(0, rule.limit() - window.count());

        response.setHeader("X-RateLimit-Limit", String.valueOf(rule.limit()));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));
        response.setHeader("X-RateLimit-Reset", String.valueOf(window.end()));

        if (window.count() > rule.limit()) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            objectMapper.writeValue(response.getWriter(),
                    ApiResponse.error("Demasiadas solicitudes. Intenta de nuevo en " + retryAfterSeconds + " segundos."));
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }

    private void cleanupIfNeeded(long now) {
        if (now % 47 == 0) {
            windows.entrySet().removeIf(entry -> now > entry.getValue().end() + 600_000L);
        }
    }

    private record Window(long count, long end) {}

    private record Rule(long limit, long seconds) {}
}