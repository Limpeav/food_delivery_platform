package com.example.fooddelivery.restaurant.repository;

import com.example.fooddelivery.restaurant.entity.Restaurant;
import com.example.fooddelivery.restaurant.entity.RestaurantStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long>, JpaSpecificationExecutor<Restaurant> {

    Optional<Restaurant> findByOwnerId(Long ownerId);

    List<Restaurant> findAllByOwnerId(Long ownerId);

    Optional<Restaurant> findByIdAndOwnerId(Long id, Long ownerId);

    Optional<Restaurant> findFirstByOwnerIdOrderByIdAsc(Long ownerId);

    boolean existsByOwnerId(Long ownerId);

    Page<Restaurant> findByStatus(RestaurantStatus status, Pageable pageable);

    List<Restaurant> findByStatus(RestaurantStatus status);

    Page<Restaurant> findByCategoryIdAndStatus(Long categoryId, RestaurantStatus status, Pageable pageable);

    long countByStatus(RestaurantStatus status);
}
