package com.example.fooddelivery.admin.service;

import com.example.fooddelivery.admin.dto.AdminDashboardStats;
import com.example.fooddelivery.admin.dto.AdminSearchResponse;
import com.example.fooddelivery.common.exception.ResourceNotFoundException;
import com.example.fooddelivery.common.response.PageResponse;
import com.example.fooddelivery.driver.repository.DriverRepository;
import com.example.fooddelivery.order.entity.OrderStatus;
import com.example.fooddelivery.order.repository.OrderRepository;
import com.example.fooddelivery.restaurant.entity.Restaurant;
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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.criteria.Predicate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
    public PageResponse<UserResponse> getUsers(Role role, String search, @NonNull Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (role != null) {
                predicates.add(cb.equal(root.get("role"), role));
            }

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), pattern);
                Predicate emailMatch = cb.like(cb.lower(root.get("email")), pattern);
                Predicate phoneMatch = cb.like(cb.lower(root.get("phoneNumber")), pattern);
                predicates.add(cb.or(nameMatch, emailMatch, phoneMatch));
            }

            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<User> page = userRepository.findAll(spec, pageable);
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
            java.time.LocalDate periodStart;
            java.time.LocalDate periodEnd;
            String label;

            switch (granularity.toLowerCase()) {
                case "weekly" -> {
                    periodStart = cursor;
                    periodEnd = cursor.plusDays(6).isAfter(to) ? to : cursor.plusDays(6);
                    label = cursor + " to " + periodEnd;
                    cursor = cursor.plusWeeks(1);
                }
                case "monthly" -> {
                    periodStart = cursor;
                    periodEnd = cursor.withDayOfMonth(cursor.lengthOfMonth()).isAfter(to)
                            ? to : cursor.withDayOfMonth(cursor.lengthOfMonth());
                    label = cursor.getYear() + "-" + String.format("%02d", cursor.getMonthValue());
                    cursor = cursor.plusMonths(1);
                }
                default -> { // daily
                    periodStart = cursor;
                    periodEnd = cursor;
                    label = cursor.toString();
                    cursor = cursor.plusDays(1);
                }
            }

            final java.time.LocalDateTime finalStart = periodStart.atStartOfDay();
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

    @Transactional(readOnly = true)
    public AdminSearchResponse globalSearch(String query, String type, int limit) {
        if (query == null || query.trim().isEmpty()) {
            return AdminSearchResponse.builder()
                    .restaurants(List.of())
                    .users(List.of())
                    .orders(List.of())
                    .drivers(List.of())
                    .totalMatches(0)
                    .build();
        }

        String trimmed = query.trim();
        int maxLimit = limit <= 0 ? 8 : Math.min(limit, 30);
        Pageable topPage = PageRequest.of(0, maxLimit);

        boolean searchAll = type == null || type.isBlank() || "ALL".equalsIgnoreCase(type);
        boolean searchRestaurants = searchAll || "RESTAURANTS".equalsIgnoreCase(type);
        boolean searchUsers = searchAll || "USERS".equalsIgnoreCase(type);
        boolean searchOrders = searchAll || "ORDERS".equalsIgnoreCase(type);
        boolean searchDrivers = searchAll || "DRIVERS".equalsIgnoreCase(type);

        List<AdminSearchResponse.RestaurantResult> restaurants = new ArrayList<>();
        List<AdminSearchResponse.UserResult> users = new ArrayList<>();
        List<AdminSearchResponse.OrderResult> orders = new ArrayList<>();
        List<AdminSearchResponse.DriverResult> drivers = new ArrayList<>();

        if (searchRestaurants) {
            String pattern = "%" + trimmed.toLowerCase() + "%";
            Specification<Restaurant> spec = (root, q, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("address")), pattern),
                    cb.like(cb.lower(root.get("phone")), pattern)
            );
            restaurants = restaurantRepository.findAll(spec, topPage).getContent().stream()
                    .map(r -> AdminSearchResponse.RestaurantResult.builder()
                            .id(r.getId())
                            .name(r.getName())
                            .status(r.getStatus().name())
                            .address(r.getAddress())
                            .phone(r.getPhone())
                            .logoUrl(r.getLogoUrl())
                            .rating(r.getRating())
                            .ownerName(r.getOwner() != null ? r.getOwner().getName() : null)
                            .build())
                    .toList();
        }

        if (searchUsers) {
            String pattern = "%" + trimmed.toLowerCase() + "%";
            Specification<User> spec = (root, q, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("email")), pattern),
                    cb.like(cb.lower(root.get("phoneNumber")), pattern)
            );
            users = userRepository.findAll(spec, topPage).getContent().stream()
                    .map(u -> AdminSearchResponse.UserResult.builder()
                            .id(u.getId())
                            .name(u.getName())
                            .email(u.getEmail())
                            .phoneNumber(u.getPhoneNumber())
                            .role(u.getRole().name())
                            .status(u.getStatus().name())
                            .profileImageUrl(u.getProfileImageUrl())
                            .build())
                    .toList();
        }

        if (searchOrders) {
            orders = orderRepository.searchOrdersAdmin(null, trimmed, topPage).getContent().stream()
                    .map(o -> AdminSearchResponse.OrderResult.builder()
                            .id(o.getId())
                            .orderNumber("#ORD-" + o.getId())
                            .status(o.getStatus().name())
                            .totalAmount(o.getTotalAmount())
                            .customerName(o.getCustomer() != null ? o.getCustomer().getName() : "Customer")
                            .customerEmail(o.getCustomer() != null ? o.getCustomer().getEmail() : null)
                            .restaurantName(o.getRestaurant() != null ? o.getRestaurant().getName() : "Restaurant")
                            .deliveryAddress(o.getDeliveryAddress())
                            .createdAt(o.getCreatedAt())
                            .build())
                    .toList();
        }

        if (searchDrivers) {
            drivers = driverRepository.searchDriversAdmin(null, trimmed, topPage).getContent().stream()
                    .map(d -> AdminSearchResponse.DriverResult.builder()
                            .id(d.getId())
                            .userId(d.getUser() != null ? d.getUser().getId() : null)
                            .name(d.getUser() != null ? d.getUser().getName() : "Driver")
                            .email(d.getUser() != null ? d.getUser().getEmail() : null)
                            .phoneNumber(d.getUser() != null ? d.getUser().getPhoneNumber() : null)
                            .vehicleType(d.getVehicleType())
                            .vehicleNumber(d.getVehicleNumber())
                            .approved(d.getApproved())
                            .online(d.getOnline())
                            .rating(d.getRating())
                            .build())
                    .toList();
        }

        long totalMatches = (long) restaurants.size() + users.size() + orders.size() + drivers.size();

        return AdminSearchResponse.builder()
                .restaurants(restaurants)
                .users(users)
                .orders(orders)
                .drivers(drivers)
                .totalMatches(totalMatches)
                .build();
    }
}