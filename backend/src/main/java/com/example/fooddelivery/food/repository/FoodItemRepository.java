package com.example.fooddelivery.food.repository;

import com.example.fooddelivery.food.entity.FoodItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long>, JpaSpecificationExecutor<FoodItem> {

    List<FoodItem> findByRestaurantIdAndAvailableTrue(Long restaurantId);

    List<FoodItem> findByRestaurantId(Long restaurantId);

    Page<FoodItem> findByRestaurantId(Long restaurantId, Pageable pageable);

    List<FoodItem> findByMenuCategoryIdAndAvailableTrue(Long menuCategoryId);

    List<FoodItem> findTop10ByAvailableTrueOrderByRatingDesc();
}
