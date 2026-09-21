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

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final UserService userService;
    private final RestaurantCategoryService categoryService;
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
}
