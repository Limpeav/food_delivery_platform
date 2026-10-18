package com.example.fooddelivery.driver.repository;

import com.example.fooddelivery.driver.entity.Driver;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT d FROM Driver d WHERE " +
           "(:approved IS NULL OR d.approved = :approved) AND (" +
           ":search IS NULL OR :search = '' OR " +
           "LOWER(d.user.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(d.user.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(d.user.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(d.vehicleNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(d.vehicleType) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Driver> searchDriversAdmin(@Param("approved") Boolean approved, @Param("search") String search, Pageable pageable);
}

