package com.example.fooddelivery.payment;

import com.example.fooddelivery.common.exception.ForbiddenException;
import com.example.fooddelivery.order.entity.Order;
import com.example.fooddelivery.payment.dto.PaymentResponse;
import com.example.fooddelivery.payment.entity.Payment;
import com.example.fooddelivery.payment.entity.PaymentMethod;
import com.example.fooddelivery.payment.entity.PaymentStatus;
import com.example.fooddelivery.payment.repository.PaymentRepository;
import com.example.fooddelivery.payment.service.PaymentService;
import com.example.fooddelivery.restaurant.entity.Restaurant;
import com.example.fooddelivery.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock private PaymentRepository paymentRepository;

    @InjectMocks private PaymentService paymentService;

    private User customer;
    private User restaurantOwner;
    private Restaurant restaurant;
    private Order order;
    private Payment payment;

    @BeforeEach
    void setUp() {
        customer = User.builder().id(1L).name("Customer").build();
        restaurantOwner = User.builder().id(2L).name("Owner").build();
        restaurant = Restaurant.builder().id(10L).owner(restaurantOwner).build();
        order = Order.builder().id(100L).customer(customer).restaurant(restaurant)
                .totalAmount(new BigDecimal("25.00")).build();
        payment = Payment.builder()
                .id(1L)
                .order(order)
                .amount(new BigDecimal("25.00"))
                .paymentMethod(PaymentMethod.CASH_ON_DELIVERY)
                .status(PaymentStatus.PENDING)
                .transactionReference("SIM-TXN-TEST")
                .build();
    }

    @Test
    void createInitialPayment_COD_StatusPending() {
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        Payment result = paymentService.createInitialPayment(order, PaymentMethod.CASH_ON_DELIVERY);

        assertNotNull(result);
        assertEquals(PaymentStatus.PENDING, result.getStatus());
        assertEquals(PaymentMethod.CASH_ON_DELIVERY, result.getPaymentMethod());
        assertEquals(new BigDecimal("25.00"), result.getAmount());
        assertTrue(result.getTransactionReference().startsWith("SIM-TXN-"));
    }

    @Test
    void createInitialPayment_OnlinePayment_StatusSuccess() {
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        Payment result = paymentService.createInitialPayment(order, PaymentMethod.ONLINE_PAYMENT);

        assertEquals(PaymentStatus.SUCCESS, result.getStatus());
    }

    @Test
    void getPaymentResponseByOrderId_CustomerCanView() {
        when(paymentRepository.findByOrderId(100L)).thenReturn(Optional.of(payment));

        PaymentResponse response = paymentService.getPaymentResponseByOrderId(100L, 1L); // customer

        assertNotNull(response);
        assertEquals(new BigDecimal("25.00"), response.getAmount());
        assertEquals(PaymentStatus.PENDING, response.getStatus());
    }

    @Test
    void getPaymentResponseByOrderId_RestaurantOwnerCanView() {
        when(paymentRepository.findByOrderId(100L)).thenReturn(Optional.of(payment));

        PaymentResponse response = paymentService.getPaymentResponseByOrderId(100L, 2L); // owner

        assertNotNull(response);
    }

    @Test
    void getPaymentResponseByOrderId_OtherUser_ThrowsForbidden() {
        when(paymentRepository.findByOrderId(100L)).thenReturn(Optional.of(payment));

        assertThrows(ForbiddenException.class,
                () -> paymentService.getPaymentResponseByOrderId(100L, 99L));
    }

    @Test
    void markPaymentAsPaid_UpdatesStatusToSuccess() {
        when(paymentRepository.findByOrderId(100L)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenReturn(payment);

        paymentService.markPaymentAsPaid(100L);

        assertEquals(PaymentStatus.SUCCESS, payment.getStatus());
        verify(paymentRepository).save(payment);
    }

    @Test
    void getPaymentHistory_ReturnsList() {
        when(paymentRepository.findByOrderCustomerIdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(payment));

        List<PaymentResponse> history = paymentService.getPaymentHistory(1L);

        assertEquals(1, history.size());
        assertEquals(PaymentStatus.PENDING, history.get(0).getStatus());
    }
}
