package com.example.fooddelivery.common.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

class CambodiaPhoneValidatorTest {

    @ParameterizedTest
    @ValueSource(strings = {
            "012345678",
            "010123456",
            "097123456",
            "096123456",
            "012 345 678",
            "015-123-456",
            "+85512345678",
            "+855 12 345 678",
            "85597123456",
            "070 888 999",
            "077123456",
            "089999000",
            "098123456"
    })
    @DisplayName("Should accept valid Cambodian mobile numbers")
    void testValidNumbers(String phone) {
        assertTrue(CambodiaPhoneValidator.isValid(phone), "Expected " + phone + " to be valid");
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "045123456",     // 045 is not a valid mobile prefix
            "023123456",     // 023 is Phnom Penh fixed line, not mobile
            "055123456",     // invalid prefix
            "000123456"      // invalid prefix
    })
    @DisplayName("Should reject invalid Cambodian mobile prefixes")
    void testInvalidPrefixes(String phone) {
        assertFalse(CambodiaPhoneValidator.isValid(phone), "Expected " + phone + " to be rejected for invalid prefix");
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "01234",          // too short
            "012",            // only prefix
            "01234567890123", // too long
            ""
    })
    @DisplayName("Should reject invalid lengths")
    void testInvalidLengths(String phone) {
        assertFalse(CambodiaPhoneValidator.isValid(phone), "Expected " + phone + " to be rejected for invalid length");
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "+12025550123",   // US
            "+447911123456",  // UK
            "+66812345678",   // Thailand
            "+84912345678"    // Vietnam
    })
    @DisplayName("Should reject foreign country phone numbers")
    void testRejectForeignNumbers(String phone) {
        assertFalse(CambodiaPhoneValidator.isValid(phone), "Expected foreign number " + phone + " to be rejected");
    }

    @Test
    @DisplayName("Should normalize local and international inputs to E.164")
    void testNormalization() {
        assertEquals("+85512345678", CambodiaPhoneValidator.normalize("012345678"));
        assertEquals("+85510123456", CambodiaPhoneValidator.normalize("010123456"));
        assertEquals("+85597123456", CambodiaPhoneValidator.normalize("097123456"));
        assertEquals("+85596123456", CambodiaPhoneValidator.normalize("096123456"));
        assertEquals("+85512345678", CambodiaPhoneValidator.normalize("012 345 678"));
        assertEquals("+85512345678", CambodiaPhoneValidator.normalize("+855 12 345 678"));
        assertEquals("+85512345678", CambodiaPhoneValidator.toE164("012345678"));
    }

    @Test
    @DisplayName("Should format phone number for display")
    void testDisplayFormat() {
        assertEquals("+855 12 345 678", CambodiaPhoneValidator.toDisplayFormat("012345678"));
        assertEquals("+855 12 345 678", CambodiaPhoneValidator.toDisplayFormat("+85512345678"));
    }
}
