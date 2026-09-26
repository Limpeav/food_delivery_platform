package com.example.fooddelivery.payment.bakong;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

/**
 * Standard EMVCo-compliant KHQR Generator for National Bank of Cambodia (NBC) Bakong.
 */
@Slf4j
@Component
public class KhqrGenerator {

    public record KhqrData(String rawKhqr, String md5, String qrImageBase64) {}

    /**
     * Generates a dynamic KHQR string, calculates MD5 hash, and generates a Base64 QR code image.
     */
    public KhqrData generate(String bakongAccountId, String merchantName, String merchantCity, BigDecimal amount, String currencyCode, String billNumber) {
        String khqrString = buildKhqrString(bakongAccountId, merchantName, merchantCity, amount, currencyCode, billNumber);
        String md5 = calculateMd5(khqrString);
        String qrImage = generateQrCodeBase64(khqrString, 350, 350);
        return new KhqrData(khqrString, md5, qrImage);
    }

    /**
     * Constructs the EMVCo Tag-Length-Value string with CRC16 checksum.
     */
    public String buildKhqrString(String accountId, String name, String city, BigDecimal amount, String currency, String billNumber) {
        StringBuilder sb = new StringBuilder();

        // 00: Payload Format Indicator (01)
        sb.append(tlv("00", "01"));

        // 01: Point of Initiation (12 = Dynamic QR with fixed amount)
        sb.append(tlv("01", "12"));

        // 29: Merchant Account Information
        String merchantAccountPayload = tlv("00", accountId);
        sb.append(tlv("29", merchantAccountPayload));

        // 52: Merchant Category Code (5812 = Restaurants / Eating Places)
        sb.append(tlv("52", "5812"));

        // 53: Transaction Currency (840 = USD, 116 = KHR)
        String emvCurrency = "KHR".equalsIgnoreCase(currency) ? "116" : "840";
        sb.append(tlv("53", emvCurrency));

        // 54: Transaction Amount (2 decimal places)
        String formattedAmount = amount.setScale(2, RoundingMode.HALF_UP).toPlainString();
        sb.append(tlv("54", formattedAmount));

        // 58: Country Code (KH)
        sb.append(tlv("58", "KH"));

        // 59: Merchant Name
        String safeName = (name != null && !name.isBlank()) ? name.trim() : "Cravery Merchant";
        sb.append(tlv("59", safeName));

        // 60: Merchant City
        String safeCity = (city != null && !city.isBlank()) ? city.trim() : "Phnom Penh";
        sb.append(tlv("60", safeCity));

        // 62: Additional Data Field (Bill Number / Order ID)
        String safeBill = (billNumber != null && !billNumber.isBlank()) ? billNumber.trim() : "ORD-0";
        String additionalDataPayload = tlv("01", safeBill) + tlv("07", "CRAVERY-WEB");
        sb.append(tlv("62", additionalDataPayload));

        // 63: CRC placeholder
        sb.append("6304");

        // Calculate CRC-16/CCITT
        String crc = calculateCrc16(sb.toString());
        return sb.toString().substring(0, sb.length() - 4) + tlv("63", crc);
    }

    private String tlv(String tag, String value) {
        return String.format("%s%02d%s", tag, value.length(), value);
    }

    /**
     * Standard EMVCo CRC-16/CCITT polynomial 0x1021 with initial 0xFFFF.
     */
    public String calculateCrc16(String data) {
        int crc = 0xFFFF;
        int polynomial = 0x1021;
        byte[] bytes = data.getBytes(StandardCharsets.UTF_8);

        for (byte b : bytes) {
            for (int i = 0; i < 8; i++) {
                boolean bit = ((b >> (7 - i)) & 1) == 1;
                boolean c15 = ((crc >> 15) & 1) == 1;
                crc <<= 1;
                if (c15 ^ bit) {
                    crc ^= polynomial;
                }
            }
        }
        crc &= 0xFFFF;
        return String.format("%04X", crc);
    }

    /**
     * Calculates MD5 hash (32-character lowercase hex) for Bakong Open API verification.
     */
    public String calculateMd5(String data) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : digest) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().toLowerCase();
        } catch (Exception e) {
            log.error("Failed to calculate MD5 for KHQR: {}", e.getMessage());
            return "md5-" + System.currentTimeMillis();
        }
    }

    /**
     * Generates a Base64-encoded PNG image of the QR code using ZXing.
     */
    public String generateQrCodeBase64(String text, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);
            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            byte[] pngData = pngOutputStream.toByteArray();
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(pngData);
        } catch (Exception e) {
            log.error("Failed to generate QR code image: {}", e.getMessage());
            return "";
        }
    }
}
