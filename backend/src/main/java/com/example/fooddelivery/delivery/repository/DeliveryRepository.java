package com.example.fooddelivery.delivery.repository;

import com.example.fooddelivery.delivery.entity.Delivery;
import com.example.fooddelivery.delivery.entity.DeliveryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    @EntityGraph(attributePaths = {"order", "order.restaurant", "order.customer", "driver", "driver.user"})
    Optional<Delivery> findByOrderId(Long orderId);

    @EntityGraph(attributePaths = {"order", "order.restaurant", "order.customer", "driver", "driver.user"})
    List<Delivery> findByDriverIdAndStatusIn(Long driverId, List<DeliveryStatus> statuses);

    @EntityGraph(attributePaths = {"order", "order.restaurant", "order.customer", "driver", "driver.user"})
    Optional<Delivery> findFirstByDriverIdAndStatusIn(Long driverId, List<DeliveryStatus> statuses);

    @EntityGraph(attributePaths = {"order", "order.restaurant", "order.customer", "driver", "driver.user"})
    List<Delivery> findByStatus(DeliveryStatus status);

    @EntityGraph(attributePaths = {"order", "order.restaurant", "order.customer", "driver", "driver.user"})
    Page<Delivery> findByDriverId(Long driverId, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"order", "order.restaurant", "order.customer", "driver", "driver.user"})
    Optional<Delivery> findById(Long id);
}
