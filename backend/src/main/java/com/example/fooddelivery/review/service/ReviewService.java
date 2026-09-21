package com.example.fooddelivery.review.service;

import com.example.fooddelivery.common.exception.BadRequestException;
import com.example.fooddelivery.common.exception.ForbiddenException;
import com.example.fooddelivery.common.exception.ResourceNotFoundException;
import com.example.fooddelivery.common.response.PageResponse;
import com.example.fooddelivery.food.entity.FoodItem;
import com.example.fooddelivery.food.repository.FoodItemRepository;
import com.example.fooddelivery.food.service.FoodItemService;
import com.example.fooddelivery.order.entity.Order;
import com.example.fooddelivery.order.entity.OrderStatus;
import com.example.fooddelivery.order.service.OrderService;
import com.example.fooddelivery.restaurant.entity.Restaurant;
import com.example.fooddelivery.restaurant.repository.RestaurantRepository;
import com.example.fooddelivery.review.dto.ReviewRequest;
import com.example.fooddelivery.review.dto.ReviewResponse;
import com.example.fooddelivery.review.entity.Review;
import com.example.fooddelivery.review.repository.ReviewRepository;
import com.example.fooddelivery.user.entity.User;
import com.example.fooddelivery.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserService userService;
    private final OrderService orderService;
    private final FoodItemService foodItemService;
    private final RestaurantRepository restaurantRepository;
    private final FoodItemRepository foodItemRepository;

    @CacheEvict(value = {"restaurants", "popular_foods"}, allEntries = true)
    @Transactional
    public ReviewResponse createReview(Long customerId, ReviewRequest request) {
        User customer = userService.findUserById(customerId);
        Order order = orderService.findOrderById(request.getOrderId());

        if (!order.getCustomer().getId().equals(customerId)) {
            throw new ForbiddenException("You can only review orders that you placed");
        }

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new BadRequestException("Only delivered orders can be reviewed");
        }

        FoodItem foodItem = null;
        if (request.getFoodItemId() != null) {
            foodItem = foodItemService.findFoodItemById(request.getFoodItemId());
            boolean itemInOrder = order.getItems().stream()
                    .anyMatch(oi -> oi.getFoodItem() != null && oi.getFoodItem().getId().equals(request.getFoodItemId()));
            if (!itemInOrder) {
                throw new BadRequestException("This food item was not part of your order");
            }

            if (reviewRepository.existsByCustomerIdAndOrderIdAndFoodItemId(customerId, order.getId(), foodItem.getId())) {
                throw new BadRequestException("You have already reviewed this food item for this order");
            }
        } else {
            if (reviewRepository.existsByCustomerIdAndOrderIdAndFoodItemIdIsNull(customerId, order.getId())) {
                throw new BadRequestException("You have already reviewed this restaurant for this order");
            }
        }

        Restaurant restaurant = order.getRestaurant();

        Review review = Review.builder()
                .customer(customer)
                .restaurant(restaurant)
                .foodItem(foodItem)
                .order(order)
                .rating(request.getRating())
                .comment(request.getComment() != null ? request.getComment().trim() : null)
                .build();

        Review saved = reviewRepository.save(review);
        log.info("Review created for order: {} by customer: {}", order.getId(), customerId);

        // Recalculate restaurant rating
        Double avgRating = reviewRepository.calculateAverageRatingForRestaurant(restaurant.getId());
        Integer count = reviewRepository.countReviewsForRestaurant(restaurant.getId());
        restaurant.setRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        restaurant.setReviewCount(count != null ? count : 0);
        restaurantRepository.save(restaurant);

        // Recalculate food item rating if applicable
        if (foodItem != null) {
            Double foodAvg = reviewRepository.calculateAverageRatingForFoodItem(foodItem.getId());
            foodItem.setRating(foodAvg != null ? Math.round(foodAvg * 10.0) / 10.0 : 0.0);
            foodItemRepository.save(foodItem);
        }

        return ReviewResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getRestaurantReviews(Long restaurantId, Pageable pageable) {
        Page<ReviewResponse> page = reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId, pageable)
                .map(ReviewResponse::from);
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getFoodReviews(Long foodItemId, Pageable pageable) {
        Page<ReviewResponse> page = reviewRepository.findByFoodItemIdOrderByCreatedAtDesc(foodItemId, pageable)
                .map(ReviewResponse::from);
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getAllReviews(Pageable pageable) {
        Page<ReviewResponse> page = reviewRepository.findAll(pageable)
                .map(ReviewResponse::from);
        return PageResponse.from(page);
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));
        Restaurant restaurant = review.getRestaurant();
        FoodItem foodItem = review.getFoodItem();

        reviewRepository.delete(review);
        log.info("Admin deleted review: {}", reviewId);

        if (restaurant != null) {
            Double avgRating = reviewRepository.calculateAverageRatingForRestaurant(restaurant.getId());
            Integer count = reviewRepository.countReviewsForRestaurant(restaurant.getId());
            restaurant.setRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
            restaurant.setReviewCount(count != null ? count : 0);
            restaurantRepository.save(restaurant);
        }

        if (foodItem != null) {
            Double foodAvg = reviewRepository.calculateAverageRatingForFoodItem(foodItem.getId());
            foodItem.setRating(foodAvg != null ? Math.round(foodAvg * 10.0) / 10.0 : 0.0);
            foodItemRepository.save(foodItem);
        }
    }
}
