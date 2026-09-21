package com.example.fooddelivery.driver.repository;

import com.example.fooddelivery.driver.entity.Driver;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {

    Optional<Driver> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    List<Driver> findByApprovedTrueAndOnlineTrue();

    Page<Driver> findByApproved(Boolean approved, Pageable pageable);

    long countByApproved(Boolean approved);
}
