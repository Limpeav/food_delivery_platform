package com.example.fooddelivery.payment.bakong;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class KhqrGeneratorTest {

    private KhqrGenerator generator;

    @BeforeEach
    void setUp() {
        generator = new KhqrGenerator();
    }

    @Test
    void buildKhqrString_ValidParameters_ContainsAllMandatoryTags() {
        String khqr = generator.buildKhqrString(
                "merchant@bakong",
                "Cravery Food",
                "Phnom Penh",
                new BigDecimal("12.50"),
                "USD",
                "ORD-101"
        );

        assertNotNull(khqr);
        assertTrue(khqr.startsWith("000201")); // Tag 00
        assertTrue(khqr.contains("010212")); // Tag 01 Dynamic
        assertTrue(khqr.contains("29")); // Merchant info tag
        assertTrue(khqr.contains("merchant@bakong"));
        assertTrue(khqr.contains("5303840")); // Currency USD
        assertTrue(khqr.contains("540512.50")); // Amount
        assertTrue(khqr.contains("5802KH")); // Country
        assertTrue(khqr.contains("5912Cravery Food")); // Merchant name
        assertTrue(khqr.contains("6010Phnom Penh")); // Merchant city
        assertTrue(khqr.contains("6304")); // CRC tag
    }

    @Test
    void calculateCrc16_ComputesCorrect4HexCrc() {
        String testData = "0002010102126304";
        String crc = generator.calculateCrc16(testData);

        assertNotNull(crc);
        assertEquals(4, crc.length());
        assertTrue(crc.matches("[0-9A-F]{4}"));
    }

    @Test
    void calculateMd5_Computes32CharHex() {
        String testData = "sample-khqr-string-for-bakong-open-api";
        String md5 = generator.calculateMd5(testData);

        assertNotNull(md5);
        assertEquals(32, md5.length());
        assertTrue(md5.matches("[0-9a-f]{32}"));
    }

    @Test
    void generate_GeneratesCompleteKhqrAndImage() {
        KhqrGenerator.KhqrData data = generator.generate(
                "my_store@bakong",
                "My Store",
                "Phnom Penh",
                new BigDecimal("25.00"),
                "USD",
                "ORD-999"
        );

        assertNotNull(data);
        assertNotNull(data.rawKhqr());
        assertEquals(32, data.md5().length());
        assertNotNull(data.qrImageBase64());
        assertTrue(data.qrImageBase64().startsWith("data:image/png;base64,"));
    }
}
