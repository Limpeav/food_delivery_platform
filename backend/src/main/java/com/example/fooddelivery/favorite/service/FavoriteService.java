package com.example.fooddelivery.favorite.service;

import com.example.fooddelivery.favorite.entity.FavoriteFood;
import com.example.fooddelivery.favorite.entity.FavoriteRestaurant;
import com.example.fooddelivery.favorite.repository.FavoriteFoodRepository;
import com.example.fooddelivery.favorite.repository.FavoriteRestaurantRepository;
import com.example.fooddelivery.food.dto.FoodItemResponse;
import com.example.fooddelivery.food.entity.FoodItem;
import com.example.fooddelivery.food.service.FoodItemService;
import com.example.fooddelivery.restaurant.dto.RestaurantResponse;
import com.example.fooddelivery.restaurant.entity.Restaurant;
import com.example.fooddelivery.restaurant.service.RestaurantService;
import com.example.fooddelivery.user.entity.User;
import com.example.fooddelivery.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRestaurantRepository favoriteRestaurantRepository;
    private final FavoriteFoodRepository favoriteFoodRepository;
    private final UserService userService;
    private final RestaurantService restaurantService;
    private final FoodItemService foodItemService;

    @Transactional
    public void addFavoriteRestaurant(Long customerId, Long restaurantId) {
        if (!favoriteRestaurantRepository.existsByCustomerIdAndRestaurantId(customerId, restaurantId)) {
            User customer = userService.findUserById(customerId);
            Restaurant restaurant = restaurantService.findRestaurantById(restaurantId);
            FavoriteRestaurant favorite = FavoriteRestaurant.builder()
                    .customer(customer)
                    .restaurant(restaurant)
                    .build();
            favoriteRestaurantRepository.save(favorite);
            log.info("Restaurant {} added to favorites for user {}", restaurantId, customerId);
        }
    }

    @Transactional
    public void removeFavoriteRestaurant(Long customerId, Long restaurantId) {
        favoriteRestaurantRepository.deleteByCustomerIdAndRestaurantId(customerId, restaurantId);
        log.info("Restaurant {} removed from favorites for user {}", restaurantId, customerId);
    }

    @Transactional(readOnly = true)
    public boolean isRestaurantFavorite(Long customerId, Long restaurantId) {
        return favoriteRestaurantRepository.existsByCustomerIdAndRestaurantId(customerId, restaurantId);
    }

    @Transactional(readOnly = true)
    public List<RestaurantResponse> getFavoriteRestaurants(Long customerId) {
        return favoriteRestaurantRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(f -> RestaurantResponse.from(f.getRestaurant()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void addFavoriteFood(Long customerId, Long foodItemId) {
        if (!favoriteFoodRepository.existsByCustomerIdAndFoodItemId(customerId, foodItemId)) {
            User customer = userService.findUserById(customerId);
            FoodItem foodItem = foodItemService.findFoodItemById(foodItemId);
            FavoriteFood favorite = FavoriteFood.builder()
                    .customer(customer)
                    .foodItem(foodItem)
                    .build();
            favoriteFoodRepository.save(favorite);
            log.info("Food {} added to favorites for user {}", foodItemId, customerId);
        }
    }

    @Transactional
    public void removeFavoriteFood(Long customerId, Long foodItemId) {
        favoriteFoodRepository.deleteByCustomerIdAndFoodItemId(customerId, foodItemId);
        log.info("Food {} removed from favorites for user {}", foodItemId, customerId);
    }

    @Transactional(readOnly = true)
    public boolean isFoodFavorite(Long customerId, Long foodItemId) {
        return favoriteFoodRepository.existsByCustomerIdAndFoodItemId(customerId, foodItemId);
    }

    @Transactional(readOnly = true)
    public List<FoodItemResponse> getFavoriteFoods(Long customerId) {
        return favoriteFoodRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(f -> FoodItemResponse.from(f.getFoodItem()))
                .collect(Collectors.toList());
    }
}
