package com.example.fooddelivery.restaurant.service;

import com.example.fooddelivery.common.exception.BadRequestException;
import com.example.fooddelivery.common.exception.ForbiddenException;
import com.example.fooddelivery.common.exception.ResourceNotFoundException;
import com.example.fooddelivery.common.response.PageResponse;
import com.example.fooddelivery.restaurant.dto.RestaurantRequest;
import com.example.fooddelivery.restaurant.dto.RestaurantResponse;
import com.example.fooddelivery.restaurant.entity.Restaurant;
import com.example.fooddelivery.restaurant.entity.RestaurantStatus;
import com.example.fooddelivery.restaurant.repository.RestaurantRepository;
import com.example.fooddelivery.restaurantcategory.entity.RestaurantCategory;
import com.example.fooddelivery.restaurantcategory.service.RestaurantCategoryService;
import com.example.fooddelivery.user.entity.User;
import com.example.fooddelivery.user.service.UserService;
import com.example.fooddelivery.common.util.GeoUtils;
import com.example.fooddelivery.food.dto.FoodItemResponse;
import com.example.fooddelivery.food.entity.FoodItem;
import com.example.fooddelivery.food.repository.FoodItemRepository;
import com.example.fooddelivery.restaurant.dto.NearbyRecommendationResponse;
import com.example.fooddelivery.restaurant.dto.NearbyRestaurantResponse;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final UserService userService;
    private final RestaurantCategoryService categoryService;
    private final FoodItemRepository foodItemRepository;
    private final com.example.fooddelivery.order.repository.OrderRepository orderRepository;
    private final com.example.fooddelivery.order.repository.OrderItemRepository orderItemRepository;

    @Transactional(readOnly = true)
    public com.example.fooddelivery.restaurant.dto.RestaurantDashboardStats getRestaurantDashboardStats(Long ownerId) {
        Restaurant restaurant = restaurantRepository.findFirstByOwnerIdOrderByIdAsc(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("No restaurant found for current owner"));

        java.time.LocalDateTime startOfDay = java.time.LocalDate.now().atStartOfDay();

        long pending = orderRepository.countByRestaurantIdAndStatus(restaurant.getId(), com.example.fooddelivery.order.entity.OrderStatus.PENDING);
        long completed = orderRepository.countByRestaurantIdAndStatus(restaurant.getId(), com.example.fooddelivery.order.entity.OrderStatus.DELIVERED);

        java.math.BigDecimal todayRevenue = orderRepository.calculateRestaurantRevenueSince(restaurant.getId(), startOfDay);

        List<Object[]> topFoodsRaw = orderItemRepository.findTopSellingFoodsByRestaurant(restaurant.getId());
        List<java.util.Map<String, Object>> topSelling = new ArrayList<>();
        int count = 0;
        for (Object[] row : topFoodsRaw) {
            if (count++ >= 5) break;
            topSelling.add(java.util.Map.of(
                    "foodName", row[0],
                    "totalQuantity", row[1],
                    "totalRevenue", row[2]
            ));
        }

        return com.example.fooddelivery.restaurant.dto.RestaurantDashboardStats.builder()
                .todayOrders(pending + completed)
                .todayRevenue(todayRevenue != null ? todayRevenue : java.math.BigDecimal.ZERO)
                .pendingOrders(pending)
                .completedOrders(completed)
                .rating(restaurant.getRating())
                .reviewCount(restaurant.getReviewCount())
                .topSellingFoods(topSelling)
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<RestaurantResponse> searchRestaurants(String search, Long categoryId, Pageable pageable) {
        Specification<Restaurant> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("status"), RestaurantStatus.APPROVED));

            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), searchPattern),
                        cb.like(cb.lower(root.get("description")), searchPattern)
                ));
            }

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<RestaurantResponse> page = restaurantRepository.findAll(spec, pageable)
                .map(RestaurantResponse::from);
        return PageResponse.from(page);
    }

    @Cacheable(value = "restaurants", key = "#id")
    @Transactional(readOnly = true)
    public RestaurantResponse getRestaurantById(Long id) {
        log.info("Fetching restaurant from DB for id: {}", id);
        Restaurant restaurant = findRestaurantById(id);
        return RestaurantResponse.from(restaurant);
    }

    @Transactional(readOnly = true)
    public Restaurant findRestaurantById(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", id));
    }

    @Transactional(readOnly = true)
    public RestaurantResponse getMyRestaurant(Long ownerId) {
        Restaurant restaurant = restaurantRepository.findFirstByOwnerIdOrderByIdAsc(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("No restaurant registered for current user"));
        return RestaurantResponse.from(restaurant);
    }

    @Transactional(readOnly = true)
    public List<RestaurantResponse> getMyRestaurants(Long ownerId) {
        return restaurantRepository.findAllByOwnerId(ownerId).stream()
                .map(RestaurantResponse::from)
                .toList();
    }

    @Transactional
    public RestaurantResponse createRestaurant(Long ownerId, RestaurantRequest request) {
        User owner = userService.findUserById(ownerId);
        RestaurantCategory category = categoryService.findCategoryById(request.getCategoryId());

        Restaurant restaurant = Restaurant.builder()
                .owner(owner)
                .category(category)
                .name(request.getName().trim())
                .description(request.getDescription())
                .logoUrl(request.getLogoUrl())
                .coverImageUrl(request.getCoverImageUrl())
                .phone(request.getPhone().trim())
                .address(request.getAddress().trim())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .openingTime(request.getOpeningTime())
                .closingTime(request.getClosingTime())
                .deliveryFee(request.getDeliveryFee())
                .minimumOrder(request.getMinimumOrder())
                .status(RestaurantStatus.PENDING)
                .build();

        Restaurant saved = restaurantRepository.save(restaurant);
        log.info("Restaurant created with id: {} (status: PENDING)", saved.getId());
        return RestaurantResponse.from(saved);
    }

    @CacheEvict(value = "restaurants", key = "#result.id")
    @Transactional
    public RestaurantResponse updateRestaurant(Long ownerId, RestaurantRequest request) {
        Restaurant restaurant = restaurantRepository.findFirstByOwnerIdOrderByIdAsc(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("No restaurant found for current owner"));
        return applyRestaurantUpdates(restaurant, ownerId, request);
    }

    @CacheEvict(value = "restaurants", key = "#restaurantId")
    @Transactional
    public RestaurantResponse updateRestaurantById(Long ownerId, Long restaurantId, RestaurantRequest request) {
        Restaurant restaurant = findRestaurantById(restaurantId);
        verifyOwnership(restaurant, ownerId);
        return applyRestaurantUpdates(restaurant, ownerId, request);
    }

    private RestaurantResponse applyRestaurantUpdates(Restaurant restaurant, Long ownerId, RestaurantRequest request) {
        verifyOwnership(restaurant, ownerId);
        RestaurantCategory category = categoryService.findCategoryById(request.getCategoryId());

        restaurant.setCategory(category);
        restaurant.setName(request.getName().trim());
        restaurant.setDescription(request.getDescription());
        restaurant.setLogoUrl(request.getLogoUrl());
        restaurant.setCoverImageUrl(request.getCoverImageUrl());
        restaurant.setPhone(request.getPhone().trim());
        restaurant.setAddress(request.getAddress().trim());
        restaurant.setLatitude(request.getLatitude());
        restaurant.setLongitude(request.getLongitude());
        restaurant.setOpeningTime(request.getOpeningTime());
        restaurant.setClosingTime(request.getClosingTime());
        restaurant.setDeliveryFee(request.getDeliveryFee());
        restaurant.setMinimumOrder(request.getMinimumOrder());

        Restaurant updated = restaurantRepository.save(restaurant);
        log.info("Restaurant updated: {}", updated.getId());
        return RestaurantResponse.from(updated);
    }

    @CacheEvict(value = "restaurants", key = "#id")
    @Transactional
    public RestaurantResponse updateRestaurantStatus(Long id, RestaurantStatus status) {
        Restaurant restaurant = findRestaurantById(id);
        restaurant.setStatus(status);
        Restaurant updated = restaurantRepository.save(restaurant);
        log.info("Restaurant id: {} status updated to: {}", id, status);
        return RestaurantResponse.from(updated);
    }

    @Transactional(readOnly = true)
    public PageResponse<RestaurantResponse> getAllRestaurantsForAdmin(RestaurantStatus status, Pageable pageable) {
        Page<Restaurant> page = (status != null)
                ? restaurantRepository.findByStatus(status, pageable)
                : restaurantRepository.findAll(pageable);
        return PageResponse.from(page.map(RestaurantResponse::from));
    }

    public void verifyOwnership(Restaurant restaurant, Long ownerId) {
        if (!restaurant.getOwner().getId().equals(ownerId)) {
            throw new ForbiddenException("You are not the owner of this restaurant");
        }
    }

    /**
     * Determines if the restaurant is currently open based on its configured opening/closing hours.
     * Times are expected in HH:mm format (24-hour).
     */
    public boolean isOpen(Restaurant restaurant) {
        if (restaurant.getOpeningTime() == null || restaurant.getClosingTime() == null) return true;
        try {
            java.time.LocalTime now = java.time.LocalTime.now();
            java.time.LocalTime opening = java.time.LocalTime.parse(restaurant.getOpeningTime());
            java.time.LocalTime closing = java.time.LocalTime.parse(restaurant.getClosingTime());

            if (closing.isBefore(opening)) {
                // Overnight restaurant (e.g., 22:00 – 02:00)
                return !now.isBefore(opening) || !now.isAfter(closing);
            }
            return !now.isBefore(opening) && !now.isAfter(closing);
        } catch (Exception e) {
            log.warn("Failed to parse opening hours for restaurant {}: {}", restaurant.getId(), e.getMessage());
            return true; // default to open on parse failure
        }
    }

    /**
     * Throws BadRequestException if the restaurant is currently closed.
     */
    public void checkRestaurantIsOpen(Restaurant restaurant) {
        if (!isOpen(restaurant)) {
            throw new BadRequestException(
                    "Restaurant '" + restaurant.getName() + "' is currently closed. " +
                    "Opening hours: " + restaurant.getOpeningTime() + " – " + restaurant.getClosingTime()
            );
        }
    }

    /**
     * Finds nearby restaurants within the specified radius (default: 5.0 km) of the user's coordinates,
     * calculates real-time distances & delivery estimates, scores them for recommendation,
     * and bundles top recommended dishes for customers to order directly.
     */
    @Transactional(readOnly = true)
    public NearbyRecommendationResponse getNearbyRestaurants(Double latitude, Double longitude, Double radiusKm, Integer limit) {
        if (latitude == null || longitude == null) {
            throw new BadRequestException("Latitude and longitude must be provided to find nearby restaurants");
        }
        if (latitude < -90.0 || latitude > 90.0 || longitude < -180.0 || longitude > 180.0) {
            throw new BadRequestException("Invalid coordinates: latitude must be between -90 and 90, longitude between -180 and 180");
        }

        final double effectiveRadius = (radiusKm != null && radiusKm > 0.0) ? Math.min(radiusKm, 50.0) : 5.0;
        final int effectiveLimit = (limit != null && limit > 0) ? Math.min(limit, 50) : 20;

        List<Restaurant> approvedRestaurants = restaurantRepository.findByStatus(RestaurantStatus.APPROVED);

        record Candidate(Restaurant restaurant, double distanceKm, int etaMinutes, boolean isOpen, double score) {}

        List<Candidate> candidates = new ArrayList<>();

        for (Restaurant r : approvedRestaurants) {
            if (r.getLatitude() == null || r.getLongitude() == null) continue;

            double distance = GeoUtils.calculateDistanceKm(latitude, longitude, r.getLatitude(), r.getLongitude());
            if (distance <= effectiveRadius) {
                double roundedDist = BigDecimal.valueOf(distance).setScale(2, RoundingMode.HALF_UP).doubleValue();
                int etaMinutes = Math.max(15, (int) Math.round(15 + distance * 3.5));
                boolean open = isOpen(r);

                // Recommendation scoring:
                // 1. Proximity: closer restaurants receive up to 35 points
                double proximityScore = Math.max(0.0, (1.0 - (distance / effectiveRadius))) * 35.0;
                // 2. Rating: 5-star ratings receive up to 35 points
                double ratingScore = ((r.getRating() != null ? r.getRating() : 0.0) / 5.0) * 35.0;
                // 3. Open status: currently open restaurants receive a 20 point bonus
                double openBonus = open ? 20.0 : 0.0;
                // 4. Review count credibility: up to 10 points
                double reviewBonus = Math.min(10.0, (r.getReviewCount() != null ? r.getReviewCount() : 0) * 0.2);

                double totalScore = BigDecimal.valueOf(proximityScore + ratingScore + openBonus + reviewBonus)
                        .setScale(1, RoundingMode.HALF_UP).doubleValue();

                candidates.add(new Candidate(r, roundedDist, etaMinutes, open, totalScore));
            }
        }

        // Sort candidates: Open first, then highest recommendation score, then closest distance
        candidates.sort(Comparator
                .comparing((Candidate c) -> c.isOpen ? 0 : 1)
                .thenComparing(Candidate::score, Comparator.reverseOrder())
                .thenComparing(Candidate::distanceKm));

        int totalFound = candidates.size();

        // Limit candidates for response
        List<Candidate> topCandidates = candidates.stream()
                .limit(effectiveLimit)
                .toList();

        List<Long> topRestaurantIds = topCandidates.stream()
                .map(c -> c.restaurant().getId())
                .toList();

        Map<Long, List<FoodItemResponse>> foodsByRestaurantId = Map.of();
        List<FoodItemResponse> overallTopDishes = new ArrayList<>();

        if (!topRestaurantIds.isEmpty()) {
            List<FoodItem> availableFoods = foodItemRepository
                    .findByRestaurantIdInAndAvailableTrueOrderByRatingDesc(topRestaurantIds);

            foodsByRestaurantId = availableFoods.stream()
                    .map(FoodItemResponse::from)
                    .collect(Collectors.groupingBy(FoodItemResponse::getRestaurantId));

            // Up to 8 top recommended dishes across all nearby restaurants (with high ratings)
            overallTopDishes = availableFoods.stream()
                    .map(FoodItemResponse::from)
                    .limit(8)
                    .toList();
        }

        List<NearbyRestaurantResponse> restaurantResponses = new ArrayList<>();
        for (Candidate c : topCandidates) {
            List<FoodItemResponse> allFoods = foodsByRestaurantId.getOrDefault(c.restaurant().getId(), List.of());
            // Select up to top 3 signature dishes per restaurant for quick-buy preview
            List<FoodItemResponse> top3Foods = allFoods.stream().limit(3).toList();

            restaurantResponses.add(NearbyRestaurantResponse.from(
                    c.restaurant(),
                    c.distanceKm(),
                    c.etaMinutes(),
                    c.isOpen(),
                    c.score(),
                    top3Foods
            ));
        }

        return NearbyRecommendationResponse.builder()
                .userLatitude(latitude)
                .userLongitude(longitude)
                .radiusKm(effectiveRadius)
                .totalFound(totalFound)
                .restaurants(restaurantResponses)
                .topRecommendedFoods(overallTopDishes)
                .build();
    }
}

