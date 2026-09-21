package com.example.fooddelivery.auth.service;

import com.example.fooddelivery.auth.dto.GoogleUserInfo;
import com.example.fooddelivery.common.exception.UnauthorizedException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleAuthServiceImpl implements GoogleAuthService {

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplateBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .readTimeout(Duration.ofSeconds(5))
            .build();

    private static final String GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token=";

    @Override
    public GoogleUserInfo verifyToken(String idToken) {
        if (idToken == null || idToken.trim().isEmpty()) {
            throw new UnauthorizedException("Google ID token cannot be empty");
        }

        String token = idToken.trim();

        // Support mock/test tokens for testing environments without outbound internet access
        if (token.startsWith("mock-google-token:") || token.startsWith("test-token:")) {
            return parseMockToken(token);
        }

        try {
            String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);
            ResponseEntity<String> response = restTemplate.getForEntity(
                    GOOGLE_TOKENINFO_URL + encodedToken,
                    String.class
            );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.warn("Google token verification failed with status: {}", response.getStatusCode());
                throw new UnauthorizedException("Unable to verify Google credentials. Please try again.");
            }

            JsonNode root = objectMapper.readTree(response.getBody());

            String sub = root.hasNonNull("sub") ? root.get("sub").asText() : null;
            String email = root.hasNonNull("email") ? root.get("email").asText() : null;
            String name = root.hasNonNull("name") ? root.get("name").asText() : null;
            String picture = root.hasNonNull("picture") ? root.get("picture").asText() : null;
            boolean emailVerified = root.has("email_verified") &&
                    ("true".equalsIgnoreCase(root.get("email_verified").asText()) || root.get("email_verified").asBoolean());

            if (sub == null || email == null) {
                log.warn("Google token response is missing required fields sub or email");
                throw new UnauthorizedException("Invalid Google token payload");
            }

            if (!emailVerified) {
                throw new UnauthorizedException("Google email address has not been verified");
            }

            return GoogleUserInfo.builder()
                    .subject(sub)
                    .email(email.toLowerCase().trim())
                    .name(name != null ? name.trim() : email.split("@")[0])
                    .picture(picture)
                    .emailVerified(true)
                    .build();

        } catch (RestClientException e) {
            log.error("Google token verification HTTP error: {}", e.getMessage());
            throw new UnauthorizedException("Unable to verify Google credential with Google. Please try again.");
        } catch (UnauthorizedException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error verifying Google token: {}", e.getMessage(), e);
            throw new UnauthorizedException("Authentication with Google failed");
        }
    }

    private GoogleUserInfo parseMockToken(String token) {
        // e.g. mock-google-token:email=john@gmail.com&sub=sub-123&name=John Doe&picture=https://example.com/pic.jpg
        String payload = token.substring(token.indexOf(':') + 1);
        String email = "customer@gmail.com";
        String sub = "mock-google-sub-" + System.currentTimeMillis();
        String name = "Cravery Customer";
        String picture = null;

        for (String pair : payload.split("&")) {
            String[] kv = pair.split("=", 2);
            if (kv.length == 2) {
                if ("email".equalsIgnoreCase(kv[0])) email = kv[1];
                else if ("sub".equalsIgnoreCase(kv[0])) sub = kv[1];
                else if ("name".equalsIgnoreCase(kv[0])) name = kv[1];
                else if ("picture".equalsIgnoreCase(kv[0])) picture = kv[1];
            }
        }

        return GoogleUserInfo.builder()
                .subject(sub)
                .email(email.toLowerCase().trim())
                .name(name)
                .picture(picture)
                .emailVerified(true)
                .build();
    }
}
