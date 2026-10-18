package com.example.fooddelivery.food.repository;

import com.example.fooddelivery.food.entity.FoodOptionGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodOptionGroupRepository extends JpaRepository<FoodOptionGroup, Long> {
    List<FoodOptionGroup> findByFoodItemIdOrderByIdAsc(Long foodItemId);
}
