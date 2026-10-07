package com.example.fooddelivery.order;

import com.example.fooddelivery.address.entity.Address;
import com.example.fooddelivery.address.service.AddressService;
import com.example.fooddelivery.cart.entity.Cart;
import com.example.fooddelivery.cart.entity.CartItem;
import com.example.fooddelivery.cart.service.CartService;
import com.example.fooddelivery.common.exception.BadRequestException;
import com.example.fooddelivery.common.exception.ForbiddenException;
import com.example.fooddelivery.coupon.service.CouponService;
import com.example.fooddelivery.delivery.service.DeliveryService;
import com.example.fooddelivery.driver.repository.DriverLocationRepository;
import com.example.fooddelivery.food.entity.FoodItem;
import com.example.fooddelivery.notification.service.NotificationService;
import com.example.fooddelivery.order.dto.CreateOrderRequest;
import com.example.fooddelivery.order.dto.OrderResponse;
import com.example.fooddelivery.order.entity.Order;
import com.example.fooddelivery.order.entity.OrderStatus;
import com.example.fooddelivery.order.repository.OrderItemRepository;
import com.example.fooddelivery.order.repository.OrderRepository;
import com.example.fooddelivery.order.service.OrderService;
import com.example.fooddelivery.payment.entity.Payment;
import com.example.fooddelivery.payment.entity.PaymentMethod;
import com.example.fooddelivery.payment.entity.PaymentStatus;
import com.example.fooddelivery.payment.service.PaymentService;
import com.example.fooddelivery.restaurant.entity.Restaurant;
import com.example.fooddelivery.restaurant.entity.RestaurantStatus;
import com.example.fooddelivery.restaurant.service.RestaurantService;
import com.example.fooddelivery.user.entity.Role;
import com.example.fooddelivery.user.entity.User;
import com.example.fooddelivery.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private OrderItemRepository orderItemRepository;
    @Mock private CartService cartService;
    @Mock private UserService userService;
    @Mock private AddressService addressService;
    @Mock private RestaurantService restaurantService;
    @Mock private CouponService couponService;
    @Mock private PaymentService paymentService;
    @Mock private DeliveryService deliveryService;
    @Mock private DriverLocationRepository driverLocationRepository;
    @Mock private NotificationService notificationService;
    @Mock private SimpMessagingTemplate messagingTemplate;

    @InjectMocks private OrderService orderService;

    private User customer;
    private User owner;
    private Restaurant restaurant;
    private Address address;
    private FoodItem foodItem;
    private CartItem cartItem;
    private Cart cart;
    private Payment payment;

    @BeforeEach
    void setUp() {
        customer = User.builder().id(1L).name("Customer John").phoneNumber("+85512345678").role(Role.CUSTOMER).build();
        owner = User.builder().id(2L).name("Owner Jane").role(Role.RESTAURANT_OWNER).build();

        restaurant = Restaurant.builder()
                .id(10L)
                .name("Pizza Palace")
                .owner(owner)
                .status(RestaurantStatus.APPROVED)
                .deliveryFee(new BigDecimal("2.00"))
                .minimumOrder(new BigDecimal("10.00"))
                .build();

        address = Address.builder()
                .id(50L)
                .user(customer)
                .recipientName("John")
                .phoneNumber("+85512345678")
                .addressLine("St 2004")
                .city("Phnom Penh")
                .label("Home")
                .latitude(11.55)
                .longitude(104.91)
                .build();

        foodItem = FoodItem.builder()
                .id(100L)
                .restaurant(restaurant)
                .name("Margherita Pizza")
                .price(new BigDecimal("12.00"))
                .available(true)
                .build();

        cartItem = CartItem.builder()
                .id(200L)
                .foodItem(foodItem)
                .quantity(2)
                .build();

        List<CartItem> items = new ArrayList<>();
        items.add(cartItem);

        cart = Cart.builder()
                .id(300L)
                .customer(customer)
                .restaurant(restaurant)
                .items(items)
                .build();

        payment = Payment.builder()
                .id(500L)
                .paymentMethod(PaymentMethod.CASH_ON_DELIVERY)
                .status(PaymentStatus.PENDING)
                .amount(new BigDecimal("26.00"))
                .transactionReference("COD-TEST")
                .build();
    }

    @Test
    void createOrder_Success_WithCashOnDelivery() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .addressId(50L)
                .notes("Ring the bell")
                .build();

        when(userService.findUserById(1L)).thenReturn(customer);
        when(addressService.findAddressAndVerifyOwnership(50L, 1L)).thenReturn(address);
        when(cartService.getOrCreateCartEntity(1L)).thenReturn(cart);
        doNothing().when(restaurantService).checkRestaurantIsOpen(restaurant);

        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(999L);
            o.setCreatedAt(LocalDateTime.now());
            return o;
        });
        when(paymentService.createInitialPayment(any(Order.class))).thenReturn(payment);

        OrderResponse response = orderService.createOrder(1L, request);

        assertNotNull(response);
        assertEquals(999L, response.getId());
        assertEquals(OrderStatus.PENDING, response.getStatus());
        assertEquals(PaymentMethod.CASH_ON_DELIVERY, response.getPaymentMethod());
        assertEquals(new BigDecimal("26.00"), response.getTotalAmount()); // 24 + 2 delivery fee

        verify(cartService).clearCart(1L);
        verify(paymentService).createInitialPayment(any(Order.class));
        verify(notificationService).sendNotification(eq(owner), anyString(), anyString(), any());
    }

    @Test
    void createOrder_Success_WithCouponDiscount() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .addressId(50L)
                .couponCode("SAVE5")
                .build();

        when(userService.findUserById(1L)).thenReturn(customer);
        when(addressService.findAddressAndVerifyOwnership(50L, 1L)).thenReturn(address);
        when(cartService.getOrCreateCartEntity(1L)).thenReturn(cart);
        doNothing().when(restaurantService).checkRestaurantIsOpen(restaurant);
        when(couponService.validateAndCalculateDiscountForUser(eq("SAVE5"), any(BigDecimal.class), eq(1L)))
                .thenReturn(new BigDecimal("5.00"));

        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(999L);
            o.setCreatedAt(LocalDateTime.now());
            return o;
        });
        when(paymentService.createInitialPayment(any(Order.class))).thenReturn(payment);

        OrderResponse response = orderService.createOrder(1L, request);

        assertNotNull(response);
        assertEquals(new BigDecimal("5.00"), response.getDiscount());
        assertEquals(new BigDecimal("21.00"), response.getTotalAmount()); // (24 - 5) + 2
        verify(couponService).recordUsageForUser("SAVE5", 1L);
    }

    @Test
    void createOrder_ThrowsBadRequest_WhenCartEmpty() {
        cart.getItems().clear();
        CreateOrderRequest request = CreateOrderRequest.builder().addressId(50L).build();

        when(userService.findUserById(1L)).thenReturn(customer);
        when(addressService.findAddressAndVerifyOwnership(50L, 1L)).thenReturn(address);
        when(cartService.getOrCreateCartEntity(1L)).thenReturn(cart);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> orderService.createOrder(1L, request));
        assertTrue(ex.getMessage().contains("empty cart"));
    }

    @Test
    void createOrder_ThrowsBadRequest_WhenRestaurantNotApproved() {
        restaurant.setStatus(RestaurantStatus.PENDING);
        CreateOrderRequest request = CreateOrderRequest.builder().addressId(50L).build();

        when(userService.findUserById(1L)).thenReturn(customer);
        when(addressService.findAddressAndVerifyOwnership(50L, 1L)).thenReturn(address);
        when(cartService.getOrCreateCartEntity(1L)).thenReturn(cart);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> orderService.createOrder(1L, request));
        assertTrue(ex.getMessage().contains("not currently active"));
    }

    @Test
    void createOrder_ThrowsBadRequest_WhenFoodItemUnavailable() {
        foodItem.setAvailable(false);
        CreateOrderRequest request = CreateOrderRequest.builder().addressId(50L).build();

        when(userService.findUserById(1L)).thenReturn(customer);
        when(addressService.findAddressAndVerifyOwnership(50L, 1L)).thenReturn(address);
        when(cartService.getOrCreateCartEntity(1L)).thenReturn(cart);
        doNothing().when(restaurantService).checkRestaurantIsOpen(restaurant);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> orderService.createOrder(1L, request));
        assertTrue(ex.getMessage().contains("no longer available"));
    }

    @Test
    void createOrder_ThrowsBadRequest_WhenSubtotalBelowMinimum() {
        restaurant.setMinimumOrder(new BigDecimal("100.00"));
        CreateOrderRequest request = CreateOrderRequest.builder().addressId(50L).build();

        when(userService.findUserById(1L)).thenReturn(customer);
        when(addressService.findAddressAndVerifyOwnership(50L, 1L)).thenReturn(address);
        when(cartService.getOrCreateCartEntity(1L)).thenReturn(cart);
        doNothing().when(restaurantService).checkRestaurantIsOpen(restaurant);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> orderService.createOrder(1L, request));
        assertTrue(ex.getMessage().contains("minimum order"));
    }

    @Test
    void getOrderDetails_Success_CustomerAccess() {
        Order order = Order.builder()
                .id(100L)
                .customer(customer)
                .restaurant(restaurant)
                .status(OrderStatus.CONFIRMED)
                .subtotal(new BigDecimal("24.00"))
                .deliveryFee(new BigDecimal("2.00"))
                .totalAmount(new BigDecimal("26.00"))
                .build();

        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(paymentService.getPaymentByOrderId(100L)).thenReturn(payment);
        when(deliveryService.getDeliveryByOrderId(100L)).thenReturn(null);

        OrderResponse res = orderService.getOrderDetails(100L, 1L, Role.CUSTOMER);

        assertNotNull(res);
        assertEquals(100L, res.getId());
        assertEquals(OrderStatus.CONFIRMED, res.getStatus());
    }

    @Test
    void getOrderDetails_Forbidden_WhenOtherCustomerAccesses() {
        Order order = Order.builder()
                .id(100L)
                .customer(customer)
                .restaurant(restaurant)
                .build();

        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));

        assertThrows(ForbiddenException.class,
                () -> orderService.getOrderDetails(100L, 999L, Role.CUSTOMER));
    }

    @Test
    void updateOrderStatusByRestaurant_ReadyForPickup_TriggersDelivery() {
        Order order = Order.builder()
                .id(100L)
                .customer(customer)
                .restaurant(restaurant)
                .status(OrderStatus.PREPARING)
                .build();

        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        doNothing().when(restaurantService).verifyOwnership(restaurant, 2L);
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse res = orderService.updateOrderStatusByRestaurant(2L, 100L, OrderStatus.READY_FOR_PICKUP);

        assertNotNull(res);
        assertEquals(OrderStatus.READY_FOR_PICKUP, order.getStatus());
        verify(deliveryService).createDeliveryRequest(order);
        verify(notificationService).sendNotification(eq(customer), anyString(), anyString(), any());
    }

    @Test
    void cancelOrder_Success_PendingOrder() {
        Order order = Order.builder()
                .id(100L)
                .customer(customer)
                .restaurant(restaurant)
                .status(OrderStatus.PENDING)
                .build();

        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse res = orderService.cancelOrder(1L, 100L);

        assertNotNull(res);
        assertEquals(OrderStatus.CANCELLED, order.getStatus());
        verify(notificationService).sendNotification(eq(owner), anyString(), anyString(), any());
    }

    @Test
    void cancelOrder_ThrowsBadRequest_WhenAlreadyDelivered() {
        Order order = Order.builder()
                .id(100L)
                .customer(customer)
                .restaurant(restaurant)
                .status(OrderStatus.DELIVERED)
                .build();

        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));

        assertThrows(BadRequestException.class,
                () -> orderService.cancelOrder(1L, 100L));
    }
}
