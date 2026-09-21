package com.example.fooddelivery.order.service;

import com.example.fooddelivery.address.entity.Address;
import com.example.fooddelivery.address.service.AddressService;
import com.example.fooddelivery.cart.entity.Cart;
import com.example.fooddelivery.cart.entity.CartItem;
import com.example.fooddelivery.cart.service.CartService;
import com.example.fooddelivery.common.exception.BadRequestException;
import com.example.fooddelivery.common.exception.ForbiddenException;
import com.example.fooddelivery.common.exception.ResourceNotFoundException;
import com.example.fooddelivery.common.response.PageResponse;
import com.example.fooddelivery.coupon.service.CouponService;
import com.example.fooddelivery.delivery.entity.Delivery;
import com.example.fooddelivery.delivery.service.DeliveryService;
import com.example.fooddelivery.driver.entity.Driver;
import com.example.fooddelivery.driver.entity.DriverLocation;
import com.example.fooddelivery.driver.repository.DriverLocationRepository;
import com.example.fooddelivery.food.entity.FoodItem;
import com.example.fooddelivery.notification.entity.NotificationType;
import com.example.fooddelivery.notification.service.NotificationService;
import com.example.fooddelivery.order.dto.CreateOrderRequest;
import com.example.fooddelivery.order.dto.OrderResponse;
import com.example.fooddelivery.order.entity.Order;
import com.example.fooddelivery.order.entity.OrderItem;
import com.example.fooddelivery.order.entity.OrderStatus;
import com.example.fooddelivery.order.repository.OrderItemRepository;
import com.example.fooddelivery.order.repository.OrderRepository;
import com.example.fooddelivery.payment.entity.Payment;
import com.example.fooddelivery.payment.service.PaymentService;
import com.example.fooddelivery.restaurant.entity.Restaurant;
import com.example.fooddelivery.restaurant.entity.RestaurantStatus;
import com.example.fooddelivery.restaurant.service.RestaurantService;
import com.example.fooddelivery.user.entity.Role;
import com.example.fooddelivery.user.entity.User;
import com.example.fooddelivery.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartService cartService;
    private final UserService userService;
    private final AddressService addressService;
    private final RestaurantService restaurantService;
    private final CouponService couponService;
    private final PaymentService paymentService;
    private final DeliveryService deliveryService;
    private final DriverLocationRepository driverLocationRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public OrderResponse createOrder(Long customerId, CreateOrderRequest request) {
        User customer = userService.findUserById(customerId);
        Address address = addressService.findAddressAndVerifyOwnership(request.getAddressId(), customerId);
        Cart cart = cartService.getOrCreateCartEntity(customerId);

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Cannot create order with an empty cart");
        }

        Restaurant restaurant = cart.getRestaurant();
        if (restaurant == null) {
            throw new BadRequestException("Cart is not associated with any restaurant");
        }

        if (restaurant.getStatus() != RestaurantStatus.APPROVED) {
            throw new BadRequestException("Restaurant is not currently active and accepting orders");
        }

        // Validate items and calculate subtotal directly from DB prices
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cart.getItems()) {
            FoodItem foodItem = cartItem.getFoodItem();
            if (!Boolean.TRUE.equals(foodItem.getAvailable())) {
                throw new BadRequestException("Food item '" + foodItem.getName() + "' is no longer available");
            }
            if (!foodItem.getRestaurant().getId().equals(restaurant.getId())) {
                throw new BadRequestException("Item '" + foodItem.getName() + "' does not belong to the restaurant");
            }

            BigDecimal itemPrice = foodItem.getPrice();
            BigDecimal itemSubtotal = itemPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            subtotal = subtotal.add(itemSubtotal);

            OrderItem orderItem = OrderItem.builder()
                    .foodItem(foodItem)
                    .foodName(foodItem.getName())
                    .imageUrl(foodItem.getImageUrl())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(itemPrice)
                    .subtotal(itemSubtotal)
                    .build();
            orderItems.add(orderItem);
        }

        // Validate minimum order amount
        if (restaurant.getMinimumOrder() != null && subtotal.compareTo(restaurant.getMinimumOrder()) < 0) {
            throw new BadRequestException(String.format("Order subtotal ($%.2f) does not meet the restaurant minimum order of $%.2f",
                    subtotal, restaurant.getMinimumOrder()));
        }

        // Validate and apply coupon
        BigDecimal discount = BigDecimal.ZERO;
        String couponCode = null;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            couponCode = request.getCouponCode().trim().toUpperCase();
            discount = couponService.validateAndCalculateDiscount(couponCode, subtotal);
            couponService.recordUsage(couponCode);
        }

        BigDecimal deliveryFee = restaurant.getDeliveryFee() != null ? restaurant.getDeliveryFee() : BigDecimal.ZERO;
        BigDecimal discountedSubtotal = subtotal.subtract(discount);
        if (discountedSubtotal.compareTo(BigDecimal.ZERO) < 0) {
            discountedSubtotal = BigDecimal.ZERO;
        }
        BigDecimal totalAmount = discountedSubtotal.add(deliveryFee);

        // Address snapshot string
        String addressSnapshot = String.format("%s, %s, %s (%s - %s)",
                address.getAddressLine(), address.getCity(), address.getLabel(),
                address.getRecipientName(), address.getPhoneNumber());

        // Create Order
        Order order = Order.builder()
                .customer(customer)
                .restaurant(restaurant)
                .deliveryAddress(addressSnapshot)
                .deliveryLatitude(address.getLatitude())
                .deliveryLongitude(address.getLongitude())
                .subtotal(subtotal)
                .deliveryFee(deliveryFee)
                .discount(discount)
                .totalAmount(totalAmount)
                .status(OrderStatus.PENDING)
                .couponCode(couponCode)
                .notes(request.getNotes())
                .build();

        Order savedOrder = orderRepository.save(order);

        for (OrderItem oi : orderItems) {
            oi.setOrder(savedOrder);
        }
        orderItemRepository.saveAll(orderItems);
        savedOrder.setItems(orderItems);

        // Create initial Payment
        Payment payment = paymentService.createInitialPayment(savedOrder, request.getPaymentMethod());

        // Clear customer cart
        cartService.clearCart(customerId);

        log.info("Order created successfully: #{} for customer: {}, total: ${}",
                savedOrder.getId(), customerId, totalAmount);

        // Notify restaurant owner
        notificationService.sendNotification(
                restaurant.getOwner(),
                "New Order Received",
                "New order #" + savedOrder.getId() + " placed with total $" + totalAmount,
                NotificationType.ORDER
        );

        // Broadcast order to restaurant channel via WebSocket
        try {
            messagingTemplate.convertAndSend("/topic/restaurants/" + restaurant.getId() + "/orders", Map.of(
                    "orderId", savedOrder.getId(),
                    "status", savedOrder.getStatus().name(),
                    "totalAmount", savedOrder.getTotalAmount(),
                    "itemCount", orderItems.size(),
                    "createdAt", savedOrder.getCreatedAt().toString()
            ));
        } catch (Exception e) {
            log.warn("Failed to broadcast new order via WebSocket: {}", e.getMessage());
        }

        return OrderResponse.from(savedOrder, payment, null, null);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderDetails(Long orderId, Long userId, Role userRole) {
        Order order = findOrderById(orderId);

        // Ownership and access check
        if (userRole == Role.CUSTOMER && !order.getCustomer().getId().equals(userId)) {
            throw new ForbiddenException("You cannot view this order");
        }
        if (userRole == Role.RESTAURANT_OWNER && !order.getRestaurant().getOwner().getId().equals(userId)) {
            throw new ForbiddenException("You cannot view this order");
        }

        Payment payment = paymentService.getPaymentByOrderId(orderId);
        Delivery delivery = deliveryService.getDeliveryByOrderId(orderId);
        DriverLocation driverLocation = null;
        if (delivery != null && delivery.getDriver() != null) {
            driverLocation = driverLocationRepository.findByDriverId(delivery.getDriver().getId()).orElse(null);
        }

        return OrderResponse.from(order, payment, delivery, driverLocation);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getCustomerOrders(Long customerId, Pageable pageable) {
        Page<Order> page = orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId, pageable);
        return PageResponse.from(page.map(this::mapToOrderResponse));
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getRestaurantOrders(Long ownerId, OrderStatus status, Pageable pageable) {
        com.example.fooddelivery.restaurant.dto.RestaurantResponse restaurant;
        try {
            restaurant = restaurantService.getMyRestaurant(ownerId);
        } catch (ResourceNotFoundException e) {
            return PageResponse.from(Page.empty(pageable));
        }
        Page<Order> page = (status != null)
                ? orderRepository.findByRestaurantIdAndStatusOrderByCreatedAtDesc(restaurant.getId(), status, pageable)
                : orderRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurant.getId(), pageable);
        return PageResponse.from(page.map(this::mapToOrderResponse));
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getAllOrdersAdmin(Pageable pageable) {
        Page<Order> page = orderRepository.findAll(pageable);
        return PageResponse.from(page.map(this::mapToOrderResponse));
    }

    @Transactional
    public OrderResponse updateOrderStatusByRestaurant(Long ownerId, Long orderId, OrderStatus newStatus) {
        Order order = findOrderById(orderId);
        restaurantService.verifyOwnership(order.getRestaurant(), ownerId);

        order.getStatus().validateTransitionTo(newStatus);
        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);
        log.info("Order #{} status updated to {} by restaurant owner", orderId, newStatus);

        // If marked READY_FOR_PICKUP, automatically trigger delivery request!
        if (newStatus == OrderStatus.READY_FOR_PICKUP) {
            deliveryService.createDeliveryRequest(updated);
        }

        // Notify customer
        notificationService.sendNotification(
                order.getCustomer(),
                "Order Update",
                "Your order #" + order.getId() + " is now " + newStatus.name().toLowerCase().replace("_", " "),
                NotificationType.ORDER
        );

        // Broadcast order update via WebSocket
        broadcastOrderUpdate(updated);

        return mapToOrderResponse(updated);
    }

    @Transactional
    public OrderResponse cancelOrder(Long customerId, Long orderId) {
        Order order = findOrderById(orderId);
        if (!order.getCustomer().getId().equals(customerId)) {
            throw new ForbiddenException("You cannot cancel this order");
        }

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Order cannot be cancelled at this stage (" + order.getStatus() + ")");
        }

        order.getStatus().validateTransitionTo(OrderStatus.CANCELLED);
        order.setStatus(OrderStatus.CANCELLED);
        Order updated = orderRepository.save(order);
        log.info("Order #{} cancelled by customer {}", orderId, customerId);

        notificationService.sendNotification(
                order.getRestaurant().getOwner(),
                "Order Cancelled",
                "Order #" + order.getId() + " was cancelled by the customer.",
                NotificationType.ORDER
        );

        broadcastOrderUpdate(updated);
        return mapToOrderResponse(updated);
    }

    @Transactional(readOnly = true)
    public Order findOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
    }

    private OrderResponse mapToOrderResponse(Order order) {
        Payment payment = paymentService.getPaymentByOrderId(order.getId());
        Delivery delivery = deliveryService.getDeliveryByOrderId(order.getId());
        DriverLocation driverLocation = null;
        if (delivery != null && delivery.getDriver() != null) {
            driverLocation = driverLocationRepository.findByDriverId(delivery.getDriver().getId()).orElse(null);
        }
        return OrderResponse.from(order, payment, delivery, driverLocation);
    }

    private void broadcastOrderUpdate(Order order) {
        try {
            messagingTemplate.convertAndSend("/topic/orders/" + order.getId(), Map.of(
                    "orderId", order.getId(),
                    "status", order.getStatus().name(),
                    "updatedAt", LocalDateTime.now().toString()
            ));
        } catch (Exception e) {
            log.warn("Failed to broadcast order update via WebSocket: {}", e.getMessage());
        }
    }
}
