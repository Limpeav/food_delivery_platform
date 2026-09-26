package com.example.fooddelivery.payment.bakong;

import com.example.fooddelivery.common.exception.ForbiddenException;
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
import com.example.fooddelivery.restaurant.entity.Restaurant;
import com.example.fooddelivery.user.entity.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BakongServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    private BakongProperties bakongProperties;
    private KhqrGenerator khqrGenerator;
    private ObjectMapper objectMapper;
    private BakongService bakongService;

    private User customer;
    private User owner;
    private Restaurant restaurant;
    private Order order;
    private Payment payment;

    @BeforeEach
    void setUp() {
        bakongProperties = new BakongProperties();
        bakongProperties.setAccountId("merchant@bakong");
        bakongProperties.setMerchantName("Cravery");
        bakongProperties.setMerchantCity("Phnom Penh");
        bakongProperties.setToken(""); // No live token in unit test

        khqrGenerator = new KhqrGenerator();
        objectMapper = new ObjectMapper();

        bakongService = new BakongService(
                bakongProperties,
                khqrGenerator,
                orderRepository,
                paymentRepository,
                notificationService,
                messagingTemplate,
                objectMapper
        );

        customer = User.builder().id(1L).email("customer@test.com").build();
        owner = User.builder().id(2L).email("owner@test.com").build();
        restaurant = Restaurant.builder().id(10L).name("Pizza Place").owner(owner).build();

        order = Order.builder()
                .id(100L)
                .customer(customer)
                .restaurant(restaurant)
                .totalAmount(new BigDecimal("15.50"))
                .status(OrderStatus.PENDING)
                .build();

        payment = Payment.builder()
                .id(50L)
                .order(order)
                .amount(new BigDecimal("15.50"))
                .paymentMethod(PaymentMethod.ONLINE_PAYMENT)
                .status(PaymentStatus.PENDING)
                .transactionReference("md5-ref-123456789012345678901234")
                .build();
    }

    @Test
    void generateKhqr_ValidOrder_GeneratesKhqrResponse() {
        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(paymentRepository.findByOrderId(100L)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        KhqrResponse response = bakongService.generateKhqr(100L, 1L);

        assertNotNull(response);
        assertEquals(100L, response.getOrderId());
        assertNotNull(response.getQrCode());
        assertNotNull(response.getMd5());
        assertNotNull(response.getQrImage());
        assertTrue(response.getQrImage().startsWith("data:image/png;base64,"));
        assertEquals("PENDING", response.getPaymentStatus());
    }

    @Test
    void generateKhqr_UnauthorizedUser_ThrowsForbiddenException() {
        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));

        assertThrows(ForbiddenException.class, () -> bakongService.generateKhqr(100L, 999L));
    }

    @Test
    void verifyPayment_AlreadySuccessful_ReturnsVerifiedTrue() {
        payment.setStatus(PaymentStatus.SUCCESS);
        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(paymentRepository.findByOrderId(100L)).thenReturn(Optional.of(payment));

        KhqrVerificationResponse response = bakongService.verifyPayment(100L, 1L, false);

        assertTrue(response.isVerified());
        assertEquals("SUCCESS", response.getPaymentStatus());
    }

    @Test
    void verifyPayment_SimulateMode_MarksAsSuccess() {
        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(paymentRepository.findByOrderId(100L)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        KhqrVerificationResponse response = bakongService.verifyPayment(100L, 1L, true);

        assertTrue(response.isVerified());
        assertEquals("SUCCESS", response.getPaymentStatus());
        assertEquals(OrderStatus.CONFIRMED, order.getStatus());
        verify(paymentRepository).save(payment);
        verify(orderRepository).save(order);
    }
}
