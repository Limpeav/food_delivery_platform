package com.example.fooddelivery.review.repository;

import com.example.fooddelivery.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId, Pageable pageable);

    Page<Review> findByFoodItemIdOrderByCreatedAtDesc(Long foodItemId, Pageable pageable);

    List<Review> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    boolean existsByCustomerIdAndOrderIdAndFoodItemId(Long customerId, Long orderId, Long foodItemId);

    boolean existsByCustomerIdAndOrderIdAndFoodItemIdIsNull(Long customerId, Long orderId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.restaurant.id = :restaurantId")
    Double calculateAverageRatingForRestaurant(@Param("restaurantId") Long restaurantId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.restaurant.id = :restaurantId")
    Integer countReviewsForRestaurant(@Param("restaurantId") Long restaurantId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.foodItem.id = :foodItemId")
    Double calculateAverageRatingForFoodItem(@Param("foodItemId") Long foodItemId);
}
