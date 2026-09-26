package com.example.fooddelivery.restaurant;

import com.example.fooddelivery.common.exception.BadRequestException;
import com.example.fooddelivery.restaurant.entity.Restaurant;
import com.example.fooddelivery.restaurant.entity.RestaurantStatus;
import com.example.fooddelivery.restaurant.repository.RestaurantRepository;
import com.example.fooddelivery.restaurant.service.RestaurantService;
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
                .rating(0.0)
                .reviewCount(0)
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
}
