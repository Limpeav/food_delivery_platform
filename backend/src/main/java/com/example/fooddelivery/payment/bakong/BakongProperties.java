package com.example.fooddelivery.payment.bakong;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "bakong")
public class BakongProperties {
    /**
     * Bakong Open API Token provided by National Bank of Cambodia (NBC).
     * Set in environment variable: BAKONG_API_TOKEN
     */
    private String token = "";

    /**
     * Merchant Bakong Account ID (e.g., your_phone@bakong or merchant_id@bakong).
     * Set in environment variable: BAKONG_ACCOUNT_ID
     */
    private String accountId = "merchant@bakong";

    /**
     * Merchant business name displayed on KHQR when scanned.
     * Set in environment variable: BAKONG_MERCHANT_NAME
     */
    private String merchantName = "Cravery Food Delivery";

    /**
     * Merchant city.
     * Set in environment variable: BAKONG_MERCHANT_CITY
     */
    private String merchantCity = "Phnom Penh";

    /**
     * Bakong Open API base URL.
     * Set in environment variable: BAKONG_API_URL
     */
    private String apiUrl = "https://api-bakong.nbc.gov.kh/v1";

    public boolean hasToken() {
        return token != null && !token.trim().isEmpty() && !token.equalsIgnoreCase("your_bakong_payment_token_here");
    }
}
