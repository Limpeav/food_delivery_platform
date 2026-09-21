package com.example.fooddelivery.food.service;

import com.example.fooddelivery.common.exception.ResourceNotFoundException;
import com.example.fooddelivery.common.response.PageResponse;
import com.example.fooddelivery.food.dto.FoodItemRequest;
import com.example.fooddelivery.food.dto.FoodItemResponse;
import com.example.fooddelivery.food.entity.FoodItem;
import com.example.fooddelivery.food.repository.FoodItemRepository;
import com.example.fooddelivery.menu.entity.MenuCategory;
import com.example.fooddelivery.menu.service.MenuCategoryService;
import com.example.fooddelivery.restaurant.entity.Restaurant;
import com.example.fooddelivery.restaurant.repository.RestaurantRepository;
import com.example.fooddelivery.restaurant.service.RestaurantService;
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
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FoodItemService {

    private final FoodItemRepository foodItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final RestaurantService restaurantService;
    private final MenuCategoryService menuCategoryService;

    @Transactional(readOnly = true)
    public PageResponse<FoodItemResponse> searchFoods(
            String search,
            Long restaurantId,
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Boolean availableOnly,
            Pageable pageable) {

        Specification<FoodItem> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (Boolean.TRUE.equals(availableOnly)) {
                predicates.add(cb.isTrue(root.get("available")));
            }

            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), searchPattern),
                        cb.like(cb.lower(root.get("description")), searchPattern)
                ));
            }

            if (restaurantId != null) {
                predicates.add(cb.equal(root.get("restaurant").get("id"), restaurantId));
            }

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("menuCategory").get("id"), categoryId));
            }

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<FoodItemResponse> page = foodItemRepository.findAll(spec, pageable)
                .map(FoodItemResponse::from);
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public FoodItemResponse getFoodItemById(Long id) {
        FoodItem item = findFoodItemById(id);
        return FoodItemResponse.from(item);
    }

    @Transactional(readOnly = true)
    public FoodItem findFoodItemById(Long id) {
        return foodItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FoodItem", "id", id));
    }

    @Cacheable(value = "popular_foods")
    @Transactional(readOnly = true)
    public List<FoodItemResponse> getPopularFoods() {
        log.info("Fetching popular food items from database");
        return foodItemRepository.findTop10ByAvailableTrueOrderByRatingDesc()
                .stream()
                .map(FoodItemResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FoodItemResponse> getFoodsByRestaurant(Long restaurantId) {
        return foodItemRepository.findByRestaurantIdAndAvailableTrue(restaurantId)
                .stream()
                .map(FoodItemResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<FoodItemResponse> getFoodsForOwner(Long ownerId, Pageable pageable) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("No restaurant found for current owner"));
        Page<FoodItemResponse> page = foodItemRepository.findByRestaurantId(restaurant.getId(), pageable)
                .map(FoodItemResponse::from);
        return PageResponse.from(page);
    }

    @CacheEvict(value = "popular_foods", allEntries = true)
    @Transactional
    public FoodItemResponse createFoodItem(Long ownerId, FoodItemRequest request) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("No restaurant found for current owner"));

        MenuCategory menuCategory = menuCategoryService.findMenuCategoryById(request.getMenuCategoryId());
        restaurantService.verifyOwnership(menuCategory.getRestaurant(), ownerId);

        FoodItem item = FoodItem.builder()
                .restaurant(restaurant)
                .menuCategory(menuCategory)
                .name(request.getName().trim())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .preparationTime(request.getPreparationTime() != null ? request.getPreparationTime() : 15)
                .available(request.getAvailable() != null ? request.getAvailable() : true)
                .build();

        FoodItem saved = foodItemRepository.save(item);
        log.info("Food item created with id: {} for restaurant: {}", saved.getId(), restaurant.getId());
        return FoodItemResponse.from(saved);
    }

    @CacheEvict(value = "popular_foods", allEntries = true)
    @Transactional
    public FoodItemResponse updateFoodItem(Long ownerId, Long foodId, FoodItemRequest request) {
        FoodItem item = findFoodItemById(foodId);
        restaurantService.verifyOwnership(item.getRestaurant(), ownerId);

        MenuCategory menuCategory = menuCategoryService.findMenuCategoryById(request.getMenuCategoryId());
        restaurantService.verifyOwnership(menuCategory.getRestaurant(), ownerId);

        item.setMenuCategory(menuCategory);
        item.setName(request.getName().trim());
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());
        item.setImageUrl(request.getImageUrl());
        if (request.getPreparationTime() != null) item.setPreparationTime(request.getPreparationTime());
        if (request.getAvailable() != null) item.setAvailable(request.getAvailable());

        FoodItem updated = foodItemRepository.save(item);
        log.info("Food item updated: {}", foodId);
        return FoodItemResponse.from(updated);
    }

    @CacheEvict(value = "popular_foods", allEntries = true)
    @Transactional
    public FoodItemResponse toggleAvailability(Long ownerId, Long foodId) {
        FoodItem item = findFoodItemById(foodId);
        restaurantService.verifyOwnership(item.getRestaurant(), ownerId);
        item.setAvailable(!Boolean.TRUE.equals(item.getAvailable()));
        FoodItem updated = foodItemRepository.save(item);
        log.info("Food item availability toggled: {} -> {}", foodId, updated.getAvailable());
        return FoodItemResponse.from(updated);
    }

    @CacheEvict(value = "popular_foods", allEntries = true)
    @Transactional
    public void deleteFoodItem(Long ownerId, Long foodId) {
        FoodItem item = findFoodItemById(foodId);
        restaurantService.verifyOwnership(item.getRestaurant(), ownerId);
        foodItemRepository.delete(item);
        log.info("Food item deleted: {}", foodId);
    }
}
