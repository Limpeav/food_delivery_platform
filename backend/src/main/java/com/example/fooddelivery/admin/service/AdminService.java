package com.example.fooddelivery.admin.service;

import com.example.fooddelivery.admin.dto.AdminDashboardStats;
import com.example.fooddelivery.common.exception.ResourceNotFoundException;
import com.example.fooddelivery.common.response.PageResponse;
import com.example.fooddelivery.driver.repository.DriverRepository;
import com.example.fooddelivery.order.entity.OrderStatus;
import com.example.fooddelivery.order.repository.OrderRepository;
import com.example.fooddelivery.restaurant.entity.RestaurantStatus;
import com.example.fooddelivery.restaurant.repository.RestaurantRepository;
import com.example.fooddelivery.user.dto.UserResponse;
import com.example.fooddelivery.user.entity.Role;
import com.example.fooddelivery.user.entity.User;
import com.example.fooddelivery.user.entity.UserStatus;
import com.example.fooddelivery.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final DriverRepository driverRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public AdminDashboardStats getDashboardStats() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        long totalCustomers = userRepository.countByRole(Role.CUSTOMER);
        long totalRestaurants = restaurantRepository.count();
        long totalDrivers = driverRepository.count();
        long totalOrders = orderRepository.count();

        long todayOrders = orderRepository.countOrdersSince(startOfDay);
        BigDecimal todayRevenue = orderRepository.calculateRevenueSince(startOfDay);
        BigDecimal monthlyRevenue = orderRepository.calculateRevenueSince(startOfMonth);
        BigDecimal totalRevenue = orderRepository.calculateTotalPlatformRevenue();

        long pendingRestaurants = restaurantRepository.countByStatus(RestaurantStatus.PENDING);
        long pendingDrivers = driverRepository.countByApproved(false);

        Map<String, Long> statusMap = new HashMap<>();
        List<Object[]> statusCounts = orderRepository.countOrdersGroupedByStatus();
        if (statusCounts != null) {
            for (Object[] row : statusCounts) {
                if (row != null && row.length >= 2 && row[0] != null && row[1] != null) {
                    String statusName = (row[0] instanceof OrderStatus orderStatus)
                            ? orderStatus.name()
                            : row[0].toString();
                    Long count = ((Number) row[1]).longValue();
                    statusMap.put(statusName, count);
                }
            }
        }

        return AdminDashboardStats.builder()
                .totalCustomers(totalCustomers)
                .totalRestaurants(totalRestaurants)
                .totalDrivers(totalDrivers)
                .totalOrders(totalOrders)
                .todayOrders(todayOrders)
                .todayRevenue(todayRevenue != null ? todayRevenue : BigDecimal.ZERO)
                .monthlyRevenue(monthlyRevenue != null ? monthlyRevenue : BigDecimal.ZERO)
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .pendingRestaurants(pendingRestaurants)
                .pendingDrivers(pendingDrivers)
                .orderStatusDistribution(statusMap)
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getUsers(Role role, @NonNull Pageable pageable) {
        Page<User> page = (role != null)
                ? userRepository.findByRole(role, pageable)
                : userRepository.findAll(pageable);
        return PageResponse.from(page.map(UserResponse::from));
    }

    @Transactional
    public UserResponse updateUserStatus(@NonNull Long userId, UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setStatus(status);
        User saved = userRepository.save(user);
        log.info("Admin updated user {} status to: {}", userId, status);
        return UserResponse.from(saved);
    }

    /**
     * Builds a revenue time-series map for the given date range and granularity (daily/weekly/monthly).
     * Returns: { "labels": [...], "revenue": [...], "orderCounts": [...] }
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getRevenueTimeSeries(java.time.LocalDate from, java.time.LocalDate to, String granularity) {
        List<String> labels = new java.util.ArrayList<>();
        List<java.math.BigDecimal> revenues = new java.util.ArrayList<>();
        List<Long> orderCounts = new java.util.ArrayList<>();

        java.time.LocalDate cursor = from;

        while (!cursor.isAfter(to)) {
            java.time.LocalDate periodEnd;
            String label;

            switch (granularity.toLowerCase()) {
                case "weekly" -> {
                    periodEnd = cursor.plusDays(6).isAfter(to) ? to : cursor.plusDays(6);
                    label = cursor + " to " + periodEnd;
                    cursor = cursor.plusWeeks(1);
                }
                case "monthly" -> {
                    periodEnd = cursor.withDayOfMonth(cursor.lengthOfMonth()).isAfter(to)
                            ? to : cursor.withDayOfMonth(cursor.lengthOfMonth());
                    label = cursor.getYear() + "-" + String.format("%02d", cursor.getMonthValue());
                    cursor = cursor.plusMonths(1);
                }
                default -> { // daily
                    periodEnd = cursor;
                    label = cursor.toString();
                    cursor = cursor.plusDays(1);
                }
            }

            LocalDateTime start = cursor.minusDays(1).atStartOfDay();
            if ("daily".equalsIgnoreCase(granularity)) {
                start = periodEnd.atStartOfDay();
            }
            LocalDateTime end = periodEnd.atTime(23, 59, 59);
            LocalDateTime periodStart = (label.equals(cursor.minusDays(1).toString()) || "daily".equalsIgnoreCase(granularity))
                    ? periodEnd.atStartOfDay()
                    : from.atStartOfDay();

            // Simpler approach: query per period
            final java.time.LocalDateTime finalStart = periodEnd.atStartOfDay();
            final java.time.LocalDateTime finalEnd = periodEnd.atTime(23, 59, 59);

            java.math.BigDecimal revenue = orderRepository.calculateRevenueInPeriod(finalStart, finalEnd);
            long count = orderRepository.countOrdersInPeriod(finalStart, finalEnd);

            labels.add(label);
            revenues.add(revenue != null ? revenue : java.math.BigDecimal.ZERO);
            orderCounts.add(count);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("labels", labels);
        result.put("revenue", revenues);
        result.put("orderCounts", orderCounts);
        result.put("granularity", granularity);
        result.put("from", from.toString());
        result.put("to", to.toString());
        return result;
    }
}