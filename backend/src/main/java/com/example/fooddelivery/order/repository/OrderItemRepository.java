package com.example.fooddelivery.order.repository;

import com.example.fooddelivery.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    @Query("SELECT oi.foodName, SUM(oi.quantity), SUM(oi.subtotal) " +
           "FROM OrderItem oi " +
           "WHERE oi.order.restaurant.id = :restaurantId " +
           "GROUP BY oi.foodName " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopSellingFoodsByRestaurant(@Param("restaurantId") Long restaurantId);
}
