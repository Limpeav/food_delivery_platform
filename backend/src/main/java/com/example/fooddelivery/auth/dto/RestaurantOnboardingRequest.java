package com.example.fooddelivery.auth.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantOnboardingRequest {

    // Owner Information
    @NotBlank(message = "Owner name is required")
    @Size(min = 2, max = 50, message = "Owner name must be between 2 and 50 characters")
    private String name;

    @NotBlank(message = "Owner email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Owner phone is required")
    private String phone;

    @NotBlank(message = "Password is required")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$",
            message = "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one number"
    )
    private String password;

    private String confirmPassword;

    // Restaurant Information
    @NotBlank(message = "Restaurant name is required")
    @Size(min = 2, max = 100, message = "Restaurant name must be between 2 and 100 characters")
    private String restaurantName;

    private String description;

    private String restaurantPhone;

    @NotBlank(message = "Restaurant address is required")
    private String address;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    @NotBlank(message = "Opening time is required (e.g. 08:00)")
    private String openingTime;

    @NotBlank(message = "Closing time is required (e.g. 22:00)")
    private String closingTime;

    @NotNull(message = "Restaurant category ID is required")
    private Long categoryId;
}
