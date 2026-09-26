package com.example.fooddelivery.payment.bakong;

import com.example.fooddelivery.common.exception.BadRequestException;
import com.example.fooddelivery.common.exception.ForbiddenException;
import com.example.fooddelivery.common.exception.ResourceNotFoundException;
import com.example.fooddelivery.notification.entity.NotificationType;
import com.example.fooddelivery.notification.service.NotificationService;
import com.example.fooddelivery.order.entity.Order;
import com.example.fooddelivery.order.entity.OrderStatus;
import com.example.fooddelivery.order.repository.OrderRepository;
import com.example.fooddelivery.payment.bakong.dto.KhqrResponse;
import com.example.fooddelivery.payment.bakong.dto.KhqrVerificationResponse;
import com.example.fooddelivery.payment.entity.Payment;
import com.example.fooddelivery.payment.entity.PaymentMethod;
import com.example.fooddelivery.payment.entity.PaymentStatus;
import com.example.fooddelivery.payment.repository.PaymentRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class BakongService {

    private final BakongProperties bakongProperties;
    private final KhqrGenerator khqrGenerator;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /**
     * Generates a Bakong KHQR for the given order and updates the payment transaction reference with the KHQR MD5.
     */
    @Transactional
    public KhqrResponse generateKhqr(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        validateOrderAccess(order, userId);

        Payment payment = paymentRepository.findByOrderId(orderId).orElseGet(() -> {
            Payment newPayment = Payment.builder()
                    .order(order)
                    .amount(order.getTotalAmount())
                    .paymentMethod(PaymentMethod.ONLINE_PAYMENT)
                    .status(PaymentStatus.PENDING)
                    .build();
            return paymentRepository.save(newPayment);
        });

        KhqrGenerator.KhqrData khqrData = khqrGenerator.generate(
                bakongProperties.getAccountId(),
                bakongProperties.getMerchantName(),
                bakongProperties.getMerchantCity(),
                order.getTotalAmount(),
                "USD",
                "ORD-" + order.getId()
        );

        payment.setTransactionReference(khqrData.md5());
        payment.setPaymentMethod(PaymentMethod.ONLINE_PAYMENT);
        paymentRepository.save(payment);

        log.info("Generated Bakong KHQR for Order #{} with MD5: {}", orderId, khqrData.md5());

        return KhqrResponse.builder()
                .orderId(order.getId())
                .qrCode(khqrData.rawKhqr())
                .qrImage(khqrData.qrImageBase64())
                .md5(khqrData.md5())
                .amount(order.getTotalAmount())
                .currency("USD")
                .merchantName(bakongProperties.getMerchantName())
                .merchantAccountId(bakongProperties.getAccountId())
                .paymentStatus(payment.getStatus().name())
                .simulated(!bakongProperties.hasToken())
                .build();
    }

    /**
     * Verifies payment with Bakong Open API check_transaction_by_md5.
     */
    @Transactional
    public KhqrVerificationResponse verifyPayment(Long orderId, Long userId, boolean allowSimulate) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        validateOrderAccess(order, userId);

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "orderId", orderId));

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return KhqrVerificationResponse.builder()
                    .orderId(orderId)
                    .verified(true)
                    .paymentStatus(PaymentStatus.SUCCESS.name())
                    .transactionHash(payment.getTransactionReference())
                    .md5(payment.getTransactionReference())
                    .amount(payment.getAmount())
                    .currency("USD")
                    .message("Payment already verified")
                    .verifiedAt(LocalDateTime.now())
                    .build();
        }

        if (bakongProperties.hasToken()) {
            return callBakongApiCheckTransaction(order, payment);
        }

        // If no Bakong token configured, support simulation for local developer testing
        if (allowSimulate) {
            log.info("Simulating successful Bakong payment verification for Order #{} (simulation mode)", orderId);
            completeSuccessfulPayment(order, payment, "SIM-HASH-" + System.currentTimeMillis());
            return KhqrVerificationResponse.builder()
                    .orderId(orderId)
                    .verified(true)
                    .paymentStatus(PaymentStatus.SUCCESS.name())
                    .transactionHash(payment.getTransactionReference())
                    .md5(payment.getTransactionReference())
                    .amount(payment.getAmount())
                    .currency("USD")
                    .message("Payment verified successfully (Dev Simulation Mode)")
                    .verifiedAt(LocalDateTime.now())
                    .build();
        }

        return KhqrVerificationResponse.builder()
                .orderId(orderId)
                .verified(false)
                .paymentStatus(payment.getStatus().name())
                .md5(payment.getTransactionReference())
                .amount(payment.getAmount())
                .currency("USD")
                .message("Bakong payment token is not configured. Please set BAKONG_API_TOKEN in backend/.env")
                .build();
    }

    private KhqrVerificationResponse callBakongApiCheckTransaction(Order order, Payment payment) {
        String md5 = payment.getTransactionReference();
        String checkUrl = bakongProperties.getApiUrl() + "/check_transaction_by_md5";

        try {
            String requestBody = objectMapper.writeValueAsString(Map.of("md5", md5));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(checkUrl))
                    .timeout(Duration.ofSeconds(10))
                    .header("Authorization", "Bearer " + bakongProperties.getToken().trim())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            log.info("Bakong API check_transaction_by_md5 response status: {} for order: {}", response.statusCode(), order.getId());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                int responseCode = root.path("responseCode").asInt(-1);
                String responseMessage = root.path("responseMessage").asText("");

                if (responseCode == 0 || "SUCCESS".equalsIgnoreCase(responseMessage)) {
                    String hash = root.path("data").path("hash").asText(md5);
                    completeSuccessfulPayment(order, payment, hash);

                    return KhqrVerificationResponse.builder()
                            .orderId(order.getId())
                            .verified(true)
                            .paymentStatus(PaymentStatus.SUCCESS.name())
                            .transactionHash(hash)
                            .md5(md5)
                            .amount(payment.getAmount())
                            .currency("USD")
                            .message("Payment verified successfully via Bakong Open API")
                            .verifiedAt(LocalDateTime.now())
                            .build();
                }
            }

            return KhqrVerificationResponse.builder()
                    .orderId(order.getId())
                    .verified(false)
                    .paymentStatus(payment.getStatus().name())
                    .md5(md5)
                    .amount(payment.getAmount())
                    .currency("USD")
                    .message("Transaction not yet confirmed by Bakong. Please ensure payment is completed.")
                    .build();
        } catch (Exception e) {
            log.error("Error communicating with Bakong Open API: {}", e.getMessage());
            return KhqrVerificationResponse.builder()
                    .orderId(order.getId())
                    .verified(false)
                    .paymentStatus(payment.getStatus().name())
                    .md5(md5)
                    .amount(payment.getAmount())
                    .currency("USD")
                    .message("Failed to connect to Bakong Open API: " + e.getMessage())
                    .build();
        }
    }

    private void completeSuccessfulPayment(Order order, Payment payment, String transactionHash) {
        payment.setStatus(PaymentStatus.SUCCESS);
        if (transactionHash != null && !transactionHash.isBlank()) {
            payment.setTransactionReference(transactionHash);
        }
        paymentRepository.save(payment);

        if (order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);
        }

        // Notify Restaurant Owner
        try {
            notificationService.sendNotification(
                    order.getRestaurant().getOwner(),
                    "Order Paid Online (Bakong KHQR)",
                    "Order #" + order.getId() + " has been paid via Bakong KHQR ($" + order.getTotalAmount() + ").",
                    NotificationType.PAYMENT
            );
        } catch (Exception e) {
            log.warn("Failed to notify restaurant owner: {}", e.getMessage());
        }

        // Broadcast order update to customer tracking and kitchen via WebSocket
        try {
            messagingTemplate.convertAndSend("/topic/orders/" + order.getId(), Map.of(
                    "orderId", order.getId(),
                    "status", order.getStatus().name(),
                    "paymentStatus", PaymentStatus.SUCCESS.name()
            ));
        } catch (Exception e) {
            log.warn("Failed to broadcast WebSocket update: {}", e.getMessage());
        }
    }

    private void validateOrderAccess(Order order, Long userId) {
        if (userId == null) return;
        Long customerId = order.getCustomer().getId();
        Long ownerId = order.getRestaurant().getOwner().getId();
        if (!customerId.equals(userId) && !ownerId.equals(userId)) {
            throw new ForbiddenException("You do not have permission to access payment for this order");
        }
    }
}
