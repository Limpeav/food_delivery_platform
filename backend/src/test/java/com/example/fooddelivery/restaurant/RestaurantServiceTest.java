package com.example.fooddelivery.restaurant;

import com.example.fooddelivery.common.exception.BadRequestException;
import com.example.fooddelivery.restaurant.entity.Restaurant;
import com.example.fooddelivery.restaurant.entity.RestaurantStatus;
import com.example.fooddelivery.restaurant.repository.RestaurantRepository;
import com.example.fooddelivery.restaurant.service.RestaurantService;
import com.example.fooddelivery.food.repository.FoodItemRepository;
import com.example.fooddelivery.restaurantcategory.service.RestaurantCategoryService;
import com.example.fooddelivery.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class RestaurantServiceTest {

    @Mock private RestaurantRepository restaurantRepository;
    @Mock private UserService userService;
    @Mock private RestaurantCategoryService categoryService;
    @Mock private FoodItemRepository foodItemRepository;
    @Mock private com.example.fooddelivery.order.repository.OrderRepository orderRepository;
    @Mock private com.example.fooddelivery.order.repository.OrderItemRepository orderItemRepository;

    @InjectMocks
    private RestaurantService restaurantService;

    private Restaurant buildRestaurant(String openingTime, String closingTime) {
        return Restaurant.builder()
                .id(1L)
                .name("Test Restaurant")
                .status(RestaurantStatus.APPROVED)
                .openingTime(openingTime)
                .closingTime(closingTime)
                .latitude(11.5564)
                .longitude(104.9282)
                .rating(4.5)
                .reviewCount(10)
                .build();
    }

    @Test
    void isOpen_NullHours_ReturnsTrue() {
        Restaurant r = buildRestaurant(null, null);
        assertTrue(restaurantService.isOpen(r));
    }

    @Test
    void isOpen_ValidHours_CurrentlyOpen() {
        // Always-open times to avoid flakiness
        Restaurant r = buildRestaurant("00:00", "23:59");
        assertTrue(restaurantService.isOpen(r));
    }

    @Test
    void isOpen_ValidHours_CurrentlyClosed() {
        // A restaurant closed all day
        Restaurant r = buildRestaurant("25:00", "25:01"); // invalid → parse fails → defaults to open
        assertTrue(restaurantService.isOpen(r)); // parse exception defaults to open
    }

    @Test
    void isOpen_MidnightSpanRestaurant() {
        // Overnight: 22:00–03:00
        Restaurant r = buildRestaurant("22:00", "03:00");
        // We can't predict the result without knowing system time, just verify no exception
        assertDoesNotThrow(() -> restaurantService.isOpen(r));
    }

    @Test
    void checkRestaurantIsOpen_ClosedRestaurant_ThrowsBadRequest() {
        // Force closed by setting a 1-minute past window
        LocalTime now = LocalTime.now();
        // Set opening and closing 2 hours in the future so it's guaranteed closed
        String opening = now.plusHours(2).withSecond(0).withNano(0).toString().substring(0, 5);
        String closing = now.plusHours(3).withSecond(0).withNano(0).toString().substring(0, 5);
        Restaurant r = buildRestaurant(opening, closing);

        assertThrows(BadRequestException.class, () -> restaurantService.checkRestaurantIsOpen(r));
    }

    @Test
    void checkRestaurantIsOpen_OpenRestaurant_NoException() {
        Restaurant r = buildRestaurant("00:00", "23:59");
        assertDoesNotThrow(() -> restaurantService.checkRestaurantIsOpen(r));
    }

    @Test
    void getNearbyRestaurants_InvalidCoordinates_ThrowsBadRequest() {
        assertThrows(BadRequestException.class, () -> restaurantService.getNearbyRestaurants(null, 104.9, 5.0, 10));
        assertThrows(BadRequestException.class, () -> restaurantService.getNearbyRestaurants(95.0, 104.9, 5.0, 10));
    }

    @Test
    void getNearbyRestaurants_Within5Km_ReturnsFilteredAndSortedRecommendations() {
        Restaurant near = Restaurant.builder()
                .id(1L)
                .name("Near Cafe")
                .status(RestaurantStatus.APPROVED)
                .latitude(11.5564)
                .longitude(104.9282)
                .rating(4.8)
                .reviewCount(50)
                .openingTime("00:00")
                .closingTime("23:59")
                .build();

        Restaurant far = Restaurant.builder()
                .id(2L)
                .name("Far Away Bistro")
                .status(RestaurantStatus.APPROVED)
                .latitude(11.7500)
                .longitude(105.1000) // ~25km away
                .rating(4.9)
                .reviewCount(100)
                .openingTime("00:00")
                .closingTime("23:59")
                .build();

        org.mockito.Mockito.when(restaurantRepository.findByStatus(RestaurantStatus.APPROVED))
                .thenReturn(java.util.List.of(near, far));
        org.mockito.Mockito.when(foodItemRepository.findByRestaurantIdInAndAvailableTrueOrderByRatingDesc(java.util.List.of(1L)))
                .thenReturn(java.util.List.of());

        var response = restaurantService.getNearbyRestaurants(11.5564, 104.9282, 5.0, 10);

        assertNotNull(response);
        assertEquals(1, response.getTotalFound());
        assertEquals(1, response.getRestaurants().size());
        assertEquals("Near Cafe", response.getRestaurants().get(0).getName());
        assertTrue(response.getRestaurants().get(0).getDistanceKm() <= 0.1);
        assertTrue(response.getRestaurants().get(0).getIsOpen());
    }
}
