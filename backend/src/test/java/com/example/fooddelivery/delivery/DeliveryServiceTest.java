package com.example.fooddelivery.delivery;

import com.example.fooddelivery.common.exception.BadRequestException;
import com.example.fooddelivery.common.exception.ForbiddenException;
import com.example.fooddelivery.delivery.dto.DeliveryResponse;
import com.example.fooddelivery.delivery.entity.Delivery;
import com.example.fooddelivery.delivery.entity.DeliveryStatus;
import com.example.fooddelivery.delivery.repository.DeliveryRepository;
import com.example.fooddelivery.delivery.service.DeliveryService;
import com.example.fooddelivery.driver.entity.Driver;
import com.example.fooddelivery.driver.repository.DriverLocationRepository;
import com.example.fooddelivery.driver.repository.DriverRepository;
import com.example.fooddelivery.driver.service.DriverService;
import com.example.fooddelivery.notification.entity.NotificationType;
import com.example.fooddelivery.notification.service.NotificationService;
import com.example.fooddelivery.order.entity.Order;
import com.example.fooddelivery.order.entity.OrderStatus;
import com.example.fooddelivery.order.repository.OrderRepository;
import com.example.fooddelivery.payment.service.PaymentService;
import com.example.fooddelivery.restaurant.entity.Restaurant;
import com.example.fooddelivery.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeliveryServiceTest {

    @Mock private DeliveryRepository deliveryRepository;
    @Mock private DriverRepository driverRepository;
    @Mock private DriverLocationRepository locationRepository;
    @Mock private DriverService driverService;
    @Mock private OrderRepository orderRepository;
    @Mock private PaymentService paymentService;
    @Mock private NotificationService notificationService;
    @Mock private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private DeliveryService deliveryService;

    private User customerUser;
    private User driverUser;
    private Driver driver;
    private Restaurant restaurant;
    private Order order;
    private Delivery delivery;

    @BeforeEach
    void setUp() {
        customerUser = User.builder().id(1L).name("Customer").build();
        driverUser = User.builder().id(2L).name("Driver").build();
        driver = Driver.builder().id(10L).user(driverUser).approved(true).online(true).rating(4.5).build();
        restaurant = User.builder().id(3L).build() != null
                ? Restaurant.builder().id(5L).name("Burger House").owner(User.builder().id(3L).build())
                .latitude(10.0).longitude(10.0).address("Main St").deliveryFee(BigDecimal.ONE).build()
                : null;
        order = Order.builder()
                .id(50L)
                .customer(customerUser)
                .restaurant(restaurant)
                .totalAmount(new BigDecimal("30.00"))
                .deliveryFee(new BigDecimal("2.00"))
                .status(OrderStatus.READY_FOR_PICKUP)
                .build();
        delivery = Delivery.builder()
                .id(100L)
                .order(order)
                .driver(driver)
                .status(DeliveryStatus.FOOD_PICKED_UP)
                .build();
    }

    @Test
    void pickupFood_UpdatesStatusAndOrder() {
        when(driverService.findDriverByUserId(2L)).thenReturn(driver);
        when(deliveryRepository.findById(100L)).thenReturn(Optional.of(delivery));
        when(deliveryRepository.save(any(Delivery.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        when(notificationService.sendNotification(any(), any(), any(), any())).thenReturn(null);

        DeliveryResponse result = deliveryService.pickupFood(2L, 100L);

        assertEquals(DeliveryStatus.FOOD_PICKED_UP, result.getStatus());
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void completeDelivery_MarksPaymentAsPaid() {
        delivery.setStatus(DeliveryStatus.DELIVERING);
        when(driverService.findDriverByUserId(2L)).thenReturn(driver);
        when(deliveryRepository.findById(100L)).thenReturn(Optional.of(delivery));
        when(deliveryRepository.save(any(Delivery.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        when(notificationService.sendNotification(any(), any(), any(), any())).thenReturn(null);

        deliveryService.completeDelivery(2L, 100L);

        verify(paymentService).markPaymentAsPaid(order.getId());
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void acceptDelivery_WaitingForDriver_Success() {
        Delivery waiting = Delivery.builder()
                .id(200L)
                .order(order)
                .status(DeliveryStatus.WAITING_FOR_DRIVER)
                .build();

        when(driverService.findDriverByUserId(2L)).thenReturn(driver);
        when(deliveryRepository.findById(200L)).thenReturn(Optional.of(waiting));
        when(deliveryRepository.save(any(Delivery.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        when(notificationService.sendNotification(any(), any(), any(), any())).thenReturn(null);

        DeliveryResponse result = deliveryService.acceptDelivery(2L, 200L);

        assertNotNull(result);
    }

    @Test
    void acceptDelivery_NotWaitingForDriver_ThrowsBadRequest() {
        // delivery is in FOOD_PICKED_UP state
        when(driverService.findDriverByUserId(2L)).thenReturn(driver);
        when(deliveryRepository.findById(100L)).thenReturn(Optional.of(delivery));

        assertThrows(BadRequestException.class, () -> deliveryService.acceptDelivery(2L, 100L));
    }

    @Test
    void pickupFood_WrongDriver_ThrowsForbidden() {
        Driver wrongDriver = Driver.builder().id(99L).user(User.builder().id(99L).build()).build();
        when(driverService.findDriverByUserId(99L)).thenReturn(wrongDriver);
        when(deliveryRepository.findById(100L)).thenReturn(Optional.of(delivery));

        assertThrows(ForbiddenException.class, () -> deliveryService.pickupFood(99L, 100L));
    }
}
