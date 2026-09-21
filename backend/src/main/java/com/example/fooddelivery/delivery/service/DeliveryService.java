package com.example.fooddelivery.delivery.service;

import com.example.fooddelivery.common.exception.BadRequestException;
import com.example.fooddelivery.common.exception.ForbiddenException;
import com.example.fooddelivery.common.exception.ResourceNotFoundException;
import com.example.fooddelivery.common.util.GeoUtils;
import com.example.fooddelivery.delivery.dto.DeliveryResponse;
import com.example.fooddelivery.delivery.entity.Delivery;
import com.example.fooddelivery.delivery.entity.DeliveryStatus;
import com.example.fooddelivery.delivery.repository.DeliveryRepository;
import com.example.fooddelivery.driver.entity.Driver;
import com.example.fooddelivery.driver.entity.DriverLocation;
import com.example.fooddelivery.driver.repository.DriverLocationRepository;
import com.example.fooddelivery.driver.repository.DriverRepository;
import com.example.fooddelivery.driver.service.DriverService;
import com.example.fooddelivery.notification.entity.NotificationType;
import com.example.fooddelivery.notification.service.NotificationService;
import com.example.fooddelivery.order.entity.Order;
import com.example.fooddelivery.order.entity.OrderStatus;
import com.example.fooddelivery.order.repository.OrderRepository;
import com.example.fooddelivery.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final DriverRepository driverRepository;
    private final DriverLocationRepository locationRepository;
    private final DriverService driverService;
    private final OrderRepository orderRepository;
    private final PaymentService paymentService;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    private static final List<DeliveryStatus> ACTIVE_DELIVERY_STATUSES = List.of(
            DeliveryStatus.DRIVER_ASSIGNED,
            DeliveryStatus.GOING_TO_RESTAURANT,
            DeliveryStatus.FOOD_PICKED_UP,
            DeliveryStatus.DELIVERING
    );

    @Transactional
    public Delivery createDeliveryRequest(Order order) {
        Optional<Delivery> existing = deliveryRepository.findByOrderId(order.getId());
        if (existing.isPresent()) {
            return existing.get();
        }

        Delivery delivery = Delivery.builder()
                .order(order)
                .status(DeliveryStatus.WAITING_FOR_DRIVER)
                .build();

        Delivery saved = deliveryRepository.save(delivery);
        log.info("Delivery request created for order: {}", order.getId());

        // Attempt automatic dispatch to nearest available driver
        attemptDriverAssignment(saved);

        // Broadcast available delivery to driver network
        try {
            messagingTemplate.convertAndSend("/topic/deliveries/available", Map.of(
                    "deliveryId", saved.getId(),
                    "orderId", order.getId(),
                    "restaurantName", order.getRestaurant().getName(),
                    "restaurantAddress", order.getRestaurant().getAddress(),
                    "deliveryAddress", order.getDeliveryAddress(),
                    "deliveryFee", order.getDeliveryFee()
            ));
        } catch (Exception e) {
            log.warn("Failed to broadcast delivery request via WebSocket: {}", e.getMessage());
        }

        return saved;
    }

    /**
     * Nearest driver assignment strategy based on Haversine distance.
     */
    @Transactional
    public void attemptDriverAssignment(Delivery delivery) {
        Order order = delivery.getOrder();
        double restLat = order.getRestaurant().getLatitude();
        double restLng = order.getRestaurant().getLongitude();

        List<Driver> onlineDrivers = driverRepository.findByApprovedTrueAndOnlineTrue();
        if (onlineDrivers.isEmpty()) {
            log.info("No online drivers available for delivery: {}", delivery.getId());
            return;
        }

        Driver bestDriver = null;
        double minDistance = Double.MAX_VALUE;

        for (Driver driver : onlineDrivers) {
            // Check if driver has active delivery
            boolean hasActive = !deliveryRepository.findByDriverIdAndStatusIn(driver.getId(), ACTIVE_DELIVERY_STATUSES).isEmpty();
            if (hasActive) {
                continue;
            }

            Optional<DriverLocation> locOpt = locationRepository.findByDriverId(driver.getId());
            double dist;
            if (locOpt.isPresent()) {
                dist = GeoUtils.calculateDistanceKm(
                        locOpt.get().getLatitude(), locOpt.get().getLongitude(),
                        restLat, restLng
                );
            } else {
                dist = 10.0; // fallback default distance
            }

            if (dist < minDistance) {
                minDistance = dist;
                bestDriver = driver;
            }
        }

        if (bestDriver != null) {
            assignDriverToDelivery(delivery, bestDriver);
        }
    }

    @Transactional
    public void assignDriverToDelivery(Delivery delivery, Driver driver) {
        delivery.setDriver(driver);
        delivery.setStatus(DeliveryStatus.DRIVER_ASSIGNED);
        Delivery saved = deliveryRepository.save(delivery);

        Order order = delivery.getOrder();
        order.setStatus(OrderStatus.DRIVER_ASSIGNED);
        orderRepository.save(order);

        log.info("Driver {} assigned to delivery {}", driver.getId(), delivery.getId());

        // Notify driver
        notificationService.sendNotification(
                driver.getUser(),
                "New Delivery Assigned",
                "You have been assigned to deliver order #" + order.getId() + " from " + order.getRestaurant().getName(),
                NotificationType.DELIVERY
        );

        // Notify customer
        notificationService.sendNotification(
                order.getCustomer(),
                "Driver Assigned",
                driver.getUser().getName() + " has been assigned to deliver your order #" + order.getId(),
                NotificationType.DELIVERY
        );

        // Broadcast order update via WebSocket
        broadcastOrderUpdate(order);
    }

    @Transactional
    public DeliveryResponse acceptDelivery(Long driverUserId, Long deliveryId) {
        Driver driver = driverService.findDriverByUserId(driverUserId);
        Delivery delivery = findDeliveryById(deliveryId);

        if (delivery.getStatus() != DeliveryStatus.WAITING_FOR_DRIVER) {
            throw new BadRequestException("Delivery is no longer waiting for a driver");
        }

        assignDriverToDelivery(delivery, driver);
        delivery.setStatus(DeliveryStatus.GOING_TO_RESTAURANT);
        Delivery saved = deliveryRepository.save(delivery);
        return DeliveryResponse.from(saved);
    }

    @Transactional
    public DeliveryResponse pickupFood(Long driverUserId, Long deliveryId) {
        Delivery delivery = findDeliveryAndVerifyDriver(driverUserId, deliveryId);

        delivery.setStatus(DeliveryStatus.FOOD_PICKED_UP);
        delivery.setPickedUpTime(LocalDateTime.now());
        Delivery saved = deliveryRepository.save(delivery);

        Order order = delivery.getOrder();
        order.setStatus(OrderStatus.PICKED_UP);
        orderRepository.save(order);

        notificationService.sendNotification(
                order.getCustomer(),
                "Food Picked Up",
                "Your driver has picked up your order and is heading your way!",
                NotificationType.DELIVERY
        );

        broadcastOrderUpdate(order);
        return DeliveryResponse.from(saved);
    }

    @Transactional
    public DeliveryResponse startDelivering(Long driverUserId, Long deliveryId) {
        Delivery delivery = findDeliveryAndVerifyDriver(driverUserId, deliveryId);

        delivery.setStatus(DeliveryStatus.DELIVERING);
        Delivery saved = deliveryRepository.save(delivery);

        Order order = delivery.getOrder();
        order.setStatus(OrderStatus.OUT_FOR_DELIVERY);
        orderRepository.save(order);

        notificationService.sendNotification(
                order.getCustomer(),
                "Out For Delivery",
                "Your order #" + order.getId() + " is now out for delivery!",
                NotificationType.DELIVERY
        );

        broadcastOrderUpdate(order);
        return DeliveryResponse.from(saved);
    }

    @Transactional
    public DeliveryResponse completeDelivery(Long driverUserId, Long deliveryId) {
        Delivery delivery = findDeliveryAndVerifyDriver(driverUserId, deliveryId);

        delivery.setStatus(DeliveryStatus.DELIVERED);
        delivery.setDeliveredTime(LocalDateTime.now());
        Delivery saved = deliveryRepository.save(delivery);

        Order order = delivery.getOrder();
        order.setStatus(OrderStatus.DELIVERED);
        orderRepository.save(order);

        // Mark COD payment as paid if applicable
        paymentService.markPaymentAsPaid(order.getId());

        // Notify customer
        notificationService.sendNotification(
                order.getCustomer(),
                "Order Delivered",
                "Your order #" + order.getId() + " has been delivered. Enjoy your meal!",
                NotificationType.DELIVERY
        );

        // Notify restaurant
        notificationService.sendNotification(
                order.getRestaurant().getOwner(),
                "Order Completed",
                "Order #" + order.getId() + " was successfully delivered to customer.",
                NotificationType.ORDER
        );

        broadcastOrderUpdate(order);
        return DeliveryResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public Delivery findDeliveryById(Long id) {
        return deliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery", "id", id));
    }

    @Transactional(readOnly = true)
    public Delivery getDeliveryByOrderId(Long orderId) {
        return deliveryRepository.findByOrderId(orderId).orElse(null);
    }

    @Transactional(readOnly = true)
    public Optional<DeliveryResponse> getCurrentDriverActiveDelivery(Long driverUserId) {
        Optional<Driver> driverOpt = driverRepository.findByUserId(driverUserId);
        if (driverOpt.isEmpty()) {
            return Optional.empty();
        }
        return deliveryRepository.findFirstByDriverIdAndStatusIn(driverOpt.get().getId(), ACTIVE_DELIVERY_STATUSES)
                .map(DeliveryResponse::from);
    }

    @Transactional(readOnly = true)
    public List<DeliveryResponse> getAvailableDeliveries() {
        return deliveryRepository.findByStatus(DeliveryStatus.WAITING_FOR_DRIVER).stream()
                .map(DeliveryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<DeliveryResponse> getMyDeliveries(Long driverUserId, org.springframework.data.domain.Pageable pageable) {
        Optional<Driver> driverOpt = driverRepository.findByUserId(driverUserId);
        if (driverOpt.isEmpty()) {
            return org.springframework.data.domain.Page.empty(pageable);
        }
        return deliveryRepository.findByDriverId(driverOpt.get().getId(), pageable)
                .map(DeliveryResponse::from);
    }

    @Transactional(readOnly = true)
    public DeliveryResponse getMyDeliveryById(Long driverUserId, Long deliveryId) {
        return DeliveryResponse.from(findDeliveryAndVerifyDriver(driverUserId, deliveryId));
    }

    private Delivery findDeliveryAndVerifyDriver(Long driverUserId, Long deliveryId) {
        Driver driver = driverService.findDriverByUserId(driverUserId);
        Delivery delivery = findDeliveryById(deliveryId);

        if (delivery.getDriver() == null || !delivery.getDriver().getId().equals(driver.getId())) {
            throw new ForbiddenException("You are not assigned to this delivery");
        }
        return delivery;
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
