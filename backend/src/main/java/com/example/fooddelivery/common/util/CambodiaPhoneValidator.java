package com.example.fooddelivery.common.util;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * Reusable validator and normalizer for Cambodian mobile phone numbers.
 * Supports country code +855 and all recognized Cambodian mobile operator prefixes.
 */
public class CambodiaPhoneValidator {

    public static final String COUNTRY_CODE = "+855";
    public static final String COUNTRY_CODE_DIGITS = "855";

    // 2-digit mobile operator prefixes (without leading 0 or after +855)
    // Corresponds to 010, 011, 012, 015, 016, 017, 060, 061, 067, 069, 070,
    // 077, 078, 081, 086, 087, 089, 090, 092, 093, 095, 096, 097, 098, 099
    private static final Set<String> OPERATOR_PREFIXES = Collections.unmodifiableSet(new HashSet<>(Arrays.asList(
            "10", "11", "12", "15", "16", "17",
            "60", "61", "67", "69", "70",
            "77", "78", "81", "86", "87", "89",
            "90", "92", "93", "95", "96", "97", "98", "99"
    )));

    private CambodiaPhoneValidator() {
        // Utility class
    }

    /**
     * Checks whether a phone number is a valid Cambodian mobile phone number.
     */
    public static boolean isValid(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return false;
        }

        String cleaned = cleanPhoneString(phone);
        if (cleaned.isEmpty()) {
            return false;
        }

        // Reject if it specifies another country code (e.g., +1, +44, +66, +84)
        if (phone.trim().startsWith("+") && !cleaned.startsWith(COUNTRY_CODE_DIGITS)) {
            return false;
        }

        String nationalNumber = extractNationalNumber(cleaned);
        if (nationalNumber == null) {
            return false;
        }

        // National number must be 8 or 9 digits total (e.g. 12345678 or 123456789)
        if (nationalNumber.length() < 8 || nationalNumber.length() > 9) {
            return false;
        }

        // Check if the first 2 digits match a valid Cambodian mobile operator prefix
        String prefix = nationalNumber.substring(0, 2);
        return OPERATOR_PREFIXES.contains(prefix);
    }

    /**
     * Normalizes a valid Cambodian phone number to E.164 format (+855XXXXXXXX).
     *
     * @throws IllegalArgumentException if the phone number is invalid
     */
    public static String normalize(String phone) {
        if (!isValid(phone)) {
            throw new IllegalArgumentException("Invalid Cambodian mobile phone number: " + phone);
        }

        String cleaned = cleanPhoneString(phone);
        String nationalNumber = extractNationalNumber(cleaned);
        return COUNTRY_CODE + nationalNumber;
    }

    /**
     * Alias for normalize() to return standard E.164 format (+855XXXXXXXX).
     */
    public static String toE164(String phone) {
        return normalize(phone);
    }

    /**
     * Formats a Cambodian phone number for display (e.g., "+855 12 345 678").
     */
    public static String toDisplayFormat(String phone) {
        String e164 = normalize(phone);
        String national = e164.substring(COUNTRY_CODE.length()); // removes +855

        if (national.length() == 8) {
            // e.g. 12 345 678 -> +855 12 345 678
            return String.format("+855 %s %s %s",
                    national.substring(0, 2),
                    national.substring(2, 5),
                    national.substring(5));
        } else if (national.length() == 9) {
            // e.g. 12 345 6789 -> +855 12 345 6789
            return String.format("+855 %s %s %s",
                    national.substring(0, 2),
                    national.substring(2, 5),
                    national.substring(5));
        }
        return e164;
    }

    /**
     * Extracts subscriber digits without country code or leading local 0.
     */
    private static String extractNationalNumber(String cleanedDigits) {
        if (cleanedDigits.startsWith(COUNTRY_CODE_DIGITS)) {
            return cleanedDigits.substring(COUNTRY_CODE_DIGITS.length());
        } else if (cleanedDigits.startsWith("0")) {
            return cleanedDigits.substring(1);
        } else {
            // User entered without leading 0 or country code (e.g., "12345678")
            return cleanedDigits;
        }
    }

    private static String cleanPhoneString(String phone) {
        return phone.replaceAll("[^0-9]", "");
    }
}
