package com.example.fooddelivery.review;

import com.example.fooddelivery.common.exception.BadRequestException;
import com.example.fooddelivery.common.exception.ForbiddenException;
import com.example.fooddelivery.food.entity.FoodItem;
import com.example.fooddelivery.food.repository.FoodItemRepository;
import com.example.fooddelivery.food.service.FoodItemService;
import com.example.fooddelivery.order.entity.Order;
import com.example.fooddelivery.order.entity.OrderItem;
import com.example.fooddelivery.order.entity.OrderStatus;
import com.example.fooddelivery.order.service.OrderService;
import com.example.fooddelivery.restaurant.entity.Restaurant;
import com.example.fooddelivery.restaurant.repository.RestaurantRepository;
import com.example.fooddelivery.review.dto.ReviewRequest;
import com.example.fooddelivery.review.dto.ReviewResponse;
import com.example.fooddelivery.review.entity.Review;
import com.example.fooddelivery.review.repository.ReviewRepository;
import com.example.fooddelivery.review.service.ReviewService;
import com.example.fooddelivery.user.entity.User;
import com.example.fooddelivery.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock private ReviewRepository reviewRepository;
    @Mock private UserService userService;
    @Mock private OrderService orderService;
    @Mock private FoodItemService foodItemService;
    @Mock private RestaurantRepository restaurantRepository;
    @Mock private FoodItemRepository foodItemRepository;

    @InjectMocks
    private ReviewService reviewService;

    private User customer;
    private Restaurant restaurant;
    private Order deliveredOrder;

    @BeforeEach
    void setUp() {
        customer = User.builder().id(1L).name("Alice").email("alice@test.com").build();
        restaurant = Restaurant.builder().id(10L).name("Pizza Palace").rating(0.0).reviewCount(0).build();

        deliveredOrder = Order.builder()
                .id(100L)
                .customer(customer)
                .restaurant(restaurant)
                .status(OrderStatus.DELIVERED)
                .items(new ArrayList<>())
                .build();
    }

    @Test
    void createReview_RestaurantReview_Success() {
        ReviewRequest request = new ReviewRequest();
        request.setOrderId(100L);
        request.setRating(5);
        request.setComment("Great food!");

        when(userService.findUserById(1L)).thenReturn(customer);
        when(orderService.findOrderById(100L)).thenReturn(deliveredOrder);
        when(reviewRepository.existsByCustomerIdAndOrderIdAndFoodItemIdIsNull(1L, 100L)).thenReturn(false);
        when(reviewRepository.calculateAverageRatingForRestaurant(10L)).thenReturn(5.0);
        when(reviewRepository.countReviewsForRestaurant(10L)).thenReturn(1);

        Review saved = Review.builder()
                .id(1L)
                .customer(customer)
                .restaurant(restaurant)
                .order(deliveredOrder)
                .rating(5)
                .comment("Great food!")
                .build();
        when(reviewRepository.save(any(Review.class))).thenReturn(saved);
        when(restaurantRepository.save(any(Restaurant.class))).thenReturn(restaurant);

        ReviewResponse response = reviewService.createReview(1L, request);

        assertNotNull(response);
        assertEquals(5, response.getRating());
        verify(restaurantRepository).save(any(Restaurant.class));
    }

    @Test
    void createReview_OrderNotDelivered_ThrowsBadRequest() {
        deliveredOrder.setStatus(OrderStatus.PREPARING);

        ReviewRequest request = new ReviewRequest();
        request.setOrderId(100L);
        request.setRating(4);

        when(userService.findUserById(1L)).thenReturn(customer);
        when(orderService.findOrderById(100L)).thenReturn(deliveredOrder);

        assertThrows(BadRequestException.class, () -> reviewService.createReview(1L, request));
        verify(reviewRepository, never()).save(any());
    }

    @Test
    void createReview_DifferentCustomer_ThrowsForbidden() {
        User otherUser = User.builder().id(99L).name("Bob").build();

        ReviewRequest request = new ReviewRequest();
        request.setOrderId(100L);
        request.setRating(3);

        when(userService.findUserById(99L)).thenReturn(otherUser);
        when(orderService.findOrderById(100L)).thenReturn(deliveredOrder);

        assertThrows(ForbiddenException.class, () -> reviewService.createReview(99L, request));
    }

    @Test
    void createReview_DuplicateRestaurantReview_ThrowsBadRequest() {
        ReviewRequest request = new ReviewRequest();
        request.setOrderId(100L);
        request.setRating(4);

        when(userService.findUserById(1L)).thenReturn(customer);
        when(orderService.findOrderById(100L)).thenReturn(deliveredOrder);
        when(reviewRepository.existsByCustomerIdAndOrderIdAndFoodItemIdIsNull(1L, 100L)).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> reviewService.createReview(1L, request));
        assertTrue(ex.getMessage().contains("already reviewed"));
    }

    @Test
    void createReview_FoodItemNotInOrder_ThrowsBadRequest() {
        FoodItem foodItem = FoodItem.builder().id(50L).name("Burger").restaurant(restaurant).available(true).build();
        ReviewRequest request = new ReviewRequest();
        request.setOrderId(100L);
        request.setFoodItemId(50L);
        request.setRating(4);

        when(userService.findUserById(1L)).thenReturn(customer);
        when(orderService.findOrderById(100L)).thenReturn(deliveredOrder);
        when(foodItemService.findFoodItemById(50L)).thenReturn(foodItem);
        // order has no items, so foodItem is not in it

        assertThrows(BadRequestException.class, () -> reviewService.createReview(1L, request));
    }
}
