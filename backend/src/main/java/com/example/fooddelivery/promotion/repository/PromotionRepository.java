package com.example.fooddelivery.promotion.repository;

import com.example.fooddelivery.promotion.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    List<Promotion> findByActiveTrueAndEndDateGreaterThanEqual(LocalDate date);

    List<Promotion> findByRestaurantId(Long restaurantId);

    List<Promotion> findByRestaurantIdAndActiveTrue(Long restaurantId);
}
