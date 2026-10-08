package com.example.fooddelivery.driver.service;

import com.example.fooddelivery.common.exception.BadRequestException;
import com.example.fooddelivery.common.exception.ResourceNotFoundException;
import com.example.fooddelivery.common.response.PageResponse;
import com.example.fooddelivery.delivery.dto.DeliveryResponse;
import com.example.fooddelivery.delivery.entity.Delivery;
import com.example.fooddelivery.delivery.entity.DeliveryStatus;
import com.example.fooddelivery.delivery.repository.DeliveryRepository;
import com.example.fooddelivery.driver.dto.DriverDashboardStats;
import com.example.fooddelivery.driver.dto.DriverLocationUpdateRequest;
import com.example.fooddelivery.driver.dto.DriverRegisterRequest;
import com.example.fooddelivery.driver.dto.DriverResponse;
import com.example.fooddelivery.driver.entity.Driver;
import com.example.fooddelivery.driver.entity.DriverLocation;
import com.example.fooddelivery.driver.repository.DriverLocationRepository;
import com.example.fooddelivery.driver.repository.DriverRepository;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DriverService {

    private static final List<DeliveryStatus> ACTIVE_DELIVERY_STATUSES = List.of(
            DeliveryStatus.DRIVER_ASSIGNED,
            DeliveryStatus.GOING_TO_RESTAURANT,
            DeliveryStatus.FOOD_PICKED_UP,
            DeliveryStatus.DELIVERING
    );

    private final DriverRepository driverRepository;
    private final DriverLocationRepository locationRepository;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;
    private final DeliveryRepository deliveryRepository;

    @Transactional(readOnly = true)
    public DriverDashboardStats getDriverDashboardStats(Long userId) {
        Driver driver = findDriverByUserId(userId);

        List<Delivery> allDeliveries =
                deliveryRepository.findByDriverId(driver.getId(), Pageable.unpaged()).getContent();

        long completed = allDeliveries.stream()
                .filter(d -> d.getStatus() == DeliveryStatus.DELIVERED)
                .count();

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();

        BigDecimal todayEarnings = allDeliveries.stream()
                .filter(d -> d.getStatus() == DeliveryStatus.DELIVERED
                        && d.getDeliveredTime() != null && d.getDeliveredTime().isAfter(startOfDay))
                .map(d -> d.getOrder().getDeliveryFee())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalEarnings = allDeliveries.stream()
                .filter(d -> d.getStatus() == DeliveryStatus.DELIVERED)
                .map(d -> d.getOrder().getDeliveryFee())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        DeliveryResponse activeResp = allDeliveries.stream()
                .filter(d -> d.getStatus() != DeliveryStatus.DELIVERED
                        && d.getStatus() != DeliveryStatus.CANCELLED
                        && d.getStatus() != DeliveryStatus.WAITING_FOR_DRIVER)
                .findFirst()
                .map(DeliveryResponse::from)
                .orElse(null);

        return DriverDashboardStats.builder()
                .online(driver.getOnline())
                .approved(driver.getApproved())
                .rating(driver.getRating())
                .activeDelivery(activeResp)
                .completedDeliveries(completed)
                .todayEarnings(todayEarnings)
                .totalEarnings(totalEarnings)
                .build();
    }

    @Transactional(readOnly = true)
    public Driver findDriverByUserId(Long userId) {
        return driverRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver profile not found for user: " + userId));
    }

    @Transactional(readOnly = true)
    public Driver findDriverById(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", id));
    }

    @Transactional(readOnly = true)
    public DriverResponse getMyProfile(Long userId) {
        Driver driver = findDriverByUserId(userId);
        DriverLocation location = locationRepository.findByDriverId(driver.getId()).orElse(null);
        return DriverResponse.from(driver, location);
    }

    @Transactional
    public DriverResponse registerDriver(Long userId, DriverRegisterRequest request) {
        User user = userService.findUserById(userId);

        if (driverRepository.existsByUserId(userId)) {
            throw new BadRequestException("Driver profile already exists for this account");
        }

        Driver driver = Driver.builder()
                .user(user)
                .vehicleType(request.getVehicleType().trim())
                .vehicleNumber(request.getVehicleNumber().trim())
                .licenseNumber(request.getLicenseNumber().trim())
                .online(false)
                .approved(false)
                .build();

        Driver saved = driverRepository.save(driver);
        log.info("Driver profile registered with id: {} (pending approval)", saved.getId());
        return DriverResponse.from(saved, null);
    }

    @Transactional
    public DriverResponse toggleOnline(Long userId) {
        Driver driver = findDriverByUserId(userId);

        if (!Boolean.TRUE.equals(driver.getApproved())) {
            throw new BadRequestException("Your driver account is pending admin approval. You cannot go online yet.");
        }

        driver.setOnline(!Boolean.TRUE.equals(driver.getOnline()));
        Driver updated = driverRepository.save(driver);
        DriverLocation location = locationRepository.findByDriverId(driver.getId()).orElse(null);

        log.info("Driver {} online status toggled to: {}", driver.getId(), updated.getOnline());
        return DriverResponse.from(updated, location);
    }

    @Transactional
    public DriverResponse updateLocation(Long userId, DriverLocationUpdateRequest request) {
        Driver driver = findDriverByUserId(userId);

        DriverLocation location = locationRepository.findByDriverId(driver.getId())
                .orElseGet(() -> DriverLocation.builder()
                        .driver(driver)
                        .latitude(request.getLatitude())
                        .longitude(request.getLongitude())
                        .build());

        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());
        DriverLocation savedLocation = locationRepository.save(location);

        // Broadcast real-time location via WebSocket STOMP
        try {
            Map<String, Object> locationPayload = Map.of(
                    "driverId", driver.getId(),
                    "latitude", savedLocation.getLatitude(),
                    "longitude", savedLocation.getLongitude(),
                    "updatedAt", savedLocation.getUpdatedAt().toString()
            );
            messagingTemplate.convertAndSend("/topic/drivers/" + driver.getId() + "/location", locationPayload);

            // If driver is currently fulfilling an active delivery, broadcast to the order topic for live customer tracking
            deliveryRepository.findFirstByDriverIdAndStatusIn(
                    driver.getId(),
                    ACTIVE_DELIVERY_STATUSES
            ).ifPresent(activeDelivery -> {
                messagingTemplate.convertAndSend("/topic/orders/" + activeDelivery.getOrder().getId() + "/location", locationPayload);
            });
        } catch (Exception e) {
            log.warn("Failed to broadcast driver location via WebSocket: {}", e.getMessage());
        }

        return DriverResponse.from(driver, savedLocation);
    }

    @Transactional
    public DriverResponse approveDriver(Long driverId, boolean approve) {
        Driver driver = findDriverById(driverId);
        driver.setApproved(approve);
        if (!approve) {
            driver.setOnline(false);
        }
        Driver updated = driverRepository.save(driver);
        DriverLocation location = locationRepository.findByDriverId(driver.getId()).orElse(null);
        log.info("Driver id {} approval set to: {}", driverId, approve);
        return DriverResponse.from(updated, location);
    }

    @Transactional(readOnly = true)
    public PageResponse<DriverResponse> getAllDriversAdmin(Boolean approved, Pageable pageable) {
        Page<Driver> page = (approved != null)
                ? driverRepository.findByApproved(approved, pageable)
                : driverRepository.findAll(pageable);

        Page<DriverResponse> dtoPage = page.map(d -> {
            DriverLocation loc = locationRepository.findByDriverId(d.getId()).orElse(null);
            return DriverResponse.from(d, loc);
        });

        return PageResponse.from(dtoPage);
    }

    /**
     * Returns a paginated history of completed deliveries for the driver, ordered by delivery time descending.
     * Each record includes the delivery fee earned.
     */
    @Transactional(readOnly = true)
    public PageResponse<DeliveryResponse> getEarningsHistory(
            Long userId, Pageable pageable) {
        Driver driver = findDriverByUserId(userId);
        Page<DeliveryResponse> page =
                deliveryRepository.findByDriverIdAndStatus(driver.getId(),
                        DeliveryStatus.DELIVERED, pageable)
                        .map(DeliveryResponse::from);
        return PageResponse.from(page);
    }
}

