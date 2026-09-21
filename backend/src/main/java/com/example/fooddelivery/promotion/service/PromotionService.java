package com.example.fooddelivery.promotion.service;

import com.example.fooddelivery.common.exception.BadRequestException;
import com.example.fooddelivery.common.exception.ResourceNotFoundException;
import com.example.fooddelivery.food.entity.FoodItem;
import com.example.fooddelivery.food.service.FoodItemService;
import com.example.fooddelivery.promotion.dto.PromotionRequest;
import com.example.fooddelivery.promotion.dto.PromotionResponse;
import com.example.fooddelivery.promotion.entity.Promotion;
import com.example.fooddelivery.promotion.repository.PromotionRepository;
import com.example.fooddelivery.restaurant.entity.Restaurant;
import com.example.fooddelivery.restaurant.repository.RestaurantRepository;
import com.example.fooddelivery.restaurant.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final RestaurantRepository restaurantRepository;
    private final RestaurantService restaurantService;
    private final FoodItemService foodItemService;

    @Transactional(readOnly = true)
    public List<PromotionResponse> getActivePromotions() {
        return promotionRepository.findByActiveTrueAndEndDateGreaterThanEqual(LocalDate.now())
                .stream()
                .map(PromotionResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PromotionResponse> getPromotionsByRestaurant(Long restaurantId) {
        return promotionRepository.findByRestaurantIdAndActiveTrue(restaurantId)
                .stream()
                .map(PromotionResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PromotionResponse> getOwnerPromotions(Long ownerId) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("No restaurant found for current owner"));
        return promotionRepository.findByRestaurantId(restaurant.getId())
                .stream()
                .map(PromotionResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public PromotionResponse createPromotion(Long ownerId, PromotionRequest request) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("No restaurant found for current owner"));

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date");
        }

        FoodItem foodItem = null;
        if (request.getFoodItemId() != null) {
            foodItem = foodItemService.findFoodItemById(request.getFoodItemId());
            restaurantService.verifyOwnership(foodItem.getRestaurant(), ownerId);
        }

        Promotion promotion = Promotion.builder()
                .restaurant(restaurant)
                .foodItem(foodItem)
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        Promotion saved = promotionRepository.save(promotion);
        log.info("Promotion created: {} for restaurant: {}", saved.getTitle(), restaurant.getId());
        return PromotionResponse.from(saved);
    }

    @Transactional
    public void deletePromotion(Long ownerId, Long promotionId) {
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion", "id", promotionId));
        restaurantService.verifyOwnership(promotion.getRestaurant(), ownerId);
        promotionRepository.delete(promotion);
        log.info("Promotion deleted: {}", promotionId);
    }
}
