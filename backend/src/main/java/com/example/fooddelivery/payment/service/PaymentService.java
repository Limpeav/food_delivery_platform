package com.example.fooddelivery.payment.service;

import com.example.fooddelivery.common.exception.ForbiddenException;
import com.example.fooddelivery.common.exception.ResourceNotFoundException;
import com.example.fooddelivery.order.entity.Order;
import com.example.fooddelivery.payment.dto.PaymentResponse;
import com.example.fooddelivery.payment.entity.Payment;
import com.example.fooddelivery.payment.entity.PaymentMethod;
import com.example.fooddelivery.payment.entity.PaymentStatus;
import com.example.fooddelivery.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    @Transactional
    public Payment createInitialPayment(Order order, PaymentMethod paymentMethod) {
        String txnRef = "SIM-TXN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        PaymentStatus initialStatus = (paymentMethod == PaymentMethod.ONLINE_PAYMENT)
                ? PaymentStatus.SUCCESS // Simulated online payment success
                : PaymentStatus.PENDING; // COD collected upon delivery

        Payment payment = Payment.builder()
                .order(order)
                .amount(order.getTotalAmount())
                .paymentMethod(paymentMethod)
                .status(initialStatus)
                .transactionReference(txnRef)
                .build();

        Payment saved = paymentRepository.save(payment);
        log.info("Payment created for order {}: method={}, status={}, txnRef={}",
                order.getId(), paymentMethod, initialStatus, txnRef);
        return saved;
    }

    @Transactional(readOnly = true)
    public Payment getPaymentByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId).orElse(null);
    }

    /**
     * Returns payment details for a specific order, verifying the requesting user owns the order.
     */
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentResponseByOrderId(Long orderId, Long requestingUserId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "orderId", orderId));
        Long orderCustomerId = payment.getOrder().getCustomer().getId();
        Long restaurantOwnerId = payment.getOrder().getRestaurant().getOwner().getId();
        if (!orderCustomerId.equals(requestingUserId) && !restaurantOwnerId.equals(requestingUserId)) {
            throw new ForbiddenException("You do not have permission to view this payment");
        }
        return PaymentResponse.from(payment);
    }

    /**
     * Returns full payment history for the given customer (ordered by newest first).
     */
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentHistory(Long customerId) {
        return paymentRepository.findByOrderCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(PaymentResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Admin: returns all payments on the platform.
     */
    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(PaymentResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markPaymentAsPaid(Long orderId) {
        paymentRepository.findByOrderId(orderId).ifPresent(payment -> {
            payment.setStatus(PaymentStatus.SUCCESS);
            paymentRepository.save(payment);
            log.info("Payment marked as SUCCESS for order: {}", orderId);
        });
    }
}
