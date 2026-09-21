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
public class DriverOnboardingRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Password is required")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$",
            message = "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one number"
    )
    private String password;

    private String confirmPassword;

    @NotBlank(message = "Vehicle type is required (e.g. MOTORCYCLE, CAR, BICYCLE)")
    private String vehicleType;

    @NotBlank(message = "Vehicle plate number is required")
    private String vehicleNumber;

    @NotBlank(message = "Driver license number is required")
    private String licenseNumber;
}
