package com.example.fooddelivery.driver;

import com.example.fooddelivery.common.exception.BadRequestException;
import com.example.fooddelivery.delivery.repository.DeliveryRepository;
import com.example.fooddelivery.driver.dto.DriverResponse;
import com.example.fooddelivery.driver.entity.Driver;
import com.example.fooddelivery.driver.repository.DriverLocationRepository;
import com.example.fooddelivery.driver.repository.DriverRepository;
import com.example.fooddelivery.driver.service.DriverService;
import com.example.fooddelivery.user.entity.User;
import com.example.fooddelivery.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DriverServiceTest {

    @Mock private DriverRepository driverRepository;
    @Mock private DriverLocationRepository locationRepository;
    @Mock private UserService userService;
    @Mock private SimpMessagingTemplate messagingTemplate;
    @Mock private DeliveryRepository deliveryRepository;

    @InjectMocks private DriverService driverService;

    private User user;
    private Driver driver;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).name("John Driver").build();
        driver = Driver.builder()
                .id(10L)
                .user(user)
                .vehicleType("Motorcycle")
                .vehicleNumber("ABC-123")
                .licenseNumber("LIC-456")
                .approved(true)
                .online(false)
                .rating(4.0)
                .build();
    }

    @Test
    void toggleOnline_ApprovedDriver_TogglesStatus() {
        when(driverRepository.findByUserId(1L)).thenReturn(Optional.of(driver));
        when(driverRepository.save(any(Driver.class))).thenReturn(driver);
        when(locationRepository.findByDriverId(10L)).thenReturn(Optional.empty());

        DriverResponse response = driverService.toggleOnline(1L);

        assertNotNull(response);
        assertTrue(driver.getOnline()); // was false, now true
        verify(driverRepository).save(driver);
    }

    @Test
    void toggleOnline_NotApprovedDriver_ThrowsBadRequest() {
        driver.setApproved(false);
        when(driverRepository.findByUserId(1L)).thenReturn(Optional.of(driver));

        assertThrows(BadRequestException.class, () -> driverService.toggleOnline(1L));
        verify(driverRepository, never()).save(any());
    }

    @Test
    void approveDriver_SetsApprovedTrue() {
        when(driverRepository.findById(10L)).thenReturn(Optional.of(driver));
        when(driverRepository.save(any(Driver.class))).thenReturn(driver);
        when(locationRepository.findByDriverId(10L)).thenReturn(Optional.empty());

        driverService.approveDriver(10L, true);

        assertTrue(driver.getApproved());
    }

    @Test
    void approveDriver_Rejected_SetsOffline() {
        driver.setOnline(true);
        when(driverRepository.findById(10L)).thenReturn(Optional.of(driver));
        when(driverRepository.save(any(Driver.class))).thenReturn(driver);
        when(locationRepository.findByDriverId(10L)).thenReturn(Optional.empty());

        driverService.approveDriver(10L, false);

        assertFalse(driver.getApproved());
        assertFalse(driver.getOnline()); // forced offline when rejected
    }

    @Test
    void registerDriver_DuplicateProfile_ThrowsBadRequest() {
        when(driverRepository.existsByUserId(1L)).thenReturn(true);

        com.example.fooddelivery.driver.dto.DriverRegisterRequest req =
                new com.example.fooddelivery.driver.dto.DriverRegisterRequest();
        req.setVehicleType("Motorcycle");
        req.setVehicleNumber("XYZ-789");
        req.setLicenseNumber("LIC-999");

        assertThrows(BadRequestException.class, () -> driverService.registerDriver(1L, req));
    }
}
