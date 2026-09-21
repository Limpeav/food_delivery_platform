package com.example.fooddelivery.user.service;

import com.example.fooddelivery.common.exception.BadRequestException;
import com.example.fooddelivery.common.exception.ResourceNotFoundException;
import com.example.fooddelivery.user.dto.ChangePasswordRequest;
import com.example.fooddelivery.user.dto.UpdateProfileRequest;
import com.example.fooddelivery.user.dto.UserResponse;
import com.example.fooddelivery.user.entity.User;
import com.example.fooddelivery.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = findUserById(id);
        return UserResponse.from(user);
    }

    @Transactional(readOnly = true)
    public User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = findUserById(userId);
        user.setName(request.getName().trim());
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber().trim());
        }
        User updated = userRepository.save(user);
        log.info("User profile updated for user id: {}", userId);
        return UserResponse.from(updated);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = findUserById(userId);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed successfully for user id: {}", userId);
    }

    @Transactional
    public UserResponse completePhoneNumber(Long userId, String rawPhone) {
        if (rawPhone == null || rawPhone.trim().isEmpty()) {
            throw new BadRequestException("Please enter your phone number.");
        }

        if (!com.example.fooddelivery.common.util.CambodiaPhoneValidator.isValid(rawPhone)) {
            throw new BadRequestException("Please enter a valid Cambodian mobile number.");
        }

        String normalizedPhone = com.example.fooddelivery.common.util.CambodiaPhoneValidator.normalize(rawPhone);

        // Enforce phone number uniqueness across accounts
        userRepository.findByPhoneNumber(normalizedPhone).ifPresent(existing -> {
            if (!existing.getId().equals(userId)) {
                throw new com.example.fooddelivery.common.exception.ConflictException(
                        "This phone number is already linked to another account."
                );
            }
        });

        User user = findUserById(userId);
        user.setPhoneNumber(normalizedPhone);
        user.setPhoneVerified(true);
        user.setPhoneVerifiedAt(java.time.LocalDateTime.now());
        User savedUser = userRepository.save(user);

        log.info("Completed Cambodian phone onboarding for user id: {}, phone: {}", userId, normalizedPhone);
        return UserResponse.from(savedUser);
    }
}
