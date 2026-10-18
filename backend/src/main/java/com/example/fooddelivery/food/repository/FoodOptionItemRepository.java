package com.example.fooddelivery.food.repository;

import com.example.fooddelivery.food.entity.FoodOptionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodOptionItemRepository extends JpaRepository<FoodOptionItem, Long> {
    List<FoodOptionItem> findByOptionGroupIdOrderByIdAsc(Long optionGroupId);
}
