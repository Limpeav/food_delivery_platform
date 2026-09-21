package com.example.fooddelivery.restaurantcategory.repository;

import com.example.fooddelivery.restaurantcategory.entity.RestaurantCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantCategoryRepository extends JpaRepository<RestaurantCategory, Long> {

    List<RestaurantCategory> findByActiveTrueOrderByNameAsc();

    boolean existsByNameIgnoreCase(String name);

    Optional<RestaurantCategory> findByNameIgnoreCase(String name);
}
