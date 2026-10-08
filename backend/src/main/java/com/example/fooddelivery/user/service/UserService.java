package com.example.fooddelivery.user.service;

import com.example.fooddelivery.common.exception.BadRequestException;
import com.example.fooddelivery.common.exception.ConflictException;
import com.example.fooddelivery.common.exception.ResourceNotFoundException;
import com.example.fooddelivery.common.util.CambodiaPhoneValidator;
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

import java.util.Optional;

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
            String rawPhone = request.getPhoneNumber().trim();
            if (rawPhone.isEmpty()) {
                user.setPhoneNumber(null);
            } else {
                String normalizedPhone = CambodiaPhoneValidator.normalizeOrTrim(rawPhone);
                Optional<User> existing = userRepository.findByPhoneNumber(normalizedPhone);
                if (existing.isEmpty()) {
                    existing = userRepository.findByPhoneLookup(normalizedPhone);
                }
                existing.ifPresent(other -> {
                    if (!other.getId().equals(userId)) {
                        throw new BadRequestException("This phone number is already registered to another account.");
                    }
                });
                user.setPhoneNumber(normalizedPhone);
            }
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
        Optional<User> existingUser = userRepository.findByPhoneNumber(normalizedPhone);
        if (existingUser.isEmpty()) {
            existingUser = userRepository.findByPhoneLookup(normalizedPhone);
        }
        existingUser.ifPresent(existing -> {
            if (!existing.getId().equals(userId)) {
                throw new ConflictException(
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
