package com.example.fooddelivery.address.service;

import com.example.fooddelivery.address.dto.AddressRequest;
import com.example.fooddelivery.address.dto.AddressResponse;
import com.example.fooddelivery.address.entity.Address;
import com.example.fooddelivery.address.repository.AddressRepository;
import com.example.fooddelivery.common.exception.ForbiddenException;
import com.example.fooddelivery.common.exception.ResourceNotFoundException;
import com.example.fooddelivery.user.entity.User;
import com.example.fooddelivery.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<AddressResponse> getUserAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId)
                .stream()
                .map(AddressResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AddressResponse getAddressById(Long addressId, Long userId) {
        Address address = findAddressAndVerifyOwnership(addressId, userId);
        return AddressResponse.from(address);
    }

    @Transactional
    public AddressResponse createAddress(Long userId, AddressRequest request) {
        User user = userService.findUserById(userId);

        boolean isFirstAddress = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId).isEmpty();
        boolean makeDefault = Boolean.TRUE.equals(request.getIsDefault()) || isFirstAddress;

        if (makeDefault) {
            addressRepository.resetDefaultAddressForUser(userId);
        }

        Address address = Address.builder()
                .user(user)
                .label(request.getLabel().trim())
                .recipientName(request.getRecipientName().trim())
                .phoneNumber(request.getPhoneNumber().trim())
                .addressLine(request.getAddressLine().trim())
                .city(request.getCity().trim())
                .latitude(request.getLatitude() != null ? request.getLatitude() : 11.5564) // default Phnom Penh coords if not provided
                .longitude(request.getLongitude() != null ? request.getLongitude() : 104.9282)
                .isDefault(makeDefault)
                .build();

        Address saved = addressRepository.save(address);
        log.info("Address created with id: {} for user: {}", saved.getId(), userId);
        return AddressResponse.from(saved);
    }

    @Transactional
    public AddressResponse updateAddress(Long addressId, Long userId, AddressRequest request) {
        Address address = findAddressAndVerifyOwnership(addressId, userId);

        if (Boolean.TRUE.equals(request.getIsDefault()) && !Boolean.TRUE.equals(address.getIsDefault())) {
            addressRepository.resetDefaultAddressForUser(userId);
            address.setIsDefault(true);
        } else if (Boolean.FALSE.equals(request.getIsDefault()) && Boolean.TRUE.equals(address.getIsDefault())) {
            // Keep default if it's the only address
            long count = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId).size();
            if (count > 1) {
                address.setIsDefault(false);
            }
        }

        address.setLabel(request.getLabel().trim());
        address.setRecipientName(request.getRecipientName().trim());
        address.setPhoneNumber(request.getPhoneNumber().trim());
        address.setAddressLine(request.getAddressLine().trim());
        address.setCity(request.getCity().trim());
        if (request.getLatitude() != null) address.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) address.setLongitude(request.getLongitude());

        Address updated = addressRepository.save(address);
        log.info("Address updated: {} for user: {}", addressId, userId);
        return AddressResponse.from(updated);
    }

    @Transactional
    public void deleteAddress(Long addressId, Long userId) {
        Address address = findAddressAndVerifyOwnership(addressId, userId);
        addressRepository.delete(address);
        log.info("Address deleted: {} for user: {}", addressId, userId);
    }

    @Transactional
    public AddressResponse setDefaultAddress(Long addressId, Long userId) {
        Address address = findAddressAndVerifyOwnership(addressId, userId);
        addressRepository.resetDefaultAddressForUser(userId);
        address.setIsDefault(true);
        Address updated = addressRepository.save(address);
        return AddressResponse.from(updated);
    }

    public Address findAddressAndVerifyOwnership(Long addressId, Long userId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));
        if (!address.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to access or modify this address");
        }
        return address;
    }
}
