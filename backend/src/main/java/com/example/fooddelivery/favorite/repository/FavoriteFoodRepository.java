package com.example.fooddelivery.favorite.repository;

import com.example.fooddelivery.favorite.entity.FavoriteFood;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteFoodRepository extends JpaRepository<FavoriteFood, Long> {

    List<FavoriteFood> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    Optional<FavoriteFood> findByCustomerIdAndFoodItemId(Long customerId, Long foodItemId);

    boolean existsByCustomerIdAndFoodItemId(Long customerId, Long foodItemId);

    void deleteByCustomerIdAndFoodItemId(Long customerId, Long foodItemId);
}
