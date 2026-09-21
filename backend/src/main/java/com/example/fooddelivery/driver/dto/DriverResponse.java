package com.example.fooddelivery.driver.dto;

import com.example.fooddelivery.driver.entity.Driver;
import com.example.fooddelivery.driver.entity.DriverLocation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverResponse {

    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String phoneNumber;
    private String vehicleType;
    private String vehicleNumber;
    private String licenseNumber;
    private Boolean online;
    private Boolean approved;
    private Double rating;
    private Double currentLatitude;
    private Double currentLongitude;

    public static DriverResponse from(Driver driver, DriverLocation location) {
        return DriverResponse.builder()
                .id(driver.getId())
                .userId(driver.getUser().getId())
                .name(driver.getUser().getName())
                .email(driver.getUser().getEmail())
                .phoneNumber(driver.getUser().getPhoneNumber())
                .vehicleType(driver.getVehicleType())
                .vehicleNumber(driver.getVehicleNumber())
                .licenseNumber(driver.getLicenseNumber())
                .online(driver.getOnline())
                .approved(driver.getApproved())
                .rating(driver.getRating())
                .currentLatitude(location != null ? location.getLatitude() : null)
                .currentLongitude(location != null ? location.getLongitude() : null)
                .build();
    }
}
